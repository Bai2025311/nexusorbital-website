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
    // 模拟API请求
    console.log(`发送验证码到 ${countryCode}${phone}`);
    
    // 这里应该是实际的API调用
    // 使用Twilio或类似服务发送短信验证码
    /* 
    fetch('/api/send-sms', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            phone: `${countryCode}${phone}` 
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('验证码已发送', data);
    })
    .catch(error => {
        console.error('发送验证码失败:', error);
        alert('发送验证码失败，请稍后重试');
    });
    */
    
    // 为演示目的，假设验证码已发送
    alert(`验证码已发送到 ${countryCode}${phone}`);
}

/**
 * 邮箱登录
 * @param {string} email 邮箱
 * @param {string} password 密码
 */
function loginWithEmail(email, password) {
    // 模拟API请求
    console.log('邮箱登录', email, password);
    
    // 这里应该是实际的API调用
    /* 
    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            email: email,
            password: password 
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {
            // 保存JWT令牌
            storeAuthToken(data.token);
            
            // 跳转到主页或之前的页面
            window.location.href = data.redirectUrl || '/index.html';
        } else {
            alert('登录失败：' + (data.message || '未知错误'));
        }
    })
    .catch(error => {
        console.error('登录请求失败:', error);
        alert('登录失败，请稍后重试');
    });
    */
    
    // 为演示目的，模拟登录成功
    const fakeToken = generateFakeJWT(email);
    storeAuthToken(fakeToken);
    alert('登录成功！');
    window.location.href = '/community.html';
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
    
    // 这里应该是实际的API调用
    /* 
    fetch('/api/login/phone', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            phone: `${countryCode}${phone}`,
            code: code
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {
            // 保存JWT令牌
            storeAuthToken(data.token);
            
            // 跳转到主页或之前的页面
            window.location.href = data.redirectUrl || '/index.html';
        } else {
            alert('登录失败：' + (data.message || '未知错误'));
        }
    })
    .catch(error => {
        console.error('登录请求失败:', error);
        alert('登录失败，请稍后重试');
    });
    */
    
    // 为演示目的，模拟登录成功
    const fakeToken = generateFakeJWT(`${countryCode}${phone}`);
    storeAuthToken(fakeToken);
    alert('登录成功！');
    window.location.href = '/community.html';
}

/**
 * 社交媒体登录
 * @param {string} socialType 社交媒体类型 (weixin, weibo, xiaohongshu)
 */
function loginWithSocial(socialType) {
    // 模拟社交登录
    console.log('社交登录', socialType);
    
    // 这里应该是实际的第三方认证逻辑
    // 通常涉及跳转到第三方授权页面
    
    const socialNameMap = {
        'weixin': '微信',
        'weibo': '微博',
        'xiaohongshu': '小红书'
    };
    
    alert(`即将跳转到${socialNameMap[socialType]}进行授权登录`);
    
    // 为演示目的，模拟登录成功
    setTimeout(() => {
        const fakeToken = generateFakeJWT(`${socialType}_user`);
        storeAuthToken(fakeToken);
        alert('授权登录成功！');
        window.location.href = '/community.html';
    }, 1000);
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
    
    // 这里应该是实际的API调用
    /* 
    fetch('/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            email: email,
            password: password
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('注册成功，请登录');
            window.location.href = '/login.html';
        } else {
            alert('注册失败：' + (data.message || '未知错误'));
        }
    })
    .catch(error => {
        console.error('注册请求失败:', error);
        alert('注册失败，请稍后重试');
    });
    */
    
    // 为演示目的，模拟注册成功
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
    
    // 这里应该是实际的API调用
    /* 
    fetch('/api/register/phone', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            phone: `${countryCode}${phone}`,
            code: code,
            password: password
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('注册成功，请登录');
            window.location.href = '/login.html';
        } else {
            alert('注册失败：' + (data.message || '未知错误'));
        }
    })
    .catch(error => {
        console.error('注册请求失败:', error);
        alert('注册失败，请稍后重试');
    });
    */
    
    // 为演示目的，模拟注册成功
    alert('注册成功，请登录');
    window.location.href = '/login.html';
}

/**
 * 保存认证令牌
 * @param {string} token JWT令牌
 */
function storeAuthToken(token) {
    localStorage.setItem('auth_token', token);
    
    // 解析JWT获取用户信息
    const userData = parseJWT(token);
    localStorage.setItem('user_data', JSON.stringify(userData));
}

/**
 * 获取认证令牌
 * @returns {string|null} JWT令牌或null
 */
function getAuthToken() {
    return localStorage.getItem('auth_token');
}

/**
 * 清除认证令牌
 */
function clearAuthToken() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
}

/**
 * 检查用户是否已登录
 * @returns {boolean} 是否已登录
 */
function isLoggedIn() {
    const token = getAuthToken();
    if (!token) return false;
    
    // 检查令牌是否过期
    try {
        const payload = parseJWT(token);
        const expiry = payload.exp * 1000; // 转换为毫秒
        return Date.now() < expiry;
    } catch (e) {
        return false;
    }
}

/**
 * 解析JWT令牌
 * @param {string} token JWT令牌
 * @returns {object} JWT负载
 */
function parseJWT(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('解析JWT失败', e);
        return {};
    }
}

/**
 * 生成模拟JWT令牌（仅用于演示）
 * @param {string} identifier 用户标识符
 * @returns {string} 模拟JWT令牌
 */
function generateFakeJWT(identifier) {
    // 创建一个假的JWT头部
    const header = {
        alg: 'HS256',
        typ: 'JWT'
    };
    
    // 创建一个假的JWT负载
    const payload = {
        sub: `user_${Math.floor(Math.random() * 1000)}`,
        name: identifier,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 1天过期
    };
    
    // 将头部和负载转换为Base64Url
    const base64Header = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const base64Payload = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    
    // 在实际应用中，这里应该使用密钥生成签名
    // 但在前端演示中，我们只是创建一个虚拟签名
    const fakeSignature = btoa(`${identifier}_${Date.now()}`).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    
    // 将三部分组合成一个JWT令牌
    return `${base64Header}.${base64Payload}.${fakeSignature}`;
}
