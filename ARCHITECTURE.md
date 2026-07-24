# Dify Agent 前端架构

## 1. 选型与范围

本项目是 `medium` 档位的 `browser-spa`，只交付 React SPA、静态资源、前端构建和部署配置。Go API、PostgreSQL、迁移与服务端 Secret 位于独立的 `dify-agent-api` 仓库，两个部署单元只通过锁定版本的 OpenAPI 与 HTTPS 通信。真实配置见 `architecture-profile.yaml`。

## 2. 系统上下文

```mermaid
flowchart LR
    Person["用户 / 超级管理员"] --> SPA["Dify Agent SPA"]
    SPA -->|"HTTPS / OpenAPI v1"| API["dify-agent-api"]
    API --> DB[("PostgreSQL")]
    Deploy["静态制品 + Runtime Config"] --> SPA
    Secret["部署 Secret"] --> API
```

当前唯一业务模块是 `auth`，其边界是注册、登录、会话恢复、注销与展示当前身份。后续只在出现稳定业务边界和真实 owner 时增加模块，不预建空 Repository、Entity、Store 或 Domain。

```text
src/
├── app/                       # Bootstrap、Provider、Router、静态 Module Catalog
│   └── i18n/                  # 汇总各模块消息资源并初始化 i18next
├── generated/dify-agent-api/ # OpenAPI 生成类型与 Zod Schema，禁止手改
├── modules/auth/
│   ├── application/           # AuthGateway port 与命令
│   ├── infrastructure/        # HTTP adapter、响应校验、token 内存管理
│   └── presentation/          # 登录、注册与身份页
├── shared/http/               # 唯一通用 HTTP client
└── styles/                    # 单一主题
```

## 3. 依赖、状态与契约

依赖方向固定为 `presentation → application ← infrastructure`。Presentation 不得直接 `fetch`；所有远程 I/O 经 `AuthGateway` 和唯一 `HttpClient`。TanStack Query 是远程会话状态的唯一缓存，RHF 拥有表单，Zod 校验输入和所有 API 成功/错误响应，React state 只保存登录/注册模式。i18next 是界面语言和文案资源的唯一 owner：启动时从浏览器偏好检测 `zh-CN` 或 `en-GB`，语言切换只在当前页面会话生效，不写入浏览器持久化；日期与数字统一通过语言上下文封装的 `Intl` 格式化。每个业务模块在自身 Presentation 边界维护按消息键组织的双语资源，中英文必须并排且完整；`app/i18n` 是唯一资源组合与 i18next 初始化点，组件只使用稳定消息 id。

`contracts/dify-agent-api/v1/openapi.yaml` 与 `.sha256` 是唯一 transport 来源。`pnpm generate:api` 产生只读类型和 Schema，`generated:check` 在临时目录重新生成并进行逐文件零漂移比较。Runtime Config 必须同时匹配 contract id 与 SHA-256；远程 API 必须使用 HTTPS，配置不合法时应用 fail-closed。

本地开发先运行 `pnpm runtime-config:init` 创建或同步被 Git 忽略的 `public/runtime-config.json`；该命令刷新契约字段，但保留已有 API 地址与 release id。`pnpm dev` 启动前执行非修改型 `runtime-config:check`，配置缺失、格式错误或契约过期时立即失败。`profile:check` 同时保证版本化示例配置与 Profile 一致。

## 4. 认证与安全

认证策略由 [ADR 0001](docs/adr/0001-local-auth-session.md) 固化。用户凭据只发送给 Go API；短期随机 access token 仅在 `HttpClient` 内存保存，长期 refresh token 仅由服务端 HttpOnly、SameSite Cookie 承载。前端启动调用 refresh 恢复会话，注销无论服务端响应如何都清除内存 token。错误界面只映射稳定错误码，不展示服务端原文或敏感数据。

`auth` 模块不自行判断或提升角色；超级管理员身份完全来自后端验证后的 `UserResponse.role`。前端仅据此展示身份状态，所有权限控制仍必须由 API 执行。

## 5. 体验、交付与验收

界面使用语义化 HTML、键盘可达控件、清晰焦点态与响应式布局，目标为 WCAG 2.2 AA。所有用户可见文案由 i18next 管理；启动配置失败使用最小静态故障页，因为 i18n 本身尚未安全启动。

生产构建路由级拆包并执行 gzip 预算：初始 JavaScript 不超过 150 KiB，CSS 不超过 75 KiB。静态制品与公开 Runtime Config 分离发布，部署时从 `public/runtime-config.example.json` 生成实际 `runtime-config.json`，不得把 token、密码或数据库信息写入其中。

合并前执行 `pnpm verify`，覆盖 Profile、契约生成漂移、格式、类型、Lint、依赖环、架构图、单元/组件测试和生产构建。认证需求、残余风险、SLO、Runbook 与数据清单分别维护在 `docs/requirements-risk-matrix.md`、`docs/slo.md`、`docs/runbook-authentication.md` 与 `docs/data-classification.md`。
