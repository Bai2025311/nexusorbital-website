# NexusOrbital认证系统简单部署脚本
# 创建日期: 2025-03-18

# 配置
$sourceDir = "E:\360MoveData\Users\Administrator\Documents\GitHub\nexusorbital-website"
$timestamp = Get-Date -Format "yyyyMMdd_HHmm"
$backupDir = "$sourceDir\backups\$timestamp"
$deployDir = ""

# 确保备份目录存在
New-Item -ItemType Directory -Force -Path "$sourceDir\backups" | Out-Null
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

# 显示欢迎信息
Write-Host "=======================================`n  NexusOrbital 认证系统部署工具`n=======================================" -ForegroundColor Green
Write-Host "开始部署流程..." -ForegroundColor Cyan

# 步骤1: 检查环境
Write-Host "`n步骤 1/4: 检查部署环境..." -ForegroundColor Yellow

# 检查Node.js
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "错误: 未检测到Node.js，请先安装Node.js" -ForegroundColor Red
    exit 1
}

$nodeVersion = node -v
Write-Host "Node.js版本: $nodeVersion" -ForegroundColor Green

# 检查npm
if (!(Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "错误: 未检测到npm，请检查Node.js安装" -ForegroundColor Red
    exit 1
}

$npmVersion = npm -v
Write-Host "npm版本: $npmVersion" -ForegroundColor Green

# 步骤2: 备份当前代码
Write-Host "`n步骤 2/4: 备份当前代码..." -ForegroundColor Yellow

# 备份js文件夹
Copy-Item -Path "$sourceDir\js" -Destination "$backupDir\js" -Recurse -Force
Write-Host "已备份: js 文件夹" -ForegroundColor Gray

# 备份server文件夹
Copy-Item -Path "$sourceDir\server" -Destination "$backupDir\server" -Recurse -Force
Write-Host "已备份: server 文件夹" -ForegroundColor Gray

# 备份docs文件夹
Copy-Item -Path "$sourceDir\docs" -Destination "$backupDir\docs" -Recurse -Force
Write-Host "已备份: docs 文件夹" -ForegroundColor Gray

# 备份API测试页面
Copy-Item -Path "$sourceDir\api-test.html" -Destination "$backupDir\api-test.html" -Force
Write-Host "已备份: api-test.html" -ForegroundColor Gray

Write-Host "备份完成: $backupDir" -ForegroundColor Green

# 步骤3: 选择部署目标
Write-Host "`n步骤 3/4: 选择部署目标..." -ForegroundColor Yellow

Write-Host "请选择部署方式:" -ForegroundColor Cyan
Write-Host "1. 部署到本地服务器" -ForegroundColor White
Write-Host "2. 创建部署包" -ForegroundColor White

$deployMethod = Read-Host "请输入选项 (1-2)"

if ($deployMethod -eq "1") {
    # 本地服务器部署
    Write-Host "`n请输入本地部署目录:" -ForegroundColor Cyan
    $deployDir = Read-Host
    
    if (!(Test-Path $deployDir)) {
        New-Item -ItemType Directory -Force -Path $deployDir | Out-Null
        Write-Host "创建部署目录: $deployDir" -ForegroundColor Gray
    }
    
    Write-Host "正在复制文件到本地服务器..." -ForegroundColor Gray
    
    # 复制js文件夹
    Copy-Item -Path "$sourceDir\js" -Destination "$deployDir\js" -Recurse -Force
    
    # 复制server文件夹
    Copy-Item -Path "$sourceDir\server" -Destination "$deployDir\server" -Recurse -Force
    
    # 复制docs文件夹
    Copy-Item -Path "$sourceDir\docs" -Destination "$deployDir\docs" -Recurse -Force
    
    # 复制API测试页面
    Copy-Item -Path "$sourceDir\api-test.html" -Destination "$deployDir\api-test.html" -Force
    
    Write-Host "文件已复制到: $deployDir" -ForegroundColor Green
    
    # 安装依赖
    Write-Host "正在安装服务器依赖..." -ForegroundColor Gray
    Set-Location "$deployDir\server"
    npm install --production --no-fund
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "警告: 依赖安装出现问题" -ForegroundColor Yellow
    } else {
        Write-Host "依赖安装完成!" -ForegroundColor Green
    }
    
    # 创建启动脚本
    $startScript = "@echo off`r`necho === NexusOrbital认证系统启动脚本 ===`r`necho.`r`n`r`nrem 切换到服务器目录`r`ncd /d %~dp0server`r`n`r`nrem 安装依赖`r`necho 检查依赖...`r`ncall npm install --production --no-fund`r`n`r`nrem 启动服务器`r`necho.`r`necho 启动认证服务器...`r`ncall npm start`r`n`r`npause"
    
    Set-Content -Path "$deployDir\start-auth-server.bat" -Value $startScript
    Write-Host "创建启动脚本: $deployDir\start-auth-server.bat" -ForegroundColor Green

} elseif ($deployMethod -eq "2") {
    # 创建部署包
    $deployPackage = "$sourceDir\nexusorbital-auth-deploy-$timestamp.zip"
    Write-Host "`n正在创建部署包..." -ForegroundColor Cyan
    
    Compress-Archive -Path "$sourceDir\js", "$sourceDir\server", "$sourceDir\docs", "$sourceDir\api-test.html" -DestinationPath $deployPackage -Force
    
    Write-Host "部署包已创建: $deployPackage" -ForegroundColor Green
} else {
    Write-Host "错误: 无效的选项" -ForegroundColor Red
    exit 1
}

# 步骤4: 完成部署
Write-Host "`n步骤 4/4: 完成部署..." -ForegroundColor Yellow

Write-Host "`n部署摘要:" -ForegroundColor Cyan
Write-Host "--------------------------" -ForegroundColor Cyan
Write-Host "备份位置: $backupDir" -ForegroundColor Cyan
Write-Host "部署方式: $deployMethod" -ForegroundColor Cyan
Write-Host "部署时间: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan

Write-Host "`n部署成功!" -ForegroundColor Green
Write-Host "--------------------------" -ForegroundColor Green
Write-Host "请记住:" -ForegroundColor Green
Write-Host "1. 确保服务器防火墙开放必要端口 (默认3000)" -ForegroundColor Green
Write-Host "2. 配置HTTPS以增强安全性" -ForegroundColor Green
Write-Host "3. 定期备份数据" -ForegroundColor Green

# 显示启动服务器命令
if ($deployMethod -eq "1") {
    Write-Host "`n启动服务器: 运行 $deployDir\start-auth-server.bat" -ForegroundColor Yellow
} elseif ($deployMethod -eq "2") {
    Write-Host "`n已生成部署包: $deployPackage" -ForegroundColor Yellow
}

# 返回到原始目录
Set-Location $sourceDir

Write-Host "`n按任意键退出..." -ForegroundColor Cyan
$null = $host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
