# SketchFlow（灵图）

SketchFlow 是一个面向产品与视觉设计流程的 AI 概念草图工作台。它支持记录灵感、优化设计需求、组合参考图、生成多方向概念方案、沉淀项目版本，并导出提案演示文稿。

## 仓库结构

- `site/`：可部署的 Web 应用
- `SketchFlow产品核心定义.md`：产品核心定义
- `遗产工程管理与修复知识问答助手PRD.md`：相关产品研究文档

应用使用 Next.js、React、vinext 和 Cloudflare Workers 兼容运行时构建。部署入口位于 `site/`。

## 本地运行

需要 Node.js `>=22.13.0`。

```bash
cd site
npm ci
cp .env.example .env.local
npm run dev
```

在 `site/.env.local` 中配置：

```dotenv
MOONSHOT_API_KEY=your_api_key
```

密钥仅由服务端 API 路由读取，不会打包到浏览器代码中。也可以使用 `OPENAI_API_KEY` 作为服务端回退变量，但当前生成接口仍调用 Moonshot API。

## 发布前验证

```bash
cd site
npm run lint
npm test
```

`npm test` 会执行生产构建并验证服务端渲染、主要创作流程以及服务端密钥边界。

## 部署

部署平台应将项目目录设置为 `site/`，使用 Node.js `>=22.13.0`，安装命令为 `npm ci`，构建命令为 `npm run build`。

运行环境必须配置 `MOONSHOT_API_KEY`，并允许服务端访问 `https://api.moonshot.cn`。不要提交 `.env.local`、构建目录、依赖目录或打包归档；这些内容已由仓库忽略规则排除。

项目已包含 `site/.openai/hosting.json`，可直接用于 OpenAI Sites 的后续版本发布。

### Netlify

仓库根目录的 `netlify.toml` 已为 Netlify 配置：

- 基础目录：`site`
- 构建命令：`npm run build:netlify`
- 发布目录：`.next`
- Node.js：24

Netlify 会使用其 OpenNext 适配器部署 Next.js 页面和 `/api/kimi` 服务端路由。部署前必须在 Netlify 项目的环境变量中配置 `MOONSHOT_API_KEY`，然后重新触发生产部署。
