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

:: 启动服务器
echo.
echo 启动NexusOrbital身份验证系统服务器...
echo.
node server/complete-solution.js

echo.
echo 服务器已停止运行。
pause
