/**
 * 专用注册服务器
 * 仅用于测试和修复注册功能
 */
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

// 创建Express应用
const app = express();

// 所有请求的日志记录
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`\n[${timestamp}] ${req.method} ${req.url}`);
    console.log('请求头:', JSON.stringify(req.headers, null, 2));
    
    // 使用原始数据监听请求体
    let requestBody = '';
    req.on('data', chunk => {
        requestBody += chunk.toString();
    });
    
    req.on('end', () => {
        if (requestBody) {
            console.log('原始请求体:', requestBody);
            try {
                const jsonBody = JSON.parse(requestBody);
                console.log('解析后的请求体:', JSON.stringify(jsonBody, null, 2));
            } catch (e) {
                console.log('请求体不是有效的JSON');
            }
        }
    });
    
    // 记录响应
    const originalSend = res.send;
    res.send = function(body) {
        console.log(`[${timestamp}] 响应状态: ${res.statusCode}`);
        console.log(`响应体: ${body}`);
        originalSend.call(this, body);
    };
    
    next();
});

// CORS中间件 - 允许所有来源的请求
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 解析JSON请求体 - 注意：这必须在原始数据监听器之后
app.use(bodyParser.json({ 
    verify: (req, res, buf) => {
        req.rawBody = buf.toString();
    }
}));

// 解析URL编码的请求体
app.use(bodyParser.urlencoded({ extended: true }));

// 静态文件服务
app.use(express.static(path.join(__dirname, '..')));

// 用户数据
const users = [];

// API路由 - 测试
app.get('/api/test', (req, res) => {
    console.log('[测试请求] 收到测试API请求');
    res.json({
        success: true,
        message: '注册服务器正常运行',
        timestamp: new Date().toISOString()
    });
});

// API路由 - 注册
app.post('/api/register', (req, res) => {
    console.log('[注册请求] 收到注册API请求');
    console.log('[注册请求] 请求体:', req.body);
    
    try {
        // 获取请求数据
        const { username, email, password } = req.body;
        
        // 检查必填字段
        if (!username || !email || !password) {
            console.log('[注册请求] 缺少必填字段');
            return res.status(400).json({
                success: false,
                message: '请提供用户名、邮箱和密码'
            });
        }
        
        // 创建新用户
        const newUser = {
            id: Date.now().toString(),
            username,
            email,
            password: '***ENCRYPTED***', // 实际应用中应加密
            createdAt: new Date().toISOString()
        };
        
        // 保存用户
        users.push(newUser);
        
        console.log('[注册请求] 用户注册成功:', {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            createdAt: newUser.createdAt
        });
        
        // 返回成功响应
        res.status(201).json({
            success: true,
            message: '注册成功',
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email
            }
        });
    } catch (error) {
        console.error('[注册请求] 处理错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误，请稍后重试',
            error: error.message
        });
    }
});

// 处理错误的中间件
app.use((err, req, res, next) => {
    console.error('[错误]', err.stack);
    res.status(500).json({
        success: false,
        message: '服务器内部错误',
        error: err.message
    });
});

// 处理404错误
app.use((req, res) => {
    console.log(`[404] 未找到路由: ${req.method} ${req.url}`);
    res.status(404).json({
        success: false,
        message: '请求的API端点不存在'
    });
});

// 启动服务器
const PORT = 3050;
app.listen(PORT, () => {
    console.log(`专用注册服务器已启动，端口: ${PORT}`);
    console.log(`测试页面: http://localhost:${PORT}/api-test.html`);
});
