/**
 * 用户认证脚本
 * 包括登录、注册、验证码、JWT处理等功能
 */

// API基础URL，生产环境应该使用相对路径或HTTPS
const API_BASE_URL = 'https://jsonplaceholder.typicode.com';

document.addEventListener("DOMContentLoaded", function() {
    // 处理登录/注册选项卡切换
    const tabButtons = document.querySelectorAll('.tab-btn');
    if (tabButtons.length > 0) {
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                // 移除所有活动状态
                document.querySelectorAll('.tab-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                
                // 添加活动状态到当前选项卡
                this.classList.add('active');
                const tabId = this.getAttribute('data-tab');
                document.getElementById(tabId).classList.add('active');
            });
        });
    }
    
    // 处理短信验证码
    const verificationButtons = document.querySelectorAll('.btn-verification-code');
    if (verificationButtons.length > 0) {
        verificationButtons.forEach(button => {
            button.addEventListener('click', function() {
                const phoneInput = this.closest('form').querySelector('[name="phone"]');
                const countryCode = this.closest('form').querySelector('[name="country-code"]');
                
                if (phoneInput && phoneInput.value) {
                    sendVerificationCode(countryCode.value, phoneInput.value);
                } else {
                    showMessage('请输入有效的手机号码');
                }
            });
        });
    }
    
    // 处理登录表单提交
    const loginForm = document.querySelector('.auth-form');
    if (loginForm && window.location.href.includes('login.html')) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 判断当前活动的登录选项卡
            const activeTab = document.querySelector('.tab-content.active');
            
            if (activeTab.id === 'email-tab') {
                // 邮箱登录
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                
                if (email && password) {
                    loginWithEmail(email, password);
                } else {
                    showMessage('请填写所有必填字段');
                }
            } else if (activeTab.id === 'phone-tab') {
                // 手机号登录
                const countryCode = document.getElementById('country-code').value;
                const phone = document.getElementById('phone').value;
                const code = document.getElementById('verification-code').value;
                
                if (countryCode && phone && code) {
                    loginWithPhone(countryCode, phone, code);
                } else {
                    showMessage('请填写所有必填字段');
                }
            }
        });
    }
    
    // 处理注册表单提交
    if (loginForm && window.location.href.includes('register.html')) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 判断当前活动的注册选项卡
            const activeTab = document.querySelector('.tab-content.active');
            
            if (activeTab.id === 'email-tab') {
                // 邮箱注册
                const username = document.getElementById('username').value;
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                const confirmPassword = document.getElementById('confirm-password').value;
                
                if (username && email && password && confirmPassword) {
                    if (password === confirmPassword) {
                        registerWithEmail(username, email, password);
                    } else {
                        showMessage('两次输入的密码不一致');
                    }
                } else {
                    showMessage('请填写所有必填字段');
                }
            } else if (activeTab.id === 'phone-tab') {
                // 手机号注册
                const username = document.getElementById('phone-username').value;
                const countryCode = document.getElementById('country-code').value;
                const phone = document.getElementById('phone').value;
                const code = document.getElementById('verification-code').value;
                const password = document.getElementById('phone-password').value;
                
                if (username && countryCode && phone && code && password) {
                    registerWithPhone(username, countryCode, phone, code, password);
                } else {
                    showMessage('请填写所有必填字段');
                }
            } else if (activeTab.id === 'social-tab') {
                // 社交媒体注册
                const socialType = document.querySelector('.btn-social.active').classList.contains('weixin') ? 'weixin' : 
                                   document.querySelector('.btn-social.active').classList.contains('weibo') ? 'weibo' : 
                                   document.querySelector('.btn-social.active').classList.contains('xiaohongshu') ? 'xiaohongshu' : '';
                
                if (socialType) {
                    registerWithSocial(socialType);
                }
            }
        });
    }
    
    // 处理社交登录按钮
    const socialButtons = document.querySelectorAll('.btn-social');
    if (socialButtons.length > 0) {
        socialButtons.forEach(button => {
            button.addEventListener('click', function() {
                const socialType = this.classList.contains('weixin') ? 'weixin' : 
                                   this.classList.contains('weibo') ? 'weibo' : 
                                   this.classList.contains('xiaohongshu') ? 'xiaohongshu' : '';
                                   
                if (socialType) {
                    loginWithSocial(socialType);
                }
            });
        });
    }
});

/**
 * 发送短信验证码
 * @param {string} countryCode 国家代码
 * @param {string} phone 手机号码
 */
function sendVerificationCode(countryCode, phone) {
    // 验证手机号格式
    if (!phone || !/^\d{5,15}$/.test(phone)) {
        showMessage('请输入有效的手机号码');
        return;
    }
    
    // 显示发送中状态
    const sendButton = document.querySelector('.send-code-btn');
    if (sendButton) {
        const originalText = sendButton.textContent;
        sendButton.disabled = true;
        sendButton.textContent = '发送中...';
        
        // 调用API发送验证码
        fetch(`${API_BASE_URL}/sms/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ countryCode, phone })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showMessage('验证码已发送，请查收');
                
                // 倒计时禁用按钮
                let countdown = 60;
                sendButton.textContent = `重新发送(${countdown}s)`;
                
                const timer = setInterval(() => {
                    countdown--;
                    sendButton.textContent = `重新发送(${countdown}s)`;
                    
                    if (countdown <= 0) {
                        clearInterval(timer);
                        sendButton.disabled = false;
                        sendButton.textContent = originalText;
                    }
                }, 1000);
            } else {
                showMessage(data.message || '验证码发送失败');
                sendButton.disabled = false;
                sendButton.textContent = originalText;
            }
        })
        .catch(error => {
            console.error('发送验证码错误:', error);
            showMessage('网络错误，请稍后再试');
            sendButton.disabled = false;
            sendButton.textContent = originalText;
        });
    }
}

/**
 * 邮箱登录
 * @param {string} email 邮箱
 * @param {string} password 密码
 */
function loginWithEmail(email, password) {
    // 显示加载状态
    const loginButton = document.querySelector('#email-login-form button[type="submit"]');
    if (loginButton) {
        const originalText = loginButton.textContent;
        loginButton.disabled = true;
        loginButton.textContent = '登录中...';
        
        // 调用API登录
        fetch(`${API_BASE_URL}/login/email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // 存储JWT令牌
                storeAuthToken(data.token);
                
                // 存储用户信息
                if (data.user) {
                    localStorage.setItem('nexus_user', JSON.stringify(data.user));
                }
                
                showMessage('登录成功！');
                window.location.href = '/community.html';
            } else {
                showMessage(data.message || '邮箱或密码错误');
                loginButton.disabled = false;
                loginButton.textContent = originalText;
            }
        })
        .catch(error => {
            console.error('登录错误:', error);
            showMessage('网络错误，请稍后再试');
            loginButton.disabled = false;
            loginButton.textContent = originalText;
        });
    }
}

/**
 * 手机号登录
 * @param {string} countryCode 国家代码
 * @param {string} phone 手机号码
 * @param {string} code 验证码
 */
function loginWithPhone(countryCode, phone, code) {
    // 显示加载状态
    const loginButton = document.querySelector('#phone-login-form button[type="submit"]');
    if (loginButton) {
        const originalText = loginButton.textContent;
        loginButton.disabled = true;
        loginButton.textContent = '登录中...';
        
        // 调用API登录
        fetch(`${API_BASE_URL}/login/phone`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ countryCode, phone, code })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // 存储JWT令牌
                storeAuthToken(data.token);
                
                // 存储用户信息
                if (data.user) {
                    localStorage.setItem('nexus_user', JSON.stringify(data.user));
                }
                
                showMessage('登录成功！');
                window.location.href = '/community.html';
            } else {
                showMessage(data.message || '验证码错误或手机号未注册');
                loginButton.disabled = false;
                loginButton.textContent = originalText;
            }
        })
        .catch(error => {
            console.error('登录错误:', error);
            showMessage('网络错误，请稍后再试');
            loginButton.disabled = false;
            loginButton.textContent = originalText;
        });
    }
}

/**
 * 社交媒体登录
 * @param {string} socialType 社交媒体类型 (weixin, weibo, xiaohongshu)
 */
function loginWithSocial(socialType) {
    // 社交媒体平台名称
    const socialNameMap = {
        'weixin': '微信',
        'weibo': '微博',
        'xiaohongshu': '小红书'
    };
    
    // 模拟社交登录过程
    console.log('社交登录', socialType);
    
    if (socialType === 'weixin') {
        // 微信登录特殊处理 - 显示二维码
        showWeixinQrCodeLogin();
    } else {
        // 创建一个模拟的社交登录弹窗
        const socialLoginModal = document.createElement('div');
        socialLoginModal.className = 'social-login-modal';
        socialLoginModal.innerHTML = `
            <div class="social-login-content">
                <div class="social-login-header">
                    <h3>${socialNameMap[socialType]}授权登录</h3>
                    <button class="social-login-close">&times;</button>
                </div>
                <div class="social-login-body">
                    <div class="social-icon ${socialType}">
                        <i class="fab fa-${socialType === 'weibo' ? 'weibo' : 'book'}"></i>
                    </div>
                    <p>正在打开${socialNameMap[socialType]}授权页面...</p>
                    <div class="social-login-loading">
                        <div class="loading-spinner"></div>
                    </div>
                    <div class="social-login-buttons" style="display:none;">
                        <button class="btn-confirm">确认授权</button>
                        <button class="btn-cancel">取消</button>
                    </div>
                </div>
            </div>
        `;
        
        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .social-login-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }
            .social-login-content {
                background: linear-gradient(135deg, #1e293b, #0f172a);
                border-radius: 10px;
                width: 400px;
                max-width: 90%;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
                overflow: hidden;
            }
            .social-login-header {
                padding: 15px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            .social-login-header h3 {
                margin: 0;
                color: white;
                font-weight: 500;
            }
            .social-login-close {
                background: none;
                border: none;
                font-size: 24px;
                color: rgba(255, 255, 255, 0.6);
                cursor: pointer;
                transition: color 0.3s ease;
            }
            .social-login-close:hover {
                color: white;
            }
            .social-login-body {
                padding: 30px;
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
            }
            .social-icon {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                background-color: rgba(255, 255, 255, 0.1);
                display: flex;
                justify-content: center;
                align-items: center;
                margin-bottom: 20px;
                font-size: 40px;
            }
            .social-icon.weibo {
                color: #E6162D;
            }
            .social-icon.xiaohongshu {
                color: #FF2741;
            }
            .social-login-body p {
                color: white;
                margin: 15px 0;
            }
            .social-login-loading {
                margin: 20px 0;
            }
            .loading-spinner {
                border: 3px solid rgba(255, 255, 255, 0.1);
                border-radius: 50%;
                border-top: 3px solid #3498db;
                width: 30px;
                height: 30px;
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            .social-login-buttons {
                display: flex;
                gap: 10px;
                margin-top: 20px;
            }
            .social-login-buttons button {
                padding: 10px 20px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            .btn-confirm {
                background: linear-gradient(135deg, #3a7bd5, #00d2ff);
                color: white;
            }
            .btn-cancel {
                background: rgba(255, 255, 255, 0.1);
                color: white;
            }
            .btn-confirm:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
            }
            .btn-cancel:hover {
                background: rgba(255, 255, 255, 0.2);
            }
        `;
        
        // 添加到页面
        document.head.appendChild(style);
        document.body.appendChild(socialLoginModal);
        
        // 模拟登录过程
        setTimeout(() => {
            // 隐藏加载动画，显示按钮
            const loadingElement = socialLoginModal.querySelector('.social-login-loading');
            const buttonsElement = socialLoginModal.querySelector('.social-login-buttons');
            
            loadingElement.style.display = 'none';
            buttonsElement.style.display = 'flex';
            
            // 更新消息
            const messageElement = socialLoginModal.querySelector('p');
            messageElement.textContent = `请确认授权登录到 NexusOrbital`;
        }, 2000);
        
        // 绑定事件
        const closeButton = socialLoginModal.querySelector('.social-login-close');
        const confirmButton = socialLoginModal.querySelector('.btn-confirm');
        const cancelButton = socialLoginModal.querySelector('.btn-cancel');
        
        // 关闭按钮
        closeButton.addEventListener('click', () => {
            document.body.removeChild(socialLoginModal);
            document.head.removeChild(style);
        });
        
        // 取消按钮
        cancelButton.addEventListener('click', () => {
            document.body.removeChild(socialLoginModal);
            document.head.removeChild(style);
        });
        
        // 确认按钮
        confirmButton.addEventListener('click', () => {
            // 创建随机用户
            const randomId = Math.floor(Math.random() * 10000);
            const socialUser = {
                id: generateUUID(),
                username: `${socialType}_user_${randomId}`,
                socialType: socialType,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString()
            };
            
            // 保存用户
            let users = JSON.parse(localStorage.getItem('nexus_users') || '[]');
            users.push(socialUser);
            localStorage.setItem('nexus_users', JSON.stringify(users));
            
            // 生成令牌
            const token = generateFakeJWT(socialUser.username);
            storeAuthToken(token);
            
            // 删除模态框
            document.body.removeChild(socialLoginModal);
            document.head.removeChild(style);
            
            // 提示成功并跳转
            showMessage(`${socialNameMap[socialType]}授权登录成功！`);
            window.location.href = '/community.html';
        });
    }
}

/**
 * 社交媒体注册
 * @param {string} socialType 社交媒体类型 (weixin, weibo, xiaohongshu)
 */
function registerWithSocial(socialType) {
    // 复用社交媒体登录的功能
    loginWithSocial(socialType);
}

/**
 * 邮箱注册
 * @param {string} username 用户名
 * @param {string} email 邮箱
 * @param {string} password 密码
 */
function registerWithEmail(username, email, password) {
    // 显示加载状态
    const registerButton = document.querySelector('#email-register-form button[type="submit"]');
    if (registerButton) {
        const originalText = registerButton.textContent;
        registerButton.disabled = true;
        registerButton.textContent = '注册中...';
        
        // 调用API注册
        fetch(`${API_BASE_URL}/register/email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showMessage('注册成功，请登录');
                
                // 如果是在注册页面，跳转到登录页
                if (window.location.pathname.includes('register.html')) {
                    window.location.href = '/login.html';
                } else {
                    // 如果是在登录页的注册选项卡，切换到登录选项卡
                    const loginTab = document.querySelector('[data-tab="login"]');
                    if (loginTab) {
                        loginTab.click();
                    }
                    
                    // 重置表单
                    const form = document.getElementById('email-register-form');
                    if (form) form.reset();
                }
            } else {
                showMessage(data.message || '注册失败，请稍后重试');
                registerButton.disabled = false;
                registerButton.textContent = originalText;
            }
        })
        .catch(error => {
            console.error('注册错误:', error);
            showMessage('网络错误，请稍后再试');
            registerButton.disabled = false;
            registerButton.textContent = originalText;
        });
    }
}

/**
 * 手机号注册
 * @param {string} username 用户名
 * @param {string} countryCode 国家代码
 * @param {string} phone 手机号码
 * @param {string} code 验证码
 * @param {string} password 密码
 */
function registerWithPhone(username, countryCode, phone, code, password) {
    // 显示加载状态
    const registerButton = document.querySelector('#phone-register-form button[type="submit"]');
    if (registerButton) {
        const originalText = registerButton.textContent;
        registerButton.disabled = true;
        registerButton.textContent = '注册中...';
        
        // 调用API注册
        fetch(`${API_BASE_URL}/register/phone`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, countryCode, phone, code, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showMessage('注册成功，请登录');
                
                // 如果是在注册页面，跳转到登录页
                if (window.location.pathname.includes('register.html')) {
                    window.location.href = '/login.html';
                } else {
                    // 如果是在登录页的注册选项卡，切换到登录选项卡
                    const loginTab = document.querySelector('[data-tab="login"]');
                    if (loginTab) {
                        loginTab.click();
                    }
                    
                    // 重置表单
                    const form = document.getElementById('phone-register-form');
                    if (form) form.reset();
                }
            } else {
                showMessage(data.message || '注册失败，请稍后重试');
                registerButton.disabled = false;
                registerButton.textContent = originalText;
            }
        })
        .catch(error => {
            console.error('注册错误:', error);
            showMessage('网络错误，请稍后再试');
            registerButton.disabled = false;
            registerButton.textContent = originalText;
        });
    }
}

/**
 * 生成UUID
 * @returns {string} UUID
 */
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * 生成模拟JWT令牌
 * @param {string} username 用户名
 * @returns {string} JWT令牌
 */
function generateFakeJWT(username) {
    // 模拟JWT的结构
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ 
        sub: username, 
        name: username, 
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24小时过期
    }));
    const signature = btoa('fake_signature_' + Math.random().toString(36).substring(2));
    
    return `${header}.${payload}.${signature}`;
}

/**
 * 存储认证令牌
 * @param {string} token JWT令牌
 */
function storeAuthToken(token) {
    localStorage.setItem('nexus_auth_token', token);
}

/**
 * 获取认证令牌
 * @returns {string|null} JWT令牌
 */
function getAuthToken() {
    return localStorage.getItem('nexus_auth_token');
}

/**
 * 检查是否已登录
 * @returns {boolean} 是否已登录
 */
function isLoggedIn() {
    const token = getAuthToken();
    if (!token) return false;
    
    // 验证令牌是否过期
    try {
        // 解析JWT令牌，获取过期时间
        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = payload.exp;
        
        // 如果已过期，清除令牌并返回false
        if (exp && exp * 1000 < Date.now()) {
            clearAuthToken();
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('验证令牌出错', error);
        clearAuthToken();
        return false;
    }
}

/**
 * 清除认证令牌
 */
function clearAuthToken() {
    localStorage.removeItem('nexus_auth_token');
    localStorage.removeItem('nexus_user');
}

/**
 * 退出登录
 */
function logout() {
    clearAuthToken();
    showMessage('已退出登录');
    window.location.href = '/login.html';
}

/**
 * 获取当前用户信息
 * @returns {Object|null} 用户信息
 */
function getCurrentUser() {
    // 从本地存储获取用户信息
    const userJson = localStorage.getItem('nexus_user');
    if (userJson) {
        try {
            return JSON.parse(userJson);
        } catch (e) {
            console.error('解析用户信息出错:', e);
            return null;
        }
    }
    return null;
}

/**
 * 验证令牌
 * @returns {Promise<boolean>} 是否有效
 */
function verifyToken() {
    const token = getAuthToken();
    if (!token) return Promise.resolve(false);
    
    return fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.user) {
            // 更新存储的用户信息
            localStorage.setItem('nexus_user', JSON.stringify(data.user));
            return true;
        }
        
        // 如果验证失败，清除令牌
        clearAuthToken();
        return false;
    })
    .catch(error => {
        console.error('令牌验证错误:', error);
        // 出错时不要立即清除令牌，可能是网络问题
        return false;
    });
}

/**
 * 显示自定义消息
 * @param {string} message 消息内容
 */
function showMessage(message) {
    // 检查是否已存在消息框
    let messageBox = document.querySelector('.nexus-message-box');
    
    if (!messageBox) {
        // 创建消息框
        messageBox = document.createElement('div');
        messageBox.className = 'nexus-message-box';
        messageBox.innerHTML = `
            <div class="nexus-message-content">
                <div class="nexus-message-header">
                    <span>nexusorbital.com 提示</span>
                </div>
                <div class="nexus-message-body">
                    <p></p>
                </div>
                <div class="nexus-message-footer">
                    <button class="nexus-btn-confirm">确定</button>
                </div>
            </div>
        `;
        
        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .nexus-message-box {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.6);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
                animation: fadeIn 0.2s ease;
            }
            .nexus-message-content {
                background: linear-gradient(135deg, #1e293b, #0f172a);
                border-radius: 10px;
                width: 300px;
                max-width: 90%;
                overflow: hidden;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
            }
            .nexus-message-header {
                padding: 12px 15px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            .nexus-message-header span {
                color: rgba(255, 255, 255, 0.8);
                font-size: 14px;
            }
            .nexus-message-body {
                padding: 20px;
                color: white;
                text-align: center;
            }
            .nexus-message-body p {
                margin: 0;
                line-height: 1.5;
            }
            .nexus-message-footer {
                padding: 10px 15px 15px;
                display: flex;
                justify-content: center;
            }
            .nexus-btn-confirm {
                background: linear-gradient(135deg, #3a7bd5, #00d2ff);
                border: none;
                border-radius: 5px;
                color: white;
                padding: 8px 20px;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            .nexus-btn-confirm:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        `;
        
        // 添加到页面
        document.head.appendChild(style);
        document.body.appendChild(messageBox);
        
        // 绑定事件
        const confirmBtn = messageBox.querySelector('.nexus-btn-confirm');
        confirmBtn.addEventListener('click', function() {
            messageBox.remove();
            if (document.querySelectorAll('.nexus-message-box').length === 0) {
                document.head.removeChild(style);
            }
        });
    }
    
    // 更新消息内容
    messageBox.querySelector('.nexus-message-body p').textContent = message;
}

// 页面加载时检查登录状态
document.addEventListener('DOMContentLoaded', function() {
    // 全局标志，控制社区页面是否需要登录检查
    window.disableCommunityLoginCheck = true;
    
    // 在需要登录的页面检查登录状态
    const requiresAuth = [
        '/profile.html',
        '/dashboard.html'
    ];
    
    const currentPath = window.location.pathname;
    
    // 检查是否是社区页面
    const isCommunityPage = currentPath.endsWith('/community.html') || 
                           currentPath.endsWith('/community-mobile.html');
    
    // 如果是社区页面且没有禁用登录检查，则加入到requiresAuth
    if (isCommunityPage && !window.disableCommunityLoginCheck) {
        requiresAuth.push('/community.html');
        requiresAuth.push('/community-mobile.html');
    }
    
    if (requiresAuth.some(path => currentPath.endsWith(path)) && !isLoggedIn()) {
        // 未登录，重定向到登录页
        window.location.href = '/login.html';
    }
    
    // 更新导航UI，显示用户信息或登录/注册链接
    updateNavigation();
});

/**
 * 更新导航UI
 */
function updateNavigation() {
    const userMenuContainer = document.querySelector('.user-menu-container');
    if (!userMenuContainer) return;
    
    if (isLoggedIn()) {
        // 已登录，显示用户信息
        const token = getAuthToken();
        const payload = token.split('.')[1];
        let username = 'User';
        
        try {
            const decoded = JSON.parse(atob(payload));
            username = decoded.name || 'User';
        } catch (e) {
            console.error('令牌解析错误', e);
        }
        
        userMenuContainer.innerHTML = `
            <div class="user-avatar">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${username}" alt="Avatar">
                <span class="user-name">${username}</span>
                <i class="fas fa-caret-down"></i>
            </div>
            <div class="user-dropdown">
                <a href="/profile.html"><i class="fas fa-user"></i> 个人主页</a>
                <a href="/dashboard.html"><i class="fas fa-tachometer-alt"></i> 控制台</a>
                <a href="#" id="logout-link"><i class="fas fa-sign-out-alt"></i> 退出</a>
            </div>
        `;
        
        // 绑定事件
        const closeButton = userMenuContainer.querySelector('.user-avatar');
        const userDropdown = userMenuContainer.querySelector('.user-dropdown');
        
        // 关闭按钮
        closeButton.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
        });
        
        // 点击其他地方关闭下拉菜单
        document.addEventListener('click', function() {
            userDropdown.classList.remove('active');
        });
        
        // 绑定退出事件
        document.getElementById('logout-link').addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    } else {
        // 未登录，显示登录/注册链接
        userMenuContainer.innerHTML = `
            <div class="auth-links">
                <a href="/login.html" class="btn-login">登录</a>
                <a href="/register.html" class="btn-register">注册</a>
            </div>
        `;
    }
}

/**
 * 显示微信二维码登录界面
 */
function showWeixinQrCodeLogin() {
    // 创建微信二维码登录窗口
    const weixinQrModal = document.createElement('div');
    weixinQrModal.className = 'weixin-qr-modal';
    weixinQrModal.innerHTML = `
        <div class="weixin-qr-content">
            <div class="weixin-qr-header">
                <h3>微信扫码登录</h3>
                <button class="weixin-qr-close">&times;</button>
            </div>
            <div class="weixin-qr-body">
                <div class="weixin-logo">
                    <i class="fab fa-weixin"></i>
                </div>
                <p>请使用微信扫描二维码登录</p>
                <div class="weixin-qrcode" id="wechat-qr-container">
                    <!-- 二维码将在这里显示 -->
                </div>
                <p class="weixin-qr-tips">扫码后请在微信中确认登录</p>
                <p class="weixin-qr-note">注意：这是模拟演示，完整功能需接入微信开放平台</p>
                <a href="docs/wechat-integration-guide.md" class="weixin-docs-link" target="_blank">查看完整微信接入指南 →</a>
            </div>
        </div>
    `;
    
    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
        .weixin-qr-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        .weixin-qr-content {
            background: linear-gradient(135deg, #1e293b, #0f172a);
            border-radius: 10px;
            width: 350px;
            max-width: 90%;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
            overflow: hidden;
        }
        .weixin-qr-header {
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .weixin-qr-header h3 {
            margin: 0;
            color: white;
            font-weight: 500;
        }
        .weixin-qr-close {
            background: none;
            border: none;
            font-size: 24px;
            color: rgba(255, 255, 255, 0.6);
            cursor: pointer;
            transition: color 0.3s ease;
        }
        .weixin-qr-close:hover {
            color: white;
        }
        .weixin-qr-body {
            padding: 30px;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
        }
        .weixin-logo {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background-color: #07C160;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 20px;
            font-size: 30px;
            color: white;
        }
        .weixin-qr-body p {
            color: white;
            margin: 10px 0;
        }
        .weixin-qrcode {
            margin: 15px 0;
            padding: 10px;
            background-color: white;
            border-radius: 5px;
            width: 220px;
            height: 220px;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .weixin-qrcode img {
            width: 200px;
            height: 200px;
            display: block;
        }
        .weixin-qr-tips {
            color: rgba(255, 255, 255, 0.7) !important;
            font-size: 14px;
        }
        .weixin-qr-note {
            color: rgba(255, 255, 255, 0.5) !important;
            font-size: 12px;
            margin-top: 20px !important;
        }
        .weixin-docs-link {
            margin-top: 15px;
            color: #3a7bd5;
            font-size: 14px;
            text-decoration: none;
            transition: all 0.3s ease;
        }
        .weixin-docs-link:hover {
            color: #00d2ff;
            text-decoration: underline;
        }
    `;
    
    // 添加到页面
    document.head.appendChild(style);
    document.body.appendChild(weixinQrModal);
    
    // 绑定关闭事件
    const closeButton = weixinQrModal.querySelector('.weixin-qr-close');
    closeButton.addEventListener('click', () => {
        qrLoginController.stop();
        document.body.removeChild(weixinQrModal);
        document.head.removeChild(style);
    });
    
    // 加载微信登录模块
    if (!window.WechatQrLogin) {
        const script = document.createElement('script');
        script.src = 'js/wechat-login.js';
        script.onload = () => {
            initWechatQrLogin();
        };
        document.head.appendChild(script);
    } else {
        initWechatQrLogin();
    }
    
    // 初始化微信登录
    function initWechatQrLogin() {
        const qrContainer = document.getElementById('wechat-qr-container');
        
        const qrLoginController = window.WechatQrLogin.start(
            qrContainer, 
            // 登录成功回调
            (loginData) => {
                // 创建随机用户
                const randomId = Math.floor(Math.random() * 10000);
                const weixinUser = {
                    id: generateUUID(),
                    username: loginData.userInfo?.nickname || `weixin_user_${randomId}`,
                    socialType: 'weixin',
                    avatar: loginData.userInfo?.avatar,
                    createdAt: new Date().toISOString(),
                    lastLogin: new Date().toISOString()
                };
                
                // 保存用户
                let users = JSON.parse(localStorage.getItem('nexus_users') || '[]');
                users.push(weixinUser);
                localStorage.setItem('nexus_users', JSON.stringify(users));
                
                // 保存后端返回的令牌（如果有实际后端）或生成本地令牌
                const token = loginData.token || generateFakeJWT(weixinUser.username);
                storeAuthToken(token);
                
                // 删除模态框
                document.body.removeChild(weixinQrModal);
                document.head.removeChild(style);
                
                // 提示成功并跳转
                showMessage('微信扫码登录成功！');
                window.location.href = '/community.html';
            },
            // 状态变化回调
            (status) => {
                console.log('微信登录状态:', status);
            }
        );
    }
}
