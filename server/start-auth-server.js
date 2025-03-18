/**
 * NexusOrbital 认证服务器启动脚本
 * 用于在不同环境下启动认证服务
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const createEmailService = require('./email-service');
const { getEmailConfig } = require('./email-config');

// 配置参数
const CONFIG = {
    // 开发环境
    development: {
        port: 3070,
        corsOrigin: '*',
        smtpConfig: {
            // 开发环境使用控制台模拟邮件发送
            service: 'console',
        },
        dbPath: path.join(__dirname, '../data/dev_users.json'),
        logLevel: 'debug'
    },
    
    // 测试环境
    testing: {
        port: 3060,
        corsOrigin: 'https://test.nexusorbital.com',
        smtpConfig: {
            // 测试环境邮件配置
            service: 'gmail',
            auth: {
                user: process.env.NEXUS_MAIL_USER,
                pass: process.env.NEXUS_MAIL_PASS
            }
        },
        dbPath: path.join(__dirname, '../data/test_users.json'),
        logLevel: 'info'
    },
    
    // 生产环境
    production: {
        port: process.env.PORT || 3060,
        corsOrigin: 'https://nexusorbital.com',
        smtpConfig: {
            // 生产环境邮件配置
            service: 'gmail',
            auth: {
                user: process.env.NEXUS_MAIL_USER,
                pass: process.env.NEXUS_MAIL_PASS
            }
        },
        dbPath: path.join(__dirname, '../data/users.json'),
        logLevel: 'error'
    }
};

// 确定当前环境
const ENV = process.env.NODE_ENV || 'development';
console.log(`启动环境: ${ENV}`);

// 获取当前环境的配置
const currentConfig = CONFIG[ENV];

// 确保数据目录存在
const dataDir = path.dirname(currentConfig.dbPath);
if (!fs.existsSync(dataDir)) {
    console.log(`创建数据目录: ${dataDir}`);
    fs.mkdirSync(dataDir, { recursive: true });
}

// 获取最新的邮件配置
const emailConfig = getEmailConfig();
console.log(`邮件配置: ${emailConfig.service} 模式`);

// 创建邮件服务
let emailService = createEmailService(emailConfig);

// 启动认证服务器
console.log(`启动认证服务器，端口: ${currentConfig.port}`);
require('./complete-solution').startServer({
    port: currentConfig.port,
    corsOrigin: currentConfig.corsOrigin,
    dbPath: currentConfig.dbPath,
    emailService: emailService,
    logLevel: currentConfig.logLevel
});

console.log(`
=====================================
NexusOrbital认证服务器已启动
环境: ${ENV}
端口: ${currentConfig.port}
数据库: ${currentConfig.dbPath}
=====================================
`);
