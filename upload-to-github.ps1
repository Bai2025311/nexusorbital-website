# GitHub文件上传脚本
param(
    [Parameter(Mandatory=$true)]
    [string]$Token
)

$ErrorActionPreference = "Stop"

# 配置信息
$owner = "Bai2025311"
$repo = "nexusorbital-website"
$branch = "main"
$commitMessage = "更新Logo为NexusOrbital并优化智能体图标排版"

# 文件列表
$files = @(
    @{
        "localPath" = "C:\Users\Administrator\CascadeProjects\CosmicWeave\website\index.html";
        "repoPath" = "index.html"
    },
    @{
        "localPath" = "C:\Users\Administrator\CascadeProjects\CosmicWeave\website\agents.html";
        "repoPath" = "agents.html"
    },
    @{
        "localPath" = "C:\Users\Administrator\CascadeProjects\CosmicWeave\website\community.html";
        "repoPath" = "community.html"
    },
    @{
        "localPath" = "C:\Users\Administrator\CascadeProjects\CosmicWeave\website\css\agents.css";
        "repoPath" = "css/agents.css"
    }
)

# 认证头
$headers = @{
    "Authorization" = "token $Token"
    "Accept" = "application/vnd.github.v3+json"
}

function Get-FileContent($path) {
    $content = Get-Content -Path $path -Raw -Encoding UTF8
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($content)
    return [System.Convert]::ToBase64String($bytes)
}

function Get-FileSha($repoPath) {
    try {
        $url = "https://api.github.com/repos/$owner/$repo/contents/$repoPath"
        $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Get
        return $response.sha
    } catch {
        return $null
    }
}

function Update-GitHubFile($localPath, $repoPath) {
    Write-Host "正在上传文件: $repoPath" -ForegroundColor Cyan
    
    try {
        # 读取文件内容并转为Base64
        $content = Get-FileContent -path $localPath
        
        # 获取当前文件SHA（如果存在）
        $sha = Get-FileSha -repoPath $repoPath
        
        # 准备请求体
        $body = @{
            "message" = $commitMessage
            "content" = $content
            "branch" = $branch
        }
        
        if ($sha) {
            $body.sha = $sha
            Write-Host "  文件已存在，将进行更新" -ForegroundColor Yellow
        } else {
            Write-Host "  文件不存在，将创建新文件" -ForegroundColor Green
        }
        
        # 发送API请求
        $url = "https://api.github.com/repos/$owner/$repo/contents/$repoPath"
        $bodyJson = $body | ConvertTo-Json
        $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Put -Body $bodyJson -ContentType "application/json"
        
        Write-Host "  上传成功!" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "  上传失败: $_" -ForegroundColor Red
        return $false
    }
}

# 主程序
Write-Host "开始上传文件到GitHub..." -ForegroundColor Cyan
Write-Host "仓库: $owner/$repo" -ForegroundColor Cyan
Write-Host "分支: $branch" -ForegroundColor Cyan
Write-Host "提交信息: $commitMessage" -ForegroundColor Cyan
Write-Host ""

$successCount = 0

foreach ($file in $files) {
    $result = Update-GitHubFile -localPath $file.localPath -repoPath $file.repoPath
    if ($result) {
        $successCount++
    }
}

Write-Host ""
if ($successCount -eq $files.Count) {
    Write-Host "所有文件上传成功!" -ForegroundColor Green
    Write-Host "GitHub Actions将自动部署网站，几分钟后即可访问 https://nexusorbital.com 查看更新" -ForegroundColor Cyan
} else {
    Write-Host "部分文件上传失败，成功上传了 $successCount 个文件（共 $($files.Count) 个）" -ForegroundColor Yellow
}

Write-Host ""
Pause
