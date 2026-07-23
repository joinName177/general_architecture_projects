# CONTRIBUTING.md

## 1. 规范定位

本文件是项目 Git、Commit、Pull Request、Review 和合并流程的唯一规范。架构规则由项目的 `ARCHITECTURE.md` 负责，代码规则由 `engineering-standards.md` 负责，Agent 行为由 `AGENTS.md` 负责。

CI 和受保护分支设置是权威门禁。本地 Hook 只提供快速反馈，不能替代 CI，也不能拥有 CI 中不存在的隐藏规则。

## 2. 开始变更

- 从最新受保护主分支创建短生命周期分支，不直接向主分支提交。
- 分支名使用 `<type>/<ticket-id>-<short-kebab-description>`；没有工单时省略 ticket id，不得使用姓名或含义不明的名称。
- 开工前确认工作区、任务范围、架构档位、运行目标、owner 和验收条件。
- 一个 PR 只解决一个可审查目标。架构迁移可以拆成有明确门禁的连续 PR，但不能在主分支长期保留双实现。

允许的 type：

~~~text
feat | fix | refactor | perf | test | docs | build | ci | chore | revert
~~~

## 3. 本地命令契约

实例项目必须在 `package.json#scripts` 提供以下稳定命令：

~~~text
pnpm format
pnpm format:check
pnpm lint
pnpm lint:fix
pnpm typecheck
pnpm instructions:check
pnpm profile:check
pnpm toolchain:check
pnpm generated:check
pnpm architecture:check
pnpm cycle:check
pnpm diagram:check
pnpm commit:check
pnpm test
pnpm test:coverage
pnpm test:e2e
pnpm build
pnpm verify
~~~

`pnpm verify` 是非修改型聚合门禁，不得调用 `format`、`lint:fix` 或写回生成文件。开发者可以使用修改型命令修复问题，但提交前必须运行检查型命令。

脚本名与 CI Required Check id 使用以下固定映射，避免文档、分支保护和流水线各自命名：

| package script | CI check id |
| --- | --- |
| `instructions:check` | `instructions-check` |
| `profile:check` | `profile-check` |
| `toolchain:check` | `toolchain-check` |
| `generated:check` | `generated-code-drift` |
| `format:check` | `format-check` |
| `commit:check` | `commit-policy-check` |
| `typecheck` | `typecheck` |
| `lint` | `lint-zero-warning` |
| `architecture:check` | `architecture-check` |
| `cycle:check` | `cycle-check` |
| `diagram:check` | `diagram-check` |

分支保护只能引用该表中的稳定 check id；重命名必须在同一变更中更新脚本、CI、保护设置、文档和 instructions-check。

Tauri 项目还必须提供：

~~~text
pnpm desktop:dev
pnpm desktop:build
pnpm rust:format:check
pnpm rust:clippy
pnpm rust:test
pnpm rust:supply-chain
~~~

浏览器项目不得保留空的桌面脚本；Tauri 项目不得保留浏览器部署脚本作为备用路径。

## 4. Commit 规范

提交和 PR 标题使用：

~~~text
type(scope)!: imperative summary
~~~

- `type` 只能使用第 2 节的封闭集合。
- `scope` 使用 `architecture-profile.yaml` 中稳定的 Context/Module id，或 `app`、`ui`、`auth`、`build`、`ci`、`deps`、`desktop`、`docs`。
- summary 使用祈使语气，描述结果，不写“update stuff”“fix issue”等无信息文本。
- 破坏性变更使用 `!`，并在正文说明删除的旧契约、迁移步骤和发布影响；不得通过兼容层消化破坏性变化。
- `revert` 必须引用被撤销提交并说明原因。
- 不在 Commit 中保存 Secret、用户数据、访问地址凭据或大段生成日志。

默认合并策略为 Squash Merge。PR 标题和最终 Squash Commit 必须通过 Commitlint；本地中间提交建议遵循相同格式，但不得为了整理提交而改写他人或共享历史。

`pnpm commit:check` 校验当前 HEAD；CI 的 `commit-policy-check` 使用同一配置校验 PR 标题。仓库必须把 Squash Commit 默认标题固定为 PR 标题，并禁止合并时自由改写为未校验文本，从而保证最终提交与门禁结论一致。

## 5. Pull Request

项目只在代码托管平台实际生效的 `.github/pull_request_template.md` 保留一份 PR 模板，不得继续保留根模板副本或其他重复模板。instructions-check 必须验证模板存在且生效。

PR 描述必须包含：

1. 目标、明确范围和拒绝实现的非目标。
2. 受影响的 Context、运行目标、契约、身份、权限、状态、UI 或发布能力。
3. 关键决策及拒绝的备选；达到 ADR 条件时必须链接 ADR。
4. 成功、失败、边界、安全、无障碍和回归测试证据。
5. 配置、Schema、生成物、架构图、SLO、风险矩阵和 Runbook 的同步情况。
6. 发布、停止放量及浏览器回滚或桌面前向回滚方式。

禁止空 PR 描述、仅贴截图、仅声明“测试通过”或把关键说明留在即时通讯中。

## 6. Review 与合并

- CODEOWNERS 必须覆盖 Architecture、Security、Design System、Release 和业务 Context。
- CODEOWNERS 由已校验的 Profile ownership 与 Context owner 生成或核对；不得使用占位 owner、全仓单一兜底 owner 掩盖未分配责任或维护第二份 owner 清单。
- 架构、身份、Capability、数据分类、外部契约、供应链或发布变化必须取得对应 owner 审查。
- 新提交使已有批准失效；不得保留基于旧 diff 的批准。
- Required Checks 全部通过、讨论解决、无未完成占位符后才能进入 Merge Queue 或合并。
- 禁止管理员绕过、直接推送、`--no-verify`、修改门禁名称规避保护或把失败检查改为 optional。
- 合并后自动删除分支。Release 只从受保护提交及可验证制品创建。

## 7. 依赖与工具链变更

- 直接依赖和工具链使用精确版本并提交 lockfile。
- 一个 PR 不混合无关依赖升级和业务功能。
- 升级必须包含变更原因、官方迁移依据、锁文件审查、许可证/漏洞结果、测试和性能影响。
- 主版本、身份、安全、构建、UI 或 Tauri 核心依赖升级必须建立 ADR。
- 禁止 `patch-package`、长期 overrides、私有 fork 或修改依赖源码。

## 8. 架构与治理资产附加门禁

修改项目架构、Schema 或治理资产时至少执行：

- `git diff --check`。
- `architecture-profile.schema.json` JSON 语法与 AJV Draft 2020-12 strict + formats 编译。
- 浏览器和 Tauri Profile 正例，以及关键冲突负例。
- 所有 Mermaid 图的真实渲染。
- 对旧文件名、旧 Schema 字段、占位符和双指令源的全仓搜索。

任何图、Schema 或交叉引用失败都阻断合并。
