/**
 * CosmicWeave - 智能体系统JavaScript功能
 * 该文件处理智能体的激活、任务分配和协作功能
 */

document.addEventListener('DOMContentLoaded', function() {
    initAgentsSystem();
});

// 智能体数据
const agentsData = [
    {
        id: 'explorer',
        name: '探索者',
        role: '太空探索专家',
        expertise: ['地形分析', '资源勘探', '路线规划'],
        icon: 'fa-rocket',
        description: '探索者智能体专注于分析行星表面特征，识别资源丰富区域，并规划探索路线。非常适合前期基地选址和资源勘测任务。'
    },
    {
        id: 'architect',
        name: '建筑师',
        role: '居住设计专家',
        expertise: ['栖息设计', '结构工程', '空间优化'],
        icon: 'fa-drafting-compass',
        description: '建筑师智能体专注于设计适合太空环境的居住舱和基地结构，平衡功能性、安全性和宜居性。'
    },
    {
        id: 'scientist',
        name: '科学家',
        role: '研究与实验专家',
        expertise: ['材料研究', '环境分析', '实验设计'],
        icon: 'fa-flask',
        description: '科学家智能体协助设计和分析科学实验，研究新材料，并分析太空环境对人类和设备的影响。'
    },
    {
        id: 'engineer',
        name: '工程师',
        role: '系统构建专家',
        expertise: ['能源系统', '维护修理', '设备优化'],
        icon: 'fa-cogs',
        description: '工程师智能体专注于开发和维护生命支持系统、能源系统和通信网络，确保所有技术系统正常运行。'
    },
    {
        id: 'medic',
        name: '医疗专家',
        role: '健康与医疗专家',
        expertise: ['太空医学', '健康监测', '紧急救援'],
        icon: 'fa-heartbeat',
        description: '医疗专家智能体监测宇航员健康状况，提供医疗建议，并在紧急情况下协助救援行动。'
    },
    {
        id: 'botanist',
        name: '植物学家',
        role: '太空农业专家',
        expertise: ['作物栽培', '生态系统', '资源循环'],
        icon: 'fa-seedling',
        description: '植物学家智能体专注于开发太空农业系统，优化作物生长，并维护封闭生态系统的可持续性。'
    },
    {
        id: 'logistics',
        name: '后勤专家',
        role: '资源与供应专家',
        expertise: ['库存管理', '资源分配', '供应链'],
        icon: 'fa-truck-loading',
        description: '后勤专家智能体负责管理物资库存，优化资源分配，并确保所有必要物资的有效供应。'
    },
    {
        id: 'community',
        name: '社区协调者',
        role: '社交与文化专家',
        expertise: ['文化规划', '团队协作', '心理健康'],
        icon: 'fa-users',
        description: '社区协调者智能体帮助建立社区文化，促进团队协作，并关注居民的心理健康和社交需求。'
    }
];

// 已激活的智能体列表
let activeAgents = [];

// 任务列表
let tasks = [];

/**
 * 初始化智能体系统
 */
function initAgentsSystem() {
    // 初始化智能体卡片交互
    initAgentCards();
    
    // 初始化过滤器功能
    initFilters();
    
    // 初始化任务分配表单
    initTaskForm();
    
    // 初始化任务列表
    updateTasksList();
    
    // 绑定CTA按钮点击事件
    document.getElementById('scrollToAgents')?.addEventListener('click', function() {
        document.querySelector('.agents-dashboard').scrollIntoView({ behavior: 'smooth' });
    });
}

/**
 * 初始化智能体卡片交互
 */
function initAgentCards() {
    const activateButtons = document.querySelectorAll('.activate-agent');
    const viewButtons = document.querySelectorAll('.view-agent');
    
    // 激活智能体按钮点击事件
    activateButtons.forEach(button => {
        button.addEventListener('click', function() {
            const agentCard = this.closest('.agent-card');
            const agentId = agentCard.dataset.agentId;
            toggleAgentActivation(agentId, agentCard);
        });
    });
    
    // 查看详情按钮点击事件
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const agentCard = this.closest('.agent-card');
            const agentId = agentCard.dataset.agentId;
            showAgentDetails(agentId);
        });
    });
}

/**
 * 初始化过滤器功能
 */
function initFilters() {
    // 视图过滤器
    const viewFilterButtons = document.querySelectorAll('[data-view]');
    viewFilterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 移除所有按钮的激活状态
            viewFilterButtons.forEach(btn => btn.classList.remove('active'));
            // 添加当前按钮激活状态
            this.classList.add('active');
            
            const viewType = this.dataset.view;
            const agentsContainer = document.getElementById('agentsContainer');
            
            if (viewType === 'grid') {
                agentsContainer.classList.remove('agents-list');
                agentsContainer.classList.add('agents-grid');
            } else if (viewType === 'list') {
                agentsContainer.classList.remove('agents-grid');
                agentsContainer.classList.add('agents-list');
            }
        });
    });
    
    // 状态过滤器
    const statusFilterButtons = document.querySelectorAll('[data-status]');
    statusFilterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 移除所有按钮的激活状态
            statusFilterButtons.forEach(btn => btn.classList.remove('active'));
            // 添加当前按钮激活状态
            this.classList.add('active');
            
            const statusType = this.dataset.status;
            const agentCards = document.querySelectorAll('.agent-card');
            
            agentCards.forEach(card => {
                if (statusType === 'all') {
                    card.style.display = 'flex';
                } else if (statusType === 'active') {
                    if (card.querySelector('.agent-status').classList.contains('active')) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                } else if (statusType === 'inactive') {
                    if (card.querySelector('.agent-status').classList.contains('inactive')) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                }
            });
        });
    });
    
    // 搜索过滤器
    const searchInput = document.querySelector('.search-filter input');
    searchInput.addEventListener('input', function() {
        const searchText = this.value.toLowerCase();
        const agentCards = document.querySelectorAll('.agent-card');
        
        agentCards.forEach(card => {
            const agentName = card.querySelector('.agent-name').textContent.toLowerCase();
            const agentRole = card.querySelector('.agent-role').textContent.toLowerCase();
            const expertiseTags = Array.from(card.querySelectorAll('.expertise-tag'))
                .map(tag => tag.textContent.toLowerCase());
            
            // 检查是否匹配搜索文本
            const nameMatch = agentName.includes(searchText);
            const roleMatch = agentRole.includes(searchText);
            const expertiseMatch = expertiseTags.some(tag => tag.includes(searchText));
            
            if (nameMatch || roleMatch || expertiseMatch) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    });
    
    // 任务状态过滤器
    const taskStatusFilterButtons = document.querySelectorAll('[data-task-status]');
    taskStatusFilterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 移除所有按钮的激活状态
            taskStatusFilterButtons.forEach(btn => btn.classList.remove('active'));
            // 添加当前按钮激活状态
            this.classList.add('active');
            
            updateTasksList();
        });
    });
    
    // 任务优先级过滤器
    const taskPriorityFilterButtons = document.querySelectorAll('[data-task-priority]');
    taskPriorityFilterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 移除所有按钮的激活状态
            taskPriorityFilterButtons.forEach(btn => btn.classList.remove('active'));
            // 添加当前按钮激活状态
            this.classList.add('active');
            
            updateTasksList();
        });
    });
    
    // 任务搜索过滤器
    const taskSearchInput = document.querySelector('.tasks-filters .search-filter input');
    taskSearchInput.addEventListener('input', function() {
        updateTasksList();
    });
}

/**
 * 初始化任务分配表单
 */
function initTaskForm() {
    const resetButton = document.getElementById('resetTaskForm');
    const assignButton = document.getElementById('assignTask');
    
    // 重置表单按钮点击事件
    resetButton?.addEventListener('click', function() {
        document.getElementById('taskTitle').value = '';
        document.getElementById('taskDescription').value = '';
        document.getElementById('taskPriority').value = 'medium';
        document.getElementById('taskDeadline').value = '';
        
        // 重置分配的智能体
        const assignCheckboxes = document.querySelectorAll('.assign-agent-checkbox');
        assignCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
    });
    
    // 分配任务按钮点击事件
    assignButton?.addEventListener('click', function() {
        const title = document.getElementById('taskTitle').value;
        const description = document.getElementById('taskDescription').value;
        const priority = document.getElementById('taskPriority').value;
        const deadline = document.getElementById('taskDeadline').value;
        
        // 验证任务标题和描述
        if (!title.trim()) {
            showNotification('请输入任务标题', 'error');
            return;
        }
        
        if (!description.trim()) {
            showNotification('请输入任务描述', 'error');
            return;
        }
        
        // 获取选中的智能体
        const selectedAgents = [];
        const assignCheckboxes = document.querySelectorAll('.assign-agent-checkbox:checked');
        
        if (assignCheckboxes.length === 0) {
            showNotification('请至少选择一个智能体', 'error');
            return;
        }
        
        assignCheckboxes.forEach(checkbox => {
            selectedAgents.push(checkbox.value);
        });
        
        // 创建新任务
        const newTask = {
            id: generateTaskId(),
            title: title,
            description: description,
            priority: priority,
            deadline: deadline,
            status: 'pending',
            createdAt: new Date().toISOString(),
            assignedAgents: selectedAgents
        };
        
        // 添加到任务列表
        tasks.unshift(newTask);
        
        // 更新任务列表显示
        updateTasksList();
        
        // 显示成功通知
        showNotification('任务已成功分配', 'success');
        
        // 重置表单
        resetButton.click();
    });
}

/**
 * 切换智能体激活状态
 * @param {string} agentId - 智能体ID
 * @param {Element} agentCard - 智能体卡片DOM元素
 */
function toggleAgentActivation(agentId, agentCard) {
    const agentStatusElement = agentCard.querySelector('.agent-status');
    const activateButton = agentCard.querySelector('.activate-agent');
    
    // 检查智能体当前是否已激活
    const isActive = agentStatusElement.classList.contains('active');
    
    if (isActive) {
        // 停用智能体
        agentStatusElement.classList.remove('active');
        agentStatusElement.classList.add('inactive');
        
        // 更新按钮文本
        activateButton.textContent = '激活智能体';
        
        // 从已激活智能体列表中移除
        activeAgents = activeAgents.filter(id => id !== agentId);
    } else {
        // 激活智能体
        agentStatusElement.classList.remove('inactive');
        agentStatusElement.classList.add('active');
        
        // 更新按钮文本
        activateButton.textContent = '停用智能体';
        
        // 添加到已激活智能体列表
        activeAgents.push(agentId);
    }
    
    // 更新已激活智能体列表显示
    updateActiveAgentsList();
    
    // 更新可分配智能体列表
    updateAssignableAgentsList();
}

/**
 * 更新已激活智能体列表
 */
function updateActiveAgentsList() {
    const activeAgentsList = document.getElementById('activeAgentsList');
    const noActiveAgents = document.getElementById('noActiveAgents');
    
    if (!activeAgentsList || !noActiveAgents) return;
    
    // 清空列表
    activeAgentsList.innerHTML = '';
    
    if (activeAgents.length === 0) {
        // 显示无智能体提示
        activeAgentsList.style.display = 'none';
        noActiveAgents.style.display = 'flex';
        return;
    }
    
    // 隐藏无智能体提示
    activeAgentsList.style.display = 'grid';
    noActiveAgents.style.display = 'none';
    
    // 添加每个激活的智能体
    activeAgents.forEach(agentId => {
        const agent = agentsData.find(a => a.id === agentId);
        if (!agent) return;
        
        const agentElement = document.createElement('div');
        agentElement.className = 'active-agent-item';
        agentElement.innerHTML = `
            <div class="active-agent-info">
                <div class="active-agent-avatar">
                    <i class="fas ${agent.icon}"></i>
                </div>
                <div class="active-agent-details">
                    <h4 class="active-agent-name">${agent.name}</h4>
                    <p class="active-agent-role">${agent.role}</p>
                </div>
            </div>
            <div class="active-agent-actions">
                <button class="btn btn-sm btn-outline collaborate-btn" data-agent-id="${agent.id}">
                    <i class="fas fa-users"></i> 协作
                </button>
                <button class="btn btn-sm btn-danger deactivate-btn" data-agent-id="${agent.id}">
                    <i class="fas fa-power-off"></i> 停用
                </button>
            </div>
        `;
        
        activeAgentsList.appendChild(agentElement);
    });
    
    // 绑定停用按钮事件
    const deactivateButtons = document.querySelectorAll('.deactivate-btn');
    deactivateButtons.forEach(button => {
        button.addEventListener('click', function() {
            const agentId = this.dataset.agentId;
            const agentCard = document.querySelector(`.agent-card[data-agent-id="${agentId}"]`);
            
            if (agentCard) {
                toggleAgentActivation(agentId, agentCard);
            }
        });
    });
    
    // 绑定协作按钮事件
    const collaborateButtons = document.querySelectorAll('.collaborate-btn');
    collaborateButtons.forEach(button => {
        button.addEventListener('click', function() {
            const agentId = this.dataset.agentId;
            showCollaborationModal(agentId);
        });
    });
}

/**
 * 更新可分配的智能体列表
 */
function updateAssignableAgentsList() {
    const assignAgentsContainer = document.getElementById('assignAgentsContainer');
    
    if (!assignAgentsContainer) return;
    
    // 清空列表
    assignAgentsContainer.innerHTML = '';
    
    if (activeAgents.length === 0) {
        // 显示无智能体提示
        const noAgentsMessage = document.createElement('p');
        noAgentsMessage.className = 'no-agents-message';
        noAgentsMessage.textContent = '请先激活智能体';
        assignAgentsContainer.appendChild(noAgentsMessage);
        return;
    }
    
    // 创建可分配智能体列表
    const assignAgentsList = document.createElement('div');
    assignAgentsList.className = 'assign-agents-list';
    
    activeAgents.forEach(agentId => {
        const agent = agentsData.find(a => a.id === agentId);
        if (!agent) return;
        
        const agentCheckbox = document.createElement('div');
        agentCheckbox.className = 'assign-agent-checkbox-item';
        agentCheckbox.innerHTML = `
            <label class="agent-checkbox-label">
                <input type="checkbox" class="assign-agent-checkbox" value="${agent.id}">
                <div class="agent-checkbox-info">
                    <i class="fas ${agent.icon}"></i>
                    <span>${agent.name}</span>
                </div>
            </label>
        `;
        
        assignAgentsList.appendChild(agentCheckbox);
    });
    
    assignAgentsContainer.appendChild(assignAgentsList);
}

/**
 * 更新任务列表
 */
function updateTasksList() {
    const tasksList = document.getElementById('tasksList');
    const noTasks = document.getElementById('noTasks');
    const pageInfo = document.getElementById('pageInfo');
    const currentPageSpan = document.getElementById('currentPage');
    const totalPagesSpan = document.getElementById('totalPages');
    const prevPageButton = document.getElementById('prevPage');
    const nextPageButton = document.getElementById('nextPage');
    
    if (!tasksList || !noTasks) return;
    
    // 应用过滤器
    let filteredTasks = [...tasks];
    
    // 状态过滤
    const activeStatusFilter = document.querySelector('[data-task-status].active');
    if (activeStatusFilter && activeStatusFilter.dataset.taskStatus !== 'all') {
        const statusFilter = activeStatusFilter.dataset.taskStatus;
        filteredTasks = filteredTasks.filter(task => task.status === statusFilter);
    }
    
    // 优先级过滤
    const activePriorityFilter = document.querySelector('[data-task-priority].active');
    if (activePriorityFilter && activePriorityFilter.dataset.taskPriority !== 'all') {
        const priorityFilter = activePriorityFilter.dataset.taskPriority;
        filteredTasks = filteredTasks.filter(task => task.priority === priorityFilter);
    }
    
    // 搜索过滤
    const searchInput = document.querySelector('.tasks-filters .search-filter input');
    if (searchInput && searchInput.value.trim()) {
        const searchText = searchInput.value.trim().toLowerCase();
        filteredTasks = filteredTasks.filter(task => 
            task.title.toLowerCase().includes(searchText) || 
            task.description.toLowerCase().includes(searchText)
        );
    }
    
    // 处理分页
    const tasksPerPage = 5;
    const totalTasks = filteredTasks.length;
    const totalPages = Math.max(1, Math.ceil(totalTasks / tasksPerPage));
    
    // 获取当前页码
    let currentPage = parseInt(currentPageSpan?.textContent) || 1;
    if (currentPage > totalPages) {
        currentPage = totalPages;
    }
    
    // 更新分页信息
    if (currentPageSpan) currentPageSpan.textContent = currentPage;
    if (totalPagesSpan) totalPagesSpan.textContent = totalPages;
    
    // 更新分页按钮状态
    if (prevPageButton) {
        prevPageButton.disabled = currentPage <= 1;
        prevPageButton.addEventListener('click', function() {
            if (currentPage > 1) {
                currentPage--;
                updateTasksList();
            }
        });
    }
    
    if (nextPageButton) {
        nextPageButton.disabled = currentPage >= totalPages;
        nextPageButton.addEventListener('click', function() {
            if (currentPage < totalPages) {
                currentPage++;
                updateTasksList();
            }
        });
    }
    
    // 计算当前页的任务索引范围
    const startIndex = (currentPage - 1) * tasksPerPage;
    const endIndex = Math.min(startIndex + tasksPerPage, totalTasks);
    
    // 显示当前页的任务
    const currentPageTasks = filteredTasks.slice(startIndex, endIndex);
    
    // 清空任务列表
    tasksList.innerHTML = '';
    
    if (currentPageTasks.length === 0) {
        // 显示无任务提示
        if (noTasks) noTasks.style.display = 'flex';
        if (pageInfo) pageInfo.style.display = 'none';
        return;
    }
    
    // 隐藏无任务提示，显示分页信息
    if (noTasks) noTasks.style.display = 'none';
    if (pageInfo) pageInfo.style.display = 'flex';
    
    // 添加任务到列表
    currentPageTasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = `task-item priority-${task.priority} status-${task.status}`;
        taskElement.dataset.taskId = task.id;
        
        // 获取任务的智能体信息
        const assignedAgentsInfo = task.assignedAgents.map(agentId => {
            const agent = agentsData.find(a => a.id === agentId);
            return agent ? `<span class="agent-tag"><i class="fas ${agent.icon}"></i> ${agent.name}</span>` : '';
        }).join('');
        
        // 格式化创建日期
        const createdDate = new Date(task.createdAt);
        const formattedDate = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}-${String(createdDate.getDate()).padStart(2, '0')}`;
        
        // 获取优先级标签颜色
        let priorityLabel, priorityColor;
        switch (task.priority) {
            case 'urgent':
                priorityLabel = '紧急';
                priorityColor = 'var(--danger-color)';
                break;
            case 'high':
                priorityLabel = '高';
                priorityColor = 'var(--warning-color)';
                break;
            case 'medium':
                priorityLabel = '中';
                priorityColor = 'var(--secondary-color)';
                break;
            case 'low':
                priorityLabel = '低';
                priorityColor = 'var(--success-color)';
                break;
            default:
                priorityLabel = '中';
                priorityColor = 'var(--secondary-color)';
        }
        
        taskElement.innerHTML = `
            <div class="task-header">
                <h3 class="task-title">${task.title}</h3>
                <div class="task-status ${task.status}">
                    ${task.status === 'pending' ? '进行中' : '已完成'}
                </div>
            </div>
            <div class="task-body">
                <p class="task-description">${task.description}</p>
                <div class="task-metadata">
                    <div class="task-priority" style="color: ${priorityColor}">
                        <i class="fas fa-flag"></i> ${priorityLabel}
                    </div>
                    ${task.deadline ? `<div class="task-deadline"><i class="fas fa-calendar-alt"></i> ${task.deadline}</div>` : ''}
                    <div class="task-date"><i class="fas fa-clock"></i> ${formattedDate}</div>
                </div>
                <div class="task-agents">
                    <div class="task-agents-label">分配给：</div>
                    <div class="task-agents-list">${assignedAgentsInfo}</div>
                </div>
            </div>
            <div class="task-actions">
                <button class="btn btn-sm btn-outline edit-task-btn" data-task-id="${task.id}">
                    <i class="fas fa-edit"></i> 编辑
                </button>
                ${task.status === 'pending' ? 
                    `<button class="btn btn-sm btn-success complete-task-btn" data-task-id="${task.id}">
                        <i class="fas fa-check"></i> 完成
                    </button>` : 
                    `<button class="btn btn-sm btn-primary reopen-task-btn" data-task-id="${task.id}">
                        <i class="fas fa-redo"></i> 重新开始
                    </button>`
                }
                <button class="btn btn-sm btn-danger delete-task-btn" data-task-id="${task.id}">
                    <i class="fas fa-trash"></i> 删除
                </button>
            </div>
        `;
        
        tasksList.appendChild(taskElement);
    });
    
    // 绑定任务按钮事件
    bindTaskButtonEvents();
}

/**
 * 绑定任务按钮事件
 */
function bindTaskButtonEvents() {
    // 编辑任务按钮事件
    const editTaskButtons = document.querySelectorAll('.edit-task-btn');
    editTaskButtons.forEach(button => {
        button.addEventListener('click', function() {
            const taskId = this.dataset.taskId;
            showEditTaskModal(taskId);
        });
    });
    
    // 完成任务按钮事件
    const completeTaskButtons = document.querySelectorAll('.complete-task-btn');
    completeTaskButtons.forEach(button => {
        button.addEventListener('click', function() {
            const taskId = this.dataset.taskId;
            const taskIndex = tasks.findIndex(task => task.id === taskId);
            
            if (taskIndex !== -1) {
                tasks[taskIndex].status = 'completed';
                updateTasksList();
                showNotification('任务已标记为完成', 'success');
            }
        });
    });
    
    // 重新开始任务按钮事件
    const reopenTaskButtons = document.querySelectorAll('.reopen-task-btn');
    reopenTaskButtons.forEach(button => {
        button.addEventListener('click', function() {
            const taskId = this.dataset.taskId;
            const taskIndex = tasks.findIndex(task => task.id === taskId);
            
            if (taskIndex !== -1) {
                tasks[taskIndex].status = 'pending';
                updateTasksList();
                showNotification('任务已重新开始', 'success');
            }
        });
    });
    
    // 删除任务按钮事件
    const deleteTaskButtons = document.querySelectorAll('.delete-task-btn');
    deleteTaskButtons.forEach(button => {
        button.addEventListener('click', function() {
            const taskId = this.dataset.taskId;
            if (confirm('确定要删除此任务吗？')) {
                tasks = tasks.filter(task => task.id !== taskId);
                updateTasksList();
                showNotification('任务已删除', 'success');
            }
        });
    });
}

/**
 * 显示智能体详情
 * @param {string} agentId - 智能体ID
 */
function showAgentDetails(agentId) {
    const agent = agentsData.find(a => a.id === agentId);
    if (!agent) return;
    
    // 创建详情模态框内容
    const modalContent = `
        <div class="agent-detail-header">
            <div class="agent-detail-avatar">
                <i class="fas ${agent.icon}"></i>
            </div>
            <div class="agent-detail-info">
                <h2 class="agent-detail-name">${agent.name}</h2>
                <p class="agent-detail-role">${agent.role}</p>
            </div>
        </div>
        <div class="agent-detail-body">
            <div class="agent-detail-section">
                <h3 class="agent-detail-section-title">专业领域</h3>
                <ul class="agent-detail-expertise-list">
                    ${agent.expertise.map(exp => `<li><i class="fas fa-check-circle"></i> ${exp}</li>`).join('')}
                </ul>
            </div>
            <div class="agent-detail-section">
                <h3 class="agent-detail-section-title">智能体介绍</h3>
                <p class="agent-detail-description">${agent.description}</p>
            </div>
            <div class="agent-detail-actions">
                <button class="btn btn-primary activate-detail-agent" data-agent-id="${agent.id}">
                    ${activeAgents.includes(agent.id) ? '停用智能体' : '激活智能体'}
                </button>
                <button class="btn btn-outline close-detail-modal">关闭</button>
            </div>
        </div>
    `;
    
    showModal('智能体详情', modalContent);
    
    // 绑定详情模态框中的激活按钮
    document.querySelector('.activate-detail-agent')?.addEventListener('click', function() {
        const agentCard = document.querySelector(`.agent-card[data-agent-id="${agent.id}"]`);
        if (agentCard) {
            toggleAgentActivation(agent.id, agentCard);
            this.textContent = activeAgents.includes(agent.id) ? '停用智能体' : '激活智能体';
        }
    });
    
    // 绑定关闭按钮
    document.querySelector('.close-detail-modal')?.addEventListener('click', function() {
        closeModal();
    });
}

/**
 * 显示智能体协作模态框
 * @param {string} agentId - 智能体ID
 */
function showCollaborationModal(agentId) {
    const agent = agentsData.find(a => a.id === agentId);
    if (!agent) return;
    
    // 获取其他可用于协作的智能体
    const otherActiveAgents = activeAgents
        .filter(id => id !== agentId)
        .map(id => agentsData.find(a => a.id === id))
        .filter(a => a); // 过滤掉undefined
    
    // 创建协作模态框内容
    const modalContent = `
        <div class="collaboration-modal-content">
            <div class="collaboration-agent-info">
                <div class="collaboration-agent-avatar">
                    <i class="fas ${agent.icon}"></i>
                </div>
                <div class="collaboration-agent-details">
                    <h3 class="collaboration-agent-name">${agent.name}</h3>
                    <p class="collaboration-agent-role">${agent.role}</p>
                </div>
            </div>
            
            <div class="collaboration-description">
                <p>选择要与 <strong>${agent.name}</strong> 协作的其他智能体：</p>
            </div>
            
            ${otherActiveAgents.length > 0 ? `
                <div class="collaboration-agents-list">
                    ${otherActiveAgents.map(a => `
                        <div class="collaboration-agent-option">
                            <label class="collaboration-checkbox-label">
                                <input type="checkbox" class="collaboration-agent-checkbox" value="${a.id}">
                                <div class="collaboration-checkbox-info">
                                    <i class="fas ${a.icon}"></i>
                                    <span>${a.name}</span>
                                </div>
                            </label>
                        </div>
                    `).join('')}
                </div>
                
                <div class="collaboration-form">
                    <div class="form-group">
                        <label for="collaborationTask">协作任务</label>
                        <input type="text" id="collaborationTask" placeholder="输入协作任务名称">
                    </div>
                    <div class="form-group">
                        <label for="collaborationObjective">协作目标</label>
                        <textarea id="collaborationObjective" rows="3" placeholder="描述协作目标和期望结果"></textarea>
                    </div>
                </div>
                
                <div class="collaboration-actions">
                    <button class="btn btn-outline" id="cancelCollaboration">取消</button>
                    <button class="btn btn-primary" id="startCollaboration">开始协作</button>
                </div>
            ` : `
                <div class="no-collaboration-agents">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>没有其他已激活的智能体可供协作</p>
                    <p>请先激活其他智能体</p>
                </div>
                
                <div class="collaboration-actions center">
                    <button class="btn btn-outline" id="cancelCollaboration">关闭</button>
                </div>
            `}
        </div>
    `;
    
    showModal('智能体协作', modalContent);
    
    // 绑定协作按钮事件
    document.getElementById('startCollaboration')?.addEventListener('click', function() {
        const taskName = document.getElementById('collaborationTask')?.value;
        const objective = document.getElementById('collaborationObjective')?.value;
        const selectedAgents = Array.from(document.querySelectorAll('.collaboration-agent-checkbox:checked'))
            .map(checkbox => checkbox.value);
        
        if (!taskName || !taskName.trim()) {
            showNotification('请输入协作任务名称', 'error');
            return;
        }
        
        if (!objective || !objective.trim()) {
            showNotification('请描述协作目标', 'error');
            return;
        }
        
        if (selectedAgents.length === 0) {
            showNotification('请选择至少一个协作智能体', 'error');
            return;
        }
        
        // 创建协作任务
        const collaborationTask = {
            id: generateTaskId(),
            title: taskName,
            description: objective,
            priority: 'high',
            status: 'pending',
            createdAt: new Date().toISOString(),
            assignedAgents: [agentId, ...selectedAgents],
            isCollaboration: true
        };
        
        // 添加任务并更新列表
        tasks.unshift(collaborationTask);
        updateTasksList();
        
        showNotification('协作任务已创建', 'success');
        closeModal();
    });
    
    // 绑定取消按钮事件
    document.getElementById('cancelCollaboration')?.addEventListener('click', function() {
        closeModal();
    });
}

/**
 * 显示编辑任务模态框
 * @param {string} taskId - 任务ID
 */
function showEditTaskModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // 获取任务的智能体
    const assignedAgentIds = [...task.assignedAgents];
    
    // 创建模态框内容
    const modalContent = `
        <div class="edit-task-form">
            <div class="form-group">
                <label for="editTaskTitle">任务标题</label>
                <input type="text" id="editTaskTitle" value="${task.title}">
            </div>
            <div class="form-group">
                <label for="editTaskDescription">任务描述</label>
                <textarea id="editTaskDescription" rows="4">${task.description}</textarea>
            </div>
            <div class="form-group">
                <label for="editTaskPriority">优先级</label>
                <select id="editTaskPriority">
                    <option value="low" ${task.priority === 'low' ? 'selected' : ''}>低</option>
                    <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>中</option>
                    <option value="high" ${task.priority === 'high' ? 'selected' : ''}>高</option>
                    <option value="urgent" ${task.priority === 'urgent' ? 'selected' : ''}>紧急</option>
                </select>
            </div>
            <div class="form-group">
                <label for="editTaskDeadline">截止日期（可选）</label>
                <input type="date" id="editTaskDeadline" value="${task.deadline || ''}">
            </div>
            <div class="form-group">
                <label>分配给</label>
                <div class="edit-task-agents">
                    ${assignedAgentIds.map(agentId => {
                        const agent = agentsData.find(a => a.id === agentId);
                        return agent ? `
                            <div class="edit-task-agent">
                                <i class="fas ${agent.icon}"></i>
                                <span>${agent.name}</span>
                            </div>
                        ` : '';
                    }).join('')}
                    <button class="btn btn-sm btn-outline" id="changeTaskAgents">
                        <i class="fas fa-exchange-alt"></i> 更改
                    </button>
                </div>
            </div>
            <div class="form-actions">
                <button class="btn btn-outline" id="cancelTaskEdit">取消</button>
                <button class="btn btn-primary" id="saveTaskEdit">保存修改</button>
            </div>
        </div>
    `;
    
    showModal('编辑任务', modalContent);
    
    // 绑定更改智能体按钮事件
    document.getElementById('changeTaskAgents')?.addEventListener('click', function() {
        showChangeAgentsModal(taskId);
    });
    
    // 绑定保存按钮事件
    document.getElementById('saveTaskEdit')?.addEventListener('click', function() {
        const title = document.getElementById('editTaskTitle').value;
        const description = document.getElementById('editTaskDescription').value;
        const priority = document.getElementById('editTaskPriority').value;
        const deadline = document.getElementById('editTaskDeadline').value;
        
        if (!title.trim()) {
            showNotification('请输入任务标题', 'error');
            return;
        }
        
        if (!description.trim()) {
            showNotification('请输入任务描述', 'error');
            return;
        }
        
        // 更新任务
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            tasks[taskIndex].title = title;
            tasks[taskIndex].description = description;
            tasks[taskIndex].priority = priority;
            tasks[taskIndex].deadline = deadline;
            
            updateTasksList();
            showNotification('任务已更新', 'success');
            closeModal();
        }
    });
    
    // 绑定取消按钮事件
    document.getElementById('cancelTaskEdit')?.addEventListener('click', function() {
        closeModal();
    });
}

/**
 * 生成唯一的任务ID
 * @returns {string} 任务ID
 */
function generateTaskId() {
    return 'task_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

/**
 * 显示模态框
 * @param {string} title - 模态框标题
 * @param {string} content - 模态框内容
 */
function showModal(title, content) {
    // 检查是否已存在模态框，如存在则先移除
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) {
        existingModal.remove();
    }
    
    // 创建模态框
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    
    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal-container';
    
    modalContainer.innerHTML = `
        <div class="modal-header">
            <h2 class="modal-title">${title}</h2>
            <button class="modal-close"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
            ${content}
        </div>
    `;
    
    modalOverlay.appendChild(modalContainer);
    document.body.appendChild(modalOverlay);
    
    // 绑定关闭按钮事件
    modalOverlay.querySelector('.modal-close').addEventListener('click', closeModal);
    
    // 点击模态框外部关闭
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
    
    // 防止滚动
    document.body.style.overflow = 'hidden';
    
    // 动画效果
    setTimeout(() => {
        modalOverlay.classList.add('active');
        modalContainer.classList.add('active');
    }, 10);
}

/**
 * 关闭模态框
 */
function closeModal() {
    const modalOverlay = document.querySelector('.modal-overlay');
    if (!modalOverlay) return;
    
    // 移除动画类
    modalOverlay.classList.remove('active');
    modalOverlay.querySelector('.modal-container').classList.remove('active');
    
    // 延迟后移除元素
    setTimeout(() => {
        modalOverlay.remove();
        document.body.style.overflow = '';
    }, 300);
}

/**
 * 显示通知
 * @param {string} message - 通知消息
 * @param {string} type - 通知类型 (success, error, info)
 */
function showNotification(message, type = 'info') {
    // 检查是否已有相同通知
    const existingNotification = document.querySelector(`.notification[data-message="${message}"]`);
    if (existingNotification) return;
    
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.dataset.message = message;
    
    // 设置图标
    let icon;
    switch (type) {
        case 'success':
            icon = 'fa-check-circle';
            break;
        case 'error':
            icon = 'fa-exclamation-circle';
            break;
        default:
            icon = 'fa-info-circle';
    }
    
    notification.innerHTML = `
        <i class="fas ${icon}"></i>
        <p>${message}</p>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    // 添加到页面
    const notificationsContainer = document.querySelector('.notifications-container');
    if (notificationsContainer) {
        notificationsContainer.appendChild(notification);
    } else {
        const container = document.createElement('div');
        container.className = 'notifications-container';
        container.appendChild(notification);
        document.body.appendChild(container);
    }
    
    // 绑定关闭按钮
    notification.querySelector('.notification-close').addEventListener('click', function() {
        removeNotification(notification);
    });
    
    // 自动关闭
    setTimeout(() => {
        if (document.body.contains(notification)) {
            removeNotification(notification);
        }
    }, 5000);
    
    // 添加动画
    setTimeout(() => {
        notification.classList.add('active');
    }, 10);
}

/**
 * 移除通知
 * @param {Element} notification - 通知元素
 */
function removeNotification(notification) {
    notification.classList.remove('active');
    
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.remove();
            
            // 检查通知容器是否为空，如果为空则移除容器
            const container = document.querySelector('.notifications-container');
            if (container && container.children.length === 0) {
                container.remove();
            }
        }
    }, 300);
}

/**
 * 显示更改任务分配智能体的模态框
 * @param {string} taskId - 任务ID
 */
function showChangeAgentsModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // 获取已分配的智能体
    const assignedAgentIds = [...task.assignedAgents];
    
    // 创建模态框内容
    const modalContent = `
        <div class="change-agents-modal">
            <p class="change-agents-description">选择要分配给任务的智能体：</p>
            
            ${activeAgents.length > 0 ? `
                <div class="change-agents-list">
                    ${activeAgents.map(agentId => {
                        const agent = agentsData.find(a => a.id === agentId);
                        if (!agent) return '';
                        
                        const isAssigned = assignedAgentIds.includes(agentId);
                        
                        return `
                            <div class="change-agent-option">
                                <label class="change-agent-checkbox-label">
                                    <input type="checkbox" class="change-agent-checkbox" value="${agent.id}" ${isAssigned ? 'checked' : ''}>
                                    <div class="change-agent-checkbox-info">
                                        <i class="fas ${agent.icon}"></i>
                                        <span>${agent.name}</span>
                                    </div>
                                </label>
                            </div>
                        `;
                    }).join('')}
                </div>
                
                <div class="change-agents-actions">
                    <button class="btn btn-outline" id="cancelChangeAgents">取消</button>
                    <button class="btn btn-primary" id="saveChangeAgents">保存</button>
                </div>
            ` : `
                <div class="no-active-agents">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>没有已激活的智能体</p>
                    <p>请先激活智能体</p>
                </div>
                
                <div class="change-agents-actions center">
                    <button class="btn btn-outline" id="cancelChangeAgents">关闭</button>
                </div>
            `}
        </div>
    `;
    
    showModal('更改任务分配', modalContent);
    
    // 绑定保存按钮事件
    document.getElementById('saveChangeAgents')?.addEventListener('click', function() {
        const selectedAgents = Array.from(document.querySelectorAll('.change-agent-checkbox:checked'))
            .map(checkbox => checkbox.value);
        
        if (selectedAgents.length === 0) {
            showNotification('请至少选择一个智能体', 'error');
            return;
        }
        
        // 更新任务的智能体
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            tasks[taskIndex].assignedAgents = selectedAgents;
            
            // 更新任务列表
            updateTasksList();
            
            // 关闭更改智能体模态框
            closeModal();
            
            // 关闭编辑模态框，重新打开更新后的编辑模态框
            setTimeout(() => {
                showEditTaskModal(taskId);
            }, 350);
            
            showNotification('任务分配已更新', 'success');
        }
    });
    
    // 绑定取消按钮事件
    document.getElementById('cancelChangeAgents')?.addEventListener('click', function() {
        closeModal();
        // 重新打开编辑模态框
        setTimeout(() => {
            showEditTaskModal(taskId);
        }, 350);
    });
}

/**
 * 初始化任务过滤器
 */
function initTaskFilters() {
    // 状态过滤器按钮
    const statusFilterButtons = document.querySelectorAll('[data-task-status]');
    statusFilterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 移除所有状态过滤器的活动类
            statusFilterButtons.forEach(btn => btn.classList.remove('active'));
            // 添加当前按钮的活动类
            this.classList.add('active');
            // 更新任务列表
            updateTasksList();
        });
    });
    
    // 优先级过滤器按钮
    const priorityFilterButtons = document.querySelectorAll('[data-task-priority]');
    priorityFilterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 移除所有优先级过滤器的活动类
            priorityFilterButtons.forEach(btn => btn.classList.remove('active'));
            // 添加当前按钮的活动类
            this.classList.add('active');
            // 更新任务列表
            updateTasksList();
        });
    });
    
    // 搜索过滤器
    const searchInput = document.querySelector('.tasks-filters .search-filter input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            // 延迟执行搜索，减少频繁更新
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                updateTasksList();
            }, 300);
        });
    }
}

/**
 * 初始化智能体搜索
 */
function initAgentSearch() {
    const searchInput = document.querySelector('.agent-search input');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function() {
        const searchText = this.value.trim().toLowerCase();
        const agentCards = document.querySelectorAll('.agent-card');
        
        agentCards.forEach(card => {
            const agentId = card.dataset.agentId;
            const agent = agentsData.find(a => a.id === agentId);
            
            if (!agent) return;
            
            // 检查智能体名称、角色或专业领域是否包含搜索文本
            const nameMatch = agent.name.toLowerCase().includes(searchText);
            const roleMatch = agent.role.toLowerCase().includes(searchText);
            const expertiseMatch = agent.expertise.some(exp => exp.toLowerCase().includes(searchText));
            
            // 如果有匹配项或搜索框为空，则显示卡片，否则隐藏
            if (searchText === '' || nameMatch || roleMatch || expertiseMatch) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
        
        // 更新无结果提示
        updateNoAgentResultsMessage(searchText);
    });
}

/**
 * 更新无智能体搜索结果提示
 * @param {string} searchText - 搜索文本
 */
function updateNoAgentResultsMessage(searchText) {
    const agentGrid = document.querySelector('.agents-grid');
    
    // 检查是否有可见的智能体卡片
    const visibleCards = Array.from(document.querySelectorAll('.agent-card'))
        .filter(card => card.style.display !== 'none');
        
    // 获取或创建无结果提示
    let noResultsMessage = document.querySelector('.no-agent-results');
    
    if (visibleCards.length === 0 && searchText.trim() !== '') {
        // 没有搜索结果
        if (!noResultsMessage) {
            noResultsMessage = document.createElement('div');
            noResultsMessage.className = 'no-agent-results';
            noResultsMessage.innerHTML = `
                <i class="fas fa-search"></i>
                <p>没有找到匹配的智能体</p>
            `;
            agentGrid.appendChild(noResultsMessage);
        }
    } else {
        // 有搜索结果或搜索框为空，移除提示
        if (noResultsMessage) {
            noResultsMessage.remove();
        }
    }
}

/**
 * 初始化排序功能
 */
function initSorting() {
    // 智能体排序
    const agentSortSelect = document.getElementById('agentSortSelect');
    if (agentSortSelect) {
        agentSortSelect.addEventListener('change', function() {
            sortAgents(this.value);
        });
    }
    
    // 任务排序
    const taskSortSelect = document.getElementById('taskSortSelect');
    if (taskSortSelect) {
        taskSortSelect.addEventListener('change', function() {
            sortTasks(this.value);
        });
    }
}

/**
 * 对智能体进行排序
 * @param {string} sortCriteria - 排序标准
 */
function sortAgents(sortCriteria) {
    const agentCards = Array.from(document.querySelectorAll('.agent-card'));
    const agentGrid = document.querySelector('.agents-grid');
    
    if (!agentGrid || agentCards.length === 0) return;
    
    // 根据排序标准对卡片进行排序
    agentCards.sort((a, b) => {
        const aId = a.dataset.agentId;
        const bId = b.dataset.agentId;
        const agentA = agentsData.find(agent => agent.id === aId);
        const agentB = agentsData.find(agent => agent.id === bId);
        
        if (!agentA || !agentB) return 0;
        
        switch (sortCriteria) {
            case 'name-asc':
                return agentA.name.localeCompare(agentB.name);
            case 'name-desc':
                return agentB.name.localeCompare(agentA.name);
            case 'role-asc':
                return agentA.role.localeCompare(agentB.role);
            case 'role-desc':
                return agentB.role.localeCompare(agentA.role);
            case 'status-active':
                return (activeAgents.includes(bId) ? 1 : 0) - (activeAgents.includes(aId) ? 1 : 0);
            case 'status-inactive':
                return (activeAgents.includes(aId) ? 1 : 0) - (activeAgents.includes(bId) ? 1 : 0);
            default:
                return 0;
        }
    });
    
    // 重新添加排序后的卡片
    agentCards.forEach(card => {
        agentGrid.appendChild(card);
    });
}

/**
 * 对任务进行排序
 * @param {string} sortCriteria - 排序标准
 */
function sortTasks(sortCriteria) {
    // 根据排序标准排序
    tasks.sort((a, b) => {
        switch (sortCriteria) {
            case 'date-desc':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'date-asc':
                return new Date(a.createdAt) - new Date(b.createdAt);
            case 'priority-high':
                const priorityOrder = { 'urgent': 3, 'high': 2, 'medium': 1, 'low': 0 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            case 'priority-low':
                const priorityOrder2 = { 'urgent': 3, 'high': 2, 'medium': 1, 'low': 0 };
                return priorityOrder2[a.priority] - priorityOrder2[b.priority];
            case 'status-pending':
                return (b.status === 'pending' ? 1 : 0) - (a.status === 'pending' ? 1 : 0);
            case 'status-completed':
                return (b.status === 'completed' ? 1 : 0) - (a.status === 'completed' ? 1 : 0);
            default:
                return new Date(b.createdAt) - new Date(a.createdAt);
        }
    });
    
    // 更新任务列表
    updateTasksList();
}

/**
 * 保存数据到本地存储
 */
function saveToLocalStorage() {
    // 保存活动智能体
    localStorage.setItem('activeAgents', JSON.stringify(activeAgents));
    
    // 保存任务
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

/**
 * 从本地存储加载数据
 */
function loadFromLocalStorage() {
    // 加载活动智能体
    const storedActiveAgents = localStorage.getItem('activeAgents');
    if (storedActiveAgents) {
        activeAgents = JSON.parse(storedActiveAgents);
    }
    
    // 加载任务
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
    }
}

/**
 * 主初始化函数
 */
function init() {
    // 从本地存储加载数据
    loadFromLocalStorage();
    
    // 初始化智能体卡片
    initAgentCards();
    
    // 初始化任务创建
    initTaskCreation();
    
    // 初始化任务过滤器
    initTaskFilters();
    
    // 初始化智能体搜索
    initAgentSearch();
    
    // 初始化排序功能
    initSorting();
    
    // 更新任务列表
    updateTasksList();
    
    // 添加自动保存功能
    window.addEventListener('beforeunload', saveToLocalStorage);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);
