# NexusOrbital API 参考文档

本文档详细描述了NexusOrbital认证系统的API接口，包括请求方法、参数、响应格式和示例代码。

## 基础信息

- **基础URL**: `http://localhost:3000/api` (开发环境)
- **内容类型**: `application/json`
- **认证方式**: JWT (Bearer Token)

## 认证相关API

### 注册

#### 邮箱注册

**端点**: `POST /register/email`

**请求体**:
```json
{
  "username": "用户名",
  "email": "example@domain.com",
  "password": "安全密码"
}
```

**响应**:
```json
{
  "success": true,
  "message": "注册成功",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "用户ID",
    "username": "用户名",
    "email": "example@domain.com"
  }
}
```

**错误响应**:
```json
{
  "success": false,
  "message": "该邮箱已被注册"
}
```

#### 手机号注册

**端点**: `POST /register/phone`

**请求体**:
```json
{
  "username": "用户名",
  "countryCode": "+86",
  "phone": "13800138000",
  "code": "123456",
  "password": "安全密码"
}
```

**响应**:
```json
{
  "success": true,
  "message": "注册成功",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "用户ID",
    "username": "用户名",
    "phone": "+8613800138000"
  }
}
```

**错误响应**:
```json
{
  "success": false,
  "message": "验证码错误或已过期"
}
```

### 登录

#### 邮箱登录

**端点**: `POST /login/email`

**请求体**:
```json
{
  "email": "example@domain.com",
  "password": "安全密码"
}
```

**响应**:
```json
{
  "success": true,
  "message": "登录成功",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "用户ID",
    "username": "用户名",
    "email": "example@domain.com"
  }
}
```

**错误响应**:
```json
{
  "success": false,
  "message": "邮箱或密码错误"
}
```

#### 手机号登录

**端点**: `POST /login/phone`

**请求体**:
```json
{
  "countryCode": "+86",
  "phone": "13800138000",
  "code": "123456"
}
```

**响应**:
```json
{
  "success": true,
  "message": "登录成功",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "用户ID",
    "username": "用户名",
    "phone": "+8613800138000"
  }
}
```

**错误响应**:
```json
{
  "success": false,
  "message": "验证码错误或已过期"
}
```

### 验证码

#### 发送短信验证码

**端点**: `POST /sms/send`

**请求体**:
```json
{
  "countryCode": "+86",
  "phone": "13800138000"
}
```

**响应**:
```json
{
  "success": true,
  "message": "验证码已发送",
  "expireIn": 300
}
```

**错误响应**:
```json
{
  "success": false,
  "message": "发送频率过高，请稍后再试"
}
```

### 认证

#### 验证令牌

**端点**: `GET /auth/verify`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**响应**:
```json
{
  "success": true,
  "message": "令牌有效",
  "user": {
    "id": "用户ID",
    "username": "用户名",
    "email": "example@domain.com"
  }
}
```

**错误响应**:
```json
{
  "success": false,
  "message": "令牌无效或已过期"
}
```

## 用户管理API

### 获取用户资料

**端点**: `GET /user/profile`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**响应**:
```json
{
  "success": true,
  "user": {
    "id": "用户ID",
    "username": "用户名",
    "email": "example@domain.com",
    "phone": "+8613800138000",
    "avatar": "头像URL",
    "createdAt": "2023-01-01T12:00:00Z",
    "lastLogin": "2023-01-02T10:30:00Z"
  }
}
```

**错误响应**:
```json
{
  "success": false,
  "message": "未授权访问"
}
```

### 更新用户资料

**端点**: `PUT /user/profile`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**请求体**:
```json
{
  "username": "新用户名",
  "avatar": "新头像URL"
}
```

**响应**:
```json
{
  "success": true,
  "message": "资料已更新",
  "user": {
    "id": "用户ID",
    "username": "新用户名",
    "avatar": "新头像URL"
  }
}
```

**错误响应**:
```json
{
  "success": false,
  "message": "用户名已被使用"
}
```

### 修改密码

**端点**: `PUT /user/password`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**请求体**:
```json
{
  "currentPassword": "当前密码",
  "newPassword": "新密码"
}
```

**响应**:
```json
{
  "success": true,
  "message": "密码已修改"
}
```

**错误响应**:
```json
{
  "success": false,
  "message": "当前密码错误"
}
```

## 错误代码

| 代码 | 描述 |
|------|------|
| 400 | 请求参数错误 |
| 401 | 未授权访问 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 409 | 资源冲突 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |

## 使用示例

### JavaScript (前端)

```javascript
// 邮箱注册
async function registerWithEmail(username, email, password) {
  try {
    const response = await fetch('http://localhost:3000/api/register/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, email, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // 存储JWT令牌
      localStorage.setItem('auth_token', data.token);
      return data.user;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('注册失败:', error);
    throw error;
  }
}

// 验证令牌
async function verifyToken(token) {
  try {
    const response = await fetch('http://localhost:3000/api/auth/verify', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('验证令牌失败:', error);
    return false;
  }
}
```

### Node.js (后端)

```javascript
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const app = express();

// 验证JWT中间件
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: '未提供认证令牌' 
    });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        message: '令牌无效或已过期' 
      });
    }
    
    req.user = user;
    next();
  });
}

// 获取用户资料API
app.get('/api/user/profile', authenticateToken, (req, res) => {
  // 用户信息已在req.user中
  const userId = req.user.id;
  
  // 从数据库获取用户完整信息
  getUserFromDatabase(userId)
    .then(user => {
      res.json({ 
        success: true, 
        user 
      });
    })
    .catch(error => {
      res.status(500).json({ 
        success: false, 
        message: '获取用户信息失败' 
      });
    });
});
```

## 安全建议

1. **始终使用HTTPS**: 在生产环境中，确保所有API通信都通过HTTPS进行，防止数据被截获。

2. **JWT令牌安全**: 
   - 设置合理的过期时间
   - 使用强密钥签名
   - 存储在HttpOnly Cookie中以防XSS攻击

3. **限制请求频率**: 实现速率限制以防止暴力攻击和DoS攻击。

4. **输入验证**: 对所有用户输入进行严格验证和清理，防止注入攻击。

5. **错误处理**: 生产环境中不要返回详细的错误堆栈信息，只返回必要的错误消息。

6. **依赖项更新**: 定期更新依赖项，修复已知的安全漏洞。

---

文档版本: v1.0  
最后更新: 2025-03-18
