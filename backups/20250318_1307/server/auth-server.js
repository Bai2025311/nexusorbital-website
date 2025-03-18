/**
 * NexusOrbital认证服务器
 * 提供用户注册、登录、验证码等API
 */

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

// 配置常量
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'nexusorbital_jwt_secret_key';
const SMS_API_KEY = process.env.SMS_API_KEY || 'your_sms_api_key';
const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = '24h'; // 24小时过期

// 创建Express应用
const app = express();

// 中间件
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('../'));

// 简单的内存数据库，生产环境中应该使用真实数据库
const db = {
    users: [],
    verificationCodes: {}
};

// 日志中间件
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// 身份验证中间件
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).json({ success: false, message: '未提供认证令牌' });
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ success: false, message: '令牌无效或已过期' });
        req.user = user;
        next();
    });
}

/**
 * 生成安全的随机验证码
 * @returns {string} 6位数验证码
 */
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * 发送短信验证码（模拟）
 * @param {string} phoneNumber 完整手机号码（包含国家代码）
 * @param {string} code 验证码
 * @returns {Promise<boolean>} 发送结果
 */
async function sendSmsCode(phoneNumber, code) {
    // 在实际应用中，这里应该调用短信服务商的API
    console.log(`发送验证码 ${code} 到 ${phoneNumber}`);
    
    // 模拟API调用延迟
    return new Promise(resolve => {
        setTimeout(() => {
            // 存储验证码（5分钟有效）
            db.verificationCodes[phoneNumber] = {
                code: code,
                expiresAt: Date.now() + 5 * 60 * 1000 // 5分钟过期
            };
            resolve(true);
        }, 500);
    });
}

// API路由
// 1. 用户注册 - 邮箱
app.post('/api/register/email', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // 验证输入
        if (!username || !email || !password) {
            return res.status(400).json({ success: false, message: '缺少必要参数' });
        }
        
        if (password.length < 6) {
            return res.status(400).json({ success: false, message: '密码长度不能少于6位' });
        }
        
        // 检查用户名和邮箱是否已存在
        const existingUser = db.users.find(user => 
            user.username === username || user.email === email
        );
        
        if (existingUser) {
            return res.status(409).json({ success: false, message: '用户名或邮箱已被注册' });
        }
        
        // 密码加密
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        
        // 创建新用户
        const newUser = {
            id: uuidv4(),
            username,
            email,
            password: hashedPassword,
            createdAt: new Date().toISOString(),
            lastLogin: null
        };
        
        // 保存用户
        db.users.push(newUser);
        
        res.status(201).json({ success: true, message: '注册成功' });
    } catch (error) {
        console.error('注册失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

// 2. 用户注册 - 手机号
app.post('/api/register/phone', async (req, res) => {
    try {
        const { username, countryCode, phone, code, password } = req.body;
        
        // 验证输入
        if (!username || !countryCode || !phone || !code || !password) {
            return res.status(400).json({ success: false, message: '缺少必要参数' });
        }
        
        const phoneNumber = `${countryCode}${phone}`;
        
        // 验证验证码
        const verificationData = db.verificationCodes[phoneNumber];
        if (!verificationData || verificationData.code !== code || verificationData.expiresAt < Date.now()) {
            return res.status(400).json({ success: false, message: '验证码错误或已过期' });
        }
        
        // 检查用户名和手机号是否已存在
        const existingUser = db.users.find(user => 
            user.username === username || user.phone === phoneNumber
        );
        
        if (existingUser) {
            return res.status(409).json({ success: false, message: '用户名或手机号已被注册' });
        }
        
        // 密码加密
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        
        // 创建新用户
        const newUser = {
            id: uuidv4(),
            username,
            phone: phoneNumber,
            password: hashedPassword,
            createdAt: new Date().toISOString(),
            lastLogin: null
        };
        
        // 保存用户
        db.users.push(newUser);
        
        // 清除验证码
        delete db.verificationCodes[phoneNumber];
        
        res.status(201).json({ success: true, message: '注册成功' });
    } catch (error) {
        console.error('注册失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

// 3. 用户登录 - 邮箱
app.post('/api/login/email', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // 验证输入
        if (!email || !password) {
            return res.status(400).json({ success: false, message: '缺少必要参数' });
        }
        
        // 查找用户
        const user = db.users.find(u => u.email === email);
        
        if (!user) {
            return res.status(401).json({ success: false, message: '邮箱或密码错误' });
        }
        
        // 验证密码
        const passwordMatch = await bcrypt.compare(password, user.password);
        
        if (!passwordMatch) {
            return res.status(401).json({ success: false, message: '邮箱或密码错误' });
        }
        
        // 更新最后登录时间
        user.lastLogin = new Date().toISOString();
        
        // 生成JWT令牌
        const token = jwt.sign(
            { id: user.id, username: user.username }, 
            JWT_SECRET, 
            { expiresIn: TOKEN_EXPIRY }
        );
        
        res.json({ 
            success: true, 
            message: '登录成功', 
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('登录失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

// 4. 用户登录 - 手机号
app.post('/api/login/phone', async (req, res) => {
    try {
        const { countryCode, phone, code } = req.body;
        
        // 验证输入
        if (!countryCode || !phone || !code) {
            return res.status(400).json({ success: false, message: '缺少必要参数' });
        }
        
        const phoneNumber = `${countryCode}${phone}`;
        
        // 验证验证码
        const verificationData = db.verificationCodes[phoneNumber];
        if (!verificationData || verificationData.code !== code || verificationData.expiresAt < Date.now()) {
            return res.status(400).json({ success: false, message: '验证码错误或已过期' });
        }
        
        // 查找用户
        const user = db.users.find(u => u.phone === phoneNumber);
        
        if (!user) {
            return res.status(401).json({ success: false, message: '手机号未注册' });
        }
        
        // 更新最后登录时间
        user.lastLogin = new Date().toISOString();
        
        // 生成JWT令牌
        const token = jwt.sign(
            { id: user.id, username: user.username }, 
            JWT_SECRET, 
            { expiresIn: TOKEN_EXPIRY }
        );
        
        // 清除验证码
        delete db.verificationCodes[phoneNumber];
        
        res.json({ 
            success: true, 
            message: '登录成功', 
            token,
            user: {
                id: user.id,
                username: user.username,
                phone: phoneNumber
            }
        });
    } catch (error) {
        console.error('登录失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

// 5. 发送短信验证码
app.post('/api/sms/send', async (req, res) => {
    try {
        const { countryCode, phone } = req.body;
        
        // 验证输入
        if (!countryCode || !phone) {
            return res.status(400).json({ success: false, message: '缺少必要参数' });
        }
        
        // 验证手机号格式
        if (!/^\d{5,15}$/.test(phone)) {
            return res.status(400).json({ success: false, message: '无效的手机号码' });
        }
        
        const phoneNumber = `${countryCode}${phone}`;
        
        // 生成验证码
        const code = generateVerificationCode();
        
        // 发送验证码
        const sent = await sendSmsCode(phoneNumber, code);
        
        if (sent) {
            res.json({ success: true, message: '验证码发送成功' });
        } else {
            res.status(500).json({ success: false, message: '验证码发送失败' });
        }
    } catch (error) {
        console.error('发送验证码失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

// 6. 验证JWT令牌
app.get('/api/auth/verify', authenticateToken, (req, res) => {
    res.json({ 
        success: true, 
        user: {
            id: req.user.id,
            username: req.user.username
        }
    });
});

// 7. 测试用路由
app.get('/', (req, res) => {
    res.send('NexusOrbital认证服务器已启动');
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`认证服务器已在端口 ${PORT} 上启动`);
    console.log(`访问 http://localhost:${PORT} 测试服务器状态`);
});

// 添加一些测试用户（仅用于开发环境）
async function addDemoUsers() {
    if (process.env.NODE_ENV !== 'production') {
        try {
            // 测试邮箱用户
            const hashedPasswordEmail = await bcrypt.hash('password123', SALT_ROUNDS);
            db.users.push({
                id: uuidv4(),
                username: 'testuser',
                email: 'test@example.com',
                password: hashedPasswordEmail,
                createdAt: new Date().toISOString(),
                lastLogin: null
            });
            
            // 测试手机用户
            const hashedPasswordPhone = await bcrypt.hash('password123', SALT_ROUNDS);
            db.users.push({
                id: uuidv4(),
                username: 'phoneuser',
                phone: '+8613800138000',
                password: hashedPasswordPhone,
                createdAt: new Date().toISOString(),
                lastLogin: null
            });
            
            console.log('已添加测试用户');
        } catch (error) {
            console.error('添加测试用户失败:', error);
        }
    }
}

// 初始化测试用户
addDemoUsers();

module.exports = app; // 导出应用，用于测试
