/**
 * NexusOrbital认证系统服务器
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// 导入配置和错误处理模块
const config = require('./config');
const { errorMiddleware, asyncHandler, ErrorTypes } = require('./error-handler');
const socialAuth = require('./social-auth');

// 创建Express应用
const app = express();

// 使用中间件
app.use(cors(config.get('security.cors')));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..')));

// JWT密钥和过期时间
const JWT_SECRET = config.get('jwt.secret');
const TOKEN_EXPIRY = config.get('jwt.expiresIn');

// 内存数据库（仅用于开发，实际生产环境应使用数据库）
const db = {
  users: [],
  verificationCodes: []
};

// 身份验证中间件
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: '未提供认证令牌' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ success: false, message: '令牌无效或已过期' });
      }
      
      req.user = user;
      next();
    });
  } catch (error) {
    next(error);
  }
};

// API路由
const apiRouter = express.Router();

/**
 * @api {post} /register/email 用户注册 - 邮箱
 * @apiDescription 注册新用户账号（基于邮箱和密码）
 */
apiRouter.post('/register/email', asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  
  // 验证请求参数
  if (!username || !email || !password) {
    throw ErrorTypes.BAD_REQUEST('请提供用户名、邮箱和密码');
  }
  
  // 验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw ErrorTypes.BAD_REQUEST('邮箱格式不正确');
  }
  
  // 验证密码长度
  if (password.length < config.get('security.passwordMinLength')) {
    throw ErrorTypes.BAD_REQUEST(`密码长度至少为${config.get('security.passwordMinLength')}个字符`);
  }
  
  // 检查邮箱是否已注册
  if (db.users.find(u => u.email === email)) {
    throw ErrorTypes.CONFLICT('邮箱已注册');
  }
  
  // 哈希密码
  const hashedPassword = await bcrypt.hash(password, config.get('security.bcryptSaltRounds'));
  
  // 创建新用户
  const newUser = { 
    id: uuidv4(), 
    username, 
    email, 
    password: hashedPassword,
    createdAt: new Date().toISOString()
  };
  
  // 保存用户到数据库
  db.users.push(newUser);
  
  // 生成JWT令牌
  const token = jwt.sign(
    { id: newUser.id, username: newUser.username, email: newUser.email },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
  
  // 返回成功响应
  res.status(201).json({
    success: true,
    message: '注册成功',
    token,
    user: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email
    }
  });
}));

/**
 * @api {post} /login/email 用户登录 - 邮箱
 * @apiDescription 使用邮箱和密码登录
 */
apiRouter.post('/login/email', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  // 验证请求参数
  if (!email || !password) {
    throw ErrorTypes.BAD_REQUEST('请提供邮箱和密码');
  }
  
  // 在数据库中查找用户
  const user = db.users.find(u => u.email === email);
  
  // 检查用户是否存在
  if (!user) {
    throw ErrorTypes.NOT_FOUND('用户不存在');
  }
  
  // 验证密码
  const passwordValid = await bcrypt.compare(password, user.password);
  if (!passwordValid) {
    throw ErrorTypes.UNAUTHORIZED('密码错误');
  }
  
  // 生成JWT令牌
  const token = jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
  
  // 返回成功响应
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
}));

/**
 * @api {post} /send-sms 发送短信验证码
 * @apiDescription 向指定手机号发送短信验证码
 */
apiRouter.post('/send-sms', asyncHandler(async (req, res) => {
  const { countryCode, phone } = req.body;
  
  // 验证请求参数
  if (!countryCode || !phone) {
    throw ErrorTypes.BAD_REQUEST('请提供国家代码和手机号');
  }
  
  // 生成验证码（开发环境使用固定验证码，生产环境随机生成）
  const code = config.get('server.isDevelopment') 
    ? config.get('sms.defaultDevCode')
    : Math.floor(100000 + Math.random() * 900000).toString();
  
  // 计算过期时间
  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + config.get('sms.codeExpirySeconds'));
  
  // 保存验证码
  const verificationData = {
    countryCode,
    phone,
    code,
    expiresAt: expiresAt.toISOString()
  };
  
  // 删除之前的验证码
  const existingIndex = db.verificationCodes.findIndex(v => 
    v.countryCode === countryCode && v.phone === phone
  );
  
  if (existingIndex !== -1) {
    db.verificationCodes.splice(existingIndex, 1);
  }
  
  // 添加新的验证码
  db.verificationCodes.push(verificationData);
  
  // 在实际生产环境中，这里应该调用SMS服务发送验证码
  // 为了开发和测试方便，这里直接返回验证码
  
  const responseData = {
    success: true,
    message: '验证码已发送',
    expiresIn: config.get('sms.codeExpirySeconds')
  };
  
  // 只在开发环境返回验证码
  if (config.get('server.isDevelopment')) {
    responseData.code = code;
  }
  
  // 返回成功响应
  res.json(responseData);
}));

/**
 * @api {post} /login/phone 用户登录 - 手机号
 * @apiDescription 使用手机号和验证码登录
 */
apiRouter.post('/login/phone', asyncHandler(async (req, res) => {
  const { countryCode, phone, code } = req.body;
  
  // 验证请求参数
  if (!countryCode || !phone || !code) {
    throw ErrorTypes.BAD_REQUEST('请提供国家代码、手机号和验证码');
  }
  
  // 查找验证码
  const verificationData = db.verificationCodes.find(v => 
    v.countryCode === countryCode && v.phone === phone
  );
  
  // 检查验证码是否存在
  if (!verificationData) {
    throw ErrorTypes.NOT_FOUND('未找到验证码，请重新获取');
  }
  
  // 检查验证码是否过期
  if (new Date() > new Date(verificationData.expiresAt)) {
    throw ErrorTypes.UNAUTHORIZED('验证码已过期，请重新获取');
  }
  
  // 验证验证码
  if (verificationData.code !== code) {
    throw ErrorTypes.UNAUTHORIZED('验证码错误');
  }
  
  // 查找用户或创建新用户
  const fullPhone = `+${countryCode}${phone}`;
  let user = db.users.find(u => u.phone === fullPhone);
  
  if (!user) {
    // 创建新用户
    user = {
      id: uuidv4(),
      username: `用户${Math.floor(Math.random() * 10000)}`,
      phone: fullPhone,
      createdAt: new Date().toISOString()
    };
    
    // 保存用户到数据库
    db.users.push(user);
  }
  
  // 生成JWT令牌
  const token = jwt.sign(
    { id: user.id, username: user.username, phone: user.phone },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
  
  // 删除已使用的验证码
  const codeIndex = db.verificationCodes.findIndex(v => 
    v.countryCode === countryCode && v.phone === phone
  );
  
  if (codeIndex !== -1) {
    db.verificationCodes.splice(codeIndex, 1);
  }
  
  // 返回成功响应
  res.json({
    success: true,
    message: '登录成功',
    token,
    user: {
      id: user.id,
      username: user.username,
      phone: user.phone
    }
  });
}));

/**
 * @api {post} /login/wechat 用户登录 - 微信
 * @apiDescription 使用微信授权码登录
 */
apiRouter.post('/login/wechat', asyncHandler(async (req, res) => {
  const { code } = req.body;
  
  // 验证请求参数
  if (!code) {
    throw ErrorTypes.BAD_REQUEST('请提供微信授权码');
  }
  
  // 处理微信登录
  const result = await socialAuth.wechatLogin(code);
  
  // 返回登录结果
  res.json(result);
}));

/**
 * @api {post} /login/weibo 用户登录 - 微博
 * @apiDescription 使用微博授权码登录
 */
apiRouter.post('/login/weibo', asyncHandler(async (req, res) => {
  const { code } = req.body;
  
  // 验证请求参数
  if (!code) {
    throw ErrorTypes.BAD_REQUEST('请提供微博授权码');
  }
  
  // 处理微博登录
  const result = await socialAuth.weiboLogin(code);
  
  // 返回登录结果
  res.json(result);
}));

/**
 * @api {post} /login/xiaohongshu 用户登录 - 小红书
 * @apiDescription 使用小红书授权码登录
 */
apiRouter.post('/login/xiaohongshu', asyncHandler(async (req, res) => {
  const { code } = req.body;
  
  // 验证请求参数
  if (!code) {
    throw ErrorTypes.BAD_REQUEST('请提供小红书授权码');
  }
  
  // 处理小红书登录
  const result = await socialAuth.xiaohongshuLogin(code);
  
  // 返回登录结果
  res.json(result);
}));

/**
 * @api {get} /verify-token 验证令牌
 * @apiDescription 验证JWT令牌的有效性
 */
apiRouter.get('/verify-token', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: '令牌有效',
    user: req.user
  });
});

/**
 * @api {get} /health 健康检查
 * @apiDescription 检查API服务的健康状态
 */
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    version: config.get('api.version'),
    environment: config.get('server.env')
  });
});

// 挂载API路由
app.use('/api', apiRouter);

// 错误处理中间件
app.use(errorMiddleware);

// 启动服务器（如果不在Vercel环境中）
if (!config.get('server.isVercel')) {
  const PORT = config.get('server.port');
  app.listen(PORT, () => {
    console.log(`NexusOrbital认证服务器已启动，端口: ${PORT}`);
    console.log(`环境: ${config.get('server.env')}`);
    
    if (config.get('server.isDevelopment')) {
      console.log(`API测试页面: http://localhost:${PORT}/auth-test-page.html`);
    }
  });
}

// 导出Express应用
module.exports = app;
