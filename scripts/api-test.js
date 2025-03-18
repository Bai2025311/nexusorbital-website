/**
 * NexusOrbital认证系统API自动化测试脚本
 * 用于验证部署的API服务是否正常工作
 */

const axios = require('axios');
const chalk = require('chalk');
const inquirer = require('inquirer');
const ora = require('ora');

// 测试配置
let API_BASE_URL = 'http://localhost:3000/api';
let TEST_EMAIL = 'test@nexusorbital.com';
let TEST_PASSWORD = 'Test12345678';
let TEST_USERNAME = 'TestUser';
let TEST_PHONE = '13800138000';
let TOKEN = null;

// 测试结果统计
const stats = {
  passed: 0,
  failed: 0,
  skipped: 0,
  total: 0
};

/**
 * 打印测试结果
 */
function printResults() {
  console.log('\n');
  console.log(chalk.bold('=== NexusOrbital认证系统API测试结果 ==='));
  console.log(`总测试数: ${chalk.bold(stats.total)}`);
  console.log(`通过: ${chalk.green.bold(stats.passed)}`);
  console.log(`失败: ${chalk.red.bold(stats.failed)}`);
  console.log(`跳过: ${chalk.yellow.bold(stats.skipped)}`);
  console.log('\n');
  
  if (stats.failed === 0) {
    console.log(chalk.green.bold('✓ 所有测试通过！API服务运行正常'));
  } else {
    console.log(chalk.red.bold('✗ 测试未全部通过，请检查API服务'));
  }
}

/**
 * 测试运行器
 */
async function runTest(name, testFn, dependsOn = null) {
  stats.total++;
  
  // 如果有依赖测试且依赖测试失败，则跳过此测试
  if (dependsOn && !dependsOn.result) {
    console.log(`${chalk.yellow('⚠')} ${chalk.yellow.bold(name)} ${chalk.yellow('(已跳过 - 依赖测试失败)')}`);
    stats.skipped++;
    return { result: false, error: 'Skipped due to dependency failure' };
  }
  
  const spinner = ora(`运行测试: ${name}`).start();
  
  try {
    await testFn();
    spinner.succeed(chalk.green.bold(name));
    stats.passed++;
    return { result: true };
  } catch (error) {
    spinner.fail(chalk.red.bold(name));
    console.log(`  ${chalk.red('错误:')} ${error.message}`);
    if (error.response) {
      console.log(`  ${chalk.red('状态码:')} ${error.response.status}`);
      console.log(`  ${chalk.red('响应数据:')} ${JSON.stringify(error.response.data, null, 2)}`);
    }
    stats.failed++;
    return { result: false, error };
  }
}

/**
 * 测试用例
 */
const tests = {
  // 健康检查测试
  async healthCheck() {
    const response = await axios.get(`${API_BASE_URL}/health`);
    if (response.status !== 200 || !response.data.status || response.data.status !== 'ok') {
      throw new Error('健康检查失败');
    }
  },
  
  // 邮箱注册测试
  async emailRegister() {
    const response = await axios.post(`${API_BASE_URL}/register/email`, {
      username: TEST_USERNAME,
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    if (response.status !== 201 || !response.data.success || !response.data.token) {
      throw new Error('邮箱注册失败');
    }
    
    // 保存令牌供后续测试使用
    TOKEN = response.data.token;
  },
  
  // 邮箱登录测试
  async emailLogin() {
    const response = await axios.post(`${API_BASE_URL}/login/email`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    if (response.status !== 200 || !response.data.success || !response.data.token) {
      throw new Error('邮箱登录失败');
    }
    
    // 更新令牌
    TOKEN = response.data.token;
  },
  
  // 发送验证码测试
  async sendSms() {
    const response = await axios.post(`${API_BASE_URL}/send-sms`, {
      countryCode: '86',
      phone: TEST_PHONE
    });
    
    if (response.status !== 200 || !response.data.success) {
      throw new Error('发送验证码失败');
    }
  },
  
  // 手机登录测试
  async phoneLogin() {
    const response = await axios.post(`${API_BASE_URL}/login/phone`, {
      countryCode: '86',
      phone: TEST_PHONE,
      code: '123456' // 开发环境下的默认验证码
    });
    
    if (response.status !== 200 || !response.data.success || !response.data.token) {
      throw new Error('手机登录失败');
    }
    
    // 更新令牌
    TOKEN = response.data.token;
  },
  
  // 微信登录测试
  async wechatLogin() {
    const response = await axios.post(`${API_BASE_URL}/login/social/wechat`, {
      code: 'test_wechat_code'
    });
    
    if (response.status !== 200 || !response.data.success || !response.data.token) {
      throw new Error('微信登录失败');
    }
  },
  
  // 微博登录测试
  async weiboLogin() {
    const response = await axios.post(`${API_BASE_URL}/login/social/weibo`, {
      code: 'test_weibo_code'
    });
    
    if (response.status !== 200 || !response.data.success || !response.data.token) {
      throw new Error('微博登录失败');
    }
  },
  
  // 小红书登录测试
  async xiaohongshuLogin() {
    const response = await axios.post(`${API_BASE_URL}/login/social/xiaohongshu`, {
      code: 'test_xiaohongshu_code'
    });
    
    if (response.status !== 200 || !response.data.success || !response.data.token) {
      throw new Error('小红书登录失败');
    }
  },
  
  // 验证令牌测试
  async verifyToken() {
    if (!TOKEN) {
      throw new Error('没有可用的JWT令牌');
    }
    
    const response = await axios.get(`${API_BASE_URL}/verify-token`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`
      }
    });
    
    if (response.status !== 200 || !response.data.success) {
      throw new Error('令牌验证失败');
    }
  }
};

/**
 * 主测试流程
 */
async function runTests() {
  console.log(chalk.bold('\nNexusOrbital认证系统API测试工具\n'));
  
  // 配置测试参数
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'apiUrl',
      message: '请输入API基础URL:',
      default: API_BASE_URL
    },
    {
      type: 'confirm',
      name: 'useCustomTestData',
      message: '是否使用自定义测试数据?',
      default: false
    }
  ]);
  
  API_BASE_URL = answers.apiUrl;
  
  if (answers.useCustomTestData) {
    const testData = await inquirer.prompt([
      {
        type: 'input',
        name: 'email',
        message: '测试邮箱:',
        default: TEST_EMAIL
      },
      {
        type: 'input',
        name: 'password',
        message: '测试密码:',
        default: TEST_PASSWORD
      },
      {
        type: 'input',
        name: 'username',
        message: '测试用户名:',
        default: TEST_USERNAME
      },
      {
        type: 'input',
        name: 'phone',
        message: '测试手机号:',
        default: TEST_PHONE
      }
    ]);
    
    TEST_EMAIL = testData.email;
    TEST_PASSWORD = testData.password;
    TEST_USERNAME = testData.username;
    TEST_PHONE = testData.phone;
  }
  
  const testSelection = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedTests',
      message: '选择要运行的测试:',
      choices: [
        { name: '健康检查', value: 'healthCheck', checked: true },
        { name: '邮箱注册', value: 'emailRegister', checked: true },
        { name: '邮箱登录', value: 'emailLogin', checked: true },
        { name: '发送验证码', value: 'sendSms', checked: true },
        { name: '手机号登录', value: 'phoneLogin', checked: true },
        { name: '微信登录', value: 'wechatLogin', checked: true },
        { name: '微博登录', value: 'weiboLogin', checked: true },
        { name: '小红书登录', value: 'xiaohongshuLogin', checked: true },
        { name: '验证令牌', value: 'verifyToken', checked: true }
      ]
    }
  ]);
  
  // 运行所选测试
  console.log(chalk.cyan('\n开始执行API测试...\n'));
  
  // 健康检查
  if (testSelection.selectedTests.includes('healthCheck')) {
    await runTest('健康检查', tests.healthCheck);
  }
  
  // 邮箱注册
  let registerTest = { result: true };
  if (testSelection.selectedTests.includes('emailRegister')) {
    registerTest = await runTest('邮箱注册', tests.emailRegister);
  }
  
  // 邮箱登录
  if (testSelection.selectedTests.includes('emailLogin')) {
    await runTest('邮箱登录', tests.emailLogin, registerTest);
  }
  
  // 发送验证码
  let smsTest = { result: true };
  if (testSelection.selectedTests.includes('sendSms')) {
    smsTest = await runTest('发送验证码', tests.sendSms);
  }
  
  // 手机号登录
  if (testSelection.selectedTests.includes('phoneLogin')) {
    await runTest('手机号登录', tests.phoneLogin, smsTest);
  }
  
  // 社交登录测试
  if (testSelection.selectedTests.includes('wechatLogin')) {
    await runTest('微信登录', tests.wechatLogin);
  }
  
  if (testSelection.selectedTests.includes('weiboLogin')) {
    await runTest('微博登录', tests.weiboLogin);
  }
  
  if (testSelection.selectedTests.includes('xiaohongshuLogin')) {
    await runTest('小红书登录', tests.xiaohongshuLogin);
  }
  
  // 验证令牌
  if (testSelection.selectedTests.includes('verifyToken')) {
    await runTest('验证令牌', tests.verifyToken);
  }
  
  // 打印测试结果
  printResults();
}

// 开始测试
runTests().catch(error => {
  console.error(chalk.red('\n测试过程中发生错误:'), error);
  process.exit(1);
});
