/**
 * NexusOrbital密码重置模块
 * 
 * 提供用户密码重置功能，包括验证码生成、发送和验证
 */

const createEmailService = require('./email-service');
const { getEmailConfig } = require('./email-config');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * 创建密码重置服务
 * @param {Object} config 配置选项
 * @returns {Object} 密码重置服务对象
 */
function createPasswordResetService(config = {}) {
    // 默认配置
    const defaultConfig = {
        dbPath: path.join(__dirname, '../data/reset_tokens.json'),
        tokenExpiryMinutes: 30,
        emailService: null
    };

    const serviceConfig = { ...defaultConfig, ...config };
    let resetTokens = {};
    let emailService = serviceConfig.emailService;

    // 如果没有提供邮件服务，则创建一个
    if (!emailService) {
        const emailConfig = getEmailConfig();
        emailService = createEmailService(emailConfig);
    }

    // 确保数据目录存在
    const dataDir = path.dirname(serviceConfig.dbPath);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    // 加载现有的重置令牌
    if (fs.existsSync(serviceConfig.dbPath)) {
        try {
            const data = fs.readFileSync(serviceConfig.dbPath, 'utf8');
            resetTokens = JSON.parse(data);

            // 清理过期的令牌
            cleanExpiredTokens();
        } catch (error) {
            console.error('加载密码重置令牌失败:', error);
            resetTokens = {};
        }
    } else {
        // 创建新的令牌存储文件
        saveTokens();
    }

    /**
     * 保存令牌到文件
     */
    function saveTokens() {
        try {
            fs.writeFileSync(serviceConfig.dbPath, JSON.stringify(resetTokens, null, 2), 'utf8');
        } catch (error) {
            console.error('保存密码重置令牌失败:', error);
        }
    }

    /**
     * 清理过期的令牌
     */
    function cleanExpiredTokens() {
        const now = Date.now();
        let hasExpired = false;

        Object.keys(resetTokens).forEach(email => {
            if (resetTokens[email].expiry < now) {
                delete resetTokens[email];
                hasExpired = true;
            }
        });

        if (hasExpired) {
            saveTokens();
        }
    }

    /**
     * 生成密码重置令牌
     * @param {string} email 用户邮箱
     * @param {string} username 用户名
     * @returns {Promise<Object>} 包含令牌和过期时间的对象
     */
    async function generateResetToken(email, username) {
        // 清理过期的令牌
        cleanExpiredTokens();

        return new Promise((resolve, reject) => {
            // 发送重置邮件
            emailService.sendPasswordResetEmail(email, username, (error, result) => {
                if (error) {
                    return reject(error);
                }

                const { code } = result;
                const expiry = Date.now() + (serviceConfig.tokenExpiryMinutes * 60 * 1000);

                // 存储重置令牌
                resetTokens[email] = {
                    code,
                    expiry,
                    username
                };

                saveTokens();
                resolve({ code, expiry });
            });
        });
    }

    /**
     * 验证重置令牌
     * @param {string} email 用户邮箱
     * @param {string} code 验证码
     * @returns {boolean} 验证结果
     */
    function verifyResetToken(email, code) {
        cleanExpiredTokens();

        if (!resetTokens[email]) {
            return false;
        }

        const tokenInfo = resetTokens[email];
        
        // 验证令牌是否过期
        if (tokenInfo.expiry < Date.now()) {
            delete resetTokens[email];
            saveTokens();
            return false;
        }

        // 验证码比较
        if (tokenInfo.code === code) {
            return true;
        }

        return false;
    }

    /**
     * 完成密码重置
     * @param {string} email 用户邮箱
     * @param {string} code 验证码
     * @returns {boolean} 重置结果
     */
    function completeReset(email, code) {
        if (verifyResetToken(email, code)) {
            // 删除使用过的令牌
            delete resetTokens[email];
            saveTokens();
            return true;
        }
        return false;
    }

    /**
     * 生成安全的哈希密码
     * @param {string} password 明文密码
     * @returns {Object} 包含哈希和盐的对象
     */
    function hashPassword(password) {
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
        return { hash, salt };
    }

    // 定期清理过期令牌（每5分钟）
    setInterval(cleanExpiredTokens, 5 * 60 * 1000);

    // 返回服务接口
    return {
        generateResetToken,
        verifyResetToken,
        completeReset,
        hashPassword
    };
}

module.exports = createPasswordResetService;
