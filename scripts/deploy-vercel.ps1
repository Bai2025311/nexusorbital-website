# NexusOrbital Vercel一键部署脚本
# 用于Windows环境

Write-Host "=== NexusOrbital 认证系统部署助手 ===" -ForegroundColor Cyan
Write-Host "准备部署文件中..." -ForegroundColor Yellow

# 检查是否存在Node.js
try {
    $nodeVersion = node -v
    Write-Host "Node.js版本: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "未检测到Node.js，请先安装Node.js: https://nodejs.org" -ForegroundColor Red
    Write-Host "安装完成后重新运行此脚本" -ForegroundColor Red
    exit 1
}

# 检查是否存在Vercel CLI
try {
    $vercelVersion = & vercel -v
    Write-Host "Vercel CLI版本: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "未检测到Vercel CLI，正在安装..." -ForegroundColor Yellow
    npm install -g vercel
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Vercel CLI安装失败，请手动运行: npm install -g vercel" -ForegroundColor Red
        exit 1
    }
    Write-Host "Vercel CLI安装成功!" -ForegroundColor Green
}

# 确认所有必要文件都存在
Write-Host "检查必要文件..." -ForegroundColor Yellow

# 检查package.json是否存在
if (-not (Test-Path "package.json")) {
    Write-Host "创建package.json文件..." -ForegroundColor Yellow
    @'
{
  "name": "nexusorbital-auth",
  "version": "1.0.0",
  "description": "NexusOrbital Authentication System",
  "main": "server/vercel-entry.js",
  "engines": {
    "node": ">=16.x"
  },
  "scripts": {
    "start": "node server/auth-server.js",
    "dev": "nodemon server/auth-server.js",
    "test": "node server/test/api-test.js"
  },
  "dependencies": {
    "bcrypt": "^5.1.0",
    "body-parser": "^1.20.2",
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.0",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "axios": "^1.3.6",
    "chalk": "^4.1.2",
    "nodemon": "^2.0.22"
  }
}
'@ | Out-File -FilePath "package.json" -Encoding utf8
}

# 检查vercel.json是否存在
if (-not (Test-Path "vercel.json")) {
    Write-Host "创建vercel.json文件..." -ForegroundColor Yellow
    @'
{
  "version": 2,
  "builds": [
    { "src": "server/vercel-entry.js", "use": "@vercel/node" },
    { "src": "*.html", "use": "@vercel/static" },
    { "src": "css/**/*", "use": "@vercel/static" },
    { "src": "js/**/*", "use": "@vercel/static" },
    { "src": "img/**/*", "use": "@vercel/static" },
    { "src": "images/**/*", "use": "@vercel/static" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "server/vercel-entry.js" },
    { "src": "/", "dest": "/index.html" },
    { "src": "/login", "dest": "/login.html" },
    { "src": "/register", "dest": "/register.html" },
    { "src": "/auth-test", "dest": "/auth-test-page.html" },
    { "src": "/(.*)", "dest": "/$1" }
  ],
  "env": {
    "JWT_SECRET": "nexusorbital-secure-auth-token-2025",
    "TOKEN_EXPIRY": "24h"
  }
}
'@ | Out-File -FilePath "vercel.json" -Encoding utf8
}

# 检查server目录是否存在
if (-not (Test-Path "server")) {
    Write-Host "错误: server目录不存在，无法继续" -ForegroundColor Red
    exit 1
}

# 检查vercel-entry.js是否存在
if (-not (Test-Path "server\vercel-entry.js")) {
    Write-Host "创建Vercel入口文件..." -ForegroundColor Yellow
    @'
/**
 * Vercel部署入口点
 * 用于在Vercel平台上启动NexusOrbital认证系统
 */

const app = require("./auth-server");

// 导出处理函数供Vercel使用
module.exports = app;
'@ | Out-File -FilePath "server\vercel-entry.js" -Encoding utf8
}

Write-Host "`n所有文件已准备就绪!" -ForegroundColor Green
Write-Host "`n现在开始登录Vercel..." -ForegroundColor Cyan
vercel login

if ($LASTEXITCODE -ne 0) {
    Write-Host "错误: Vercel登录失败" -ForegroundColor Red
    exit 1
}

Write-Host "`n开始部署到Vercel..." -ForegroundColor Cyan
Write-Host "按照提示操作。通常选择默认选项并按Enter键继续即可。" -ForegroundColor Yellow

# 执行部署命令
vercel --prod

if ($LASTEXITCODE -ne 0) {
    Write-Host "错误: 部署失败" -ForegroundColor Red
    exit 1
}

Write-Host "`n===== 部署完成! =====" -ForegroundColor Cyan
Write-Host "您的NexusOrbital认证系统已成功部署到Vercel!" -ForegroundColor Green
Write-Host "请记录上方显示的URL地址，用于访问您的系统" -ForegroundColor Yellow
Write-Host "部署完成后，您可以通过访问[您的URL]/auth-test来测试API功能" -ForegroundColor Cyan

Write-Host "`n按任意键继续..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
