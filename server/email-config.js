/**
 * NexusOrbital 邮件服务配置
 * 为不同环境提供不同的邮件服务配置
 */

// 获取环境变量
const mailUser = process.env.NEXUS_MAIL_USER || '';
const mailPass = process.env.NEXUS_MAIL_PASS || '';

// 邮件配置
const emailConfig = {
    // 开发环境配置
    development: {
        service: 'console', // 控制台模拟邮件发送
        logLevel: 'debug',
        from: '"NexusOrbital开发" <dev-noreply@nexusorbital.com>'
    },
    
    // 测试环境配置
    testing: {
        service: mailUser && mailPass ? 'gmail' : 'console',
        auth: mailUser && mailPass ? {
            user: mailUser,
            pass: mailPass
        } : undefined,
        logLevel: 'info',
        from: '"NexusOrbital测试" <test-noreply@nexusorbital.com>'
    },
    
    // 生产环境配置
    production: {
        service: 'gmail',
        auth: {
            user: mailUser || 'production-email@nexusorbital.com',
            pass: mailPass || 'API_KEY_HERE' // 实际部署时需要替换
        },
        secure: true,
        logLevel: 'error',
        from: '"NexusOrbital" <noreply@nexusorbital.com>'
    }
};

/**
 * 获取当前环境的邮件配置
 * @returns {Object} 邮件配置对象
 */
function getEmailConfig() {
    const env = process.env.NODE_ENV || 'development';
    const config = emailConfig[env] || emailConfig.development;
    
    // 如果没有提供凭据但需要真实邮件服务，回退到控制台模式
    if (config.service !== 'console' && (!config.auth || !config.auth.user || !config.auth.pass)) {
        console.warn('警告: 邮件服务凭据未提供，回退到控制台模式');
        return {
            ...config,
            service: 'console',
            auth: undefined
        };
    }
    
    return config;
}

module.exports = {
    getEmailConfig,
    emailConfig
};
