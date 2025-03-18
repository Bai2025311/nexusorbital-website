# NexusOrbital 邮件服务 API 文档

本文档详细说明了NexusOrbital邮件服务的API接口和使用方法。邮件服务提供统一的接口，用于发送各类邮件，包括用户验证、密码重置和系统通知等。

## 1. 基础配置

### 1.1 引入和初始化

```javascript
const createEmailService = require('./email-service');
const { getEmailConfig } = require('./email-config');

// 获取当前环境配置
const emailConfig = getEmailConfig();

// 创建邮件服务实例
const emailService = createEmailService(emailConfig);
```

### 1.2 环境配置

邮件服务支持三种环境配置，可通过`NODE_ENV`环境变量指定：

| 环境 | 描述 | 特点 |
|------|------|------|
| `development` | 开发环境 | 使用控制台模拟邮件发送，详细日志输出 |
| `testing` | 测试环境 | 可使用测试邮件服务或回退到控制台模式 |
| `production` | 生产环境 | 使用真实邮件服务，最小化日志输出 |

可通过环境变量设置邮件服务凭据：

```bash
# Windows
set NEXUS_MAIL_USER=your-email@gmail.com
set NEXUS_MAIL_PASS=your-app-password

# Linux/Mac
export NEXUS_MAIL_USER=your-email@gmail.com
export NEXUS_MAIL_PASS=your-app-password
```

## 2. API 接口

### 2.1 发送通用邮件

用于发送自定义邮件内容。

```javascript
emailService.sendMail({
    to: 'recipient@example.com',
    subject: '邮件主题',
    text: '纯文本内容', // 或使用 html 属性发送HTML内容
    templateName: 'templateName', // 可选，使用预定义模板
    templateData: { key: 'value' } // 模板变量
}, (error, info) => {
    if (error) {
        console.error('邮件发送失败:', error);
    } else {
        console.log('邮件发送成功:', info.messageId);
    }
});
```

### 2.2 发送验证邮件

用于用户注册时发送验证码邮件。

```javascript
emailService.sendVerificationEmail(
    'user@example.com',  // 收件人邮箱
    'Username',          // 用户名
    (error, result) => {
        if (error) {
            console.error('验证邮件发送失败:', error);
        } else {
            console.log('验证码:', result.code);
            console.log('邮件ID:', result.info.messageId);
        }
    }
);
```

### 2.3 发送密码重置邮件

用于用户忘记密码时发送重置验证码。

```javascript
emailService.sendPasswordResetEmail(
    'user@example.com',  // 收件人邮箱
    'Username',          // 用户名
    (error, result) => {
        if (error) {
            console.error('密码重置邮件发送失败:', error);
        } else {
            console.log('重置码:', result.code);
            console.log('邮件ID:', result.info.messageId);
        }
    }
);
```

### 2.4 发送欢迎邮件

用于用户成功验证邮箱后发送欢迎邮件。

```javascript
emailService.sendWelcomeEmail(
    'user@example.com',  // 收件人邮箱
    'Username',          // 用户名
    (error, info) => {
        if (error) {
            console.error('欢迎邮件发送失败:', error);
        } else {
            console.log('邮件发送成功:', info.messageId);
        }
    }
);
```

### 2.5 生成验证码

可单独调用验证码生成功能。

```javascript
const verificationCode = emailService.generateVerificationCode(6); // 生成6位数字验证码
console.log('验证码:', verificationCode);
```

## 3. 邮件模板

邮件服务内置了几种常用的邮件模板：

### 3.1 验证邮件模板 (`verification`)

用于发送账户验证码，包含以下元素：
- 欢迎标题
- 用户名称个性化问候
- 突出显示的验证码
- 有效期说明
- 安全提示

### 3.2 密码重置模板 (`passwordReset`)

用于发送密码重置验证码，包含以下元素：
- 密码重置标题
- 用户名称个性化问候
- 突出显示的重置码
- 有效期说明
- 安全警告提示

### 3.3 欢迎邮件模板 (`welcome`)

用于发送账户激活后的欢迎邮件，包含以下元素：
- 欢迎标题
- 用户名称个性化问候
- 账户激活确认
- 平台介绍
- 获取帮助的方式

## 4. 自定义模板

可以通过以下方式使用自定义邮件模板：

```javascript
// 创建邮件服务时指定模板目录
const emailService = createEmailService({
    templatesDir: path.join(__dirname, 'email-templates')
});
```

模板目录中的模板文件命名规则为`{templateName}.html`，例如`verification.html`。

模板文件中可以使用`{{variable}}`语法来定义变量占位符，例如：

```html
<h2>您好，{{username}}!</h2>
<p>您的验证码是: {{code}}</p>
```

## 5. 高级用法

### 5.1 自定义邮件发送器

可根据需要配置不同的邮件发送服务：

```javascript
const emailService = createEmailService({
    service: 'sendgrid',  // 使用SendGrid服务
    auth: {
        user: 'apikey',
        pass: 'YOUR_SENDGRID_API_KEY'
    }
});
```

### 5.2 调整日志级别

可以根据需要调整日志输出级别：

```javascript
const emailService = createEmailService({
    logLevel: 'debug'  // 可选值: 'debug', 'info', 'error', 'none'
});
```

## 6. 发送密码重置邮件

### 请求方法

```javascript
emailService.sendPasswordResetEmail({
    to: 'user@example.com',
    name: '用户名',
    code: '123456',
    expires: '30分钟'
})
```

### 参数说明

| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| to | string | 是 | 收件人邮箱地址 |
| name | string | 否 | 用户名，默认使用邮箱前缀 |
| code | string | 是 | 密码重置验证码 |
| expires | string | 否 | 验证码有效期，默认为"30分钟" |

### 响应

返回一个Promise，解析为包含以下字段的对象：

```javascript
{
    success: true,
    messageId: '<message-id>',
    message: '密码重置邮件发送成功'
}
```

### 错误

当邮件发送失败时，返回的Promise将解析为：

```javascript
{
    success: false,
    error: '错误详情',
    message: '发送密码重置邮件失败'
}
```

### 邮件模板

密码重置邮件模板包含以下内容：

1. 问候语（使用用户名）
2. 重置验证码
3. 有效期说明
4. 安全提示
5. 帮助和支持信息

## 7. 错误处理与故障排除

### 7.1 常见错误

| 错误类型 | 可能原因 | 解决方法 |
|---------|---------|---------|
| 认证失败 | 邮件服务凭据不正确 | 检查用户名和密码是否正确 |
| 连接超时 | 网络问题或邮件服务器不可用 | 检查网络连接，稍后重试 |
| 邮件地址无效 | 收件人地址格式错误 | 验证邮箱格式是否正确 |
| 模板错误 | 模板文件不存在或格式错误 | 检查模板文件路径和内容 |

## 8. 最佳实践

1. **错误处理**：始终处理回调中的错误参数
2. **重试机制**：对于重要邮件，实现发送失败后的重试机制
3. **限流控制**：避免短时间内发送大量邮件触发服务限制
4. **敏感信息保护**：使用环境变量存储邮件服务凭据
5. **测试模式**：开发中使用`console`模式避免意外发送邮件
