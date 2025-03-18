#!/bin/bash
# Vercel部署辅助脚本
echo "=== NexusOrbital 认证系统部署助手 ==="
echo "准备部署文件中..."

# 检查是否存在package.json
if [ -f "package.json" ]; then
  echo "找到package.json文件，继续..."
else
  echo "创建package.json文件..."
  echo '{
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
}' > package.json
fi

# 检查是否存在vercel.json
if [ -f "vercel.json" ]; then
  echo "找到vercel.json文件，继续..."
else
  echo "创建vercel.json文件..."
  echo '{
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
}' > vercel.json
fi

# 检查是否存在vercel-entry.js
if [ -f "server/vercel-entry.js" ]; then
  echo "找到vercel-entry.js文件，继续..."
else
  echo "创建vercel入口文件..."
  mkdir -p server
  echo '/**
 * Vercel部署入口点
 * 用于在Vercel平台上启动NexusOrbital认证系统
 */

const app = require("./auth-server");

// 导出处理函数供Vercel使用
module.exports = app;' > server/vercel-entry.js
fi

echo "文件准备完成！"
echo "请使用以下命令部署到Vercel:"
echo "vercel --prod"
