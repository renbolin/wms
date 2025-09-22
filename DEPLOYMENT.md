# 一键部署指南

本项目支持多种部署方式，您可以根据需要选择最适合的部署方案。

## 🚀 快速部署选项

### 1. Vercel 部署（推荐）

**一键部署：**
```bash
npm run deploy:vercel
```

**手动部署：**
1. 安装 Vercel CLI：`npm i -g vercel`
2. 登录：`vercel login`
3. 部署：`vercel --prod`

**GitHub 集成：**
1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 自动部署完成

### 2. Netlify 部署

**一键部署：**
```bash
npm run deploy:netlify
```

**手动部署：**
1. 安装 Netlify CLI：`npm i -g netlify-cli`
2. 登录：`netlify login`
3. 部署：`netlify deploy --prod --dir=dist`

**拖拽部署：**
1. 运行 `npm run build:prod`
2. 将 `dist` 文件夹拖拽到 [Netlify](https://netlify.com)

### 3. Docker 部署

**一键启动：**
```bash
docker-compose up -d
```

**手动构建：**
```bash
# 构建镜像
docker build -t react-admin .

# 运行容器
docker run -d -p 3000:80 react-admin
```

## 📋 部署前准备

### 环境要求
- Node.js 18+
- npm 或 yarn

### 构建检查
```bash
# 安装依赖
npm install

# 代码检查
npm run lint

# 生产构建
npm run build:prod

# 本地预览
npm run preview
```

## 🔧 配置说明

### 环境变量
创建 `.env.production` 文件：
```env
VITE_API_BASE_URL=https://your-api.com
VITE_APP_TITLE=React Admin
```

### 构建优化
项目已配置：
- TypeScript 编译检查
- ESLint 代码检查
- Vite 构建优化
- 静态资源缓存

## 🌐 部署平台对比

| 平台 | 优势 | 适用场景 |
|------|------|----------|
| **Vercel** | 零配置、CDN、自动HTTPS | 个人项目、快速原型 |
| **Netlify** | 表单处理、函数计算 | 静态站点、JAMstack |
| **Docker** | 完全控制、可移植 | 企业部署、私有云 |

## 🚨 常见问题

### 构建失败
```bash
# 清理缓存
npm run clean
npm run reinstall
```

### 路由问题
- SPA 路由已在配置文件中处理
- 确保服务器支持 History API

### 性能优化
- 启用 gzip 压缩
- 配置静态资源缓存
- 使用 CDN 加速

## 📞 技术支持

如遇到部署问题，请检查：
1. Node.js 版本是否符合要求
2. 依赖是否正确安装
3. 构建是否成功完成
4. 网络连接是否正常

---

选择任一方式，即可实现一键部署！🎉