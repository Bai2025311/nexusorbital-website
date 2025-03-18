/**
 * NexusOrbital邮件服务模块
 * 提供邮件发送功能的统一接口
 */

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// 邮件模板
const EMAIL_TEMPLATES = {
    // 验证邮件模板
    verification: (username, code) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
            <h2 style="color: #3a7bd5;">欢迎加入NexusOrbital!</h2>
            <p>您好, ${username}!</p>
            <p>感谢您注册NexusOrbital。请使用以下验证码完成账户验证:</p>
            <div style="background-color: #f9f9f9; padding: 10px; border-radius: 5px; font-size: 24px; text-align: center; letter-spacing: 5px; font-weight: bold;">
                ${code}
            </div>
            <p>验证码有效期为1小时。</p>
            <p>如果这不是您的操作，请忽略此邮件。</p>
            <p>谢谢,<br>NexusOrbital团队</p>
        </div>
    `,
    
    // 密码重置模板
    passwordReset: (username, code) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
            <h2 style="color: #3a7bd5;">NexusOrbital密码重置</h2>
            <p>您好, ${username}!</p>
            <p>您请求了密码重置。请使用以下验证码完成密码重置:</p>
            <div style="background-color: #f9f9f9; padding: 10px; border-radius: 5px; font-size: 24px; text-align: center; letter-spacing: 5px; font-weight: bold;">
                ${code}
            </div>
            <p>验证码有效期为30分钟。</p>
            <p>如果这不是您的操作，请忽略此邮件并考虑更改您的密码。</p>
            <p>谢谢,<br>NexusOrbital团队</p>
        </div>
    `,
    
    // 欢迎邮件模板
    welcome: (username) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
            <h2 style="color: #3a7bd5;">欢迎加入NexusOrbital!</h2>
            <p>您好, ${username}!</p>
            <p>感谢您完成NexusOrbital账户验证。您的账户现已激活。</p>
            <p>NexusOrbital是一个创新的太空社区平台，我们很高兴您加入我们的行列。</p>
            <p>如有任何问题，请随时联系我们的支持团队。</p>
            <p>祝您在NexusOrbital的旅程愉快！</p>
            <p>谢谢,<br>NexusOrbital团队</p>
        </div>
    `
};

/**
 * 创建邮件服务
 * @param {Object} config 邮件服务配置
 * @returns {Object} 邮件服务对象
 */
function createEmailService(config = {}) {
    const defaultConfig = {
        service: 'console', // 默认使用控制台模拟
        logLevel: 'info',
        from: '"NexusOrbital" <noreply@nexusorbital.com>',
        templatesDir: null // 自定义模板目录
    };
    
    // 合并配置
    const finalConfig = { ...defaultConfig, ...config };
    
    // 根据环境创建邮件传输器
    let transporter;
    
    if (finalConfig.service === 'console') {
        // 开发环境：控制台模拟邮件发送
        transporter = {
            sendMail: (mailOptions, callback) => {
                console.log('\n==== 模拟发送邮件 ====');
                console.log('收件人:', mailOptions.to);
                console.log('主题:', mailOptions.subject);
                if (finalConfig.logLevel === 'debug') {
                    console.log('内容:', mailOptions.html || mailOptions.text);
                }
                console.log('========================\n');
                
                // 生成随机消息ID
                const messageId = `test-${Date.now()}`;
                // 异步回调，模拟真实邮件发送
                setTimeout(() => callback(null, { messageId }), 100);
            }
        };
    } else {
        // 生产环境：使用nodemailer
        transporter = nodemailer.createTransport(finalConfig);
        
        // 验证配置
        transporter.verify(function(error, success) {
            if (error) {
                console.error('邮件服务配置错误:', error);
            } else if (finalConfig.logLevel !== 'error') {
                console.log('邮件服务准备就绪');
            }
        });
    }
    
    // 获取邮件模板
    const getTemplate = (templateName, data = {}) => {
        // 如果提供了模板目录，尝试从文件加载
        if (finalConfig.templatesDir) {
            const templatePath = path.join(finalConfig.templatesDir, `${templateName}.html`);
            if (fs.existsSync(templatePath)) {
                let template = fs.readFileSync(templatePath, 'utf8');
                // 替换变量
                Object.keys(data).forEach(key => {
                    template = template.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), data[key]);
                });
                return template;
            }
        }
        
        // 使用内置模板
        if (EMAIL_TEMPLATES[templateName]) {
            return EMAIL_TEMPLATES[templateName](...Object.values(data));
        }
        
        // 模板不存在
        console.error(`邮件模板不存在: ${templateName}`);
        return null;
    };
    
    /**
     * 发送邮件
     * @param {Object} options 邮件选项
     * @param {string} options.to 收件人
     * @param {string} options.subject 主题
     * @param {string} options.templateName 模板名称
     * @param {Object} options.templateData 模板数据
     * @param {function} callback 回调函数
     */
    const sendMail = (options, callback) => {
        const { to, subject, templateName, templateData, text } = options;
        
        // 验证必填字段
        if (!to || (!templateName && !text)) {
            return callback(new Error('缺少必填字段'));
        }
        
        // 准备邮件选项
        const mailOptions = {
            from: finalConfig.from,
            to,
            subject
        };
        
        // 如果提供了模板，使用模板
        if (templateName) {
            const html = getTemplate(templateName, templateData);
            if (html) {
                mailOptions.html = html;
            } else {
                return callback(new Error(`无法加载模板: ${templateName}`));
            }
        } else if (text) {
            // 使用文本内容
            mailOptions.text = text;
        }
        
        // 发送邮件
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('邮件发送失败:', error);
                callback(error);
            } else {
                if (finalConfig.logLevel !== 'error') {
                    console.log('邮件发送成功:', info.messageId);
                }
                callback(null, info);
            }
        });
    };
    
    // 生成验证码
    const generateVerificationCode = (length = 6) => {
        const digits = '0123456789';
        let code = '';
        for (let i = 0; i < length; i++) {
            code += digits[Math.floor(Math.random() * 10)];
        }
        return code;
    };
    
    // 发送验证邮件
    const sendVerificationEmail = (to, username, callback) => {
        const code = generateVerificationCode();
        sendMail({
            to,
            subject: 'NexusOrbital账号验证',
            templateName: 'verification',
            templateData: { username, code }
        }, (error, info) => {
            callback(error, { code, info });
        });
    };
    
    // 发送密码重置邮件
    const sendPasswordResetEmail = (to, username, callback) => {
        const code = generateVerificationCode();
        sendMail({
            to,
            subject: 'NexusOrbital密码重置',
            templateName: 'passwordReset',
            templateData: { username, code }
        }, (error, info) => {
            callback(error, { code, info });
        });
    };
    
    // 发送欢迎邮件
    const sendWelcomeEmail = (to, username, callback) => {
        sendMail({
            to,
            subject: '欢迎加入NexusOrbital',
            templateName: 'welcome',
            templateData: { username }
        }, callback);
    };
    
    // 返回邮件服务对象
    return {
        sendMail,
        sendVerificationEmail,
        sendPasswordResetEmail,
        sendWelcomeEmail,
        generateVerificationCode
    };
}

module.exports = createEmailService;
