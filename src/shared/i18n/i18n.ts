import i18n from "i18next";
import { initReactI18next } from "react-i18next";

void i18n.use(initReactI18next).init({
  fallbackLng: "zh-CN",
  interpolation: {
    escapeValue: false,
  },
  lng: "zh-CN",
  resources: {
    "zh-CN": {
      translation: {
        auth: {
          admin: "超级管理员",
          adminDescription:
            "你拥有系统级管理权限。后续管理能力会在这里逐步开放。",
          displayName: "显示名称",
          email: "邮箱",
          errors: {
            emailExists: "该邮箱已注册，请直接登录。",
            invalidCredentials: "邮箱或密码不正确。",
            rateLimited: "尝试次数过多，请稍后再试。",
            unavailable: "服务暂时不可用，请稍后重试。",
            validation: "请检查输入内容。",
          },
          heroDescription:
            "一个清晰、安全的入口，让团队专注于真正重要的智能体工作。",
          heroTitle: "欢迎来到你的智能体工作台",
          login: {
            description: "使用你的工作邮箱继续。",
            submit: "登录",
            switch: "还没有账号？立即注册",
            title: "登录账号",
          },
          loading: "正在加载认证页面…",
          logout: "退出登录",
          member: "团队成员",
          memberDescription: "账号已就绪，你可以开始使用工作台。",
          password: "密码",
          register: {
            description: "创建账号，密码至少 12 位。",
            submit: "创建账号",
            switch: "已经有账号？返回登录",
            title: "注册账号",
          },
          restoring: "正在恢复安全会话…",
          unavailable: "暂时无法连接认证服务，请刷新页面重试。",
          validation: {
            displayName: "请输入 1–80 个字符的名称。",
            email: "请输入有效的邮箱地址。",
            password: "注册密码至少 12 位。",
          },
          welcome: "你好，{{name}}",
        },
      },
    },
  },
});

export { i18n };
