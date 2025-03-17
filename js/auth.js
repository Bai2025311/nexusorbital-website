/**
 * 用户认证脚本
 * 包括登录、注册、验证码、JWT处理等功能
 */

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
                    // 禁用按钮并开始倒计时
                    const originalText = this.textContent;
                    this.disabled = true;
                    let countdown = 60;
                    
                    this.textContent = `${countdown}秒后重试`;
                    
                    const timer = setInterval(() => {
                        countdown--;
                        this.textContent = `${countdown}秒后重试`;
                        
                        if (countdown <= 0) {
                            clearInterval(timer);
                            this.disabled = false;
                            this.textContent = originalText;
                        }
                    }, 1000);
                    
                    // 发送短信验证码请求
                    sendVerificationCode(countryCode.value, phoneInput.value);
                } else {
                    alert('请输入有效的手机号码');
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
                    alert('请填写所有必填字段');
                }
            } else if (activeTab.id === 'phone-tab') {
                // 手机号登录
                const countryCode = document.getElementById('country-code').value;
                const phone = document.getElementById('phone').value;
                const code = document.getElementById('verification-code').value;
                
                if (countryCode && phone && code) {
                    loginWithPhone(countryCode, phone, code);
                } else {
                    alert('请填写所有必填字段');
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
                        alert('两次输入的密码不一致');
                    }
                } else {
                    alert('请填写所有必填字段');
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
                    alert('请填写所有必填字段');
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
    if (!phone || phone.length < 5) {
        alert('请输入有效的手机号码');
        return;
    }
    
    // 生成随机6位验证码
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 存储验证码到 sessionStorage，实际应用中应该由服务器生成并验证
    sessionStorage.setItem(`verification_code_${countryCode}${phone}`, verificationCode);
    
    // 显示验证码（在实际应用中应通过短信发送，这里为了测试方便直接显示）
    alert(`测试用验证码：${verificationCode}，已发送到 ${countryCode}${phone}`);
    
    console.log(`验证码 ${verificationCode} 已发送到 ${countryCode}${phone}`);
}

/**
 * 邮箱登录
 * @param {string} email 邮箱
 * @param {string} password 密码
 */
function loginWithEmail(email, password) {
    // 模拟API请求
    console.log('邮箱登录', email, password);
    
    // 从本地存储获取用户
    const users = JSON.parse(localStorage.getItem('nexus_users') || '[]');
    
    // 检查用户是否存在
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // 更新最后登录时间
        user.lastLogin = new Date().toISOString();
        localStorage.setItem('nexus_users', JSON.stringify(users));
        
        // 生成并存储 JWT
        const token = generateFakeJWT(user.username);
        storeAuthToken(token);
        
        alert('登录成功！');
        window.location.href = '/community.html';
    } else {
        alert('邮箱或密码错误');
    }
}

/**
 * 手机号登录
 * @param {string} countryCode 国家代码
 * @param {string} phone 手机号码
 * @param {string} code 验证码
 */
function loginWithPhone(countryCode, phone, code) {
    // 模拟API请求
    console.log('手机登录', countryCode, phone, code);
    
    // 从本地存储获取用户
    const users = JSON.parse(localStorage.getItem('nexus_users') || '[]');
    const phoneNumber = `${countryCode}${phone}`;
    
    // 简单验证验证码
    const storedCode = sessionStorage.getItem(`verification_code_${phoneNumber}`);
    if (code !== storedCode) { 
        alert('验证码错误');
        return;
    }
    
    // 检查用户是否存在
    const user = users.find(u => u.phone === phoneNumber);
    
    if (user) {
        // 更新最后登录时间
        user.lastLogin = new Date().toISOString();
        localStorage.setItem('nexus_users', JSON.stringify(users));
        
        // 生成并存储 JWT
        const token = generateFakeJWT(user.username);
        storeAuthToken(token);
        
        alert('登录成功！');
        window.location.href = '/community.html';
    } else {
        alert('手机号未注册');
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
                    <i class="fab fa-${socialType === 'weixin' ? 'weixin' : socialType === 'weibo' ? 'weibo' : 'book'}"></i>
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
        .social-icon.weixin {
            color: #07C160;
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
        alert(`${socialNameMap[socialType]}授权登录成功！`);
        window.location.href = '/community.html';
    });
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
    // 模拟API请求
    console.log('邮箱注册', username, email, password);
    
    // 获取已有用户
    let users = JSON.parse(localStorage.getItem('nexus_users') || '[]');
    
    // 检查用户名或邮箱是否已存在
    const userExists = users.some(user => user.username === username || user.email === email);
    if (userExists) {
        alert('用户名或邮箱已经被注册');
        return;
    }
    
    // 添加新用户
    const newUser = {
        id: generateUUID(),
        username: username,
        email: email,
        password: password, // 注意：实际应用中应该对密码进行加密
        createdAt: new Date().toISOString(),
        lastLogin: null
    };
    
    users.push(newUser);
    localStorage.setItem('nexus_users', JSON.stringify(users));
    
    // 注册成功
    alert('注册成功，请登录');
    window.location.href = '/login.html';
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
    // 模拟API请求
    console.log('手机注册', username, countryCode, phone, code, password);
    
    // 简单验证验证码
    const storedCode = sessionStorage.getItem(`verification_code_${countryCode}${phone}`);
    if (code !== storedCode) { 
        alert('验证码错误');
        return;
    }
    
    // 获取已有用户
    let users = JSON.parse(localStorage.getItem('nexus_users') || '[]');
    
    // 检查用户名或手机号是否已存在
    const phoneNumber = `${countryCode}${phone}`;
    const userExists = users.some(user => 
        user.username === username || 
        (user.phone && user.phone === phoneNumber)
    );
    
    if (userExists) {
        alert('用户名或手机号已经被注册');
        return;
    }
    
    // 添加新用户
    const newUser = {
        id: generateUUID(),
        username: username,
        phone: phoneNumber,
        password: password, // 注意：实际应用中应该对密码进行加密
        createdAt: new Date().toISOString(),
        lastLogin: null
    };
    
    users.push(newUser);
    localStorage.setItem('nexus_users', JSON.stringify(users));
    
    // 注册成功
    alert('注册成功，请登录');
    window.location.href = '/login.html';
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
    return !!getAuthToken();
}

/**
 * 清除认证令牌
 */
function clearAuthToken() {
    localStorage.removeItem('nexus_auth_token');
}

/**
 * 退出登录
 */
function logout() {
    clearAuthToken();
    window.location.href = '/login.html';
}

// 页面加载时检查登录状态
document.addEventListener('DOMContentLoaded', function() {
    // 在需要登录的页面检查登录状态
    const requiresAuth = [
        '/community.html',
        '/profile.html',
        '/dashboard.html'
    ];
    
    const currentPath = window.location.pathname;
    
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
        
        // 绑定退出事件
        document.getElementById('logout-link').addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
        
        // 绑定下拉菜单切换
        const userAvatar = document.querySelector('.user-avatar');
        const userDropdown = document.querySelector('.user-dropdown');
        
        userAvatar.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
        });
        
        // 点击其他地方关闭下拉菜单
        document.addEventListener('click', function() {
            userDropdown.classList.remove('active');
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
