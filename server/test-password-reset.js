/**
 * NexusOrbital密码重置API测试脚本
 * 
 * 自动测试密码重置流程的三个步骤：
 * 1. 请求重置验证码
 * 2. 验证验证码
 * 3. 完成密码重置
 */

const fetch = require('node-fetch');
const readline = require('readline');

// 创建readline接口
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// 配置参数
const config = {
    apiUrl: 'http://localhost:3070/api', // 根据实际运行的端口调整
    testEmail: 'test@example.com',
    newPassword: 'NewPassword123'
};

// 颜色代码
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

// 打印标题
console.log(`${colors.bright}${colors.cyan}=========================================`);
console.log(`NexusOrbital 密码重置API测试工具`);
console.log(`==========================================${colors.reset}\n`);

// 测试API连接
async function testApiConnection() {
    try {
        console.log(`${colors.dim}测试API连接...${colors.reset}`);
        
        const response = await fetch(`${config.apiUrl}/test`);
        const data = await response.json();
        
        if (data.success) {
            console.log(`${colors.green}✓ API连接成功: ${data.message}${colors.reset}\n`);
            return true;
        } else {
            console.error(`${colors.red}✗ API连接失败: ${data.message}${colors.reset}\n`);
            return false;
        }
    } catch (error) {
        console.error(`${colors.red}✗ API连接错误: ${error.message}${colors.reset}\n`);
        return false;
    }
}

// 请求重置验证码
async function requestResetCode() {
    try {
        console.log(`${colors.cyan}步骤1: 请求密码重置验证码${colors.reset}`);
        console.log(`${colors.dim}发送请求到: ${config.apiUrl}/password-reset/request${colors.reset}`);
        console.log(`${colors.dim}请求体: { email: "${config.testEmail}" }${colors.reset}`);
        
        const response = await fetch(`${config.apiUrl}/password-reset/request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: config.testEmail })
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log(`${colors.green}✓ 验证码发送成功: ${data.message}${colors.reset}\n`);
            return true;
        } else {
            console.error(`${colors.red}✗ 验证码发送失败: ${data.message}${colors.reset}\n`);
            return false;
        }
    } catch (error) {
        console.error(`${colors.red}✗ 请求出错: ${error.message}${colors.reset}\n`);
        return false;
    }
}

// 验证验证码
async function verifyResetCode(code) {
    try {
        console.log(`${colors.cyan}步骤2: 验证重置验证码${colors.reset}`);
        console.log(`${colors.dim}发送请求到: ${config.apiUrl}/password-reset/verify${colors.reset}`);
        console.log(`${colors.dim}请求体: { email: "${config.testEmail}", code: "${code}" }${colors.reset}`);
        
        const response = await fetch(`${config.apiUrl}/password-reset/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                email: config.testEmail, 
                code: code 
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log(`${colors.green}✓ 验证码验证成功: ${data.message}${colors.reset}\n`);
            return true;
        } else {
            console.error(`${colors.red}✗ 验证码验证失败: ${data.message}${colors.reset}\n`);
            return false;
        }
    } catch (error) {
        console.error(`${colors.red}✗ 请求出错: ${error.message}${colors.reset}\n`);
        return false;
    }
}

// 完成密码重置
async function completePasswordReset(code) {
    try {
        console.log(`${colors.cyan}步骤3: 完成密码重置${colors.reset}`);
        console.log(`${colors.dim}发送请求到: ${config.apiUrl}/password-reset/complete${colors.reset}`);
        console.log(`${colors.dim}请求体: { email: "${config.testEmail}", code: "${code}", newPassword: "${config.newPassword}" }${colors.reset}`);
        
        const response = await fetch(`${config.apiUrl}/password-reset/complete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                email: config.testEmail, 
                code: code, 
                newPassword: config.newPassword 
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log(`${colors.green}✓ 密码重置成功: ${data.message}${colors.reset}\n`);
            return true;
        } else {
            console.error(`${colors.red}✗ 密码重置失败: ${data.message}${colors.reset}\n`);
            return false;
        }
    } catch (error) {
        console.error(`${colors.red}✗ 请求出错: ${error.message}${colors.reset}\n`);
        return false;
    }
}

// 主函数
async function main() {
    try {
        // 显示当前配置
        console.log(`${colors.yellow}当前配置:${colors.reset}`);
        console.log(`  API地址: ${config.apiUrl}`);
        console.log(`  测试邮箱: ${config.testEmail}`);
        console.log(`  新密码: ${config.newPassword}\n`);
        
        // 测试API连接
        const apiConnected = await testApiConnection();
        if (!apiConnected) {
            console.error(`${colors.red}无法连接到API，请确保服务器已启动并监听正确的端口${colors.reset}`);
            rl.close();
            return;
        }
        
        // 询问用户是否自定义测试邮箱
        rl.question(`${colors.yellow}是否使用其他测试邮箱? (y/n) [默认: n]: ${colors.reset}`, async (answer) => {
            if (answer.toLowerCase() === 'y') {
                rl.question(`${colors.yellow}请输入测试邮箱: ${colors.reset}`, async (email) => {
                    config.testEmail = email;
                    console.log(`${colors.dim}已设置测试邮箱为: ${config.testEmail}${colors.reset}\n`);
                    await runTests();
                });
            } else {
                await runTests();
            }
        });
    } catch (error) {
        console.error(`${colors.red}测试过程中出错: ${error.message}${colors.reset}`);
        rl.close();
    }
}

// 运行测试流程
async function runTests() {
    // 步骤1: 请求重置验证码
    const requestSuccess = await requestResetCode();
    if (!requestSuccess) {
        console.error(`${colors.red}无法继续测试，请求验证码失败${colors.reset}`);
        rl.close();
        return;
    }
    
    // 提示用户输入验证码
    rl.question(`${colors.yellow}请输入收到的验证码 (查看控制台输出): ${colors.reset}`, async (code) => {
        // 步骤2: 验证验证码
        const verifySuccess = await verifyResetCode(code);
        if (!verifySuccess) {
            console.error(`${colors.red}无法继续测试，验证码验证失败${colors.reset}`);
            rl.close();
            return;
        }
        
        // 步骤3: 完成密码重置
        const resetSuccess = await completePasswordReset(code);
        
        // 显示测试结果摘要
        console.log(`${colors.cyan}========== 测试结果摘要 ==========${colors.reset}`);
        console.log(`步骤1 (请求验证码): ${requestSuccess ? colors.green + '成功' : colors.red + '失败'}${colors.reset}`);
        console.log(`步骤2 (验证验证码): ${verifySuccess ? colors.green + '成功' : colors.red + '失败'}${colors.reset}`);
        console.log(`步骤3 (完成密码重置): ${resetSuccess ? colors.green + '成功' : colors.red + '失败'}${colors.reset}`);
        console.log(`${colors.cyan}=============================${colors.reset}\n`);
        
        if (requestSuccess && verifySuccess && resetSuccess) {
            console.log(`${colors.green}${colors.bright}所有测试通过! 密码重置功能正常工作。${colors.reset}`);
        } else {
            console.log(`${colors.red}${colors.bright}测试未全部通过，请检查失败步骤的错误信息。${colors.reset}`);
        }
        
        rl.close();
    });
}

// 启动测试
main();
