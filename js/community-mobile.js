/**
 * NexusOrbital 社区移动端功能
 * 版本: 1.0.0
 */

document.addEventListener('DOMContentLoaded', function() {
    // 创建星空背景
    createStarryBackground();
    
    // 初始化动态指标
    initDynamicStats();
    
    // 初始化过滤器按钮
    initFilterButtons();
    
    // 初始化发帖按钮
    initNewPostButton();
    
    // 初始化帖子交互
    initPostInteractions();
    
    // 初始化用户状态
    initUserStatus();
    
    // 初始化AI任务舱提示
    initAIAssistantPrompt();
});

// 全局变量 - 用户登录状态
let isUserLoggedIn = false;

/**
 * 创建星空背景
 */
function createStarryBackground() {
    const starsContainer = document.querySelector('.stars-background');
    const starCount = 100; // 星星数量
    
    if (!starsContainer) return;
    
    // 清空容器
    starsContainer.innerHTML = '';
    
    // 创建星星
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        // 随机大小（1-3像素）
        const size = Math.random() * 2 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        
        // 随机位置
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        star.style.left = `${left}%`;
        star.style.top = `${top}%`;
        
        // 随机闪烁时间（2-6秒）
        const duration = Math.random() * 4 + 2;
        star.style.setProperty('--duration', `${duration}s`);
        
        // 随机开始时间（避免所有星星同时闪烁）
        const delay = Math.random() * 5;
        star.style.animationDelay = `${delay}s`;
        
        // 添加到容器
        starsContainer.appendChild(star);
    }
}

/**
 * 初始化动态指标
 */
function initDynamicStats() {
    const stats = [
        {
            selector: '[data-stat="discussions"] .stat-value',
            changeSelector: '[data-stat="discussions"] .stat-change',
            progressSelector: '[data-stat="discussions"] .progress-value',
            min: 1200,
            max: 1300,
            format: (value) => value.toString(),
            interval: 8000
        },
        {
            selector: '[data-stat="users"] .stat-value',
            changeSelector: '[data-stat="users"] .stat-change',
            progressSelector: '[data-stat="users"] .progress-value',
            min: 380,
            max: 400,
            format: (value) => value.toString(),
            interval: 5000
        },
        {
            selector: '[data-stat="projects"] .stat-value',
            changeSelector: '[data-stat="projects"] .stat-change',
            progressSelector: '[data-stat="projects"] .progress-value',
            min: 50,
            max: 60,
            format: (value) => value.toString(),
            interval: 10000
        }
    ];
    
    // 初始化和设置每个统计数据的定时更新
    stats.forEach(stat => {
        const valueEl = document.querySelector(stat.selector);
        const changeEl = document.querySelector(stat.changeSelector);
        const progressEl = document.querySelector(stat.progressSelector);
        
        if (!valueEl) return;
        
        // 初始值
        const initialValue = parseInt(valueEl.textContent);
        let lastValue = initialValue;
        
        // 设置定时器
        setInterval(() => {
            // 生成新值
            const newValue = Math.floor(Math.random() * (stat.max - stat.min + 1)) + stat.min;
            const change = newValue - lastValue;
            const changePercent = ((change / lastValue) * 100).toFixed(1);
            
            // 更新DOM
            valueEl.textContent = stat.format(newValue);
            
            if (changeEl) {
                changeEl.textContent = changePercent >= 0 ? `+${changePercent}%` : `${changePercent}%`;
                changeEl.style.color = changePercent >= 0 ? 'var(--positive-color)' : 'var(--negative-color)';
            }
            
            if (progressEl) {
                const progress = ((newValue - stat.min) / (stat.max - stat.min)) * 100;
                progressEl.style.width = `${progress}%`;
            }
            
            lastValue = newValue;
        }, stat.interval);
    });
}

/**
 * 初始化用户状态
 */
function initUserStatus() {
    // 从localStorage中获取用户登录状态
    isUserLoggedIn = localStorage.getItem('auth_token') !== null;
    
    // 检查登录状态
    checkLoginStatus();
}

/**
 * 检查登录状态
 */
function checkLoginStatus() {
    // 如果设置了禁用社区登录检查标志，则不进行强制登录检查
    if (window.disableCommunityLoginCheck) {
        console.log('社区页面：已禁用自动登录检查');
        return;
    }
    
    // 如果用户未登录，则可以在这里处理重定向到登录页面的逻辑
    if (!isUserLoggedIn) {
        window.location.href = 'login.html';
    }
}

function isLoggedIn() {
    return isUserLoggedIn;
}

/**
 * 初始化过滤器按钮
 */
function initFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-button');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 移除所有按钮的活跃状态
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // 添加当前按钮的活跃状态
            this.classList.add('active');
            
            // 过滤内容
            const filterType = this.textContent.trim();
            console.log(`筛选类型: ${filterType}`);
            
            // 通知AI助手
            if (window.gravitySystem && window.gravitySystem.aiAssistant) {
                window.gravitySystem.aiAssistant.addMessage('系统', `已切换到"${filterType}"过滤器`, 'system');
            }
            
            // 模拟数据加载动画
            const content = document.querySelector('.content');
            if (content) {
                content.style.opacity = '0.6';
                setTimeout(() => {
                    content.style.opacity = '1';
                }, 600);
            }
        });
    });
}

/**
 * 初始化发帖按钮
 */
function initNewPostButton() {
    const newPostButton = document.querySelector('.new-post-button');
    const postModal = document.getElementById('postModal');
    const closeModalButton = document.querySelector('.close-modal');
    const cancelButton = document.getElementById('cancel-post');
    const publishButton = document.getElementById('publish-post');
    
    if (!newPostButton || !postModal) return;
    
    // 点击发帖按钮
    newPostButton.addEventListener('click', () => {
        // 检查登录状态，如果禁用了登录检查则不拦截
        if (!isUserLoggedIn && !window.disableCommunityLoginCheck) {
            showLoginPrompt('发表帖子');
            return;
        }
        
        // 显示模态框
        postModal.style.display = 'flex';
        setTimeout(() => {
            postModal.querySelector('.modal-content').style.transform = 'translateY(0)';
        }, 10);
    });
    
    // 关闭模态框
    const closeModal = () => {
        postModal.querySelector('.modal-content').style.transform = 'translateY(20px)';
        setTimeout(() => {
            postModal.style.display = 'none';
        }, 300);
    };
    
    if (closeModalButton) {
        closeModalButton.addEventListener('click', closeModal);
    }
    
    if (cancelButton) {
        cancelButton.addEventListener('click', closeModal);
    }
    
    // 发布帖子
    if (publishButton) {
        publishButton.addEventListener('click', () => {
            const title = document.getElementById('post-title').value;
            const content = document.getElementById('post-content').value;
            const category = document.getElementById('post-category').value;
            
            if (!title || !content || !category) {
                showToast('请填写完整的帖子信息', 2000);
                return;
            }
            
            // 模拟发布
            showToast('帖子发布成功！', 2000);
            closeModal();
            
            // 清空表单
            document.getElementById('post-title').value = '';
            document.getElementById('post-content').value = '';
            document.getElementById('post-category').value = '';
        });
    }
}

/**
 * 初始化帖子交互
 */
function initPostInteractions() {
    const actionButtons = document.querySelectorAll('.action-button');
    
    actionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            
            // 如果未登录且需要登录的操作，且未禁用社区登录检查
            if (!isUserLoggedIn && !window.disableCommunityLoginCheck && (action === 'like' || action === 'comment' || action === 'bookmark')) {
                showLoginPrompt(getActionText(action));
                return;
            }
            
            // 执行相应的操作
            switch (action) {
                case 'like':
                    toggleLike(this);
                    break;
                case 'comment':
                    showCommentForm(this);
                    break;
                case 'bookmark':
                    toggleBookmark(this);
                    break;
                case 'share':
                    showShareOptions(this);
                    break;
            }
        });
    });
}

/**
 * 获取操作文本
 * @param {string} action - 操作类型
 * @returns {string} - 操作文本
 */
function getActionText(action) {
    switch (action) {
        case 'like': return '点赞';
        case 'comment': return '评论';
        case 'bookmark': return '收藏';
        case 'share': return '分享';
        default: return '该操作';
    }
}

/**
 * 切换点赞状态
 * @param {HTMLElement} button - 点赞按钮
 */
function toggleLike(button) {
    const icon = button.querySelector('i');
    const countText = button.textContent.trim().replace(/[^\d]/g, '');
    let count = parseInt(countText) || 0;
    
    if (icon.classList.contains('fas')) {
        // 取消点赞
        icon.classList.remove('fas');
        icon.classList.add('far');
        count = Math.max(0, count - 1);
    } else {
        // 点赞
        icon.classList.remove('far');
        icon.classList.add('fas');
        count++;
        
        // 显示点赞动画
        const animatedHeart = document.createElement('div');
        animatedHeart.className = 'animated-heart';
        animatedHeart.innerHTML = '<i class="fas fa-heart"></i>';
        button.appendChild(animatedHeart);
        
        setTimeout(() => {
            animatedHeart.remove();
        }, 1000);
    }
    
    button.innerHTML = `<i class="${icon.className}"></i> ${count}`;
}

/**
 * 显示评论表单
 * @param {HTMLElement} button - 评论按钮
 */
function showCommentForm(button) {
    const postCard = button.closest('.post-card');
    if (!postCard) return;
    
    let commentForm = postCard.querySelector('.comment-form');
    
    if (commentForm) {
        // 如果评论表单已存在，则切换显示/隐藏
        commentForm.classList.toggle('active');
        if (commentForm.classList.contains('active')) {
            commentForm.querySelector('textarea').focus();
        }
    } else {
        // 创建评论表单
        commentForm = document.createElement('div');
        commentForm.className = 'comment-form active';
        commentForm.innerHTML = `
            <textarea placeholder="发表你的评论..."></textarea>
            <div class="comment-actions">
                <button class="cancel-comment">取消</button>
                <button class="submit-comment">发送</button>
            </div>
        `;
        
        // 添加到帖子卡片
        postCard.appendChild(commentForm);
        
        // 焦点到文本框
        setTimeout(() => {
            commentForm.querySelector('textarea').focus();
        }, 10);
        
        // 添加事件监听器
        commentForm.querySelector('.cancel-comment').addEventListener('click', () => {
            commentForm.classList.remove('active');
        });
        
        commentForm.querySelector('.submit-comment').addEventListener('click', () => {
            const commentText = commentForm.querySelector('textarea').value.trim();
            if (commentText) {
                // 这里可以添加发送评论的逻辑
                showToast('评论已发送', 2000);
                commentForm.querySelector('textarea').value = '';
                commentForm.classList.remove('active');
            } else {
                showToast('请输入评论内容', 2000);
            }
        });
    }
}

/**
 * 切换收藏状态
 * @param {HTMLElement} button - 收藏按钮
 */
function toggleBookmark(button) {
    const icon = button.querySelector('i');
    
    if (icon.classList.contains('fas')) {
        // 取消收藏
        icon.classList.remove('fas');
        icon.classList.add('far');
        showToast('已取消收藏', 1500);
    } else {
        // 收藏
        icon.classList.remove('far');
        icon.classList.add('fas');
        showToast('已添加到收藏', 1500);
    }
}

/**
 * 显示分享选项
 * @param {HTMLElement} button - 分享按钮
 */
function showShareOptions(button) {
    // 创建分享菜单
    let shareMenu = document.querySelector('.share-menu');
    
    if (shareMenu) {
        // 如果分享菜单已存在，则移除它
        shareMenu.remove();
        return;
    }
    
    shareMenu = document.createElement('div');
    shareMenu.className = 'share-menu';
    shareMenu.innerHTML = `
        <div class="share-option"><i class="fab fa-weixin"></i> 微信</div>
        <div class="share-option"><i class="fab fa-weibo"></i> 微博</div>
        <div class="share-option"><i class="fas fa-link"></i> 复制链接</div>
        <div class="share-option"><i class="fas fa-qrcode"></i> 二维码</div>
    `;
    
    // 定位菜单
    const rect = button.getBoundingClientRect();
    shareMenu.style.top = `${rect.bottom + window.scrollY + 10}px`;
    shareMenu.style.right = `${window.innerWidth - rect.right - 10}px`;
    
    // 添加到文档
    document.body.appendChild(shareMenu);
    
    // 添加点击事件
    shareMenu.querySelectorAll('.share-option').forEach(option => {
        option.addEventListener('click', () => {
            const platform = option.textContent.trim();
            showToast(`已分享到${platform}`, 1500);
            shareMenu.remove();
        });
    });
    
    // 点击其他区域关闭菜单
    document.addEventListener('click', function closeMenu(e) {
        if (!shareMenu.contains(e.target) && e.target !== button) {
            shareMenu.remove();
            document.removeEventListener('click', closeMenu);
        }
    });
}

/**
 * 初始化AI任务舱提示
 */
function initAIAssistantPrompt() {
    // 在页面加载后等待3秒显示AI助手提示
    setTimeout(() => {
        // 检查AI助手是否已初始化
        if (window.gravitySystem && window.gravitySystem.aiAssistant) {
            // 向AI助手添加欢迎消息
            window.gravitySystem.aiAssistant.togglePanel();
            
            // 3秒后自动关闭面板
            setTimeout(() => {
                window.gravitySystem.aiAssistant.closePanel();
            }, 3000);
        }
    }, 3000);
}

/**
 * 显示登录提示
 * @param {string} action - 用户想要执行的操作
 */
function showLoginPrompt(action) {
    showToast(`请先登录后再${action}`, 2000);
}

/**
 * 显示Toast消息
 * @param {string} message - 消息内容
 * @param {number} duration - 持续时间(毫秒)
 */
function showToast(message, duration = 2000) {
    // 检查是否已有Toast
    let toast = document.querySelector('.toast-message');
    
    if (toast) {
        // 清除现有的计时器
        clearTimeout(toast.dataset.timerId);
        
        // 更新消息
        toast.textContent = message;
    } else {
        // 创建新的Toast
        toast = document.createElement('div');
        toast.className = 'toast-message';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        // 动画效果
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
    }
    
    // 设置计时器在指定时间后隐藏Toast
    const timerId = setTimeout(() => {
        toast.classList.remove('show');
        
        // 动画结束后移除元素
        toast.addEventListener('transitionend', function() {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        });
    }, duration);
    
    // 保存计时器ID
    toast.dataset.timerId = timerId;
}
