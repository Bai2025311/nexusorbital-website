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
    apiKey: process.env.SMS_API_KEY || 'development-key',
    // 在开发环境中，验证码永远是123456
    defaultDevCode: '123456',
    // 验证码过期时间（秒）
    codeExpirySeconds: 300
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
