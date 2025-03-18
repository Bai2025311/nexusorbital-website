@echo off
echo NexusOrbital 认证服务器启动脚本
echo =================================

echo 检查依赖项...
if not exist node_modules (
  echo 正在安装依赖项，请稍候...
  npm install
) else (
  echo 依赖项已安装.
)

echo.
echo 正在启动认证服务器...
echo 服务器将在 http://localhost:3000 上运行
echo 按 Ctrl+C 停止服务器
echo.

npm start
