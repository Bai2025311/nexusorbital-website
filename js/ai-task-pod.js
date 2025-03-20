/**
 * AI任务舱助手 - NexusOrbital移动端社区
 * 提供AI辅助功能和任务管理
 */

class AITaskPod {
    constructor(options = {}) {
        this.config = {
            container: document.body,
            messageHistoryLength: 10,
            aiResponseDelay: 500,
            commandPrefix: '/',
            ...options
        };

        this.messageHistory = [];
        this.isOpen = false;
        this.commands = new Map();
        this.isListening = false;
        this.recognition = null;
        this.commandHistory = [];
        this.commandHistoryIndex = -1;

        this.init();
    }

    /**
     * 初始化AI任务舱
     */
    init() {
        this.createElements();
        this.setupEventListeners();
        this.registerBasicCommands();
        this.addWelcomeMessage();
    }

    /**
     * 创建AI任务舱UI元素
     */
    createElements() {
        // 创建主容器
        this.container = document.createElement('div');
        this.container.className = 'ai-task-pod';

        // 创建触发按钮
        this.triggerButton = document.createElement('div');
        this.triggerButton.className = 'ai-pod-trigger';
        this.triggerButton.innerHTML = '<i class="fas fa-robot"></i>';

        // 创建面板
        this.panel = document.createElement('div');
        this.panel.className = 'ai-pod-panel';
        this.panel.style.display = 'none';

        // 创建面板头部
        this.panelHeader = document.createElement('div');
        this.panelHeader.className = 'ai-pod-header';
        this.panelHeader.innerHTML = `
            <div class="ai-pod-title">星际助手</div>
            <div class="ai-pod-actions">
                <button class="ai-action-button voice-button"><i class="fas fa-microphone"></i></button>
                <button class="ai-action-button close-button"><i class="fas fa-times"></i></button>
            </div>
        `;

        // 创建消息容器
        this.messagesContainer = document.createElement('div');
        this.messagesContainer.className = 'ai-pod-messages';

        // 创建输入区域
        this.inputArea = document.createElement('div');
        this.inputArea.className = 'ai-pod-input-area';
        this.inputArea.innerHTML = `
            <input type="text" class="ai-pod-input" placeholder="输入消息或使用 / 命令...">
            <button class="ai-pod-send"><i class="fas fa-paper-plane"></i></button>
        `;

        // 添加到面板
        this.panel.appendChild(this.panelHeader);
        this.panel.appendChild(this.messagesContainer);
        this.panel.appendChild(this.inputArea);

        // 添加到主容器
        this.container.appendChild(this.triggerButton);
        this.container.appendChild(this.panel);

        // 添加到页面
        this.config.container.appendChild(this.container);
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 触发按钮点击事件
        this.triggerButton.addEventListener('click', () => {
            this.togglePanel();
        });

        // 关闭按钮点击事件
        this.panelHeader.querySelector('.close-button').addEventListener('click', () => {
            this.closePanel();
        });

        // 语音按钮点击事件
        this.panelHeader.querySelector('.voice-button').addEventListener('click', () => {
            this.toggleVoiceRecognition();
        });

        // 发送按钮点击事件
        this.inputArea.querySelector('.ai-pod-send').addEventListener('click', () => {
            this.sendMessage();
        });

        // 输入框按下回车事件
        this.inputArea.querySelector('.ai-pod-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            } else if (e.key === 'ArrowUp') {
                this.navigateCommandHistory(-1);
                e.preventDefault();
            } else if (e.key === 'ArrowDown') {
                this.navigateCommandHistory(1);
                e.preventDefault();
            }
        });
    }

    /**
     * 注册基本命令
     */
    registerBasicCommands() {
        this.registerCommand('帮助', 'help', () => {
            const commands = Array.from(this.commands.entries());
            let helpText = '可用命令:\n';
            
            commands.forEach(([key, cmd]) => {
                helpText += `/${cmd.alias} - ${key}\n`;
            });
            
            return {
                "type": "text",
                "content": helpText
            };
        });

        this.registerCommand('清除', 'clear', () => {
            this.messagesContainer.innerHTML = '';
            this.messageHistory = [];
            return {
                "type": "text",
                "content": "消息已清除。"
            };
        });
    }

    /**
     * 添加欢迎消息
     */
    addWelcomeMessage() {
        this.addMessage('AI助手', '欢迎使用星际助手！我可以帮助您导航社区和执行任务。输入 /help 查看所有命令。', 'ai');
    }

    /**
     * 切换面板显示/隐藏
     */
    togglePanel() {
        if (this.isOpen) {
            this.closePanel();
        } else {
            this.openPanel();
        }
    }

    /**
     * 打开面板
     */
    openPanel() {
        this.panel.style.display = 'flex';
        this.triggerButton.classList.add('active');
        this.isOpen = true;
        
        // 动画效果
        setTimeout(() => {
            this.panel.classList.add('open');
            this.inputArea.querySelector('.ai-pod-input').focus();
        }, 10);
    }

    /**
     * 关闭面板
     */
    closePanel() {
        this.panel.classList.remove('open');
        this.triggerButton.classList.remove('active');
        this.isOpen = false;
        
        // 等待动画完成后隐藏
        setTimeout(() => {
            this.panel.style.display = 'none';
        }, 300);
        
        // 停止语音识别
        if (this.isListening) {
            this.stopVoiceRecognition();
        }
    }

    /**
     * 发送消息
     */
    sendMessage() {
        const input = this.inputArea.querySelector('.ai-pod-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        // 记录命令历史
        if (message.startsWith(this.config.commandPrefix)) {
            this.commandHistory.push(message);
            if (this.commandHistory.length > 20) {
                this.commandHistory.shift();
            }
            this.commandHistoryIndex = this.commandHistory.length;
        }
        
        // 添加用户消息
        this.addMessage('用户', message, 'user');
        
        // 清空输入框
        input.value = '';
        
        // 处理消息
        this.processMessage(message);
    }

    /**
     * 处理消息
     * @param {string} message - 用户消息
     */
    processMessage(message) {
        // 检查是否是命令
        if (message.startsWith(this.config.commandPrefix)) {
            this.processCommand(message.slice(this.config.commandPrefix.length));
            return;
        }
        
        // 非命令，进行自然语言处理
        this.processNaturalLanguage(message);
    }

    /**
     * 处理命令
     * @param {string} commandText - 命令文本
     */
    processCommand(commandText) {
        const parts = commandText.split(' ');
        const commandName = parts[0].toLowerCase();
        const args = parts.slice(1).join(' ');
        
        // 查找匹配的命令
        let found = false;
        
        for (const [key, command] of this.commands.entries()) {
            if (command.alias === commandName) {
                found = true;
                
                // 模拟AI思考延迟
                setTimeout(() => {
                    const result = command.handler(args);
                    
                    if (result) {
                        if (result.type === "text") {
                            this.addMessage('AI助手', result.content, 'ai');
                        } else if (result.type === "error") {
                            this.addMessage('系统', result.content, 'system');
                        }
                    }
                }, this.config.aiResponseDelay);
                
                break;
            }
        }
        
        if (!found) {
            this.addMessage('系统', `未知命令: ${commandName}。使用 /help 查看可用命令。`, 'system');
        }
    }

    /**
     * 处理自然语言输入
     * @param {string} text - 自然语言文本
     */
    processNaturalLanguage(text) {
        // 模拟AI思考延迟
        setTimeout(() => {
            // 简单的关键词匹配
            for (const [key, command] of this.commands.entries()) {
                if (text.includes(key)) {
                    const result = command.handler(text);
                    
                    if (result) {
                        if (result.type === "text") {
                            this.addMessage('AI助手', result.content, 'ai');
                            return;
                        }
                    }
                }
            }
            
            // 默认回复
            this.addMessage('AI助手', '我不太理解您的意思。请尝试使用更具体的问题或使用 /help 查看可用命令。', 'ai');
        }, this.config.aiResponseDelay);
    }

    /**
     * 添加消息
     * @param {string} sender - 发送者
     * @param {string} text - 消息内容
     * @param {string} type - 消息类型
     */
    addMessage(sender, text, type = 'user') {
        // 创建消息元素
        const messageElement = document.createElement('div');
        messageElement.className = `ai-message ${type}-message`;
        
        // 格式化消息内容（支持简单的换行）
        const formattedText = text.replace(/\n/g, '<br>');
        
        messageElement.innerHTML = `
            <div class="message-sender">${sender}</div>
            <div class="message-content">${formattedText}</div>
            <div class="message-time">${this.getFormattedTime()}</div>
        `;
        
        // 添加到消息容器
        this.messagesContainer.appendChild(messageElement);
        
        // 滚动到底部
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        
        // 保存到历史记录
        this.messageHistory.push({
            sender,
            text,
            type,
            time: new Date()
        });
        
        // 限制历史记录长度
        if (this.messageHistory.length > this.config.messageHistoryLength) {
            this.messageHistory.shift();
        }
        
        return messageElement;
    }

    /**
     * 获取格式化的时间
     * @returns {string} - 格式化的时间字符串
     */
    getFormattedTime() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    /**
     * 注册命令
     * @param {string} name - 命令名称
     * @param {string} alias - 命令别名
     * @param {Function} handler - 命令处理函数
     */
    registerCommand(name, alias, handler) {
        this.commands.set(name, {
            alias,
            handler
        });
    }

    /**
     * 导航命令历史
     * @param {number} direction - 导航方向
     */
    navigateCommandHistory(direction) {
        if (this.commandHistory.length === 0) return;
        
        this.commandHistoryIndex += direction;
        
        if (this.commandHistoryIndex < 0) {
            this.commandHistoryIndex = 0;
        } else if (this.commandHistoryIndex >= this.commandHistory.length) {
            this.commandHistoryIndex = this.commandHistory.length;
            this.inputArea.querySelector('.ai-pod-input').value = '';
            return;
        }
        
        this.inputArea.querySelector('.ai-pod-input').value = this.commandHistory[this.commandHistoryIndex] || '';
    }

    /**
     * 切换语音识别
     */
    toggleVoiceRecognition() {
        if (this.isListening) {
            this.stopVoiceRecognition();
        } else {
            this.startVoiceRecognition();
        }
    }

    /**
     * 开始语音识别
     */
    startVoiceRecognition() {
        // 检查浏览器支持
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            this.addMessage('系统', '您的浏览器不支持语音识别功能。', 'system');
            return;
        }
        
        // 初始化语音识别
        if (!this.recognition) {
            this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            this.recognition.lang = 'zh-CN';
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.inputArea.querySelector('.ai-pod-input').value = transcript;
                this.sendMessage();
            };
            
            this.recognition.onerror = (event) => {
                this.addMessage('系统', `语音识别错误: ${event.error}`, 'system');
                this.stopVoiceRecognition();
            };
            
            this.recognition.onend = () => {
                this.stopVoiceRecognition();
            };
        }
        
        // 开始识别
        this.recognition.start();
        this.isListening = true;
        this.panelHeader.querySelector('.voice-button').classList.add('active');
        this.addMessage('系统', '正在聆听...请说话', 'system');
    }

    /**
     * 停止语音识别
     */
    stopVoiceRecognition() {
        if (this.recognition) {
            this.recognition.stop();
        }
        this.isListening = false;
        this.panelHeader.querySelector('.voice-button').classList.remove('active');
    }
}

// 导出类
window.AITaskPod = AITaskPod;
