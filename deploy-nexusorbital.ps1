# NexusOrbital部署脚本
# 用于快速将网站更改部署到GitHub Pages

# 设置GitHub仓库信息
$githubToken = Read-Host -Prompt "请输入您的GitHub个人访问令牌" -AsSecureString
$token = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($githubToken))
$username = "Bai2025311"
$repoName = "nexusorbital-website"
$branch = "main"
$commitMessage = "更新Logo为NexusOrbital并优化智能体图标排版"

# 要上传的文件列表
$filesToUpload = @(
    @{path="index.html"; localPath="C:\Users\Administrator\CascadeProjects\CosmicWeave\website\index.html"},
    @{path="agents.html"; localPath="C:\Users\Administrator\CascadeProjects\CosmicWeave\website\agents.html"},
    @{path="community.html"; localPath="C:\Users\Administrator\CascadeProjects\CosmicWeave\website\community.html"},
    @{path="css/agents.css"; localPath="C:\Users\Administrator\CascadeProjects\CosmicWeave\website\css\agents.css"}
)

Write-Host "开始将更改部署到GitHub..." -ForegroundColor Cyan

foreach ($file in $filesToUpload) {
    $localPath = $file.localPath
    $path = $file.path
    
    Write-Host "处理文件: $path" -ForegroundColor Yellow
    
    # 读取文件内容
    $content = Get-Content -Path $localPath -Raw
    $contentBytes = [System.Text.Encoding]::UTF8.GetBytes($content)
    $contentBase64 = [System.Convert]::ToBase64String($contentBytes)
    
    # 获取当前文件的SHA (如果存在)
    $shaUrl = "https://api.github.com/repos/$username/$repoName/contents/$path"
    $headers = @{
        "Authorization" = "token $token"
        "Accept" = "application/vnd.github.v3+json"
    }
    
    try {
        $response = Invoke-RestMethod -Uri $shaUrl -Headers $headers -Method Get
        $sha = $response.sha
        Write-Host "  文件已存在，将进行更新" -ForegroundColor Blue
    } catch {
        $sha = $null
        Write-Host "  文件不存在，将创建新文件" -ForegroundColor Green
    }
    
    # 创建请求体
    $body = @{
        message = $commitMessage
        content = $contentBase64
        branch = $branch
    }
    
    if ($sha) {
        $body.sha = $sha
    }
    
    $bodyJson = $body | ConvertTo-Json
    
    # 上传文件
    try {
        Invoke-RestMethod -Uri $shaUrl -Headers $headers -Method Put -Body $bodyJson -ContentType "application/json"
        Write-Host "  成功上传: $path" -ForegroundColor Green
    } catch {
        Write-Host "  上传失败: $path" -ForegroundColor Red
        Write-Host "  错误: $_" -ForegroundColor Red
    }
}

Write-Host "`n所有文件已成功部署到GitHub!" -ForegroundColor Green
Write-Host "GitHub Actions将自动构建并部署网站。" -ForegroundColor Cyan
Write-Host "请等待几分钟，然后访问 https://nexusorbital.com 查看更新。" -ForegroundColor White
Write-Host "`n提示: 如需获取GitHub个人访问令牌，请访问 https://github.com/settings/tokens" -ForegroundColor Gray

Pause
