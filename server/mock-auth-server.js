/**
 * 认证系统模拟服务器
 * 用于本地测试各种认证场景，包括正常注册、错误处理等
 */
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// 创建Express应用
const app = express();
const PORT = 3099;

// 确保存储目录存在
const dataDir = path.join(__dirname, 'mockdata');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}
const usersFile = path.join(dataDir, 'users.json');

// 读取用户数据
function getUsers() {
    if (!fs.existsSync(usersFile)) {
        return [];
    }
    try {
        const data = fs.readFileSync(usersFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('读取用户数据出错:', error);
        return [];
    }
}

// 保存用户数据
function saveUsers(users) {
    try {
        fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf8');
    } catch (error) {
        console.error('保存用户数据出错:', error);
    }
}

// 中间件配置
app.use(bodyParser.json());
app.use(cors({
    origin: '*', // 允许所有来源
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 请求日志中间件
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    if (req.method === 'POST' || req.method === 'PUT') {
        console.log('请求体:', req.body);
    }
    next();
});

// 静态文件服务
app.use(express.static(path.join(__dirname, '..')));

// 注册API
app.post('/api/register', (req, res) => {
    console.log('收到注册请求:', req.body);
    
    const { username, email, password } = req.body;
    
    // 基本验证
    if (!username || !email || !password) {
        return res.status(400).json({
            success: false,
            message: '所有字段都是必填的'
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
    
    // 验证密码长度
    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: '密码长度至少为6个字符'
        });
    }
    
    // 检查用户是否已存在
    const users = getUsers();
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
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
        password: `hashed_${password}`, // 实际应用中应该使用bcrypt等工具进行加密
        createdAt: new Date().toISOString()
    };
    
    // 保存用户
    users.push(newUser);
    saveUsers(users);
    
    // 返回成功响应，不返回密码
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({
        success: true,
        message: '注册成功',
        user: userWithoutPassword
    });
});

// 登录API
app.post('/api/login', (req, res) => {
    console.log('收到登录请求:', req.body);
    
    const { email, password } = req.body;
    
    // 基本验证
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: '邮箱和密码是必填的'
        });
    }
    
    // 检查用户是否存在
    const users = getUsers();
    const user = users.find(user => user.email === email);
    if (!user) {
        return res.status(401).json({
            success: false,
            message: '邮箱或密码不正确'
        });
    }
    
    // 验证密码
    if (user.password !== `hashed_${password}`) {
        return res.status(401).json({
            success: false,
            message: '邮箱或密码不正确'
        });
    }
    
    // 返回成功响应
    const { password: _, ...userWithoutPassword } = user;
    res.json({
        success: true,
        message: '登录成功',
        user: userWithoutPassword,
        token: `mock_token_${user.id}` // 模拟JWT令牌
    });
});

// 获取用户信息API
app.get('/api/user', (req, res) => {
    // 这里应该验证令牌，但为了简单起见，直接返回成功响应
    res.json({
        success: true,
        user: {
            id: '12345',
            username: '测试用户',
            email: 'test@example.com'
        }
    });
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).json({
        success: false,
        message: '服务器内部错误'
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`模拟认证服务器运行在 http://localhost:${PORT}`);
    console.log(`静态文件根目录: ${path.join(__dirname, '..')}`);
    console.log(`注册API: http://localhost:${PORT}/api/register`);
    console.log(`登录API: http://localhost:${PORT}/api/login`);
    console.log(`用户API: http://localhost:${PORT}/api/user`);
});
