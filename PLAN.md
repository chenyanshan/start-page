# BIFOLD Architecture & Design Plan（Current）

## 1. 产品目标

BIFOLD 的首页只做两件事：

- 提供博客入口（点击进入博客站点）。
- 提供 Vibe Coding 相关站点导航。

当前版本强调“左侧作为底层背景，右侧作为覆盖卡片”的层级关系，而不是传统对半分栏。

## 2. UI / UX 设计系统（已落地）

### 2.1 视觉基调

- 风格：极简、深色、轻毛玻璃质感。
- 结构：左侧底层承载整体氛围，右侧作为可交互主内容层。
- 对比：避免纯黑纯白，使用深灰蓝梯度提高耐看度。

### 2.2 色彩与层级

- 页面背景：多层径向渐变 + 深色线性渐变。
- 左侧博客层：`#303641 -> #242a34`。
- 右侧导航层：半透明深色渐变，叠加 `backdrop-filter: blur(...)`。
- 细边框：使用低透明度白线，避免重边框感。

### 2.3 圆角策略（当前决策）

- 最外层背景容器：直角（无圆角）。
- 左侧博客层：四角圆角。
- 右侧导航层：四角圆角，且视觉上覆盖在左层之上。

### 2.4 动效策略

- 全局过渡：`transform/opacity/background/border/box-shadow` 组合过渡。
- 按钮动效：轻微抬升 + 扫光。
- 链接卡片：hover 提亮 + 微位移。
- 面板底部：呼吸式柔光（`aura-breathe`）。
- 背景联动：鼠标移动时更新 `--bg-x/--bg-y`，形成缓动光影。
- 无障碍：`prefers-reduced-motion` 下大幅缩短动画。

## 3. 桌面端布局方案（已实现）

### 3.1 结构模型

- `split-shell` 作为统一底层容器。
- 两个 `.panel` 均采用绝对定位。
- 左侧博客层占据底层完整空间。
- 右侧导航层从 `--overlay-left: 20%` 开始覆盖到右边，形成“左底右覆层”。

### 3.2 关键视觉关系

- 左层的右边框去除，避免与右层边框形成双线。
- 右层保留完整四角圆角和独立投影。
- 接缝位置由右层自然盖住左层，视觉更像“卡片叠放”而非“分栏切开”。

### 3.3 内容策略

- 博客区只显示入口信息，不显示文章列表。
- 点击“进入博客”跳转到博客站点。
- 导航链接集中在右侧面板渲染。

## 4. 移动端方案（已实现）

- 条件：`(max-width: 959px), (hover: none), (pointer: coarse)`。
- 默认：上下两块堆叠（`1fr / 1fr`）。
- 点击“展开”后：目标面板 `position: fixed` 全屏展示。
- 返回按钮：固定在顶部安全区位置。
- 展开态：`body` 禁止滚动，面板内部可滚动。

## 5. 数据驱动方案（`public/data.json`）

### 5.1 数据结构

```json
{
  "meta": {
    "siteName": "我的导航",
    "tagline": "左侧博客，右侧导航",
    "owner": "Chen"
  },
  "panels": {
    "blog": {
      "theme": "dark",
      "eyebrow": "博客",
      "title": "我的博客",
      "description": "技术文章与项目记录入口。",
      "primary": {
        "label": "进入博客",
        "url": "https://blog.example.com"
      },
      "links": []
    },
    "vibe": {
      "theme": "light",
      "eyebrow": "导航",
      "title": "站点导航",
      "description": "常用项目、工具与实验站点入口。",
      "primary": {
        "label": "导航主页",
        "url": "https://labs.example.com"
      },
      "links": []
    }
  }
}
```

### 5.2 字段约束

- `theme`：`light | dark`
- `status`：`live | beta | private`
- `links` 为空时展示空态文案
- 数据缺失时自动回退到内置 fallback 数据

## 6. 目录结构

```txt
.
├─ public/
│  ├─ data.json
│  └─ favicon.svg
├─ src/
│  ├─ main.ts
│  ├─ app.ts
│  ├─ types/
│  │  └─ navigation.ts
│  ├─ scripts/
│  │  ├─ load-data.ts
│  │  ├─ render-panels.ts
│  │  ├─ interactions.ts
│  │  └─ state.ts
│  └─ styles/
│     ├─ reset.css
│     ├─ tokens.css
│     ├─ base.css
│     ├─ layout.css
│     ├─ motion.css
│     └─ responsive.css
├─ index.html
├─ README.md
├─ PLAN.md
└─ TODO.md
```

## 7. 下一步设计迭代建议

- 继续收敛博客侧信息密度，强化“入口感”而非“内容感”。
- 微调接缝线亮度，减少高亮边缘在不同屏幕上的突兀感。
- 为右侧导航卡片增加分组筛选或置顶逻辑（仍通过 JSON 驱动）。
