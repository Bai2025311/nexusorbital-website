/**
 * 探索者太空探索专家智能体
 * 为用户提供交互式太空知识和探索体验
 */

class ExplorerAgent {
    constructor() {
        // 先设置一个标志，表示已初始化
        window.explorerInitialized = true;
        console.log("开始初始化探索者智能体");
        
        // 确保agentsData已经加载
        if (!window.agentsData || !window.agentsData.explorer) {
            console.error("探索者数据未加载!");
            return;
        }
        
        const explorerData = window.agentsData.explorer;
        this.name = explorerData.name;
        this.title = explorerData.title;
        this.avatar = explorerData.avatar;
        this.personality = explorerData.personality;
        this.expertise = explorerData.expertise;
        this.knowledgeBase = explorerData.knowledgeBase;
        this.description = explorerData.description;
        
        this.conversationHistory = [];
        this.isActive = false;
        
        // 初始化
        this.init();
        
        // 直接绑定激活按钮事件
        this.bindActivationButtons();
    }
    
    /**
     * 初始化智能体
     */
    init() {
        console.log("初始化探索者智能体...");
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupEventListeners();
                this.createChatInterface();
            });
        } else {
            this.setupEventListeners();
            this.createChatInterface();
        }
    }
    
    /**
     * 直接绑定激活按钮事件 - 这是一个备用方法
     */
    bindActivationButtons() {
        // 确保这个方法会在页面加载后被调用
        setTimeout(() => {
            console.log("尝试直接绑定激活按钮...");
            const activateButtons = document.querySelectorAll('.activate-agent-btn[data-agent="explorer"]');
            
            if (activateButtons && activateButtons.length > 0) {
                console.log(`找到 ${activateButtons.length} 个激活按钮`);
                
                activateButtons.forEach(btn => {
                    console.log("绑定激活按钮:", btn);
                    
                    // 移除现有事件监听器以避免重复
                    btn.replaceWith(btn.cloneNode(true));
                    
                    // 获取新的克隆按钮
                    const newBtn = document.querySelector('.activate-agent-btn[data-agent="explorer"]');
                    
                    // 添加新的事件监听器
                    newBtn.addEventListener('click', (event) => {
                        console.log("激活按钮被点击");
                        event.preventDefault();
                        event.stopPropagation();
                        this.activate();
                    });
                    
                    // 备用：添加内联onclick处理程序
                    newBtn.setAttribute('onclick', 'window.explorer.activate(); return false;');
                });
            } else {
                console.error("未找到激活按钮!");
            }
            
            // 同样绑定查看详情按钮
            const viewButtons = document.querySelectorAll('.view-agent[data-agent="explorer"]');
            if (viewButtons && viewButtons.length > 0) {
                viewButtons.forEach(btn => {
                    // 移除现有事件监听器
                    btn.replaceWith(btn.cloneNode(true));
                    
                    // 获取新的克隆按钮
                    const newBtn = document.querySelector('.view-agent[data-agent="explorer"]');
                    
                    // 添加新的事件监听器
                    newBtn.addEventListener('click', (event) => {
                        console.log("查看详情按钮被点击");
                        event.preventDefault();
                        event.stopPropagation();
                        this.showProfile();
                    });
                    
                    // 备用：添加内联onclick处理程序
                    newBtn.setAttribute('onclick', 'window.explorer.showProfile(); return false;');
                });
            }
        }, 500); // 延迟500ms确保DOM已加载
    }
    
    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        console.log("设置事件监听器...");
        // 监听激活按钮
        const activateButtons = document.querySelectorAll('.activate-agent-btn[data-agent="explorer"]');
        activateButtons.forEach(btn => {
            console.log("找到激活按钮:", btn);
            btn.addEventListener('click', () => {
                console.log("激活按钮被点击 (from setupEventListeners)");
                this.activate();
            });
        });
        
        // 监听探索者卡片点击
        const viewButtons = document.querySelectorAll('.view-agent[data-agent="explorer"]');
        viewButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                console.log("查看详情按钮被点击 (from setupEventListeners)");
                this.showProfile();
            });
        });
    }
    
    /**
     * 激活智能体
     */
    activate() {
        console.log("开始激活探索者智能体...");
        this.isActive = true;
        
        // 确保聊天界面存在
        if (!document.getElementById('explorerChatContainer')) {
            console.log("聊天界面不存在，开始创建");
            this.createChatInterface();
        } else {
            console.log("聊天界面已存在，直接显示");
        }
        
        const chatContainer = document.getElementById('explorerChatContainer');
        if (chatContainer) {
            console.log("显示聊天界面");
            chatContainer.style.display = 'block';
            
            // 如果是首次激活，发送欢迎消息
            if (this.conversationHistory.length === 0) {
                console.log("首次激活，发送欢迎消息");
                this.addMessage({
                    sender: 'agent',
                    text: '你好！我是探索者，太空探索专家。无论你对太阳系、遥远的恒星还是航天器有任何疑问，我都乐意分享我的知识。今天想了解什么太空探索相关的话题呢？',
                    timestamp: new Date()
                });
            }
            
            // 聚焦输入框
            setTimeout(() => {
                const inputElement = document.getElementById('explorerChatInput');
                if (inputElement) {
                    console.log("聚焦输入框");
                    inputElement.focus();
                } else {
                    console.error("找不到输入框元素!");
                }
            }, 300);
        } else {
            console.error("找不到聊天容器!");
        }
    }
    
    /**
     * 显示智能体详细资料
     */
    showProfile() {
        // 检查是否已经存在
        const existingModal = document.querySelector('.agent-profile-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        const profileModal = document.createElement('div');
        profileModal.className = 'agent-profile-modal';
        
        const expertiseHTML = this.expertise.map(exp => `<span class="expertise-tag">${exp}</span>`).join('');
        
        profileModal.innerHTML = `
            <div class="agent-profile-content">
                <button class="close-profile-btn">×</button>
                <div class="agent-profile-header">
                    <img src="${this.avatar}" alt="${this.name}" class="agent-profile-avatar">
                    <div>
                        <h2>${this.name}</h2>
                        <p class="agent-title">${this.title}</p>
                    </div>
                </div>
                <div class="agent-expertise">
                    <h3>专业领域</h3>
                    <div class="expertise-tags">
                        ${expertiseHTML}
                    </div>
                </div>
                <div class="agent-personality">
                    <h3>性格特点</h3>
                    <div class="personality-bars">
                        <div class="personality-bar">
                            <span>好奇心</span>
                            <div class="bar-container">
                                <div class="bar-fill" style="width: ${this.personality.curiosity * 100}%"></div>
                            </div>
                        </div>
                        <div class="personality-bar">
                            <span>热情</span>
                            <div class="bar-container">
                                <div class="bar-fill" style="width: ${this.personality.enthusiasm * 100}%"></div>
                            </div>
                        </div>
                        <div class="personality-bar">
                            <span>专业性</span>
                            <div class="bar-container">
                                <div class="bar-fill" style="width: ${this.personality.expertise * 100}%"></div>
                            </div>
                        </div>
                        <div class="personality-bar">
                            <span>幽默感</span>
                            <div class="bar-container">
                                <div class="bar-fill" style="width: ${this.personality.humor * 100}%"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="agent-description">
                    <p>${this.description}</p>
                </div>
                <button class="activate-agent-btn" data-agent="explorer">与探索者对话</button>
            </div>
        `;
        
        document.body.appendChild(profileModal);
        
        // 设置事件
        profileModal.querySelector('.close-profile-btn').addEventListener('click', () => {
            profileModal.remove();
        });
        
        profileModal.querySelector('.activate-agent-btn').addEventListener('click', () => {
            profileModal.remove();
            this.activate();
        });
        
        // 动画显示
        setTimeout(() => {
            profileModal.style.opacity = '1';
        }, 10);
    }
    
    /**
     * 处理用户消息
     */
    handleUserMessage() {
        const inputElement = document.getElementById('explorerChatInput');
        const userMessage = inputElement.value.trim();
        
        if (userMessage === '') return;
        
        // 清空输入框
        inputElement.value = '';
        
        // 添加用户消息到聊天
        this.addMessage({
            sender: 'user',
            text: userMessage,
            timestamp: new Date()
        });
        
        // 生成回复
        this.generateResponse(userMessage);
    }
    
    /**
     * 生成回复
     */
    generateResponse(userMessage) {
        // 显示正在输入指示器
        this.showTypingIndicator();
        
        // 模拟处理延迟
        setTimeout(() => {
            // 移除输入指示器
            this.hideTypingIndicator();
            
            // 根据用户输入生成响应
            const response = this.getResponseToQuery(userMessage);
            
            // 添加智能体回复
            this.addMessage({
                sender: 'agent',
                text: response,
                timestamp: new Date()
            });
        }, 1000 + Math.random() * 1000); // 随机延迟，让回复看起来更自然
    }
    
    /**
     * 显示正在输入指示器
     */
    showTypingIndicator() {
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        typingIndicator.innerHTML = '<span></span><span></span><span></span>';
        
        const messagesContainer = document.getElementById('explorerChatMessages');
        messagesContainer.appendChild(typingIndicator);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    /**
     * 隐藏正在输入指示器
     */
    hideTypingIndicator() {
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    /**
     * 添加消息到聊天界面
     */
    addMessage(message) {
        this.conversationHistory.push(message);
        
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${message.sender}-message`;
        
        const time = message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        messageElement.innerHTML = `
            <div class="message-content">
                <p>${message.text}</p>
                <span class="message-time">${time}</span>
            </div>
        `;
        
        const messagesContainer = document.getElementById('explorerChatMessages');
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    /**
     * 获取对用户查询的响应
     */
    getResponseToQuery(query) {
        console.log("处理用户查询:", query);
        // 转换为小写进行关键词匹配
        query = query.toLowerCase();
        
        // 检查知识库是否存在
        if (!this.knowledgeBase) {
            console.error("知识库未加载!");
            return "抱歉，我的知识库当前无法访问。请稍后再试。";
        }
        
        // 太阳系知识
        if (this.containsAny(query, ['太阳系'])) {
            return this.knowledgeBase["太阳系"] || "太阳系是由太阳及其周围的行星、卫星、小行星、彗星等天体组成的系统。";
        }
        
        if (this.containsAny(query, ['太阳'])) {
            return this.knowledgeBase["太阳"] || "太阳是太阳系的中心天体，是一颗G型主序星。";
        }
        
        if (this.containsAny(query, ['水星', 'mercury'])) {
            return this.knowledgeBase["水星"] || "水星是太阳系最内侧的行星，也是最小的行星。";
        }
        
        if (this.containsAny(query, ['金星', 'venus'])) {
            return this.knowledgeBase["金星"] || "金星是太阳系中第二颗行星，被称为地球的姊妹星。";
        }
        
        if (this.containsAny(query, ['地球', 'earth'])) {
            return this.knowledgeBase["地球"] || "地球是太阳系中第三颗行星，是已知唯一有生命存在的天体。";
        }
        
        if (this.containsAny(query, ['火星', 'mars'])) {
            return this.knowledgeBase["火星"] || "火星是太阳系中第四颗行星，被称为红色星球。";
        }
        
        if (this.containsAny(query, ['木星', 'jupiter'])) {
            return this.knowledgeBase["木星"] || "木星是太阳系中最大的行星，是一个气态巨行星。";
        }
        
        if (this.containsAny(query, ['土星', '光环', 'saturn', 'rings'])) {
            return this.knowledgeBase["土星"] || "土星是太阳系中第二大行星，以其壮观的环系统闻名。";
        }
        
        if (this.containsAny(query, ['天王星', 'uranus'])) {
            return this.knowledgeBase["天王星"] || "天王星是太阳系中第七颗行星，是第一颗通过望远镜发现的行星。";
        }
        
        if (this.containsAny(query, ['海王星', 'neptune'])) {
            return this.knowledgeBase["海王星"] || "海王星是太阳系中第八颗行星，也是最远的行星。";
        }
        
        if (this.containsAny(query, ['冥王星', 'pluto'])) {
            return this.knowledgeBase["冥王星"] || "冥王星曾被视为太阳系第九大行星，现在被归类为矮行星。";
        }
        
        // 宇宙学问题
        if (this.containsAny(query, ['大爆炸', '宇宙起源', 'big bang'])) {
            return this.knowledgeBase["大爆炸"] || "大爆炸理论是描述宇宙起源的主流科学模型。";
        }
        
        if (this.containsAny(query, ['黑洞', 'black hole'])) {
            return this.knowledgeBase["黑洞"] || "黑洞是时空中引力极强的区域，强到连光都无法逃脱。";
        }
        
        if (this.containsAny(query, ['暗物质', 'dark matter'])) {
            return this.knowledgeBase["暗物质"] || "暗物质是一种假设存在的物质形式，不发射或吸收电磁辐射。";
        }
        
        if (this.containsAny(query, ['暗能量', 'dark energy'])) {
            return this.knowledgeBase["暗能量"] || "暗能量是一种假设存在的能量形式，被认为导致宇宙加速膨胀。";
        }
        
        // 航天器和任务
        if (this.containsAny(query, ['旅行者', 'voyager'])) {
            return this.knowledgeBase["旅行者号"] || "旅行者号是NASA于1977年发射的太空探测器。";
        }
        
        if (this.containsAny(query, ['哈勃', '望远镜', 'hubble'])) {
            return this.knowledgeBase["哈勃太空望远镜"] || "哈勃太空望远镜是1990年发射的一台轨道望远镜。";
        }
        
        if (this.containsAny(query, ['国际空间站', 'iss', 'space station'])) {
            return this.knowledgeBase["国际空间站"] || "国际空间站是一个多国合作的太空研究实验室。";
        }
        
        if (this.containsAny(query, ['好奇号', 'curiosity'])) {
            return this.knowledgeBase["好奇号"] || "好奇号是NASA的一辆火星探测车，于2012年登陆火星。";
        }
        
        if (this.containsAny(query, ['中国空间站', '天宫'])) {
            return this.knowledgeBase["中国空间站"] || "中国空间站是由中国独立建造和运营的空间站。";
        }
        
        if (this.containsAny(query, ['spacex', '太空探索技术公司'])) {
            return this.knowledgeBase["SpaceX"] || "SpaceX是由埃隆·马斯克创立的私人航天公司。";
        }
        
        // 一般太空问题
        if (this.containsAny(query, ['宇宙', 'universe', 'cosmos'])) {
            return this.knowledgeBase["宇宙"] || "宇宙是所有存在的时间、空间以及其中的内容的总称。";
        }
        
        // 未匹配到具体知识点，返回一般性回答
        return "对于这个问题，我没有具体的信息。但我很乐意与您讨论太阳系、恒星、宇宙学或太空探索的其他方面。请问您对哪方面更感兴趣？";
    }
    
    /**
     * 检查文本是否包含任意关键词
     */
    containsAny(text, keywords) {
        for (const keyword of keywords) {
            if (text.includes(keyword)) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * 创建聊天界面
     */
    createChatInterface() {
        console.log("创建探索者聊天界面...");
        // 检查是否已经存在
        if (document.getElementById('explorerChatContainer')) {
            console.log("聊天界面已存在，不重复创建");
            return;
        }
        
        // 确保agent-chat.css已加载
        if (!document.querySelector('link[href="css/agent-chat.css"]')) {
            console.log("加载聊天界面样式...");
            const styleLink = document.createElement('link');
            styleLink.rel = 'stylesheet';
            styleLink.href = 'css/agent-chat.css';
            document.head.appendChild(styleLink);
        }
        
        const chatContainer = document.createElement('div');
        chatContainer.className = 'agent-chat-container';
        chatContainer.id = 'explorerChatContainer';
        chatContainer.style.display = 'none'; // 初始隐藏
        
        // 添加内联样式以确保基本可见性
        const inlineStyles = `
            <style>
                #explorerChatContainer {
                    position: fixed !important;
                    bottom: 20px !important;
                    right: 20px !important;
                    width: 350px !important;
                    height: 500px !important;
                    background-color: #121a2f !important;
                    border-radius: 12px !important;
                    box-shadow: 0 5px 25px rgba(0, 0, 0, 0.5) !important;
                    display: flex !important;
                    flex-direction: column !important;
                    z-index: 1000 !important;
                    overflow: hidden !important;
                }
                
                #explorerChatContainer.visible {
                    display: flex !important;
                }
            </style>
        `;
        
        chatContainer.innerHTML = inlineStyles + `
            <div class="chat-header">
                <img src="${this.avatar}" alt="${this.name}" class="agent-chat-avatar">
                <div class="agent-chat-info">
                    <h3>${this.name}</h3>
                    <p>${this.title}</p>
                </div>
                <button class="close-chat-btn">×</button>
            </div>
            <div class="chat-messages" id="explorerChatMessages"></div>
            <div class="chat-input">
                <input type="text" id="explorerChatInput" placeholder="向探索者提问太空探索相关问题...">
                <button id="sendToExplorer">发送</button>
            </div>
        `;
        
        document.body.appendChild(chatContainer);
        console.log("聊天界面已添加到DOM");
        
        // 设置聊天界面事件
        document.querySelector('.close-chat-btn').addEventListener('click', () => {
            console.log("关闭聊天界面");
            document.getElementById('explorerChatContainer').style.display = 'none';
            this.isActive = false;
        });
        
        document.getElementById('sendToExplorer').addEventListener('click', () => {
            console.log("发送按钮被点击");
            this.handleUserMessage();
        });
        
        document.getElementById('explorerChatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                console.log("用户按下Enter键发送消息");
                this.handleUserMessage();
            }
        });
        
        console.log("聊天界面事件监听器已设置");
    }
}

// 初始化探索者智能体并放在全局作用域
// 确保任何时间点只有一个实例
if (!window.explorer) {
    console.log("创建全局Explorer实例");
    try {
        window.explorer = new ExplorerAgent();
        console.log("Explorer智能体初始化成功:", window.explorer);
        
        // 为全局对象添加直接激活方法，便于从HTML中调用
        window.activateExplorer = function() {
            console.log("通过全局activateExplorer方法触发激活");
            if (window.explorer) {
                window.explorer.activate();
                return true;
            }
            console.error("Explorer智能体未初始化!");
            return false;
        };
    } catch (error) {
        console.error("初始化Explorer智能体时出错:", error);
    }
} else {
    console.log("Explorer智能体已存在，不重复创建");
}

// 在DOM加载后立即检查并绑定按钮
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOMContentLoaded事件触发，检查激活按钮");
    
    // 查找所有Explorer激活按钮
    const buttons = document.querySelectorAll('.activate-agent-btn[data-agent="explorer"]');
    console.log(`找到${buttons.length}个Explorer激活按钮`);
    
    // 为每个按钮添加内联onclick属性
    buttons.forEach((btn, index) => {
        console.log(`设置按钮${index + 1}的onclick属性`);
        btn.setAttribute('onclick', 'window.activateExplorer(); return false;');
    });
});
