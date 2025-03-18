/**
 * NexusOrbital综合解决方案
 * 集成前端和后端，解决邮箱注册问题
 */
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

// 创建Express应用
const app = express();

// 日志记录中间件
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`\n[${timestamp}] ${req.method} ${req.url}`);
    
    // 记录请求头和请求体
    if(req.method !== 'OPTIONS') {
        console.log('请求头:', JSON.stringify(req.headers, null, 2));
    }
    
    // 原始请求体捕获
    let requestBody = '';
    req.on('data', chunk => {
        requestBody += chunk.toString();
    });
    
    req.on('end', () => {
        if (requestBody) {
            console.log('原始请求体:', requestBody);
        }
    });
    
    // 修改响应发送方法，用于记录响应
    const originalSend = res.send;
    res.send = function(body) {
        console.log(`响应状态: ${res.statusCode}`);
        console.log(`响应体: ${body}`);
        return originalSend.call(this, body);
    };
    
    next();
});

// 配置CORS - 允许所有来源
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 解析JSON和URL编码请求体
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 静态文件服务
app.use(express.static(path.join(__dirname, '..')));

// 存储用户数据（测试用，实际应使用数据库）
const users = [];
const verificationCodes = {};

// 创建测试邮件发送器
const transporter = {
    sendMail(mailOptions, callback) {
        console.log('模拟发送邮件:', mailOptions);
        // 模拟成功发送
        setTimeout(() => {
            callback(null, {
                messageId: 'test-' + Date.now(),
                accepted: [mailOptions.to],
                response: '250 OK'
            });
        }, 500);
    }
};

// API路由 - 测试连接
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: '服务器连接正常',
        timestamp: new Date().toISOString()
    });
});

// API路由 - 邮箱注册
app.post('/api/register', (req, res) => {
    try {
        console.log('处理注册请求');
        console.log('请求体:', req.body);
        
        // 获取请求数据
        const { username, email, password } = req.body;
        
        // 检查必填字段
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: '请提供用户名、邮箱和密码'
            });
        }
        
        // 检查邮箱格式 (简单验证)
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                success: false,
                message: '邮箱格式不正确'
            });
        }
        
        // 检查是否已存在相同邮箱
        if (users.some(user => user.email === email)) {
            return res.status(400).json({
                success: false,
                message: '该邮箱已被注册'
            });
        }
        
        // 生成验证码
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        verificationCodes[email] = {
            code: verificationCode,
            expiry: Date.now() + (60 * 60 * 1000) // 1小时有效期
        };
        
        // 创建新用户
        const newUser = {
            id: Date.now().toString(),
            username,
            email,
            password: '***ENCRYPTED***', // 实际应使用bcrypt加密
            verified: false,
            createdAt: new Date().toISOString()
        };
        
        // 保存用户
        users.push(newUser);
        
        // 发送验证邮件
        const mailOptions = {
            from: 'noreply@nexusorbital.com',
            to: email,
            subject: 'NexusOrbital账号验证',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                    <h2 style="color: #3a7bd5;">欢迎加入NexusOrbital!</h2>
                    <p>您好, ${username}!</p>
                    <p>感谢您注册NexusOrbital。请使用以下验证码完成账户验证:</p>
                    <div style="background-color: #f9f9f9; padding: 10px; border-radius: 5px; font-size: 24px; text-align: center; letter-spacing: 5px; font-weight: bold;">
                        ${verificationCode}
                    </div>
                    <p>验证码有效期为1小时。</p>
                    <p>如果这不是您的操作，请忽略此邮件。</p>
                    <p>谢谢,<br>NexusOrbital团队</p>
                </div>
            `
        };
        
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('发送邮件失败:', error);
            } else {
                console.log('验证邮件已发送:', info.messageId);
            }
        });
        
        // 返回成功响应
        res.status(201).json({
            success: true,
            message: '注册成功，验证邮件已发送',
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email
            }
        });
        
    } catch (error) {
        console.error('注册处理错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误，请稍后重试',
            error: error.message
        });
    }
});

// API路由 - 验证邮箱
app.post('/api/verify/email', (req, res) => {
    try {
        const { email, code } = req.body;
        
        if (!email || !code) {
            return res.status(400).json({
                success: false,
                message: '请提供邮箱和验证码'
            });
        }
        
        // 检查验证码是否存在且有效
        const verification = verificationCodes[email];
        if (!verification) {
            return res.status(400).json({
                success: false,
                message: '验证码不存在'
            });
        }
        
        if (verification.expiry < Date.now()) {
            delete verificationCodes[email];
            return res.status(400).json({
                success: false,
                message: '验证码已过期'
            });
        }
        
        if (verification.code !== code) {
            return res.status(400).json({
                success: false,
                message: '验证码不正确'
            });
        }
        
        // 更新用户验证状态
        const user = users.find(u => u.email === email);
        if (user) {
            user.verified = true;
            console.log('用户验证成功:', user.email);
        }
        
        // 清除验证码
        delete verificationCodes[email];
        
        // 返回成功响应
        res.json({
            success: true,
            message: '邮箱验证成功'
        });
        
    } catch (error) {
        console.error('验证处理错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误，请稍后重试',
            error: error.message
        });
    }
});

// 创建专用的注册测试页面
const registerTestPage = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NexusOrbital邮箱注册测试</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f7fa;
        }
        h1 {
            color: #3a7bd5;
            text-align: center;
            margin-bottom: 30px;
        }
        .container {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 30px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
        }
        input {
            width: 100%;
            padding: 10px;
            font-size: 16px;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-sizing: border-box;
        }
        button {
            background: #3a7bd5;
            color: white;
            border: none;
            padding: 12px 20px;
            font-size: 16px;
            border-radius: 4px;
            cursor: pointer;
            width: 100%;
            transition: background 0.3s;
        }
        button:hover {
            background: #2c64b7;
        }
        .tabs {
            display: flex;
            margin-bottom: 20px;
        }
        .tab {
            flex: 1;
            padding: 10px;
            text-align: center;
            background: #eee;
            cursor: pointer;
        }
        .tab.active {
            background: #3a7bd5;
            color: white;
        }
        .tab-content {
            display: none;
        }
        .tab-content.active {
            display: block;
        }
        .response {
            margin-top: 20px;
            padding: 15px;
            background: #f5f5f5;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-family: monospace;
            white-space: pre-wrap;
        }
        .success {
            color: #2e7d32;
        }
        .error {
            color: #c62828;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>NexusOrbital邮箱注册测试</h1>
        
        <div class="tabs">
            <div class="tab active" data-tab="register">注册</div>
            <div class="tab" data-tab="verify">验证</div>
        </div>
        
        <div class="tab-content active" id="register-tab">
            <div class="form-group">
                <label for="username">用户名</label>
                <input type="text" id="username" value="testuser" placeholder="请输入用户名">
            </div>
            
            <div class="form-group">
                <label for="email">邮箱</label>
                <input type="email" id="email" value="test@example.com" placeholder="请输入邮箱">
            </div>
            
            <div class="form-group">
                <label for="password">密码</label>
                <input type="password" id="password" value="password123" placeholder="请输入密码">
            </div>
            
            <button id="register-btn">注册账号</button>
            
            <div class="response" id="register-response" style="display: none;"></div>
        </div>
        
        <div class="tab-content" id="verify-tab">
            <div class="form-group">
                <label for="verify-email">邮箱</label>
                <input type="email" id="verify-email" placeholder="请输入注册时使用的邮箱">
            </div>
            
            <div class="form-group">
                <label for="verify-code">验证码</label>
                <input type="text" id="verify-code" placeholder="请输入收到的验证码">
            </div>
            
            <button id="verify-btn">验证邮箱</button>
            
            <div class="response" id="verify-response" style="display: none;"></div>
        </div>
    </div>
    
    <script>
        // 切换选项卡
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', function() {
                // 移除所有活动状态
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                // 添加当前选项卡的活动状态
                this.classList.add('active');
                document.getElementById(this.dataset.tab + '-tab').classList.add('active');
            });
        });
        
        // 注册按钮点击事件
        document.getElementById('register-btn').addEventListener('click', async function() {
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const responseElement = document.getElementById('register-response');
            
            if (!username || !email || !password) {
                responseElement.textContent = '请填写所有字段';
                responseElement.className = 'response error';
                responseElement.style.display = 'block';
                return;
            }
            
            responseElement.textContent = '注册请求中...';
            responseElement.className = 'response';
            responseElement.style.display = 'block';
            
            try {
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, email, password })
                });
                
                const data = await response.json();
                responseElement.textContent = JSON.stringify(data, null, 2);
                
                if (data.success) {
                    responseElement.className = 'response success';
                    // 自动填充验证邮箱
                    document.getElementById('verify-email').value = email;
                    // 自动切换到验证选项卡
                    setTimeout(() => {
                        document.querySelector('.tab[data-tab="verify"]').click();
                    }, 1000);
                } else {
                    responseElement.className = 'response error';
                }
            } catch (error) {
                responseElement.textContent = '请求发生错误: ' + error.message;
                responseElement.className = 'response error';
            }
        });
        
        // 验证按钮点击事件
        document.getElementById('verify-btn').addEventListener('click', async function() {
            const email = document.getElementById('verify-email').value;
            const code = document.getElementById('verify-code').value;
            const responseElement = document.getElementById('verify-response');
            
            if (!email || !code) {
                responseElement.textContent = '请填写邮箱和验证码';
                responseElement.className = 'response error';
                responseElement.style.display = 'block';
                return;
            }
            
            responseElement.textContent = '验证请求中...';
            responseElement.className = 'response';
            responseElement.style.display = 'block';
            
            try {
                const response = await fetch('/api/verify/email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, code })
                });
                
                const data = await response.json();
                responseElement.textContent = JSON.stringify(data, null, 2);
                
                if (data.success) {
                    responseElement.className = 'response success';
                } else {
                    responseElement.className = 'response error';
                }
            } catch (error) {
                responseElement.textContent = '请求发生错误: ' + error.message;
                responseElement.className = 'response error';
            }
        });
    </script>
</body>
</html>
`;

// 专用注册测试路由
app.get('/email-register-test', (req, res) => {
    res.send(registerTestPage);
});

// 处理404错误
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: '请求的资源不存在'
    });
});

// 处理错误
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).json({
        success: false,
        message: '服务器内部错误',
        error: err.message
    });
});

// 启动服务器
const PORT = 3060;
app.listen(PORT, () => {
    console.log(`\n=====================================`);
    console.log(`NexusOrbital综合解决方案已启动，端口: ${PORT}`);
    console.log(`测试页面: http://localhost:${PORT}/email-register-test`);
    console.log(`=====================================\n`);
});
