@echo off
echo NexusOrbital密码重置API测试工具
echo ====================================
echo.

:: 检查是否安装了必要的模块
call npm list node-fetch > nul 2>&1
if %errorlevel% neq 0 (
    echo 正在安装必要的依赖模块...
    call npm install node-fetch@2 --no-save
)

:: 运行测试脚本
echo 启动密码重置测试工具...
echo.
node test-password-reset.js

echo.
echo 测试完成！
pause
