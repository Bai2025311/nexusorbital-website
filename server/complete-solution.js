/**
 * NexusOrbital综合解决方案
 * 集成前端和后端，解决邮箱注册问题
 */
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const createEmailService = require('./email-service');
const { getEmailConfig } = require('./email-config');
const createPasswordResetService = require('./password-reset');

// 默认配置
const defaultConfig = {
    port: 3090,
    corsOrigin: '*', // 允许所有来源的请求
    dbPath: path.join(__dirname, '../data/users.json'),
    emailService: null,
    logLevel: 'info'
};

// 创建Express应用
const app = express();

// 请求日志中间件
app.use((req, res, next) => {
    if (defaultConfig.logLevel !== 'error') {
        console.log(`${new Date().toISOString()} [${req.method}] ${req.path}`);
        if (defaultConfig.logLevel === 'debug') {
            console.log('请求体:', JSON.stringify(req.body));
        }
    }
    next();
});

// 响应日志中间件
app.use((req, res, next) => {
    const originalSend = res.send;
    res.send = function(data) {
        if (defaultConfig.logLevel === 'debug') {
            try {
                const parsedData = JSON.parse(data);
                console.log(`${new Date().toISOString()} 响应 [${res.statusCode}]:`, JSON.stringify(parsedData));
            } catch (e) {
                console.log(`${new Date().toISOString()} 响应 [${res.statusCode}]: (非JSON数据)`);
            }
        }
        return originalSend.call(this, data);
    };
    next();
});

// 解析JSON和URL编码请求体
app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// 静态文件服务
app.use(express.static(path.join(__dirname, '..')));

// CORS配置
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 存储用户数据（测试用，实际应使用数据库）
const users = {};
const verificationCodes = {};

// 创建测试邮件发送器
const createTestEmailService = () => {
    return {
        sendMail: (mailOptions, callback) => {
            console.log('模拟发送邮件:', mailOptions);
            // 模拟成功发送
            setTimeout(() => {
                callback(null, {
                    messageId: 'test-' + Date.now(),
                    accepted: [mailOptions.to],
                    response: '250 OK'
                });
            }, 500);
        },
        sendVerificationEmail: (email, username, callback) => {
            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
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
            const emailService = createEmailService();
            emailService.sendMail(mailOptions, (error, info) => {
                if (error) {
                    callback(error);
                } else {
                    callback(null, { code: verificationCode });
                }
            });
        }
    };
};

// API路由 - 测试连接
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: '服务器连接正常',
        timestamp: new Date().toISOString()
    });
});

// API路由 - 注册用户（邮箱）
app.post('/api/register', (req, res) => {
    try {
        console.log('处理注册请求');
        console.log('请求体:', req.body);
        
        const { username, email, password } = req.body;
        
        // 验证输入
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: '缺少必填字段'
            });
        }
        
        // 验证邮箱格式
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: '邮箱格式无效'
            });
        }
        
        // 验证密码强度
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: '密码长度至少为8个字符'
            });
        }
        
        // 生成用户ID
        const userId = Date.now().toString();
        
        // 创建用户对象
        const user = {
            id: userId,
            username,
            email,
            password, // 注意：实际应用中应该哈希密码
            verified: false,
            createdAt: new Date().toISOString()
        };
        
        // 存储用户信息
        users[userId] = user;
        
        // 生成验证码
        const emailService = createTestEmailService();
        emailService.sendVerificationEmail(email, username, (error, result) => {
            if (error) {
                console.error('发送验证邮件失败:', error);
                return res.status(500).json({
                    success: false,
                    message: '发送验证邮件失败'
                });
            }
            
            // 存储验证码
            verificationCodes[email] = {
                code: result.code,
                expires: Date.now() + 3600000 // 1小时过期
            };
            
            // 返回成功响应
            return res.status(201).json({
                success: true,
                message: '注册成功，验证邮件已发送',
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                }
            });
        });
    } catch (error) {
        console.error('注册过程中出错:', error);
        return res.status(500).json({
            success: false,
            message: '服务器内部错误',
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
        
        if (verification.expires < Date.now()) {
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
        const user = users[Object.keys(users).find(key => users[key].email === email)];
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

// 测试页面路由
app.get('/email-register-test', (req, res) => {
    res.sendFile(path.join(__dirname, 'email-register-test.html'));
});

// 密码重置测试页面
app.get('/password-reset-test', (req, res) => {
    res.sendFile(path.join(__dirname, 'password-reset-test.html'));
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

// 导出启动服务器的函数
function startServer(customConfig = {}) {
    // 合并配置
    const config = { ...defaultConfig, ...customConfig };
    
    // 配置数据库路径
    const dbPath = config.dbPath;
    const dbDir = path.dirname(dbPath);
    
    // 确保数据目录存在
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }
    
    // 配置CORS - 使用配置的来源
    app.use(cors({
        origin: config.corsOrigin,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));
    
    // 如果没有配置邮件传输，创建一个控制台传输
    const emailService = config.emailService || createTestEmailService();
    
    // 创建API路由
    const apiRouter = express.Router();
    app.use('/api', apiRouter);

    // 初始化密码重置服务
    const passwordResetService = createPasswordResetService({
        dbPath: path.join(__dirname, '../data/reset_tokens.json'),
        emailService
    });

    // 简单日志记录器
    const logger = {
        info: (message) => console.log(`[INFO] ${new Date().toISOString()} - ${message}`),
        error: (message) => console.error(`[ERROR] ${new Date().toISOString()} - ${message}`),
        debug: (message) => {
            if (defaultConfig.logLevel === 'debug') {
                console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`);
            }
        }
    };

    // 导入密码重置API路由
    require('./reset-api-routes')(apiRouter, passwordResetService, users, () => {
        // 保存用户数据
        fs.writeFileSync(
            defaultConfig.dbPath,
            JSON.stringify(users, null, 2),
            'utf8'
        );
    }, logger);

    // 启动服务器
    app.listen(config.port, () => {
        console.log(`\n=====================================`);
        console.log(`NexusOrbital综合解决方案已启动，端口: ${config.port}`);
        console.log(`邮箱注册测试: http://localhost:${config.port}/email-register-test`);
        console.log(`密码重置测试: http://localhost:${config.port}/password-reset-test`);
        console.log(`=====================================\n`);
    }).on('error', (err) => {
        console.error(`启动服务器出错: ${err.message}`);
        process.exit(1);
    });

    return app;
}

// 直接启动（用于开发环境）
if (require.main === module) {
    startServer();
}

// 导出模块
module.exports = {
    startServer
};
