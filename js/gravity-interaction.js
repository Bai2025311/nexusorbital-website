/**
 * 引力交互系统 - NexusOrbital移动端社区
 * 提供基于手势的导航和粒子效果
 */

class GravityInteraction {
    constructor(options = {}) {
        this.config = {
            container: document.body,
            particleCount: 20,
            particleMaxLife: 80,
            particleBaseSize: 2,
            swipeThreshold: 50,
            backgroundStars: 100,
            navSections: [],
            currentSectionIndex: 0,
            onSectionChange: null,
            enableAIAssistant: true,
            ...options
        };

        this.touchState = {
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            isTracking: false,
            swipeDirection: null,
            touchStartTime: 0
        };

        this.particles = [];
        this.stars = [];
        this.animationFrameId = null;
        this.currentSection = null;
        this.gravityHintShown = false;
        this.aiAssistant = null;

        this.init();
    }

    init() {
        this.createCanvas();
        this.createStars();
        this.setupTouchListeners();
        this.setupGravityHint();
        
        if (this.config.enableAIAssistant) {
            this.initAIAssistant();
        }
        
        this.requestAnimation();
    }

    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'gravity-canvas';
        this.ctx = this.canvas.getContext('2d');
        
        // 设置画布大小
        this.resizeCanvas();
        
        // 添加到容器
        this.config.container.appendChild(this.canvas);
        
        // 监听窗口大小变化
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createStars() {
        this.stars = [];
        for (let i = 0; i < this.config.backgroundStars; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.8 + 0.2,
                blinkSpeed: Math.random() * 0.02 + 0.005,
                blinkDirection: Math.random() > 0.5 ? 1 : -1
            });
        }
    }

    setupTouchListeners() {
        // 触摸开始
        this.config.container.addEventListener('touchstart', (e) => {
            this.touchState.isTracking = true;
            this.touchState.startX = e.touches[0].clientX;
            this.touchState.startY = e.touches[0].clientY;
            this.touchState.currentX = this.touchState.startX;
            this.touchState.currentY = this.touchState.startY;
            this.touchState.touchStartTime = Date.now();
            
            // 显示引力提示
            if (!this.gravityHintShown) {
                this.showGravityHint();
            }
        });

        // 触摸移动
        this.config.container.addEventListener('touchmove', (e) => {
            if (!this.touchState.isTracking) return;
            
            this.touchState.currentX = e.touches[0].clientX;
            this.touchState.currentY = e.touches[0].clientY;
            
            const deltaX = this.touchState.currentX - this.touchState.startX;
            const deltaY = this.touchState.currentY - this.touchState.startY;
            
            // 判断滑动方向
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // 水平滑动
                if (deltaX > this.config.swipeThreshold) {
                    this.touchState.swipeDirection = 'right';
                } else if (deltaX < -this.config.swipeThreshold) {
                    this.touchState.swipeDirection = 'left';
                }
            } else {
                // 垂直滑动
                if (deltaY > this.config.swipeThreshold) {
                    this.touchState.swipeDirection = 'down';
                } else if (deltaY < -this.config.swipeThreshold) {
                    this.touchState.swipeDirection = 'up';
                }
            }
            
            // 创建粒子效果
            this.createParticles();
        });

        // 触摸结束
        this.config.container.addEventListener('touchend', () => {
            // 处理滑动结果
            if (this.touchState.swipeDirection) {
                this.handleSwipe(this.touchState.swipeDirection);
            }
            
            // 重置状态
            this.touchState.isTracking = false;
            this.touchState.swipeDirection = null;
        });
        
        // 阻止默认滚动行为
        document.addEventListener('touchmove', (e) => {
            if (this.touchState.isTracking && 
                (this.touchState.swipeDirection === 'left' || 
                this.touchState.swipeDirection === 'right')) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    setupGravityHint() {
        // 创建引力提示元素
        this.gravityHint = document.createElement('div');
        this.gravityHint.className = 'gravity-hint';
        this.gravityHint.innerHTML = `
            <div class="hint-icon">
                <i class="fas fa-hand-pointer"></i>
                <i class="fas fa-arrows-alt-h"></i>
            </div>
            <div class="hint-text">左右滑动体验引力导航</div>
        `;
        
        // 初始隐藏
        this.gravityHint.style.opacity = '0';
        this.gravityHint.style.display = 'none';
        
        // 添加到文档
        document.body.appendChild(this.gravityHint);
    }

    showGravityHint() {
        if (this.gravityHintShown) return;
        
        this.gravityHint.style.display = 'flex';
        setTimeout(() => {
            this.gravityHint.style.opacity = '1';
        }, 10);
        
        // 3秒后隐藏
        setTimeout(() => {
            this.gravityHint.style.opacity = '0';
            setTimeout(() => {
                this.gravityHint.style.display = 'none';
            }, 500);
            this.gravityHintShown = true;
        }, 3000);
    }

    initAIAssistant() {
        // 确保已加载AI任务舱脚本
        if (typeof AITaskPod !== 'undefined') {
            this.aiAssistant = new AITaskPod({
                container: document.body,
                aiName: "星辰AI",
                welcomeMessage: "欢迎来到NexusOrbital社区！我是您的AI助手，可以帮助您探索社区功能和导航。左右滑动体验引力导航系统，或向我询问有关功能的任何问题。",
                activationPhrases: ["嗨，星辰", "你好，AI", "需要帮助"]
            });
            
            // 注册AI任务舱命令处理
            this.registerAICommands();
        } else {
            console.error('AITaskPod类未定义，AI助手初始化失败');
            
            // 尝试延迟加载
            setTimeout(() => {
                if (typeof AITaskPod !== 'undefined') {
                    this.initAIAssistant();
                }
            }, 1000);
        }
    }
    
    registerAICommands() {
        if (!this.aiAssistant) return;
        
        // 注册常用命令处理
        let helpCommand = {
            keywords: ['帮助', '指令', '命令', 'help'],
            response: function() {
                // 创建响应信息
                let helpResponse = '可用指令列表：\n\n';
                helpResponse += '1. 帮助 - 显示指令列表\n';
                helpResponse += '2. 如何发帖 - 查看发帖教程\n';
                helpResponse += '3. 社区功能 - 了解社区主要功能\n';
                helpResponse += '4. 引力导航 - 学习引力交互系统的使用方法\n';
                return helpResponse;
            }
        };
        this.aiAssistant.registerCommand("帮助", "help", helpCommand);
        
        let howToPostCommand = {
            keywords: ['如何发帖', '发帖', '创建帖子', '新建帖子'],
            response: function() {
                // 创建响应信息
                let postHelp = '发布帖子的步骤：\n\n';
                postHelp += '1. 点击界面右下角的"发表帖子"按钮\n';
                postHelp += '2. 填写帖子标题（必填）\n';
                postHelp += '3. 选择帖子分类（技术分享、创意设计等）\n';
                postHelp += '4. 输入帖子内容\n';
                postHelp += '5. 点击"发布"按钮完成\n\n';
                postHelp += '注意：需要登录后才能发布内容';
                return postHelp;
            }
        };
        this.aiAssistant.registerCommand("如何发帖", "post_help", howToPostCommand);
        
        let communityFeaturesCommand = {
            keywords: ['社区功能', '功能', '社区特性'],
            response: function() {
                // 创建响应信息
                let featuresInfo = 'NexusOrbital社区主要功能：\n\n';
                featuresInfo += '1. 技术共享 - 分享前沿太空技术和研究成果\n';
                featuresInfo += '2. 创意设计 - 发布创新的太空居住解决方案\n';
                featuresInfo += '3. 资源交流 - 交换实用资源和项目材料\n';
                featuresInfo += '4. 协同工作 - 连接工程师共同解决技术挑战\n';
                return featuresInfo;
            }
        };
        this.aiAssistant.registerCommand("社区功能", "community_features", communityFeaturesCommand);
        
        let gravityNavigationCommand = {
            keywords: ['引力导航', '引力交互', '导航', '滑动'],
            response: function() {
                // 创建响应信息
                let navHelp = '引力交互系统使用指南：\n\n';
                navHelp += '• 左右滑动 - 在不同功能板块间导航\n';
                navHelp += '  - 左滑：进入技术众筹中心\n';
                navHelp += '  - 右滑：进入工程师社区\n\n';
                navHelp += '• 长按数据模块 - 查看详细3D数据分析\n';
                navHelp += '• 点击数据模块 - 显示简要信息\n';
                return navHelp;
            }
        };
        this.aiAssistant.registerCommand("引力导航", "gravity_navigation", gravityNavigationCommand);
    }

    createParticles() {
        // 如果未在跟踪触摸或未移动，则不生成粒子
        if (!this.touchState.isTracking) return;
        
        // 根据移动速度决定生成的粒子数量
        const moveSpeed = Math.sqrt(
            Math.pow(this.touchState.currentX - this.touchState.startX, 2) +
            Math.pow(this.touchState.currentY - this.touchState.startY, 2)
        );
        
        const particlesToCreate = Math.min(
            Math.floor(moveSpeed / 10),
            this.config.particleCount
        );
        
        // 创建粒子
        for (let i = 0; i < particlesToCreate; i++) {
            // 计算方向向量
            const dirX = this.touchState.currentX - this.touchState.startX;
            const dirY = this.touchState.currentY - this.touchState.startY;
            const length = Math.sqrt(dirX * dirX + dirY * dirY);
            
            // 单位向量
            const normalizedDirX = dirX / length || 0;
            const normalizedDirY = dirY / length || 0;
            
            // 随机偏移
            const offsetX = (Math.random() - 0.5) * 30;
            const offsetY = (Math.random() - 0.5) * 30;
            
            const particle = {
                x: this.touchState.currentX + offsetX,
                y: this.touchState.currentY + offsetY,
                size: Math.random() * this.config.particleBaseSize * 2 + this.config.particleBaseSize,
                speed: Math.random() * 2 + 1,
                velocity: {
                    x: normalizedDirX * (Math.random() * 3 + 2) * -1, // 反向移动
                    y: normalizedDirY * (Math.random() * 3 + 2) * -1
                },
                life: Math.random() * this.config.particleMaxLife * 0.5 + this.config.particleMaxLife * 0.5,
                maxLife: this.config.particleMaxLife,
                color: this.getParticleColor()
            };
            
            this.particles.push(particle);
        }
    }

    getParticleColor() {
        // 根据方向选择颜色
        const colors = {
            left: 'rgba(52, 152, 219, $alpha)', // 蓝色
            right: 'rgba(46, 204, 113, $alpha)', // 绿色
            up: 'rgba(155, 89, 182, $alpha)',    // 紫色
            down: 'rgba(241, 196, 15, $alpha)'   // 黄色
        };
        
        const defaultColor = 'rgba(255, 255, 255, $alpha)';
        const directionColor = colors[this.touchState.swipeDirection] || defaultColor;
        const alpha = Math.random() * 0.4 + 0.6; // 60-100% 透明度
        
        return directionColor.replace('$alpha', alpha);
    }

    updateParticles() {
        // 更新粒子状态
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            // 更新位置
            p.x += p.velocity.x;
            p.y += p.velocity.y;
            
            // 减少生命
            p.life--;
            
            // 随着生命减少，降低速度
            p.velocity.x *= 0.98;
            p.velocity.y *= 0.98;
            
            // 如果生命结束，则移除粒子
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    updateStars() {
        // 更新星星闪烁状态
        for (let i = 0; i < this.stars.length; i++) {
            const star = this.stars[i];
            
            // 更新透明度
            star.opacity += star.blinkSpeed * star.blinkDirection;
            
            // 如果达到边界，则改变方向
            if (star.opacity >= 1 || star.opacity <= 0.2) {
                star.blinkDirection *= -1;
            }
        }
    }

    drawParticles() {
        // 绘制粒子
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            
            // 计算不透明度（基于剩余生命）
            const lifeRatio = p.life / p.maxLife;
            const color = p.color.replace('$alpha', lifeRatio);
            
            this.ctx.beginPath();
            this.ctx.fillStyle = color;
            this.ctx.arc(p.x, p.y, p.size * lifeRatio, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    drawStars() {
        // 绘制背景星星
        for (let i = 0; i < this.stars.length; i++) {
            const star = this.stars[i];
            
            this.ctx.beginPath();
            this.ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    draw() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制星星
        this.drawStars();
        
        // 绘制粒子
        this.drawParticles();
    }

    update() {
        // 更新粒子
        this.updateParticles();
        
        // 更新星星
        this.updateStars();
        
        // 绘制
        this.draw();
    }

    requestAnimation() {
        // 动画循环
        this.animationFrameId = requestAnimationFrame(() => {
            this.update();
            this.requestAnimation();
        });
    }

    handleSwipe(direction) {
        console.log(`处理${direction}滑动`);
        
        // 触发自定义事件
        const event = new CustomEvent('gravity-navigation', {
            detail: { direction }
        });
        this.config.container.dispatchEvent(event);
        
        // 执行导航逻辑
        switch (direction) {
            case 'left':
                this.navigateToNext();
                break;
            case 'right':
                this.navigateToPrevious();
                break;
            case 'up':
                // 上滑操作，例如刷新内容
                console.log('上滑刷新内容');
                break;
            case 'down':
                // 下滑操作，例如显示更多选项
                console.log('下滑显示更多选项');
                break;
        }
        
        // 如果AI助手已初始化，可以通知AI助手用户进行了导航操作
        if (this.aiAssistant) {
            const directionMap = {
                left: '左',
                right: '右',
                up: '上',
                down: '下'
            };
            
            // 添加系统消息提示用户使用了引力导航
            setTimeout(() => {
                if (Math.random() < 0.3) { // 只有30%的概率提示，避免过多打扰
                    this.aiAssistant.addMessage('系统', `检测到${directionMap[direction]}滑动手势，已触发引力导航。`, 'system');
                }
            }, 500);
        }
    }

    navigateToNext() {
        if (!this.config.navSections || this.config.navSections.length === 0) {
            // 模拟页面滑动效果
            this.animatePageSlide('left');
            return;
        }
        
        // 更新当前部分索引
        this.config.currentSectionIndex = (this.config.currentSectionIndex + 1) % this.config.navSections.length;
        this.currentSection = this.config.navSections[this.config.currentSectionIndex];
        
        // 调用部分更改回调
        if (typeof this.config.onSectionChange === 'function') {
            this.config.onSectionChange(this.currentSection, this.config.currentSectionIndex);
        }
    }

    navigateToPrevious() {
        if (!this.config.navSections || this.config.navSections.length === 0) {
            // 模拟页面滑动效果
            this.animatePageSlide('right');
            return;
        }
        
        // 更新当前部分索引
        this.config.currentSectionIndex = (this.config.currentSectionIndex - 1 + this.config.navSections.length) % this.config.navSections.length;
        this.currentSection = this.config.navSections[this.config.currentSectionIndex];
        
        // 调用部分更改回调
        if (typeof this.config.onSectionChange === 'function') {
            this.config.onSectionChange(this.currentSection, this.config.currentSectionIndex);
        }
    }

    animatePageSlide(direction) {
        // 创建页面滑动的动画效果
        const content = document.querySelector('.content');
        if (!content) return;
        
        // 设置过渡
        content.style.transition = 'transform 0.3s ease-out';
        
        // 根据方向设置初始位置
        content.style.transform = direction === 'left' ? 'translateX(-5%)' : 'translateX(5%)';
        
        // 动画结束后恢复位置
        setTimeout(() => {
            content.style.transform = 'translateX(0)';
            
            // 动画完成后移除过渡，以便下次动画正常
            setTimeout(() => {
                content.style.transition = '';
            }, 300);
        }, 10);
    }

    // 销毁实例并释放资源
    destroy() {
        // 停止动画
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        
        // 移除引力提示
        if (this.gravityHint && this.gravityHint.parentNode) {
            this.gravityHint.parentNode.removeChild(this.gravityHint);
        }
        
        // 移除画布
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

// 当文档加载完成时初始化引力交互系统
document.addEventListener('DOMContentLoaded', () => {
    // 检查是否在社区移动端页面
    if (document.querySelector('.community-mobile-container')) {
        // 定义导航部分
        const navSections = [
            { id: 'community', name: '社区' },
            { id: 'projects', name: '项目' },
            { id: 'events', name: '活动' },
            { id: 'resources', name: '资源' }
        ];

        // 初始化引力交互系统
        const gravitySystem = new GravityInteraction({
            container: document.querySelector('.community-mobile-container'),
            navSections: navSections,
            onSectionChange: onSectionChange
        });
        
        // 将引力系统实例存储在window对象上，以便在其他脚本中访问
        window.gravitySystem = gravitySystem;
    }
});

// 处理部分更改回调
function onSectionChange(section, index) {
    console.log(`导航到: ${section.name} (索引: ${index})`);
    
    // 这里可以添加部分切换的逻辑
    // 例如更新UI或加载不同的内容
    
    // 显示Toast消息
    if (typeof showToast === 'function') {
        showToast(`已导航到: ${section.name}`, 1500);
    }
}

// 左滑进入技术众筹，右滑进入工程师社区
function handleSwipe(direction) {
    if (direction === 'left') {
        // 左滑 - 进入技术众筹
        showSwipeTransition('left', function() {
            // 模拟导航到技术众筹
            showToast('进入技术众筹', 2000);
        });
    } else if (direction === 'right') {
        // 右滑 - 进入工程师社区
        showSwipeTransition('right', function() {
            // 模拟导航到工程师社区
            showToast('进入工程师社区', 2000);
        });
    }
}

// 显示滑动过渡效果
function showSwipeTransition(direction, callback) {
    const container = document.querySelector('.community-mobile-container');
    
    // 创建过渡元素
    const transition = document.createElement('div');
    transition.className = 'gravity-transition';
    document.body.appendChild(transition);
    
    // 触发重绘
    void transition.offsetWidth;
    
    // 创建引力波纹效果
    createGravityRipple(direction);
    
    // 显示过渡效果
    transition.style.opacity = '1';
    
    // 过渡完成后执行回调
    setTimeout(function() {
        transition.style.opacity = '0';
        
        if (typeof callback === 'function') {
            callback();
        }
        
        // 移除过渡元素
        setTimeout(function() {
            transition.remove();
        }, 500);
    }, 500);
}

// 创建引力波纹效果
function createGravityRipple(direction) {
    const container = document.querySelector('.community-mobile-container');
    const x = direction === 'left' ? window.innerWidth * 0.25 : window.innerWidth * 0.75;
    const y = window.innerHeight / 2;
    
    // 创建3个波纹
    for (let i = 0; i < 3; i++) {
        setTimeout(function() {
            const ripple = document.createElement('div');
            ripple.className = 'gravity-ripple';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            container.appendChild(ripple);
            
            // 移除波纹
            setTimeout(function() {
                ripple.remove();
            }, 1500);
        }, i * 300);
    }
}
