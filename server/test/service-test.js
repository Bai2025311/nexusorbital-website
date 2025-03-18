/**
 * NexusOrbital 短信和邮件服务测试脚本
 * 用于测试集成的阿里云短信和SendGrid/SMTP邮件服务
 */

const readline = require('readline');
const chalk = require('chalk');
const ora = require('ora');

const smsService = require('../services/sms-service');
const emailService = require('../services/email-service');
const config = require('../config');

// 创建readline接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 显示测试菜单
function showMenu() {
  console.log('\n' + chalk.blue.bold('========== NexusOrbital 服务测试 =========='));
  console.log(chalk.yellow('1. 测试短信发送'));
  console.log(chalk.yellow('2. 测试验证码邮件发送'));
  console.log(chalk.yellow('3. 测试欢迎邮件发送'));
  console.log(chalk.yellow('4. 检查服务配置'));
  console.log(chalk.yellow('0. 退出'));
  console.log(chalk.blue.bold('==========================================\n'));
  
  rl.question(chalk.green('请选择操作 (0-4): '), answer => {
    switch(answer.trim()) {
      case '1':
        testSMS();
        break;
      case '2':
        testVerificationEmail();
        break;
      case '3':
        testWelcomeEmail();
        break;
      case '4':
        checkConfiguration();
        break;
      case '0':
        console.log(chalk.blue('再见!'));
        rl.close();
        process.exit(0);
        break;
      default:
        console.log(chalk.red('无效选择，请重试'));
        showMenu();
    }
  });
}

// 测试短信发送
function testSMS() {
  rl.question(chalk.green('请输入手机号码: '), phone => {
    rl.question(chalk.green('请输入国家代码 (默认86): '), countryCode => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const spinner = ora('正在发送短信...').start();
      
      smsService.sendSMS(phone, code, countryCode || '86')
        .then(result => {
          spinner.succeed('短信发送成功');
          console.log(chalk.green('结果:'), result);
          showMenu();
        })
        .catch(error => {
          spinner.fail('短信发送失败');
          console.error(chalk.red('错误:'), error);
          showMenu();
        });
    });
  });
}

// 测试验证码邮件发送
function testVerificationEmail() {
  rl.question(chalk.green('请输入邮箱地址: '), email => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const spinner = ora('正在发送验证码邮件...').start();
    
    emailService.sendVerificationEmail(email, code)
      .then(result => {
        spinner.succeed('验证码邮件发送成功');
        console.log(chalk.green('结果:'), result);
        showMenu();
      })
      .catch(error => {
        spinner.fail('验证码邮件发送失败');
        console.error(chalk.red('错误:'), error);
        showMenu();
      });
  });
}

// 测试欢迎邮件发送
function testWelcomeEmail() {
  rl.question(chalk.green('请输入邮箱地址: '), email => {
    rl.question(chalk.green('请输入用户名: '), username => {
      const spinner = ora('正在发送欢迎邮件...').start();
      
      emailService.sendWelcomeEmail(email, username)
        .then(result => {
          spinner.succeed('欢迎邮件发送成功');
          console.log(chalk.green('结果:'), result);
          showMenu();
        })
        .catch(error => {
          spinner.fail('欢迎邮件发送失败');
          console.error(chalk.red('错误:'), error);
          showMenu();
        });
    });
  });
}

// 检查服务配置
function checkConfiguration() {
  console.log('\n' + chalk.blue.bold('========== 服务配置检查 =========='));
  
  // 检查环境
  console.log(chalk.yellow('【环境】'));
  console.log(`环境: ${chalk.cyan(config.get('server.env'))}`);
  console.log(`是否开发环境: ${chalk.cyan(config.get('server.isDevelopment'))}`);
  console.log(`是否生产环境: ${chalk.cyan(config.get('server.isProduction'))}`);
  
  // 检查短信配置
  console.log('\n' + chalk.yellow('【短信服务】'));
  const smsAccessKeyId = config.get('sms.accessKeyId');
  const smsSignName = config.get('sms.signName');
  const smsTemplateCode = config.get('sms.templateCode');
  
  console.log(`AccessKeyID: ${smsAccessKeyId ? chalk.green('已配置') : chalk.red('未配置')}`);
  console.log(`AccessKeySecret: ${config.get('sms.accessKeySecret') ? chalk.green('已配置') : chalk.red('未配置')}`);
  console.log(`签名名称: ${smsSignName ? chalk.cyan(smsSignName) : chalk.red('未配置')}`);
  console.log(`模板代码: ${smsTemplateCode ? chalk.cyan(smsTemplateCode) : chalk.red('未配置')}`);
  
  // 检查邮件配置
  console.log('\n' + chalk.yellow('【邮件服务】'));
  const emailProvider = config.get('email.provider');
  console.log(`提供商: ${chalk.cyan(emailProvider)}`);
  console.log(`发件人: ${chalk.cyan(config.get('email.defaultFrom'))}`);
  
  if (emailProvider === 'sendgrid') {
    console.log(`SendGrid API密钥: ${config.get('email.sendgrid.apiKey') ? chalk.green('已配置') : chalk.red('未配置')}`);
  } else {
    console.log(`SMTP主机: ${config.get('email.smtp.host') ? chalk.cyan(config.get('email.smtp.host')) : chalk.red('未配置')}`);
    console.log(`SMTP端口: ${chalk.cyan(config.get('email.smtp.port'))}`);
    console.log(`SMTP用户: ${config.get('email.smtp.auth.user') ? chalk.green('已配置') : chalk.red('未配置')}`);
  }
  
  console.log('\n' + chalk.blue.bold('========================================='));
  
  // 显示配置建议
  if (!smsAccessKeyId || !smsTemplateCode) {
    console.log(chalk.yellow('\n【建议】设置短信服务参数:'));
    console.log('1. 复制 .env.example 文件为 .env');
    console.log('2. 在 .env 文件中填入阿里云短信服务的AccessKey和模板信息');
  }
  
  if ((emailProvider === 'sendgrid' && !config.get('email.sendgrid.apiKey')) || 
      (emailProvider === 'smtp' && !config.get('email.smtp.host'))) {
    console.log(chalk.yellow('\n【建议】设置邮件服务参数:'));
    console.log('1. 在 .env 文件中填入SendGrid API密钥或SMTP配置');
    console.log('2. 确保设置了正确的EMAIL_PROVIDER值');
  }
  
  showMenu();
}

// 启动应用
console.log(chalk.green.bold('\n欢迎使用 NexusOrbital 服务测试工具\n'));
showMenu();
