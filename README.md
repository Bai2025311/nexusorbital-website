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
- **探索者模式**: 无需注册即可体验平台基础功能

## 技术栈

- 前端: HTML5/CSS3/JavaScript, 响应式设计, 3D可视化 (Spline)
- 后端: Node.js, Express.js
- 认证: JWT, bcrypt, OAuth 2.0
- 部署: Vercel, GitHub Pages
- 安全: 统一错误处理, 配置管理, 密码哈希
- 其他: AI集成, CORS支持

## MVP功能实现

MVP (Minimum Viable Product) 包含以下核心功能:

1. **探索者模式**:
   - 无需注册即可访问平台
   - 有限权限体验（浏览内容、点赞、分享）
   - 基于JWT实现的临时会话管理
   - 平滑转化为注册用户的路径

2. **社区功能**:
   - 创意内容浏览与分享
   - 用户生成内容展示
   - 多媒体内容支持
   - AI辅助评论与交互

3. **设计工具**:
   - 基础形状与材质选择
   - 模块化设计元素
   - 3D预览与导出功能
   - 专业版功能升级路径

4. **集成层**:
   - 统一的用户体验
   - 无缝模块间通信
   - 用户权限与角色管理
   - 事件追踪与分析

5. **会员系统**:
   - 分级会员权益
   - 基础/专业/企业版选项
   - 订阅和支付功能
   - 特殊优惠与限时促销

6. **分析追踪**:
   - 用户行为数据收集
   - 转化漏斗分析
   - 特性使用情况追踪
   - 产品改进数据支持

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
   - 密码重置功能
   - 邮箱验证机制

3. **开发工具**:
   - API测试页面
   - 自动化测试脚本
   - 健康检查端点

## MVP核心文件结构

MVP实现依赖以下关键文件:

```
nexusorbital-website/
├── js/
│   ├── auth.js              # 用户认证逻辑
│   ├── analytics.js         # 数据分析追踪
│   ├── community.js         # 社区功能实现
│   ├── config.js            # 环境配置管理
│   ├── design-tool.js       # 设计工具功能
│   ├── error-handler.js     # 统一错误处理
│   ├── explorer-mode.js     # 探索者模式实现
│   ├── integrations.js      # 模块集成与通信
│   ├── membership.js        # 会员系统管理
│   └── mvp.js               # MVP主控逻辑
├── css/
│   ├── main.css             # 基础样式
│   ├── mvp.css              # MVP特定样式
│   └── mvp-unified.css      # 统一视觉风格
├── mvp-index.html           # MVP主页面
└── README.md                # 项目说明
```

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
│   ├── email-service-api.md # 邮件服务API文档
│   ├── password-reset-api.md # 密码重置API文档
│   ├── authentication-system-final-report.md # 认证系统最终报告
│   ├── security-best-practices.md # 安全最佳实践
│   └── README.md           # 文档索引
├── scripts/                # 脚本目录
│   ├── api-test.js         # API测试脚本
│   ├── deploy-vercel.ps1   # PowerShell部署脚本
│   ├── vercel.sh           # Shell部署脚本
│   └── 一键部署.bat          # 中文部署脚本
├── server/                 # 服务器端代码
│   ├── complete-solution.js # 认证服务器主文件
│   ├── config.js           # 配置模块
│   ├── error-handler.js    # 错误处理模块
│   ├── email-service.js    # 邮件服务模块
│   ├── reset-api-routes.js # 密码重置API路由
│   ├── email-register-test.html # 邮箱注册测试页面
│   ├── password-reset-test.html # 密码重置测试页面
│   ├── test-api.bat        # API测试批处理文件
│   ├── test-password-reset.js # 密码重置测试脚本
│   └── test-password-reset.bat # 密码重置测试批处理文件
├── data/                   # 数据目录
│   ├── users.json          # 用户数据文件
│   └── reset_tokens.json   # 密码重置令牌文件
├── start-server.bat        # 服务器快速启动脚本
├── test-all.bat            # 全面测试工具脚本
├── index.html              # 网站主页
└── README.md               # 项目说明
```

## 快速开始

```bash
# 克隆仓库
git clone https://github.com/YOUR_USERNAME/nexusorbital-website.git

# 进入项目目录
cd nexusorbital-website

# 启动服务器(Windows)
start-server.bat
# 或直接通过Node.js启动
node server/complete-solution.js

# 访问测试页面
# 邮箱注册测试: http://localhost:3090/email-register-test
# 密码重置测试: http://localhost:3090/password-reset-test
```

## 密码重置功能

NexusOrbital认证系统提供完整的密码重置流程:

1. **发起重置请求**:
   - 用户提交邮箱地址
   - 系统生成时限验证码并发送邮件

2. **验证身份**:
   - 用户输入收到的验证码
   - 系统验证码有效性和时效性

3. **重置密码**:
   - 用户设置新密码
   - 系统更新密码并发送确认邮件

4. **安全保障**:
   - 验证码时效限制
   - 请求频率限制
   - 异常请求检测

完整API文档请参考 [密码重置API文档](docs/password-reset-api.md)。

## 探索者模式使用指南

1. **激活探索者模式**:
   - 访问主页点击"开始探索"按钮
   - 或在探索者区域点击"激活探索者模式"

2. **可用功能**:
   - 浏览社区内容
   - 使用基础设计工具
   - 点赞与分享内容

3. **注册转化**:
   - 随时可通过导航栏"注册"按钮创建账户
   - 完整保留探索者模式下的操作记录

## 未来规划

1. **社区功能扩展**:
   - 用户个人主页完善
   - 徽章系统实现
   - 深度AI内容生成

2. **设计工具增强**:
   - 高级材质库
   - 协作设计功能
   - VR预览支持

3. **用户体验优化**:
   - 多语言本地化
   - 深色模式支持
   - 辅助功能优化

## 许可证

版权所有 2025 NexusOrbital
