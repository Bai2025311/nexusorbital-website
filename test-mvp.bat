@echo off
echo NexusOrbital MVP功能测试工具
echo =========================================
echo.

:: 设置环境变量
set PORT=3099
set TEST_MODE=true

echo 可用的测试选项:
echo ----------------------------------------
echo 1. 启动MVP测试服务器
echo 2. 运行集成测试
echo 3. 测试探索者模式功能
echo 4. 测试社区功能集成
echo 5. 测试用户权限系统
echo 6. 测试设计工具集成
echo 7. 退出
echo ----------------------------------------
echo.

:menu
set /p choice=请选择测试操作 (1-7): 

if "%choice%"=="1" (
    cls
    echo 启动MVP测试服务器...
    echo 服务器启动后，您可以访问以下测试页面:
    echo - MVP主页: http://localhost:%PORT%/mvp-index.html
    echo - 探索者模式测试: http://localhost:%PORT%/explorer-test.html
    echo.
    echo 按Ctrl+C可停止服务器
    echo.
    
    :: 检查是否存在 http-server
    where http-server >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo 未找到http-server，尝试安装...
        call npm install -g http-server
    )
    
    :: 启动服务器
    http-server -p %PORT%
    goto menu
)

if "%choice%"=="2" (
    cls
    echo 运行集成测试...
    echo.
    
    :: 检查各个模块是否正确加载
    echo 测试1: 检查所有模块是否正确加载
    echo -----------------------------
    echo [测试步骤]
    echo 1. 打开浏览器，访问 http://localhost:%PORT%/mvp-index.html
    echo 2. 打开控制台 (按F12)
    echo 3. 确认没有JavaScript错误
    echo 4. 检查以下模块是否存在:
    echo    - NexusOrbital.Auth
    echo    - NexusOrbital.ExplorerMode
    echo    - NexusOrbital.Community
    echo    - NexusOrbital.DesignTool
    echo    - NexusOrbital.Integrations
    echo.
    echo 按任意键返回主菜单...
    pause >nul
    goto menu
)

if "%choice%"=="3" (
    cls
    echo 测试探索者模式功能...
    echo.
    echo [测试步骤]
    echo 1. 打开浏览器，访问 http://localhost:%PORT%/mvp-index.html
    echo 2. 点击"探索者模式"按钮
    echo 3. 确认探索者模式欢迎信息显示
    echo 4. 验证界面更新:
    echo    - 导航栏显示探索者模式激活状态
    echo    - 用户可访问基础设计工具
    echo    - 用户可浏览社区内容
    echo 5. 测试退出探索者模式功能
    echo.
    echo 按任意键返回主菜单...
    pause >nul
    goto menu
)

if "%choice%"=="4" (
    cls
    echo 测试社区功能集成...
    echo.
    echo [测试步骤]
    echo 1. 打开浏览器，访问 http://localhost:%PORT%/mvp-index.html
    echo 2. 检查社区展示区域是否正确加载内容
    echo 3. 点击任意社区内容，确认详情页面正确显示
    echo 4. 测试权限限制:
    echo    - 未登录时尝试发帖，确认提示登录或使用探索者模式
    echo    - 以探索者模式尝试发帖，确认权限限制正确
    echo.
    echo 按任意键返回主菜单...
    pause >nul
    goto menu
)

if "%choice%"=="5" (
    cls
    echo 测试用户权限系统...
    echo.
    echo [测试步骤]
    echo 1. 打开浏览器，访问 http://localhost:%PORT%/mvp-index.html
    echo 2. 使用不同用户角色测试权限:
    echo    - 匿名用户: 只能查看基础内容
    echo    - 探索者: 可查看和使用基础功能
    echo    - 基础会员: 可发布基础内容
    echo    - 专业会员: 可使用高级功能
    echo 3. 确认权限检查功能正确工作
    echo.
    echo 按任意键返回主菜单...
    pause >nul
    goto menu
)

if "%choice%"=="6" (
    cls
    echo 测试设计工具集成...
    echo.
    echo [测试步骤]
    echo 1. 打开浏览器，访问 http://localhost:%PORT%/mvp-index.html
    echo 2. 测试设计工具的访问权限控制:
    echo    - 未登录用户访问高级设计工具，应显示锁定状态
    echo    - 探索者模式下访问基础设计工具，应能正常使用
    echo    - 登录用户访问不同级别设计工具，权限控制应正确生效
    echo.
    echo 按任意键返回主菜单...
    pause >nul
    goto menu
)

if "%choice%"=="7" (
    cls
    echo 感谢使用MVP测试工具！
    exit /b
)

echo 无效选择，请重试。
goto menu
