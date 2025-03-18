# NexusOrbital认证系统部署脚本
# 作者: NexusOrbital开发团队
# 创建日期: 2025-03-18
# 说明: 此脚本用于将认证系统部署到生产环境

# 定义颜色输出函数
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    else {
        $input | Write-Output
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

# 配置
$sourceDir = "E:\360MoveData\Users\Administrator\Documents\GitHub\nexusorbital-website"
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm"
$backupDir = "$sourceDir\backups\$timestamp"
$deployLogFile = "$sourceDir\deploy-logs\deploy-$timestamp.log"

# 确保日志和备份目录存在
New-Item -ItemType Directory -Force -Path "$sourceDir\deploy-logs" | Out-Null
New-Item -ItemType Directory -Force -Path "$backupDir" | Out-Null

# 显示欢迎信息
Write-ColorOutput Green "
=======================================
  NexusOrbital 认证系统部署工具 v1.0
=======================================
"

Write-ColorOutput Cyan "开始部署流程..."

# 步骤1: 检查环境
Write-ColorOutput Yellow "`n步骤 1/5: 检查部署环境..."

# 检查Node.js
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-ColorOutput Red "错误: 未检测到Node.js，请先安装Node.js"
    exit 1
}

$nodeVersion = node -v
Write-ColorOutput Green "Node.js版本: $nodeVersion"

# 检查npm
if (!(Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-ColorOutput Red "错误: 未检测到npm，请检查Node.js安装"
    exit 1
}

$npmVersion = npm -v
Write-ColorOutput Green "npm版本: $npmVersion"

# 步骤2: 运行测试
Write-ColorOutput Yellow "`n步骤 2/5: 运行API测试..."

# 切换到服务器目录并安装依赖
Set-Location "$sourceDir\server"
npm install --no-fund

# 运行测试
Write-ColorOutput Cyan "是否要运行API测试? (Y/N)"
$runTests = Read-Host

if ($runTests -eq "Y") {
    Write-ColorOutput Cyan "正在运行API测试..."
    npm run test:api
    
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput Yellow "警告: API测试出现问题，请检查测试结果"
        Write-ColorOutput Yellow "是否继续部署? (Y/N)"
        $continue = Read-Host
        if ($continue -ne "Y") {
            Write-ColorOutput Red "部署已取消"
            exit 1
        }
    } else {
        Write-ColorOutput Green "API测试通过!"
    }
} else {
    Write-ColorOutput Yellow "已跳过API测试"
}

# 步骤3: 备份当前代码
Write-ColorOutput Yellow "`n步骤 3/5: 备份当前代码..."

# 备份js文件夹
Copy-Item -Path "$sourceDir\js" -Destination "$backupDir\js" -Recurse -Force

# 备份server文件夹
Copy-Item -Path "$sourceDir\server" -Destination "$backupDir\server" -Recurse -Force

# 备份docs文件夹
Copy-Item -Path "$sourceDir\docs" -Destination "$backupDir\docs" -Recurse -Force

# 备份API测试页面
Copy-Item -Path "$sourceDir\api-test.html" -Destination "$backupDir\api-test.html" -Force

Write-ColorOutput Green "备份完成: $backupDir"

# 步骤4: 选择部署目标
Write-ColorOutput Yellow "`n步骤 4/5: 选择部署目标..."

Write-ColorOutput Cyan "请选择部署方式:"
Write-ColorOutput White "1. 部署到本地服务器"
Write-ColorOutput White "2. 创建部署包"

$deployMethod = Read-Host "请输入选项 (1-2)"

switch ($deployMethod) {
    "1" {
        # 本地服务器部署
        Write-ColorOutput Cyan "`n请输入本地部署目录:"
        $deployDir = Read-Host
        
        if (!(Test-Path $deployDir)) {
            New-Item -ItemType Directory -Force -Path $deployDir | Out-Null
            Write-ColorOutput Gray "创建部署目录: $deployDir"
        }
        
        Write-ColorOutput Gray "正在复制文件到本地服务器..."
        
        # 复制js文件夹
        Copy-Item -Path "$sourceDir\js" -Destination "$deployDir\js" -Recurse -Force
        
        # 复制server文件夹
        Copy-Item -Path "$sourceDir\server" -Destination "$deployDir\server" -Recurse -Force
        
        # 复制docs文件夹
        Copy-Item -Path "$sourceDir\docs" -Destination "$deployDir\docs" -Recurse -Force
        
        # 复制API测试页面
        Copy-Item -Path "$sourceDir\api-test.html" -Destination "$deployDir\api-test.html" -Force
        
        Write-ColorOutput Green "文件已复制到: $deployDir"
        
        # 安装依赖
        Write-ColorOutput Gray "正在安装服务器依赖..."
        Set-Location "$deployDir\server"
        npm install --production --no-fund
        
        if ($LASTEXITCODE -ne 0) {
            Write-ColorOutput Yellow "警告: 依赖安装出现问题"
        } else {
            Write-ColorOutput Green "依赖安装完成!"
        }
        
        # 创建启动脚本
        $startScript = @"
@echo off
echo === NexusOrbital认证系统启动脚本 ===
echo.

rem 切换到服务器目录
cd /d %~dp0server

rem 安装依赖
echo 检查依赖...
call npm install --production --no-fund

rem 启动服务器
echo.
echo 启动认证服务器...
call npm start

pause
"@
        
        Set-Content -Path "$deployDir\start-auth-server.bat" -Value $startScript
        Write-ColorOutput Green "创建启动脚本: $deployDir\start-auth-server.bat"
    }
    "2" {
        # 创建部署包
        $deployPackage = "$sourceDir\nexusorbital-auth-deploy-$timestamp.zip"
        Write-ColorOutput Cyan "`n正在创建部署包..."
        
        Compress-Archive -Path "$sourceDir\js", "$sourceDir\server", "$sourceDir\docs", "$sourceDir\api-test.html" -DestinationPath $deployPackage -Force
        
        Write-ColorOutput Green "部署包已创建: $deployPackage"
    }
    default {
        Write-ColorOutput Red "错误: 无效的选项"
        exit 1
    }
}

# 步骤5: 完成部署
Write-ColorOutput Yellow "`n步骤 5/5: 完成部署..."

Write-ColorOutput Cyan @"

部署摘要:
--------------------------
备份位置: $backupDir
部署方式: $deployMethod
部署时间: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
"@

Write-ColorOutput Green @"

部署成功！
--------------------------
请记住:
1. 确保服务器防火墙开放必要端口 (默认3000)
2. 配置HTTPS以增强安全性
3. 定期备份数据
"@

# 显示启动服务器命令
if ($deployMethod -eq "1") {
    Write-ColorOutput Yellow "`n启动服务器: 运行 $deployDir\start-auth-server.bat"
} elseif ($deployMethod -eq "2") {
    Write-ColorOutput Yellow "`n已生成部署包: $deployPackage"
}

# 返回到原始目录
Set-Location $sourceDir

Write-ColorOutput Cyan "`n按任意键退出..."
$host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null
