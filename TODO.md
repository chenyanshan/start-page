# BIFOLD Development TODO（Progress）

## Milestone 1: 项目基础搭建

- [x] 使用 `Vite + TypeScript` 初始化项目
- [x] 建立 `public` / `src` 目录结构
- [x] 创建 `README.md`、`PLAN.md`、`TODO.md`
- [x] 创建并接入 `public/data.json`
- [x] 完成 `npm run dev / build / preview` 基础脚本

## Milestone 2: 设计系统与基础样式

- [x] 拆分样式文件：`reset.css`、`tokens.css`、`base.css`、`layout.css`、`motion.css`、`responsive.css`
- [x] 建立全局字体、间距、圆角、动效 token
- [x] 完成深色系背景与多层渐变氛围
- [x] 接入全局焦点样式（`focus-visible`）
- [x] 接入 `prefers-reduced-motion` 降级策略

## Milestone 3: 桌面端布局（左底右覆层）

- [x] 实现 `split-shell` 作为统一底层容器
- [x] 实现左侧博客层作为底层面板
- [x] 实现右侧导航层覆盖在左侧之上
- [x] 右侧导航层保留四角圆角
- [x] 最底层背景改为直角（移除圆角）
- [x] 优化接缝，避免“左右硬分割”观感
- [x] 修正左侧边框到底部完整显示

## Milestone 4: 交互动效与视觉反馈

- [x] 实现背景光影跟随（基于 `--bg-x/--bg-y`）
- [x] 实现按钮 hover 提亮与扫光效果
- [x] 实现链接卡 hover 微位移和高亮反馈
- [x] 实现面板底部呼吸式柔光
- [x] 去除鼠标跟随磨砂白光特效（按当前需求）
- [x] 移除桌面端左右比例滑动（当前版本固定布局）

## Milestone 5: 内容与数据渲染

- [x] 定义导航类型：`navigation.ts`
- [x] 完成 `data.json` 读取与安全兜底
- [x] 完成博客面板渲染
- [x] 完成导航面板与链接列表渲染
- [x] 博客面板仅保留入口信息，不展示文章内容
- [x] 移除“打开导航主页”按钮展示
- [x] 全站中文文案统一

## Milestone 6: 移动端适配

- [x] 默认上下堆叠布局
- [x] 点击面板后全屏展开
- [x] 提供移动端返回按钮
- [x] 处理安全区与滚动行为
- [x] 修复桌面绝对定位对移动端布局的影响

## Milestone 7: 当前待迭代（下一步）

- [ ] 继续优化博客侧视觉比例，让“入口感”更强
- [ ] 微调右侧覆盖层阴影与边线，统一不同显示器观感
- [ ] 增加导航分组（如工具/实验/归档）并保持 JSON 驱动
- [ ] 增加 `featured` 项可选置顶策略
- [ ] 增加外链可访问性提示（例如“新窗口打开”语义）

## Milestone 8: 测试与上线

- [x] 本地构建验证（`npm run build`）
- [ ] 桌面端多浏览器验收（Chrome / Safari / Edge）
- [ ] 移动端真机验收（iOS / Android）
- [ ] Cloudflare Pages 首次部署
- [ ] 线上回归检查（样式、数据加载、跳转）
