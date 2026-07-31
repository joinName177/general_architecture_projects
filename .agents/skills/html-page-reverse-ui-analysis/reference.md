# HTML 逆向分析 — 12 维度详细模板

以下为用户要求的全维度输出规范；执行分析时按序号 **1→12** 完整覆盖，最后输出「最终生成提示词」。

---

## 1. 页面基础信息（Page Metadata）

- 页面标题（`<title>`）
- 页面用途类型（如：登录页 / 仪表盘 / 电商首页 / 文章详情页）
- 技术栈线索（Bootstrap、Tailwind、React、Vue、jQuery、Font Awesome 等）

---

## 2. 页面结构层级（DOM Hierarchy）

- 主结构：Header、Main、Sidebar、Footer 等
- 语义标签使用情况（`<nav>`、`<section>` 等）
- 层级：缩进或树状表示嵌套

---

## 3. 关键 UI 组件列表（UI Components）

逐条列出主要组件，格式示例：

```
组件名称：导航栏（Navbar）
元素类型：<nav>, <ul>, <li>
位置：页面顶部
功能描述：包含 Logo、菜单项、用户头像
样式信息：使用类名 navbar navbar-light bg-light
交互行为：悬停高亮，点击菜单跳转
```

---

## 4. 页面视觉元素（Visual Elements）

- 图标：Font Awesome、SVG、iconfont 等
- 图片：数量、位置、功能（装饰 / 内容）
- 分隔线、色块、背景图形等装饰

---

## 5. 色彩系统（Color Palette）

- 主色（Primary）：HEX/RGB + 语义（如科技蓝）
- 辅助色 / 中性色
- 按钮、卡片、文本、边框等用色
- 背景与字色对比度与可读性简评

---

## 6. 字体与排版（Typography）

- 字体家族（Roboto、Inter、微软雅黑等）
- 标题 / 正文 / 注释字号
- 字重、行高
- 系统字体 / Google Fonts / 自定义字体线索

---

## 7. 视觉风格总结（Design Style）

2～3 个关键词 + 依据，可参考：

扁平化、极简、Neumorphism、Material Design、商务专业、游戏化/活力感等。

---

## 8. 动效与交互行为（Interaction & UX）

- 悬停 / 点击 / 聚焦状态
- 动画（过渡、渐显、滑入、骨架屏、加载动画）
- 弹窗、下拉、模态框
- 表单验证、按钮反馈等

---

## 9. 响应式与适配性（Responsiveness & A11y）

- media query、flex、grid 等布局手段
- 移动端：viewport、元素显隐或替换
- 无障碍：ARIA、键盘导航、对比度

---

## 10. 第三方资源依赖（External Dependencies）

- CDN / 本地 JS、CSS 框架
- 图标库、字体库、插件（AOS、Swiper 等）
- 嵌入服务（地图、视频、图表等）

---

## 11. 代码规范与可维护性（Code Quality）

- 命名规范（BEM、kebab-case 等）
- 嵌套过深、冗余、无用样式
- 注释与结构标注
- HTML 语法与语义合规性

---

## 12. 数据驱动、模板语法与组件复用（Dynamic Content & Reusability）

**模板与数据**

- 占位符（`{{}}`、`<%= %>`、`v-for`、`props` 等）
- 与后端或数据绑定相关的痕迹
- 可重构为 React/Vue/Tailwind 组件的说明

**复用与抽象**（与第 3 维呼应，偏抽象层）

- 重复结构（卡片、按钮列表等）
- 可抽象为函数式/声明式组件的方式
- 参数化建议（如 Card：`image, title, content, buttonText`）

---

## 最终生成提示词（用于 GPT / Sora / Copilot / UI 生成）

基于以上分析，输出**一句/一段完整**的提示词，便于 AI 复现页面。结构参考：

```
请生成一个网页，整体风格为{{视觉风格}}，主色调为{{主色}}，字体为{{字体}}。
页面包含：
- 顶部导航栏：Logo、菜单、搜索框、用户头像
- 主区域：卡片组件列表，每张卡片含图、标题、按钮
- 底部：版权信息与社交图标
使用 Tailwind + React，具备响应式与轻动画效果。
```

（将示例中的列表替换为本 HTML 实际分析结果。）

---

## 输入要求（给用户/调用方）

分析对象应为完整 HTML 源码，例如：

```html
以下是 HTML 文件源码：
<!DOCTYPE html>
<html>
  <head>
    ...
  </head>
  <body>
    <nav class="navbar">...</nav>
    <main>...</main>
  </body>
</html>
```
