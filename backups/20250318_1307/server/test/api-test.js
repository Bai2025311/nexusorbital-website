/**
 * NexusOrbital 认证API测试脚本
 * 用于测试各个API端点的功能和性能
 */

const axios = require('axios');
const chalk = require('chalk');

// 配置
const BASE_URL = 'http://localhost:3000/api';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'password123';
const TEST_USERNAME = 'testuser';
const TEST_PHONE = '13800138000';
const TEST_COUNTRY_CODE = '+86';
const TEST_CODE = '123456';

// 存储令牌
let token = null;

/**
 * 运行测试
 */
async function runTests() {
    console.log(chalk.blue.bold('=== NexusOrbital 认证API测试 ==='));
    console.log(chalk.gray(`时间: ${new Date().toLocaleString()}`));
    console.log(chalk.gray(`API地址: ${BASE_URL}`));
    console.log('');
    
    // 测试邮箱注册
    await testEmailRegistration();
    
    // 测试邮箱登录
    await testEmailLogin();
    
    // 测试短信发送
    await testSendSMS();
    
    // 测试手机注册
    await testPhoneRegistration();
    
    // 测试手机登录
    await testPhoneLogin();
    
    // 测试令牌验证
    await testVerifyToken();
    
    console.log('');
    console.log(chalk.green.bold('所有测试已完成!'));
}

/**
 * 测试邮箱注册
 */
async function testEmailRegistration() {
    console.log(chalk.yellow.bold('测试邮箱注册...'));
    
    try {
        const response = await axios.post(`${BASE_URL}/register/email`, {
            username: TEST_USERNAME,
            email: TEST_EMAIL,
            password: TEST_PASSWORD
        });
        
        if (response.data.success) {
            console.log(chalk.green('✓ 邮箱注册成功'));
            token = response.data.token;
            console.log(chalk.gray(`令牌: ${token.substring(0, 20)}...`));
        } else {
            console.log(chalk.red(`✗ 邮箱注册失败: ${response.data.message}`));
        }
    } catch (error) {
        handleError('邮箱注册', error);
    }
    
    console.log('');
}

/**
 * 测试邮箱登录
 */
async function testEmailLogin() {
    console.log(chalk.yellow.bold('测试邮箱登录...'));
    
    try {
        const response = await axios.post(`${BASE_URL}/login/email`, {
            email: TEST_EMAIL,
            password: TEST_PASSWORD
        });
        
        if (response.data.success) {
            console.log(chalk.green('✓ 邮箱登录成功'));
            token = response.data.token;
            console.log(chalk.gray(`令牌: ${token.substring(0, 20)}...`));
        } else {
            console.log(chalk.red(`✗ 邮箱登录失败: ${response.data.message}`));
        }
    } catch (error) {
        handleError('邮箱登录', error);
    }
    
    console.log('');
}

/**
 * 测试发送短信验证码
 */
async function testSendSMS() {
    console.log(chalk.yellow.bold('测试发送短信验证码...'));
    
    try {
        const response = await axios.post(`${BASE_URL}/sms/send`, {
            countryCode: TEST_COUNTRY_CODE,
            phone: TEST_PHONE
        });
        
        if (response.data.success) {
            console.log(chalk.green('✓ 短信发送成功'));
        } else {
            console.log(chalk.red(`✗ 短信发送失败: ${response.data.message}`));
        }
    } catch (error) {
        handleError('短信发送', error);
    }
    
    console.log('');
}

/**
 * 测试手机注册
 */
async function testPhoneRegistration() {
    console.log(chalk.yellow.bold('测试手机注册...'));
    
    try {
        const response = await axios.post(`${BASE_URL}/register/phone`, {
            username: `${TEST_USERNAME}_phone`,
            countryCode: TEST_COUNTRY_CODE,
            phone: TEST_PHONE,
            code: TEST_CODE,
            password: TEST_PASSWORD
        });
        
        if (response.data.success) {
            console.log(chalk.green('✓ 手机注册成功'));
            token = response.data.token;
            console.log(chalk.gray(`令牌: ${token.substring(0, 20)}...`));
        } else {
            console.log(chalk.red(`✗ 手机注册失败: ${response.data.message}`));
        }
    } catch (error) {
        handleError('手机注册', error);
    }
    
    console.log('');
}

/**
 * 测试手机登录
 */
async function testPhoneLogin() {
    console.log(chalk.yellow.bold('测试手机登录...'));
    
    try {
        const response = await axios.post(`${BASE_URL}/login/phone`, {
            countryCode: TEST_COUNTRY_CODE,
            phone: TEST_PHONE,
            code: TEST_CODE
        });
        
        if (response.data.success) {
            console.log(chalk.green('✓ 手机登录成功'));
            token = response.data.token;
            console.log(chalk.gray(`令牌: ${token.substring(0, 20)}...`));
        } else {
            console.log(chalk.red(`✗ 手机登录失败: ${response.data.message}`));
        }
    } catch (error) {
        handleError('手机登录', error);
    }
    
    console.log('');
}

/**
 * 测试令牌验证
 */
async function testVerifyToken() {
    console.log(chalk.yellow.bold('测试令牌验证...'));
    
    if (!token) {
        console.log(chalk.red('✗ 没有可用的令牌，跳过测试'));
        return;
    }
    
    try {
        const response = await axios.get(`${BASE_URL}/auth/verify`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.data.success) {
            console.log(chalk.green('✓ 令牌验证成功'));
            console.log(chalk.gray(`用户信息: ${JSON.stringify(response.data.user, null, 2)}`));
        } else {
            console.log(chalk.red(`✗ 令牌验证失败: ${response.data.message}`));
        }
    } catch (error) {
        handleError('令牌验证', error);
    }
    
    console.log('');
}

/**
 * 处理错误
 * @param {string} testName 测试名称
 * @param {Error} error 错误对象
 */
function handleError(testName, error) {
    console.log(chalk.red(`✗ ${testName}测试出错:`));
    
    if (error.response) {
        // 服务器响应了错误状态码
        console.log(chalk.red(`  状态码: ${error.response.status}`));
        console.log(chalk.red(`  响应: ${JSON.stringify(error.response.data, null, 2)}`));
    } else if (error.request) {
        // 请求已发出，但没有收到响应
        console.log(chalk.red('  未收到响应，可能是服务器未运行'));
    } else {
        // 发送请求时出错
        console.log(chalk.red(`  错误: ${error.message}`));
    }
}

// 运行测试
runTests().catch(error => {
    console.error(chalk.red.bold('测试过程中发生错误:'));
    console.error(error);
});
