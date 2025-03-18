/**
 * Vercel部署入口点
 * 用于在Vercel平台上启动NexusOrbital认证系统
 */

const app = require('./auth-server');

// 导出处理函数供Vercel使用
module.exports = app;
