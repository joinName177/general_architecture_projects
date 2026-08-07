# Apple Design UI 规范

> 来源：Apple Developer 设计页（developer.apple.com/cn/design/）
> 提取日期：2026-08-07
> 视口：912×715 / DPR 2 / 浅色模式
> 原始报告：`docs/apple-design-ui-style-report.html`
> 色彩适配：Calm Precision（冷灰工作台）—— 以冷白画布、白色编辑表面与浅 slate 工作区建立稳定层级

本文件是项目的 UI 设计规范唯一事实源。所有 CSS Token、组件样式和布局节奏必须符合本规范。

---

## 1. 设计哲学

**安静的精确感，柔和的表面，清晰的工作层级。**

- 以冷白画布、白色编辑表面和浅 slate 灰工作区构成三层界面
- 依靠字号、留白和图片而非描边或阴影建立层级
- 不用投影区分卡片——用背景色差（`#F8F9FB` / `#EFF1F4` 交替）
- 毛玻璃保留给需要悬浮可读性的导航、认证入口和 Agent 工作区的分层表面；不扩散到普通业务卡片
- 蓝色作为唯一交互色，焦点态清晰但不喧宾夺主

---

## 2. 颜色令牌

> 本项目采用 **Calm Precision** 色板：冷白画布承载全局布局，白色编辑表面承载输入与阅读，浅 slate 灰承载控制区与辅助区域。认证入口与 Agent 工作区共享柔和彩色光场；前者使用玻璃表单，后者仅在抽屉、聊天容器与输入控件使用克制的半透明表面。

### 2.1 基础色板（科技灰 · 浅色）

| Token              | 值                          | 用途                                     |
| ------------------ | --------------------------- | ---------------------------------------- |
| `--ink`            | `#15171C`                   | 主文本 / 深色表面背景                    |
| `--ink-secondary`  | `#454A53`                   | 次级文本                                 |
| `--ink-tertiary`   | `#626B77`                   | 三级文本、占位符、caption                |
| `--link`           | `#005EA8`                   | 正文内链接                               |
| `--action`         | `#0071E3`                   | 唯一的按钮与选中色                       |
| `--paper`          | `#F7F8FA`                   | 页面底色（冷白画布）                     |
| `--fill`           | `#FFFFFF`                   | 白色编辑表面（输入、聊天、Agent 工作面） |
| `--fill-secondary` | `#EEF1F4`                   | 浅灰工作区（卡片、控制区）               |
| `--fill-tertiary`  | `#E5E9EE`                   | 悬停与次级选中填充                       |
| `--glass`          | `rgba(244, 246, 249, 0.82)` | 毛玻璃导航背景                           |
| `--hairline`       | `rgba(0, 0, 0, 0.08)`       | 分割线                                   |
| `--focus-ring`     | `rgba(255, 255, 255, 0.72)` | 透明白焦点环                             |

认证入口附加语义 Token：

| Token                              | 用途                   |
| ---------------------------------- | ---------------------- |
| `--color-surface-auth-canvas`      | 静态柔彩登录背景       |
| `--color-surface-auth-glass`       | 登录玻璃卡片           |
| `--color-surface-auth-input`       | 玻璃输入控件默认表面   |
| `--color-surface-auth-input-hover` | 输入悬停表面           |
| `--color-border-auth-glass`        | 玻璃表面高光描边       |
| `--color-surface-workspace-canvas` | 主页与 Agent 柔彩背景  |
| `--color-surface-workspace-glass`  | Agent 分层玻璃表面     |
| `--color-border-focus`             | 透明白焦点边框与焦点环 |

### 2.2 暗色模式（科技灰 · 深色）

| Token              | 值                          |
| ------------------ | --------------------------- |
| `--ink`            | `#E6E8ED`                   |
| `--ink-secondary`  | `#9B9FAA`                   |
| `--ink-tertiary`   | `#646974`                   |
| `--link`           | `#2997FF`                   |
| `--action`         | `#2997FF`                   |
| `--paper`          | `#0C0E12`                   |
| `--fill`           | `#171A20`                   |
| `--fill-secondary` | `#22262D`                   |
| `--fill-tertiary`  | `#2B3038`                   |
| `--glass`          | `rgba(20, 23, 29, 0.84)`    |
| `--hairline`       | `rgba(255, 255, 255, 0.10)` |

---

## 3. 字体与排版

### 3.1 字体栈

- **Display（标题）**: `"SF Pro SC", "SF Pro Display", "PingFang SC", "Helvetica Neue", Arial, sans-serif`
- **Body（正文）**: `"SF Pro SC", "SF Pro Text", "PingFang SC", "Helvetica Neue", Arial, sans-serif`
- **Mono（代码）**: `"SF Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace`

### 3.2 字号阶梯

| 角色        | 字号                     | 行高        | 字重    | 用途              |
| ----------- | ------------------------ | ----------- | ------- | ----------------- |
| Hero 大标题 | `clamp(44px, 7vw, 76px)` | 1.02        | 600     | 首页主标题        |
| 章节标题    | 32px                     | 39px        | 600     | section 标题      |
| 卡片标题    | 28px                     | 35px        | 600     | 卡片、Hero 副标题 |
| 引导正文    | 21px                     | 29px        | 400     | 引言、摘要        |
| 正文        | 17px                     | 25px (1.47) | 400     | 正文段落          |
| 导航/页脚   | 12px                     | 16px        | 400-600 | 导航、标签、页脚  |

### 3.3 排版规则

- 只使用 **2 个字重**：400（正文）和 600（标题）
- 正文字距为 `normal`；标题仅轻微正字距
- 强调方式：**字号 + 留白**，而非多色或阴影
- `-webkit-font-smoothing: antialiased` 全局开启

---

## 4. 间距

| Token             | 值                               | 用途            |
| ----------------- | -------------------------------- | --------------- |
| `--space-section` | 68px (`4.25rem`)                 | 章节上下内边距  |
| 卡片间距          | 24px (`1.5rem`)                  | 卡片网格 gap    |
| 内容区最大宽      | `min(1080px, calc(100% - 48px))` | 主内容区 + 导航 |
| 小屏内容宽        | `min(100% - 32px, 680px)`        | ≤820px 视口     |

---

## 5. 圆角、边框与阴影

| 元素     | 值                                          |
| -------- | ------------------------------------------- |
| 内容卡片 | `border-radius: 18px`                       |
| 小型容器 | `border-radius: 10px / 12px`                |
| 胶囊按钮 | `border-radius: 980px`                      |
| 常规边框 | 无（按钮保留 1px transparent / `--action`） |
| 阴影     | `box-shadow: none`（禁止卡片投影）          |

**核心原则：无边框、无阴影、统一圆角。形体依靠背景色差区分。**

---

## 6. 毛玻璃（Glass）

**用于需要悬浮可读性的导航、认证入口的表单卡片与输入控件，以及 Agent 抽屉和聊天容器**；不用于按钮或普通业务卡片。

```css
.glass {
  background: rgba(244, 246, 249, 0.82);
  backdrop-filter: saturate(1.8) blur(20px);
  -webkit-backdrop-filter: saturate(1.8) blur(20px);
}
```

- 暗色模式：`background: rgba(20, 23, 29, 0.84)`
- 典型高度：52px（本地导航）、44px（全局导航）
- 认证页：卡片采用单一玻璃背景，不使用局部高光色块；移除非必要的辅助说明，简介为主信息
- Agent：主页背景沿用同一光场，抽屉与聊天容器使用更低透明度的玻璃表面
- 焦点态：所有可聚焦控件使用 3px `--focus-ring`；输入的焦点边框使用 `--color-border-focus`（透明白）

---

## 7. 可复用 CSS 模式

### 7.1 标准卡片

```css
.card {
  background: var(--fill); /* #EFF1F4 */
  border: 0;
  border-radius: 18px;
  box-shadow: none;
  overflow: hidden;
  padding: 36px; /* 桌面端 */
}
```

### 7.2 深色媒体卡片

```css
.card--dark {
  color: #e6e8ed;
  background: #121418;
}
```

### 7.3 毛玻璃导航

```css
.glassbar {
  position: sticky;
  top: 0;
  z-index: 20;
  height: 52px;
  background: var(--glass);
  backdrop-filter: saturate(1.8) blur(20px);
  -webkit-backdrop-filter: saturate(1.8) blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}
```

### 7.4 胶囊按钮

```css
.button {
  color: #ffffff;
  background: var(--action);
  border: 1px solid transparent;
  border-radius: 980px;
  padding: 6px 12px;
}
```

### 7.5 章节布局

```css
.section {
  padding-block: 68px;
  border-bottom: 1px solid var(--hairline);
}
```

### 7.6 标签（Pill）

```css
.pill {
  padding: 6px 12px;
  border-radius: 980px;
  background: var(--fill);
  color: var(--ink-secondary);
  font-size: 12px;
}
```

---

## 8. 布局区域映射

Apple Developer 页面的 5 区结构：

| 区域            | 规格                                     |
| --------------- | ---------------------------------------- |
| **01 / 导航**   | 44px 全局导航 + 52px 本地导航（毛玻璃）  |
| **02 / 首屏**   | Hero 区，标题使用 clamp 大字号           |
| **03 / 功能区** | 两列卡片网格，gap 24px，单卡约 334px     |
| **04 / 内容区** | 章节 padding-block: 68px，标题 32/39 600 |
| **05 / 页脚**   | `--fill` 浅灰底，12/16 小字号            |

---

## 9. 交互规范

- **焦点态**：`outline: 3px solid rgba(255, 255, 255, 0.72); outline-offset: 3px`
- **链接**：`color: #0066CC`（暗色 `#2997FF`），不使用下划线装饰
- **按钮 hover**：颜色加深 + 轻微发光（`box-shadow: 0 2px 8px rgba(0, 113, 227, 0.28)`）
- **按钮 pressed**：scale(0.985)，持续 80ms
- **过渡**：颜色和透明度使用 200ms ease
- **动效**：`@media (prefers-reduced-motion: reduce)` 关闭所有动画

---

## 10. 设计红线（禁止事项）

| 禁止                 | 原因                                    |
| -------------------- | --------------------------------------- |
| 给每张卡片加投影     | Apple 风格用色差而非阴影区分层级        |
| 在非按钮元素使用描边 | 描边仅限玻璃表面分层和焦点态            |
| 滥用毛玻璃           | 玻璃只用于导航、认证与 Agent 工作区     |
| 内容层级使用彩色     | 层级优先使用中性色（冷白/slate 灰交替） |
| `!important` 覆盖    | 依赖 Token 层级而非特异性               |
| 高特异性选择器       | 保持 CSS 扁平可维护                     |

---

## 11. 响应式断点

| 断点   | 行为                                 |
| ------ | ------------------------------------ |
| >820px | 完整两列布局，4 列色板网格           |
| ≤820px | 单列布局，2 列色板，隐藏表格第三列   |
| ≤480px | 单列色板，减小内边距，隐藏导航副标题 |

---

## 12. Token 实现位置

- 原始调色板 + 语义 Token：`src/styles/tokens.css`
- 全局重置 + 基础样式：`src/styles/theme.css`
- 组件样式：各模块 `*.module.css`，只消费语义 Token

所有新增 UI 必须先阅读本规范，确保颜色、字号、圆角、间距均从 Token 系统中取值，不得硬编码色值或字号。
