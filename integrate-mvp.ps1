# NexusOrbital MVP集成脚本
# 将MVP功能直接集成到主网站

# 设置GitHub仓库信息
$githubToken = Read-Host -Prompt "请输入您的GitHub个人访问令牌" -AsSecureString
$token = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($githubToken))
$username = "Bai2025311"
$repoName = "nexusorbital-website"
$branch = "main"
$commitMessage = "将MVP功能直接集成到主网站"

# 首先，确保所有MVP相关文件已上传
$filesToUpload = @(
    # 核心JavaScript文件
    @{path="js/mvp.js"; localPath="e:\360MoveData\Users\Administrator\Documents\GitHub\nexusorbital-website\js\mvp.js"},
    @{path="js/integrations.js"; localPath="e:\360MoveData\Users\Administrator\Documents\GitHub\nexusorbital-website\js\integrations.js"},
    @{path="js/explorer-mode.js"; localPath="e:\360MoveData\Users\Administrator\Documents\GitHub\nexusorbital-website\js\explorer-mode.js"},
    
    # CSS文件
    @{path="css/mvp-unified.css"; localPath="e:\360MoveData\Users\Administrator\Documents\GitHub\nexusorbital-website\css\mvp-unified.css"}
)

Write-Host "步骤1: 上传MVP核心文件..." -ForegroundColor Cyan

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

# 步骤2: 更新主页，添加探索者模式和MVP功能入口
Write-Host "`n步骤2: 更新主页添加MVP功能入口..." -ForegroundColor Cyan

# 获取当前index.html文件
$indexPath = "https://api.github.com/repos/$username/$repoName/contents/index.html"
$headers = @{
    "Authorization" = "token $token"
    "Accept" = "application/vnd.github.v3+json"
}

try {
    $response = Invoke-RestMethod -Uri $indexPath -Headers $headers -Method Get
    $indexContent = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($response.content))
    $sha = $response.sha
    
    Write-Host "  成功获取index.html" -ForegroundColor Green
    
    # 添加探索者模式按钮到导航栏
    if ($indexContent -match '<ul class="navbar-nav[^>]*>(.*?)</ul>') {
        $navContent = $matches[1]
        $newNavItem = '<li class="nav-item"><a class="nav-link" href="#" id="explorer-mode-btn">探索者模式</a></li>'
        
        # 检查导航项是否已存在
        if ($navContent -notmatch 'explorer-mode-btn') {
            $newNavContent = $navContent + $newNavItem
            $indexContent = $indexContent -replace [regex]::Escape($navContent), $newNavContent
            Write-Host "  已添加探索者模式导航项" -ForegroundColor Green
        } else {
            Write-Host "  探索者模式导航项已存在" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  未找到导航栏，无法添加探索者模式按钮" -ForegroundColor Red
    }
    
    # 添加必要的脚本引用
    if ($indexContent -match '</body>') {
        $scriptsToAdd = @"
<!-- MVP集成脚本 -->
<script src="js/explorer-mode.js"></script>
<script src="js/integrations.js"></script>
<script src="js/mvp.js"></script>
<script>
// 初始化MVP功能
document.addEventListener('DOMContentLoaded', function() {
    if (window.NexusOrbital && window.NexusOrbital.MVP) {
        window.NexusOrbital.MVP.init();
    }
    
    // 绑定探索者模式按钮事件
    const explorerBtn = document.getElementById('explorer-mode-btn');
    if (explorerBtn) {
        explorerBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (window.NexusOrbital && window.NexusOrbital.ExplorerMode) {
                window.NexusOrbital.ExplorerMode.activate();
            }
        });
    }
});
</script>
"@
        
        # 检查脚本是否已存在
        if ($indexContent -notmatch 'explorer-mode.js') {
            $indexContent = $indexContent -replace '</body>', "$scriptsToAdd`n</body>"
            Write-Host "  已添加MVP相关脚本" -ForegroundColor Green
        } else {
            Write-Host "  MVP相关脚本已存在" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  未找到</body>标签，无法添加脚本" -ForegroundColor Red
    }
    
    # 添加探索者模式对话框
    if ($indexContent -match '</body>') {
        $modalHtml = @"
<!-- 探索者模式对话框 -->
<div class="modal fade" id="explorer-mode-modal" tabindex="-1" aria-labelledby="explorerModeModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="explorerModeModalLabel">欢迎使用探索者模式</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <p>探索者模式让您可以在不注册的情况下体验NexusOrbital的基本功能。</p>
        <p>您将可以:</p>
        <ul>
          <li>浏览社区内容</li>
          <li>使用基础设计工具</li>
          <li>查看教程和指南</li>
        </ul>
        <p>注册会员后可解锁更多高级功能!</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>
        <button type="button" class="btn btn-primary" id="confirm-explorer-mode">开始探索</button>
      </div>
    </div>
  </div>
</div>
"@
        
        # 检查模态框是否已存在
        if ($indexContent -notmatch 'explorer-mode-modal') {
            $indexContent = $indexContent -replace '</body>', "$modalHtml`n</body>"
            Write-Host "  已添加探索者模式对话框" -ForegroundColor Green
        } else {
            Write-Host "  探索者模式对话框已存在" -ForegroundColor Yellow
        }
    }
    
    # 更新index.html文件
    $updatedContentBytes = [System.Text.Encoding]::UTF8.GetBytes($indexContent)
    $updatedContentBase64 = [System.Convert]::ToBase64String($updatedContentBytes)
    
    $body = @{
        message = "$commitMessage - 更新主页添加MVP功能入口"
        content = $updatedContentBase64
        sha = $sha
        branch = $branch
    }
    
    $bodyJson = $body | ConvertTo-Json
    
    try {
        Invoke-RestMethod -Uri $indexPath -Headers $headers -Method Put -Body $bodyJson -ContentType "application/json"
        Write-Host "  成功更新index.html" -ForegroundColor Green
    } catch {
        Write-Host "  更新index.html失败" -ForegroundColor Red
        Write-Host "  错误: $_" -ForegroundColor Red
    }
    
} catch {
    Write-Host "  获取index.html失败" -ForegroundColor Red
    Write-Host "  错误: $_" -ForegroundColor Red
}

# 步骤3: 更新社区页面，集成MVP功能
Write-Host "`n步骤3: 更新社区页面集成MVP功能..." -ForegroundColor Cyan

# 获取当前community.html文件
$communityPath = "https://api.github.com/repos/$username/$repoName/contents/community.html"

try {
    $response = Invoke-RestMethod -Uri $communityPath -Headers $headers -Method Get
    $communityContent = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($response.content))
    $sha = $response.sha
    
    Write-Host "  成功获取community.html" -ForegroundColor Green
    
    # 添加必要的脚本引用
    if ($communityContent -match '</body>') {
        $scriptsToAdd = @"
<!-- MVP集成脚本 -->
<script src="js/explorer-mode.js"></script>
<script src="js/integrations.js"></script>
<script src="js/mvp.js"></script>
<script>
// 初始化MVP功能
document.addEventListener('DOMContentLoaded', function() {
    if (window.NexusOrbital && window.NexusOrbital.MVP) {
        window.NexusOrbital.MVP.init();
    }
    
    // 检查用户权限并更新UI
    if (window.NexusOrbital && window.NexusOrbital.Integrations) {
        const hasPostPermission = window.NexusOrbital.Integrations.checkPermission('community_post_basic');
        const postButton = document.querySelector('.create-post-btn');
        
        if (postButton) {
            if (!hasPostPermission) {
                postButton.addEventListener('click', function(e) {
                    if (!window.NexusOrbital.Auth.isLoggedIn() && 
                        !window.NexusOrbital.ExplorerMode.isActive()) {
                        e.preventDefault();
                        // 显示登录或探索者模式选择
                        const confirmMsg = '需要登录才能发布内容。您想要登录还是使用探索者模式?';
                        if (confirm(confirmMsg)) {
                            window.location.href = '/login.html';
                        } else {
                            window.NexusOrbital.ExplorerMode.activate();
                        }
                    }
                });
            }
        }
    }
});
</script>
"@
        
        # 检查脚本是否已存在
        if ($communityContent -notmatch 'explorer-mode.js') {
            $communityContent = $communityContent -replace '</body>', "$scriptsToAdd`n</body>"
            Write-Host "  已添加MVP相关脚本到社区页面" -ForegroundColor Green
        } else {
            Write-Host "  MVP相关脚本已存在于社区页面" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  未找到</body>标签，无法添加脚本" -ForegroundColor Red
    }
    
    # 更新community.html文件
    $updatedContentBytes = [System.Text.Encoding]::UTF8.GetBytes($communityContent)
    $updatedContentBase64 = [System.Convert]::ToBase64String($updatedContentBytes)
    
    $body = @{
        message = "$commitMessage - 更新社区页面集成MVP功能"
        content = $updatedContentBase64
        sha = $sha
        branch = $branch
    }
    
    $bodyJson = $body | ConvertTo-Json
    
    try {
        Invoke-RestMethod -Uri $communityPath -Headers $headers -Method Put -Body $bodyJson -ContentType "application/json"
        Write-Host "  成功更新community.html" -ForegroundColor Green
    } catch {
        Write-Host "  更新community.html失败" -ForegroundColor Red
        Write-Host "  错误: $_" -ForegroundColor Red
    }
    
} catch {
    Write-Host "  获取community.html失败" -ForegroundColor Red
    Write-Host "  错误: $_" -ForegroundColor Red
}

Write-Host "`nMVP集成到主网站完成!" -ForegroundColor Green
Write-Host "GitHub Actions将自动构建并部署网站。" -ForegroundColor Cyan
Write-Host "请等待几分钟，然后访问以下链接查看更新：" -ForegroundColor White
Write-Host "- 主页（已添加探索者模式按钮）: https://nexusorbital.com" -ForegroundColor Yellow
Write-Host "- 社区页面（已集成MVP功能）: https://nexusorbital.com/community.html" -ForegroundColor Yellow
Write-Host "`n提示: 如果页面未更新，请尝试清除浏览器缓存（Ctrl+F5）或使用隐私模式打开链接" -ForegroundColor Cyan

Pause
