/**
 * NexusOrbital - 智能体系统初始化
 * 该文件处理双重价值智能体系统的初始化和基础功能
 */

// 全局变量
let activeAgents = [];
let tasks = [];
let notifications = [];

// 页面加载完成后执行初始化
document.addEventListener('DOMContentLoaded', function() {
    initAgentsSystem();
});

/**
 * 初始化智能体系统
 */
function initAgentsSystem() {
    console.log('初始化智能体系统');
    
    // 绑定关闭模态框事件
    document.getElementById('closeModal').addEventListener('click', closeModal);
    
    // 初始化模式切换功能
    if (window.dualMode && typeof window.dualMode.init === 'function') {
        window.dualMode.init();
    }
    
    // 从本地存储加载数据
    loadFromLocalStorage();
    
    // 初始化智能体卡片
    renderAgentCards();
    
    // 初始化任务创建按钮
    initTaskCreation();
    
    // 初始化任务过滤器
    initTaskFilters();
    
    // 更新任务列表
    updateTasksList();
    
    // 更新仪表板数据
    updateAdminDashboard();
    
    // 添加自动保存功能
    window.addEventListener('beforeunload', saveToLocalStorage);
}

/**
 * 渲染智能体卡片
 */
function renderAgentCards() {
    const agentGrid = document.getElementById('agentGrid');
    
    if (!agentGrid || !window.agentsData) {
        return;
    }
    
    // 清空现有内容
    agentGrid.innerHTML = '';
    
    // 为每个智能体创建卡片
    window.agentsData.forEach(agent => {
        const isActive = activeAgents.includes(agent.id);
        
        // 创建卡片元素
        const card = document.createElement('div');
        card.className = `agent-card ${isActive ? 'active' : ''}`;
        card.dataset.agentId = agent.id;
        
        // 准备专长标签
        const expertiseTags = agent.expertise.map(exp => 
            `<span class="tag">${exp}</span>`
        ).join('');
        
        // 准备功能特性列表 (根据当前模式)
        const features = window.dualMode && window.dualMode.isAdmin() ? 
            agent.adminFeatures : agent.userFeatures;
        
        let featuresHTML = '';
        if (features) {
            featuresHTML = '<div class="features-list">';
            features.forEach(feature => {
                featuresHTML += `
                    <div class="feature-item" data-feature="${feature.id}">
                        <i class="fas ${feature.icon}"></i>
                        <span>${feature.name}</span>
                    </div>
                `;
            });
            featuresHTML += '</div>';
        }
        
        // 设置卡片内容
        card.innerHTML = `
            <div class="agent-header">
                <div class="agent-icon">
                    <i class="fas ${agent.icon}"></i>
                </div>
                <div class="agent-title">
                    <h3>${agent.name}</h3>
                    <span class="agent-role">${agent.role}</span>
                </div>
                <div class="agent-status">
                    <span class="status-badge ${isActive ? 'active' : 'inactive'}">
                        ${isActive ? '已激活' : '未激活'}
                    </span>
                </div>
            </div>
            <div class="agent-info">
                <p class="agent-description">${agent.description}</p>
                <div class="agent-expertise">
                    ${expertiseTags}
                </div>
                <div class="agent-features">
                    ${featuresHTML}
                </div>
            </div>
            <div class="agent-actions">
                <button class="btn ${isActive ? 'btn-outline' : 'btn-primary'} toggle-agent-btn" data-agent-id="${agent.id}">
                    <i class="fas ${isActive ? 'fa-power-off' : 'fa-bolt'}"></i> 
                    ${isActive ? '停用' : '激活'}
                </button>
                <button class="btn btn-secondary details-btn" data-agent-id="${agent.id}">
                    <i class="fas fa-info-circle"></i> 详情
                </button>
            </div>
        `;
        
        // 添加卡片到网格
        agentGrid.appendChild(card);
        
        // 绑定按钮事件
        const toggleBtn = card.querySelector('.toggle-agent-btn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', function() {
                toggleAgent(agent.id);
            });
        }
        
        const detailsBtn = card.querySelector('.details-btn');
        if (detailsBtn) {
            detailsBtn.addEventListener('click', function() {
                showAgentDetails(agent.id);
            });
        }
        
        // 绑定功能项点击事件
        const featureItems = card.querySelectorAll('.feature-item');
        featureItems.forEach(item => {
            item.addEventListener('click', function() {
                const featureId = this.dataset.feature;
                activateAgentFeature(agent.id, featureId);
            });
        });
    });
}

/**
 * 切换智能体激活状态
 * @param {string} agentId - 智能体ID
 */
function toggleAgent(agentId) {
    const index = activeAgents.indexOf(agentId);
    
    if (index === -1) {
        // 激活智能体
        activeAgents.push(agentId);
        showNotification(`已激活 ${getAgentName(agentId)}`, 'success');
    } else {
        // 停用智能体
        activeAgents.splice(index, 1);
        showNotification(`已停用 ${getAgentName(agentId)}`, 'info');
    }
    
    // 更新UI
    renderAgentCards();
    updateTasksList();
    updateAdminDashboard();
    
    // 保存到本地存储
    saveToLocalStorage();
}

/**
 * 显示智能体详情
 * @param {string} agentId - 智能体ID
 */
function showAgentDetails(agentId) {
    const agent = window.agentsData.find(a => a.id === agentId);
    
    if (!agent) {
        return;
    }
    
    let contentHTML = '';
    
    // 智能体基础信息
    contentHTML += `
        <div class="agent-detail-header">
            <div class="agent-icon large">
                <i class="fas ${agent.icon}"></i>
            </div>
            <div class="agent-info">
                <h2>${agent.name}</h2>
                <div class="agent-role">${agent.role}</div>
                <div class="agent-status">
                    <span class="status-badge ${activeAgents.includes(agent.id) ? 'active' : 'inactive'}">
                        ${activeAgents.includes(agent.id) ? '已激活' : '未激活'}
                    </span>
                </div>
            </div>
        </div>
        <div class="agent-description-full">
            <p>${agent.description}</p>
        </div>
    `;
    
    // 专业领域
    contentHTML += `
        <div class="agent-expertise-section">
            <h3>专业领域</h3>
            <div class="expertise-tags">
                ${agent.expertise.map(exp => `<span class="tag">${exp}</span>`).join('')}
            </div>
        </div>
    `;
    
    // 工作流程
    if (agent.workFlow) {
        contentHTML += `
            <div class="agent-workflow-section">
                <h3>工作流程</h3>
                <div class="workflow-diagram">
                    ${agent.workFlow.map((step, index) => `
                        <div class="workflow-step">
                            <div class="step-number">${index + 1}</div>
                            <div class="step-name">${step.step}</div>
                            ${step.nextSteps.length > 0 ? '<div class="step-arrow">→</div>' : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // 主要工作内容
    if (agent.workContent) {
        contentHTML += `
            <div class="agent-work-content">
                <h3>主要工作内容</h3>
                <ul>
                    ${agent.workContent.map(content => `<li>${content}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    // 功能特性
    const adminFeatures = agent.adminFeatures || [];
    const userFeatures = agent.userFeatures || [];
    
    contentHTML += `
        <div class="agent-features-section">
            <h3>功能特性</h3>
            <div class="tabs">
                <div class="tab active" data-tab="admin-features">管理员模式功能</div>
                <div class="tab" data-tab="user-features">用户模式功能</div>
            </div>
            <div class="tab-content">
                <div class="tab-pane active" id="admin-features">
                    <div class="features-grid">
                        ${adminFeatures.map(feature => `
                            <div class="feature-box" data-feature="${feature.id}">
                                <i class="fas ${feature.icon}"></i>
                                <span>${feature.name}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="tab-pane" id="user-features">
                    <div class="features-grid">
                        ${userFeatures.map(feature => `
                            <div class="feature-box" data-feature="${feature.id}">
                                <i class="fas ${feature.icon}"></i>
                                <span>${feature.name}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 任务历史(如果已激活)
    if (activeAgents.includes(agent.id)) {
        const agentTasks = tasks.filter(task => task.assignedAgents.includes(agent.id));
        
        if (agentTasks.length > 0) {
            contentHTML += `
                <div class="agent-tasks-section">
                    <h3>任务历史</h3>
                    <div class="task-history">
                        ${agentTasks.map(task => `
                            <div class="task-item ${task.status}">
                                <div class="task-status-icon">
                                    <i class="fas ${getTaskStatusIcon(task.status)}"></i>
                                </div>
                                <div class="task-info">
                                    <div class="task-title">${task.title}</div>
                                    <div class="task-meta">
                                        <span class="task-date">${formatDate(task.createdAt)}</span>
                                        <span class="task-status">${getTaskStatusName(task.status)}</span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    }
    
    // 激活/停用按钮
    contentHTML += `
        <div class="agent-action-buttons">
            <button class="btn ${activeAgents.includes(agent.id) ? 'btn-outline' : 'btn-primary'} toggle-agent-btn" data-agent-id="${agent.id}">
                <i class="fas ${activeAgents.includes(agent.id) ? 'fa-power-off' : 'fa-bolt'}"></i> 
                ${activeAgents.includes(agent.id) ? '停用智能体' : '激活智能体'}
            </button>
            ${activeAgents.includes(agent.id) ? `
                <button class="btn btn-secondary assign-task-btn" data-agent-id="${agent.id}">
                    <i class="fas fa-tasks"></i> 分配任务
                </button>
            ` : ''}
        </div>
    `;
    
    // 显示模态框
    showModal(`${agent.name} 详情`, contentHTML);
    
    // 绑定标签页切换
    const tabs = document.querySelectorAll('.modal .tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // 更新标签激活状态
            document.querySelectorAll('.modal .tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // 更新内容面板
            document.querySelectorAll('.modal .tab-pane').forEach(p => p.classList.remove('active'));
            document.getElementById(tabName).classList.add('active');
        });
    });
    
    // 绑定功能点击事件
    document.querySelectorAll('.modal .feature-box').forEach(box => {
        box.addEventListener('click', function() {
            const featureId = this.dataset.feature;
            activateAgentFeature(agent.id, featureId);
        });
    });
    
    // 绑定激活/停用按钮事件
    const toggleBtn = document.querySelector('.modal .toggle-agent-btn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function() {
            toggleAgent(this.dataset.agentId);
            closeModal();
        });
    }
    
    // 绑定分配任务按钮事件
    const assignTaskBtn = document.querySelector('.modal .assign-task-btn');
    if (assignTaskBtn) {
        assignTaskBtn.addEventListener('click', function() {
            showCreateTaskModal([this.dataset.agentId]);
            closeModal();
        });
    }
}

/**
 * 激活智能体特定功能
 * @param {string} agentId - 智能体ID
 * @param {string} featureId - 功能ID
 */
function activateAgentFeature(agentId, featureId) {
    const agent = window.agentsData.find(a => a.id === agentId);
    
    if (!agent) {
        return;
    }
    
    // 如果智能体未激活，先激活
    if (!activeAgents.includes(agentId)) {
        activeAgents.push(agentId);
        renderAgentCards();
        saveToLocalStorage();
    }
    
    // 确定是管理员还是用户功能
    const isAdminFeature = window.dualMode && window.dualMode.isAdmin();
    const features = isAdminFeature ? agent.adminFeatures : agent.userFeatures;
    const feature = features.find(f => f.id === featureId);
    
    if (!feature) {
        return;
    }
    
    // 显示功能激活通知
    showNotification(`正在启动 ${agent.name} 的 ${feature.name} 功能`, 'info');
    
    // 根据功能类型执行不同操作
    setTimeout(() => {
        if (isAdminFeature) {
            // 管理员功能 - 创建相应类型的任务
            showCreateTaskModal([agentId], featureId);
        } else {
            // 用户功能 - 显示功能介绍和互动界面
            showFeatureInteractionModal(agent, feature);
        }
    }, 500);
}

/**
 * 显示功能交互模态框
 * @param {Object} agent - 智能体对象
 * @param {Object} feature - 功能对象
 */
function showFeatureInteractionModal(agent, feature) {
    // 这里可以根据不同的智能体和功能定制不同的交互界面
    // 目前使用一个通用模板
    
    const contentHTML = `
        <div class="feature-interaction">
            <div class="feature-header">
                <div class="feature-icon">
                    <i class="fas ${feature.icon}"></i>
                </div>
                <div class="feature-info">
                    <h3>${feature.name}</h3>
                    <div class="agent-attribution">由 ${agent.name} 提供</div>
                </div>
            </div>
            
            <div class="feature-description">
                <p>这是 ${agent.name} 提供的 ${feature.name} 功能。通过此功能，您可以体验 ${agent.name} 在 ${feature.name} 方面的专业能力。</p>
            </div>
            
            <div class="feature-interaction-area">
                <div class="interaction-placeholder">
                    <i class="fas fa-rocket"></i>
                    <p>功能开发中，敬请期待！</p>
                </div>
            </div>
            
            <div class="feature-actions">
                <button class="btn btn-primary start-feature-btn">
                    <i class="fas fa-play"></i> 开始体验
                </button>
                <button class="btn btn-outline close-feature-btn">
                    <i class="fas fa-times"></i> 关闭
                </button>
            </div>
        </div>
    `;
    
    showModal(`${feature.name} - 功能体验`, contentHTML);
    
    // 绑定按钮事件
    document.querySelector('.close-feature-btn').addEventListener('click', closeModal);
    document.querySelector('.start-feature-btn').addEventListener('click', function() {
        showNotification('此功能正在开发中，敬请期待！', 'info');
    });
}

/**
 * 从localStorage加载数据
 */
function loadFromLocalStorage() {
    // 加载激活的智能体
    const savedAgents = localStorage.getItem('activeAgents');
    if (savedAgents) {
        activeAgents = JSON.parse(savedAgents);
    }
    
    // 加载任务
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }
}

/**
 * 保存数据到localStorage
 */
function saveToLocalStorage() {
    localStorage.setItem('activeAgents', JSON.stringify(activeAgents));
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

/**
 * 显示模态框
 * @param {string} title - 模态框标题
 * @param {string} content - 模态框内容HTML
 */
function showModal(title, content) {
    const modalContainer = document.getElementById('modalContainer');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');
    
    if (!modalContainer || !modalTitle || !modalContent) {
        return;
    }
    
    modalTitle.textContent = title;
    modalContent.innerHTML = content;
    modalContainer.classList.add('active');
    
    // 防止背景滚动
    document.body.style.overflow = 'hidden';
}

/**
 * 关闭模态框
 */
function closeModal() {
    const modalContainer = document.getElementById('modalContainer');
    
    if (!modalContainer) {
        return;
    }
    
    modalContainer.classList.remove('active');
    
    // 恢复背景滚动
    document.body.style.overflow = '';
}

/**
 * 显示通知
 * @param {string} message - 通知消息
 * @param {string} type - 通知类型 (success, error, info, warning)
 */
function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationsContainer');
    
    if (!container) {
        return;
    }
    
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas ${getNotificationIcon(type)}"></i>
        </div>
        <div class="notification-content">
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // 添加到容器
    container.appendChild(notification);
    
    // 绑定关闭按钮
    notification.querySelector('.notification-close').addEventListener('click', function() {
        notification.classList.add('closing');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // 自动消失
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.add('closing');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

/**
 * 获取通知图标
 * @param {string} type - 通知类型
 * @returns {string} 图标类名
 */
function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        case 'info':
        default: return 'fa-info-circle';
    }
}

/**
 * 获取智能体名称
 * @param {string} agentId - 智能体ID
 * @returns {string} 智能体名称
 */
function getAgentName(agentId) {
    const agent = window.agentsData.find(a => a.id === agentId);
    return agent ? agent.name : '未知智能体';
}

/**
 * 获取任务状态图标
 * @param {string} status - 任务状态
 * @returns {string} 图标类名
 */
function getTaskStatusIcon(status) {
    switch (status) {
        case 'completed': return 'fa-check-circle';
        case 'in-progress': return 'fa-spinner fa-spin';
        case 'pending':
        default: return 'fa-clock';
    }
}

/**
 * 获取任务状态名称
 * @param {string} status - 任务状态
 * @returns {string} 状态名称
 */
function getTaskStatusName(status) {
    switch (status) {
        case 'completed': return '已完成';
        case 'in-progress': return '进行中';
        case 'pending':
        default: return '待处理';
    }
}

/**
 * 格式化日期
 * @param {string} dateString - ISO格式日期字符串
 * @returns {string} 格式化后的日期
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * 生成唯一ID
 * @returns {string} 唯一ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

/**
 * 生成任务ID
 * @returns {string} 任务ID
 */
function generateTaskId() {
    return 'task-' + generateId();
}

// 导出全局函数
window.agentSystem = {
    toggleAgent,
    showAgentDetails,
    showNotification,
    showModal,
    closeModal
};
