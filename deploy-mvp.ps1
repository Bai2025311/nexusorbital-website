# NexusOrbital MVP部署脚本
# 用于快速将MVP相关文件部署到GitHub Pages

# 设置GitHub仓库信息
$githubToken = Read-Host -Prompt "请输入您的GitHub个人访问令牌" -AsSecureString
$token = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($githubToken))
$username = "Bai2025311"
$repoName = "nexusorbital-website"
$branch = "main"
$commitMessage = "集成MVP功能：添加探索者模式和系统集成"

# 要上传的文件列表 - MVP相关文件
$filesToUpload = @(
    # 核心JavaScript文件
    @{path="js/mvp.js"; localPath="e:\360MoveData\Users\Administrator\Documents\GitHub\nexusorbital-website\js\mvp.js"},
    @{path="js/integrations.js"; localPath="e:\360MoveData\Users\Administrator\Documents\GitHub\nexusorbital-website\js\integrations.js"},
    @{path="js/explorer-mode.js"; localPath="e:\360MoveData\Users\Administrator\Documents\GitHub\nexusorbital-website\js\explorer-mode.js"},
    
    # HTML文件
    @{path="mvp-index.html"; localPath="e:\360MoveData\Users\Administrator\Documents\GitHub\nexusorbital-website\mvp-index.html"},
    @{path="explorer-test.html"; localPath="e:\360MoveData\Users\Administrator\Documents\GitHub\nexusorbital-website\explorer-test.html"},
    
    # CSS文件
    @{path="css/mvp-unified.css"; localPath="e:\360MoveData\Users\Administrator\Documents\GitHub\nexusorbital-website\css\mvp-unified.css"},
    
    # 测试脚本
    @{path="test-mvp.bat"; localPath="e:\360MoveData\Users\Administrator\Documents\GitHub\nexusorbital-website\test-mvp.bat"},
    
    # 配置文件 - 确保vercel.json包含所有必要的路由
    @{path="vercel.json"; localPath="e:\360MoveData\Users\Administrator\Documents\GitHub\nexusorbital-website\vercel.json"}
)

Write-Host "开始将MVP更改部署到GitHub..." -ForegroundColor Cyan

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

# 更新vercel.json以包含MVP相关路由
Write-Host "`n正在更新vercel.json配置..." -ForegroundColor Cyan

# 读取当前的vercel.json
$vercelJsonPath = "e:\360MoveData\Users\Administrator\Documents\GitHub\nexusorbital-website\vercel.json"
$vercelJson = Get-Content -Path $vercelJsonPath -Raw | ConvertFrom-Json

# 检查并添加必要的路由
$mvpRouteExists = $false
$explorerRouteExists = $false

foreach ($route in $vercelJson.routes) {
    if ($route.src -eq "/mvp") {
        $mvpRouteExists = $true
    }
    if ($route.src -eq "/explorer") {
        $explorerRouteExists = $true
    }
}

# 如果需要，添加MVP相关路由
$newRoutes = @()
foreach ($route in $vercelJson.routes) {
    # 找到要插入新路由的位置
    if ($route.src -eq "/(.*)" -and -not $mvpRouteExists -and -not $explorerRouteExists) {
        # 添加新路由
        $newRoutes += [PSCustomObject]@{
            src = "/mvp"
            dest = "/mvp-index.html"
        }
        $newRoutes += [PSCustomObject]@{
            src = "/explorer"
            dest = "/explorer-test.html"
        }
    }
    $newRoutes += $route
}

# 更新路由
$vercelJson.routes = $newRoutes

# 保存更新后的vercel.json
$vercelJson | ConvertTo-Json -Depth 4 | Set-Content -Path $vercelJsonPath -Encoding UTF8

# 上传更新后的vercel.json
$content = Get-Content -Path $vercelJsonPath -Raw -Encoding UTF8
$contentBytes = [System.Text.Encoding]::UTF8.GetBytes($content)
$contentBase64 = [System.Convert]::ToBase64String($contentBytes)

$shaUrl = "https://api.github.com/repos/$username/$repoName/contents/vercel.json"
try {
    $response = Invoke-RestMethod -Uri $shaUrl -Headers $headers -Method Get
    $sha = $response.sha
} catch {
    $sha = $null
}

$body = @{
    message = "$commitMessage - 更新vercel.json配置"
    content = $contentBase64
    branch = $branch
}

if ($sha) {
    $body.sha = $sha
}

$bodyJson = $body | ConvertTo-Json

try {
    Invoke-RestMethod -Uri $shaUrl -Headers $headers -Method Put -Body $bodyJson -ContentType "application/json"
    Write-Host "  成功更新vercel.json配置" -ForegroundColor Green
} catch {
    Write-Host "  更新vercel.json失败" -ForegroundColor Red
    Write-Host "  错误: $_" -ForegroundColor Red
}

Write-Host "`n所有MVP文件已成功部署到GitHub!" -ForegroundColor Green
Write-Host "GitHub Actions将自动构建并部署网站。" -ForegroundColor Cyan
Write-Host "请等待几分钟，然后访问以下链接查看更新：" -ForegroundColor White
Write-Host "- MVP主页: https://nexusorbital.com/mvp" -ForegroundColor Yellow
Write-Host "- 探索者测试页: https://nexusorbital.com/explorer" -ForegroundColor Yellow
Write-Host "`n提示: 如果页面未更新，请尝试清除浏览器缓存（Ctrl+F5）或使用隐私模式打开链接" -ForegroundColor Cyan
Write-Host "`n提示: 如需获取GitHub个人访问令牌，请访问 https://github.com/settings/tokens" -ForegroundColor Gray

Pause
