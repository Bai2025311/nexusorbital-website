# 微信扫码登录集成指南

本文档提供了在NexusOrbital网站中实现真正的微信扫码登录功能的完整步骤。

## 前提条件

1. 微信开放平台认证账号（需支付300元认证费用）
2. 已备案的域名（中国大陆服务器必须）
3. HTTPS证书
4. 服务器后端环境（Node.js、PHP、Java等）

## 步骤1：注册微信开放平台

1. 访问 [微信开放平台](https://open.weixin.qq.com/)
2. 注册开发者账号
3. 完成开发者资质认证（个人无法完成认证，需要企业资质）
4. 支付300元认证费用

## 步骤2：创建网站应用

1. 登录开发者账号
2. 创建"网站应用"
3. 填写应用信息
   - 应用名称
   - 应用描述
   - 应用图标
   - 网站域名
   - 授权回调域
4. 提交审核

审核通过后，您将获得：
- AppID
- AppSecret

## 步骤3：设置服务器环境

在服务器上安装必要的依赖：

```bash
# Node.js环境
npm init -y
npm install express axios uuid jsonwebtoken cors body-parser
```

## 步骤4：实现后端服务

创建微信登录认证服务器，代码请参考 `/server/wechat-auth.js`。

主要功能包括：
1. 生成二维码登录链接
2. 处理微信回调
3. 验证用户身份
4. 生成JWT令牌

## 步骤5：前端集成

修改前端代码以与后端API通信：

```javascript
// 获取微信二维码
function getWechatQrCode() {
  return fetch('/api/wx/qrcode')
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        return data.data;
      }
      throw new Error('获取二维码失败');
    });
}

// 检查登录状态
function checkWechatLoginStatus(state) {
  return fetch(`/api/wx/check?state=${state}`)
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        return data;
      }
      throw new Error('检查状态失败');
    });
}
```

## 步骤6：登录流程

完整的微信扫码登录流程：

1. 前端请求二维码，获取`state`和`qrcodeUrl`
2. 生成二维码并展示给用户
3. 用户扫描二维码
4. 微信APP中用户确认授权
5. 微信服务器调用回调地址（`/api/wx/callback`）
6. 后端处理回调，获取用户信息
7. 前端定期查询登录状态（轮询）
8. 登录成功后，前端获取JWT令牌并完成登录

## 示例流程图

```
用户 --> 打开登录页 --> 点击微信登录 --> 展示二维码
  |                                       |
  |                                       v
用户登录成功 <-- 获取JWT令牌 <-- 轮询登录状态
  |
  v
进入系统
```

## 常见问题

1. **404错误**：确保回调地址正确设置且服务器能够正常响应
2. **二维码无法扫描**：检查二维码URL是否正确
3. **授权失败**：验证AppID和AppSecret是否正确配置

## 安全注意事项

1. 不要在前端暴露AppSecret
2. 使用HTTPS保护传输
3. 验证所有请求参数
4. 定期更新JWT密钥
5. 实现防CSRF措施

## 本地开发注意事项

微信开放平台要求回调地址必须是已备案域名，本地开发可以：

1. 使用ngrok等工具将本地服务暴露到公网
2. 在微信开放平台配置中设置测试回调地址

希望本指南能帮助您顺利实现微信扫码登录功能。如有问题，请联系技术支持团队。
