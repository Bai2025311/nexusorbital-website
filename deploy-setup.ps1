# NexusOrbital网站部署脚本
# 使用方法: 右键点击此文件，选择"使用PowerShell运行"

Write-Host "开始NexusOrbital.com网站部署准备..." -ForegroundColor Cyan

# 检查是否安装Git
if (!(Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "未检测到Git，请先安装Git: https://git-scm.com/download/win" -ForegroundColor Red
    Write-Host "安装后重新运行此脚本" -ForegroundColor Red
    Pause
    exit
}

# 获取GitHub用户名
$githubUsername = Read-Host "请输入您的GitHub用户名"

# 初始化Git仓库
Write-Host "初始化Git仓库..." -ForegroundColor Cyan
git init
git add .
git commit -m "初始化NexusOrbital网站代码"

# 配置远程仓库
Write-Host "配置GitHub远程仓库..." -ForegroundColor Cyan
Write-Host "请确保您已在GitHub上创建了名为 'nexusorbital-website' 的仓库" -ForegroundColor Yellow
$repoUrl = "https://github.com/$githubUsername/nexusorbital-website.git"
git remote add origin $repoUrl

# 推送代码
Write-Host "准备推送代码到GitHub..." -ForegroundColor Cyan
Write-Host "当提示输入GitHub凭据时，请输入您的GitHub用户名和密码(或个人访问令牌)" -ForegroundColor Yellow
git push -u origin main

Write-Host "`n代码已成功推送到GitHub!" -ForegroundColor Green
Write-Host "后续步骤:" -ForegroundColor Cyan
Write-Host "1. 访问 https://github.com/$githubUsername/nexusorbital-website/settings/pages" -ForegroundColor White
Write-Host "2. 在'Source'下选择'GitHub Actions'" -ForegroundColor White
Write-Host "3. 在Cloudflare中设置DNS记录，详见DEPLOYMENT_GUIDE.md" -ForegroundColor White

Pause
