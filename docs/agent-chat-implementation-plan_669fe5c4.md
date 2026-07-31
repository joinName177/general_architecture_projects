# Agent 输入框问答 - 实施计划

## 概述

在 `dify-agent-api`（Go 后端）新增 Agent Chat 模块，在 `general_architecture_projects`（React 前端）新增 Chat UI，实现基于 DeepSeek 的流式问答。API 契约从 Day 1 就原生支持 Tool Calling，为后期 CLI/API/Tools 集成留好扩展点。

---

## 1. 安全前置（必须第一步）

### 1.1 API Key 轮换

- [ ] 去 DeepSeek 后台重置刚才暴露的 Key（⚠ 需人工在 DeepSeek 后台操作）
- [x] 新 Key 通过环境变量注入，**绝不写入任何文件**（`.env.local` 已 gitignore，`DIFY_AGENT_DEEPSEEK_*` 环境变量）

### 1.2 dify-agent-api 配置

在 `dify-agent-api/.env.local`（已在 `.gitignore`）添加：

```bash
DEEPSEEK_API_KEY=sk-xxxxxxxx
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
```

在 Go Config 结构中新增对应字段（`internal/platform/config/config.go`）。

---

## 2. 后端：dify-agent-api（Go）

### 2.1 OpenAPI 契约

**文件**: `api/openapi/v1/openapi.yaml`

新增端点 `POST /agent/chat`，核心请求/响应设计：

```yaml
/agent/chat:
  post:
    operationId: chatWithAgent
    summary: Send a message to the agent and receive a streaming response
    tags: [Agent]
    security:
      - bearerAuth: []
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [messages]
            properties:
              messages:
                type: array
                items:
                  type: object
                  required: [role, content]
                  properties:
                    role: { type: string, enum: [user, assistant, system] }
                    content: { type: string }
              tools: # ← Phase 2 扩展点，当前允许空数组
                type: array
                items:
                  $ref: "#/components/schemas/ToolDefinition"
    responses:
      "200":
        description: SSE stream of chat events
        content:
          text/event-stream:
            schema:
              type: string
```

SSE 事件格式（流式增量）：

```
data: {"type":"text_delta","content":"你好"}
data: {"type":"text_delta","content":"，我"}
data: {"type":"tool_call","name":"shell_run","args":{"script":"ls"}}  ← Phase 2
data: {"type":"done","usage":{"prompt_tokens":10,"completion_tokens":5}}
data: {"type":"error","message":"LLM 调用失败"}
```

### 2.2 新增 Agent 模块

按架构规范，创建完整 vertical slice：

```
internal/modules/agent/
├── application/
│   ├── ports/
│   │   └── llm-gateway.go          # LLMGateway 接口
│   └── usecases/
│       ├── chat-usecase.go         # ChatUseCase（编排）
│       └── chat-usecase_test.go
├── infrastructure/
│   └── openai/
│       ├── llm-gateway.go          # OpenAI-compatible HTTP 调用实现
│       └── llm-gateway_test.go
├── transport/
│   └── http/
│       ├── handler.go              # SSE handler
│       └── handler_test.go
└── public.go                       # 模块公开契约
```

**LLMGateway 接口定义** (`application/ports/llm-gateway.go`):

```go
type ChatMessage struct {
    Role    string `json:"role"`    // user, assistant, system
    Content string `json:"content"`
}

type ToolDefinition struct {
    Name        string          `json:"name"`
    Description string          `json:"description"`
    Parameters  json.RawMessage `json:"parameters"` // JSON Schema
}

type ChatRequest struct {
    Messages []ChatMessage    `json:"messages"`
    Tools    []ToolDefinition `json:"tools,omitempty"`
}

// StreamEvent 表示 SSE 流中的一个事件
type StreamEvent struct {
    Type    string `json:"type"`    // text_delta, tool_call, done, error
    Content string `json:"content,omitempty"`
    // Phase 2 扩展字段
    ToolName string          `json:"tool_name,omitempty"`
    ToolArgs json.RawMessage `json:"tool_args,omitempty"`
    Usage    *UsageInfo      `json:"usage,omitempty"`
}

type LLMGateway interface {
    ChatStream(ctx context.Context, req ChatRequest) (<-chan StreamEvent, <-chan error)
}
```

**ChatUseCase** (`application/usecases/chat-usecase.go`):

职责：

1. 校验输入（messages 非空、role 合法）
2. 调用 `LLMGateway.ChatStream()`
3. 转发 SSE 事件（当前 Phase 1 仅转发 `text_delta` + `done`/`error`）
4. 预留 Phase 2 的 tool-call 循环框架（空循环体）

**OpenAI Gateway 实现** (`infrastructure/openai/llm-gateway.go`):

- 使用 `net/http` 调用 DeepSeek `/v1/chat/completions`（OpenAI 兼容协议）
- 设置 `stream: true` 启用流式响应
- 解析 SSE 流：`data: {"choices":[{"delta":{"content":"..."}}]}`
- 转换为内部 `StreamEvent` 类型
- 超时、取消、错误处理

**HTTP Handler** (`transport/http/handler.go`):

- 解析 bearer token → 验证身份
- 解析请求体 → 构造 `ChatRequest`
- 设置 SSE headers：`Content-Type: text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`
- 调用 `ChatUseCase` → 逐事件 `fmt.Fprintf(w, "data: %s\n\n", jsonEvent)`
- `http.Flusher` 逐帧刷新

### 2.3 依赖注入（cmd/api/main.go）

在 `main.go` 中组装新模块：

```go
llmGateway := openai.NewLLMGateway(cfg.DeepSeekAPIKey, cfg.DeepSeekBaseURL, cfg.DeepSeekModel)
chatUseCase := usecases.NewChatUseCase(llmGateway)
chatHandler := agenthttp.NewHandler(chatUseCase, logger)
// 在 httpserver.New() 中注册路由
```

### 2.4 生成代码

```bash
cd dify-agent-api
make generate          # 重新生成 OpenAPI transport 代码
```

---

## 3. 前端：general_architecture_projects

### 3.1 更新 API 生成物

```bash
cd general_architecture_projects
pnpm generate:api      # 从 dify-agent-api OpenAPI 重新生成 TypeScript 类型
```

### 3.2 新增 Chat 模块

按现有模块模式（参照 `modules/auth/`）：

```
src/modules/chat/
├── application/
│   └── chat-gateway.ts             # ChatGateway 接口 + SSE 消费
├── infrastructure/
│   └── http-chat-gateway.ts        # fetch + ReadableStream 实现
├── presentation/
│   ├── chat-route.tsx              # 路由页面
│   ├── chat-route.test.tsx
│   ├── chat-route.module.css
│   ├── chat-route.module.css.d.ts
│   ├── chat-input.tsx              # 输入框组件
│   ├── chat-messages.tsx           # 消息列表组件
│   └── chat-messages.ts            # i18n 消息
└── public.ts                       # 模块公开 API（组件懒加载导出）
```

**ChatGateway 接口** (`application/chat-gateway.ts`):

```typescript
interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}
interface StreamEvent {
  type: "text_delta" | "done" | "error";
  content?: string;
}

interface ChatGateway {
  chatStream(
    messages: ChatMessage[],
    signal: AbortSignal,
  ): AsyncIterable<StreamEvent>;
}
```

**HttpChatGateway** (`infrastructure/http-chat-gateway.ts`):

- 使用 `fetch()` + `ReadableStream` 消费 SSE
- 复用现有 `shared/http/http-client.ts` 的认证 token 注入
- 逐行解析 `data: {...}\n\n`
- 通过 `AsyncGenerator` 暴露事件流

### 3.3 UI 组件

**ChatRoute** (`presentation/chat-route.tsx`):

- 使用 HeroUI `Card`, `ScrollShadow` 布局
- 组合 `ChatMessages` + `ChatInput`
- 管理消息列表状态 `useState<{role, content}[]>`
- 管理流式状态：`idle | streaming | error`

**ChatInput** (`presentation/chat-input.tsx`):

- HeroUI `Textarea` + `Button` (Send 图标)
- Enter 发送，Shift+Enter 换行
- 发送中禁用输入 + 显示停止按钮
- 使用 `AbortController` 取消请求

**ChatMessages** (`presentation/chat-messages.tsx`):

- 消息气泡：用户右对齐（蓝色），AI 左对齐（灰色）
- 流式消息实时追加（打字效果）
- 自动滚动到底部
- 使用 HeroUI `Avatar` 区分用户/AI

### 3.4 路由注册

在 `src/app/module-catalog.ts` 新增：

```typescript
{
  id: "chat",
  routeId: "chat",
  path: "/chat",
  lazy: async () => {
    const { ChatRoute } = await import("~/modules/chat/presentation/chat-route");
    return { Component: ChatRoute };
  },
}
```

在 `src/app/router/app-router.tsx` 的路由树中添加 `/chat` 路由（需认证）。

### 3.5 导航入口

在 `modules/auth/presentation/authenticated-home.tsx` 添加"开始对话"按钮或导航到 `/chat`。

---

## 4. 测试策略

### 4.1 后端测试

| 层级             | 测试内容                                | 工具                 |
| ---------------- | --------------------------------------- | -------------------- |
| LLM Gateway 单元 | Mock HTTP server 模拟 DeepSeek SSE 响应 | `net/http/httptest`  |
| ChatUseCase 单元 | 用 fake LLMGateway 验证编排逻辑         | Go test              |
| Handler 契约     | 认证失败、非法输入、SSE header 正确性   | Go test + `httptest` |

### 4.2 前端测试

| 层级             | 测试内容                               | 工具                     |
| ---------------- | -------------------------------------- | ------------------------ |
| ChatGateway 单元 | Mock fetch 验证 SSE 解析               | Vitest + MSW             |
| ChatRoute 组件   | 发送消息 → 显示回复 → 流式更新         | Vitest + Testing Library |
| E2E              | 登录 → 进入 Chat → 发送消息 → 看到回复 | Playwright               |

---

## 5. 验证门禁

### 后端

```bash
cd dify-agent-api
make verify    # 聚合：go vet + staticcheck + test + race + contract + migration
```

### 前端

```bash
cd general_architecture_projects
pnpm verify    # 聚合：typecheck + lint + format + test + build
```

---

## 6. 执行顺序（严格按此）

| 步骤 | 状态       | 文件/操作                              | 验证方式                                                                      |
| ---- | ---------- | -------------------------------------- | ----------------------------------------------------------------------------- |
| 1    | ⚠️ 待人工  | 轮换 DeepSeek API Key                  | 确认旧 Key 失效                                                               |
| 2    | ✅         | 后端 Config 新增 DeepSeek 字段         | `go test ./internal/platform/config/`                                         |
| 3    | ✅         | OpenAPI 新增 `/agent/chat` 端点        | OpenAPI 校验通过                                                              |
| 4    | ✅         | 重新生成 Go transport 代码             | `make generate` + zero-drift check                                            |
| 5    | ✅         | 实现 `LLMGateway` 接口 + OpenAI 适配器 | `go test ./internal/modules/agent/...`                                        |
| 6    | ✅         | 实现 `ChatUseCase`                     | `go test` 通过                                                                |
| 7    | ✅         | 实现 HTTP Handler（SSE）               | `go test` + curl 手动验证                                                     |
| 8    | ✅         | `main.go` 依赖注入 + 路由注册          | 启动服务 + `curl` 测试                                                        |
| 9    | ✅         | 前端 `pnpm generate:api` 更新类型      | TypeScript 编译通过                                                           |
| 10   | ✅         | 实现 `ChatGateway` + `HttpChatGateway` | Vitest 通过                                                                   |
| 11   | ✅         | 实现 Chat UI 组件                      | Vitest + 浏览器手动验证                                                       |
| 12   | ✅         | 路由注册 + 导航入口                    | 组件测试断言 `/chat` 导航                                                     |
| 13   | ✅（部分） | 全部门禁执行                           | 后端 `make verify` 通过；前端 typecheck/lint/format/test/build 通过，E2E 待补 |

---

## 7. 文件变更清单

### dify-agent-api

| 操作 | 文件                                                               |
| ---- | ------------------------------------------------------------------ |
| 修改 | `api/openapi/v1/openapi.yaml`                                      |
| 修改 | `api/openapi/v1/openapi.sha256`                                    |
| 修改 | `internal/platform/config/config.go`                               |
| 修改 | `internal/platform/config/config_test.go`                          |
| 修改 | `cmd/api/main.go`                                                  |
| 修改 | `internal/platform/httpserver/server.go`                           |
| 修改 | `architecture-profile.json`（模块清单 + OpenAPI 摘要）             |
| 修改 | `tools/architecturecheck/main_test.go`（摘要断言随契约更新）       |
| 修改 | `.env.example` / `deploy/config.schema.json` / 生成代码            |
| 新增 | `internal/modules/agent/public.go`                                 |
| 新增 | `internal/modules/agent/application/ports/llm-gateway.go`          |
| 新增 | `internal/modules/agent/application/usecases/chat-usecase.go`      |
| 新增 | `internal/modules/agent/application/usecases/chat-usecase_test.go` |
| 新增 | `internal/modules/agent/infrastructure/openai/llm-gateway.go`      |
| 新增 | `internal/modules/agent/infrastructure/openai/llm-gateway_test.go` |
| 新增 | `internal/modules/agent/transport/http/handler.go`                 |
| 新增 | `internal/modules/agent/transport/http/handler_test.go`            |

### general_architecture_projects

| 操作     | 文件                                                                        |
| -------- | --------------------------------------------------------------------------- |
| 修改     | `contracts/dify-agent-api/v1/openapi.yaml`（同步）                          |
| 修改     | `contracts/dify-agent-api/v1/openapi.sha256`                                |
| 重新生成 | `src/generated/dify-agent-api/*`                                            |
| 修改     | `src/app/module-catalog.ts`                                                 |
| 新增     | `src/modules/chat/public.ts`                                                |
| 新增     | `src/modules/chat/composition.ts`                                           |
| 新增     | `src/modules/chat/application/chat-gateway.ts`                              |
| 新增     | `src/modules/chat/infrastructure/http-chat-gateway.ts`                      |
| 新增     | `src/modules/chat/infrastructure/http-chat-gateway.test.ts`                 |
| 新增     | `src/modules/chat/presentation/chat-gateway-context.tsx`                    |
| 新增     | `src/modules/chat/presentation/chat-route.tsx`                              |
| 新增     | `src/modules/chat/presentation/chat-route.test.tsx`                         |
| 新增     | `src/modules/chat/presentation/chat-route.module.css`                       |
| 新增     | `src/modules/chat/presentation/chat-route.module.css.d.ts`                  |
| 新增     | `src/modules/chat/presentation/chat-input.tsx`                              |
| 新增     | `src/modules/chat/presentation/chat-messages.tsx`                           |
| 新增     | `src/modules/chat/presentation/chat-ui-messages.ts`                         |
| 修改     | `src/app/router/app-router.tsx`（未改动——路由由 `module-catalog` 自动派生） |
