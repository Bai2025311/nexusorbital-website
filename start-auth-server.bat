@echo off
echo NexusOrbital认证服务器启动脚本
echo ====================================

REM 确定运行环境
IF "%1"=="" (
  SET ENV=development
) ELSE (
  SET ENV=%1
)

echo 正在使用 %ENV% 环境启动服务器...
echo.

REM 设置环境变量
SET NODE_ENV=%ENV%

REM 如果是生产环境，提示用户输入邮箱凭据
IF "%ENV%"=="production" (
  echo 生产环境需要配置邮件服务
  set /p NEXUS_MAIL_USER=请输入邮箱账号: 
  set /p NEXUS_MAIL_PASS=请输入邮箱密码或应用密码: 
  echo 邮箱配置已设置
  echo.
)

echo 启动认证服务器...
cd /d "%~dp0"
node server/start-auth-server.js

echo.
echo 按任意键退出...
pause > nul
