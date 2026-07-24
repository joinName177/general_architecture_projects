# 认证故障 Runbook

1. 本地启动提示 Runtime Config 无效时运行 `pnpm runtime-config:check`；若配置缺失或契约过期，运行 `pnpm runtime-config:init` 后重新启动。初始化保留已有 API 地址和 release id。
2. 检查 `/api/v1/livez`、`/readyz` 与 `/version`，确认版本中的 contract id/digest 与前端 Runtime Config 一致。
3. 检查浏览器网络请求的 Origin、CORS 响应与 refresh Cookie 属性；禁止复制 token 到工单或聊天。
4. 401 激增时区分登录失败、refresh 过期和会话撤销；429 激增时检查恶意流量与限流配置。
5. 若管理员无法登录，确认 Secret 已注入且数据库中该邮箱角色为 `super_admin`；不得直接改密码哈希或提升普通账号。
6. 回滚时切换到上一完整静态制品，同时确保其 OpenAPI digest 与仍在运行的 API 兼容。
