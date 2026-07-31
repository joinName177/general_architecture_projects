---
name: html-page-reverse-ui-analysis
description: Reverse-engineers HTML pages across 12 structured dimensions (metadata, DOM, components, visuals, colors, typography, design style, interaction, responsive/a11y, dependencies, code quality, templates, reusability) and outputs a consolidated AI-ready UI prompt. Use when the user pastes or attaches HTML for analysis, asks to reverse a webpage for UI/code recreation, clone a page structure, or wants a structured prompt for GPT/Copilot/UI generators.
---

# HTML 网页逆向分析（全维度 → 一键 UI 提示词）

## 何时使用

用户在以下场景触发本技能：

- 提供完整或片段 HTML，要求「分析页面 / 逆向 / 还原 UI / 生成组件描述」
- 需要把静态 HTML 转成可喂给 AI 的**单一高质量提示词**（复现布局与风格）
- 需要按专业维度做**结构化拆解**（不仅写代码，还要文档化）

## 角色设定

以**网页分析师 + 前端架构**视角工作：从 HTML（及内联/外链样式、脚本线索）推断结构、UI、视觉、交互与可复用抽象，输出标准化描述。

## 工作流程

1. **确认输入**：若用户未贴 HTML，请其提供完整源码（或主要 `body` + 关键 `head` 引用）。
2. **通读源码**：扫描 `head`（title、meta、link、script）、`body` 层级、class/id 规律、明显框架痕迹（Bootstrap、Tailwind、Vue/React 挂载点等）。
3. **按维度输出**：严格按 [reference.md](reference.md) 中 **12 个维度**顺序输出，每维信息尽量具体（含示例中的组件块格式）。
4. **最终提示词**：在 12 维之后，单独给出「**最终生成提示词**」一节：一段完整、可直接复制到 GPT/Copilot/UI 工具的**中文或中英混合**描述（按用户语言偏好；默认中文），嵌入本页分析得到的风格、主色、字体、区域结构、技术栈建议。
5. **缺失信息**：无法从 HTML 推断的项（如精确 HEX、真实字体文件）标注「未在源码中体现，推断为…」或「需设计稿确认」。

## 输出语言

- 分析正文与用户一致：用户用中文则**全中文**（保留必要英文技术名如 Navbar、ARIA）。
- 代码块、类名、标签名保持原文。

## 最终提示词模板结构（须填充分析结果）

```
请生成一个网页，整体风格为{{视觉风格}}，主色调为{{主色}}，字体为{{字体}}。
页面包含：
- …（按本页实际结构列出区域与组件）
使用 {{建议技术栈}}，具备响应式与{{动效摘要}}。
```

## 附加资源

- 12 维逐项说明、组件列表格式、输入示例：见 [reference.md](reference.md)
