/**
 * NexusOrbital 错误处理模块
 * 提供统一的错误处理机制，包括API错误、验证错误和网络错误
 */

/**
 * 错误代码映射
 */
const ERROR_CODES = {
    // 通用错误
    'NETWORK_ERROR': '网络连接错误，请检查您的网络连接',
    'SERVER_ERROR': '服务器内部错误，请稍后再试',
    'TIMEOUT_ERROR': '请求超时，请稍后再试',
    
    // 认证错误
    'AUTH_INVALID_CREDENTIALS': '用户名或密码错误',
    'AUTH_TOKEN_EXPIRED': '登录已过期，请重新登录',
    'AUTH_TOKEN_INVALID': '无效的认证令牌',
    'AUTH_REQUIRED': '需要登录才能访问此功能',
    
    // 注册错误
    'REGISTER_EMAIL_EXISTS': '该邮箱已被注册',
    'REGISTER_PHONE_EXISTS': '该手机号已被注册',
    'REGISTER_USERNAME_EXISTS': '该用户名已被注册',
    'REGISTER_INVALID_DATA': '注册信息不完整或格式错误',
    
    // 验证码错误
    'SMS_SEND_FAILED': '短信发送失败',
    'SMS_CODE_INVALID': '验证码错误',
    'SMS_CODE_EXPIRED': '验证码已过期',
    'SMS_RATE_LIMIT': '发送过于频繁，请稍后再试',
    
    // 表单验证错误
    'VALIDATION_EMAIL': '请输入有效的邮箱地址',
    'VALIDATION_PHONE': '请输入有效的手机号码',
    'VALIDATION_PASSWORD': '密码长度必须在6-20个字符之间',
    'VALIDATION_USERNAME': '用户名只能包含字母、数字和下划线',
    'VALIDATION_REQUIRED': '请填写必填字段',
    
    // 请求错误
    'REQUEST_RATE_LIMIT': '请求频率过高，请稍后再试',
    'REQUEST_INVALID': '无效的请求',
    'REQUEST_FORBIDDEN': '无权访问该资源',
    'REQUEST_NOT_FOUND': '请求的资源不存在'
};

/**
 * 根据错误代码获取错误消息
 * @param {string} code 错误代码
 * @param {string} defaultMessage 默认错误消息
 * @returns {string} 错误消息
 */
function getErrorMessage(code, defaultMessage = '发生错误，请稍后再试') {
    return ERROR_CODES[code] || defaultMessage;
}

/**
 * 处理API错误响应
 * @param {Object} response API响应对象
 * @returns {string} 格式化的错误消息
 */
function handleApiError(response) {
    if (!response) {
        return getErrorMessage('NETWORK_ERROR');
    }
    
    if (response.code) {
        return getErrorMessage(response.code, response.message);
    }
    
    return response.message || getErrorMessage('SERVER_ERROR');
}

/**
 * 处理网络错误
 * @param {Error} error 错误对象
 * @returns {string} 格式化的错误消息
 */
function handleNetworkError(error) {
    console.error('网络错误:', error);
    
    if (error.name === 'TimeoutError') {
        return getErrorMessage('TIMEOUT_ERROR');
    }
    
    return getErrorMessage('NETWORK_ERROR');
}

/**
 * 处理表单验证错误
 * @param {string} field 字段名称
 * @param {string} type 错误类型
 * @returns {string} 格式化的错误消息
 */
function handleValidationError(field, type = 'REQUIRED') {
    const code = `VALIDATION_${type.toUpperCase()}`;
    let message = getErrorMessage(code);
    
    // 如果是必填字段错误，添加字段名称
    if (type.toUpperCase() === 'REQUIRED') {
        const fieldNames = {
            'username': '用户名',
            'email': '邮箱',
            'phone': '手机号',
            'password': '密码',
            'code': '验证码'
        };
        
        const fieldName = fieldNames[field] || field;
        message = `请填写${fieldName}`;
    }
    
    return message;
}

/**
 * 显示错误消息
 * @param {string} message 错误消息
 * @param {string} type 错误类型 (error, warning, info)
 */
function showError(message, type = 'error') {
    // 如果存在全局showMessage函数，使用它
    if (typeof showMessage === 'function') {
        showMessage(message);
        return;
    }
    
    // 否则使用alert
    alert(message);
}

/**
 * 验证电子邮箱格式
 * @param {string} email 电子邮箱
 * @returns {boolean} 是否有效
 */
function validateEmail(email) {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
}

/**
 * 验证手机号格式
 * @param {string} phone 手机号
 * @param {string} countryCode 国家代码
 * @returns {boolean} 是否有效
 */
function validatePhone(phone, countryCode = '+86') {
    // 不同国家代码有不同的验证规则
    if (countryCode === '+86') {
        // 中国手机号: 1开头的11位数字
        return /^1\d{10}$/.test(phone);
    }
    
    // 其他国家通用规则: 5-15位数字
    return /^\d{5,15}$/.test(phone);
}

/**
 * 验证密码强度
 * @param {string} password 密码
 * @returns {Object} 密码强度对象 {score: 0-100, level: 'weak'|'medium'|'strong', message: '提示信息'}
 */
function validatePasswordStrength(password) {
    let score = 0;
    let message = '';
    
    // 密码长度
    if (password.length < 6) {
        message = '密码太短';
        return { score: 0, level: 'weak', message };
    } else if (password.length > 8) {
        score += 20;
    }
    
    // 字符种类
    if (/[a-z]/.test(password)) score += 10;
    if (/[A-Z]/.test(password)) score += 10;
    if (/[0-9]/.test(password)) score += 10;
    if (/[^a-zA-Z0-9]/.test(password)) score += 15;
    
    // 重复字符
    const repeats = password.match(/(.)\1{2,}/g);
    if (repeats) score -= repeats.length * 5;
    
    // 判断强度级别
    let level = 'weak';
    if (score >= 30) level = 'medium';
    if (score >= 60) level = 'strong';
    
    // 生成消息
    if (level === 'weak') {
        message = '密码强度弱，建议包含字母、数字和特殊字符';
    } else if (level === 'medium') {
        message = '密码强度中等，可以使用';
    } else {
        message = '密码强度高，非常安全';
    }
    
    return { score, level, message };
}

// 导出函数
window.NexusErrors = {
    getErrorMessage,
    handleApiError,
    handleNetworkError,
    handleValidationError,
    showError,
    validateEmail,
    validatePhone,
    validatePasswordStrength
};
