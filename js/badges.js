/**
 * NexusOrbital社区徽章系统
 * 处理徽章显示、徽章解锁和交互功能
 */

// 徽章数据
const badges = {
    explorer: {
        id: 'explorer',
        name: '探险家',
        icon: 'fa-rocket',
        description: '浏览50篇社区帖子，成为真正的太空探险者',
        progress: 35,
        total: 50,
        rarity: '普通',
        unlocked: false,
        unlockDate: null
    },
    pioneer: {
        id: 'pioneer',
        name: '先驱者',
        icon: 'fa-flag',
        description: '发布10篇原创内容，引领太空人居的未来',
        progress: 6,
        total: 10,
        rarity: '稀有',
        unlocked: false,
        unlockDate: null
    },
    scientist: {
        id: 'scientist',
        name: '科学家',
        icon: 'fa-microscope',
        description: '分享3篇研究报告，为人类太空生存提供科学依据',
        progress: 1,
        total: 3,
        rarity: '稀有',
        unlocked: false,
        unlockDate: null
    },
    star: {
        id: 'star',
        name: '社区之星',
        icon: 'fa-star',
        description: '获得50个点赞，成为社区瞩目的明星',
        progress: 28,
        total: 50,
        rarity: '普通',
        unlocked: false,
        unlockDate: null
    },
    connector: {
        id: 'connector',
        name: '连接者',
        icon: 'fa-link',
        description: '与10位不同的社区成员互动，建立太空探索者之间的联系',
        progress: 7,
        total: 10,
        rarity: '普通',
        unlocked: false,
        unlockDate: null
    },
    thinker: {
        id: 'thinker',
        name: '思想家',
        icon: 'fa-brain',
        description: '参与5次深度讨论，为人类的太空未来贡献思想',
        progress: 3,
        total: 5,
        rarity: '稀有',
        unlocked: false,
        unlockDate: null
    },
    engineer: {
        id: 'engineer',
        name: '工程师',
        icon: 'fa-tools',
        description: '分享1个技术解决方案，解决太空生存的技术难题',
        progress: 0,
        total: 1,
        rarity: '非常稀有',
        unlocked: false,
        unlockDate: null
    },
    navigator: {
        id: 'navigator',
        name: '领航员',
        icon: 'fa-compass',
        description: '创建1个受欢迎主题，引导社区讨论方向',
        progress: 0,
        total: 1,
        rarity: '非常稀有',
        unlocked: false,
        unlockDate: null
    },
    architect: {
        id: 'architect',
        name: '建筑师',
        icon: 'fa-drafting-compass',
        description: '提出1个栖息地设计方案，为太空殖民地规划蓝图',
        progress: 0,
        total: 1,
        rarity: '传奇',
        unlocked: false,
        unlockDate: null
    }
};

// 页面加载完成后初始化徽章系统
document.addEventListener('DOMContentLoaded', function() {
    // 初始化徽章显示
    initBadges();
    
    // 初始化徽章交互
    initBadgeInteractions();
    
    // 触发演示用徽章解锁（仅用于演示）
    // setTimeout(function() {
    //     unlockBadge('thinker');
    // }, 5000);
});

/**
 * 初始化徽章显示
 */
function initBadges() {
    const badgeContainer = document.querySelector('.badge-grid');
    if (!badgeContainer) return;
    
    // 清空容器
    badgeContainer.innerHTML = '';
    
    // 添加所有徽章
    Object.values(badges).forEach(badge => {
        const badgeItem = createBadgeElement(badge);
        badgeContainer.appendChild(badgeItem);
    });
}

/**
 * 创建徽章元素
 * @param {Object} badge - 徽章数据
 * @returns {HTMLElement} - 徽章元素
 */
function createBadgeElement(badge) {
    const badgeItem = document.createElement('div');
    badgeItem.className = 'badge-item';
    badgeItem.setAttribute('data-badge-id', badge.id);
    
    // 设置锁定状态的类名
    const lockedClass = badge.unlocked ? '' : 'locked';
    
    // 创建徽章HTML
    badgeItem.innerHTML = `
        <div class="badge-icon ${lockedClass}">
            <i class="fas ${badge.icon}"></i>
        </div>
        <div class="badge-name">${badge.name}</div>
        <div class="badge-progress-bar">
            <div class="badge-progress-fill" style="width: ${Math.min(100, (badge.progress / badge.total) * 100)}%"></div>
        </div>
        <div class="badge-progress-text">${badge.progress}/${badge.total}</div>
    `;
    
    return badgeItem;
}

/**
 * 初始化徽章交互
 */
function initBadgeInteractions() {
    // 徽章点击事件
    const badgeItems = document.querySelectorAll('.badge-item');
    badgeItems.forEach(item => {
        item.addEventListener('click', function() {
            const badgeId = this.getAttribute('data-badge-id');
            if (badgeId && badges[badgeId]) {
                showBadgeDetails(badges[badgeId]);
            }
        });
    });
    
    // 徽章模态窗口关闭按钮
    const closeModalButtons = document.querySelectorAll('.close-modal');
    closeModalButtons.forEach(button => {
        button.addEventListener('click', function() {
            hideModal(this.closest('.custom-modal'));
        });
    });
    
    // 徽章分享按钮
    const showShareButton = document.getElementById('show-share-panel');
    if (showShareButton) {
        showShareButton.addEventListener('click', function() {
            const sharePanel = document.getElementById('badge-share-panel');
            if (sharePanel) {
                sharePanel.style.display = sharePanel.style.display === 'none' ? 'block' : 'none';
            }
        });
    }
    
    // 分享选项点击
    const shareOptions = document.querySelectorAll('.share-option');
    shareOptions.forEach(option => {
        option.addEventListener('click', function() {
            const platform = this.getAttribute('data-platform');
            shareBadge(platform);
        });
    });
}

/**
 * 显示徽章详情
 * @param {Object} badge - 徽章数据
 */
function showBadgeDetails(badge) {
    // 获取模态窗口元素
    const modal = document.getElementById('badge-modal');
    if (!modal) return;
    
    // 更新徽章详情
    const titleEl = document.getElementById('badge-modal-title');
    const nameEl = document.getElementById('badge-name-detail');
    const descriptionEl = document.getElementById('badge-description');
    const progressFillEl = document.getElementById('badge-progress-fill');
    const progressTextEl = document.getElementById('badge-progress-text');
    const dateEl = document.getElementById('badge-date');
    const rarityEl = document.getElementById('badge-rarity');
    const iconEl = modal.querySelector('.badge-icon-large i');
    
    if (titleEl) titleEl.textContent = '徽章详情';
    if (nameEl) nameEl.textContent = badge.name;
    if (descriptionEl) descriptionEl.textContent = badge.description;
    
    // 设置进度条
    const progressPercent = Math.min(100, (badge.progress / badge.total) * 100);
    if (progressFillEl) progressFillEl.style.width = `${progressPercent}%`;
    if (progressTextEl) progressTextEl.textContent = `${progressPercent.toFixed(0)}%`;
    
    // 设置其他信息
    if (dateEl) dateEl.textContent = badge.unlockDate ? badge.unlockDate : '尚未获得';
    if (rarityEl) rarityEl.textContent = badge.rarity;
    
    // 设置图标
    if (iconEl) {
        iconEl.className = '';
        iconEl.classList.add('fas', badge.icon);
    }
    
    // 显示模态窗口
    showModal(modal);
}

/**
 * 显示模态窗口
 * @param {HTMLElement} modal - 模态窗口元素
 */
function showModal(modal) {
    if (!modal) return;
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.style.opacity = '1';
    }, 10);
}

/**
 * 隐藏模态窗口
 * @param {HTMLElement} modal - 模态窗口元素
 */
function hideModal(modal) {
    if (!modal) return;
    modal.style.opacity = '0';
    setTimeout(() => {
        modal.style.display = 'none';
        
        // 隐藏分享面板
        const sharePanel = document.getElementById('badge-share-panel');
        if (sharePanel) {
            sharePanel.style.display = 'none';
        }
    }, 300);
}

/**
 * 解锁徽章
 * @param {string} badgeId - 徽章ID
 */
function unlockBadge(badgeId) {
    if (!badges[badgeId]) return;
    
    // 设置解锁状态
    badges[badgeId].unlocked = true;
    badges[badgeId].unlockDate = new Date().toLocaleDateString();
    badges[badgeId].progress = badges[badgeId].total;
    
    // 更新徽章显示
    const badgeItem = document.querySelector(`.badge-item[data-badge-id="${badgeId}"]`);
    if (badgeItem) {
        // 移除锁定图标
        const badgeIcon = badgeItem.querySelector('.badge-icon');
        if (badgeIcon) badgeIcon.classList.remove('locked');
        
        // 更新进度条
        const progressFill = badgeItem.querySelector('.badge-progress-fill');
        if (progressFill) progressFill.style.width = '100%';
        
        // 更新进度文本
        const progressText = badgeItem.querySelector('.badge-progress-text');
        if (progressText) progressText.textContent = `${badges[badgeId].total}/${badges[badgeId].total}`;
        
        // 添加徽章解锁动画
        badgeIcon.style.animation = 'badge-unlock-pulse 1s ease-in-out 3';
    }
    
    // 显示解锁通知
    if (typeof showToast === 'function') {
        showToast('badge-toast', badges[badgeId].name);
    }
}

/**
 * 更新徽章进度
 * @param {string} badgeId - 徽章ID
 * @param {number} increment - 增加的进度值
 */
function updateBadgeProgress(badgeId, increment) {
    if (!badges[badgeId]) return;
    
    // 已解锁的徽章无需更新进度
    if (badges[badgeId].unlocked) return;
    
    // 更新进度
    const oldProgress = badges[badgeId].progress;
    badges[badgeId].progress = Math.min(badges[badgeId].total, badges[badgeId].progress + increment);
    
    // 更新徽章显示
    const badgeItem = document.querySelector(`.badge-item[data-badge-id="${badgeId}"]`);
    if (badgeItem) {
        // 更新进度条
        const progressPercent = (badges[badgeId].progress / badges[badgeId].total) * 100;
        const progressFill = badgeItem.querySelector('.badge-progress-fill');
        if (progressFill) progressFill.style.width = `${progressPercent}%`;
        
        // 更新进度文本
        const progressText = badgeItem.querySelector('.badge-progress-text');
        if (progressText) progressText.textContent = `${badges[badgeId].progress}/${badges[badgeId].total}`;
    }
    
    // 显示进度更新提示
    if (oldProgress !== badges[badgeId].progress && typeof showToast === 'function') {
        showToast('task-toast', null, `${badges[badgeId].name}徽章进度更新：${oldProgress} → ${badges[badgeId].progress}`);
    }
    
    // 检查是否满足解锁条件
    if (badges[badgeId].progress >= badges[badgeId].total) {
        // 解锁徽章
        unlockBadge(badgeId);
    }
}

/**
 * 分享徽章到社交平台
 * @param {string} platform - 分享平台
 */
function shareBadge(platform) {
    // 获取当前显示的徽章
    const badgeNameEl = document.getElementById('badge-name-detail');
    const badgeName = badgeNameEl ? badgeNameEl.textContent : '';
    
    // 根据平台执行分享
    let shareMessage = '';
    switch (platform) {
        case 'wechat':
            shareMessage = `已复制分享链接到剪贴板，请打开微信分享“我在NexusOrbital获得了${badgeName}徽章！”`;
            break;
        case 'weibo':
            shareMessage = `已复制分享链接到剪贴板，请打开微博分享“我在NexusOrbital获得了${badgeName}徽章！”`;
            break;
        case 'qq':
            shareMessage = `已复制分享链接到剪贴板，请打开QQ分享“我在NexusOrbital获得了${badgeName}徽章！”`;
            break;
        case 'link':
            shareMessage = '已复制徽章链接到剪贴板，可分享给任何人';
            break;
        default:
            shareMessage = '分享功能将在下一版本开放，敬请期待！';
    }
    
    // 显示分享成功提示
    alert(shareMessage);
    
    // 隐藏分享面板
    const sharePanel = document.getElementById('badge-share-panel');
    if (sharePanel) {
        sharePanel.style.display = 'none';
    }
}

// 暴露公共API
window.badgeSystem = {
    unlockBadge,
    updateBadgeProgress,
    showBadgeDetails
};
