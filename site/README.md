# SketchFlow Web 应用

这是 SketchFlow（灵图）的可部署 Web 应用。完整的项目说明、运行方式和部署要求见仓库根目录 `README.md`。

## 常用命令

```bash
npm ci
npm run dev
npm run lint
npm test
```

- `npm run dev`：启动本地开发服务器
- `npm run build`：生成 Cloudflare Workers 兼容的生产构建
- `npm run build:netlify`：生成 Netlify 使用的 Next.js 生产构建
- `npm run lint`：执行静态检查
- `npm test`：生产构建后执行端到端服务端渲染与功能边界检查

## 环境变量

复制 `.env.example` 为 `.env.local`，并配置 `MOONSHOT_API_KEY`。部署时在托管平台的运行环境中设置同名密钥，不要把真实密钥提交到 Git。

## 部署约束

- Node.js `>=22.13.0`
- 安装命令：`npm ci`
- 构建命令：`npm run build`
- 应用目录：本目录（仓库中的 `site/`）
- 运行时需要访问 Moonshot API

`.openai/hosting.json` 是 OpenAI Sites 的部署描述文件；`vite.config.ts` 保留了 Sites 与 Cloudflare Worker 的构建集成。

从 Git 仓库部署到 Netlify 时使用根目录 `netlify.toml`，Netlify 将自动从本目录执行 `npm run build:netlify`。
