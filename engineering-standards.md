# 工程代码与质量规范

## 1. 目的与事实源

本文件定义所有档位和运行目标共同执行的代码、静态检查、类型检查、格式化和测试规则。架构边界以项目选定并实例化的 `ARCHITECTURE.md` 为准。

可由工具表达的规则必须只存在于可执行配置中：

| 规则 | 唯一可执行来源 |
| --- | --- |
| TypeScript | 根 `tsconfig.json` 与 App、测试、构建、Vitest、Playwright 各自的 `tsconfig.*.json` |
| ESLint | `eslint.config.mjs` |
| 格式 | Prettier 配置与 `.editorconfig` |
| 依赖方向 | ESLint import rules + dependency-cruiser |
| Commit | `commitlint.config.mjs` |
| CI 聚合 | `package.json#scripts` 与 CI workflow |

本文解释不可完全自动化的语义和配置必须满足的结果，不复制每条工具规则。配置与本文不一致时必须修正二者，不能添加例外。

## 2. TypeScript

- 根 `tsconfig.json` 统一共享选项和 alias；App、测试、构建配置、Vitest 和 Playwright 使用独立 `tsconfig.*.json`。`typecheck` 必须以 `tsc -p <config> --noEmit --pretty false` 检查每一个配置，任一失败即退出，且不得产生 JS、声明或缓存文件。
- 每个源码配置启用 `strict`、`noEmit`、`incremental: false`、`isolatedModules`、`noUncheckedIndexedAccess`、`exactOptionalPropertyTypes`、`noImplicitOverride`、`noImplicitReturns`、`noFallthroughCasesInSwitch`、`useUnknownInCatchVariables`、`verbatimModuleSyntax` 和 `forceConsistentCasingInFileNames`。
- `skipLibCheck` 必须为 `false`。无法通过类型检查的依赖应升级、替换或拒绝使用，不以补丁或全局声明掩盖。
- 禁止显式和隐式 `any`、`@ts-ignore`、生产代码非空断言以及为消除错误而使用双重类型断言。
- 外部数据先以 `unknown` 接收并在 Infrastructure/IPC 边界校验；优先使用 `satisfies` 保留精确推导。
- Union 必须穷尽处理；错误对象、安全上下文和状态机不使用可选字段堆叠模拟互斥状态。
- 不在 render、selector、computed 或 Query key 构建中产生副作用。

## 3. ESLint

- 使用唯一 Flat Config `eslint.config.mjs`，直接依赖和插件全部精确锁定。
- `pnpm lint` 必须覆盖源码、测试、脚本和配置，并以 `--max-warnings=0` 运行。
- 至少启用 TypeScript type-aware、React Hooks、JSX a11y、TanStack Query、Promise/异步安全、import 边界和未使用代码检查。
- ESLint、TypeScript、Rspack、Vitest 和 Playwright 必须从同一 alias 配置源读取路径。
- 禁止项目级或目录级 disable。单行误报抑制必须包含规则名、原因和可验证依据；确认是工具缺陷时优先升级或更换依赖。
- CI 只运行 `lint`，不得运行 `lint:fix`。自动修复产生的全部 diff 必须由提交者审查。

## 4. 格式、文件与命名

- Prettier 是格式唯一来源，ESLint 不重复承担纯格式规则；`format:check` 必须检查源码、配置、测试和文档。
- UTF-8、LF、末尾换行、缩进和尾随空白由 `.editorconfig` 与 `.gitattributes` 固定。
- 源文件使用 kebab-case；React 组件、类型和类使用 PascalCase；变量和函数使用 camelCase；布尔值使用 `is/has/can/should` 前缀。
- 默认使用 named export。只有工具协议明确要求默认导出或路由懒加载边界允许 default export。
- 禁止全局 barrel。跨模块只允许架构规定的 `public.ts`；模块内部直接引用具体文件。
- 测试使用 `*.test.ts(x)`，E2E 使用 `*.spec.ts`，生成文件位于明确的 `generated/` 目录并带有禁止手改标识。

## 5. React、状态与样式

- 组件只负责渲染与交互，业务编排进入 Application；不得在组件或 Hook 中直接访问 fetch、Tauri invoke 或持久化。
- 不用 `useEffect` 计算可由 props/state 纯推导的数据，不建立镜像状态或双向同步。
- Hook 必须满足完整依赖和释放语义；订阅、计时器、AbortController、Object URL、Channel 和原生监听器进入统一 LifecycleScope。
- Query、MobX、RHF、URL 和 React state 严格执行架构规定的唯一所有权。
- HeroUI v3 是唯一基础组件体系，Tailwind CSS v4 是唯一业务样式工具；业务只使用语义 Token。
- 禁止 `!important`、高特异性覆盖、任意值逃逸设计 Token 以及依赖 HeroUI 私有 DOM 结构。
- 新增和修改交互必须覆盖键盘、焦点、缩放、对比度、错误提示和 WCAG 2.2 AA。

## 6. 错误、异步与安全

- 错误使用稳定的分类和安全消息，不把远端原文、Token、用户数据、路径或堆栈直接显示或上报。
- Promise 必须被 await、return 或显式处理；禁止 floating promise、静默 catch 和无限重试。
- 所有 I/O 明确超时、取消、幂等性和资源释放。组件卸载、身份切换和模块 dispose 必须终止其工作。
- URL、HTML、文件、深链、IPC、Runtime Config 和 API 响应均视为不可信输入，进入系统时完成 Schema 与业务边界校验。
- 不在日志、错误、Query key、URL、存储、快照或测试 fixture 中保存 Secret 和真实个人数据。

## 7. 测试

- 测试行为与公开契约，不依赖私有实现、执行顺序、真实时间或网络。
- 每项能力按风险覆盖成功、失败、边界、权限、并发、取消、清理和恢复；修复缺陷必须先有可稳定复现的回归测试。
- 禁止 `skip`、`only`、无界 retry、空断言、快照替代关键断言和扩大 coverage exclude。
- Mock 只位于测试边界；生产源码不得导入 fixture、MSW handler 或测试工具。
- 覆盖率是最低信号，不能替代 requirements-risk-matrix 中核心流程、契约、a11y、视觉和 E2E 证据。

## 8. 生成代码与依赖

- OpenAPI、IPC、Token 或其他生成物必须声明唯一源、生成器和精确版本。
- `generated-code-drift` 在干净环境重新生成并要求 `git diff --exit-code`；生成物不得经过人工格式修补。
- 新依赖必须解决已确认问题。若标准库或现有依赖足够，不新增包装库。
- 删除功能时同时删除依赖、配置、类型、测试、文档、Capability 和 CI 分支。

## 9. Tauri/Rust 补充

本节仅适用于 `runtimeTarget: tauri-desktop`：

- `cargo fmt --check`、`cargo clippy -- -D warnings`、测试、`cargo audit` 和许可证/供应链策略全部阻断合并。
- 应用 crate 使用 `#![forbid(unsafe_code)]`；命令路径禁止 `unwrap`、`expect`、阻塞 I/O 和未界定重试。
- Rust command 是按契约生成或审查的窄接口，不接收任意 URL、Method、Header、路径、进程或 operation id。
- Rust 与 TypeScript 不手写重复业务模型；IPC 类型由单一 Schema 生成并执行零漂移检查。

浏览器目标不得安装空 Rust 工具链或保留本节脚本。

## 10. 门禁与例外

`pnpm verify` 至少聚合：

~~~text
instructions-check + profile-check + toolchain-check + frozen-install
→ generated-code-drift + format-check + commit-policy-check
→ typecheck + lint-zero-warning + architecture-check + cycle-check
→ unit + component + integration + contract + accessibility
→ production-build + bundle-budget
→ dependency/vulnerability/license/secret/SAST
~~~

发布候选继续执行完整 E2E、视觉、运行时矩阵、制品和发布验证。

本规范不建立 waiver、baseline 或永久 exclude 机制。规则确有错误时修正规则和全部违规代码；架构不再适用时一次性迁移并删除旧规则，不允许通过豁免积累技术债务。
