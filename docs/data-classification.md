# 数据分类与浏览器存储清单

邮箱、显示名称与角色属于机密个人数据；密码和 token 属于 Secret。前端仅在 React/TanStack Query 内存中保存当前用户和 access token，不写入 localStorage、sessionStorage、IndexedDB 或可读 Cookie。refresh token 由 API 设置为 HttpOnly Cookie，前端代码不可读取。日志、遥测与错误界面不得记录凭据、token 或完整邮箱。
