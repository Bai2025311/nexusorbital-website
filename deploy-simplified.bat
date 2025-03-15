@echo off
echo 正在启动NexusOrbital网站部署向导...
echo.
echo 此脚本将打开GitHub网页，帮您直接上传修改后的文件
echo.
pause

REM 打开GitHub仓库页面
start https://github.com/Bai2025311/nexusorbital-website

echo.
echo 请在GitHub网页上执行以下操作:
echo 1. 点击"Add file" → "Upload files"
echo 2. 从本地拖拽或选择以下文件:
echo    - index.html
echo    - agents.html
echo    - community.html
echo    - css/agents.css
echo 3. 在"Commit changes"中添加描述: "更新Logo为NexusOrbital并优化智能体图标排版"
echo 4. 点击"Commit changes"按钮提交更改
echo.
echo 文件上传后，GitHub Actions将自动部署您的网站
echo 几分钟后您可以访问 https://nexusorbital.com 查看更新结果
echo.
pause
