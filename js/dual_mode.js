/**
 * CosmicWeave - 智能体系统双重模式功能
 * 处理智能体系统的管理员模式和用户模式切换
 */

// 当前系统模式（从agents_data.js导入SystemModes）
let currentMode = 'user';

/**
 * 初始化双重模式功能
 */
function initDualMode() {
    console.log('初始化智能体系统双重模式');
    
    // 检查是否有保存的模式设置
    const savedMode = localStorage.getItem('agentSystemMode');
    if (savedMode) {
        currentMode = savedMode;
    }
    
    // 创建模式切换按钮
    createModeSwitchButton();
    
    // 根据当前模式更新UI
    updateUIForCurrentMode();
    
    // 绑定事件
    document.addEventListener('modeChanged', function(e) {
        updateUIForCurrentMode();
    });
}

/**
 * 创建模式切换按钮
 */
function createModeSwitchButton() {
    const header = document.querySelector('.section-header, .agent-system-header');
    
    if (!header || document.getElementById('modeSwitchBtn')) {
        return;
    }
    
    const modeSwitch = document.createElement('div');
    modeSwitch.className = 'mode-switch';
    modeSwitch.innerHTML = `
        <button id="modeSwitchBtn" class="btn ${currentMode === 'admin' ? 'btn-highlight' : 'btn-outline'}">
            <i class="fas fa-user-shield"></i> 
            <span>${currentMode === 'admin' ? '管理员模式' : '用户模式'}</span>
        </button>
    `;
    
    header.appendChild(modeSwitch);
    
    // 绑定切换事件
    document.getElementById('modeSwitchBtn').addEventListener('click', toggleMode);
}

/**
 * 切换模式
 */
function toggleMode() {
    currentMode = currentMode === 'admin' ? 'user' : 'admin';
    
    // 保存到本地存储
    localStorage.setItem('agentSystemMode', currentMode);
    
    // 更新按钮状态
    const modeSwitchBtn = document.getElementById('modeSwitchBtn');
    if (modeSwitchBtn) {
        modeSwitchBtn.className = `btn ${currentMode === 'admin' ? 'btn-highlight' : 'btn-outline'}`;
        modeSwitchBtn.innerHTML = `
            <i class="fas fa-user-shield"></i> 
            <span>${currentMode === 'admin' ? '管理员模式' : '用户模式'}</span>
        `;
    }
    
    // 触发模式更改事件
    document.dispatchEvent(new CustomEvent('modeChanged', {
        detail: { mode: currentMode }
    }));
    
    // 显示通知
    showNotification(`已切换到${currentMode === 'admin' ? '管理员' : '用户'}模式`, 'info');
}

/**
 * 根据当前模式更新UI
 */
function updateUIForCurrentMode() {
    // 获取需要根据模式更新的元素
    const adminElements = document.querySelectorAll('.admin-only');
    const userElements = document.querySelectorAll('.user-only');
    
    // 更新元素可见性
    adminElements.forEach(el => {
        el.style.display = currentMode === 'admin' ? '' : 'none';
    });
    
    userElements.forEach(el => {
        el.style.display = currentMode === 'user' ? '' : 'none';
    });
    
    // 更新智能体卡片显示
    updateAgentCardsForMode();
    
    // 更新任务区域显示
    updateTaskAreaForMode();
}

/**
 * 更新智能体卡片以适应当前模式
 */
function updateAgentCardsForMode() {
    const agentCards = document.querySelectorAll('.agent-card');
    
    agentCards.forEach(card => {
        const agentId = card.dataset.agentId;
        const agent = window.agentsData.find(a => a.id === agentId);
        
        if (!agent) return;
        
        // 更新卡片内容
        const infoSection = card.querySelector('.agent-info');
        if (infoSection) {
            // 根据模式显示不同的功能列表
            const featuresEl = card.querySelector('.agent-features');
            if (featuresEl) {
                const features = currentMode === 'admin' ? agent.adminFeatures : agent.userFeatures;
                
                if (features) {
                    let featuresHTML = '<div class="features-list">';
                    features.forEach(feature => {
                        featuresHTML += `
                            <div class="feature-item" data-feature="${feature.id}">
                                <i class="fas ${feature.icon}"></i>
                                <span>${feature.name}</span>
                            </div>
                        `;
                    });
                    featuresHTML += '</div>';
                    featuresEl.innerHTML = featuresHTML;
                }
            }
        }
        
        // 更新操作按钮
        const actionsContainer = card.querySelector('.agent-actions');
        if (actionsContainer) {
            // 管理员模式下添加工作流按钮
            const workflowBtn = actionsContainer.querySelector('.workflow-btn');
            if (currentMode === 'admin') {
                if (!workflowBtn) {
                    const btn = document.createElement('button');
                    btn.className = 'btn btn-secondary workflow-btn admin-only';
                    btn.dataset.agentId = agentId;
                    btn.innerHTML = '<i class="fas fa-project-diagram"></i> 工作流';
                    btn.addEventListener('click', function() {
                        showWorkflowModal(agentId);
                    });
                    actionsContainer.appendChild(btn);
                } else {
                    workflowBtn.style.display = '';
                }
            } else if (workflowBtn) {
                workflowBtn.style.display = 'none';
            }
        }
    });
}

/**
 * 显示智能体工作流模态框
 * @param {string} agentId - 智能体ID
 */
function showWorkflowModal(agentId) {
    const agent = window.agentsData.find(a => a.id === agentId);
    
    if (!agent || !agent.workFlow) {
        showNotification('找不到该智能体的工作流信息', 'error');
        return;
    }
    
    let workflowHTML = '<div class="workflow-container">';
    
    // 工作流程图
    workflowHTML += '<div class="workflow-diagram">';
    agent.workFlow.forEach((step, index) => {
        workflowHTML += `
            <div class="workflow-step">
                <div class="step-number">${index + 1}</div>
                <div class="step-name">${step.step}</div>
                ${step.nextSteps.length > 0 ? '<div class="step-arrow">→</div>' : ''}
            </div>
        `;
    });
    workflowHTML += '</div>';
    
    // 工作内容
    workflowHTML += '<div class="workflow-content"><h4>主要工作内容</h4><ul>';
    agent.workContent.forEach(content => {
        workflowHTML += `<li>${content}</li>`;
    });
    workflowHTML += '</ul></div>';
    
    // 管理员专用功能
    workflowHTML += '<div class="admin-features"><h4>管理员功能</h4><div class="features-grid">';
    agent.adminFeatures.forEach(feature => {
        workflowHTML += `
            <div class="feature-box" data-feature="${feature.id}">
                <i class="fas ${feature.icon}"></i>
                <span>${feature.name}</span>
            </div>
        `;
    });
    workflowHTML += '</div></div>';
    
    workflowHTML += '</div>';
    
    showModal(`${agent.name} - 工作流程`, workflowHTML);
}

/**
 * 更新任务区域以适应当前模式
 */
function updateTaskAreaForMode() {
    const taskArea = document.querySelector('.tasks-section');
    
    if (!taskArea) {
        return;
    }
    
    // 更新任务创建表单
    const taskForm = document.getElementById('taskForm');
    if (taskForm) {
        // 添加或移除管理员特有的任务选项
        const adminOptionsContainer = taskForm.querySelector('.admin-task-options');
        
        if (currentMode === 'admin') {
            if (!adminOptionsContainer) {
                const optionsDiv = document.createElement('div');
                optionsDiv.className = 'admin-task-options admin-only';
                optionsDiv.innerHTML = `
                    <div class="form-row">
                        <div class="form-group">
                            <label for="taskType">专业任务类型</label>
                            <select id="taskType" name="taskType">
                                <option value="">选择任务类型...</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group half">
                            <label for="taskPriority">优先级</label>
                            <select id="taskPriority" name="taskPriority">
                                <option value="low">低</option>
                                <option value="medium" selected>中</option>
                                <option value="high">高</option>
                                <option value="urgent">紧急</option>
                            </select>
                        </div>
                        <div class="form-group half">
                            <label for="taskDeadline">截止日期</label>
                            <input type="date" id="taskDeadline" name="taskDeadline">
                        </div>
                    </div>
                `;
                
                // 插入到表单中的任务描述字段之后
                const descEl = taskForm.querySelector('.form-group:nth-child(2)');
                if (descEl) {
                    descEl.after(optionsDiv);
                }
                
                // 绑定智能体选择变更事件
                document.getElementById('taskAgents').addEventListener('change', updateTaskTypeOptions);
            }
        } else if (adminOptionsContainer) {
            adminOptionsContainer.style.display = 'none';
        }
    }
    
    // 更新任务列表
    updateTasksList();
}

/**
 * 更新任务类型选项
 */
function updateTaskTypeOptions() {
    if (currentMode !== 'admin') {
        return;
    }
    
    const taskAgentsSelect = document.getElementById('taskAgents');
    const taskTypeSelect = document.getElementById('taskType');
    
    if (!taskAgentsSelect || !taskTypeSelect) {
        return;
    }
    
    // 清空现有选项
    taskTypeSelect.innerHTML = '<option value="">选择任务类型...</option>';
    
    // 获取选中的智能体
    const selectedAgents = Array.from(taskAgentsSelect.selectedOptions).map(option => option.value);
    
    // 如果只选择了一个智能体，显示该智能体的专业任务类型
    if (selectedAgents.length === 1) {
        const agentId = selectedAgents[0];
        const agent = window.agentsData.find(a => a.id === agentId);
        
        if (agent && agent.adminFeatures) {
            agent.adminFeatures.forEach(feature => {
                const option = document.createElement('option');
                option.value = feature.id;
                option.textContent = feature.name;
                taskTypeSelect.appendChild(option);
            });
        }
    }
}

/**
 * 对象模式值检查
 */
function isAdminMode() {
    return currentMode === 'admin';
}

function isUserMode() {
    return currentMode === 'user';
}

/**
 * 获取当前模式
 */
function getCurrentMode() {
    return currentMode;
}

// 导出函数供其他模块使用
window.dualMode = {
    init: initDualMode,
    toggle: toggleMode,
    isAdmin: isAdminMode,
    isUser: isUserMode,
    getCurrentMode: getCurrentMode
};
