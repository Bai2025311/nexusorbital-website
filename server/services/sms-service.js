/**
 * 阿里云短信服务集成
 * 提供发送短信验证码功能
 */

const SMSClient = require('@alicloud/sms-sdk');
const config = require('../config');
const { ErrorTypes } = require('../error-handler');

// 创建SMS客户端实例
let smsClient = null;

/**
 * 初始化短信客户端
 * 从配置中获取AccessKey和AccessSecret
 */
function initSMSClient() {
  try {
    const accessKeyId = config.get('sms.accessKeyId');
    const accessKeySecret = config.get('sms.accessKeySecret');
    
    if (!accessKeyId || !accessKeySecret) {
      console.warn('短信服务未配置AccessKey，将使用模拟短信功能');
      return null;
    }
    
    return new SMSClient({
      accessKeyId,
      secretAccessKey: accessKeySecret
    });
  } catch (error) {
    console.error('初始化短信客户端失败:', error);
    return null;
  }
}

/**
 * 发送短信验证码
 * @param {string} phoneNumber - 手机号码
 * @param {string} code - 验证码
 * @param {string} countryCode - 国家代码（如86）
 * @returns {Promise<Object>} - 发送结果
 */
async function sendSMS(phoneNumber, code, countryCode = '86') {
  // 确保SMS客户端已初始化
  if (!smsClient) {
    smsClient = initSMSClient();
  }
  
  // 如果仍然无法初始化客户端，使用模拟功能
  if (!smsClient) {
    console.warn(`模拟发送短信到 +${countryCode}${phoneNumber}，验证码: ${code}`);
    return {
      success: true,
      mock: true,
      message: '模拟短信发送成功'
    };
  }
  
  // 准备短信参数
  const params = {
    PhoneNumbers: phoneNumber,
    SignName: config.get('sms.signName'),
    TemplateCode: config.get('sms.templateCode'),
    TemplateParam: JSON.stringify({
      code: code
    })
  };
  
  try {
    // 发送短信
    const result = await smsClient.sendSMS(params);
    
    // 检查发送结果
    if (result.Code === 'OK') {
      return {
        success: true,
        bizId: result.BizId,
        message: '短信发送成功'
      };
    } else {
      throw ErrorTypes.EXTERNAL_SERVICE_ERROR(`短信发送失败: ${result.Message}`);
    }
  } catch (error) {
    // 捕获并处理发送过程中的错误
    console.error('发送短信出错:', error);
    throw ErrorTypes.EXTERNAL_SERVICE_ERROR('短信服务暂时不可用，请稍后重试');
  }
}

module.exports = {
  sendSMS
};
