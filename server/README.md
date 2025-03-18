# NexusOrbital 认证服务器

这是 NexusOrbital 网站的用户认证服务器，提供真实的邮箱和手机号注册与登录功能。

## 功能

- 邮箱注册和登录
- 手机号注册和登录
- 短信验证码发送与验证
- JWT令牌认证
- 用户会话管理

## 安装与运行

### 前提条件

- Node.js (版本 12 或更高)
- npm (通常随 Node.js 一起安装)

### 安装依赖

```bash
cd server
npm install
```

### 启动服务器

#### Windows

双击 `start-server.bat` 或运行:

```bash
cd server
npm start
```

#### macOS/Linux

```bash
cd server
npm start
```

服务器默认在 http://localhost:3000 上运行。

## API 接口

### 用户注册

- **邮箱注册**: `POST /api/register/email`
  - 参数: `username`, `email`, `password`

- **手机号注册**: `POST /api/register/phone`
  - 参数: `username`, `countryCode`, `phone`, `code`, `password`

### 用户登录

- **邮箱登录**: `POST /api/login/email`
  - 参数: `email`, `password`

- **手机号登录**: `POST /api/login/phone`
  - 参数: `countryCode`, `phone`, `code`

### 验证码

- **发送短信验证码**: `POST /api/sms/send`
  - 参数: `countryCode`, `phone`

### 认证

- **验证令牌**: `GET /api/auth/verify`
  - 请求头: `Authorization: Bearer {token}`

## 安全说明

当前实现为演示版本，使用内存数据库存储用户信息。在生产环境中，应该：

1. 使用真实数据库（如 MongoDB, MySQL）
2. 集成真实短信服务（如阿里云, 腾讯云）
3. 使用 HTTPS 进行安全传输
4. 设置强密钥并存储在环境变量中
5. 实现请求限流以防止暴力攻击

## 测试账户

为方便测试，系统默认创建了两个测试账户:

- 邮箱账户: `test@example.com` / `password123`
- 手机账户: `+8613800138000` / `password123`

这些账户仅用于开发测试，不会在生产环境中创建。
