/**
 * 星际人居技术平台 - 穹顶式控制舱仪表盘
 * 版本: 1.0.0
 * 日期: 2025-03-19
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化穹顶式仪表盘
    initDomeDashboard();
    
    // 创建星星背景效果
    createStarBackground();
    
    // 更新数据指标
    updateDashboardData();
    
    // 启动数据更新定时器
    setInterval(updateDashboardData, 5000);
});

/**
 * 初始化穹顶式仪表盘
 */
function initDomeDashboard() {
    // 检查DOM是否已经有仪表盘，如果没有则添加
    if (!document.querySelector('.dome-dashboard')) {
        createDomeDashboardDOM();
    }
}

/**
 * 创建穹顶式仪表盘DOM结构
 */
function createDomeDashboardDOM() {
    const dashboardHTML = `
    <div class="dome-dashboard">
        <div class="star-background"></div>
        
        <div class="data-container">
            <div class="data-item" id="oxygen-level">
                <div class="data-label">氧气浓度</div>
                <div class="data-value">
                    <span class="value-number">98.3%</span>
                    <span class="data-change positive">+0.2%</span>
                    <span class="pulse-indicator"></span>
                </div>
            </div>
            
            <div class="data-item" id="base-progress">
                <div class="data-label">月球基地</div>
                <div class="data-value">
                    <span class="value-number">62%</span>
                </div>
                <div class="progress-container">
                    <div class="progress-bar" style="width: 62%"></div>
                </div>
            </div>
            
            <div class="data-item" id="community-activity">
                <div class="data-label">社区活跃度</div>
                <div class="data-value">
                    <span class="value-number">89</span>
                    <span class="data-change positive">+12</span>
                </div>
            </div>
        </div>
        
        <div class="orbit-line"></div>
    </div>
    `;
    
    // 根据页面类型决定插入位置
    const targetElement = document.querySelector('header') || document.querySelector('.header') || document.body.firstChild;
    
    // 插入到目标元素之后
    if (targetElement) {
        targetElement.insertAdjacentHTML('afterend', dashboardHTML);
    } else {
        document.body.insertAdjacentHTML('afterbegin', dashboardHTML);
    }
}

/**
 * 创建星星背景效果
 */
function createStarBackground() {
    const starBackground = document.querySelector('.star-background');
    if (!starBackground) return;
    
    // 生成一定数量的星星
    const starCount = 30;
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        // 随机星星大小
        const size = Math.random() * 2 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        
        // 随机位置
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        star.style.left = `${left}%`;
        star.style.top = `${top}%`;
        
        // 随机动画延迟
        star.style.animationDelay = `${Math.random() * 4}s`;
        
        starBackground.appendChild(star);
    }
}

/**
 * 更新仪表盘数据
 */
function updateDashboardData() {
    // 模拟数据更新
    updateOxygenLevel();
    updateBaseProgress();
    updateCommunityActivity();
}

/**
 * 更新氧气浓度指标
 */
function updateOxygenLevel() {
    const oxygenElement = document.querySelector('#oxygen-level .value-number');
    if (!oxygenElement) return;
    
    // 生成微小波动
    const currentValue = parseFloat(oxygenElement.textContent);
    const fluctuation = (Math.random() * 0.4 - 0.2).toFixed(1);
    let newValue = (currentValue + parseFloat(fluctuation)).toFixed(1);
    
    // 确保在合理范围内
    newValue = Math.min(Math.max(newValue, 97.5), 99.5);
    
    // 更新UI
    oxygenElement.textContent = `${newValue}%`;
    
    // 更新变化指标
    const changeElement = document.querySelector('#oxygen-level .data-change');
    if (changeElement) {
        if (fluctuation >= 0) {
            changeElement.textContent = `+${fluctuation}%`;
            changeElement.className = 'data-change positive';
        } else {
            changeElement.textContent = `${fluctuation}%`;
            changeElement.className = 'data-change negative';
        }
    }
}

/**
 * 更新月球基地进度
 */
function updateBaseProgress() {
    const progressElement = document.querySelector('#base-progress .value-number');
    const progressBar = document.querySelector('#base-progress .progress-bar');
    if (!progressElement || !progressBar) return;
    
    // 缓慢持续增长
    const currentValue = parseInt(progressElement.textContent);
    const growth = Math.random() < 0.3 ? 1 : 0; // 30%概率增长1%
    const newValue = Math.min(currentValue + growth, 100);
    
    // 更新UI
    progressElement.textContent = `${newValue}%`;
    progressBar.style.width = `${newValue}%`;
}

/**
 * 更新社区活跃度
 */
function updateCommunityActivity() {
    const activityElement = document.querySelector('#community-activity .value-number');
    if (!activityElement) return;
    
    // 当前值
    const currentValue = parseInt(activityElement.textContent);
    
    // 根据时间产生变化 - 工作时间活跃度较高
    const now = new Date();
    const hour = now.getHours();
    
    let fluctuation;
    // 白天工作时间 (9-18点)
    if (hour >= 9 && hour < 18) {
        fluctuation = Math.floor(Math.random() * 7) - 2; // -2到4之间
    } else {
        fluctuation = Math.floor(Math.random() * 5) - 3; // -3到1之间
    }
    
    // 计算新值 (保持在50-120之间)
    let newValue = currentValue + fluctuation;
    newValue = Math.min(Math.max(newValue, 50), 120);
    
    // 更新UI
    activityElement.textContent = newValue;
    
    // 更新变化指标
    const changeElement = document.querySelector('#community-activity .data-change');
    if (changeElement) {
        if (fluctuation >= 0) {
            changeElement.textContent = `+${fluctuation}`;
            changeElement.className = 'data-change positive';
        } else {
            changeElement.textContent = `${fluctuation}`;
            changeElement.className = 'data-change negative';
        }
    }
}

/**
 * 长按数据项显示详情
 */
document.addEventListener('DOMContentLoaded', function() {
    // 添加长按事件监听
    const dataItems = document.querySelectorAll('.data-item');
    
    dataItems.forEach(item => {
        // 使用触摸事件实现长按
        let pressTimer;
        
        item.addEventListener('touchstart', function(e) {
            pressTimer = setTimeout(function() {
                showDetailedInfo(item.id);
            }, 800); // 800ms长按阈值
        });
        
        item.addEventListener('touchend', function(e) {
            clearTimeout(pressTimer);
        });
        
        // 点击事件 - 简单点击显示信息提示
        item.addEventListener('click', function(e) {
            showQuickInfo(item.id);
        });
    });
});

/**
 * 显示数据项详细信息
 * @param {string} itemId - 数据项ID
 */
function showDetailedInfo(itemId) {
    // 根据不同数据项显示相应的详细信息
    let title, content;
    
    switch(itemId) {
        case 'oxygen-level':
            title = '氧气浓度监测系统';
            content = `
                <div class="detail-chart">图表占位</div>
                <div class="detail-stats">
                    <div class="stat-item">
                        <span class="stat-label">过去24小时平均值</span>
                        <span class="stat-value">98.2%</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">波动范围</span>
                        <span class="stat-value">±0.4%</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">最后校准时间</span>
                        <span class="stat-value">2小时前</span>
                    </div>
                </div>
            `;
            break;
            
        case 'base-progress':
            title = '月球基地建设进度';
            content = `
                <div class="detail-phases">
                    <div class="phase completed">
                        <div class="phase-name">初始结构 (100%)</div>
                        <div class="phase-progress">
                            <div class="phase-bar" style="width:100%"></div>
                        </div>
                    </div>
                    <div class="phase active">
                        <div class="phase-name">生命支持系统 (75%)</div>
                        <div class="phase-progress">
                            <div class="phase-bar" style="width:75%"></div>
                        </div>
                    </div>
                    <div class="phase">
                        <div class="phase-name">科研设施 (42%)</div>
                        <div class="phase-progress">
                            <div class="phase-bar" style="width:42%"></div>
                        </div>
                    </div>
                    <div class="phase">
                        <div class="phase-name">居住区域 (30%)</div>
                        <div class="phase-progress">
                            <div class="phase-bar" style="width:30%"></div>
                        </div>
                    </div>
                </div>
            `;
            break;
            
        case 'community-activity':
            title = '社区实时活跃度';
            content = `
                <div class="detail-activity">
                    <div class="activity-summary">
                        <div>当前在线用户: 42人</div>
                        <div>今日新增讨论: 15主题</div>
                        <div>技术贡献提交: 7个</div>
                    </div>
                    <div class="active-areas">
                        <div class="area-item">
                            <span class="area-name">水循环系统讨论</span>
                            <span class="area-value">热度: 🔥🔥🔥</span>
                        </div>
                        <div class="area-item">
                            <span class="area-name">太空种植技术</span>
                            <span class="area-value">热度: 🔥🔥</span>
                        </div>
                        <div class="area-item">
                            <span class="area-name">月球材料研究</span>
                            <span class="area-value">热度: 🔥</span>
                        </div>
                    </div>
                </div>
            `;
            break;
            
        default:
            title = '数据详情';
            content = '暂无详细信息';
    }
    
    // 显示详情模态框
    showDetailModal(title, content);
}

/**
 * 显示详情模态框
 * @param {string} title - 模态框标题
 * @param {string} content - 模态框内容HTML
 */
function showDetailModal(title, content) {
    // 检查是否已存在模态框
    let modal = document.querySelector('.detail-modal');
    
    if (!modal) {
        // 创建模态框
        modal = document.createElement('div');
        modal.className = 'detail-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;
        
        // 添加样式
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0,0,0,0.7)';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        modal.style.zIndex = '2000';
        
        const modalContent = modal.querySelector('.modal-content');
        modalContent.style.backgroundColor = '#1B2735';
        modalContent.style.color = 'white';
        modalContent.style.borderRadius = '12px';
        modalContent.style.width = '85%';
        modalContent.style.maxWidth = '400px';
        modalContent.style.maxHeight = '80vh';
        modalContent.style.overflow = 'auto';
        modalContent.style.padding = '20px';
        modalContent.style.boxShadow = '0 0 20px rgba(100, 233, 238, 0.3)';
        modalContent.style.border = '1px solid rgba(100, 233, 238, 0.2)';
        
        // 添加关闭事件
        modal.querySelector('.modal-close').addEventListener('click', function() {
            document.body.removeChild(modal);
        });
        
        // 点击模态框背景关闭
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
        
        document.body.appendChild(modal);
    } else {
        // 更新已有模态框内容
        modal.querySelector('.modal-title').textContent = title;
        modal.querySelector('.modal-body').innerHTML = content;
    }
}

/**
 * 显示快速信息提示
 * @param {string} itemId - 数据项ID
 */
function showQuickInfo(itemId) {
    let message;
    
    switch(itemId) {
        case 'oxygen-level':
            message = '长按查看氧气浓度详细历史数据和波动图表';
            break;
            
        case 'base-progress':
            message = '长按查看月球基地各项设施建设进度明细';
            break;
            
        case 'community-activity':
            message = '长按查看当前热门讨论话题和活跃用户';
            break;
            
        default:
            message = '长按查看详细信息';
    }
    
    // 显示提示消息
    showToast(message);
}

/**
 * 显示简单提示消息
 * @param {string} message - 提示内容
 */
function showToast(message) {
    // 创建提示元素
    const toast = document.createElement('div');
    toast.className = 'data-toast';
    toast.textContent = message;
    
    // 设置样式
    toast.style.position = 'fixed';
    toast.style.bottom = '100px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = 'rgba(15, 76, 117, 0.9)';
    toast.style.color = 'white';
    toast.style.padding = '10px 15px';
    toast.style.borderRadius = '5px';
    toast.style.fontSize = '14px';
    toast.style.zIndex = '1500';
    toast.style.maxWidth = '80%';
    toast.style.textAlign = 'center';
    
    document.body.appendChild(toast);
    
    // 2.5秒后自动消失
    setTimeout(function() {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s ease';
        
        setTimeout(function() {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 500);
    }, 2500);
}
