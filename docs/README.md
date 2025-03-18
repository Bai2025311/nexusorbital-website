# NexusOrbital 身份验证系统文档中心

欢迎使用NexusOrbital身份验证系统文档中心。本文档集合提供了系统的详细信息、API接口说明、安全最佳实践和使用指南。

## 文档目录

### 系统概述

- [认证系统最终报告](authentication-system-final-report.md) - 系统功能和技术实现的总体概述

### API 文档

- [邮件服务 API](email-service-api.md) - 邮件服务的配置和使用方法
- [密码重置 API](password-reset-api.md) - 密码重置功能的API端点和使用指南

### 最佳实践

- [安全最佳实践](security-best-practices.md) - 系统安全实施和建议

## 快速开始

1. 克隆仓库
   ```bash
   git clone https://github.com/yourusername/nexusorbital-website.git
   cd nexusorbital-website
   ```

2. 安装依赖
   ```bash
   npm install
   ```

3. 启动服务器
   ```bash
   # 方法1: 使用启动脚本
   start-server.bat
   
   # 方法2: 直接使用Node.js
   node server/complete-solution.js
   ```

4. 访问测试页面
   - 邮箱注册测试: http://localhost:3080/email-register-test
   - 密码重置测试: http://localhost:3080/password-reset-test

## 测试工具

- 密码重置测试: `server/test-password-reset.bat`
- API测试: `server/test-api.bat`

## 文件结构

```
nexusorbital-website/
├── data/                  # 数据存储目录
├── docs/                  # 文档目录
│   ├── authentication-system-final-report.md
│   ├── email-service-api.md
│   ├── password-reset-api.md
│   ├── security-best-practices.md
│   └── README.md          # 本文档
├── server/                # 服务器代码
│   ├── api-test.js        # API测试脚本
│   ├── complete-solution.js # 主服务器文件
│   ├── email-config.js    # 邮件配置
│   ├── email-register-test.html # 邮箱注册测试页面
│   ├── email-service.js   # 邮件服务
│   ├── error-handler.js   # 错误处理
│   ├── password-reset.js  # 密码重置功能
│   ├── password-reset-test.html # 密码重置测试页面
│   ├── reset-api-routes.js # 密码重置API路由
│   ├── test-api.bat       # API测试批处理文件
│   └── test-password-reset.js # 密码重置测试脚本
├── public/                # 静态资源目录
├── reset-password.html    # 密码重置页面
├── index.html             # 主页
├── package.json           # 项目依赖
└── start-server.bat       # 服务器启动脚本
```

## 贡献指南

欢迎为NexusOrbital身份验证系统做出贡献。如果您发现任何问题或有改进建议，请提交问题报告或拉取请求。

## 许可证

本项目使用 [MIT许可证](LICENSE) 授权。
