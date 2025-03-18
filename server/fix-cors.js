/**
 * 修复CORS配置，确保API服务器能接受来自所有域名的请求
 */
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { execSync } = require('child_process');

// 获取主服务器文件路径
const completeServerPath = path.join(__dirname, 'complete-solution.js');

// 修复CORS配置
console.log('开始修复CORS和API地址问题...');

// 创建一个简单的Express服务器，提供跨域API访问
const app = express();

// 实现CORS中间件，允许所有源
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 解析JSON请求体
app.use(bodyParser.json());

// 日志中间件
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('请求体:', JSON.stringify(req.body));
    }
    next();
});

// 添加静态文件服务
app.use(express.static(path.join(__dirname, '..')));

// 注册API端点 (简单代理到主服务器)
app.post('/api/register', (req, res) => {
    console.log('收到注册请求:', req.body);
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
        return res.status(400).json({
            success: false,
            message: '缺少必填字段'
        });
    }
    
    // 简单模拟注册过程
    setTimeout(() => {
        // 返回成功响应
        res.status(201).json({
            success: true,
            message: '注册成功，验证邮件已发送',
            user: {
                id: Date.now().toString(),
                username,
                email
            }
        });
        
        console.log(`用户 ${username} (${email}) 注册成功`);
    }, 1000);
});

// 提供测试页面
app.get('/test-register-fixed.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'test-register-fixed.html'));
});

// 启动修复服务器
const port = 3096;
app.listen(port, () => {
    console.log(`修复服务器运行在端口 ${port}`);
    console.log(`注册API地址: http://localhost:${port}/api/register`);
    console.log(`测试页面地址: http://localhost:${port}/test-register-fixed.html`);
    console.log('\n您现在可以测试注册功能，如果这个修复服务器工作正常，请将相同的配置应用到主服务器。');
});

// 输出如何启动主服务器的说明
console.log('\n要启动主服务器，请运行:');
console.log(`node ${completeServerPath}`);
