# MVP 需求文档：Image Background Remover（Cloudflare + remove.bg）

## 1. 目标
- 提供网页版一键抠图：上传图片 → 返回透明背景 PNG。
- 全程无存储，内存转发 remove.bg API。
- 首版在 Cloudflare Workers/Pages 上线，移动端友好。

## 2. 角色与场景
- 访客用户：打开页面，上传/拖拽图片，预览结果，下载 PNG。
- 运营：配置 remove.bg API Key（Worker Secret），监控用量。

## 3. 功能范围（MVP）
- 上传：支持 JPG/PNG，大小限制（默认 <10MB）。
- 处理：调用 remove.bg API，返回透明背景 PNG。
- 预览/下载：结果图浏览，点击下载。
- 错误提示：文件缺失、超限、API 返回错误码提示。
- CORS：允许前端跨域访问 Worker。
- 基础限流（可选）：简单速率限制，防滥用。

不做：账号体系、历史记录、队列任务、批处理。

## 4. 用户流程
1) 进入页面。
2) 选择/拖拽图片（前端校验格式、大小）。
3) 点击“去背景” → 调用 `/api/remove`。
4) 显示 loading，收到结果后展示预览，提供“下载 PNG”按钮。
5) 可重新上传，重复步骤。

## 5. 接口设计
- `POST /api/remove`
  - 请求：`multipart/form-data`，字段 `image` (File)；可选 `size=auto`、`bg_color`。
  - 响应：`200 image/png`；错误返回文本和 HTTP 状码。
  - 头：Worker 转发时加 `X-Api-Key: <REMOVE_BG_KEY>`。
- CORS：`Access-Control-Allow-Origin: *`（或指定域名）。

## 6. 技术方案
- 前端：静态页（Cloudflare Pages），HTML/JS/少量 CSS，支持移动端。
- 后端：Cloudflare Worker（TypeScript）。
  - 读取 multipart，转发 remove.bg API，返回 PNG。
  - 无磁盘存储，全内存处理。
- 配置：`REMOVE_BG_KEY` 作为 Worker Secret；可选自定义域 `bg.example.com`。

## 7. 校验与约束
- 前端校验：类型（jpg/png），大小 <10MB。
- Worker 防呆：无文件 → 400；API 非 200 → 透传错误文本。
- 性能：单张处理时延取决于 remove.bg（通常 <3s）。

## 8. 安全与滥用防护（MVP 轻量）
- 隐藏 API Key 在 Worker，不在前端暴露。
- 简单限流（可选）：基于 IP 的令牌桶；或返回 429。
- 上传大小限制，拒绝超大文件。

## 9. 文案与体验
- 按钮：“选择图片 / 拖拽到此” → “去背景”。
- 状态：处理中… / 完成 / 错误提示。
- 结果：预览 + “下载 PNG”按钮。

## 10. 交付物
- `wrangler.toml`（绑定 secret）。
- Worker 源码（TypeScript）。
- 前端静态页（HTML/JS/CSS）。
- README：部署步骤、环境变量、测试方法（curl）。

## 11. 测试用例（示例）
- 正常：上传 800x600 JPG，返回 200 PNG。
- 错误：不带文件 → 400；超大文件 → 前端拦截/后端 413。
- API 错误：伪造 Key → 返回 remove.bg 错误文本。
- CORS：跨域 fetch 成功。

## 12. 时间预估
- 开发：后端 Worker 0.5 天，前端页 0.5 天。
- 测试与部署：0.5 天。
- 总计：~1.5 天可上线 MVP。
