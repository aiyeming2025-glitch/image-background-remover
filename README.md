# Image Background Remover

MVP: Next.js + Tailwind 前端，调用 remove.bg API 去背景，返回透明 PNG。

## 运行
```bash
npm install
# 设置环境变量
export REMOVE_BG_KEY=your_removebg_api_key
npm run dev  # http://localhost:3000
```

## 架构
- `pages/index.js`：上传/预览/下载 UI，限制 10MB，JPG/PNG。
- `pages/api/remove.js`：服务端路由，转发到 remove.bg（使用 `REMOVE_BG_KEY`）。
- 样式：Tailwind（`styles/globals.css`）。

## 注意
- 部署时在环境变量中配置 `REMOVE_BG_KEY`，前端不暴露密钥。
- remove.bg 按量计费；文件大小默认限制 10MB。
```
