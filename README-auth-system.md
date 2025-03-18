# NexusOrbital 认证系统

NexusOrbital认证系统是一个功能完整的用户身份验证解决方案，支持邮箱/密码和手机号/验证码两种登录方式，以及社交媒体登录选项。

## 功能特点

- 多种登录方式（邮箱、手机号、社交媒体）
- 安全的密码哈希和存储
- JWT令牌认证
- 邮箱验证功能
- 跨域请求支持
- 多环境配置
- 完整的API测试工具

## 快速开始

### 安装依赖

```bash
npm install express cors body-parser nodemailer jsonwebtoken bcrypt
```

### 启动服务器

**Windows:**
```bash
start-auth-server.bat
```

**Linux/Mac:**
```bash
export NODE_ENV=development
node server/start-auth-server.js
```

## 多环境配置

认证系统支持三种环境配置：

1. **开发环境** (`development`)
   - API基础URL: `http://localhost:3060/api`
   - 使用控制台模拟邮件发送
   - 详细日志记录

2. **测试环境** (`testing`)
   - API基础URL: `https://test-api.nexusorbital.com/api`
   - 使用测试邮件服务
   - 中等级别日志记录

3. **生产环境** (`production`)
   - API基础URL: `https://api.nexusorbital.com/api`
   - 使用真实邮件服务
   - 最小化日志记录

## 邮箱验证流程

1. 用户在注册表单提供信息
2. 系统向用户邮箱发送验证码
3. 用户输入验证码完成验证
4. 账号状态更新为已验证

## 邮件服务配置

在生产环境中，您需要配置真实的邮件服务。可以在启动服务器时提供以下环境变量：

```bash
export NEXUS_MAIL_USER=your-email@gmail.com
export NEXUS_MAIL_PASS=your-password-or-app-password
```

## API端点参考

### 用户注册

**请求：**
```
POST /api/register
Content-Type: application/json

{
  "username": "用户名",
  "email": "user@example.com",
  "password": "安全密码123"
}
```

**响应：**
```json
{
  "success": true,
  "message": "注册成功，验证邮件已发送",
  "user": {
    "id": "1234567890",
    "username": "用户名",
    "email": "user@example.com"
  }
}
```

### 邮箱验证

**请求：**
```
POST /api/verify/email
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456"
}
```

**响应：**
```json
{
  "success": true,
  "message": "邮箱验证成功",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 测试工具

### API测试页面

访问 `http://localhost:3060/email-register-test` 进行邮箱注册功能测试。

## 错误处理

认证系统提供统一的错误处理机制，确保用户收到友好的错误消息，同时开发人员能够获取详细的错误信息。

## 安全考虑

- 密码使用Bcrypt进行哈希处理
- 敏感信息不会在日志中显示
- JWT令牌具有过期机制
- 输入验证防止注入攻击

## 文档

详细的系统文档位于 `/docs` 目录：
- [认证系统最终报告](./docs/authentication-system-final-report.md)
- [API参考文档](./docs/api-reference.md)
- [服务器设置指南](./docs/auth-server-setup.md)

## 许可

© 2025 NexusOrbital团队
