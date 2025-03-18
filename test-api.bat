@echo off
echo NexusOrbital认证系统API测试工具
echo ==================================
echo.

cd /d "%~dp0server"

rem 检查Node.js安装
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [错误] 未找到Node.js，请先安装Node.js
    echo 可以从 https://nodejs.org/ 下载并安装
    echo.
    pause
    exit /b 1
)

rem 检查npm安装
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [错误] 未找到npm，请确保Node.js安装正确
    echo.
    pause
    exit /b 1
)

rem 检查依赖
if not exist "node_modules" (
    echo 首次运行测试，正在安装依赖...
    call npm install
    echo.
)

rem 运行测试
echo 正在启动API测试...
echo.
call npm test

echo.
pause
