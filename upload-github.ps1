# GitHub File Upload Script
param(
    [Parameter(Mandatory=$true)]
    [string]$Token
)

$ErrorActionPreference = "Stop"

# Configuration
$owner = "Bai2025311"
$repo = "nexusorbital-website"
$branch = "main"
$commitMessage = "Update Logo to NexusOrbital and optimize agent icons layout"

# Files to upload
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

# Authentication headers
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
    Write-Host "Uploading file: $repoPath" -ForegroundColor Cyan
    
    try {
        # Read file content and convert to Base64
        $content = Get-FileContent -path $localPath
        
        # Get current file SHA (if exists)
        $sha = Get-FileSha -repoPath $repoPath
        
        # Prepare request body
        $body = @{
            "message" = $commitMessage
            "content" = $content
            "branch" = $branch
        }
        
        if ($sha) {
            $body.sha = $sha
            Write-Host "  File exists, updating..." -ForegroundColor Yellow
        } else {
            Write-Host "  File doesn't exist, creating..." -ForegroundColor Green
        }
        
        # Send API request
        $url = "https://api.github.com/repos/$owner/$repo/contents/$repoPath"
        $bodyJson = $body | ConvertTo-Json
        $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Put -Body $bodyJson -ContentType "application/json"
        
        Write-Host "  Upload successful!" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "  Upload failed: $_" -ForegroundColor Red
        return $false
    }
}

# Main program
Write-Host "Starting upload to GitHub..." -ForegroundColor Cyan
Write-Host "Repository: $owner/$repo" -ForegroundColor Cyan
Write-Host "Branch: $branch" -ForegroundColor Cyan
Write-Host "Commit message: $commitMessage" -ForegroundColor Cyan
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
    Write-Host "All files uploaded successfully!" -ForegroundColor Green
    Write-Host "GitHub Actions will automatically deploy the website. You can visit https://nexusorbital.com in a few minutes to see the updates" -ForegroundColor Cyan
} else {
    Write-Host "Some files failed to upload. Successfully uploaded $successCount files out of $($files.Count)" -ForegroundColor Yellow
}

Write-Host ""
Pause
