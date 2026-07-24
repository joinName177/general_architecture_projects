# Case-based 命名规范

## 1. 定位与优先级

本规范为 Dify Agent 的 TypeScript、React 与前端交付资产定义统一命名方式。它是 `engineering-standards.md` 第 4 节的一部分，适用于源码、测试、配置、契约、样式和文档。可执行配置优先于本文；本文与 `engineering-standards.md` 发生冲突时，以后者为准。

命名应让第一次阅读代码的人无需打开实现也能判断对象的业务角色、边界、方向、单位和生命周期。命名不是压缩字符数的竞赛；缩写仅在团队已稳定使用、不会产生歧义时采用。

## 2. Case 总览

| Case                | 形式                       | 用途                           | 示例                                 |
| ------------------- | -------------------------- | ------------------------------ | ------------------------------------ |
| kebab-case          | 小写单词以 `-` 分隔        | 文件、目录、模块 id、路由段    | `agent-session.ts`, `agent-settings` |
| camelCase           | 首词小写，后续词首字母大写 | 变量、函数、参数、对象字段     | `loadAgentSession`                   |
| PascalCase          | 每个词首字母大写           | 组件、类型、类、错误、事件     | `AgentSession`, `AgentNotFoundError` |
| UPPER_SNAKE_CASE    | 大写单词以 `_` 分隔        | 稳定错误码、协议常量、环境变量 | `AGENT_NOT_FOUND`, `VITE_RELEASE_ID` |
| dot.case            | 小写段以 `.` 分隔          | i18n key、遥测事件命名空间     | `agent.form.submit`                  |
| CSS custom property | `--` 加 kebab-case 语义段  | Design Token                   | `--color-surface-default`            |

禁止把同一概念混用为多种 case。例如文件为 `AgentCard.tsx`、导出为 `agent_card` 或 i18n key 使用 `Agent.Form.Submit` 都是不合规的。

## 3. 文件、目录与模块

所有人工维护的源文件和目录使用 kebab-case；React 组件文件也不例外。文件名描述其职责而非笼统技术类别。

| 对象           | 正例                                    | 反例                            |
| -------------- | --------------------------------------- | ------------------------------- |
| React 组件文件 | `agent-card.tsx`                        | `AgentCard.tsx`, `card.tsx`     |
| Hook 文件      | `use-agent-session.ts`                  | `agentHook.ts`, `hooks.ts`      |
| Use Case 文件  | `create-agent-use-case.ts`              | `create.ts`, `agent-service.ts` |
| Port 文件      | `agent-gateway.ts`                      | `gateway.ts`, `api.ts`          |
| Adapter 文件   | `http-agent-gateway.ts`                 | `agent-api.ts`                  |
| Mapper 文件    | `agent-response-dto-to-agent-mapper.ts` | `mapper.ts`                     |
| 测试文件       | `agent-card.test.tsx`                   | `agent-card-test.tsx`           |
| E2E 文件       | `agent-creation.spec.ts`                | `e2e.ts`                        |
| 模块目录       | `agent-management`                      | `AgentManagement`, `agents`     |

模块 id 使用单数、稳定的业务名词，例如 `agent-management`、`knowledge-base`。不得因为页面或组件数量增长，把技术概念作为业务模块名，如 `components`、`api-client`、`common`。

## 4. TypeScript 标识符

### 4.1 类型、组件与类

类型、interface、React 组件、类、错误和领域事件使用 PascalCase，名称以业务名词或清晰角色结尾。

```ts
type AgentSession = Readonly<{ id: string }>;
interface AgentGateway {}
function AgentCard() {}
class AgentNotFoundError extends Error {}
class AgentCreated {}
```

不要把实现机制放入公共业务类型名，除非它正是该边界的一部分。`Agent`、`AgentGateway` 合理；`AgentDataManager`、`AgentInfo`、`AgentObject` 不合理。

### 4.2 变量、函数与参数

变量、函数和参数使用 camelCase。函数以动词开头；只读查询使用 `get`、`find`、`list`、`load`、`is` 等准确动词，命令使用 `create`、`update`、`delete`、`submit`、`cancel` 等产生效果的动词。

```ts
const activeAgentIds: readonly string[] = [];
const retryDelayMs = 300;

function loadAgentSession() {}
function createAgent() {}
function findAgentById() {}
```

禁止无上下文的 `data`、`info`、`item`、`obj`、`temp`、`result`、`utils`、`common`、`manager`、`handler`。若一个参数在局部上下文确为集合元素，使用其领域名，例如 `agent`、`message`，不使用 `item`。

### 4.3 布尔、集合、单位与时间

布尔值使用 `is`、`has`、`can`、`should` 或明确的否定状态；集合使用复数；数值必须在名称中表达单位；时间点使用 `At`，时间段使用单位后缀。

| 意图       | 正例              | 反例                     |
| ---------- | ----------------- | ------------------------ |
| 是否加载   | `isLoading`       | `loading`                |
| 是否有权限 | `hasWriteAccess`  | `permission`             |
| 可否提交   | `canSubmit`       | `submitable`             |
| 集合       | `agents`          | `agentList`, `agentData` |
| 毫秒       | `timeoutMs`       | `timeout`                |
| 字节       | `bundleSizeBytes` | `bundleSize`             |
| 时间点     | `createdAt`       | `createTime`             |
| 数量       | `retryCount`      | `retries`                |

`isNotReady` 一类双重否定应改为正向状态，如 `isReady`，由调用方使用 `!isReady` 表达否定。

## 5. React 约定

组件、Props、事件和 Hook 使用固定关系，避免在组件树中混淆“发起事件”和“处理事件”。

```ts
interface AgentCardProps {
  readonly agent: AgentSummary;
  readonly onSelectAgent: (agentId: string) => void;
}

function AgentCard({ agent, onSelectAgent }: AgentCardProps) {
  function handleSelect() {
    onSelectAgent(agent.id);
  }
}

function useAgentSession() {}
```

- 对外 props 回调使用 `on<Event>`；组件内部处理函数使用 `handle<Event>`。
- 自定义 Hook 必须以 `use` 开头；不能调用 Hook 的纯函数不得伪装成 Hook。
- Ref 使用 `<role>Ref`，例如 `dialogRef`；异步状态使用 `isLoading`、`isSubmitting`、`loadError`，不使用泛化 `status` 堆叠多个互斥状态。
- 组件只在确有视图角色时以 `Component`、`Dialog`、`Form`、`Page`、`Panel` 等结尾；不要无意义追加 `Component`。

## 6. 分层与契约命名

| 边界                   | 模式                                           | 正例                              |
| ---------------------- | ---------------------------------------------- | --------------------------------- |
| Application 用例       | `<Verb><Noun>UseCase`                          | `CreateAgentUseCase`              |
| Application Port       | `<Noun><Capability>`                           | `AgentGateway`, `AgentRepository` |
| Infrastructure Adapter | `<Mechanism><Noun><Capability>`                | `HttpAgentGateway`                |
| DTO                    | `<Verb><Noun>RequestDto` / `<Noun>ResponseDto` | `CreateAgentRequestDto`           |
| Mapper                 | `<Source>To<Target>Mapper`                     | `AgentResponseDtoToAgentMapper`   |
| Read Model             | `<Noun>Summary` / `<Noun>Detail`               | `AgentSummary`                    |
| Form Model             | `<Noun>FormValues`                             | `AgentFormValues`                 |
| Query                  | `use<Noun>Query` / `use<Nouns>Query`           | `useAgentQuery`                   |
| Mutation               | `use<Verb><Noun>Mutation`                      | `useCreateAgentMutation`          |

`Payload`、`Response`、`Request`、`Result`、`Model` 不能单独用作类型名，因为它们没有说明方向或边界。保留服务端字段名是契约映射的例外：DTO 可使用 OpenAPI 定义的 wire name，Application/Domain 模型必须使用本项目命名规范。

## 7. 错误、事件、常量与配置

错误类型使用可行动的原因加 `Error`，领域事件使用过去式，稳定代码使用 UPPER_SNAKE_CASE。环境变量保持供应商或构建系统要求的格式，并在配置 Schema 中映射为 camelCase 属性。

```ts
class InvalidAgentConfigurationError extends Error {}
type AgentCreated = Readonly<{ agentId: string }>;

const AGENT_NOT_FOUND = "AGENT_NOT_FOUND";
const runtimeConfig = { releaseId: "release-2026-07-24" };
```

不使用 `ERROR_1`、`UNKNOWN_ERROR`、`onEvent`、`eventData` 等无业务含义的名称。`Unknown` 仅用于类型收窄前的真实未知值，不能作为最终业务错误码。

## 8. i18n、样式与遥测

用户可见文本只能通过 i18n key 引用。key 使用 `<module>.<feature>.<meaning>`，最后一段描述语义而不是英文文案或位置。

| 对象       | 正例                      | 反例                                     |
| ---------- | ------------------------- | ---------------------------------------- |
| i18n key   | `agent.form.submit`       | `submitButtonText`, `agent.submitButton` |
| 可访问名称 | `agent.form.submit`       | `button1`                                |
| CSS Token  | `--color-surface-default` | `--blue-500`, `--card-2`                 |
| 间距 Token | `--space-content-inline`  | `--margin-16`                            |
| 遥测事件   | `agent.created`           | `createAgentEvent`                       |

原始调色板 Token 使用 `--palette-<hue>-<shade>`，并按浅到深排序，例如 `--palette-blue-500`；它们只允许在 `tokens.css` 内为语义 Token 赋值。业务 CSS Module 只使用语义 Token，例如 `--color-surface-default` 或 `--space-content-inline`，不得为绕过 Token 添加以具体颜色、像素值或序号命名的业务 class。

## 9. 测试命名

测试名应表达契约和条件，而不是实现步骤。`describe` 使用被测单元名称，`it` 使用英文 `should <behavior> when <condition>`，或等价、可读的中文句式；同一文件保持一种语言。

```ts
describe("CreateAgentUseCase", () => {
  it("should reject the command when the name is blank", async () => {});
});
```

Factory 使用 `create<Scenario><Noun>`；stub/mock 使用 `<scenario><Port>`；断言辅助函数使用 `expect<Behavior>`。例如 `createAuthorizedAgent`、`unavailableAgentGateway`、`expectAgentCreated`。禁止 `mockData`、`testUser`、`fixture1`。

## 10. 审查决策树

命名评审依序回答以下问题：

1. 它表达的是文件、类型、值、行为、事件、错误、配置还是用户文本？先选择本规范对应的 case。
2. 读者能否从名称知道业务对象、方向、边界和生命周期？不能则补充领域词，而非使用 `data`、`manager` 等泛化词。
3. 数值是否有单位，集合是否为复数，布尔值是否为可读判断？
4. 该名称是否复制了协议、Domain、i18n 或 Token 的已有 owner？若是，复用 owner，不创建第二套术语。
5. 若仍需通过注释才能说明名称，优先重命名或拆分职责；只有不可从名称推导的约束才写注释。

违反本规范的新增名称应在同一 PR 修正；存量迁移按模块进行，不得用无意义别名或兼容层长期保留两套术语。
