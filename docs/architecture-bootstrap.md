# Dify Agent 架构初始化状态

项目 `dify-agent` 正处于 `architecture-bootstrap` 状态：已搭建 browser SPA 的应用壳、Provider、Router、共享层、质量门禁与测试基线，但尚未实现任何业务能力。

该状态不是生产交付状态，也不是对业务架构事实的替代。当前不得创建模块、Gateway、Use Case、Domain、AuthAdapter、OpenAPI 生成物或运行时配置的虚假实现。

开始第一个业务能力前，必须在同一变更中完成以下事项：

1. 以真实 owner、API/OpenAPI digest、OIDC 参数、环境 Origin、数据分类和交付指标创建并严格校验 `architecture-profile.yaml`。
2. 将 `ARCHITECTURE.md` 的初始化约束替换为对应模块的真实实例化规则，并建立 requirements-risk-matrix、SLO、Runbook 和交付资产。
3. 注册 3–8 个具有稳定业务边界的模块；不能按技术目录或预期功能创建空模块。
4. 将 `profile:check` 从初始化状态校验切换为 Schema 的 Draft 2020-12 strict + formats 校验，并把该检查纳入 CI Required Check。

在上述条件满足前，项目只允许改变架构基座、开发工具链、测试基础设施和治理文档。

初始化期生产构建使用 gzip 首包预算：JavaScript 不超过 150 KiB、CSS 不超过 75 KiB。第一个真实 Profile 必须以其 `performance` 字段取代该临时基座预算，并增加路由 chunk 与 Core Web Vitals 预算。
