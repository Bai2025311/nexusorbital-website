@echo off
echo === NexusOrbital API 测试工具 ===
echo.

echo 检查依赖...
call npm install axios chalk --save-dev

echo.
echo 开始运行API测试...
call npm run test:api

echo.
echo 测试完成！按任意键退出...
pause > nul
