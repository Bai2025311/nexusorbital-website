# NexusOrbital网站同步脚本
# 使用方法: 右键点击此文件，选择"使用PowerShell运行"

Write-Host "开始同步NexusOrbital.com网站更改..." -ForegroundColor Cyan

# 检查是否安装Git
try {
    $gitVersion = & git --version
    Write-Host "检测到Git: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "未检测到Git，请先安装Git: https://git-scm.com/download/win" -ForegroundColor Red
    Write-Host "安装后重新运行此脚本" -ForegroundColor Red
    Pause
    exit
}

# 检查当前目录是否为Git仓库
if (-not (Test-Path -Path ".git")) {
    Write-Host "当前目录不是Git仓库，需要初始化..." -ForegroundColor Yellow
    
    # 初始化Git仓库
    git init
    
    # 配置远程仓库
    $githubUsername = Read-Host "请输入您的GitHub用户名"
    $repoName = "nexusorbital-website"
    $repoUrl = "https://github.com/$githubUsername/$repoName.git"
    git remote add origin $repoUrl
} else {
    Write-Host "检测到现有Git仓库" -ForegroundColor Green
}

# 添加所有更改
Write-Host "添加所有文件更改..." -ForegroundColor Cyan
git add .

# 提交更改
$commitMessage = "更新网站: 优化智能体图标排版并更新Logo名称"
Write-Host "提交更改: $commitMessage" -ForegroundColor Cyan
git commit -m $commitMessage

# 推送到GitHub
Write-Host "推送更改到GitHub..." -ForegroundColor Cyan
git push -u origin main

Write-Host "`n更改已同步到GitHub!" -ForegroundColor Green
Write-Host "GitHub Actions将自动部署更新后的网站" -ForegroundColor Cyan
Write-Host "请等待几分钟，然后访问 https://nexusorbital.com 查看更新后的网站" -ForegroundColor White

Pause
