# NexusOrbital 短信和邮件服务集成

本文档介绍了NexusOrbital认证系统中短信和邮件服务的集成步骤和使用方法。

## 功能特点

- **短信服务**：集成阿里云短信服务，用于发送手机验证码
- **邮件服务**：支持SendGrid和SMTP两种发送方式，用于发送验证码和欢迎邮件
- **灵活配置**：通过环境变量轻松切换不同的服务提供商
- **开发模式**：开发环境下支持模拟发送功能，便于测试

## 配置步骤

### 1. 阿里云短信服务配置

1. 访问[阿里云官网](https://www.aliyun.com/)注册账号
2. 开通短信服务并创建AccessKey
3. 在控制台创建短信签名和模板
4. 将以下信息添加到`.env`文件：
   ```
   ALIYUN_ACCESS_KEY_ID=your-access-key-id
   ALIYUN_ACCESS_KEY_SECRET=your-access-key-secret
   ALIYUN_SMS_SIGN_NAME=your-sign-name
   ALIYUN_SMS_TEMPLATE_CODE=your-template-code
   ```

### 2. 邮件服务配置

#### SendGrid配置（推荐）

1. 访问[SendGrid官网](https://sendgrid.com/)注册账号
2. 创建API密钥
3. 将以下信息添加到`.env`文件：
   ```
   EMAIL_PROVIDER=sendgrid
   EMAIL_FROM=your-verified-sender-email
   SENDGRID_API_KEY=your-api-key
   ```

#### SMTP配置（可选）

如果您有自己的SMTP服务器或使用其他邮件服务，可以配置SMTP：

1. 获取SMTP服务器信息
2. 将以下信息添加到`.env`文件：
   ```
   EMAIL_PROVIDER=smtp
   EMAIL_FROM=your-email
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-username
   SMTP_PASS=your-password
   ```

## 使用方法

### 短信服务

```javascript
const smsService = require('./services/sms-service');

// 发送短信验证码
try {
  const result = await smsService.sendSMS('13800138000', '123456', '86');
  console.log('短信发送成功:', result);
} catch (error) {
  console.error('短信发送失败:', error);
}
```

### 邮件服务

```javascript
const emailService = require('./services/email-service');

// 发送验证码邮件
try {
  const result = await emailService.sendVerificationEmail('user@example.com', '123456');
  console.log('验证码邮件发送成功:', result);
} catch (error) {
  console.error('验证码邮件发送失败:', error);
}

// 发送欢迎邮件
try {
  const result = await emailService.sendWelcomeEmail('user@example.com', 'Username');
  console.log('欢迎邮件发送成功:', result);
} catch (error) {
  console.error('欢迎邮件发送失败:', error);
}
```

## 开发环境模拟

在开发环境下，系统默认使用模拟发送功能：

- 短信验证码默认为 `123456`
- 验证码和邮件内容会在控制台输出，不会真正发送
- 可以通过设置环境变量来覆盖此行为

如需在开发环境使用真实服务，修改`.env`文件：

```
NODE_ENV=development
# 设置为false关闭邮件模拟
EMAIL_MOCK=false
```

## 注意事项

- 请妥善保管您的API密钥，不要将含有真实密钥的`.env`文件提交到版本控制系统
- 在生产环境中，请确保使用HTTPS保护API请求
- 验证码有效期默认为10分钟，可通过配置修改
