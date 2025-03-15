/**
 * 共创社区新版JavaScript - 社区页面交互
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化组件
    initAgentsQuickAccess();
    loadCommunityPosts();
    setupEventListeners();
    
    // 模拟数据加载完成后隐藏加载状态
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 800);
});

/**
 * 初始化智能体快捷访问
 */
function initAgentsQuickAccess() {
    const agentItems = document.querySelectorAll('.agent-item');
    
    agentItems.forEach(item => {
        item.addEventListener('click', function() {
            const agentType = this.getAttribute('data-agent');
            activateAgent(agentType);
        });
    });
}

/**
 * 激活指定类型的智能体
 * @param {string} agentType - 智能体类型
 */
function activateAgent(agentType) {
    console.log(`正在激活${agentType}智能体...`);
    
    // 根据不同智能体类型执行不同的激活操作
    switch(agentType) {
        case 'explorer':
            activateExplorerAgent();
            break;
        case 'engineer':
            activateEngineerAgent();
            break;
        case 'scientist':
            activateScientistAgent();
            break;
        case 'commander':
            activateCommanderAgent();
            break;
        default:
            // 智能体尚未实现的提示
            showNotification(`${capitalizeFirstLetter(agentType)}智能体正在准备中，敬请期待！`);
            break;
    }
}

/**
 * 激活探索者智能体
 */
function activateExplorerAgent() {
    // 检查是否已存在探索者智能体实例
    if (window.explorerAgent) {
        window.explorerAgent.activate();
    } else {
        // 如果Explorer智能体JS已加载
        if (typeof ExplorerAgent !== 'undefined') {
            try {
                window.explorerAgent = new ExplorerAgent();
                window.explorerAgent.activate();
            } catch (error) {
                console.error('激活探索者智能体时出错:', error);
                loadExplorerAgentScript();
            }
        } else {
            // 需要加载Explorer智能体的JS
            loadExplorerAgentScript();
        }
    }
}

/**
 * 加载探索者智能体脚本
 */
function loadExplorerAgentScript() {
    const script = document.createElement('script');
    script.src = 'js/explorer-agent.js';
    script.onload = function() {
        setTimeout(() => {
            if (typeof ExplorerAgent !== 'undefined') {
                window.explorerAgent = new ExplorerAgent();
                window.explorerAgent.activate();
            } else {
                console.error('加载探索者智能体失败');
                showNotification('加载探索者智能体失败，请刷新页面重试');
            }
        }, 100);
    };
    script.onerror = function() {
        console.error('加载探索者智能体脚本失败');
        showNotification('加载探索者智能体失败，请检查网络连接');
    };
    document.head.appendChild(script);
}

/**
 * 激活工程师智能体
 */
function activateEngineerAgent() {
    // 示例：显示工程师的简易聊天界面
    const chatHtml = `
        <div id="engineerChatContainer" class="agent-chat-container">
            <div class="chat-header">
                <img src="images/agents/engineer-avatar.svg" alt="工程师">
                <div class="chat-title">
                    <h3>工程师</h3>
                    <span>空间建筑与技术专家</span>
                </div>
                <button class="close-chat">&times;</button>
            </div>
            <div class="chat-messages">
                <div class="system-message">工程师智能体已连接</div>
                <div class="agent-message">
                    <div class="message-content">你好！我是工程师智能体，专注于太空建筑和技术系统设计。有什么我能帮助你的吗？</div>
                    <div class="message-time">刚刚</div>
                </div>
            </div>
            <div class="chat-input">
                <textarea placeholder="输入你的问题或设计需求..."></textarea>
                <button class="send-button"><i class="fas fa-paper-plane"></i></button>
            </div>
        </div>
    `;
    
    // 检查是否已存在聊天界面
    if (!document.getElementById('engineerChatContainer')) {
        const chatElement = document.createElement('div');
        chatElement.innerHTML = chatHtml;
        document.body.appendChild(chatElement.firstElementChild);
        
        // 设置关闭按钮
        document.querySelector('#engineerChatContainer .close-chat').addEventListener('click', function() {
            document.getElementById('engineerChatContainer').remove();
        });
        
        // 简单的发送消息功能
        document.querySelector('#engineerChatContainer .send-button').addEventListener('click', function() {
            const textarea = document.querySelector('#engineerChatContainer textarea');
            const message = textarea.value.trim();
            
            if (message) {
                addEngineerChatMessage('user', message);
                textarea.value = '';
                
                // 模拟回复
                setTimeout(() => {
                    addEngineerChatMessage('agent', '我了解了你关于' + message.substring(0, 10) + '...的问题。这是一个很好的太空建筑挑战，让我来分析一下可能的解决方案...');
                }, 1000);
            }
        });
    } else {
        document.getElementById('engineerChatContainer').style.display = 'block';
    }
}

/**
 * 添加工程师聊天消息
 */
function addEngineerChatMessage(sender, text) {
    const messagesContainer = document.querySelector('#engineerChatContainer .chat-messages');
    const messageElement = document.createElement('div');
    const now = new Date();
    const timeString = now.getHours() + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes();
    
    if (sender === 'user') {
        messageElement.className = 'user-message';
        messageElement.innerHTML = `
            <div class="message-content">${text}</div>
            <div class="message-time">${timeString}</div>
        `;
    } else {
        messageElement.className = 'agent-message';
        messageElement.innerHTML = `
            <div class="message-content">${text}</div>
            <div class="message-time">${timeString}</div>
        `;
    }
    
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * 激活科学家智能体
 */
function activateScientistAgent() {
    showNotification('科学家智能体正在初始化中，敬请期待！');
}

/**
 * 激活指挥官智能体
 */
function activateCommanderAgent() {
    showNotification('指挥官智能体正在初始化中，敬请期待！');
}

/**
 * 显示通知
 * @param {string} message - 通知内容
 */
function showNotification(message) {
    // 检查是否已存在通知容器
    let notificationContainer = document.querySelector('.notification-container');
    
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
    }
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    notificationContainer.appendChild(notification);
    
    // 动画效果
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // 自动关闭
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 4000);
}

/**
 * 首字母大写
 */
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * 加载社区帖子
 */
function loadCommunityPosts() {
    const postsContainer = document.querySelector('.posts-container');
    if (!postsContainer) return;
    
    // 清空容器
    postsContainer.innerHTML = '';
    
    // 显示加载状态
    postsContainer.innerHTML = '<div class="loading-posts">加载帖子中...</div>';
    
    // 获取模拟帖子数据
    const posts = getMockPosts();
    
    // 清空加载状态
    postsContainer.innerHTML = '';
    
    // 添加帖子到容器
    posts.forEach(post => {
        const postElement = createPostElement(post);
        postsContainer.appendChild(postElement);
    });
    
    // 处理智能体图片加载失败的情况
    handleAgentImageErrors();
}

/**
 * 处理智能体图片加载错误
 */
function handleAgentImageErrors() {
    document.querySelectorAll('.agent-icon img').forEach(img => {
        img.onerror = function() {
            // 将图片替换为智能体名称的首字母
            const agentName = this.alt || "智能体";
            const firstLetter = agentName.charAt(0);
            
            // 创建一个文本占位符
            const textPlaceholder = document.createElement('div');
            textPlaceholder.className = 'agent-icon-placeholder';
            textPlaceholder.textContent = firstLetter;
            textPlaceholder.style.width = '100%';
            textPlaceholder.style.height = '100%';
            textPlaceholder.style.display = 'flex';
            textPlaceholder.style.alignItems = 'center';
            textPlaceholder.style.justifyContent = 'center';
            textPlaceholder.style.backgroundColor = 'rgba(58, 123, 213, 0.8)';
            textPlaceholder.style.color = 'white';
            textPlaceholder.style.fontWeight = 'bold';
            textPlaceholder.style.fontSize = '20px';
            textPlaceholder.style.borderRadius = '50%';
            
            // 替换图片
            this.parentNode.replaceChild(textPlaceholder, this);
        };
    });
}

/**
 * 创建帖子元素
 * @param {Object} postData - 帖子数据
 * @returns {HTMLElement} - 帖子DOM元素
 */
function createPostElement(postData) {
    const postElement = document.createElement('div');
    postElement.className = 'post-item';
    if (postData.isPinned) {
        postElement.classList.add('pinned');
    }
    
    // 如果有徽章，添加徽章
    if (postData.badge) {
        const badgeElement = document.createElement('div');
        badgeElement.className = 'post-badge';
        badgeElement.textContent = postData.badge;
        postElement.appendChild(badgeElement);
    }
    
    // 帖子内容
    const postContent = document.createElement('div');
    postContent.className = 'post-content';
    
    // 帖子标题和元信息
    postContent.innerHTML = `
        <div class="post-header">
            <div class="post-title">
                <a href="#">${postData.title}</a>
            </div>
            <div class="post-meta">
                <div class="author-info">
                    <img src="${postData.author.avatar}" alt="${postData.author.name}">
                    <span class="author-name">${postData.author.name}</span>
                    ${postData.author.badge ? `<span class="author-badge ${postData.author.badgeType || ''}">${postData.author.badge}</span>` : ''}
                </div>
                <div class="post-time">${postData.time}</div>
            </div>
        </div>
        <div class="post-summary">${postData.summary}</div>
        <div class="post-footer">
            <div class="post-stats">
                <span><i class="fas fa-eye"></i> ${postData.views}</span>
                <span><i class="fas fa-comment"></i> ${postData.comments}</span>
                <span><i class="fas fa-thumbs-up"></i> ${postData.likes}</span>
            </div>
            <div class="post-tags">
                ${postData.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        </div>
    `;
    
    postElement.appendChild(postContent);
    
    // 添加点击事件
    postElement.addEventListener('click', function(e) {
        // 如果不是点击链接，则显示帖子详情
        if (!e.target.closest('a')) {
            showPostDetails(postData);
        }
    });
    
    return postElement;
}

/**
 * 获取模拟帖子数据
 * @returns {Array} - 帖子数据数组
 */
function getMockPosts() {
    return [
        {
            id: 1,
            title: "月球永久基地设计提案：克服辐射挑战的新材料应用",
            author: {
                name: "太空工程师_张",
                avatar: "images/avatars/user1.jpg",
                badge: "认证专家",
                badgeType: "expert"
            },
            time: "2025-03-14",
            summary: "近期我与科学家团队合作开发了一种新型辐射屏蔽材料，在月球永久基地原型设计中取得了突破性进展。这种材料不仅可以有效阻挡宇宙辐射，还具有良好的保温性能...",
            views: 872,
            comments: 54,
            likes: 126,
            tags: ["月球基地", "材料科学", "辐射防护"]
        },
        {
            id: 2,
            title: "太空农业实验：低重力环境下的植物生长优化方案",
            author: {
                name: "星际农艺师",
                avatar: "images/avatars/user2.jpg"
            },
            time: "2025-03-12",
            summary: "我完成了为期六个月的太空农业实验，发现通过特定波长的LED光照组合和营养液配方调整，可以显著提高低重力环境下的植物生长速度和产量。特别是在生菜和辣椒的培养上取得了...",
            views: 654,
            comments: 31,
            likes: 98,
            tags: ["太空农业", "食物自给", "低重力实验"]
        },
        {
            id: 3,
            title: "火星居住舱内部设计：心理健康与高效空间利用的平衡",
            author: {
                name: "人因工程师_李",
                avatar: "images/avatars/user3.jpg",
                badge: "设计大赛冠军",
                badgeType: "award"
            },
            time: "2025-03-10",
            summary: "火星居住舱的内部设计需要平衡心理健康与空间高效利用。我的提案融合了可变形家具、自然元素和虚拟窗口技术，创造出既实用又舒适的生活环境...",
            views: 921,
            comments: 67,
            likes: 152,
            tags: ["火星栖息地", "人体工程学", "心理健康"]
        },
        {
            id: 4,
            title: "太阳能与核能混合系统：深空探索的能源解决方案",
            author: {
                name: "能源专家_王",
                avatar: "images/avatars/user4.jpg"
            },
            time: "2025-03-08",
            summary: "针对深空探索任务，我设计了一套太阳能与小型核反应堆混合的能源系统，可以根据距离太阳的远近自动调整能源比例，确保探测器和居住舱拥有稳定可靠的能源供应...",
            views: 723,
            comments: 42,
            likes: 113,
            tags: ["能源系统", "深空探索", "核能"]
        },
        {
            id: 5,
            title: "VR模拟：体验我设计的小行星采矿基地",
            author: {
                name: "VR设计师_周",
                avatar: "images/avatars/user5.jpg"
            },
            time: "2025-03-05",
            summary: "我创建了一个完整的VR环境，模拟了我设计的小行星采矿基地内部和外部环境。欢迎大家下载体验，并提供改进建议。特别关注了微重力环境下的移动系统和资源加工流程...",
            views: 812,
            comments: 39,
            likes: 145,
            tags: ["VR设计", "小行星采矿", "交互体验"]
        }
    ];
}

/**
 * 根据分类筛选帖子
 * @param {string} category - 分类名称
 */
function filterPostsByCategory(category) {
    console.log(`筛选分类: ${category}`);
    // 实际项目中这里应该从服务器获取对应分类的帖子
    // 这里简单模拟一下
    
    showNotification(`已切换到"${category}"分类`);
    
    // 重新加载帖子（实际应该根据分类获取）
    loadCommunityPosts();
}

/**
 * 根据时间筛选帖子
 * @param {string} timeRange - 时间范围
 */
function filterPostsByTime(timeRange) {
    console.log(`筛选时间范围: ${timeRange}`);
    // 实际项目中这里应该从服务器获取对应时间范围的帖子
    
    const timeRangeText = {
        'today': '今天',
        'week': '本周',
        'month': '本月',
        'all': '全部时间'
    };
    
    showNotification(`已筛选"${timeRangeText[timeRange]}"的内容`);
    
    // 重新加载帖子（实际应该根据时间范围获取）
    loadCommunityPosts();
}

/**
 * 显示创建帖子对话框
 */
function showCreatePostModal() {
    // 创建模态对话框
    const modalHtml = `
        <div class="modal-overlay">
            <div class="modal-container create-post-modal">
                <div class="modal-header">
                    <h3>发布新帖子</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="post-title">标题</label>
                        <input type="text" id="post-title" placeholder="输入帖子标题...">
                    </div>
                    <div class="form-group">
                        <label for="post-category">分类</label>
                        <select id="post-category">
                            <option value="earth">地球人居</option>
                            <option value="space">太空人居</option>
                            <option value="tech">黑科技</option>
                            <option value="activity">社区活动</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="post-content">内容</label>
                        <textarea id="post-content" rows="8" placeholder="分享你的想法、设计或问题..."></textarea>
                    </div>
                    <div class="form-group">
                        <label for="post-tags">标签</label>
                        <input type="text" id="post-tags" placeholder="添加标签，用逗号分隔...">
                    </div>
                    <div class="form-group">
                        <label>添加附件</label>
                        <div class="attachment-buttons">
                            <button class="attachment-btn"><i class="fas fa-image"></i> 图片</button>
                            <button class="attachment-btn"><i class="fas fa-file-pdf"></i> 文档</button>
                            <button class="attachment-btn"><i class="fas fa-cubes"></i> 3D模型</button>
                        </div>
                    </div>
                    <div class="form-group agent-assist">
                        <div class="agent-assist-toggle">
                            <input type="checkbox" id="agent-assist-checkbox" checked>
                            <label for="agent-assist-checkbox">智能体辅助</label>
                        </div>
                        <div class="agent-assist-options">
                            <p>选择可以审阅你帖子的智能体:</p>
                            <div class="agent-options">
                                <label>
                                    <input type="checkbox" value="engineer" checked> 工程师
                                </label>
                                <label>
                                    <input type="checkbox" value="scientist"> 科学家
                                </label>
                                <label>
                                    <input type="checkbox" value="explorer"> 探索者
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary">保存草稿</button>
                    <button class="btn-primary publish-btn">发布</button>
                </div>
            </div>
        </div>
    `;
    
    // 添加到DOM
    const modalElement = document.createElement('div');
    modalElement.innerHTML = modalHtml;
    document.body.appendChild(modalElement.firstElementChild);
    
    // 防止滚动
    document.body.style.overflow = 'hidden';
    
    // 设置关闭事件
    document.querySelector('.modal-close').addEventListener('click', closeModal);
    document.querySelector('.modal-overlay').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
    
    // 发布按钮事件
    document.querySelector('.publish-btn').addEventListener('click', function() {
        const title = document.getElementById('post-title').value.trim();
        if (!title) {
            showNotification('请输入帖子标题');
            return;
        }
        
        // 模拟发布
        showNotification('帖子发布成功！');
        closeModal();
        
        // 添加新发布的帖子到列表顶部
        const newPost = {
            id: new Date().getTime(),
            title: title,
            author: {
                name: "当前用户",
                avatar: "images/avatars/user-default.jpg"
            },
            time: formatDate(new Date()),
            summary: document.getElementById('post-content').value.trim().substring(0, 150) + "...",
            views: 0,
            comments: 0,
            likes: 0,
            tags: document.getElementById('post-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag)
        };
        
        const postList = document.querySelector('.post-list');
        const pinnedPosts = postList.querySelectorAll('.post-item.pinned');
        const lastPinnedPost = pinnedPosts[pinnedPosts.length - 1];
        
        const newPostElement = createPostElement(newPost);
        
        if (lastPinnedPost) {
            postList.insertBefore(newPostElement, lastPinnedPost.nextSibling);
        } else {
            postList.insertBefore(newPostElement, postList.firstChild);
        }
    });
}

/**
 * 关闭模态对话框
 */
function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
}

/**
 * 格式化日期
 * @param {Date} date - 日期对象
 * @returns {string} - 格式化的日期字符串
 */
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * 显示帖子详情
 * @param {Object} postData - 帖子数据
 */
function showPostDetails(postData) {
    // 创建模态对话框
    const modalHtml = `
        <div class="modal-overlay">
            <div class="modal-container post-detail-modal">
                <div class="modal-header">
                    <div class="modal-title">帖子详情</div>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="post-detail-header">
                        <h2>${postData.title}</h2>
                        <div class="post-meta">
                            <div class="author-info">
                                <img src="${postData.author.avatar}" alt="${postData.author.name}">
                                <span class="author-name">${postData.author.name}</span>
                                ${postData.author.badge ? `<span class="author-badge ${postData.author.badgeType || ''}">${postData.author.badge}</span>` : ''}
                            </div>
                            <div class="post-time">${postData.time}</div>
                        </div>
                        <div class="post-tags">
                            ${postData.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                    <div class="post-detail-content">
                        <p>${postData.summary}</p>
                        <p>这只是一个演示帖子，实际内容将更加丰富。在完整的实现中，这里将显示帖子的全部内容，包括文字、图片、视频和其他媒体。</p>
                        
                        <div class="post-images">
                            <img src="images/community/post-image-demo.jpg" alt="帖子图片演示">
                        </div>
                        
                        <p>用户可以在这里与智能体互动，获取专业反馈和建议，也可以与其他社区成员交流讨论。</p>
                    </div>
                    
                    <div class="post-actions">
                        <button class="action-btn like-btn ${postData.userLiked ? 'active' : ''}">
                            <i class="fas fa-thumbs-up"></i> 赞同 (${postData.likes})
                        </button>
                        <button class="action-btn comment-btn">
                            <i class="fas fa-comment"></i> 评论 (${postData.comments})
                        </button>
                        <button class="action-btn share-btn">
                            <i class="fas fa-share"></i> 分享
                        </button>
                        <button class="action-btn save-btn">
                            <i class="fas fa-bookmark"></i> 收藏
                        </button>
                    </div>
                    
                    <div class="agent-feedback">
                        <h3>智能体反馈</h3>
                        <div class="agent-comment">
                            <div class="agent-avatar">
                                <img src="images/agents/engineer-avatar.svg" alt="工程师">
                            </div>
                            <div class="agent-comment-content">
                                <div class="agent-name">工程师</div>
                                <p>这是一个很有创意的设计！从工程角度看，我建议考虑在辐射屏蔽层中添加硼化合物，可以提高对中子的吸收效率。</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="comments-section">
                        <h3>评论 (${postData.comments})</h3>
                        <div class="comment-form">
                            <textarea placeholder="添加评论..."></textarea>
                            <button class="btn-primary">发布评论</button>
                        </div>
                        <div class="comments-list">
                            <div class="comment-item">
                                <div class="comment-avatar">
                                    <img src="images/avatars/user6.jpg" alt="用户头像">
                                </div>
                                <div class="comment-content">
                                    <div class="comment-header">
                                        <span class="comment-author">太空建筑师_吴</span>
                                        <span class="comment-time">2025-03-15</span>
                                    </div>
                                    <p>非常赞同你关于辐射屏蔽的观点，我在自己的设计中也采用了类似的思路，但材料选择有所不同。很期待看到更多详细的测试数据。</p>
                                    <div class="comment-actions">
                                        <button><i class="fas fa-thumbs-up"></i> 12</button>
                                        <button><i class="fas fa-reply"></i> 回复</button>
                                    </div>
                                </div>
                            </div>
                            <div class="comment-item">
                                <div class="comment-avatar">
                                    <img src="images/avatars/user7.jpg" alt="用户头像">
                                </div>
                                <div class="comment-content">
                                    <div class="comment-header">
                                        <span class="comment-author">月球计划参与者</span>
                                        <span class="comment-time">2025-03-14</span>
                                    </div>
                                    <p>这种材料的成本和生产难度如何？在月球环境中，我们需要考虑资源的可获取性和就地利用的可能性。</p>
                                    <div class="comment-actions">
                                        <button><i class="fas fa-thumbs-up"></i> 8</button>
                                        <button><i class="fas fa-reply"></i> 回复</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 添加到DOM
    const modalElement = document.createElement('div');
    modalElement.innerHTML = modalHtml;
    document.body.appendChild(modalElement.firstElementChild);
    
    // 防止滚动
    document.body.style.overflow = 'hidden';
    
    // 设置关闭事件
    document.querySelector('.modal-close').addEventListener('click', closeModal);
    document.querySelector('.modal-overlay').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
    
    // 点赞按钮事件
    document.querySelector('.like-btn').addEventListener('click', function() {
        this.classList.toggle('active');
        const likesCountElement = this.querySelector('span');
        if (likesCountElement) {
            let likesCount = parseInt(likesCountElement.textContent);
            if (this.classList.contains('active')) {
                likesCount++;
            } else {
                likesCount--;
            }
            likesCountElement.textContent = likesCount;
        }
    });
}

/**
 * 设置事件监听器
 */
function setupEventListeners() {
    // 智能体卡片点击事件
    document.querySelectorAll('.agent-card').forEach(card => {
        card.addEventListener('click', function() {
            const agentType = this.getAttribute('data-agent');
            if (agentType) {
                activateAgent(agentType);
            }
        });
    });
    
    // 激活智能体按钮点击事件
    document.querySelectorAll('.activate-agent').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // 防止触发父元素的点击事件
            const agentType = this.getAttribute('data-agent');
            if (agentType) {
                activateAgent(agentType);
            }
        });
    });
    
    // 帖子创建按钮点击事件
    const newPostBtn = document.querySelector('.new-post-btn');
    if (newPostBtn) {
        newPostBtn.addEventListener('click', showCreatePostModal);
    }
    
    // 分类过滤点击事件
    document.querySelectorAll('.sidebar-menu a[data-filter]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-filter');
            
            // 更新活跃状态
            document.querySelectorAll('.sidebar-menu a[data-filter]').forEach(el => {
                el.parentElement.classList.remove('active');
            });
            this.parentElement.classList.add('active');
            
            // 过滤帖子
            filterPostsByCategory(category);
        });
    });
    
    // 内容过滤按钮点击事件
    document.querySelectorAll('.filter-buttons button').forEach(button => {
        button.addEventListener('click', function() {
            // 更新活跃状态
            document.querySelectorAll('.filter-buttons button').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            
            // 根据时间过滤帖子
            const timeRange = this.getAttribute('data-filter');
            filterPostsByTime(timeRange);
        });
    });
    
    // 使用事件委托处理动态创建的元素
    document.addEventListener('click', function(e) {
        // 处理帖子点击事件
        if (e.target.closest('.post-card')) {
            const postCard = e.target.closest('.post-card');
            const postId = postCard.getAttribute('data-id');
            if (postId && !e.target.closest('.post-actions')) {
                const posts = getMockPosts();
                const post = posts.find(p => p.id.toString() === postId);
                if (post) {
                    showPostDetails(post);
                }
            }
        }
        
        // 处理点赞按钮点击
        if (e.target.closest('.like-btn')) {
            const likeBtn = e.target.closest('.like-btn');
            const liked = likeBtn.classList.contains('active');
            
            if (!liked) {
                likeBtn.classList.add('active');
                const countElement = likeBtn.querySelector('span');
                if (countElement) {
                    let count = parseInt(countElement.textContent);
                    countElement.textContent = count + 1;
                }
                showNotification('已点赞此帖子');
            } else {
                likeBtn.classList.remove('active');
                const countElement = likeBtn.querySelector('span');
                if (countElement) {
                    let count = parseInt(countElement.textContent);
                    countElement.textContent = Math.max(0, count - 1);
                }
                showNotification('已取消点赞');
            }
        }
    });
    
    // 处理图片加载错误
    handleAgentImageErrors();
}
