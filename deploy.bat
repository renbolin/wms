@echo off
echo ========================================
echo        React Admin 一键部署工具
echo ========================================
echo.

:menu
echo 请选择部署方式：
echo 1. Vercel 部署（推荐）
echo 2. Netlify 部署
echo 3. Docker 本地部署
echo 4. 仅构建项目
echo 5. 退出
echo.
set /p choice=请输入选项 (1-5): 

if "%choice%"=="1" goto vercel
if "%choice%"=="2" goto netlify
if "%choice%"=="3" goto docker
if "%choice%"=="4" goto build
if "%choice%"=="5" goto exit
echo 无效选项，请重新选择
goto menu

:vercel
echo.
echo 正在部署到 Vercel...
echo 检查 Vercel CLI...
where vercel >nul 2>&1
if errorlevel 1 (
    echo 未找到 Vercel CLI，正在安装...
    npm install -g vercel
)
echo 开始部署...
npm run deploy:vercel
goto end

:netlify
echo.
echo 正在部署到 Netlify...
echo 检查 Netlify CLI...
where netlify >nul 2>&1
if errorlevel 1 (
    echo 未找到 Netlify CLI，正在安装...
    npm install -g netlify-cli
)
echo 开始部署...
npm run deploy:netlify
goto end

:docker
echo.
echo 正在使用 Docker 部署...
echo 检查 Docker...
where docker >nul 2>&1
if errorlevel 1 (
    echo 未找到 Docker，请先安装 Docker Desktop
    pause
    goto menu
)
echo 启动 Docker 容器...
docker-compose up -d
echo Docker 部署完成！访问 http://localhost:3000
goto end

:build
echo.
echo 正在构建项目...
npm run build:prod
echo 构建完成！文件位于 dist 目录
goto end

:end
echo.
echo 部署完成！
pause
goto menu

:exit
echo 感谢使用！
pause