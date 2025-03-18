@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ====================================================
echo             NexusOrbital 认证系统一键部署工具
echo ====================================================
echo.

:: 检查必要工具是否安装
echo [1/5] 正在检查必要工具...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未找到Node.js，请先安装Node.js
    echo 您可以从 https://nodejs.org/zh-cn/ 下载并安装
    pause
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未找到npm，请先安装Node.js
    echo 您可以从 https://nodejs.org/zh-cn/ 下载并安装
    pause
    exit /b 1
)

:: 检查Vercel CLI
echo [2/5] 正在检查Vercel CLI...
where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo [提示] 未安装Vercel CLI，正在为您安装...
    call npm install -g vercel
    if %errorlevel% neq 0 (
        echo [错误] 安装Vercel CLI失败
        pause
        exit /b 1
    )
    echo [成功] Vercel CLI安装完成
) else (
    echo [成功] 检测到Vercel CLI
)

:: 进入项目根目录
cd /d %~dp0\..
echo [3/5] 当前工作目录: %cd%

:: 安装依赖
echo [4/5] 正在安装项目依赖...
echo.
call npm install
if %errorlevel% neq 0 (
    echo [错误] 安装依赖失败
    pause
    exit /b 1
)
echo.
echo [成功] 项目依赖安装完成

:: 部署到Vercel
echo [5/5] 正在部署到Vercel...
echo.
echo [提示] 如果您未登录Vercel，将会弹出登录提示
echo [提示] 部署过程中可能需要您进行一些确认操作
echo.
echo 准备部署，按任意键继续...
pause >nul

call vercel --prod
if %errorlevel% neq 0 (
    echo [错误] 部署失败
    pause
    exit /b 1
)

echo.
echo ====================================================
echo            NexusOrbital 认证系统部署完成!
echo ====================================================
echo.
echo 您现在可以访问Vercel提供的网址使用认证系统了
echo 如果您需要自定义域名，请在Vercel控制台中进行设置
echo.
echo 按任意键退出...
pause >nul

endlocal
exit /b 0
