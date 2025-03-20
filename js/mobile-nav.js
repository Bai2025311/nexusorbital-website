/**
 * NexusOrbital 移动导航系统
 * 版本: 1.0.0
 * 描述: 为星际人居技术平台提供移动端导航交互功能
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化移动导航系统
    initMobileNavigation();
    
    // 监听窗口大小变化，动态调整UI
    window.addEventListener('resize', handleResponsiveChanges);
});

/**
 * 初始化移动导航系统
 */
function initMobileNavigation() {
    // 检查DOM是否已注入导航结构，如果没有则添加
    if (!document.querySelector('.stellar-nav-container')) {
        createMobileNavigationDOM();
    }
    
    // 设置当前页面活跃状态
    setActiveNavItem();
    
    // 添加导航点击事件
    addNavigationEventListeners();
    
    // 初始状态检查
    handleResponsiveChanges();
}

/**
 * 创建移动导航DOM结构
 */
function createMobileNavigationDOM() {
    const navHTML = `
    <div class="stellar-nav-container">
        <nav class="stellar-navbar">
            <a href="index.html" class="nav-item" data-page="home">
                <div class="icon-container">
                    <div class="nav-icon dashboard-icon"></div>
                    <div class="orbit-animation"></div>
                </div>
                <span class="nav-label">指挥中心</span>
            </a>
            
            <a href="#" class="nav-item" data-page="funding">
                <div class="icon-container">
                    <div class="nav-icon funding-icon"></div>
                    <div class="orbit-animation"></div>
                </div>
                <span class="nav-label">星海计划</span>
            </a>
            
            <a href="community.html" class="nav-item" data-page="community">
                <div class="icon-container">
                    <div class="nav-icon community-icon"></div>
                    <div class="orbit-animation"></div>
                </div>
                <span class="nav-label">星环会议</span>
            </a>
            
            <a href="design-studio.html" class="nav-item" data-page="designs">
                <div class="icon-container">
                    <div class="nav-icon tech-icon"></div>
                    <div class="orbit-animation"></div>
                </div>
                <span class="nav-label">智能构建室</span>
            </a>
            
            <a href="#" class="nav-item" data-page="profile">
                <div class="icon-container">
                    <div class="nav-icon profile-icon"></div>
                    <div class="orbit-animation"></div>
                    <div class="notification-pulse" id="profile-notification" style="display:none;"></div>
                </div>
                <span class="nav-label">生命印记</span>
            </a>
        </nav>
    </div>
    `;
    
    // 添加到文档末尾
    document.body.insertAdjacentHTML('beforeend', navHTML);
}

/**
 * 设置当前页面导航项的活跃状态
 */
function setActiveNavItem() {
    const navItems = document.querySelectorAll('.nav-item');
    const currentPath = window.location.pathname;
    
    // 清除所有活跃状态
    navItems.forEach(item => item.classList.remove('active'));
    
    // 根据当前页面路径设置活跃项
    if (currentPath.includes('index.html') || currentPath.endsWith('/')) {
        document.querySelector('[data-page="home"]').classList.add('active');
    } else if (currentPath.includes('community.html')) {
        document.querySelector('[data-page="community"]').classList.add('active');
    } else if (currentPath.includes('funding.html')) {
        document.querySelector('[data-page="funding"]').classList.add('active');
    } else if (currentPath.includes('tech.html')) {
        document.querySelector('[data-page="tech"]').classList.add('active');
    } else if (currentPath.includes('profile.html')) {
        document.querySelector('[data-page="profile"]').classList.add('active');
    } else if (currentPath.includes('design-studio.html')) {
        document.querySelector('[data-page="designs"]').classList.add('active');
    }
}

/**
 * 添加导航交互事件监听
 */
function addNavigationEventListeners() {
    // 获取所有导航项
    const navItems = document.querySelectorAll('.nav-item');
    
    // 为尚未实现的页面添加点击事件
    navItems.forEach(item => {
        const page = item.getAttribute('data-page');
        
        // 在社区页面中特殊处理profile点击
        if (page === 'profile' && window.location.pathname.includes('community.html') && window.disableCommunityLoginCheck) {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                
                // 显示友好提示
                const message = document.createElement('div');
                message.className = 'toast-message info';
                message.innerHTML = '<i class="fas fa-info-circle"></i> 登录后可访问个人空间';
                document.body.appendChild(message);
                
                // 显示淡入效果
                setTimeout(() => {
                    message.classList.add('show');
                }, 10);
                
                // 几秒后自动消失
                setTimeout(() => {
                    message.classList.remove('show');
                    setTimeout(() => {
                        message.remove();
                    }, 300);
                }, 3000);
            });
            return; // 仅跳过当前项的后续处理
        }
        // 对于尚未实现的页面，阻止默认行为并显示信息
        else if (item.getAttribute('href') === '#') {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                showFeatureComingSoon(page);
            });
        }
    });
    
    // 添加探索者模式按钮到移动导航上下文菜单
    addExplorerModeToMenu();
}

/**
 * 显示功能即将推出提示
 * @param {string} feature - 功能名称
 */
function showFeatureComingSoon(feature) {
    // 创建提示元素
    const toast = document.createElement('div');
    toast.className = 'feature-toast';
    toast.innerHTML = `
        <div class="toast-content">
            <div class="toast-icon">🚀</div>
            <div class="toast-message">
                <strong>${getFeatureLabel(feature)}</strong> 功能即将发布
                <div class="toast-submessage">目前处于开发阶段，敬请期待</div>
            </div>
        </div>
    `;
    
    // 添加样式
    toast.style.position = 'fixed';
    toast.style.bottom = '75px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = 'rgba(15, 76, 117, 0.9)';
    toast.style.color = 'white';
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '8px';
    toast.style.zIndex = '2000';
    toast.style.maxWidth = '80%';
    toast.style.backdropFilter = 'blur(10px)';
    toast.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
    
    // 添加到文档
    document.body.appendChild(toast);
    
    // 3秒后自动消失
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s ease';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

/**
 * 获取功能的中文标签
 * @param {string} feature - 功能代码
 * @return {string} 功能的用户友好名称
 */
function getFeatureLabel(feature) {
    const labels = {
        'funding': '星海计划',
        'tech': '技术资产库',
        'profile': '生命印记',
        'designs': '智能构建室'
    };
    
    return labels[feature] || feature;
}

/**
 * 添加探索者模式到上下文菜单
 */
function addExplorerModeToMenu() {
    // 如果当前是社区页面且设置了禁用登录检查标志，则不添加探索者模式
    if (window.location.pathname.includes('community.html') && window.disableCommunityLoginCheck) {
        console.log('社区页面移动端：禁用探索者模式菜单');
        return;
    }

    // 检查是否已有探索者模式功能
    if (window.toggleExplorerMode) {
        // 创建一个探索者模式入口点
        const profileItem = document.querySelector('[data-page="profile"]');
        
        if (profileItem) {
            profileItem.addEventListener('long-press', function(e) {
                // 显示探索者模式切换选项
                toggleExplorerMode();
            });
            
            // 检查探索者模式状态并显示通知提示
            const isExplorerMode = localStorage.getItem('explorerMode') === 'true';
            if (isExplorerMode) {
                document.getElementById('profile-notification').style.display = 'block';
            }
        }
    }
}

/**
 * 处理响应式UI变化
 */
function handleResponsiveChanges() {
    const mobileNav = document.querySelector('.stellar-nav-container');
    if (!mobileNav) return;
    
    // 根据窗口宽度控制导航显示
    if (window.innerWidth <= 768) {
        mobileNav.style.display = 'block';
        // 移除body的paddingBottom，避免多余空间
        document.body.style.paddingBottom = '0';
        
        // 只为需要的元素添加底部边距
        document.querySelectorAll('footer').forEach(footer => {
            if (footer) {
                footer.style.marginBottom = 'var(--nav-height)';
            }
        });
    } else {
        mobileNav.style.display = 'none';
        document.body.style.paddingBottom = '0';
        
        // 复原底部边距
        document.querySelectorAll('footer').forEach(footer => {
            if (footer) {
                footer.style.marginBottom = '0';
            }
        });
    }
}

// 更新于2025-03-20：修复了社区页面中的移动端登录弹窗问题
// 更新者：Cascade AI助手
