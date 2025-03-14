/**
 * CosmicWeave - 智能体系统主文件
 * 该文件整合所有智能体子系统功能
 */

// 初始化任务管理系统
function initTaskSystem() {
    // 初始化任务创建按钮
    const createTaskBtn = document.getElementById('createTaskBtn');
    if (createTaskBtn) {
        createTaskBtn.addEventListener('click', function() {
            showCreateTaskModal();
        });
    }
    
    // 初始化任务过滤器
    initTaskFilters();
    
    // 更新任务列表
    updateTasksList();
}

// 初始化任务过滤器
function initTaskFilters() {
    // 搜索框功能
    const taskSearch = document.getElementById('taskSearch');
    const taskSearchBtn = document.getElementById('taskSearchBtn');
    
    if (taskSearch && taskSearchBtn) {
        taskSearchBtn.addEventListener('click', function() {
            updateTasksList();
        });
        
        taskSearch.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                updateTasksList();
            }
        });
    }
    
    // 状态过滤器
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', updateTasksList);
    }
    
    // 智能体过滤器
    const agentFilter = document.getElementById('agentFilter');
    if (agentFilter) {
        // 填充智能体选项
        if (window.agentsData) {
            agentFilter.innerHTML = '<option value="all">所有智能体</option>';
            window.agentsData.forEach(agent => {
                agentFilter.innerHTML += `<option value="${agent.id}">${agent.name}</option>`;
            });
        }
        
        agentFilter.addEventListener('change', updateTasksList);
    }
    
    // 排序选项
    const sortTasks = document.getElementById('sortTasks');
    if (sortTasks) {
        sortTasks.addEventListener('change', updateTasksList);
    }
}

// 更新任务列表
function updateTasksList() {
    const tasksList = document.getElementById('tasksList');
    
    if (!tasksList || !window.tasks) {
        return;
    }
    
    // 获取过滤条件
    const searchTerm = document.getElementById('taskSearch')?.value || '';
    const statusFilter = document.getElementById('statusFilter')?.value || 'all';
    const agentFilter = document.getElementById('agentFilter')?.value || 'all';
    const sortBy = document.getElementById('sortTasks')?.value || 'newest';
    
    // 过滤任务
    let filteredTasks = window.tasks.filter(task => {
        // 搜索词过滤
        if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false;
        }
        
        // 状态过滤
        if (statusFilter !== 'all' && task.status !== statusFilter) {
            return false;
        }
        
        // 智能体过滤
        if (agentFilter !== 'all' && !task.assignedAgents.includes(agentFilter)) {
            return false;
        }
        
        return true;
    });
    
    // 排序任务
    filteredTasks.sort((a, b) => {
        switch (sortBy) {
            case 'newest':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'oldest':
                return new Date(a.createdAt) - new Date(b.createdAt);
            case 'priority':
                const priorityValues = { high: 3, medium: 2, low: 1 };
                return priorityValues[b.priority] - priorityValues[a.priority];
            case 'deadline':
                if (!a.deadline) return 1;
                if (!b.deadline) return -1;
                return new Date(a.deadline) - new Date(b.deadline);
            default:
                return 0;
        }
    });
    
    // 如果没有任务，显示空状态
    if (filteredTasks.length === 0) {
        tasksList.innerHTML = `
            <div class="empty-tasks">
                <i class="fas fa-tasks"></i>
                <p>没有符合条件的任务</p>
            </div>
        `;
        return;
    }
    
    // 构建任务列表
    let tasksHTML = '';
    
    filteredTasks.forEach(task => {
        // 构建智能体标签
        const agentTags = task.assignedAgents.map(agentId => {
            const agent = window.agentsData.find(a => a.id === agentId);
            return agent ? `
                <span class="agent-tag" data-agent-id="${agent.id}">
                    <i class="fas ${agent.icon}"></i> ${agent.name}
                </span>
            ` : '';
        }).join('');
        
        // 构建任务项
        tasksHTML += `
            <div class="task-item ${task.status}" data-task-id="${task.id}">
                <div class="task-header">
                    <div class="task-title-section">
                        <h3 class="task-title">${task.title}</h3>
                        <span class="task-priority ${task.priority}">
                            ${getPriorityName(task.priority)}
                        </span>
                    </div>
                    <div class="task-status">
                        <span class="status-badge ${task.status}">
                            ${getTaskStatusName(task.status)}
                        </span>
                    </div>
                </div>
                
                <div class="task-details">
                    ${task.description ? `<p class="task-description">${task.description}</p>` : ''}
                    
                    <div class="task-meta">
                        <div class="task-dates">
                            <span class="created-date">
                                <i class="far fa-calendar-plus"></i> 创建于: ${formatDate(task.createdAt)}
                            </span>
                            ${task.deadline ? `
                                <span class="deadline ${isDeadlineNear(task.deadline) ? 'near' : ''}">
                                    <i class="far fa-calendar-check"></i> 截止日期: ${formatDateShort(task.deadline)}
                                </span>
                            ` : ''}
                        </div>
                        
                        <div class="assigned-agents">
                            ${agentTags}
                        </div>
                    </div>
                </div>
                
                <div class="task-actions">
                    ${task.status === 'pending' ? `
                        <button class="btn btn-small start-task-btn" data-task-id="${task.id}">
                            <i class="fas fa-play"></i> 开始任务
                        </button>
                    ` : ''}
                    
                    ${task.status === 'in-progress' ? `
                        <button class="btn btn-small complete-task-btn" data-task-id="${task.id}">
                            <i class="fas fa-check"></i> 完成任务
                        </button>
                    ` : ''}
                    
                    <button class="btn btn-small btn-outline edit-task-btn" data-task-id="${task.id}">
                        <i class="fas fa-edit"></i> 编辑
                    </button>
                    
                    <button class="btn btn-small btn-outline delete-task-btn" data-task-id="${task.id}">
                        <i class="fas fa-trash"></i> 删除
                    </button>
                </div>
            </div>
        `;
    });
    
    // 更新DOM
    tasksList.innerHTML = tasksHTML;
    
    // 绑定任务操作按钮
    bindTaskButtons();
}

// 绑定任务按钮
function bindTaskButtons() {
    // 开始任务按钮
    document.querySelectorAll('.start-task-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const taskId = this.dataset.taskId;
            startTask(taskId);
        });
    });
    
    // 完成任务按钮
    document.querySelectorAll('.complete-task-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const taskId = this.dataset.taskId;
            completeTask(taskId);
        });
    });
    
    // 编辑任务按钮
    document.querySelectorAll('.edit-task-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const taskId = this.dataset.taskId;
            showEditTaskModal(taskId);
        });
    });
    
    // 删除任务按钮
    document.querySelectorAll('.delete-task-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const taskId = this.dataset.taskId;
            confirmDeleteTask(taskId);
        });
    });
}

// 开始任务
function startTask(taskId) {
    const task = window.tasks.find(t => t.id === taskId);
    
    if (!task) {
        return;
    }
    
    task.status = 'in-progress';
    task.updatedAt = new Date().toISOString();
    
    // 保存更改
    saveToLocalStorage();
    
    // 更新UI
    updateTasksList();
    updateAdminDashboard();
    
    // 显示通知
    showNotification(`任务 "${task.title}" 已开始`, 'info');
}

// 完成任务
function completeTask(taskId) {
    const task = window.tasks.find(t => t.id === taskId);
    
    if (!task) {
        return;
    }
    
    task.status = 'completed';
    task.updatedAt = new Date().toISOString();
    task.completedAt = new Date().toISOString();
    
    // 保存更改
    saveToLocalStorage();
    
    // 更新UI
    updateTasksList();
    updateAdminDashboard();
    
    // 显示通知
    showNotification(`任务 "${task.title}" 已完成`, 'success');
}

// 删除任务确认
function confirmDeleteTask(taskId) {
    const task = window.tasks.find(t => t.id === taskId);
    
    if (!task) {
        return;
    }
    
    const contentHTML = `
        <div class="confirm-dialog">
            <div class="confirm-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>确定要删除任务 "${task.title}" 吗？此操作无法撤销。</p>
            </div>
            
            <div class="confirm-actions">
                <button id="confirmDeleteBtn" class="btn btn-danger">
                    <i class="fas fa-trash"></i> 确认删除
                </button>
                <button id="cancelDeleteBtn" class="btn btn-outline">
                    <i class="fas fa-times"></i> 取消
                </button>
            </div>
        </div>
    `;
    
    showModal('删除确认', contentHTML);
    
    // 绑定按钮事件
    document.getElementById('confirmDeleteBtn').addEventListener('click', function() {
        deleteTask(taskId);
        closeModal();
    });
    
    document.getElementById('cancelDeleteBtn').addEventListener('click', closeModal);
}

// 删除任务
function deleteTask(taskId) {
    const taskIndex = window.tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
        return;
    }
    
    const taskTitle = window.tasks[taskIndex].title;
    
    // 移除任务
    window.tasks.splice(taskIndex, 1);
    
    // 保存更改
    saveToLocalStorage();
    
    // 更新UI
    updateTasksList();
    updateAdminDashboard();
    
    // 显示通知
    showNotification(`任务 "${taskTitle}" 已删除`, 'info');
}

// 显示创建任务模态框
function showCreateTaskModal(preSelectedAgents = [], preSelectedFeature = null) {
    // 确保activeAgents可用
    if (!window.activeAgents) {
        window.activeAgents = [];
    }
    
    // 构建智能体选择列表
    const agentOptions = window.agentsData
        .filter(agent => window.activeAgents.includes(agent.id))
        .map(agent => `
            <div class="agent-option ${preSelectedAgents.includes(agent.id) ? 'selected' : ''}" data-agent-id="${agent.id}">
                <div class="agent-icon"><i class="fas ${agent.icon}"></i></div>
                <div class="agent-info">
                    <div class="agent-name">${agent.name}</div>
                    <div class="agent-role">${agent.role}</div>
                </div>
                <div class="agent-check">
                    <i class="fas fa-check-circle"></i>
                </div>
            </div>
        `).join('');

    // 构建模态框内容
    const contentHTML = `
        <div class="create-task-form">
            <div class="form-group">
                <label for="taskTitle">任务标题</label>
                <input type="text" id="taskTitle" placeholder="输入任务标题...">
            </div>
            
            <div class="form-group">
                <label for="taskDescription">任务描述</label>
                <textarea id="taskDescription" placeholder="描述任务内容和要求..."></textarea>
            </div>
            
            <div class="form-group">
                <label for="taskPriority">优先级</label>
                <select id="taskPriority">
                    <option value="low">低</option>
                    <option value="medium" selected>中</option>
                    <option value="high">高</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="taskDeadline">截止日期</label>
                <input type="date" id="taskDeadline">
            </div>
            
            <div class="form-group">
                <label>分配智能体</label>
                <div class="agent-selection">
                    ${agentOptions}
                </div>
            </div>
            
            <div class="form-actions">
                <button id="submitTaskBtn" class="btn btn-primary">创建任务</button>
                <button id="cancelTaskBtn" class="btn btn-outline">取消</button>
            </div>
        </div>
    `;
    
    // 显示模态框
    showModal('创建新任务', contentHTML);
    
    // 绑定智能体选择
    document.querySelectorAll('.agent-option').forEach(option => {
        option.addEventListener('click', function() {
            this.classList.toggle('selected');
        });
    });
    
    // 绑定取消按钮
    document.getElementById('cancelTaskBtn').addEventListener('click', closeModal);
    
    // 绑定提交按钮
    document.getElementById('submitTaskBtn').addEventListener('click', function() {
        createNewTask();
    });
}

// 创建新任务
function createNewTask() {
    // 获取表单数据
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;
    const priority = document.getElementById('taskPriority').value;
    const deadline = document.getElementById('taskDeadline').value;
    
    // 获取选中的智能体
    const selectedAgents = Array.from(
        document.querySelectorAll('.agent-option.selected')
    ).map(el => el.dataset.agentId);
    
    // 验证输入
    if (!title) {
        showNotification('请输入任务标题', 'warning');
        return;
    }
    
    if (selectedAgents.length === 0) {
        showNotification('请至少选择一个智能体', 'warning');
        return;
    }
    
    // 确保tasks存在
    if (!window.tasks) {
        window.tasks = [];
    }
    
    // 创建新任务
    const newTask = {
        id: generateTaskId(),
        title: title,
        description: description,
        priority: priority,
        deadline: deadline,
        assignedAgents: selectedAgents,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // 添加到任务列表
    window.tasks.push(newTask);
    
    // 保存到本地存储
    saveToLocalStorage();
    
    // 更新UI
    updateTasksList();
    updateAdminDashboard();
    
    // 关闭模态框
    closeModal();
    
    // 显示通知
    showNotification('任务已创建', 'success');
}

// 更新管理员仪表板
function updateAdminDashboard() {
    // 更新活跃智能体数量
    const activeAgentsCount = document.getElementById('activeAgentsCount');
    if (activeAgentsCount && window.activeAgents) {
        activeAgentsCount.textContent = window.activeAgents.length;
    }
    
    // 更新任务数量
    if (window.tasks) {
        // 待处理任务
        const pendingTasksCount = document.getElementById('pendingTasksCount');
        if (pendingTasksCount) {
            const pendingCount = window.tasks.filter(task => task.status === 'pending').length;
            pendingTasksCount.textContent = pendingCount;
        }
        
        // 已完成任务
        const completedTasksCount = document.getElementById('completedTasksCount');
        if (completedTasksCount) {
            const completedCount = window.tasks.filter(task => task.status === 'completed').length;
            completedTasksCount.textContent = completedCount;
        }
        
        // 系统效率
        const systemEfficiency = document.getElementById('systemEfficiency');
        if (systemEfficiency) {
            const completedCount = window.tasks.filter(task => task.status === 'completed').length;
            const totalCount = window.tasks.length;
            
            const efficiency = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
            systemEfficiency.textContent = `${efficiency}%`;
        }
    }
    
    // 任务分布图表
    const taskChart = document.getElementById('taskChart');
    if (taskChart && window.tasks) {
        const pendingCount = window.tasks.filter(task => task.status === 'pending').length;
        const inProgressCount = window.tasks.filter(task => task.status === 'in-progress').length;
        const completedCount = window.tasks.filter(task => task.status === 'completed').length;
        
        // 简单的图表显示
        taskChart.innerHTML = `
            <div class="chart-bars">
                <div class="chart-bar">
                    <div class="bar-label">待处理</div>
                    <div class="bar-container">
                        <div class="bar pending" style="height: ${pendingCount * 20}px;"></div>
                    </div>
                    <div class="bar-value">${pendingCount}</div>
                </div>
                <div class="chart-bar">
                    <div class="bar-label">进行中</div>
                    <div class="bar-container">
                        <div class="bar in-progress" style="height: ${inProgressCount * 20}px;"></div>
                    </div>
                    <div class="bar-value">${inProgressCount}</div>
                </div>
                <div class="chart-bar">
                    <div class="bar-label">已完成</div>
                    <div class="bar-container">
                        <div class="bar completed" style="height: ${completedCount * 20}px;"></div>
                    </div>
                    <div class="bar-value">${completedCount}</div>
                </div>
            </div>
        `;
    }
}

// 获取优先级名称
function getPriorityName(priority) {
    switch (priority) {
        case 'high': return '高';
        case 'medium': return '中';
        case 'low': return '低';
        default: return '未知';
    }
}

// 格式化日期(短格式)
function formatDateShort(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
}

// 检查截止日期是否临近(7天内)
function isDeadlineNear(deadlineString) {
    const deadline = new Date(deadlineString);
    const now = new Date();
    const diffTime = deadline - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= 0 && diffDays <= 7;
}

// 初始化系统
document.addEventListener('DOMContentLoaded', function() {
    // 确保全局变量存在
    if (!window.tasks) window.tasks = [];
    if (!window.activeAgents) window.activeAgents = [];
    
    // 初始化模式切换器
    if (window.dualMode && typeof window.dualMode.init === 'function') {
        window.dualMode.init();
    }
    
    // 初始化智能体卡片
    if (typeof renderAgentCards === 'function') {
        renderAgentCards();
    }
    
    // 初始化任务系统
    initTaskSystem();
    
    // 更新仪表板
    updateAdminDashboard();
    
    // 绑定模态框关闭按钮
    const closeModalBtn = document.getElementById('closeModal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            const modalContainer = document.getElementById('modalContainer');
            if (modalContainer) {
                modalContainer.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
});
