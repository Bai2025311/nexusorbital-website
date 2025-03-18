# NexusOrbital 官方网站

![NexusOrbital](images/placeholder.txt)

## 项目简介

NexusOrbital（寰宇脉络）是一个专注于探索星际人居未来的创新平台。我们通过AI连接「现实需求-技术研发-空间实践」的完整闭环，既解决当下城市居住痛点，又为星际移民储备技术生态，成为人类居住文明的「第二演化系统」。

## 网站功能

- **主页**: 展示项目愿景和主要功能
- **共创社区**: 用户交流与创意分享平台
- **AI设计工坊**: AI辅助设计工具
- **众筹商城**: 项目筹资与产品展示
- **智能体系统**: 8大专业智能体提供服务
- **用户认证系统**: 支持邮箱/密码、手机/验证码和社交媒体认证

## 技术栈

- 前端: HTML5/CSS3/JavaScript, 响应式设计, 3D可视化 (Spline)
- 后端: Node.js, Express.js
- 认证: JWT, bcrypt, OAuth 2.0
- 部署: Vercel, GitHub Pages
- 安全: 统一错误处理, 配置管理, 密码哈希
- 其他: AI集成, CORS支持

## 认证系统功能

认证系统提供以下核心功能:

1. **多种登录方式**:
   - 邮箱/密码登录
   - 手机号/验证码登录
   - 微信、微博、小红书社交媒体登录

2. **安全与配置**:
   - JWT令牌认证
   - 密码加密存储
   - 集中化配置管理
   - 统一错误处理机制

3. **开发工具**:
   - API测试页面
   - 自动化测试脚本
   - 健康检查端点

## 部署方式

### 静态网页部署

本网站的静态部分使用GitHub Pages托管，通过Cloudflare提供全球CDN加速。

### 认证系统部署

认证系统使用Vercel部署，提供无服务器API端点。详细资料请参考:

- [认证系统部署完整指南](docs/部署完整指南.md)
- [API文档](docs/API文档.md)
- [认证系统最终报告](docs/认证系统最终报告.md)

## 一键部署

项目提供多种一键部署脚本，轻松部署到Vercel平台:

```bash
# Windows用户 (中文界面)
双击运行 "一键部署.bat" 或 "scripts/一键部署.bat"

# PowerShell用户
./scripts/deploy-vercel.ps1

# Linux/Mac用户
bash ./scripts/vercel.sh
```

## 本地开发

```bash
# 克隆仓库
git clone https://github.com/YOUR_USERNAME/nexusorbital-website.git

# 进入项目目录
cd nexusorbital-website

# 安装依赖
cd server
npm install

# 启动认证服务器
node auth-server.js

# 静态文件可使用任意HTTP服务器运行
# 例如使用Python（在项目根目录运行）
python -m http.server
```

## API测试

项目提供了多种API测试方式:

1. **图形界面测试**: 
   ```
   http://localhost:3000/auth-test-page.html  # 本地测试
   https://your-vercel-url.vercel.app/auth-test-page.html  # 线上测试
   ```

2. **自动化测试**:
   ```bash
   # Windows用户
   双击运行 "测试API.bat"
   
   # 命令行方式
   node scripts/api-test.js
   ```

## 项目结构

```
nexusorbital-website/
├── docs/                   # 文档目录
│   ├── API文档.md           # API详细文档
│   └── 认证系统最终报告.md    # 实施报告
├── scripts/                # 脚本目录
│   ├── api-test.js         # API测试脚本
│   ├── deploy-vercel.ps1   # PowerShell部署脚本
│   ├── vercel.sh           # Shell部署脚本
│   └── 一键部署.bat          # 中文部署脚本
├── server/                 # 服务器端代码
│   ├── auth-server.js      # 认证服务器主文件
│   ├── config.js           # 配置模块
│   ├── error-handler.js    # 错误处理模块
│   ├── social-auth.js      # 社交媒体登录模块
│   ├── vercel-entry.js     # Vercel入口文件
│   └── package.json        # 项目依赖配置
├── 一键部署.bat              # 项目根目录部署脚本
├── 测试API.bat              # API测试脚本
├── auth-test-page.html     # API测试页面
├── index.html              # 网站主页
├── vercel.json             # Vercel配置文件
└── README.md               # 项目说明
```

## 许可证

版权所有 2025 NexusOrbital
