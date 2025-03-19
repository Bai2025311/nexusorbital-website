/**
 * 寰宇脉络(NexusOrbital)社区功能JavaScript
 * 包含发帖功能、图片上传预览、社交分享和AI智能体互动
 */

// 确保该模块可以被其他模块调用
if (!window.NexusOrbital) {
    window.NexusOrbital = {};
}

// 创建Community命名空间
window.NexusOrbital.Community = {
    showPostModal: showPostModal,
    hidePostModal: hidePostModal,
    submitPost: submitPost,
    showLoginRequiredMessage: showLoginRequiredMessage,
    isLoggedIn: isLoggedIn,
    // 可以添加更多需要导出的函数
};

document.addEventListener('DOMContentLoaded', function() {
    // 初始化元素
    const newPostBtn = document.querySelector('.new-post-btn');
    const fabNewPost = document.querySelector('.fab-new-post');
    const modalOverlay = document.getElementById('post-modal-overlay');
    const closeModalBtn = document.querySelector('.close-modal');
    const cancelPostBtn = document.getElementById('cancel-post');
    const submitPostBtn = document.getElementById('submit-post');
    const askAiCheckbox = document.getElementById('ask-ai');
    const aiAgentSelect = document.getElementById('ai-agent');
    const filterButtons = document.querySelectorAll('.filter-buttons button');
    const postForm = document.getElementById('post-form');

    // 汉堡菜单
    const hamburger = document.querySelector(".hamburger");
    const navMenu = document.querySelector(".nav-menu");

    // 图片上传预览
    setupImageUploadPreviews();

    // AI智能体下拉框状态切换
    if (askAiCheckbox && aiAgentSelect) {
        askAiCheckbox.addEventListener('change', function() {
            aiAgentSelect.disabled = !this.checked;
        });
    }

    // 过滤按钮点击效果
    if (filterButtons) {
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // 移除所有按钮的active类
                filterButtons.forEach(btn => btn.classList.remove('active'));
                // 添加当前按钮的active类
                this.classList.add('active');
                // 这里可以添加实际的过滤逻辑
                filterPosts(this.textContent.trim());
            });
        });
    }

    // 汉堡菜单点击事件
    if (hamburger && navMenu) {
        hamburger.addEventListener("click", () => {
            hamburger.classList.toggle("active");
            navMenu.classList.toggle("active");
        });
    }

    // 发帖按钮点击事件
    if (newPostBtn) {
        newPostBtn.addEventListener('click', showPostModal);
    }

    // 悬浮发帖按钮点击事件
    if (fabNewPost) {
        fabNewPost.addEventListener('click', showPostModal);
    }

    // 关闭模态框按钮事件
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', hidePostModal);
    }

    // 取消发帖按钮事件
    if (cancelPostBtn) {
        cancelPostBtn.addEventListener('click', hidePostModal);
    }

    // 提交发帖按钮事件
    if (submitPostBtn && postForm) {
        submitPostBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (validatePostForm()) {
                submitPost();
            }
        });
    }

    // 点击模态框外部区域关闭模态框
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) {
                hidePostModal();
            }
        });
    }

    // 检查登录状态
    checkLoginStatus();
});

/**
 * 显示发帖模态框
 */
function showPostModal() {
    // 注释掉登录检查，允许未登录用户查看社区内容
    /*
    // 检查是否已登录
    if (!isLoggedIn()) {
        // 未登录时提示并跳转到登录页
        showLoginRequiredMessage();
        return;
    }
    */

    const modalOverlay = document.getElementById('post-modal-overlay');
    if (modalOverlay) {
        modalOverlay.classList.add('active');
        // 阻止页面滚动
        document.body.style.overflow = 'hidden';
    }
}

/**
 * 隐藏发帖模态框
 */
function hidePostModal() {
    const modalOverlay = document.getElementById('post-modal-overlay');
    if (modalOverlay) {
        modalOverlay.classList.remove('active');
        // 恢复页面滚动
        document.body.style.overflow = '';
        // 重置表单
        resetPostForm();
    }
}

/**
 * 重置发帖表单
 */
function resetPostForm() {
    const postForm = document.getElementById('post-form');
    if (postForm) {
        postForm.reset();
        
        // 重置图片上传预览
        const imageUploadBoxes = document.querySelectorAll('.image-upload-box');
        imageUploadBoxes.forEach(box => {
            if (box.classList.contains('has-preview')) {
                box.classList.remove('has-preview');
                // 移除预览图
                const previewImg = box.querySelector('img');
                if (previewImg) {
                    box.removeChild(previewImg);
                }
                // 恢复原始内容
                const plusIcon = document.createElement('i');
                plusIcon.className = 'fas fa-plus';
                const span = document.createElement('span');
                span.textContent = '添加图片';
                box.appendChild(plusIcon);
                box.appendChild(span);
            }
        });

        // 重置AI智能体下拉框状态
        const aiAgentSelect = document.getElementById('ai-agent');
        if (aiAgentSelect) {
            aiAgentSelect.disabled = true;
        }
    }
}

/**
 * 验证发帖表单
 * @returns {boolean} 表单是否有效
 */
function validatePostForm() {
    const postTitle = document.getElementById('post-title');
    const postCategory = document.getElementById('post-category');
    const postContent = document.getElementById('post-content');
    let isValid = true;
    
    // 移除之前的错误提示
    document.querySelectorAll('.error-message').forEach(el => el.remove());
    
    // 验证标题
    if (!postTitle.value.trim()) {
        showError(postTitle, '请输入帖子标题');
        isValid = false;
    }
    
    // 验证分类
    if (!postCategory.value) {
        showError(postCategory, '请选择帖子分类');
        isValid = false;
    }
    
    // 验证内容
    if (!postContent.value.trim()) {
        showError(postContent, '请输入帖子内容');
        isValid = false;
    }
    
    return isValid;
}

/**
 * 显示表单错误信息
 * @param {HTMLElement} element 表单元素
 * @param {string} message 错误信息
 */
function showError(element, message) {
    // 添加错误样式
    element.style.borderColor = '#ff4d4d';
    
    // 创建错误消息元素
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.style.color = '#ff4d4d';
    errorMessage.style.fontSize = '0.85rem';
    errorMessage.style.marginTop = '5px';
    errorMessage.textContent = message;
    
    // 添加到表单元素后面
    element.parentNode.appendChild(errorMessage);
    
    // 添加获取焦点时移除错误样式的事件
    element.addEventListener('focus', function() {
        this.style.borderColor = '';
        const errorMsg = this.parentNode.querySelector('.error-message');
        if (errorMsg) {
            errorMsg.remove();
        }
    }, { once: true });
}

/**
 * 提交帖子
 */
function submitPost() {
    // 获取表单数据
    const postTitle = document.getElementById('post-title').value;
    const postCategory = document.getElementById('post-category').value;
    const postContent = document.getElementById('post-content').value;
    const askAi = document.getElementById('ask-ai').checked;
    const aiAgent = document.getElementById('ai-agent').value;
    
    // 获取上传的图片
    const images = [];
    for (let i = 1; i <= 3; i++) {
        const imageInput = document.getElementById(`post-image-${i}`);
        if (imageInput && imageInput.files && imageInput.files[0]) {
            images.push(imageInput.files[0]);
        }
    }
    
    // 获取选中的社交媒体
    const socialShares = {
        weixin: document.getElementById('share-weixin').checked,
        weibo: document.getElementById('share-weibo').checked,
        xiaohongshu: document.getElementById('share-xiaohongshu').checked,
        youtube: document.getElementById('share-youtube').checked
    };
    
    // 这里是模拟提交，实际应该使用AJAX发送到后端
    console.log('提交帖子:', {
        title: postTitle,
        category: postCategory,
        content: postContent,
        askAi: askAi,
        aiAgent: aiAgent,
        images: images.length > 0 ? '有图片上传' : '无图片',
        socialShares: socialShares
    });
    
    // 上传图片
    if (images.length > 0) {
        uploadImages(images)
            .then(imageUrls => {
                // 创建帖子并添加图片URL
                createPost(postTitle, postCategory, postContent, imageUrls, askAi, aiAgent);
                
                // 分享到社交媒体
                if (Object.values(socialShares).some(val => val)) {
                    shareToSocialMedia(postTitle, postContent, imageUrls, socialShares);
                }
            })
            .catch(error => {
                console.error('图片上传失败:', error);
                // 不使用图片创建帖子
                createPost(postTitle, postCategory, postContent, [], askAi, aiAgent);
            });
    } else {
        // 无图片直接创建帖子
        createPost(postTitle, postCategory, postContent, [], askAi, aiAgent);
        
        // 分享到社交媒体
        if (Object.values(socialShares).some(val => val)) {
            shareToSocialMedia(postTitle, postContent, [], socialShares);
        }
    }
    
    // 显示成功消息并关闭模态框
    showSuccessMessage();
    hidePostModal();
    
    // 将新帖子添加到页面
    addPostToDOM(postTitle, postCategory, postContent, images);
}

/**
 * 上传图片
 * @param {File[]} images 图片文件数组
 * @returns {Promise<string[]>} 图片URL数组
 */
function uploadImages(images) {
    // 模拟图片上传，实际应使用AJAX/fetch上传到服务器
    return new Promise((resolve, reject) => {
        // 模拟上传延迟
        setTimeout(() => {
            try {
                const imageUrls = images.map((image, index) => {
                    // 创建临时的URL，实际中应该返回服务器上的URL
                    return URL.createObjectURL(image);
                });
                resolve(imageUrls);
            } catch (error) {
                reject(error);
            }
        }, 1000);
    });
}

/**
 * 创建帖子
 * @param {string} title 帖子标题
 * @param {string} category 帖子分类
 * @param {string} content 帖子内容
 * @param {string[]} imageUrls 图片URL数组
 * @param {boolean} askAi 是否请求AI评论
 * @param {string} aiAgent AI智能体类型
 */
function createPost(title, category, content, imageUrls, askAi, aiAgent) {
    // 实际应使用AJAX发送到后端存储
    console.log('创建帖子:', { title, category, content, imageUrls, askAi, aiAgent });
    
    // 如果请求AI评论，可以在这里处理
    if (askAi) {
        requestAiComment(title, content, aiAgent);
    }
}

/**
 * 请求AI智能体评论
 * @param {string} title 帖子标题
 * @param {string} content 帖子内容
 * @param {string} aiAgent 智能体类型
 */
function requestAiComment(title, content, aiAgent) {
    // 实际应调用AI接口或后端服务
    console.log('请求AI评论:', { title, content, aiAgent });
}

/**
 * 分享到社交媒体
 * @param {string} title 标题
 * @param {string} content 内容
 * @param {string[]} imageUrls 图片URL数组
 * @param {Object} platforms 选中的平台
 */
function shareToSocialMedia(title, content, imageUrls, platforms) {
    // 实际应集成各平台的分享API
    console.log('分享到社交媒体:', { title, content, imageUrls, platforms });
    
    // 微信分享
    if (platforms.weixin) {
        // 微信Web分享一般使用微信JSSDK
        console.log('分享到微信');
    }
    
    // 微博分享
    if (platforms.weibo) {
        // 微博分享API
        console.log('分享到微博');
    }
    
    // 小红书分享
    if (platforms.xiaohongshu) {
        // 小红书分享API
        console.log('分享到小红书');
    }
    
    // YouTube分享
    if (platforms.youtube) {
        // YouTube分享
        console.log('分享到YouTube');
    }
}

/**
 * 设置图片上传预览
 */
function setupImageUploadPreviews() {
    for (let i = 1; i <= 3; i++) {
        const imageInput = document.getElementById(`post-image-${i}`);
        const imageUploadBox = document.getElementById(`image-upload-${i}`);
        
        if (imageInput && imageUploadBox) {
            imageInput.addEventListener('change', function() {
                if (this.files && this.files[0]) {
                    const reader = new FileReader();
                    
                    reader.onload = function(e) {
                        // 清空上传框
                        imageUploadBox.innerHTML = '';
                        
                        // 添加预览图
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        img.className = 'preview-image';
                        imageUploadBox.appendChild(img);
                        
                        // 添加删除按钮
                        const removeBtn = document.createElement('div');
                        removeBtn.className = 'remove-image';
                        removeBtn.innerHTML = '<i class="fas fa-times"></i>';
                        removeBtn.addEventListener('click', function(e) {
                            e.stopPropagation();
                            // 重置文件输入
                            imageInput.value = '';
                            // 移除预览和恢复原始内容
                            imageUploadBox.innerHTML = '';
                            imageUploadBox.classList.remove('has-preview');
                            
                            const plusIcon = document.createElement('i');
                            plusIcon.className = 'fas fa-plus';
                            const span = document.createElement('span');
                            span.textContent = '添加图片';
                            imageUploadBox.appendChild(plusIcon);
                            imageUploadBox.appendChild(span);
                        });
                        imageUploadBox.appendChild(removeBtn);
                        
                        // 添加预览样式
                        imageUploadBox.classList.add('has-preview');
                    };
                    
                    reader.readAsDataURL(this.files[0]);
                }
            });
        }
    }
}

/**
 * 将新帖子添加到DOM
 * @param {string} title 帖子标题
 * @param {string} category 帖子分类
 * @param {string} content 帖子内容
 * @param {File[]} images 图片文件数组
 */
function addPostToDOM(title, category, content, images) {
    const postContainer = document.querySelector('.posts-container');
    if (!postContainer) return;
    
    // 创建帖子HTML
    const postCard = document.createElement('div');
    postCard.className = 'post-card';
    
    // 获取当前用户信息，实际中应从用户系统获取
    const currentUser = getCurrentUser();
    
    // 根据分类获取显示名称
    const categoryName = getCategoryDisplayName(category);
    
    // 设置帖子内容
    postCard.innerHTML = `
        <div class="post-header">
            <div class="avatar">
                <img src="${currentUser.avatar || 'images/avatars/default.jpg'}" alt="用户头像">
            </div>
            <div class="post-info">
                <div class="post-author">${currentUser.username || '匿名用户'}</div>
                <div class="post-meta">刚刚 · 来自 ${categoryName}</div>
            </div>
        </div>
        <h3 class="post-title">${title}</h3>
        <div class="post-content">${content}</div>
    `;
    
    // 如果有图片，添加图片区域
    if (images && images.length > 0) {
        const postImages = document.createElement('div');
        postImages.className = 'post-images';
        
        // 为每张图片创建预览
        images.forEach(image => {
            const postImage = document.createElement('div');
            postImage.className = 'post-image';
            
            const img = document.createElement('img');
            img.src = URL.createObjectURL(image);
            img.alt = '帖子图片';
            
            postImage.appendChild(img);
            postImages.appendChild(postImage);
        });
        
        postCard.appendChild(postImages);
    }
    
    // 添加操作按钮
    const postActions = document.createElement('div');
    postActions.className = 'post-actions';
    postActions.innerHTML = `
        <div class="post-action"><i class="far fa-heart"></i> 0</div>
        <div class="post-action"><i class="far fa-comment"></i> 0</div>
        <div class="post-action"><i class="far fa-bookmark"></i> 收藏</div>
        <div class="post-action"><i class="fas fa-share-alt"></i> 分享</div>
    `;
    
    postCard.appendChild(postActions);
    
    // 将新帖子插入到最前面
    if (postContainer.firstChild) {
        postContainer.insertBefore(postCard, postContainer.firstChild);
    } else {
        postContainer.appendChild(postCard);
    }
}

/**
 * 显示成功消息
 */
function showSuccessMessage() {
    // 创建消息元素
    const messageElement = document.createElement('div');
    messageElement.className = 'toast-message success';
    messageElement.innerHTML = '<i class="fas fa-check-circle"></i> 帖子发布成功！';
    
    // 添加到页面
    document.body.appendChild(messageElement);
    
    // 显示动画
    setTimeout(() => {
        messageElement.classList.add('show');
    }, 100);
    
    // 一段时间后自动隐藏
    setTimeout(() => {
        messageElement.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(messageElement);
        }, 300);
    }, 3000);
}

/**
 * 显示登录提示消息，但不跳转页面
 */
function showLoginRequiredMessage() {
    // 创建消息元素
    const messageElement = document.createElement('div');
    messageElement.className = 'toast-message warning';
    messageElement.innerHTML = '<i class="fas fa-exclamation-circle"></i> 请先登录后再发布内容';
    
    // 添加到页面
    document.body.appendChild(messageElement);
    
    // 显示动画
    setTimeout(() => {
        messageElement.classList.add('show');
    }, 100);
    
    // 一段时间后自动隐藏
    setTimeout(() => {
        messageElement.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(messageElement);
            // 不再跳转到登录页面，而是在当前页面尝试打开登录对话框
            // 如果页面有内置的登录模态框，可以在此处打开
            if (typeof showLoginModal === 'function') {
                showLoginModal();
            }
        }, 300);
    }, 2000);
}

/**
 * 检查用户是否已登录
 * @returns {boolean} 是否已登录
 */
function isLoggedIn() {
    // 检查localStorage中是否有token
    const token = localStorage.getItem('auth_token');
    // 这里应该验证token是否有效，例如检查过期时间等
    return !!token;
}

/**
 * 获取当前用户信息
 * @returns {Object} 用户信息
 */
function getCurrentUser() {
    // 从localStorage获取用户信息，实际中可能需要解析JWT或从服务器获取
    const userJson = localStorage.getItem('user_info');
    if (userJson) {
        try {
            return JSON.parse(userJson);
        } catch (e) {
            console.error('解析用户信息失败', e);
        }
    }
    
    // 如果没有获取到，返回默认信息
    return {
        username: '寰宇探索者',
        avatar: 'images/avatars/default.jpg'
    };
}

/**
 * 根据分类值获取显示名称
 * @param {string} category 分类值
 * @returns {string} 分类显示名称
 */
function getCategoryDisplayName(category) {
    const categoryMap = {
        'earth-living': '地球人居',
        'space-living': '太空人居',
        'tech': '黑科技',
        'ideas': '创意分享',
        'questions': '求助问答'
    };
    
    return categoryMap[category] || '未分类';
}

/**
 * 过滤帖子
 * @param {string} filterType 过滤类型
 */
function filterPosts(filterType) {
    // 实际中应根据过滤类型从后端获取数据
    console.log('过滤帖子:', filterType);
    // 模拟过滤效果，实际应使用AJAX获取数据
    const postCards = document.querySelectorAll('.post-card');
    
    // 为模拟效果，这里简单地改变透明度
    postCards.forEach(card => {
        card.style.opacity = '0.6';
        setTimeout(() => {
            card.style.opacity = '1';
        }, 500);
    });
}

/**
 * 检查登录状态并更新UI，但不强制登录
 */
function checkLoginStatus() {
    const loginButton = document.querySelector('.nav-menu li a.btn-primary');
    
    if (isLoggedIn()) {
        // 已登录状态，更改登录按钮为用户头像和下拉菜单
        if (loginButton) {
            const currentUser = getCurrentUser();
            const parentLi = loginButton.parentElement;
            
            // 创建用户头像和下拉菜单
            const userNav = document.createElement('div');
            userNav.className = 'user-nav';
            userNav.innerHTML = `
                <div class="user-avatar">
                    <img src="${currentUser.avatar}" alt="${currentUser.username}">
                </div>
                <span class="user-name">${currentUser.username}</span>
                <i class="fas fa-caret-down"></i>
                <div class="user-dropdown">
                    <a href="profile.html"><i class="fas fa-user"></i> 个人主页</a>
                    <a href="settings.html"><i class="fas fa-cog"></i> 设置</a>
                    <a href="#" id="logout-btn"><i class="fas fa-sign-out-alt"></i> 退出登录</a>
                </div>
            `;
            
            parentLi.innerHTML = '';
            parentLi.appendChild(userNav);
            
            // 添加退出登录事件
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    logout();
                });
            }
            
            // 添加下拉菜单切换事件
            const userAvatar = userNav.querySelector('.user-avatar');
            const userDropdown = userNav.querySelector('.user-dropdown');
            if (userAvatar && userDropdown) {
                userNav.addEventListener('click', function(e) {
                    e.stopPropagation();
                    userDropdown.classList.toggle('active');
                });
                
                // 点击其他位置关闭下拉菜单
                document.addEventListener('click', function() {
                    userDropdown.classList.remove('active');
                });
            }
        }
    }
    // 移除未登录状态处理逻辑，允许未登录用户浏览
}

/**
 * 退出登录
 */
function logout() {
    // 清除localStorage中的用户信息和token
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    
    // 重定向到首页
    window.location.href = 'index.html';
}
