/**
 * 邮件服务集成
 * 提供发送验证邮件、欢迎邮件等功能
 */

const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const config = require('../config');
const { ErrorTypes } = require('../error-handler');

// 邮件服务提供商选择
const EMAIL_PROVIDER = config.get('email.provider') || 'sendgrid';

// 创建邮件发送器
let transporter = null;
let isSendGridConfigured = false;

/**
 * 初始化Nodemailer发送器
 * 用于SMTP发送邮件
 */
function initNodemailer() {
  try {
    const smtpConfig = config.get('email.smtp');
    
    if (!smtpConfig || !smtpConfig.host || !smtpConfig.auth.user) {
      console.warn('SMTP未配置，无法初始化Nodemailer');
      return null;
    }
    
    return nodemailer.createTransport(smtpConfig);
  } catch (error) {
    console.error('初始化Nodemailer失败:', error);
    return null;
  }
}

/**
 * 初始化SendGrid客户端
 */
function initSendGrid() {
  try {
    const apiKey = config.get('email.sendgrid.apiKey');
    
    if (!apiKey) {
      console.warn('SendGrid API密钥未配置');
      return false;
    }
    
    sgMail.setApiKey(apiKey);
    return true;
  } catch (error) {
    console.error('初始化SendGrid失败:', error);
    return false;
  }
}

/**
 * 通过Nodemailer发送邮件
 * @param {Object} mailOptions - 邮件选项
 * @returns {Promise<Object>} - 发送结果
 */
async function sendWithNodemailer(mailOptions) {
  if (!transporter) {
    transporter = initNodemailer();
  }
  
  if (!transporter) {
    throw ErrorTypes.CONFIGURATION_ERROR('邮件服务未正确配置');
  }
  
  try {
    const info = await transporter.sendMail(mailOptions);
    return {
      success: true,
      messageId: info.messageId,
      message: '邮件发送成功'
    };
  } catch (error) {
    console.error('Nodemailer发送邮件失败:', error);
    throw ErrorTypes.EXTERNAL_SERVICE_ERROR('邮件发送失败，请稍后重试');
  }
}

/**
 * 通过SendGrid发送邮件
 * @param {Object} mailOptions - 邮件选项
 * @returns {Promise<Object>} - 发送结果
 */
async function sendWithSendGrid(mailOptions) {
  if (!isSendGridConfigured) {
    isSendGridConfigured = initSendGrid();
  }
  
  if (!isSendGridConfigured) {
    throw ErrorTypes.CONFIGURATION_ERROR('SendGrid未正确配置');
  }
  
  try {
    const msg = {
      to: mailOptions.to,
      from: mailOptions.from || config.get('email.defaultFrom'),
      subject: mailOptions.subject,
      text: mailOptions.text,
      html: mailOptions.html
    };
    
    await sgMail.send(msg);
    return {
      success: true,
      message: '邮件发送成功'
    };
  } catch (error) {
    console.error('SendGrid发送邮件失败:', error);
    throw ErrorTypes.EXTERNAL_SERVICE_ERROR('邮件发送失败，请稍后重试');
  }
}

/**
 * 发送邮件（根据配置选择发送方式）
 * @param {Object} mailOptions - 邮件选项
 * @returns {Promise<Object>} - 发送结果
 */
async function sendEmail(mailOptions) {
  // 开发环境模拟发送
  if (config.get('env') === 'development' && config.get('email.useMock')) {
    console.log('===== 模拟邮件 =====');
    console.log(`发送至: ${mailOptions.to}`);
    console.log(`主题: ${mailOptions.subject}`);
    console.log(`内容: ${mailOptions.text || mailOptions.html}`);
    console.log('=====================');
    
    return {
      success: true,
      mock: true,
      message: '模拟邮件发送成功'
    };
  }
  
  // 根据配置选择发送方式
  if (EMAIL_PROVIDER === 'sendgrid') {
    return sendWithSendGrid(mailOptions);
  } else {
    return sendWithNodemailer(mailOptions);
  }
}

/**
 * 发送验证码邮件
 * @param {string} email - 收件人邮箱
 * @param {string} code - 验证码
 * @returns {Promise<Object>} - 发送结果
 */
async function sendVerificationEmail(email, code) {
  const subject = 'NexusOrbital - 您的验证码';
  const text = `您的验证码是: ${code}，10分钟内有效。如非本人操作，请忽略此邮件。`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e9e9e9; border-radius: 5px;">
      <h2 style="color: #192231; text-align: center;">NexusOrbital 验证码</h2>
      <p>尊敬的用户：</p>
      <p>您的验证码是：</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; padding: 10px 20px; background-color: #f5f5f5; border-radius: 5px;">${code}</span>
      </div>
      <p>该验证码将在10分钟内有效。如非本人操作，请忽略此邮件。</p>
      <p style="margin-top: 40px; color: #666; font-size: 12px; text-align: center;">
        © ${new Date().getFullYear()} NexusOrbital. 保留所有权利。
      </p>
    </div>
  `;
  
  return sendEmail({
    to: email,
    subject,
    text,
    html
  });
}

/**
 * 发送欢迎邮件
 * @param {string} email - 收件人邮箱
 * @param {string} username - 用户名
 * @returns {Promise<Object>} - 发送结果
 */
async function sendWelcomeEmail(email, username) {
  const subject = '欢迎加入 NexusOrbital';
  const text = `${username}，欢迎加入NexusOrbital！感谢您的注册，希望您享受我们的服务。`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e9e9e9; border-radius: 5px;">
      <h2 style="color: #192231; text-align: center;">欢迎加入 NexusOrbital！</h2>
      <p>尊敬的 ${username}：</p>
      <p>感谢您注册NexusOrbital！我们很高兴您成为我们的一员。</p>
      <p>在NexusOrbital，您可以：</p>
      <ul>
        <li>探索宇宙奥秘，了解最新的天文发现</li>
        <li>参与社区讨论，分享您的见解</li>
        <li>与志同道合的天文爱好者建立联系</li>
      </ul>
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://nexusorbital.com/start" style="background-color: #0b3954; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">开始探索</a>
      </div>
      <p style="margin-top: 40px; color: #666; font-size: 12px; text-align: center;">
        © ${new Date().getFullYear()} NexusOrbital. 保留所有权利。
      </p>
    </div>
  `;
  
  return sendEmail({
    to: email,
    subject,
    text,
    html
  });
}

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendWelcomeEmail
};
