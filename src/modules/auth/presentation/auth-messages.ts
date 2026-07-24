import { defineMessages } from "@/shared/i18n/message-catalog";

export const authMessages = defineMessages({
  admin: {
    "en-GB": "Super administrator",
    "zh-CN": "超级管理员",
  },
  adminDescription: {
    "en-GB":
      "You have system-level administrative access. Additional management capabilities will appear here as they become available.",
    "zh-CN": "你拥有系统级管理权限。后续管理能力会在这里逐步开放。",
  },
  displayName: {
    "en-GB": "Display name",
    "zh-CN": "显示名称",
  },
  email: {
    "en-GB": "Email",
    "zh-CN": "邮箱",
  },
  errors: {
    emailExists: {
      "en-GB": "This email is already registered. Sign in instead.",
      "zh-CN": "该邮箱已注册，请直接登录。",
    },
    invalidCredentials: {
      "en-GB": "The email or password is incorrect.",
      "zh-CN": "邮箱或密码不正确。",
    },
    rateLimited: {
      "en-GB": "Too many attempts. Please try again later.",
      "zh-CN": "尝试次数过多，请稍后再试。",
    },
    unavailable: {
      "en-GB": "The service is temporarily unavailable. Try again later.",
      "zh-CN": "服务暂时不可用，请稍后重试。",
    },
    validation: {
      "en-GB": "Check the information you entered.",
      "zh-CN": "请检查输入内容。",
    },
  },
  heroDescription: {
    "en-GB":
      "A clear and secure entry point that keeps your team focused on meaningful agent work.",
    "zh-CN": "一个清晰、安全的入口，让团队专注于真正重要的智能体工作。",
  },
  heroTitle: {
    "en-GB": "Welcome to your agent workspace",
    "zh-CN": "欢迎来到你的智能体工作台",
  },
  loading: {
    "en-GB": "Loading authentication…",
    "zh-CN": "正在加载认证页面…",
  },
  login: {
    description: {
      "en-GB": "Continue with your work email.",
      "zh-CN": "使用你的工作邮箱继续。",
    },
    submit: {
      "en-GB": "Sign in",
      "zh-CN": "登录",
    },
    switch: {
      "en-GB": "Need an account? Register now",
      "zh-CN": "还没有账号？立即注册",
    },
    title: {
      "en-GB": "Sign in",
      "zh-CN": "登录账号",
    },
  },
  logout: {
    "en-GB": "Sign out",
    "zh-CN": "退出登录",
  },
  member: {
    "en-GB": "Team member",
    "zh-CN": "团队成员",
  },
  memberDescription: {
    "en-GB": "Your account is ready. You can start using the workspace.",
    "zh-CN": "账号已就绪，你可以开始使用工作台。",
  },
  password: {
    "en-GB": "Password",
    "zh-CN": "密码",
  },
  register: {
    description: {
      "en-GB": "Create an account with a password of at least 12 characters.",
      "zh-CN": "创建账号，密码至少 12 位。",
    },
    submit: {
      "en-GB": "Create account",
      "zh-CN": "创建账号",
    },
    switch: {
      "en-GB": "Already have an account? Return to sign in",
      "zh-CN": "已经有账号？返回登录",
    },
    title: {
      "en-GB": "Register",
      "zh-CN": "注册账号",
    },
  },
  restoring: {
    "en-GB": "Restoring your secure session…",
    "zh-CN": "正在恢复安全会话…",
  },
  unavailable: {
    "en-GB":
      "The authentication service is temporarily unavailable. Refresh the page to try again.",
    "zh-CN": "暂时无法连接认证服务，请刷新页面重试。",
  },
  validation: {
    displayName: {
      "en-GB": "Enter a name between 1 and 80 characters.",
      "zh-CN": "请输入 1–80 个字符的名称。",
    },
    email: {
      "en-GB": "Enter a valid email address.",
      "zh-CN": "请输入有效的邮箱地址。",
    },
    password: {
      "en-GB": "Registration passwords must contain at least 12 characters.",
      "zh-CN": "注册密码至少 12 位。",
    },
  },
  welcome: {
    "en-GB": "Hello, {{name}}",
    "zh-CN": "你好，{{name}}",
  },
});
