@echo off
echo NexusOrbital 模拟认证服务器启动脚本
echo =====================================

rem 检查node是否已安装
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo 错误: 未找到Node.js，请先安装Node.js
    pause
    exit /b 1
)

rem 确保所需依赖已安装
cd /d "%~dp0"
echo 检查所需依赖...
call npm list express body-parser cors >nul 2>nul
if %errorlevel% neq 0 (
    echo 安装所需依赖...
    call npm install express body-parser cors --no-save
)

rem 创建必要的数据目录
if not exist "server\mockdata" (
    echo 创建数据目录...
    mkdir "server\mockdata"
)

rem 启动服务器
echo 启动模拟认证服务器...
echo 按Ctrl+C可停止服务器
node server/mock-auth-server.js

pause
