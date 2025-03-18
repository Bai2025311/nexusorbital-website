/**
 * NexusOrbital认证系统 - 环境配置模块
 * 集中管理所有环境变量和配置项
 */

// 加载.env文件（如果存在）
require('dotenv').config();

// 核心配置
const config = {
  // 服务器配置
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development' || !process.env.NODE_ENV,
    isVercel: !!process.env.VERCEL
  },
  
  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET || 'nexusorbital-secure-auth-token-2025',
    expiresIn: process.env.TOKEN_EXPIRY || '24h'
  },
  
  // 短信服务配置
  sms: {
    // 阿里云短信配置
    accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
    accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
    signName: process.env.ALIYUN_SMS_SIGN_NAME || 'NexusOrbital',
    templateCode: process.env.ALIYUN_SMS_TEMPLATE_CODE,
    // 在开发环境中，验证码永远是123456
    defaultDevCode: '123456',
    // 验证码过期时间（秒）
    codeExpirySeconds: 300
  },
  
  // 邮件服务配置
  email: {
    // 邮件提供商: 'smtp' 或 'sendgrid'
    provider: process.env.EMAIL_PROVIDER || 'sendgrid',
    // 默认发件人
    defaultFrom: process.env.EMAIL_FROM || 'noreply@nexusorbital.com',
    // 是否在开发环境使用模拟发送
    useMock: process.env.NODE_ENV !== 'production',
    // SendGrid配置
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY
    },
    // SMTP配置
    smtp: {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    }
  },
  
  // 社交登录配置
  social: {
    wechat: {
      appId: process.env.WECHAT_APP_ID,
      appSecret: process.env.WECHAT_APP_SECRET
    },
    weibo: {
      appKey: process.env.WEIBO_APP_KEY,
      appSecret: process.env.WEIBO_APP_SECRET
    },
    xiaohongshu: {
      clientId: process.env.XIAOHONGSHU_CLIENT_ID,
      clientSecret: process.env.XIAOHONGSHU_CLIENT_SECRET
    }
  },
  
  // 安全配置
  security: {
    passwordMinLength: 8,
    bcryptSaltRounds: 10,
    // CORS配置
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }
  },

  // 日志配置
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  },

  // API版本
  api: {
    version: '1.0.0',
    prefix: '/api'
  }
};

// 获取配置
const getConfig = () => config;

// 获取指定配置部分
const get = (path) => {
  const parts = path.split('.');
  let result = config;
  
  for (const part of parts) {
    if (result[part] === undefined) {
      return undefined;
    }
    result = result[part];
  }
  
  return result;
};

// 导出模块
module.exports = {
  getConfig,
  get
};
