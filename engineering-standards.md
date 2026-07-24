# 工程代码与质量规范

## 1. 目的与事实源

本文件定义所有档位和运行目标共同执行的代码、静态检查、类型检查、格式化和测试规则。架构边界以项目选定并实例化的 `ARCHITECTURE.md` 为准。

可由工具表达的规则必须只存在于可执行配置中：

| 规则       | 唯一可执行来源                                                                     |
| ---------- | ---------------------------------------------------------------------------------- |
| TypeScript | 根 `tsconfig.json` 与 App、测试、构建、Vitest、Playwright 各自的 `tsconfig.*.json` |
| ESLint     | `eslint.config.mjs`                                                                |
| 格式       | Prettier 配置与 `.editorconfig`                                                    |
| 依赖方向   | ESLint import rules + dependency-cruiser                                           |
| Commit     | `commitlint.config.mjs`                                                            |
| CI 聚合    | `package.json#scripts` 与 CI workflow                                              |

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
- ESLint 必须对全部人工维护的 JavaScript/TypeScript 文件执行 `max-lines` 硬门禁：单文件最多 500 行。计数忽略空行但不忽略注释；文件接近上限时应按职责拆分，不得通过压缩格式、删除必要注释或迁移到未受检后缀规避。
- ESLint 必须为人工维护代码配置并执行可读性上限：单函数最多 80 行、圈复杂度最多 12、语句嵌套最多 3 层、参数最多 4 个，并禁止嵌套三元表达式。确有更多输入时使用表达业务含义的参数对象；复杂分支应提取为具名策略或纯函数。
- ESLint、TypeScript、Rspack、Vitest 和 Playwright 必须从同一 alias 配置源读取路径。
- 禁止项目级或目录级 disable。单行误报抑制必须包含规则名、原因和可验证依据；确认是工具缺陷时优先升级或更换依赖。
- CI 只运行 `lint`，不得运行 `lint:fix`。自动修复产生的全部 diff 必须由提交者审查。

生成文件不属于人工维护代码，不适用上述规模和复杂度规则；它们必须位于 `generated/`、带禁止手改标识，并由 `generated-code-drift` 完整治理。测试、脚本和配置仍属于人工维护代码，不因文件类型获得宽松上限。

## 4. 格式、文件与命名

- Prettier 是格式唯一来源，ESLint 不重复承担纯格式规则；`format:check` 必须检查源码、配置、测试和文档。
- UTF-8、LF、末尾换行、缩进和尾随空白由 `.editorconfig` 与 `.gitattributes` 固定。
- 源文件使用 kebab-case；React 组件、类型和类使用 PascalCase；变量和函数使用 camelCase；布尔值使用 `is/has/can/should` 前缀。
- 名称必须表达业务角色、单位和生命周期；禁止 `data`、`info`、`item`、`obj`、`temp`、`utils`、`common`、`manager`、`handler` 等脱离上下文无法判断职责的泛化名称。集合使用复数，带单位的数值在名称中标明单位，事件处理函数使用 `handle<Event>`，作为参数传入的回调使用 `on<Event>`。
- 默认使用 named export。只有工具协议明确要求默认导出或路由懒加载边界允许 default export。
- 禁止全局 barrel。跨模块只允许架构规定的 `public.ts`；模块内部直接引用具体文件。
- 测试使用 `*.test.ts(x)`，E2E 使用 `*.spec.ts`，生成文件位于明确的 `generated/` 目录并带有禁止手改标识。

## 5. 可读性、可维护性与职责

- 文件、组件、Hook、类和函数只承担一个可用一句话描述的职责；发生变化的原因不同、依赖的边界不同或测试场景不同，即应拆分。拆分必须沿业务能力和架构边界进行，禁止仅为满足行数创建无语义的碎片文件。
- 公共 API 保持最小且显式；内部实现默认不导出。跨模块调用只能通过模块 `public.ts` 暴露的稳定契约，不得深层导入或共享可变状态。
- 优先使用早返回、守卫子句、穷尽 `switch` 和具名纯函数降低嵌套；禁止把条件、异常或异步控制流压缩成难以调试的一行表达式。
- 注释解释约束、原因和取舍，不复述代码。复杂业务规则必须同时具备表达意图的名称、契约测试，以及必要时的 ADR；不得用长注释维持不可理解的实现。
- 重复业务知识应收敛到唯一所有者；只因代码形状相似不得提前抽象。抽象必须至少有真实调用者并形成比重复实现更小、更稳定的公共契约。
- 禁止循环依赖，包括直接环、跨 barrel 的间接环、动态 import 环、类型导入环和测试辅助代码引入的环。ESLint 负责快速反馈，`dependency-cruiser` 的 `cycle:check` 对全依赖图作最终判定，两者都不得配置已知环基线。
- 架构层只能依赖架构允许的下一层或公开端口；不得借助 callback、service locator、全局 registry、事件总线或依赖注入容器隐藏反向依赖。

## 6. 常量、配置与硬编码

- 禁止散落的业务规则字面量。状态、错误码、权限、Capability、路由、存储键、事件名、Query key、协议字段、重试/超时、容量阈值、URL 和环境差异必须由其唯一 owner 以具名常量、类型、Schema 或已校验配置定义。
- 用户可见文本不得直接硬编码在组件、Hook 或业务逻辑中，必须使用本地化消息 id；测试必须验证语义或可访问名称，不依赖翻译后的整段文案。
- Secret、部署地址、租户信息和环境开关只能来自经 Schema 校验的运行时配置或密钥设施，不得进入源码、默认值、日志、fixture 或构建参数回退值。
- 局部且自解释的字面量可以保留，例如数组索引、布尔值、数学恒等值、测试用例输入和只使用一次的领域示例。不得把它们机械提升为 `TEXT_1`、`VALUE` 等无语义常量；是否抽取取决于它是否表达需要统一变更的业务知识。
- 同一业务值出现两次不自动构成抽象理由；但同一规则不得由多个模块分别维护。新增常量前必须搜索其 owner，禁止建立第二套枚举、错误码或配置键。

## 7. React、状态与样式

- 组件只负责渲染与交互，业务编排进入 Application；不得在组件或 Hook 中直接访问 fetch、Tauri invoke 或持久化。
- 不用 `useEffect` 计算可由 props/state 纯推导的数据，不建立镜像状态或双向同步。
- Hook 必须满足完整依赖和释放语义；订阅、计时器、AbortController、Object URL、Channel 和原生监听器进入统一 LifecycleScope。
- Query、MobX、RHF、URL 和 React state 严格执行架构规定的唯一所有权。
- HeroUI v3 是唯一基础组件体系，Tailwind CSS v4 是唯一业务样式工具；业务只使用语义 Token。
- 禁止 `!important`、高特异性覆盖、任意值逃逸设计 Token 以及依赖 HeroUI 私有 DOM 结构。
- 新增和修改交互必须覆盖键盘、焦点、缩放、对比度、错误提示和 WCAG 2.2 AA。

## 8. 错误、异步与安全

- 错误使用稳定的分类和安全消息，不把远端原文、Token、用户数据、路径或堆栈直接显示或上报。
- Promise 必须被 await、return 或显式处理；禁止 floating promise、静默 catch 和无限重试。
- 所有 I/O 明确超时、取消、幂等性和资源释放。组件卸载、身份切换和模块 dispose 必须终止其工作。
- URL、HTML、文件、深链、IPC、Runtime Config 和 API 响应均视为不可信输入，进入系统时完成 Schema 与业务边界校验。
- 不在日志、错误、Query key、URL、存储、快照或测试 fixture 中保存 Secret 和真实个人数据。

## 9. 测试

- 测试行为与公开契约，不依赖私有实现、执行顺序、真实时间或网络。
- 每项能力按风险覆盖成功、失败、边界、权限、并发、取消、清理和恢复；修复缺陷必须先有可稳定复现的回归测试。
- 禁止 `skip`、`only`、无界 retry、空断言、快照替代关键断言和扩大 coverage exclude。
- Mock 只位于测试边界；生产源码不得导入 fixture、MSW handler 或测试工具。
- 覆盖率是最低信号，不能替代 requirements-risk-matrix 中核心流程、契约、a11y、视觉和 E2E 证据。
- 每次生产行为变更必须新增或更新能够失败于旧实现的自动化测试；纯重构至少运行受影响测试并证明公开行为未变。仅修改注释、格式或治理文档时可不新增单元测试，但仍必须运行该变更适用的静态校验。
- 完成代码修改后必须运行受影响的单元、组件、集成和契约测试，再运行 `pnpm verify`。不得以“改动很小”、人工验证、IDE 无报错或 Agent 已阅读代码替代执行结果；失败、warning、skip、flaky 和未运行项必须解决后才能交付。

## 10. 生成代码与依赖

- OpenAPI、IPC、Token 或其他生成物必须声明唯一源、生成器和精确版本。
- `generated-code-drift` 在干净环境重新生成并要求 `git diff --exit-code`；生成物不得经过人工格式修补。
- 新依赖必须解决已确认问题。若标准库或现有依赖足够，不新增包装库。
- 删除功能时同时删除依赖、配置、类型、测试、文档、Capability 和 CI 分支。

## 11. Tauri/Rust 补充

本节仅适用于 `runtimeTarget: tauri-desktop`：

- `cargo fmt --check`、`cargo clippy -- -D warnings`、测试、`cargo audit` 和许可证/供应链策略全部阻断合并。
- 应用 crate 使用 `#![forbid(unsafe_code)]`；命令路径禁止 `unwrap`、`expect`、阻塞 I/O 和未界定重试。
- Rust command 是按契约生成或审查的窄接口，不接收任意 URL、Method、Header、路径、进程或 operation id。
- Rust 与 TypeScript 不手写重复业务模型；IPC 类型由单一 Schema 生成并执行零漂移检查。

浏览器目标不得安装空 Rust 工具链或保留本节脚本。

## 12. 门禁与例外

`pnpm verify` 至少聚合：

```text
instructions-check + profile-check + toolchain-check + frozen-install
→ generated-code-drift + format-check + commit-policy-check
→ typecheck + lint-zero-warning + architecture-check + cycle-check
→ unit + component + integration + contract + accessibility
→ production-build + bundle-budget
→ dependency/vulnerability/license/secret/SAST
```

发布候选继续执行完整 E2E、视觉、运行时矩阵、制品和发布验证。

本规范不建立 waiver、baseline 或永久 exclude 机制。规则确有错误时修正规则和全部违规代码；架构不再适用时一次性迁移并删除旧规则，不允许通过豁免积累技术债务。
