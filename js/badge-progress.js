/**
 * NexusOrbital 徽章进度系统
 * 跟踪用户对不同徽章的解锁进度，并在行为触发时提供即时反馈
 */

// 徽章进度数据结构
const badgeProgressData = {
    explorer: { current: 35, total: 50, unit: '帖子', action: '浏览', name: '探险家' },
    pioneer: { current: 6, total: 10, unit: '原创内容', action: '发布', name: '先驱者' },
    scientist: { current: 1, total: 3, unit: '研究报告', action: '分享', name: '科学家' },
    star: { current: 28, total: 50, unit: '点赞', action: '获得', name: '社区之星' },
    connector: { current: 7, total: 10, unit: '成员', action: '互动', name: '连接者' },
    thinker: { current: 3, total: 5, unit: '深度讨论', action: '参与', name: '思想家' },
    engineer: { current: 0, total: 1, unit: '技术解决方案', action: '分享', name: '工程师' },
    navigator: { current: 0, total: 1, unit: '受欢迎主题', action: '创建', name: '领航员' },
    architect: { current: 0, total: 1, unit: '栖息地设计', action: '提出', name: '建筑师' }
};

// 徽章与用户行为的映射关系
const badgeActionMap = {
    'view-post': 'explorer',
    'create-post': 'pioneer',
    'share-research': 'scientist',
    'receive-like': 'star',
    'comment': 'connector',
    'deep-discussion': 'thinker',
    'share-solution': 'engineer',
    'create-popular-topic': 'navigator',
    'propose-design': 'architect'
};

// 初始化徽章进度系统
function initBadgeProgress() {
    // 为社区内的各种行为添加徽章进度跟踪
    attachBadgeProgressToPostActions();
    attachBadgeProgressToComments();
    attachBadgeProgressToSharing();
    
    // 添加演示用的帖子浏览跟踪
    trackPostViews();
}

// 为帖子操作按钮添加徽章进度跟踪
function attachBadgeProgressToPostActions() {
    // 点赞按钮
    const likeButtons = document.querySelectorAll('.post-action-btn[data-action="like"]');
    likeButtons.forEach(button => {
        button.addEventListener('click', function() {
            updateUserActionCount('receive-like', 1);
        });
    });
    
    // 评论按钮
    const commentButtons = document.querySelectorAll('.post-action-btn[data-action="comment"]');
    commentButtons.forEach(button => {
        button.addEventListener('click', function() {
            updateUserActionCount('comment', 1);
        });
    });
    
    // 分享按钮
    const shareButtons = document.querySelectorAll('.post-action-btn[data-action="share"]');
    shareButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 根据帖子类型决定触发哪种徽章进度
            const postType = this.closest('.post').getAttribute('data-post-type') || '';
            if (postType === 'research') {
                updateUserActionCount('share-research', 1);
            } else if (postType === 'solution') {
                updateUserActionCount('share-solution', 1);
            } else if (postType === 'design') {
                updateUserActionCount('propose-design', 1);
            }
        });
    });
    
    // 发帖按钮
    const createPostBtn = document.querySelector('.create-post-btn');
    if (createPostBtn) {
        createPostBtn.addEventListener('click', function() {
            // 这里只是演示，实际应该在发帖成功后触发
            setTimeout(() => {
                updateUserActionCount('create-post', 1);
            }, 2000);
        });
    }
}

// 为评论区添加徽章进度跟踪
function attachBadgeProgressToComments() {
    // 评论提交按钮
    const commentForm = document.querySelector('.comment-form');
    if (commentForm) {
        commentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // 这里只是演示，实际应该在评论成功后触发
            updateUserActionCount('comment', 1);
            
            // 50%概率触发深度讨论徽章进度
            if (Math.random() > 0.5) {
                setTimeout(() => {
                    updateUserActionCount('deep-discussion', 1);
                }, 1000);
            }
        });
    }
}

// 为分享功能添加徽章进度跟踪
function attachBadgeProgressToSharing() {
    // 演示用，为所有分享按钮添加事件
    const shareFeatures = document.querySelectorAll('[data-share-feature]');
    shareFeatures.forEach(feature => {
        feature.addEventListener('click', function() {
            const featureType = this.getAttribute('data-share-feature');
            if (featureType === 'research') {
                updateUserActionCount('share-research', 1);
            } else if (featureType === 'solution') {
                updateUserActionCount('share-solution', 1);
            } else if (featureType === 'design') {
                updateUserActionCount('propose-design', 1);
            }
        });
    });
}

// 模拟帖子浏览行为的跟踪
function trackPostViews() {
    // 演示用，每次页面加载时增加浏览数
    setTimeout(() => {
        updateUserActionCount('view-post', 1);
    }, 5000);
    
    // 点击帖子时也增加浏览数
    const posts = document.querySelectorAll('.post');
    posts.forEach(post => {
        post.addEventListener('click', function(e) {
            // 避免点击操作按钮时重复计数
            if (!e.target.closest('.post-actions')) {
                updateUserActionCount('view-post', 1);
            }
        });
    });
}

// 更新用户行动计数和徽章进度
function updateUserActionCount(actionType, count) {
    // 获取对应的徽章ID
    const badgeId = badgeActionMap[actionType];
    if (!badgeId || !badgeProgressData[badgeId]) return;
    
    // 更新进度数据
    const badge = badgeProgressData[badgeId];
    const oldProgress = Math.min(100, Math.round((badge.current / badge.total) * 100));
    
    badge.current = Math.min(badge.total, badge.current + count);
    const newProgress = Math.min(100, Math.round((badge.current / badge.total) * 100));
    
    // 如果进度有变化，显示通知
    if (newProgress > oldProgress) {
        // 进度通知
        showBadgeProgressNotification(badge, newProgress);
        
        // 检查是否解锁
        if (newProgress >= 100 && oldProgress < 100) {
            showBadgeUnlockedNotification(badge);
        }
    }
}

// 显示徽章进度通知
function showBadgeProgressNotification(badge, progress) {
    // 使用社区交互模块中的showToast函数
    const message = `${badge.name}徽章进度 +${progress - Math.round((badge.current - 1) / badge.total * 100)}%`;
    if (typeof showToast === 'function') {
        showToast('badge-toast', null, message);
    } else {
        console.log('徽章进度更新:', message);
    }
}

// 显示徽章解锁通知
function showBadgeUnlockedNotification(badge) {
    // 使用更醒目的通知
    if (typeof showToast === 'function') {
        setTimeout(() => {
            showToast('badge-toast', badge.name, `恭喜！您已解锁【${badge.name}】徽章！`);
        }, 1500);
    } else {
        console.log('徽章解锁:', badge.name);
    }
    
    // 触发徽章动画效果
    animateBadgeUnlock(badge.name);
}

// 徽章解锁动画效果
function animateBadgeUnlock(badgeName) {
    // 查找对应的徽章元素
    const badgeItem = document.querySelector(`.badge-item .badge-name:contains("${badgeName}")`);
    if (badgeItem) {
        const badgeIcon = badgeItem.parentElement.querySelector('.badge-icon');
        if (badgeIcon) {
            // 添加解锁效果
            badgeIcon.classList.remove('locked');
            badgeIcon.classList.add('unlocked');
            
            // 添加动画
            badgeIcon.style.animation = 'badge-unlock-pulse 1s ease-in-out 3';
        }
    }
}

// 初始化徽章进度系统
document.addEventListener('DOMContentLoaded', initBadgeProgress);
