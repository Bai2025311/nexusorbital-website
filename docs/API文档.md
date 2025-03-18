# NexusOrbital 认证系统API文档

## 目录
1. [基础信息](#基础信息)
2. [身份验证](#身份验证)
3. [API端点列表](#API端点列表)
4. [错误处理](#错误处理)
5. [社交媒体登录](#社交媒体登录)
6. [安全建议](#安全建议)

---

## 基础信息

### 基本URL
- 开发环境: `http://localhost:3000/api`
- 生产环境: 取决于部署URL，例如 `https://your-vercel-app.vercel.app/api`

### 请求格式
所有请求都应使用JSON格式的请求体，并设置请求头:
```
Content-Type: application/json
```

### 响应格式
所有API响应都使用JSON格式，基本结构如下:
```json
{
  "success": true/false,
  "message": "操作结果描述",
  "data": {
    // 可选，返回的数据
  },
  "error": {
    // 仅在失败时返回
    "code": "错误代码",
    "message": "错误详细信息"
  }
}
```

---

## 身份验证

### JWT认证
大多数API需要进行身份验证。身份验证使用Bearer令牌方式，在请求头中添加:

```
Authorization: Bearer <token>
```

其中`<token>`是用户登录或注册后获得的JWT令牌。

### 令牌有效期
默认情况下，JWT令牌有效期为24小时。

---

## API端点列表

### 1. 用户注册 - 邮箱

**端点:** `POST /register/email`

**描述:** 通过邮箱和密码注册新用户

**请求参数:**
```json
{
  "username": "用户名",
  "email": "user@example.com",
  "password": "密码"
}
```

**成功响应:** (HTTP 201)
```json
{
  "success": true,
  "message": "注册成功",
  "token": "eyJhbGc...",
  "user": {
    "id": "用户ID",
    "username": "用户名",
    "email": "user@example.com"
  }
}
```

**错误响应:**
- 400: 参数无效
- 409: 邮箱已注册

### 2. 用户登录 - 邮箱

**端点:** `POST /login/email`

**描述:** 通过邮箱和密码登录

**请求参数:**
```json
{
  "email": "user@example.com",
  "password": "密码"
}
```

**成功响应:** (HTTP 200)
```json
{
  "success": true,
  "message": "登录成功",
  "token": "eyJhbGc...",
  "user": {
    "id": "用户ID",
    "username": "用户名",
    "email": "user@example.com"
  }
}
```

**错误响应:**
- 400: 缺少必要参数
- 401: 邮箱或密码错误
- 404: 用户不存在

### 3. 发送短信验证码

**端点:** `POST /send-sms`

**描述:** 向指定手机号发送短信验证码

**请求参数:**
```json
{
  "countryCode": "86",
  "phone": "13800138000"
}
```

**成功响应:** (HTTP 200)
```json
{
  "success": true,
  "message": "验证码已发送",
  "expiresIn": 300
}
```

**开发环境响应:**
```json
{
  "success": true,
  "message": "验证码已发送",
  "expiresIn": 300,
  "code": "123456"  // 仅在开发环境返回
}
```

**错误响应:**
- 400: 缺少必要参数或手机号格式错误

### 4. 用户登录 - 手机号

**端点:** `POST /login/phone`

**描述:** 通过手机号和验证码登录

**请求参数:**
```json
{
  "countryCode": "86",
  "phone": "13800138000",
  "code": "123456"
}
```

**成功响应:** (HTTP 200)
```json
{
  "success": true,
  "message": "登录成功",
  "token": "eyJhbGc...",
  "user": {
    "id": "用户ID",
    "username": "用户名",
    "phone": "+8613800138000"
  }
}
```

**错误响应:**
- 400: 缺少必要参数
- 401: 验证码错误或已过期
- 404: 验证码不存在

### 5. 用户登录 - 微信

**端点:** `POST /login/wechat`

**描述:** 通过微信授权码登录

**请求参数:**
```json
{
  "code": "微信授权码"
}
```

**成功响应:** (HTTP 200)
```json
{
  "success": true,
  "message": "登录成功",
  "token": "eyJhbGc...",
  "user": {
    "id": "用户ID",
    "username": "用户名",
    "wechatId": "微信标识"
  }
}
```

**错误响应:**
- 400: 缺少必要参数
- 500: 微信服务器错误

### 6. 用户登录 - 微博

**端点:** `POST /login/weibo`

**描述:** 通过微博授权码登录

**请求参数:**
```json
{
  "code": "微博授权码"
}
```

**成功响应:** (HTTP 200)
```json
{
  "success": true,
  "message": "登录成功",
  "token": "eyJhbGc...",
  "user": {
    "id": "用户ID", 
    "username": "用户名",
    "weiboId": "微博标识"
  }
}
```

**错误响应:**
- 400: 缺少必要参数
- 500: 微博服务器错误

### 7. 用户登录 - 小红书

**端点:** `POST /login/xiaohongshu`

**描述:** 通过小红书授权码登录

**请求参数:**
```json
{
  "code": "小红书授权码"
}
```

**成功响应:** (HTTP 200)
```json
{
  "success": true,
  "message": "登录成功",
  "token": "eyJhbGc...",
  "user": {
    "id": "用户ID",
    "username": "用户名",
    "xhsId": "小红书标识"
  }
}
```

**错误响应:**
- 400: 缺少必要参数 
- 500: 小红书服务器错误

### 8. 验证令牌

**端点:** `GET /verify-token`

**描述:** 验证JWT令牌的有效性

**请求头:**
```
Authorization: Bearer <token>
```

**成功响应:** (HTTP 200)
```json
{
  "success": true,
  "message": "令牌有效",
  "user": {
    "id": "用户ID",
    "username": "用户名"
  }
}
```

**错误响应:**
- 401: 未提供认证令牌
- 403: 令牌无效或已过期

### 9. 健康检查

**端点:** `GET /health`

**描述:** 检查API服务的健康状态

**请求参数:** 无

**成功响应:** (HTTP 200)
```json
{
  "status": "ok",
  "time": "2023-07-01T12:34:56.789Z",
  "version": "1.0.0",
  "environment": "development"
}
```

---

## 错误处理

API使用标准HTTP状态码表示请求结果:

- 2xx: 成功
  - 200: 请求成功
  - 201: 资源创建成功

- 4xx: 客户端错误
  - 400: 请求参数有误
  - 401: 未授权访问
  - 403: 禁止访问
  - 404: 资源不存在
  - 409: 资源冲突

- 5xx: 服务器错误
  - 500: 服务器内部错误

错误响应格式:
```json
{
  "success": false,
  "message": "操作失败的简要描述",
  "error": {
    "code": "ERROR_CODE",
    "message": "详细错误信息"
  }
}
```

常见错误代码:

| 错误代码 | 描述 |
|---------|------|
| BAD_REQUEST | 请求参数缺失或格式错误 |
| UNAUTHORIZED | 未授权访问 |
| FORBIDDEN | 禁止访问 |
| NOT_FOUND | 请求的资源不存在 |
| CONFLICT | 资源冲突，如用户已存在 |
| INTERNAL_ERROR | 服务器内部错误 |

---

## 社交媒体登录

### 集成流程

社交媒体登录的一般流程如下:

1. 前端应用调用社交平台的OAuth接口，获取用户授权
2. 平台重定向回应用并提供授权码（code）
3. 前端应用将授权码传递给后端API
4. 后端API使用授权码交换用户令牌和信息
5. 后端创建或更新用户记录，并返回JWT令牌

### 配置要求

对于每个社交媒体平台，需要在配置文件中设置:

1. 客户端ID/应用ID
2. 客户端密钥
3. 重定向URI
4. API版本（如适用）

---

## 安全建议

1. **传输安全**: 始终使用HTTPS协议访问API
2. **令牌管理**: 不要在前端代码中硬编码令牌，避免在URL中传递敏感信息
3. **用户密码**: 客户端应该验证密码强度，服务器端会进行密码哈希处理
4. **API限流**: 对敏感API如登录尝试进行频率限制，避免暴力破解
5. **错误消息**: 生产环境不应返回详细的技术错误信息

---

## 文档版本

| 版本 | 日期 | 更新说明 |
|------|------|---------|
| 1.0.0 | 2023-07-01 | 初始文档 |
| 1.1.0 | 2023-08-15 | 添加社交媒体登录API |
| 1.2.0 | 2023-09-10 | 增加错误处理章节，更新API响应格式 |

---

如有任何问题或建议，请联系NexusOrbital技术支持团队。
