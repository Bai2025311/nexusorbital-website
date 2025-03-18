@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ====================================================
echo             NexusOrbital 认证系统API测试工具
echo ====================================================
echo.

cd /d %~dp0
echo [信息] 当前工作目录: %cd%
echo.

echo [1/3] 检查Node.js环境...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未找到Node.js，请先安装Node.js
    echo 您可以从 https://nodejs.org/zh-cn/ 下载并安装
    pause
    exit /b 1
)

echo [2/3] 检查依赖模块...
if not exist "node_modules" (
    echo [信息] 安装必要的依赖模块...
    call npm install
    if %errorlevel% neq 0 (
        echo [错误] 安装依赖失败
        pause
        exit /b 1
    )
)

echo [3/3] 启动API测试...
echo.
echo 选择测试类型:
echo  1. 启动认证服务器（可在浏览器中测试）
echo  2. 运行自动化测试脚本
echo  3. 打开API测试页面（需要先选择选项1启动服务器）
echo  4. 退出
echo.

set /p choice=请输入选择项目的数字: 

if "%choice%"=="1" (
    echo.
    echo [信息] 启动认证服务器...
    echo [信息] 服务器运行中，按Ctrl+C终止
    echo [信息] API测试页面地址: http://localhost:3000/auth-test-page.html
    echo.
    node server/auth-server.js
) else if "%choice%"=="2" (
    echo.
    echo [信息] 运行自动化测试脚本...
    node scripts/api-test.js
    echo.
    echo 测试完成，按任意键返回...
    pause >nul
    %0
) else if "%choice%"=="3" (
    echo.
    echo [信息] 打开API测试页面...
    start http://localhost:3000/auth-test-page.html
    echo.
    echo 已尝试打开浏览器，按任意键返回...
    pause >nul
    %0
) else if "%choice%"=="4" (
    echo.
    echo [信息] 退出程序...
    exit /b 0
) else (
    echo.
    echo [错误] 无效的选择，请重新输入
    timeout /t 2 >nul
    %0
)

endlocal
