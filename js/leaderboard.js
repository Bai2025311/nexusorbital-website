/**
 * NexusOrbital社区排行榜系统
 * 处理用户排名显示和排名切换功能
 */

// 排行榜数据模拟
const leaderboardData = {
    overall: [
        { id: 1, username: '星际探索者', avatar: 'assets/avatars/avatar1.jpg', score: 1358, posts: 32, comments: 147, likes: 562 },
        { id: 2, username: '火星先锋', avatar: 'assets/avatars/avatar2.jpg', score: 1245, posts: 27, comments: 98, likes: 491 },
        { id: 3, username: '太空建筑师', avatar: 'assets/avatars/avatar3.jpg', score: 1187, posts: 24, comments: 103, likes: 478 },
        { id: 4, username: '深空先驱', avatar: 'assets/avatars/avatar4.jpg', score: 986, posts: 19, comments: 85, likes: 356 },
        { id: 5, username: '星舰工程师', avatar: 'assets/avatars/avatar5.jpg', score: 925, posts: 15, comments: 92, likes: 317 },
        { id: 6, username: '太阳系漫游者', avatar: 'assets/avatars/avatar6.jpg', score: 867, posts: 21, comments: 76, likes: 298 },
        { id: 7, username: '星河梦想家', avatar: 'assets/avatars/avatar7.jpg', score: 782, posts: 14, comments: 64, likes: 287 },
        { id: 8, username: '宇宙生态学家', avatar: 'assets/avatars/avatar8.jpg', score: 734, posts: 12, comments: 58, likes: 273 },
        { id: 9, username: '星际定居者', avatar: 'assets/avatars/avatar9.jpg', score: 689, posts: 11, comments: 47, likes: 246 },
        { id: 10, username: '太空探测者', avatar: 'assets/avatars/avatar10.jpg', score: 645, posts: 9, comments: 43, likes: 219 }
    ],
    posts: [
        { id: 3, username: '太空建筑师', avatar: 'assets/avatars/avatar3.jpg', score: 24, posts: 24, comments: 103, likes: 478 },
        { id: 2, username: '火星先锋', avatar: 'assets/avatars/avatar2.jpg', score: 27, posts: 27, comments: 98, likes: 491 },
        { id: 1, username: '星际探索者', avatar: 'assets/avatars/avatar1.jpg', score: 32, posts: 32, comments: 147, likes: 562 },
        { id: 6, username: '太阳系漫游者', avatar: 'assets/avatars/avatar6.jpg', score: 21, posts: 21, comments: 76, likes: 298 },
        { id: 4, username: '深空先驱', avatar: 'assets/avatars/avatar4.jpg', score: 19, posts: 19, comments: 85, likes: 356 },
        { id: 5, username: '星舰工程师', avatar: 'assets/avatars/avatar5.jpg', score: 15, posts: 15, comments: 92, likes: 317 },
        { id: 7, username: '星河梦想家', avatar: 'assets/avatars/avatar7.jpg', score: 14, posts: 14, comments: 64, likes: 287 },
        { id: 8, username: '宇宙生态学家', avatar: 'assets/avatars/avatar8.jpg', score: 12, posts: 12, comments: 58, likes: 273 },
        { id: 9, username: '星际定居者', avatar: 'assets/avatars/avatar9.jpg', score: 11, posts: 11, comments: 47, likes: 246 },
        { id: 10, username: '太空探测者', avatar: 'assets/avatars/avatar10.jpg', score: 9, posts: 9, comments: 43, likes: 219 }
    ],
    comments: [
        { id: 1, username: '星际探索者', avatar: 'assets/avatars/avatar1.jpg', score: 147, posts: 32, comments: 147, likes: 562 },
        { id: 3, username: '太空建筑师', avatar: 'assets/avatars/avatar3.jpg', score: 103, posts: 24, comments: 103, likes: 478 },
        { id: 2, username: '火星先锋', avatar: 'assets/avatars/avatar2.jpg', score: 98, posts: 27, comments: 98, likes: 491 },
        { id: 5, username: '星舰工程师', avatar: 'assets/avatars/avatar5.jpg', score: 92, posts: 15, comments: 92, likes: 317 },
        { id: 4, username: '深空先驱', avatar: 'assets/avatars/avatar4.jpg', score: 85, posts: 19, comments: 85, likes: 356 },
        { id: 6, username: '太阳系漫游者', avatar: 'assets/avatars/avatar6.jpg', score: 76, posts: 21, comments: 76, likes: 298 },
        { id: 7, username: '星河梦想家', avatar: 'assets/avatars/avatar7.jpg', score: 64, posts: 14, comments: 64, likes: 287 },
        { id: 8, username: '宇宙生态学家', avatar: 'assets/avatars/avatar8.jpg', score: 58, posts: 12, comments: 58, likes: 273 },
        { id: 9, username: '星际定居者', avatar: 'assets/avatars/avatar9.jpg', score: 47, posts: 11, comments: 47, likes: 246 },
        { id: 10, username: '太空探测者', avatar: 'assets/avatars/avatar10.jpg', score: 43, posts: 9, comments: 43, likes: 219 }
    ],
    likes: [
        { id: 1, username: '星际探索者', avatar: 'assets/avatars/avatar1.jpg', score: 562, posts: 32, comments: 147, likes: 562 },
        { id: 2, username: '火星先锋', avatar: 'assets/avatars/avatar2.jpg', score: 491, posts: 27, comments: 98, likes: 491 },
        { id: 3, username: '太空建筑师', avatar: 'assets/avatars/avatar3.jpg', score: 478, posts: 24, comments: 103, likes: 478 },
        { id: 4, username: '深空先驱', avatar: 'assets/avatars/avatar4.jpg', score: 356, posts: 19, comments: 85, likes: 356 },
        { id: 5, username: '星舰工程师', avatar: 'assets/avatars/avatar5.jpg', score: 317, posts: 15, comments: 92, likes: 317 },
        { id: 6, username: '太阳系漫游者', avatar: 'assets/avatars/avatar6.jpg', score: 298, posts: 21, comments: 76, likes: 298 },
        { id: 7, username: '星河梦想家', avatar: 'assets/avatars/avatar7.jpg', score: 287, posts: 14, comments: 64, likes: 287 },
        { id: 8, username: '宇宙生态学家', avatar: 'assets/avatars/avatar8.jpg', score: 273, posts: 12, comments: 58, likes: 273 },
        { id: 9, username: '星际定居者', avatar: 'assets/avatars/avatar9.jpg', score: 246, posts: 11, comments: 47, likes: 246 },
        { id: 10, username: '太空探测者', avatar: 'assets/avatars/avatar10.jpg', score: 219, posts: 9, comments: 43, likes: 219 }
    ]
};

// 公开排行榜数据，以便侧边栏使用
window.leaderboardData = leaderboardData;

// 当前用户数据（模拟）
const currentUser = {
    id: 999,
    username: '航天梦想家',
    avatar: 'assets/avatars/default.jpg',
    score: {
        overall: 825, 
        posts: 18, 
        comments: 65, 
        likes: 325
    },
    rank: {
        overall: 6, 
        posts: 4, 
        comments: 6, 
        likes: 7
    }
};

// 在页面加载时初始化排行榜
document.addEventListener('DOMContentLoaded', function() {
    initLeaderboardTabs();
    addCurrentUserRank();
    
    // 默认显示综合排行榜
    initLeaderboard('overall');
    
    // 设置排行榜更新时间
    const updateTimestampElement = document.getElementById('leaderboard-update-timestamp');
    if (updateTimestampElement) {
        const now = new Date();
        const formattedDate = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        updateTimestampElement.textContent = formattedDate;
    }
});

/**
 * 初始化排行榜
 * @param {string} type - 排行榜类型，默认为overall
 */
function initLeaderboard(type = 'overall') {
    const leaderboardList = document.querySelector('.leaderboard-list');
    if (!leaderboardList) return;
    
    // 清空容器
    leaderboardList.innerHTML = '';
    
    // 获取对应类型的排行榜数据
    const data = leaderboardData[type] || leaderboardData.overall;
    
    // 添加排行榜项目
    data.forEach((user, index) => {
        const rank = index + 1;
        const userElement = createLeaderboardUserElement(user, rank, type);
        leaderboardList.appendChild(userElement);
    });
    
    // 更新排行类型标题
    const rankTypeElement = document.querySelector('.rank-type');
    if (rankTypeElement) {
        if (type === 'overall') rankTypeElement.textContent = '综合排名';
        else if (type === 'posts') rankTypeElement.textContent = '发帖排名';
        else if (type === 'comments') rankTypeElement.textContent = '评论排名';
        else if (type === 'likes') rankTypeElement.textContent = '获赞排名';
    }
    
    // 更新当前用户排名
    updateCurrentUserRank(type);
}

/**
 * 创建排行榜用户元素
 * @param {Object} user - 用户数据
 * @param {number} rank - 排名
 * @param {string} type - 排行榜类型
 * @returns {HTMLElement} - 用户元素
 */
function createLeaderboardUserElement(user, rank, type) {
    const userItem = document.createElement('div');
    userItem.className = 'leaderboard-user';
    
    // 根据排名类型获取分数
    let score = user.score;
    if (type === 'posts') score = user.posts;
    else if (type === 'comments') score = user.comments;
    else if (type === 'likes') score = user.likes;
    
    // 排名样式类
    let rankClass = 'rank-other';
    if (rank === 1) rankClass = 'rank-1';
    else if (rank === 2) rankClass = 'rank-2';
    else if (rank === 3) rankClass = 'rank-3';
    
    // 设置HTML
    userItem.innerHTML = `
        <div class="leaderboard-rank ${rankClass}">${rank}</div>
        <div class="leaderboard-avatar">
            <img src="${user.avatar || 'assets/avatars/default.jpg'}" alt="${user.username}" onerror="this.src='assets/avatars/default.jpg'">
        </div>
        <div class="leaderboard-info">
            <div class="leaderboard-username">${user.username}</div>
            <div class="leaderboard-stats">
                ${type === 'overall' ? 
                    `综合评分: <span class="leaderboard-score">${score}</span>` :
                    type === 'posts' ?
                    `发帖数: <span class="leaderboard-score">${score}</span>` :
                    type === 'comments' ?
                    `评论数: <span class="leaderboard-score">${score}</span>` :
                    `获赞数: <span class="leaderboard-score">${score}</span>`
                }
            </div>
        </div>
    `;
    
    return userItem;
}

/**
 * 初始化排行榜选项卡
 */
function initLeaderboardTabs() {
    const tabButtons = document.querySelectorAll('#leaderboard-modal .leaderboard-tab');
    if (!tabButtons.length) return;
    
    // 为每个选项卡添加点击事件
    tabButtons.forEach(tab => {
        tab.addEventListener('click', function() {
            // 移除其他选项卡的活跃状态
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // 添加当前选项卡的活跃状态
            this.classList.add('active');
            
            // 获取排行榜类型
            const type = this.getAttribute('data-type');
            
            // 更新排行榜
            initLeaderboard(type);
            
            // 更新当前用户排名
            updateCurrentUserRank(type);
        });
    });
}

/**
 * 添加当前用户排名
 */
function addCurrentUserRank() {
    const currentUserRankContainer = document.querySelector('.rank-content');
    if (!currentUserRankContainer) return;
    
    // 获取当前排行榜类型
    const activeTab = document.querySelector('#leaderboard-modal .leaderboard-tab.active');
    const type = activeTab ? activeTab.getAttribute('data-type') : 'overall';
    
    // 更新当前用户排名
    updateCurrentUserRank(type);
}

/**
 * 更新当前用户排名
 * @param {string} type - 排行榜类型
 */
function updateCurrentUserRank(type = 'overall') {
    const currentUserRankContainer = document.querySelector('.rank-content');
    if (!currentUserRankContainer) return;
    
    // 获取对应类型的用户排名和分数
    const rank = currentUser.rank[type] || currentUser.rank.overall;
    const score = currentUser.score[type] || currentUser.score.overall;
    
    // 根据排名获取排名样式
    let rankClass = 'rank-other';
    if (rank === 1) rankClass = 'rank-1';
    else if (rank === 2) rankClass = 'rank-2';
    else if (rank === 3) rankClass = 'rank-3';
    
    // 设置HTML
    currentUserRankContainer.innerHTML = `
        <div class="current-user-item">
            <div class="current-rank ${rankClass}">${rank}</div>
            <div class="current-user-avatar">
                <img src="${currentUser.avatar}" alt="${currentUser.username}" onerror="this.src='assets/avatars/default.jpg'">
            </div>
            <div class="current-user-info">
                <div class="current-user-name">${currentUser.username} <span class="current-user-tag">当前用户</span></div>
                <div class="current-user-stats">
                    ${type === 'overall' ? 
                        `综合评分: <span class="current-user-score">${score}</span>` :
                        type === 'posts' ?
                        `发帖数: <span class="current-user-score">${score}</span>` :
                        type === 'comments' ?
                        `评论数: <span class="current-user-score">${score}</span>` :
                        `获赞数: <span class="current-user-score">${score}</span>`
                    }
                </div>
            </div>
        </div>
    `;
}

/**
 * 刷新排行榜数据
 * 这个函数用于在用户进行活动后刷新排行榜数据
 */
function refreshLeaderboard() {
    // 获取当前活跃的排行榜类型
    const activeTab = document.querySelector('#leaderboard-modal .leaderboard-tab.active');
    const type = activeTab ? activeTab.getAttribute('data-type') : 'overall';
    
    // 重新加载排行榜
    initLeaderboard(type);
    
    // 更新当前用户排名
    updateCurrentUserRank(type);
}

// 暴露公共API
window.leaderboardSystem = {
    refreshLeaderboard,
    showLeaderboard: initLeaderboard
};
