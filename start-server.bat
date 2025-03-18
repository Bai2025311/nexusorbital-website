@echo off
echo NexusOrbital身份验证系统服务器
echo ====================================
echo.

:: 创建数据文件夹(如果不存在)
if not exist "data" (
    echo 创建数据存储目录...
    mkdir data
)

:: 检查是否有所需的data/users.json文件
if not exist "data\users.json" (
    echo 创建初始用户数据文件...
    echo [] > data\users.json
)

:: 检查是否有所需的data/reset_tokens.json文件
if not exist "data\reset_tokens.json" (
    echo 创建初始重置令牌数据文件...
    echo [] > data\reset_tokens.json
)

:: 确保所有依赖已安装
echo 检查依赖...
npm list express body-parser nodemailer > nul 2>&1
if %errorlevel% neq 0 (
    echo 安装所需依赖...
    npm install express body-parser cors nodemailer node-fetch@2 --no-save
)

:: 提示用户选择服务器类型
echo.
echo 请选择要启动的服务器:
echo 1. 标准服务器 (完整功能)
echo 2. 修复版服务器 (仅修复注册问题)
echo.
set /p choice="请输入选项 (1/2): "

:: 根据用户选择启动不同服务器
if "%choice%"=="1" (
    echo.
    echo 启动标准NexusOrbital身份验证系统服务器...
    echo.
    node server/complete-solution.js
) else if "%choice%"=="2" (
    echo.
    echo 启动修复版服务器 (仅修复注册问题)...
    echo.
    node server/fix-cors.js
) else (
    echo.
    echo 无效选项，默认启动标准服务器...
    echo.
    node server/complete-solution.js
)

echo.
echo 服务器已停止运行。
pause
