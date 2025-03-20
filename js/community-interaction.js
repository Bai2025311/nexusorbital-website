/**
 * NexusOrbital 社区页面交互功能
 * 包括统计动画、徽章通知、任务和模态窗口等功能
 */

// 页面加载后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化统计动画
    setTimeout(animateStats, 500);
    
    // 初始化任务按钮
    initTaskButton();
    
    // 延迟显示徽章获得通知（演示用）
    setTimeout(function() {
        showToast('badge-toast', '思想家');
    }, 3000);
});

/**
 * 参与度评分统计动画
 */
function animateStats() {
    const scoreBars = document.querySelectorAll('.score-bar');
    scoreBars.forEach(bar => {
        const targetWidth = bar.getAttribute('data-value') + '%';
        bar.style.width = '0%';
        setTimeout(function() {
            bar.style.transition = 'width 1s ease-in-out';
            bar.style.width = targetWidth;
        }, 100);
    });
}

/**
 * 初始化任务按钮
 */
function initTaskButton() {
    const viewTasksBtn = document.querySelector('.view-tasks');
    if (!viewTasksBtn) return;
    
    viewTasksBtn.addEventListener('click', function() {
        showTaskModal();
    });
    
    // 任务接受按钮
    const acceptTaskBtn = document.getElementById('accept-task');
    if (acceptTaskBtn) {
        acceptTaskBtn.addEventListener('click', function() {
            // 关闭任务模态窗口
            hideModal(document.getElementById('task-modal'));
            
            // 显示任务接受成功的提示
            setTimeout(function() {
                showToast('task-toast', null, '任务已接受！开始执行任务吧');
            }, 300);
        });
    }
}

/**
 * 显示任务模态窗口
 */
function showTaskModal() {
    const taskModal = document.getElementById('task-modal');
    if (!taskModal) return;
    
    // 随机选择一个任务
    const tasks = [
        {
            title: '分享一篇太空科技文章',
            description: '浏览社区，找到并分享一篇关于太空科技的文章，向社区成员传播知识。',
            scoreReward: 10,
            badgeProgress: '思想家徽章 +20%'
        },
        {
            title: '发布一个原创内容',
            description: '创建并发布一篇原创内容，分享你对太空探索或人居环境的见解。',
            scoreReward: 15,
            badgeProgress: '先驱者徽章 +10%'
        },
        {
            title: '评论三个帖子',
            description: '在社区中找到三个感兴趣的帖子，并留下有意义的评论参与讨论。',
            scoreReward: 8,
            badgeProgress: '连接者徽章 +15%'
        },
        {
            title: '上传一张太空照片',
            description: '上传一张与太空、天文或星际探索相关的照片，丰富社区的视觉内容。',
            scoreReward: 12,
            badgeProgress: '天文学家徽章 +25%'
        }
    ];
    
    const randomTask = tasks[Math.floor(Math.random() * tasks.length)];
    
    // 更新任务内容
    const titleEl = document.getElementById('task-title');
    const descEl = document.getElementById('task-description');
    
    if (titleEl) titleEl.textContent = randomTask.title;
    if (descEl) descEl.textContent = randomTask.description;
    
    const rewardItems = taskModal.querySelectorAll('.reward-item span');
    if (rewardItems.length > 0) {
        rewardItems[0].textContent = `+${randomTask.scoreReward} 参与度评分`;
        if (rewardItems.length > 1) {
            rewardItems[1].textContent = `进度 ${randomTask.badgeProgress}`;
        }
    }
    
    // 显示模态窗口
    showModal(taskModal);
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
    
    // 关闭按钮添加事件
    const closeButtons = modal.querySelectorAll('.close-modal, .close-modal-btn');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            hideModal(modal);
        });
    });
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
    }, 300);
}

/**
 * 显示Toast通知
 * @param {string} toastId - Toast元素ID
 * @param {string} badgeName - 徽章名称（徽章通知时使用）
 * @param {string} customMessage - 自定义消息（可选）
 */
function showToast(toastId, badgeName, customMessage) {
    const toast = document.getElementById(toastId);
    if (!toast) return;
    
    // 如果是徽章通知，更新徽章名称
    if (badgeName && toastId === 'badge-toast') {
        const badgeNameEl = document.getElementById('badge-name');
        if (badgeNameEl) badgeNameEl.textContent = badgeName;
    }
    
    // 如果有自定义消息，更新消息内容
    if (customMessage) {
        const messageEl = toast.querySelector('.toast-message');
        if (messageEl) messageEl.textContent = customMessage;
    }
    
    // 显示通知
    toast.classList.add('show');
    
    // 添加进度条动画
    const progressBar = toast.querySelector('.toast-progress');
    if (progressBar) {
        progressBar.style.transition = 'none';
        progressBar.style.width = '0';
        
        setTimeout(() => {
            progressBar.style.transition = 'width 5s linear';
            progressBar.style.width = '100%';
        }, 10);
    }
    
    // 5秒后自动隐藏
    setTimeout(() => {
        toast.classList.remove('show');
        // 重置进度条
        setTimeout(() => {
            if (progressBar) progressBar.style.width = '0';
        }, 300);
    }, 5000);
}

// 为社区互动功能添加演示事件
document.addEventListener('DOMContentLoaded', function() {
    // 为帖子点赞按钮添加演示事件
    const likeButtons = document.querySelectorAll('.post-action-btn[data-action="like"]');
    likeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 模拟点赞操作
            const likeCount = this.querySelector('.action-count');
            if (likeCount) {
                const currentCount = parseInt(likeCount.textContent) || 0;
                likeCount.textContent = currentCount + 1;
                
                // 显示点赞成功的提示
                showToast('task-toast', null, '点赞成功！获得参与度分数 +1');
                
                // 60%的概率触发徽章进度提示
                if (Math.random() > 0.4) {
                    setTimeout(() => {
                        showToast('badge-toast', null, '社区之星徽章进度 +5%');
                    }, 2000);
                }
            }
        });
    });
});
