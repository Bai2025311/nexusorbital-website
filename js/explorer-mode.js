// 探索者模式功能模块
window.NexusOrbital = window.NexusOrbital || {};

// 探索者模式主模块
NexusOrbital.ExplorerMode = (function() {
  // 私有变量
  const EXPLORER_TOKEN_KEY = 'explorer_token';
  const EXPLORER_EXPIRY = 24 * 60 * 60; // 24小时（秒）
  
  // 事件监听器
  const eventListeners = {
    activated: [],
    deactivated: []
  };
  
  // 检查是否为探索者模式
  function isExplorerMode() {
    const explorerToken = sessionStorage.getItem(EXPLORER_TOKEN_KEY);
    if (!explorerToken) return false;
    
    try {
      const token = JSON.parse(explorerToken);
      const now = Math.floor(Date.now() / 1000);
      
      // 检查令牌是否过期
      if (token.exp && token.exp < now) {
        // 令牌已过期，清除
        sessionStorage.removeItem(EXPLORER_TOKEN_KEY);
        return false;
      }
      
      return true;
    } catch (e) {
      console.error('Explorer token parsing error:', e);
      sessionStorage.removeItem(EXPLORER_TOKEN_KEY);
      return false;
    }
  }
  
  // 启用探索者模式
  function enable() {
    return new Promise((resolve, reject) => {
      try {
        // 如果已经是探索者模式，则直接返回
        if (isExplorerMode()) {
          resolve();
          return;
        }
        
        // 生成临时ID
        const explorerId = `explorer_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        
        // 创建临时会话令牌
        const now = Math.floor(Date.now() / 1000);
        const explorerToken = {
          id: explorerId,
          role: 'explorer',
          permissions: ['view', 'read', 'vote', 'try_tools'],
          created: now,
          exp: now + EXPLORER_EXPIRY
        };
        
        // 存储到会话
        sessionStorage.setItem(EXPLORER_TOKEN_KEY, JSON.stringify(explorerToken));
        
        // 触发激活事件
        triggerEvent('activated');
        
        resolve();
      } catch (error) {
        console.error('启用探索者模式失败:', error);
        reject(error);
      }
    });
  }
  
  // 激活探索者模式（新版API）
  function activate() {
    // 如果已经是探索者模式，则直接返回
    if (isExplorerMode()) {
      return true;
    }
    
    // 生成临时ID
    const explorerId = `explorer_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // 创建临时会话令牌
    const now = Math.floor(Date.now() / 1000);
    const explorerToken = {
      id: explorerId,
      role: 'explorer',
      permissions: ['view', 'read', 'vote', 'try_tools'],
      created: now,
      exp: now + EXPLORER_EXPIRY
    };
    
    // 存储到会话
    sessionStorage.setItem(EXPLORER_TOKEN_KEY, JSON.stringify(explorerToken));
    
    // 触发激活事件
    triggerEvent('activated');
    
    return true;
  }
  
  // 获取探索者信息
  function getExplorerInfo() {
    if (!isExplorerMode()) return null;
    
    try {
      const explorerToken = JSON.parse(sessionStorage.getItem(EXPLORER_TOKEN_KEY));
      return {
        id: explorerToken.id,
        role: explorerToken.role,
        permissions: explorerToken.permissions,
        created: new Date(explorerToken.created * 1000),
        expiresAt: new Date(explorerToken.exp * 1000)
      };
    } catch (e) {
      console.error('获取探索者信息失败:', e);
      return null;
    }
  }
  
  // 检查权限
  function hasPermission(permission) {
    if (!isExplorerMode()) return false;
    
    const info = getExplorerInfo();
    return info && info.permissions && info.permissions.includes(permission);
  }
  
  // 禁用探索者模式
  function disable() {
    if (isExplorerMode()) {
      sessionStorage.removeItem(EXPLORER_TOKEN_KEY);
      triggerEvent('deactivated');
    }
  }
  
  // 停用探索者模式（新版API）
  function deactivate() {
    if (isExplorerMode()) {
      sessionStorage.removeItem(EXPLORER_TOKEN_KEY);
      triggerEvent('deactivated');
      return true;
    }
    return false;
  }
  
  // 添加事件监听器
  function addEventListener(eventName, callback) {
    if (!eventListeners[eventName]) {
      eventListeners[eventName] = [];
    }
    
    eventListeners[eventName].push(callback);
  }
  
  // 移除事件监听器
  function removeEventListener(eventName, callback) {
    if (!eventListeners[eventName]) return;
    
    eventListeners[eventName] = eventListeners[eventName].filter(cb => cb !== callback);
  }
  
  // 触发事件
  function triggerEvent(eventName, data = {}) {
    if (!eventListeners[eventName]) return;
    
    const event = new CustomEvent('explorermode:' + eventName, { detail: data });
    
    // 调用所有监听器
    eventListeners[eventName].forEach(callback => {
      try {
        callback(event);
      } catch (e) {
        console.error(`处理探索者模式 ${eventName} 事件时出错:`, e);
      }
    });
  }
  
  // 公共API
  return {
    enable: enable,
    disable: disable,
    activate: activate,
    deactivate: deactivate,
    isExplorerMode: isExplorerMode,
    isActive: isExplorerMode, // 别名，保持命名一致性
    getExplorerInfo: getExplorerInfo,
    hasPermission: hasPermission,
    addEventListener: addEventListener,
    removeEventListener: removeEventListener
  };
})();
