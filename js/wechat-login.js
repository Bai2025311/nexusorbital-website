/**
 * 微信扫码登录前端集成
 * 与后端API对接实现真实的微信登录流程
 */

// 微信登录状态常量
const WX_LOGIN_STATUS = {
    WAITING: 'waiting',     // 等待扫码
    SCANNED: 'scanned',     // 已扫码
    AUTHORIZED: 'authorized', // 已授权
    EXPIRED: 'expired',     // 已过期
    ERROR: 'error'          // 错误
};

/**
 * 获取微信登录二维码
 * @returns {Promise<Object>} 包含state和qrcodeUrl的对象
 */
function getWechatQrCode() {
    // 实际应用中连接后端API
    // return fetch('/api/wx/qrcode')
    //     .then(res => res.json())
    //     .then(data => {
    //         if (data.success) {
    //             return data.data;
    //         }
    //         throw new Error('获取二维码失败');
    //     });
    
    // 模拟实现
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                state: "demo-" + Math.random().toString(36).substring(2, 10),
                qrcodeUrl: "https://nexusorbital.com/demo-weixin-login"
            });
        }, 500);
    });
}

/**
 * 检查微信登录状态
 * @param {string} state 登录状态码
 * @returns {Promise<Object>} 登录状态结果
 */
function checkWechatLoginStatus(state) {
    // 实际应用中连接后端API
    // return fetch(`/api/wx/check?state=${state}`)
    //     .then(res => res.json())
    //     .then(data => {
    //         if (data.success) {
    //             return data;
    //         }
    //         throw new Error('检查状态失败');
    //     });
    
    // 模拟实现，仅用于演示
    return new Promise((resolve) => {
        // 根据全局状态模拟不同阶段的状态
        const currentStatus = window._wxDemoStatus || WX_LOGIN_STATUS.WAITING;
        
        setTimeout(() => {
            if (currentStatus === WX_LOGIN_STATUS.AUTHORIZED) {
                resolve({
                    success: true,
                    status: WX_LOGIN_STATUS.AUTHORIZED,
                    data: {
                        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImRlbW8tdXNlciIsIm5pY2tuYW1lIjoi5b6u5L+h55So5oi3IiwiaWF0IjoxNjE2NTc2MDAwLCJleHAiOjE2MTcxODA4MDB9.Lf4TBmCAwgGmbyzA4qQJkkN2XkYHyqjLVXqR4xKp1Vc",
                        userInfo: {
                            nickname: "微信用户",
                            avatar: "https://thirdwx.qlogo.cn/mmopen/vi_32/example/132"
                        }
                    }
                });
            } else {
                resolve({
                    success: true,
                    status: currentStatus
                });
            }
        }, 300);
    });
}

/**
 * 启动微信二维码登录流程
 * @param {HTMLElement} container 用于显示二维码的容器元素
 * @param {Function} onLoginSuccess 登录成功的回调函数
 * @param {Function} onStatusChange 状态变化的回调函数
 * @returns {Object} 控制对象，包含stop方法
 */
function startWechatQrLogin(container, onLoginSuccess, onStatusChange) {
    let polling = false;
    let state = null;
    let timer = null;
    let stopRequested = false;
    
    // 停止轮询
    function stopPolling() {
        polling = false;
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
    }
    
    // 更新UI显示
    function updateUI(status, qrcodeUrl) {
        if (!container || stopRequested) return;
        
        switch (status) {
            case WX_LOGIN_STATUS.WAITING:
                container.innerHTML = `
                    <div class="wx-qrcode-container">
                        <img src="${qrcodeUrl ? 'img/demo-wxqrcode.png' : ''}" alt="微信二维码" onerror="this.src='https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrcodeUrl)}'">
                        <div class="wx-qrcode-tips">请使用微信扫描二维码登录</div>
                    </div>
                `;
                break;
                
            case WX_LOGIN_STATUS.SCANNED:
                const existingImg = container.querySelector('img');
                // 添加扫描成功的遮罩层
                if (existingImg && !container.querySelector('.wx-qrcode-scanned')) {
                    const overlay = document.createElement('div');
                    overlay.className = 'wx-qrcode-scanned';
                    overlay.innerHTML = `
                        <i class="fas fa-check-circle"></i>
                        <p>微信扫码成功</p>
                        <p class="wx-confirm-tip">请在微信中点击确认</p>
                    `;
                    container.querySelector('.wx-qrcode-container').appendChild(overlay);
                    container.querySelector('.wx-qrcode-tips').textContent = '扫描成功！请在微信中点击授权按钮';
                    container.querySelector('.wx-qrcode-tips').style.color = '#07C160';
                }
                break;
                
            case WX_LOGIN_STATUS.EXPIRED:
                container.innerHTML = `
                    <div class="wx-qrcode-expired">
                        <i class="fas fa-exclamation-circle"></i>
                        <p>二维码已过期</p>
                        <button class="wx-refresh-btn">刷新二维码</button>
                    </div>
                `;
                // 绑定刷新按钮
                const refreshBtn = container.querySelector('.wx-refresh-btn');
                if (refreshBtn) {
                    refreshBtn.addEventListener('click', () => {
                        startQrLoginProcess();
                    });
                }
                break;
                
            case WX_LOGIN_STATUS.ERROR:
                container.innerHTML = `
                    <div class="wx-qrcode-error">
                        <i class="fas fa-times-circle"></i>
                        <p>登录错误，请重试</p>
                        <button class="wx-retry-btn">重试</button>
                    </div>
                `;
                // 绑定重试按钮
                const retryBtn = container.querySelector('.wx-retry-btn');
                if (retryBtn) {
                    retryBtn.addEventListener('click', () => {
                        startQrLoginProcess();
                    });
                }
                break;
        }
        
        // 触发状态变化回调
        if (onStatusChange && typeof onStatusChange === 'function') {
            onStatusChange(status);
        }
    }
    
    // 轮询检查登录状态
    function pollLoginStatus() {
        if (!polling || !state || stopRequested) return;
        
        checkWechatLoginStatus(state)
            .then(response => {
                if (stopRequested) return;
                
                const status = response.status;
                
                // 触发状态变化回调
                if (onStatusChange) {
                    onStatusChange(status);
                }
                
                // 更新UI
                updateUI(status);
                
                // 如果已授权，则触发登录成功
                if (status === WX_LOGIN_STATUS.AUTHORIZED) {
                    if (onLoginSuccess && response.data) {
                        onLoginSuccess(response.data);
                    }
                    stopPolling();
                    return;
                }
                
                // 如果状态是waiting或scanned，继续轮询
                if (status === WX_LOGIN_STATUS.WAITING || status === WX_LOGIN_STATUS.SCANNED) {
                    // 为了演示效果，模拟状态变化
                    // 仅用于演示，实际应用中不需要
                    if (status === WX_LOGIN_STATUS.WAITING && !window._wxDemoStatus) {
                        setTimeout(() => {
                            // 模拟5秒后扫码
                            window._wxDemoStatus = WX_LOGIN_STATUS.SCANNED;
                            // 再模拟3秒后授权
                            setTimeout(() => {
                                window._wxDemoStatus = WX_LOGIN_STATUS.AUTHORIZED;
                            }, 3000);
                        }, 5000);
                    }
                    
                    // 继续轮询
                    timer = setTimeout(pollLoginStatus, 2000);
                } else if (status === WX_LOGIN_STATUS.EXPIRED) {
                    // 二维码已过期
                    updateUI(WX_LOGIN_STATUS.EXPIRED);
                    stopPolling();
                } else {
                    // 其他错误状态
                    updateUI(WX_LOGIN_STATUS.ERROR);
                    stopPolling();
                }
            })
            .catch(error => {
                console.error('微信登录状态检查失败', error);
                if (stopRequested) return;
                
                updateUI(WX_LOGIN_STATUS.ERROR);
                stopPolling();
            });
    }
    
    // 启动二维码登录流程
    function startQrLoginProcess() {
        if (stopRequested) return;
        
        // 重置状态
        stopPolling();
        state = null;
        window._wxDemoStatus = null;
        
        // 显示加载中
        container.innerHTML = `
            <div class="wx-qrcode-loading">
                <div class="loading-spinner"></div>
                <p>正在加载二维码...</p>
            </div>
        `;
        
        // 获取二维码
        getWechatQrCode()
            .then(data => {
                if (stopRequested) return;
                
                state = data.state;
                
                // 显示二维码
                updateUI(WX_LOGIN_STATUS.WAITING, data.qrcodeUrl);
                
                // 开始轮询
                polling = true;
                pollLoginStatus();
            })
            .catch(error => {
                console.error('获取微信二维码失败', error);
                if (stopRequested) return;
                
                updateUI(WX_LOGIN_STATUS.ERROR);
            });
    }
    
    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
        .wx-qrcode-container {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            position: relative;
        }
        .wx-qrcode-container img {
            width: 200px;
            height: 200px;
            display: block;
        }
        .wx-qrcode-tips {
            margin-top: 10px;
            color: #333;
            font-size: 14px;
        }
        .wx-qrcode-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
        }
        .wx-qrcode-loading .loading-spinner {
            border: 3px solid #f3f3f3;
            border-radius: 50%;
            border-top: 3px solid #07C160;
            width: 30px;
            height: 30px;
            animation: wxSpinAnimation 1s linear infinite;
            margin-bottom: 10px;
        }
        .wx-qrcode-loading p {
            color: #333;
            font-size: 14px;
        }
        .wx-qrcode-scanned {
            position: absolute;
            top: 0;
            left: 0;
            width: 200px;
            height: 200px;
            background-color: rgba(7, 193, 96, 0.85);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: white;
            text-align: center;
        }
        .wx-qrcode-scanned i {
            font-size: 40px;
            margin-bottom: 10px;
        }
        .wx-qrcode-scanned p {
            margin: 5px 0;
            font-size: 16px;
        }
        .wx-qrcode-scanned .wx-confirm-tip {
            font-size: 12px;
            opacity: 0.8;
        }
        .wx-qrcode-expired, .wx-qrcode-error {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 30px;
        }
        .wx-qrcode-expired i, .wx-qrcode-error i {
            font-size: 40px;
            margin-bottom: 15px;
            color: #ff9800;
        }
        .wx-qrcode-error i {
            color: #f44336;
        }
        .wx-qrcode-expired p, .wx-qrcode-error p {
            margin: 10px 0;
            color: #333;
            font-size: 14px;
        }
        .wx-refresh-btn, .wx-retry-btn {
            margin-top: 15px;
            padding: 8px 20px;
            background-color: #07C160;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .wx-refresh-btn:hover, .wx-retry-btn:hover {
            background-color: #06a452;
            transform: translateY(-2px);
        }
        @keyframes wxSpinAnimation {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    // 立即启动流程
    startQrLoginProcess();
    
    // 返回控制对象
    return {
        stop: () => {
            stopRequested = true;
            stopPolling();
            if (container) {
                container.innerHTML = '';
            }
            document.head.removeChild(style);
        },
        refresh: startQrLoginProcess
    };
}

// 导出函数
window.WechatQrLogin = {
    start: startWechatQrLogin
};
