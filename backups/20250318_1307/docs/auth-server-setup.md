# NexusOrbital 认证服务器安装指南

本文档提供了详细的步骤指导，帮助您安装、配置和启动NexusOrbital认证服务器。

## 系统要求

- **Node.js**: 版本 12.x 或更高
- **npm**: 版本 6.x 或更高
- **操作系统**: Windows、macOS 或 Linux

## 安装步骤

### 1. 安装 Node.js 和 npm

#### Windows

1. 访问 [Node.js官网](https://nodejs.org/)
2. 下载并安装最新的LTS版本
3. 完成安装后，打开命令提示符验证安装:
   ```bash
   node --version
   npm --version
   ```

#### macOS

1. 使用Homebrew安装:
   ```bash
   brew install node
   ```
2. 或者访问 [Node.js官网](https://nodejs.org/) 下载安装包

#### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install nodejs npm
```

### 2. 克隆或下载项目

```bash
git clone https://github.com/your-organization/nexusorbital-website.git
cd nexusorbital-website
```

### 3. 安装认证服务器依赖

```bash
cd server
npm install
```

### 4. 配置环境变量

在`server`目录中创建一个`.env`文件:

```
JWT_SECRET=your_secure_jwt_secret_key
SMS_API_KEY=your_sms_service_api_key
PORT=3000
NODE_ENV=development
```

> **注意**: 对于生产环境，确保使用强密钥并妥善保管。

### 5. 启动服务器

#### 开发环境

```bash
npm run dev
```

#### 生产环境

```bash
npm start
```

#### Windows快速启动

在`server`目录下双击`start-server.bat`文件。

### 6. 验证安装

服务器启动后，访问:

```
http://localhost:3000/api/health
```

如果一切正常，您应该看到:

```json
{
  "status": "ok",
  "message": "Authentication server is running",
  "version": "1.0.0"
}
```

## 服务器配置

### 配置选项

服务器配置可以通过环境变量或`.env`文件进行设置:

| 变量名 | 描述 | 默认值 |
|--------|------|--------|
| `PORT` | 服务器监听端口 | `3000` |
| `JWT_SECRET` | JWT令牌签名密钥 | (必须设置) |
| `JWT_EXPIRES_IN` | JWT令牌过期时间 | `"7d"` (7天) |
| `SMS_API_KEY` | SMS服务API密钥 | (必须设置) |
| `SMS_CODE_EXPIRES` | 验证码有效期(秒) | `300` (5分钟) |
| `NODE_ENV` | 环境设置 | `"development"` |

### 数据库配置

默认使用内存数据库，适合开发和测试。对于生产环境，需配置持久化数据库:

#### MongoDB配置

添加以下环境变量:

```
DB_TYPE=mongodb
MONGODB_URI=mongodb://username:password@host:port/database
```

#### MySQL配置

添加以下环境变量:

```
DB_TYPE=mysql
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=password
MYSQL_DATABASE=nexusorbital
```

## 集成前端

### 配置前端API基础URL

在`js/auth.js`文件中，确保`API_BASE_URL`变量指向正确的服务器地址:

```javascript
// 开发环境
const API_BASE_URL = 'http://localhost:3000/api';

// 生产环境
// const API_BASE_URL = '/api'; // 如果前后端部署在同一域名下
// const API_BASE_URL = 'https://api.nexusorbital.com'; // 如果使用独立API域名
```

## 生产环境部署

### 使用PM2部署

1. 全局安装PM2:
   ```bash
   npm install -g pm2
   ```

2. 启动服务:
   ```bash
   cd server
   pm2 start auth-server.js --name "nexus-auth"
   ```

3. 设置自动启动:
   ```bash
   pm2 startup
   pm2 save
   ```

### 使用Docker部署

1. 构建Docker镜像:
   ```bash
   docker build -t nexusorbital/auth-server .
   ```

2. 运行容器:
   ```bash
   docker run -d -p 3000:3000 \
     -e JWT_SECRET=your_secret \
     -e SMS_API_KEY=your_api_key \
     --name nexus-auth-server \
     nexusorbital/auth-server
   ```

## 常见问题

### 1. 端口已被占用

如果端口3000已被占用，可以通过环境变量指定不同端口:

```bash
PORT=3001 npm start
```

### 2. JWT令牌验证失败

- 确保`JWT_SECRET`在前后端保持一致
- 检查令牌是否过期
- 验证令牌格式是否正确

### 3. 验证码发送失败

- 检查`SMS_API_KEY`是否有效
- 确认SMS服务提供商账户状态
- 验证手机号格式是否正确

## 安全最佳实践

1. **定期更换密钥**: 定期更换JWT_SECRET以提高安全性
2. **HTTPS**: 在生产环境中使用HTTPS加密传输
3. **请求限制**: 为敏感API端点设置请求频率限制
4. **日志加密**: 确保日志中不包含敏感信息
5. **依赖更新**: 定期更新依赖项以修复安全漏洞

## 支持与联系

如有问题或需要支持，请联系:

- 开发团队邮箱: dev@nexusorbital.com
- 技术支持: support@nexusorbital.com

---

文档版本: v1.0  
最后更新: 2025-03-18
