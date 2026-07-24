import { defineMessages } from "~/shared/i18n/message-catalog";

export const authenticatedHomeMessages = defineMessages({
  brand: {
    "en-GB": "Dify Agent",
    "zh-CN": "Dify Agent",
  },
  composerLabel: {
    "en-GB": "Message your agent",
    "zh-CN": "向智能体发送消息",
  },
  composerPlaceholder: {
    "en-GB": "Ask anything, plan a task, or explore an idea…",
    "zh-CN": "提出问题、规划任务，或探索一个新想法…",
  },
  eyebrow: {
    "en-GB": "Your agent workspace",
    "zh-CN": "你的智能体工作台",
  },
  modelLabel: {
    "en-GB": "Model",
    "zh-CN": "模型",
  },
  modelOptions: {
    balanced: {
      "en-GB": "Balanced",
      "zh-CN": "均衡模型",
    },
    fast: {
      "en-GB": "Fast",
      "zh-CN": "快速模型",
    },
    reasoning: {
      "en-GB": "Reasoning",
      "zh-CN": "推理模型",
    },
  },
  send: {
    "en-GB": "Send message",
    "zh-CN": "发送消息",
  },
  staticNotice: {
    "en-GB": "Conversation support is coming next. Your draft is still here.",
    "zh-CN": "对话能力将在下一阶段接入，你的草稿仍保留在输入框中。",
  },
  subtitle: {
    "en-GB": "Bring a question. Leave with a clearer next step.",
    "zh-CN": "从一个问题出发，把下一步想清楚。",
  },
  title: {
    "en-GB": "What can we work through, {{name}}?",
    "zh-CN": "{{name}}，今天想一起解决什么？",
  },
});
