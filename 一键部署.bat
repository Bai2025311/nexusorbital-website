@echo off
echo ===== NexusOrbital认证系统 - 一键部署 =====
echo 正在启动部署向导...

powershell -ExecutionPolicy Bypass -File "%~dp0scripts\deploy-vercel.ps1"

if %ERRORLEVEL% NEQ 0 (
    echo 部署过程中出现错误，请查看上方提示信息
    pause
    exit /b 1
)

echo.
echo 部署流程已完成
pause
