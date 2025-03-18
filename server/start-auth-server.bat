@echo off
setlocal

REM NexusOrbital认证服务器启动脚本
REM 用法: start-auth-server.bat [environment] [port]
REM  environment: development (默认), testing, production
REM  port: 服务器端口号 (默认: 3060, 在配置中指定)

REM 设置默认环境
set ENV=development
if not "%~1"=="" set ENV=%~1

REM 设置环境变量
echo 使用环境: %ENV%

REM 设置可选的端口
set PORT=
if not "%~2"=="" set PORT=%~2

REM 设置可选的邮件发送凭据
set MAIL_USER=%NEXUS_MAIL_USER%
set MAIL_PASS=%NEXUS_MAIL_PASS%

REM 获取Node可执行文件路径
where node > nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Node.js未安装，请先安装Node.js
    exit /b 1
)

REM 显示配置信息
echo.
echo [NexusOrbital认证服务器]
echo =======================
echo 环境: %ENV%
if not "%PORT%"=="" echo 端口: %PORT%
if not "%MAIL_USER%"=="" echo 邮件账号: %MAIL_USER%
if not "%MAIL_PASS%"=="" echo 邮件密码: 已配置
echo =======================
echo.

REM 启动服务器
set NODE_ENV=%ENV%
if not "%PORT%"=="" set NODE_PORT=%PORT%

node server/start-auth-server.js

endlocal
