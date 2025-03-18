@echo off
echo NexusOrbital身份验证系统全面测试工具
echo =========================================
echo.

:: 检查数据目录
if not exist "data" (
    echo 创建数据目录...
    mkdir data
)

:: 检查数据文件
if not exist "data\users.json" (
    echo 创建用户数据文件...
    echo [] > data\users.json
)

if not exist "data\reset_tokens.json" (
    echo 创建重置令牌数据文件...
    echo [] > data\reset_tokens.json
)

echo.
echo 可用的测试选项:
echo ----------------------------------------
echo 1. 启动测试服务器
echo 2. 运行API测试
echo 3. 运行密码重置API测试
echo 4. 查看API文档
echo 5. 退出
echo ----------------------------------------
echo.

:menu
set /p choice=请选择测试操作 (1-5): 

if "%choice%"=="1" (
    cls
    echo 启动测试服务器...
    echo 服务器启动后，您可以访问以下测试页面:
    echo - 邮箱注册测试: http://localhost:3090/email-register-test
    echo - 密码重置测试: http://localhost:3090/password-reset-test
    echo.
    echo 按Ctrl+C可停止服务器
    echo.
    node server/complete-solution.js
    goto menu
)

if "%choice%"=="2" (
    cls
    echo 运行API测试...
    echo.
    cd server && call test-api.bat
    cd ..
    echo.
    pause
    cls
    goto menu
)

if "%choice%"=="3" (
    cls
    echo 运行密码重置API测试...
    echo.
    cd server && call test-password-reset.bat
    cd ..
    echo.
    pause
    cls
    goto menu
)

if "%choice%"=="4" (
    cls
    echo 打开API文档...
    echo.
    echo 可用的文档:
    echo 1. 认证系统最终报告
    echo 2. 邮件服务API文档
    echo 3. 密码重置API文档
    echo 4. 安全最佳实践文档
    echo 5. 返回主菜单
    echo.
    set /p docChoice=请选择要查看的文档 (1-5): 
    
    if "%docChoice%"=="1" (
        start docs\authentication-system-final-report.md
    )
    if "%docChoice%"=="2" (
        start docs\email-service-api.md
    )
    if "%docChoice%"=="3" (
        start docs\password-reset-api.md
    )
    if "%docChoice%"=="4" (
        start docs\security-best-practices.md
    )
    if "%docChoice%"=="5" (
        cls
        goto menu
    )
    
    cls
    goto menu
)

if "%choice%"=="5" (
    echo 谢谢使用！
    exit /b 0
)

echo 无效选择，请重新输入.
goto menu
