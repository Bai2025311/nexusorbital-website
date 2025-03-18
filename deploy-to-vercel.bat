@echo off
echo ===== NexusOrbital 认证系统 - Vercel 一键部署 =====
echo 正在启动部署脚本...

powershell -ExecutionPolicy Bypass -File "%~dp0deploy-to-vercel.ps1"

if %ERRORLEVEL% NEQ 0 (
    echo 部署过程中出现错误，请查看上方提示信息
    pause
    exit /b 1
)

echo.
echo 按任意键退出...
pause > nul
