/**
 * 微信开放平台登录认证服务
 * 此文件演示了如何集成微信开放平台的网页扫码登录功能
 */

// 需要安装以下依赖：
// npm install express axios uuid jsonwebtoken cors

const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());

// 微信开放平台配置 (实际应用中需要替换为自己的)
const WX_CONFIG = {
    APP_ID: 'wx_appid_replace_with_yours',      // 替换为您的 AppID
    APP_SECRET: 'wx_appsecret_replace_with_yours', // 替换为您的 AppSecret
    REDIRECT_URI: encodeURIComponent('https://nexusorbital.com/api/wx/callback')
};

// JWT 密钥 (实际应用中应放在环境变量中)
const JWT_SECRET = 'nexusorbital_jwt_secret_replace_with_yours';

// 存储微信扫码登录状态
const wxLoginStates = new Map();

/**
 * 获取微信登录二维码
 */
app.get('/api/wx/qrcode', (req, res) => {
    // 生成唯一状态码，用于跟踪扫码过程
    const state = uuidv4();
    
    // 存储登录状态
    wxLoginStates.set(state, {
        status: 'created',
        timestamp: Date.now(),
        userInfo: null
    });
    
    // 微信开放平台扫码登录链接
    const qrcodeUrl = `https://open.weixin.qq.com/connect/qrconnect?appid=${WX_CONFIG.APP_ID}&redirect_uri=${WX_CONFIG.REDIRECT_URI}&response_type=code&scope=snsapi_login&state=${state}#wechat_redirect`;
    
    // 返回状态和二维码地址
    res.json({
        success: true,
        data: {
            state,
            qrcodeUrl
        }
    });
});

/**
 * 检查微信登录状态
 */
app.get('/api/wx/check', (req, res) => {
    const { state } = req.query;
    
    if (!state || !wxLoginStates.has(state)) {
        return res.json({
            success: false,
            message: '无效的状态码'
        });
    }
    
    const loginState = wxLoginStates.get(state);
    
    // 如果已授权，生成JWT令牌
    if (loginState.status === 'authorized' && loginState.userInfo) {
        // 创建JWT令牌
        const token = jwt.sign({
            id: loginState.userInfo.unionid || loginState.userInfo.openid,
            nickname: loginState.userInfo.nickname,
            avatar: loginState.userInfo.headimgurl
        }, JWT_SECRET, { expiresIn: '7d' });
        
        // 清理状态数据
        wxLoginStates.delete(state);
        
        return res.json({
            success: true,
            status: 'authorized',
            data: {
                token,
                userInfo: {
                    nickname: loginState.userInfo.nickname,
                    avatar: loginState.userInfo.headimgurl
                }
            }
        });
    }
    
    // 返回当前状态
    res.json({
        success: true,
        status: loginState.status
    });
});

/**
 * 微信回调接口
 * 在微信开放平台配置中设置为回调地址
 */
app.get('/api/wx/callback', async (req, res) => {
    const { code, state } = req.query;
    
    if (!code || !state || !wxLoginStates.has(state)) {
        return res.status(400).send('无效的请求');
    }
    
    try {
        // 更新状态为已扫描
        wxLoginStates.set(state, {
            ...wxLoginStates.get(state),
            status: 'scanned'
        });
        
        // 1. 获取访问令牌
        const tokenResponse = await axios.get(
            `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${WX_CONFIG.APP_ID}&secret=${WX_CONFIG.APP_SECRET}&code=${code}&grant_type=authorization_code`
        );
        
        const { access_token, openid, unionid } = tokenResponse.data;
        
        if (!access_token || !openid) {
            throw new Error('获取微信访问令牌失败');
        }
        
        // 2. 获取用户信息
        const userInfoResponse = await axios.get(
            `https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openid}`
        );
        
        // 3. 更新登录状态
        wxLoginStates.set(state, {
            ...wxLoginStates.get(state),
            status: 'authorized',
            userInfo: {
                ...userInfoResponse.data,
                unionid: unionid || userInfoResponse.data.unionid
            }
        });
        
        // 4. 重定向到成功页面
        res.redirect(`/login-success.html?state=${state}`);
    } catch (error) {
        console.error('微信登录处理错误', error);
        res.status(500).send('微信登录处理失败');
    }
});

// 定期清理过期的登录状态
setInterval(() => {
    const now = Date.now();
    for (const [state, data] of wxLoginStates.entries()) {
        // 30分钟过期
        if (now - data.timestamp > 30 * 60 * 1000) {
            wxLoginStates.delete(state);
        }
    }
}, 5 * 60 * 1000); // 每5分钟清理一次

// 启动服务器
app.listen(PORT, () => {
    console.log(`微信认证服务器运行在端口 ${PORT}`);
});
