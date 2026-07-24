# Dify Agent 前端架构

## 1. 选型与范围

本项目选择 `medium` 档位和 `browser-spa` 运行目标，基线来源为已审阅的《中型纯前端项目架构方案》。项目只交付浏览器 SPA、静态资源、前端构建和前端交付配置；不创建 API 服务、BFF、数据库、任务或文件存储。

项目目前处于 [架构初始化状态](docs/architecture-bootstrap.md)，尚无业务模块、外部 API、OIDC 参数和生产环境。初始化期间的例外仅限于没有业务代码，不是对最终架构门禁的放宽。

## 2. 最终模块形态

产品开发开始后，按 3–8 个稳定业务能力组织 `src/modules/<module-id>/`。有外部 I/O 的模块必须至少包含 `application`、`infrastructure`、`presentation`；只有真实不变量、状态流转或跨页面规则才增加 `domain`。禁止空的 Repository、Entity、Store 或 Domain。

```text
src/
├── app/              # Bootstrap、Provider、Router、静态 Module Catalog
├── shared/           # 与业务无关且至少两模块稳定复用的能力
├── modules/          # 业务模块，仅在具备真实边界后创建
└── styles/           # 单一主题和语义 Token
```

每个模块仅通过 `public.ts` 向其他模块公开只读类型或稳定 Facade。`module.ts` 只包含静态元数据和路由级 `lazy()`；`composition.ts` 只在异步 chunk 中创建 Adapter、Use Case、Store 与幂等 `dispose()`。

## 3. 依赖和状态

Presentation 不得直接 `fetch`。外部 I/O 必须经 Application Port 和 Infrastructure Adapter；Domain 不依赖 React、Router、Query、HeroUI、fetch、shared 或 Infrastructure。App 只组装通用依赖，禁止承载业务编排。所有依赖必须无环。

TanStack Query 是远程数据唯一缓存，RHF 拥有表单，URL 只包含可分享且非敏感的筛选状态，React state 仅保存页面局部状态。默认不安装 MobX；真实跨页工作流无法保持唯一所有权时，须经 ADR 才能原子引入。

## 4. 平台与体验

React、TypeScript、Rspack、React Router、TanStack Query、RHF、Zod、i18next、HeroUI v3 和 Tailwind CSS v4 是唯一前端技术基线。HeroUI v3 是唯一基础组件系统，业务样式只使用语义 Token；所有核心页面须满足 WCAG 2.2 AA。

唯一 HTTP Client 负责 HTTPS allowlist、认证、超时、取消、错误映射、trace id 和安全日志。唯一 AuthAdapter 使用 Authorization Code + PKCE，Token 只保留在内存。OpenAPI artifact、digest 和 Zod Schema 是唯一 Transport 来源；响应必须在 Infrastructure 校验和映射后成为不可变 ReadModel。

## 5. 交付与验收

生产构建必须路由级拆包，并验证首包与 bundle budget。部署以不可变、内容寻址的 Artifact 为单位；公开 Runtime Config、Entry、Manifest、CSP 和 API contract id 必须在 Bootstrap 阶段校验，任何不一致 fail-closed。稳定入口只可原子切换，并保留当前和上一完整部署单元。

业务开始后，Profile、Schema、架构图、Context Map、CODEOWNERS、风险矩阵、SLO、Runbook、数据分类、遥测字典和存储清单必须同代码一并维护。测试至少覆盖 Domain（存在时）、Application、Contract/Mapper、Component/Integration、核心 E2E、a11y 和视觉回归；不得用 skip、retry、quarantine 或降低阈值规避失败。
