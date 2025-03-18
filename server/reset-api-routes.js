/**
 * NexusOrbital密码重置API路由
 * 提供密码重置相关的API接口
 */

// 导出路由处理函数
module.exports = function(apiRouter, passwordResetService, users, saveUsers, logger) {
    const asyncHandler = fn => (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };

    // 请求密码重置（发送验证码）
    apiRouter.post('/password-reset/request', asyncHandler(async (req, res) => {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ success: false, message: '邮箱地址必填' });
        }
        
        try {
            // 查找用户
            const user = users.find(u => u.email === email);
            if (!user) {
                return res.status(404).json({ success: false, message: '该邮箱未注册' });
            }
            
            // 生成并发送重置令牌
            await passwordResetService.generateResetToken(email, user.username || '用户');
            
            // 记录日志
            logger.info(`密码重置请求: ${email}`);
            
            res.json({ success: true, message: '验证码已发送到邮箱' });
        } catch (error) {
            logger.error(`密码重置请求出错: ${error.message}`);
            res.status(500).json({ success: false, message: '发送验证码失败，请稍后重试' });
        }
    }));

    // 验证重置码
    apiRouter.post('/password-reset/verify', asyncHandler(async (req, res) => {
        const { email, code } = req.body;
        
        if (!email || !code) {
            return res.status(400).json({ success: false, message: '邮箱和验证码必填' });
        }
        
        try {
            // 验证重置令牌
            const isValid = passwordResetService.verifyResetToken(email, code);
            
            if (!isValid) {
                return res.status(400).json({ success: false, message: '验证码无效或已过期' });
            }
            
            res.json({ success: true, message: '验证码验证成功' });
        } catch (error) {
            logger.error(`验证码验证出错: ${error.message}`);
            res.status(500).json({ success: false, message: '验证失败，请稍后重试' });
        }
    }));

    // 完成密码重置
    apiRouter.post('/password-reset/complete', asyncHandler(async (req, res) => {
        const { email, code, newPassword } = req.body;
        
        if (!email || !code || !newPassword) {
            return res.status(400).json({ success: false, message: '所有字段必填' });
        }
        
        try {
            // 完成重置（验证并消费令牌）
            const resetCompleted = passwordResetService.completeReset(email, code);
            
            if (!resetCompleted) {
                return res.status(400).json({ success: false, message: '验证码无效或已过期' });
            }
            
            // 查找用户
            const userIndex = users.findIndex(u => u.email === email);
            if (userIndex === -1) {
                return res.status(404).json({ success: false, message: '用户不存在' });
            }
            
            // 更新密码
            const { hash, salt } = passwordResetService.hashPassword(newPassword);
            users[userIndex].password = hash;
            users[userIndex].salt = salt;
            
            // 保存用户数据
            saveUsers();
            
            // 记录日志
            logger.info(`密码重置成功: ${email}`);
            
            res.json({ success: true, message: '密码重置成功' });
        } catch (error) {
            logger.error(`密码重置出错: ${error.message}`);
            res.status(500).json({ success: false, message: '密码重置失败，请稍后重试' });
        }
    }));
};
