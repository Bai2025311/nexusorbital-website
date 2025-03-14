/**
 * CosmicWeave - 智能体系统JavaScript功能（测试版本）
 * 该文件处理智能体的激活、任务分配和协作功能
 */

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
        expertise: ['数据分析', '实验设计', '报告撰写'],
        icon: 'fa-flask',
        description: '科学家智能体协助设计和执行实验，分析数据并生成有见解的报告，加速太空科学研究进程。'
    },
    {
        id: 'engineer',
        name: '工程师',
        role: '系统维护专家',
        expertise: ['设备修复', '系统优化', '资源循环'],
        icon: 'fa-cogs',
        description: '工程师智能体负责维护和优化基地的关键系统，确保生命支持、能源和通信系统正常运行。'
    },
    {
        id: 'logistics',
        name: '后勤官',
        role: '资源管理专家',
        expertise: ['库存管理', '供应链优化', '资源分配'],
        icon: 'fa-truck-loading',
        description: '后勤官智能体管理太空基地的物资供应，优化资源分配，确保所有系统和成员获得所需资源。'
    }
];

// 活动智能体
let activeAgents = [];

// 任务列表
let tasks = [];

// 初始化
function init() {
    console.log("智能体系统初始化中...");
    // 加载智能体卡片
    loadAgentCards();
    // 绑定按钮事件
    bindEvents();
}

// 加载智能体卡片
function loadAgentCards() {
    console.log("加载智能体卡片...");
    const agentsContainer = document.getElementById('agentsContainer');
    
    // 清空容器
    if (!agentsContainer) {
        console.error("找不到智能体容器元素");
        return;
    }
    
    // 显示示例数据
    displayDemoData();
}

// 显示演示数据
function displayDemoData() {
    // 激活一些智能体以供演示
    activeAgents = ['explorer', 'engineer'];
    
    // 添加一些演示任务
    tasks = [
        {
            id: 'task_demo_1',
            title: '火星表面资源勘探',
            description: '对火星西部平原进行详细资源扫描和分析，寻找水冰和有用矿物',
            priority: 'high',
            status: 'pending',
            createdAt: new Date().toISOString(),
            assignedAgents: ['explorer'],
            deadline: '2025-04-30'
        },
        {
            id: 'task_demo_2',
            title: '生命支持系统优化',
            description: '分析并优化基地生命支持系统，提高氧气再生效率和水资源循环利用率',
            priority: 'urgent',
            status: 'pending',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            assignedAgents: ['engineer'],
            deadline: '2025-04-15'
        },
        {
            id: 'task_demo_3',
            title: '协作任务：基地扩建规划',
            description: '协作制定火星基地西区扩建计划，包括资源评估和工程可行性分析',
            priority: 'medium',
            status: 'completed',
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            assignedAgents: ['explorer', 'engineer'],
            isCollaboration: true
        }
    ];
    
    // 更新UI元素
    updateAgentCards();
    updateActiveAgentsList();
    updateTasksList();
}

// 更新智能体卡片状态
function updateAgentCards() {
    console.log("更新智能体卡片状态...");
    const agentCards = document.querySelectorAll('.agent-card');
    
    agentCards.forEach(card => {
        const agentId = card.dataset.agentId;
        const statusElement = card.querySelector('.agent-status');
        const activateButton = card.querySelector('.activate-btn');
        
        if (activeAgents.includes(agentId)) {
            statusElement.classList.remove('inactive');
            statusElement.classList.add('active');
            activateButton.textContent = '停用智能体';
            activateButton.classList.add('active');
        } else {
            statusElement.classList.remove('active');
            statusElement.classList.add('inactive');
            activateButton.textContent = '激活智能体';
            activateButton.classList.remove('active');
        }
    });
}

// 更新活动智能体列表
function updateActiveAgentsList() {
    console.log("更新活动智能体列表...");
    const activeAgentsList = document.getElementById('activeAgentsList');
    
    if (!activeAgentsList) {
        console.error("找不到活动智能体列表元素");
        return;
    }
    
    // 清空列表
    activeAgentsList.innerHTML = '';
    
    if (activeAgents.length === 0) {
        // 显示无激活智能体提示
        const noAgentsMessage = document.createElement('div');
        noAgentsMessage.className = 'no-active-agents';
        noAgentsMessage.innerHTML = `
            <i class="fas fa-robot"></i>
            <p>暂无活跃智能体</p>
            <p>请在控制中心激活智能体</p>
        `;
        activeAgentsList.appendChild(noAgentsMessage);
        return;
    }
    
    // 添加激活的智能体到列表
    activeAgents.forEach(agentId => {
        const agent = agentsData.find(a => a.id === agentId);
        if (!agent) return;
        
        const agentItem = document.createElement('div');
        agentItem.className = 'active-agent-item';
        agentItem.dataset.agentId = agent.id;
        
        agentItem.innerHTML = `
            <div class="active-agent-avatar">
                <i class="fas ${agent.icon}"></i>
            </div>
            <div class="active-agent-info">
                <h3 class="active-agent-name">${agent.name}</h3>
                <p class="active-agent-role">${agent.role}</p>
            </div>
            <div class="active-agent-actions">
                <button class="btn btn-sm collaborate-btn" data-agent-id="${agent.id}">
                    <i class="fas fa-users"></i> 协作
                </button>
            </div>
        `;
        
        activeAgentsList.appendChild(agentItem);
    });
}

// 更新任务列表
function updateTasksList() {
    console.log("更新任务列表...");
    const tasksList = document.getElementById('tasksList');
    const noTasks = document.getElementById('noTasks');
    
    if (!tasksList || !noTasks) {
        console.error("找不到任务列表元素");
        return;
    }
    
    // 清空任务列表
    tasksList.innerHTML = '';
    
    if (tasks.length === 0) {
        // 显示无任务提示
        noTasks.style.display = 'flex';
        return;
    }
    
    // 隐藏无任务提示
    noTasks.style.display = 'none';
    
    // 添加任务到列表
    tasks.forEach(task => {
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
}

// 绑定事件
function bindEvents() {
    console.log("绑定事件...");
    
    // 绑定智能体激活按钮事件
    const activateButtons = document.querySelectorAll('.activate-btn');
    activateButtons.forEach(button => {
        button.addEventListener('click', function() {
            const agentCard = this.closest('.agent-card');
            const agentId = agentCard.dataset.agentId;
            
            if (activeAgents.includes(agentId)) {
                // 停用智能体
                activeAgents = activeAgents.filter(id => id !== agentId);
            } else {
                // 激活智能体
                activeAgents.push(agentId);
            }
            
            // 更新UI
            updateAgentCards();
            updateActiveAgentsList();
            
            // 显示通知
            alert(activeAgents.includes(agentId) ? `已激活${agentsData.find(a => a.id === agentId).name}智能体` : `已停用${agentsData.find(a => a.id === agentId).name}智能体`);
        });
    });
    
    // 绑定任务创建按钮事件
    const createTaskBtn = document.getElementById('createTaskBtn');
    if (createTaskBtn) {
        createTaskBtn.addEventListener('click', function() {
            alert('创建任务功能演示');
        });
    }
    
    // 绑定任务过滤器按钮事件
    const filterButtons = document.querySelectorAll('[data-task-status], [data-task-priority]');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            alert('任务过滤功能演示');
        });
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log("页面加载完成，初始化智能体系统");
    init();
});
