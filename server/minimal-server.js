/**
 * 极简版认证服务器
 */
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// 中间件
app.use(cors({
    origin: '*',  // 允许所有来源的请求
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..')));

// 记录所有请求
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    if (req.method === 'POST') {
        console.log('请求体:', JSON.stringify(req.body));
    }
    next();
});

// 测试路由
app.get('/api/test', (req, res) => {
    console.log('收到GET测试请求');
    res.json({ success: true, message: '服务器正常运行' });
});

// 注册路由
app.post('/api/register', (req, res) => {
    console.log('收到注册请求:', JSON.stringify(req.body));
    res.json({ 
        success: true, 
        message: '注册成功', 
        user: { 
            id: '123', 
            username: req.body.username || 'test',
            email: req.body.email || 'test@example.com'
        } 
    });
});

// 启动服务器
const PORT = 3040;
app.listen(PORT, () => {
    console.log(`极简版服务器已启动，端口: ${PORT}`);
});
