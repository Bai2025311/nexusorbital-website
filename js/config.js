/**
 * NexusOrbital 环境配置文件
 * 用于管理不同环境（开发、测试、生产）的配置参数
 */

// 当前环境，可以基于URL或者部署时设置
const ENV = (function() {
    // 检测环境: 可以根据域名或localStorage中的环境变量来判断
    const host = window.location.hostname;
    
    if (localStorage.getItem('nexus_env')) {
        return localStorage.getItem('nexus_env');
    } else if (host === 'localhost' || host === '127.0.0.1') {
        return 'development';
    } else if (host.includes('test') || host.includes('staging')) {
        return 'testing';
    } else {
        return 'production';
    }
})();

/**
 * 环境配置
 */
const CONFIG = {
    // 开发环境
    development: {
        API_BASE_URL: 'http://localhost:3060/api',
        ASSETS_URL: '/assets',
        AUTH_TOKEN_NAME: 'nexus_auth_token',
        USER_DATA_NAME: 'nexus_user',
        DEBUG: true,
        JWT_LIFESPAN: '7d',
        VERIFICATION_CODE_EXPIRE: 300 // 5分钟
    },
    
    // 测试环境
    testing: {
        API_BASE_URL: 'https://test-api.nexusorbital.com/api',
        ASSETS_URL: 'https://test-cdn.nexusorbital.com/assets',
        AUTH_TOKEN_NAME: 'nexus_auth_token',
        USER_DATA_NAME: 'nexus_user',
        DEBUG: true,
        JWT_LIFESPAN: '7d',
        VERIFICATION_CODE_EXPIRE: 300 // 5分钟
    },
    
    // 生产环境
    production: {
        API_BASE_URL: 'https://api.nexusorbital.com/api',
        ASSETS_URL: 'https://cdn.nexusorbital.com/assets',
        AUTH_TOKEN_NAME: 'nexus_auth_token',
        USER_DATA_NAME: 'nexus_user',
        DEBUG: false,
        JWT_LIFESPAN: '30d',
        VERIFICATION_CODE_EXPIRE: 300 // 5分钟
    }
};

/**
 * 导出当前环境的配置
 */
window.NexusConfig = {
    // 当前环境
    ENV: ENV,
    
    // 所有配置
    ...CONFIG[ENV],
    
    /**
     * 获取API URL
     * @param {string} endpoint API端点
     * @returns {string} 完整的API URL
     */
    getApiUrl: function(endpoint) {
        const baseUrl = CONFIG[ENV].API_BASE_URL;
        // 确保endpoint不以/开头，以避免重复
        if (endpoint.startsWith('/')) {
            endpoint = endpoint.substring(1);
        }
        return `${baseUrl}/${endpoint}`;
    },
    
    /**
     * 获取资源URL
     * @param {string} path 资源路径
     * @returns {string} 完整的资源URL
     */
    getAssetUrl: function(path) {
        const baseUrl = CONFIG[ENV].ASSETS_URL;
        // 确保path不以/开头，以避免重复
        if (path.startsWith('/')) {
            path = path.substring(1);
        }
        return `${baseUrl}/${path}`;
    },
    
    /**
     * 设置环境
     * @param {string} env 环境名称 (development, testing, production)
     */
    setEnvironment: function(env) {
        if (CONFIG[env]) {
            localStorage.setItem('nexus_env', env);
            window.location.reload();
        } else {
            console.error(`无效的环境: ${env}`);
        }
    },
    
    /**
     * 获取认证令牌
     * @returns {string|null} JWT令牌
     */
    getAuthToken: function() {
        return localStorage.getItem(CONFIG[ENV].AUTH_TOKEN_NAME);
    },
    
    /**
     * 存储认证令牌
     * @param {string} token JWT令牌
     */
    setAuthToken: function(token) {
        localStorage.setItem(CONFIG[ENV].AUTH_TOKEN_NAME, token);
    },
    
    /**
     * 清除认证令牌
     */
    clearAuthToken: function() {
        localStorage.removeItem(CONFIG[ENV].AUTH_TOKEN_NAME);
        localStorage.removeItem(CONFIG[ENV].USER_DATA_NAME);
    },
    
    /**
     * 获取当前用户信息
     * @returns {Object|null} 用户信息
     */
    getCurrentUser: function() {
        const userJson = localStorage.getItem(CONFIG[ENV].USER_DATA_NAME);
        if (userJson) {
            try {
                return JSON.parse(userJson);
            } catch (e) {
                console.error('解析用户信息出错:', e);
                return null;
            }
        }
        return null;
    },
    
    /**
     * 设置当前用户信息
     * @param {Object} user 用户信息
     */
    setCurrentUser: function(user) {
        localStorage.setItem(CONFIG[ENV].USER_DATA_NAME, JSON.stringify(user));
    },
    
    /**
     * 记录日志（仅在DEBUG模式下）
     * @param {string} level 日志级别 (log, info, warn, error)
     * @param {string} message 日志消息
     * @param {any} data 相关数据
     */
    log: function(level, message, data = null) {
        if (CONFIG[ENV].DEBUG) {
            const timestamp = new Date().toISOString();
            const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
            
            switch (level.toLowerCase()) {
                case 'info':
                    console.info(formattedMessage, data || '');
                    break;
                case 'warn':
                    console.warn(formattedMessage, data || '');
                    break;
                case 'error':
                    console.error(formattedMessage, data || '');
                    break;
                default:
                    console.log(formattedMessage, data || '');
            }
        }
    }
};
