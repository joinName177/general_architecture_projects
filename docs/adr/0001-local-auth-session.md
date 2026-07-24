# ADR 0001：本地认证会话

- 状态：已接受
- 日期：2026-07-24

首个业务能力需要注册、登录与内置超级管理员，而当前没有可用的 OIDC Provider。前端因此采用后端本地凭据认证：短期 access token 只在内存保存，长期 refresh token 仅由 HttpOnly Cookie 承载；页面启动通过刷新端点恢复会话，不使用 localStorage、sessionStorage 或可读 Cookie 保存 token。

所有请求由唯一 `HttpClient` 发出，携带 `credentials: include`，并通过生成的 Zod Schema 校验响应。运行时配置锁定 OpenAPI contract id 与 SHA-256，不一致时拒绝启动。未来接入 OIDC 时须建立新 ADR 并迁移 `AuthGateway` Adapter，presentation 不感知身份协议。
