# NexusOrbital MVP更改推送脚本
# 该脚本会直接使用GitHub REST API将修改过的文件上传到GitHub

# 设置GitHub仓库信息
$githubToken = Read-Host -Prompt "请输入您的GitHub个人访问令牌" -AsSecureString
$token = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($githubToken))
$username = "Bai2025311"
$repoName = "nexusorbital-website"
$branch = "main"
$commitMessage = "集成MVP功能到主网站"

Write-Host "开始上传修改过的文件..." -ForegroundColor Cyan

# 上传修改过的index.html
$filesToUpload = @(
    @{path="index.html"; localPath="e:\360MoveData\Users\Administrator\Documents\GitHub\nexusorbital-website\index.html"},
    @{path="community.html"; localPath="e:\360MoveData\Users\Administrator\Documents\GitHub\nexusorbital-website\community.html"},
    @{path="js/explorer-mode.js"; localPath="e:\360MoveData\Users\Administrator\Documents\GitHub\nexusorbital-website\js\explorer-mode.js"},
    @{path="js/integrations.js"; localPath="e:\360MoveData\Users\Administrator\Documents\GitHub\nexusorbital-website\js\integrations.js"},
    @{path="js/mvp.js"; localPath="e:\360MoveData\Users\Administrator\Documents\GitHub\nexusorbital-website\js\mvp.js"}
)

foreach ($file in $filesToUpload) {
    $localPath = $file.localPath
    $path = $file.path
    
    # 检查文件是否存在
    if (-not (Test-Path $localPath)) {
        Write-Host "文件不存在: $localPath" -ForegroundColor Red
        continue
    }
    
    Write-Host "处理文件: $path" -ForegroundColor Yellow
    
    # 读取文件内容
    $content = Get-Content -Path $localPath -Raw -Encoding UTF8
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
    } 
    catch {
        $sha = $null
        Write-Host "  文件不存在，将创建新文件" -ForegroundColor Green
    }
    
    # 创建请求体
    $body = @{
        message = "$commitMessage - 更新 $path"
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
    } 
    catch {
        Write-Host "  上传失败: $path" -ForegroundColor Red
        Write-Host "  错误: $_" -ForegroundColor Red
    }
}

Write-Host "`n所有文件上传完成!" -ForegroundColor Green
Write-Host "GitHub Actions将自动构建并部署网站。" -ForegroundColor Cyan
Write-Host "请等待几分钟，然后访问以下链接查看更新：" -ForegroundColor White
Write-Host "- 主页: https://nexusorbital.com" -ForegroundColor Yellow
Write-Host "- 社区页面: https://nexusorbital.com/community.html" -ForegroundColor Yellow
Write-Host "`n提示: 如果页面未更新，请尝试清除浏览器缓存（Ctrl+F5）或使用隐私模式打开链接" -ForegroundColor Cyan

Pause
