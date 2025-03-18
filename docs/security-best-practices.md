# NexusOrbital 安全最佳实践

本文档提供了NexusOrbital用户认证系统的安全最佳实践和建议，以确保系统在各种环境中都能保持高安全标准。

## 1. 密码存储和管理

### 1.1 密码哈希

所有用户密码必须使用安全的哈希算法处理后再存储:

```javascript
// 推荐的密码哈希实现
function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return { hash, salt };
}

function verifyPassword(password, hash, salt) {
    const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
}
```

### 1.2 密码复杂度要求

建议实施以下密码策略:

- 最小长度8个字符
- 包含至少一个大写字母
- 包含至少一个小写字母
- 包含至少一个数字或特殊字符
- 不允许使用常见密码或包含用户名

### 1.3 密码重置流程

密码重置应遵循以下安全实践:

- 验证码必须是随机生成的，长度至少6位
- 重置链接/验证码应有合理的过期时间（建议30分钟内）
- 重置成功后应立即通知用户
- 验证码使用后应立即失效

## 2. 用户会话管理

### 2.1 JWT令牌安全

在使用JWT时应遵循以下实践:

```javascript
// 生成JWT令牌
function generateToken(userId) {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
}

// 验证JWT令牌
function verifyToken(token) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
}
```

### 2.2 敏感操作的重新验证

对于敏感操作（如更改密码、更改邮箱等），即使用户已登录也应要求重新验证:

```javascript
// 示例: 更改密码前验证当前密码
app.post('/api/change-password', authenticate, (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = getUserById(req.userId);
    
    // 验证当前密码
    if (!verifyPassword(currentPassword, user.password, user.salt)) {
        return res.status(401).json({ success: false, message: '当前密码错误' });
    }
    
    // 更新密码
    // ...
});
```

### 2.3 会话超时

设置合理的会话超时时间:

- 普通会话: 1-24小时
- 记住登录: 最长30天
- 管理员会话: 较短时间，如1小时

## 3. API安全

### 3.1 输入验证

所有API输入必须进行严格验证:

```javascript
// 示例: 使用中间件验证输入
const validateRegistration = (req, res, next) => {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
        return res.status(400).json({ success: false, message: '所有字段都必填' });
    }
    
    if (username.length < 3 || username.length > 30) {
        return res.status(400).json({ success: false, message: '用户名长度应在3-30个字符之间' });
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ success: false, message: '邮箱格式无效' });
    }
    
    if (password.length < 8) {
        return res.status(400).json({ success: false, message: '密码长度至少为8个字符' });
    }
    
    next();
};

app.post('/api/register', validateRegistration, (req, res) => {
    // 处理注册请求
});
```

### 3.2 速率限制

对敏感API实施速率限制，防止暴力攻击:

```javascript
const rateLimit = require('express-rate-limit');

// 登录限制: 10分钟内最多5次尝试
const loginLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    message: { success: false, message: '尝试次数过多，请稍后再试' }
});

app.post('/api/login', loginLimiter, (req, res) => {
    // 处理登录请求
});

// 密码重置限制: 每小时每IP最多3次请求
const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: { success: false, message: '请求次数过多，请稍后再试' }
});

app.post('/api/password-reset/request', passwordResetLimiter, (req, res) => {
    // 处理密码重置请求
});
```

### 3.3 CSRF保护

为表单和API实施CSRF保护:

```javascript
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

// 生成CSRF令牌
app.get('/login', csrfProtection, (req, res) => {
    res.render('login', { csrfToken: req.csrfToken() });
});

// 验证CSRF令牌
app.post('/api/login', csrfProtection, (req, res) => {
    // 处理登录请求
});
```

## 4. 邮件服务安全

### 4.1 邮件凭据保护

保护邮件服务凭据:

```javascript
// 使用环境变量存储凭据
const emailConfig = {
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
};
```

### 4.2 验证邮件模板安全

确保验证邮件不包含敏感信息，并使用安全的链接格式:

- 避免在邮件中包含用户密码或其他敏感信息
- 使用HTTPS链接
- 提供清晰的安全提示
- 包含联系客服的方式

### 4.3 防止邮件滥用

防止邮件服务被滥用:

- 限制每个用户每天可以请求的验证邮件数量
- 监控异常的邮件发送模式
- 实施验证码或其他机制防止自动化注册

## 5. 密码重置安全最佳实践

### 5.1 验证码生成与存储

为确保密码重置验证码的安全性：

```javascript
// 生成安全的随机验证码
function generateResetCode() {
    // 生成6位数字验证码
    return Math.floor(100000 + Math.random() * 900000).toString();
    
    // 或使用更强的随机性（字母数字混合）
    // return crypto.randomBytes(3).toString('hex').toUpperCase();
}

// 安全存储验证码及其过期时间
function storeResetCode(email, code) {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30); // 30分钟有效期
    
    // 存储信息应包含：邮箱、验证码哈希值、过期时间、使用状态
    const resetToken = {
        email,
        codeHash: hashCode(code), // 存储哈希值而非明文
        expiresAt: expiresAt.toISOString(),
        used: false
    };
    
    // 将令牌保存到数据库
    saveResetToken(resetToken);
    
    return resetToken;
}
```

### 5.2 验证码验证流程

正确的验证码验证流程应包含：

```javascript
// 验证重置验证码
function verifyResetCode(email, inputCode) {
    // 查找该邮箱最新的未使用验证码
    const resetToken = findLatestResetToken(email);
    
    // 检查验证码是否存在
    if (!resetToken) {
        return { valid: false, reason: 'no_code_found' };
    }
    
    // 检查验证码是否已被使用
    if (resetToken.used) {
        return { valid: false, reason: 'code_already_used' };
    }
    
    // 检查验证码是否过期
    const now = new Date();
    if (new Date(resetToken.expiresAt) < now) {
        return { valid: false, reason: 'code_expired' };
    }
    
    // 验证码是否匹配
    if (!verifyCodeHash(inputCode, resetToken.codeHash)) {
        return { valid: false, reason: 'code_invalid' };
    }
    
    // 验证通过
    return { valid: true, resetToken };
}
```

### 5.3 密码重置后的安全措施

完成密码重置后应采取以下安全措施：

```javascript
// 完成密码重置流程
function completePasswordReset(email, resetToken, newPassword) {
    // 标记验证码为已使用
    markResetTokenAsUsed(resetToken.id);
    
    // 更新用户密码
    const { hash, salt } = hashPassword(newPassword);
    updateUserPassword(email, hash, salt);
    
    // 撤销所有现有会话（可选，但建议）
    revokeAllUserSessions(email);
    
    // 发送密码更改通知邮件
    sendPasswordChangeNotification(email);
    
    return { success: true };
}
```

### 5.4 密码重置的安全审计

为密码重置操作实施审计日志：

```javascript
// 记录密码重置操作
function logPasswordResetActivity(email, action, success, ip, userAgent) {
    const log = {
        email,
        action, // 'request', 'verify', 'complete'
        timestamp: new Date().toISOString(),
        success,
        ip,
        userAgent,
    };
    
    // 保存日志
    saveSecurityLog(log);
}
```

## 6. 环境安全

### 6.1 生产环境配置

生产环境配置应遵循以下原则：

- 禁用详细错误信息
- 启用HTTPS
- 使用限制性的CORS策略
- 移除开发工具和测试路由

```javascript
// 生产环境配置示例
if (process.env.NODE_ENV === 'production') {
    // 严格的CORS设置
    app.use(cors({
        origin: 'https://nexusorbital.com',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }));
    
    // 强制HTTPS
    app.use((req, res, next) => {
        if (!req.secure) {
            return res.redirect(`https://${req.headers.host}${req.url}`);
        }
        next();
    });
    
    // 安全的错误处理
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    });
}
```

### 6.2 依赖安全

定期更新依赖并进行安全审计：

```bash
# 检查依赖安全性
npm audit

# 修复漏洞
npm audit fix

# 更新依赖
npm update
```

### 6.3 敏感信息处理

使用专用的工具管理敏感信息：

```javascript
// 使用dotenv加载环境变量
require('dotenv').config();

// 使用配置文件区分环境
const config = require(`./config.${process.env.NODE_ENV || 'development'}.js`);
```

## 7. 安全检查清单

项目上线前的安全检查清单：

- [ ] 所有密码使用安全的哈希算法存储
- [ ] 实施适当的密码策略
- [ ] JWT密钥安全存储且定期轮换
- [ ] 敏感API实施速率限制
- [ ] 所有用户输入经过验证和清理
- [ ] CSRF保护已实施
- [ ] 邮件服务凭据安全存储
- [ ] 生产环境使用HTTPS
- [ ] 错误处理不泄露敏感信息
- [ ] 依赖包已更新并通过安全审计
- [ ] 敏感配置使用环境变量存储
- [ ] 日志不记录敏感信息
- [ ] 禁用所有开发/测试工具和路由

## 8. 事件响应

安全事件处理流程：

1. **识别**: 确认潜在安全事件的范围和影响
2. **遏制**: 立即采取措施限制损害
3. **根除**: 移除安全漏洞
4. **恢复**: 恢复系统正常运行
5. **学习**: 分析事件原因并改进安全措施

### 8.1 安全事件联系人

建立明确的安全事件联系流程：

```
安全团队邮箱: security@nexusorbital.com
紧急联系电话: +1-XXX-XXX-XXXX
```

## 9. 合规性

根据业务需求，确保系统符合相关法规：

- **数据保护**: 遵循GDPR、CCPA等数据保护法规
- **行业标准**: 如适用，遵循PCI DSS等行业标准
- **隐私政策**: 确保系统操作符合公司隐私政策

## 10. 数据保护

### 10.1 数据最小化原则

应用应遵循数据最小化原则：

- 只收集和存储必要的个人信息
- 设置适当的数据保留策略
- 为旧数据实施自动清理机制
- 提供用户数据导出和删除选项

### 10.2 传输中数据加密

确保所有数据传输使用TLS加密：

```javascript
// 强制使用HTTPS
app.use((req, res, next) => {
    if (!req.secure && process.env.NODE_ENV === 'production') {
        return res.redirect('https://' + req.headers.host + req.url);
    }
    next();
});

// 设置严格的安全头
app.use(helmet());
app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true }));
```

---

*最后更新: 2025年3月19日*
*版本: 1.0.0*

© 2025 NexusOrbital. 保留所有权利。
