# BIFOLD

> One side writes. One side builds.

BIFOLD 是一个个人导航站：左侧是博客入口底层，右侧是覆盖其上的导航面板。项目使用纯静态前端实现，支持桌面与移动端，并通过 `public/data.json` 做数据驱动维护。

## 当前版本（已实现）

- 左侧为博客底层区域（深色系），不在导航页内展示文章内容。
- 右侧为悬浮覆盖式导航卡片（四角圆角），视觉上是“放在左侧之上”。
- 外层背景容器为直角，符合当前设计决策。
- 桌面端不再做左右 `50/50 -> 3/4` 滑动切换，布局固定稳定。
- 页面背景保留轻量鼠标位置联动光影（非鼠标跟随光斑）。
- 链接、按钮保留微动效与发光反馈。
- 移动端采用上下堆叠，点击某一侧可全屏展开并通过返回按钮退出。

## 技术栈

- `Vite`
- `TypeScript`
- `Vanilla CSS`
- `public/data.json`
- `Cloudflare Pages`

选择理由：

- 无后端依赖，部署和维护最简单。
- 样式与动效完全可控，适合高定制 UI。
- 数据结构清晰，新增导航项只改 JSON。

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 本地开发

```bash
npm run dev
```

默认地址：

```bash
http://localhost:5173
```

### 3. 生产构建

```bash
npm run build
```

### 4. 本地预览

```bash
npm run preview
```

## 数据维护（`public/data.json`）

- `panels.blog`：博客入口文案与按钮。
- `panels.vibe`：导航标题、描述、链接列表。
- 新增站点：在 `panels.vibe.links` 追加对象即可。

示例字段：

```json
{
  "name": "提示词实验室",
  "url": "https://prompt-lab.example.com",
  "description": "提示词实验与效率工具集合。",
  "tag": "工具",
  "status": "live",
  "featured": true
}
```

字段约束：

- `url` 建议使用完整 `https://` 地址。
- `status` 可选值：`live | beta | private`。
- 展示顺序由数组顺序决定。

## 部署到 Cloudflare Pages

### 方式一：连接 Git 仓库自动部署

1. 推送到 GitHub 或 GitLab。
2. 在 Cloudflare Pages 新建项目并连接仓库。
3. 使用以下构建配置：

```txt
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Node.js version: 20
```

4. 完成首次部署，后续推送自动更新。

### 方式二：手动部署

```bash
npm run build
```

将 `dist` 目录上传到 Cloudflare Pages 静态站点。

## 维护原则

- 首页只做入口，不做文章内容承载。
- 新增站点优先走 `data.json`，避免改渲染逻辑。
- 动效保持克制，优先服务层级与可读性。
