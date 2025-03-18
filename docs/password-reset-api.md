# NexusOrbital 密码重置 API 文档

本文档详细说明了 NexusOrbital 身份验证系统中的密码重置功能和 API 接口，包括请求重置验证码、验证代码和执行密码重置的完整流程。

## 1. API 端点概览

密码重置功能包括三个主要的 API 端点：

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/password-reset/request` | POST | 请求密码重置验证码 |
| `/api/password-reset/verify` | POST | 验证重置验证码 |
| `/api/password-reset/complete` | POST | 使用验证码完成密码重置 |

## 2. 请求密码重置验证码

### 端点
```
POST /api/password-reset/request
```

### 请求体
```json
{
  "email": "user@example.com"
}
```

### 参数说明
| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| email | string | 是 | 用户注册时使用的邮箱地址 |

### 响应
#### 成功响应 (200 OK)
```json
{
  "success": true,
  "message": "密码重置验证码已发送到您的邮箱，请查收"
}
```

#### 错误响应 (400 Bad Request)
```json
{
  "success": false,
  "message": "邮箱地址不能为空"
}
```

#### 错误响应 (404 Not Found)
```json
{
  "success": false,
  "message": "未找到该邮箱对应的用户账户"
}
```

#### 错误响应 (500 Internal Server Error)
```json
{
  "success": false,
  "message": "发送验证码失败，请稍后重试"
}
```

### 处理流程
1. 验证请求中的邮箱地址是否有效
2. 检查邮箱是否存在于系统中
3. 生成随机验证码
4. 设置验证码过期时间（默认30分钟）
5. 将验证码和关联信息存储在服务器
6. 通过邮件服务发送验证码到用户邮箱
7. 返回成功响应

## 3. 验证重置验证码

### 端点
```
POST /api/password-reset/verify
```

### 请求体
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

### 参数说明
| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| email | string | 是 | 用户邮箱地址 |
| code | string | 是 | 用户收到的验证码 |

### 响应
#### 成功响应 (200 OK)
```json
{
  "success": true,
  "message": "验证码验证成功，请设置新密码"
}
```

#### 错误响应 (400 Bad Request)
```json
{
  "success": false,
  "message": "邮箱地址或验证码不能为空"
}
```

#### 错误响应 (401 Unauthorized)
```json
{
  "success": false,
  "message": "验证码错误或已过期"
}
```

### 处理流程
1. 验证请求中的邮箱和验证码
2. 查找对应的验证码记录
3. 验证验证码是否正确
4. 检查验证码是否已过期
5. 返回验证结果

## 4. 完成密码重置

### 端点
```
POST /api/password-reset/complete
```

### 请求体
```json
{
  "email": "user@example.com",
  "code": "123456",
  "newPassword": "NewPassword123"
}
```

### 参数说明
| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| email | string | 是 | 用户邮箱地址 |
| code | string | 是 | 验证码 |
| newPassword | string | 是 | 新密码 |

### 响应
#### 成功响应 (200 OK)
```json
{
  "success": true,
  "message": "密码重置成功，请使用新密码登录"
}
```

#### 错误响应 (400 Bad Request)
```json
{
  "success": false,
  "message": "所有字段都必须填写"
}
```

#### 错误响应 (401 Unauthorized)
```json
{
  "success": false,
  "message": "验证码错误或已过期"
}
```

#### 错误响应 (400 Bad Request)
```json
{
  "success": false,
  "message": "密码必须至少包含8个字符，并包含大小写字母和数字"
}
```

### 处理流程
1. 验证请求中的所有字段
2. 验证验证码是否正确且未过期
3. 验证新密码是否符合密码策略
4. 更新用户密码
5. 使验证码失效
6. 发送密码已重置的确认邮件
7. 返回成功响应

## 5. 安全考虑

密码重置功能涉及账户安全，实施了以下安全措施：

### 5.1 验证码安全
- 验证码采用随机生成的6位数字
- 验证码有30分钟的有效期
- 验证码使用后立即失效
- 验证码存储在服务器端，不通过前端传递

### 5.2 API保护
- 请求速率限制，防止暴力破解
- 验证所有输入，防止注入攻击
- 适当的错误信息，不泄露敏感细节

### 5.3 密码策略
- 密码强度要求（长度、复杂性）
- 密码使用安全的哈希算法存储
- 不允许重复使用旧密码

## 6. 测试工具

为便于开发和测试，提供了以下工具：

### 6.1 密码重置测试页面
访问 `/password-reset-test` 可获取一个用于测试密码重置流程的交互式页面。

### 6.2 自动化测试脚本
使用 `server/test-password-reset.js` 脚本可以进行自动化测试，包括：
- API连接测试
- 验证码请求测试
- 验证码验证测试
- 密码重置测试

运行测试：
```bash
# 使用批处理文件运行测试
server/test-password-reset.bat

# 或直接使用Node.js运行
node server/test-password-reset.js
```

## 7. 前端集成

### 7.1 示例代码

```javascript
// 请求密码重置验证码
async function requestPasswordReset(email) {
    const response = await fetch('/api/password-reset/request', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
    });
    return await response.json();
}

// 验证验证码
async function verifyResetCode(email, code) {
    const response = await fetch('/api/password-reset/verify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, code })
    });
    return await response.json();
}

// 完成密码重置
async function completePasswordReset(email, code, newPassword) {
    const response = await fetch('/api/password-reset/complete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, code, newPassword })
    });
    return await response.json();
}
```

### 7.2 密码重置流程

前端实现密码重置功能时，推荐以下流程：

1. **第一步**: 收集用户邮箱并请求验证码
2. **第二步**: 用户输入验证码并进行验证
3. **第三步**: 验证通过后，用户设置新密码并提交

### 7.3 错误处理

前端应妥善处理可能的错误情况：
- 网络错误
- 用户不存在
- 验证码错误或过期
- 密码不符合要求

## 8. 常见问题

### Q: 如何处理用户未收到验证码的情况？
A: 建议提供"重新发送"功能，但应实施速率限制防止滥用。

### Q: 用户输入验证码错误多次怎么办？
A: 可以设置错误尝试次数限制，超过次数后锁定账户一段时间或要求用户联系支持。

### Q: 如何防止密码重置功能被用于账户枚举？
A: 无论邮箱是否存在，都返回相同的成功消息，并在服务器日志中记录可疑活动。
