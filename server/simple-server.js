/**
 * 简化版认证服务器
 * 仅用于测试API功能
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// 创建Express应用
const app = express();

// 请求日志中间件
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// 使用中间件
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..')));

// 内存数据库
const users = [];

// API路由
app.post('/api/register/email', (req, res) => {
    console.log('收到注册请求:', JSON.stringify(req.body));
    
    try {
        const { username, email, password } = req.body;
        
        // 验证请求参数
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: '请提供用户名、邮箱和密码'
            });
        }
        
        // 验证邮箱格式
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: '邮箱格式不正确'
            });
        }
        
        // 验证密码强度
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: '密码长度不能少于6个字符'
            });
        }
        
        // 检查邮箱是否已被注册
        if (users.find(u => u.email === email)) {
            return res.status(409).json({
                success: false,
                message: '该邮箱已被注册'
            });
        }
        
        // 创建新用户
        const newUser = {
            id: Date.now().toString(),
            username,
            email,
            password: password, // 实际应用中应该哈希处理
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        console.log('用户注册成功:', { id: newUser.id, username, email });
        
        // 返回用户信息
        res.status(201).json({
            success: true,
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email
            },
            token: 'fake-jwt-token-' + newUser.id
        });
    } catch (error) {
        console.error('注册处理错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误，请稍后重试'
        });
    }
});

// 启动服务器
const PORT = 3030;
app.listen(PORT, () => {
    console.log(`简化版服务器已启动，端口: ${PORT}`);
    console.log(`测试URL: http://localhost:${PORT}/test-register.html`);
});
