# NexusOrbital 一键部署脚本
# 此脚本用于将NexusOrbital认证系统部署到Vercel

Write-Host "===== NexusOrbital 认证系统 - Vercel 一键部署 =====" -ForegroundColor Cyan
Write-Host "正在准备部署..." -ForegroundColor Yellow

# 检查Vercel CLI是否已安装
$vercelInstalled = $null
try {
    $vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
} catch {
    # 命令不存在
}

if ($null -eq $vercelInstalled) {
    Write-Host "未检测到Vercel CLI，正在安装..." -ForegroundColor Yellow
    
    # 检查Node.js是否已安装
    $nodeInstalled = $null
    try {
        $nodeInstalled = Get-Command node -ErrorAction SilentlyContinue
    } catch {
        # 命令不存在
    }
    
    if ($null -eq $nodeInstalled) {
        Write-Host "错误: 未检测到Node.js，请先安装Node.js后再运行此脚本" -ForegroundColor Red
        Write-Host "您可以从 https://nodejs.org 下载并安装Node.js" -ForegroundColor Yellow
        Write-Host "安装后，请重新运行此脚本" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "正在全局安装Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "错误: 安装Vercel CLI失败，请手动运行 'npm install -g vercel'" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Vercel CLI安装成功!" -ForegroundColor Green
}

# 确保文件准备就绪
Write-Host "正在验证部署配置..." -ForegroundColor Yellow

$vercelJsonPath = ".\vercel.json"
if (-not (Test-Path $vercelJsonPath)) {
    Write-Host "错误: 未找到vercel.json配置文件" -ForegroundColor Red
    exit 1
}

Write-Host "配置文件验证成功!" -ForegroundColor Green

# 提示用户登录Vercel
Write-Host "`n请按照提示登录Vercel (如果您已登录则会跳过此步骤)" -ForegroundColor Cyan
vercel login

if ($LASTEXITCODE -ne 0) {
    Write-Host "错误: Vercel登录失败，请确保您有Vercel账号" -ForegroundColor Red
    Write-Host "您可以在 https://vercel.com/signup 注册Vercel账号" -ForegroundColor Yellow
    exit 1
}

# 部署到Vercel
Write-Host "`n开始部署到Vercel..." -ForegroundColor Cyan
Write-Host "请按照终端提示操作。首次部署时，Vercel会要求进行一些配置。" -ForegroundColor Yellow
Write-Host "通常您可以接受默认设置，只需按 Enter 键继续。" -ForegroundColor Yellow

vercel --prod

if ($LASTEXITCODE -ne 0) {
    Write-Host "错误: 部署过程中遇到问题，请查看上方错误信息" -ForegroundColor Red
    exit 1
}

Write-Host "`n恭喜! NexusOrbital认证系统已成功部署到Vercel!" -ForegroundColor Green
Write-Host "您可以在Vercel仪表板查看您的部署: https://vercel.com/dashboard" -ForegroundColor Cyan
Write-Host "请记录上方显示的部署URL，您可以使用该URL访问您的认证系统。" -ForegroundColor Yellow

Write-Host "`n===== 部署完成 =====" -ForegroundColor Cyan
