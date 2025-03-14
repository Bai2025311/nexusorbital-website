# NexusOrbital.com 全球部署指南

本文档将指导您完成NexusOrbital.com网站的全球部署流程，确保中国和国际用户都能顺畅访问。

## 一、部署准备工作

### 已完成事项：
1. CNAME文件已创建，内容为 `nexusorbital.com`
2. `.gitignore` 文件已配置
3. GitHub Actions 部署配置已设置 (`.github/workflows/deploy.yml`)

### 您需要准备：
1. GitHub账号
2. Cloudflare账号 (免费)
3. 域名登录信息 (NexusOrbital.com)

## 二、GitHub部署步骤

1. **创建GitHub仓库**
   - 登录GitHub账号
   - 创建新仓库 `nexusorbital-website`
   - 将仓库设置为公开 (Public)

2. **上传网站代码**
   ```bash
   # 进入网站根目录
   cd C:\Users\Administrator\CascadeProjects\CosmicWeave\website
   
   # 初始化Git仓库
   git init
   
   # 添加所有文件
   git add .
   
   # 提交更改
   git commit -m "Initial website commit"
   
   # 添加远程仓库 (替换 YOUR_USERNAME 为您的GitHub用户名)
   git remote add origin https://github.com/YOUR_USERNAME/nexusorbital-website.git
   
   # 推送代码到GitHub
   git push -u origin main
   ```

3. **启用GitHub Pages**
   - 进入GitHub仓库设置
   - 滚动到"GitHub Pages"部分
   - 将部署分支设置为 `gh-pages`
   - 勾选"Enforce HTTPS"选项
   - 等待部署完成 (通常1-5分钟)

## 三、Cloudflare配置步骤

1. **注册Cloudflare**
   - 访问 [Cloudflare官网](https://www.cloudflare.com/) 并注册账户
   - 登录后，点击"添加站点"
   - 输入您的域名 `nexusorbital.com` 并点击"添加站点"

2. **更新域名服务器**
   - Cloudflare会提供两个名称服务器 (NS)
   - 登录域名注册商控制面板
   - 找到DNS管理或名称服务器设置
   - 将域名服务器更改为Cloudflare提供的NS
   - 等待DNS更改生效 (最长可能需要48小时)

3. **Cloudflare设置**
   - DNS记录配置:
     ```
     类型    名称    内容                        代理状态
     CNAME   @       YOUR_USERNAME.github.io     已代理(橙色云朵)
     CNAME   www     YOUR_USERNAME.github.io     已代理(橙色云朵)
     ```
   
   - SSL/TLS设置:
     - 加密模式: 选择"完全"
     - 始终使用HTTPS: 开启
     - HTTP/2: 开启
     - 最低TLS版本: TLS 1.2

   - 缓存设置:
     - 缓存级别: 标准
     - 浏览器缓存TTL: 4小时
     - Always Online: 开启

   - 页面规则 (可选但推荐):
     ```
     URL模式: nexusorbital.com/*
     设置: 缓存级别 = 缓存所有内容
     ```

## 四、优化中国访问速度

1. **启用Cloudflare中国优化选项**
   - 在Cloudflare网络设置中启用"中国网络优化"(如果可用)

2. **压缩图片和JS/CSS文件**
   - 在Cloudflare中开启自动压缩
   - 所有图片已优化为Web格式

3. **使用懒加载技术**
   - 网站中的图片已设置懒加载属性

## 五、验证部署

1. **检查GitHub部署状态**
   - 在仓库的"Actions"标签下查看工作流运行情况
   - 确保最新部署成功完成

2. **测试网站访问**
   - 国际访问: [https://nexusorbital.com](https://nexusorbital.com)
   - 验证HTTPS证书是否正确

3. **检查Cloudflare分析**
   - 监控网站流量和性能
   - 查看不同地区的访问速度

## 六、维护与更新

要更新网站内容，只需将更改推送到GitHub仓库，GitHub Actions将自动部署:

```bash
# 添加更改
git add .

# 提交更改
git commit -m "更新网站内容"

# 推送到GitHub
git push origin main
```

## 七、疑难解答

如遇到以下问题:

1. **DNS未正确指向**
   - 等待DNS传播完成 (最多48小时)
   - 使用 [dnschecker.org](https://dnschecker.org) 验证域名解析

2. **HTTPS证书问题**
   - 确保Cloudflare SSL设置为完全模式
   - 在GitHub Pages设置中确保勾选"强制HTTPS"

3. **网站在中国加载慢**
   - 进一步优化图片大小
   - 考虑使用国内CDN作为备份方案

## 八、联系支持

如需进一步帮助，请联系:
- GitHub支持: [https://support.github.com/](https://support.github.com/)
- Cloudflare支持: [https://support.cloudflare.com/](https://support.cloudflare.com/)
