/**
 * NexusOrbital 社区移动端功能
 * 版本: 1.0.0
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化过滤器按钮
    initFilterButtons();
    
    // 初始化发帖按钮
    initNewPostButton();
    
    // 初始化帖子交互
    initPostInteractions();
    
    // 初始化用户状态
    initUserStatus();
});

// 全局变量 - 用户登录状态
let isUserLoggedIn = false;
// 禁用社区登录强制检查
const disableCommunityLoginCheck = true;

/**
 * 初始化用户状态
 */
function initUserStatus() {
    // 这里可以从localStorage或cookie中获取用户登录状态
    // 为了演示，我们假设用户未登录
    isUserLoggedIn = false;
    
    // 检查登录状态
    checkLoginStatus();
}

/**
 * 检查登录状态
 */
function checkLoginStatus() {
    // 如果禁用了社区登录检查，则不进行强制登录检查
    if (disableCommunityLoginCheck) {
        console.log('社区登录检查已禁用，允许非登录用户浏览内容');
        return;
    }
    
    // 如果用户未登录，则可以在这里处理重定向到登录页面的逻辑
    if (!isUserLoggedIn) {
        // window.location.href = 'new-login.html';
    }
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
            
            // 这里可以添加筛选内容的逻辑
            const filterType = this.textContent.trim();
            console.log(`筛选类型: ${filterType}`);
            
            // 示例：根据筛选类型获取帖子
            // fetchPosts(filterType);
        });
    });
}

/**
 * 初始化发帖按钮
 */
function initNewPostButton() {
    const newPostButton = document.querySelector('.new-post-button');
    const newPostModal = document.getElementById('new-post-modal');
    const closeModalButton = document.querySelector('.close-modal');
    const cancelButton = document.getElementById('cancel-post');
    const submitButton = document.getElementById('submit-post');
    
    // 点击发帖按钮显示弹窗
    if (newPostButton) {
        newPostButton.addEventListener('click', function() {
            // 检查登录状态，未登录则提示登录
            if (!isUserLoggedIn) {
                showLoginPrompt('发表帖子');
                return;
            }
            
            if (newPostModal) {
                newPostModal.style.display = 'flex';
                document.body.style.overflow = 'hidden'; // 防止背景滚动
            }
        });
    }
    
    // 关闭弹窗的几种方式
    if (closeModalButton) {
        closeModalButton.addEventListener('click', closeModal);
    }
    
    if (cancelButton) {
        cancelButton.addEventListener('click', closeModal);
    }
    
    // 点击弹窗外部关闭弹窗
    if (newPostModal) {
        newPostModal.addEventListener('click', function(event) {
            if (event.target === newPostModal) {
                closeModal();
            }
        });
    }
    
    // 提交发帖
    if (submitButton) {
        submitButton.addEventListener('click', function() {
            const titleInput = document.getElementById('post-title');
            const contentInput = document.getElementById('post-content');
            const categorySelect = document.getElementById('post-category');
            
            if (!titleInput || !contentInput) return;
            
            const title = titleInput.value.trim();
            const content = contentInput.value.trim();
            const category = categorySelect ? categorySelect.value : '';
            
            if (!title || !content) {
                alert('请填写完整信息');
                return;
            }
            
            // 这里可以添加发帖的逻辑
            console.log('发布新帖子:', { title, content, category });
            
            // 发布成功后关闭弹窗
            closeModal();
            
            // 清空表单
            document.getElementById('post-form').reset();
            
            // 显示成功提示
            showToast('发布成功！');
        });
    }
    
    /**
     * 关闭弹窗
     */
    function closeModal() {
        if (newPostModal) {
            newPostModal.style.display = 'none';
            document.body.style.overflow = ''; // 恢复背景滚动
        }
    }
}

/**
 * 初始化帖子交互
 */
function initPostInteractions() {
    const actionButtons = document.querySelectorAll('.action-button');
    
    actionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.querySelector('i').className;
            
            // 根据不同的操作执行不同的逻辑
            if (action.includes('fa-comment')) {
                // 检查登录状态，未登录则提示登录
                if (!isUserLoggedIn) {
                    showLoginPrompt('评论');
                    return;
                }
                
                console.log('点击了评论按钮');
                // 打开评论区
            } else if (action.includes('fa-heart')) {
                // 检查登录状态，未登录则提示登录
                if (!isUserLoggedIn) {
                    showLoginPrompt('点赞');
                    return;
                }
                
                console.log('点击了点赞按钮');
                
                // 判断是否已点赞
                const isLiked = this.querySelector('i').classList.contains('fas');
                
                if (isLiked) {
                    // 取消点赞
                    this.querySelector('i').classList.replace('fas', 'far');
                    // 更新点赞数
                    let likeCount = parseInt(this.textContent.trim());
                    this.textContent = '';
                    this.appendChild(document.createElement('i')).className = 'far fa-heart';
                    this.append(` ${likeCount - 1}`);
                } else {
                    // 添加点赞
                    this.querySelector('i').classList.replace('far', 'fas');
                    // 更新点赞数
                    let likeCount = parseInt(this.textContent.trim());
                    this.textContent = '';
                    this.appendChild(document.createElement('i')).className = 'fas fa-heart';
                    this.append(` ${likeCount + 1}`);
                }
            } else if (action.includes('fa-bookmark')) {
                // 检查登录状态，未登录则提示登录
                if (!isUserLoggedIn) {
                    showLoginPrompt('收藏');
                    return;
                }
                
                console.log('点击了收藏按钮');
                
                // 判断是否已收藏
                const isBookmarked = this.querySelector('i').classList.contains('fas');
                
                if (isBookmarked) {
                    // 取消收藏
                    this.querySelector('i').classList.replace('fas', 'far');
                } else {
                    // 添加收藏
                    this.querySelector('i').classList.replace('far', 'fas');
                    // 显示成功提示
                    showToast('收藏成功！');
                }
            } else if (action.includes('fa-share-square')) {
                console.log('点击了分享按钮');
                
                // 简单的分享逻辑
                if (navigator.share) {
                    navigator.share({
                        title: document.title,
                        text: '查看这个NexusOrbital上的有趣话题',
                        url: window.location.href
                    })
                    .catch(error => console.log('分享失败:', error));
                } else {
                    // 不支持原生分享API
                    showToast('复制链接成功，快去分享吧！');
                }
            }
        });
    });
}

/**
 * 显示登录提示
 * @param {string} action - 用户想要执行的操作
 */
function showLoginPrompt(action) {
    showToast(`请先登录后再${action}`, 3000);
}

/**
 * 显示Toast消息
 * @param {string} message - 消息内容
 * @param {number} duration - 持续时间(毫秒)
 */
function showToast(message, duration = 2000) {
    // 创建Toast元素
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    
    // 添加样式
    toast.style.position = 'fixed';
    toast.style.bottom = '80px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    toast.style.color = 'white';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '20px';
    toast.style.fontSize = '14px';
    toast.style.zIndex = '2000';
    
    // 添加到文档
    document.body.appendChild(toast);
    
    // 定时移除
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s';
        
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 500);
    }, duration);
}

/**
 * 获取帖子数据（模拟）
 * @param {string} filter - 筛选类型
 */
function fetchPosts(filter) {
    // 这里可以根据筛选类型获取不同的帖子
    console.log(`获取${filter}类型的帖子`);
    
    // 模拟延迟
    setTimeout(() => {
        // 刷新帖子列表
        renderPosts([
            {
                id: 1,
                title: '月球基地舱室设计：如何在有限空间创造舒适感？',
                content: '在设计月球基地舱室时，我发现了一些能够在有限空间内创造舒适感的方法...',
                author: {
                    name: '星际探险家',
                    avatar: 'images/avatars/user1.jpg'
                },
                time: '2小时前',
                source: '太空人居',
                comments: 36,
                likes: 128
            },
            // 更多帖子...
        ]);
    }, 500);
}

/**
 * 渲染帖子列表
 * @param {Array} posts - 帖子数据
 */
function renderPosts(posts) {
    const container = document.querySelector('.posts-container');
    if (!container) return;
    
    // 清空容器
    container.innerHTML = '';
    
    // 添加帖子
    posts.forEach(post => {
        const postElement = createPostElement(post);
        container.appendChild(postElement);
    });
}

/**
 * 创建帖子元素
 * @param {Object} post - 帖子数据
 * @returns {HTMLElement} - 帖子元素
 */
function createPostElement(post) {
    const postElement = document.createElement('div');
    postElement.className = 'post-card';
    
    postElement.innerHTML = `
        <div class="post-author">
            <img src="${post.author.avatar}" alt="${post.author.name}" class="author-avatar">
            <div class="author-info">
                <div class="author-name">${post.author.name}</div>
                <div class="post-meta">${post.time} · 来自 ${post.source}</div>
            </div>
        </div>
        <div class="post-content">
            <h2 class="post-title">${post.title}</h2>
            <p class="post-text">${post.content}</p>
        </div>
        <div class="post-actions">
            <button class="action-button"><i class="far fa-comment"></i> ${post.comments}</button>
            <button class="action-button"><i class="far fa-heart"></i> ${post.likes}</button>
            <button class="action-button"><i class="far fa-bookmark"></i></button>
            <button class="action-button"><i class="far fa-share-square"></i></button>
        </div>
    `;
    
    return postElement;
}
