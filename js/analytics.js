// 分析跟踪模块
window.NexusOrbital = window.NexusOrbital || {};

// 分析跟踪模块
NexusOrbital.Analytics = (function() {
  // 私有变量
  const EVENT_STORAGE_KEY = 'nexus_orbital_events';
  const EVENT_BATCH_LIMIT = 20;
  
  // 从localStorage加载事件
  function loadEventsFromStorage() {
    const storedEvents = localStorage.getItem(EVENT_STORAGE_KEY);
    if (!storedEvents) return [];
    
    try {
      return JSON.parse(storedEvents);
    } catch (e) {
      console.error('Failed to parse stored events:', e);
      return [];
    }
  }
  
  // 保存事件到localStorage
  function saveEventsToStorage(events) {
    localStorage.setItem(EVENT_STORAGE_KEY, JSON.stringify(events));
  }
  
  // 保存单个事件到localStorage
  function saveEventToLocalStorage(event) {
    const events = loadEventsFromStorage();
    events.push(event);
    
    // 限制存储事件数量
    if (events.length > 500) {
      events.splice(0, events.length - 500);
    }
    
    saveEventsToStorage(events);
  }
  
  // 发送事件到服务器
  function sendEventToServer(event) {
    // MVP阶段模拟发送
    console.log('Sending event to server:', event);
    
    // 实际实现时取消注释以下代码
    /*
    const apiUrl = NexusOrbital.Config.getApiUrl() + '/analytics/events';
    
    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(event)
    }).catch(err => {
      console.error('Failed to send event:', err);
    });
    */
  }
  
  // 发送批量事件
  function sendBatchEvents() {
    const events = loadEventsFromStorage();
    if (events.length === 0) return;
    
    // 取出前20条
    const batch = events.slice(0, EVENT_BATCH_LIMIT);
    
    // 模拟发送
    console.log('Sending batch events:', batch);
    
    // 成功后从存储中移除
    const remaining = events.slice(EVENT_BATCH_LIMIT);
    saveEventsToStorage(remaining);
  }
  
  // 获取用户ID
  function getUserId() {
    // 检查是否为注册用户
    const token = sessionStorage.getItem('token');
    if (token) {
      try {
        const user = JSON.parse(atob(token.split('.')[1]));
        return user.id || user.sub || 'unknown_user';
      } catch (e) {
        console.error('Failed to parse token:', e);
      }
    }
    
    // 检查是否为探索者
    if (NexusOrbital.ExplorerMode && NexusOrbital.ExplorerMode.isExplorerMode()) {
      const explorer = NexusOrbital.ExplorerMode.getExplorerInfo();
      return explorer ? explorer.id : 'unknown_explorer';
    }
    
    // 匿名用户 - 使用或创建设备ID
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
      deviceId = 'anon_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('device_id', deviceId);
    }
    
    return deviceId;
  }
  
  // 获取用户类型
  function getUserType() {
    // 检查是否为注册用户
    const token = sessionStorage.getItem('token');
    if (token) {
      try {
        const user = JSON.parse(atob(token.split('.')[1]));
        return user.role || 'registered';
      } catch (e) {
        console.error('Failed to parse token:', e);
        return 'registered';
      }
    }
    
    // 检查是否为探索者
    if (NexusOrbital.ExplorerMode && NexusOrbital.ExplorerMode.isExplorerMode()) {
      return 'explorer';
    }
    
    // 匿名用户
    return 'anonymous';
  }
  
  // 跟踪事件
  function trackEvent(eventName, eventData = {}) {
    // 构建事件对象
    const event = {
      event: eventName,
      timestamp: new Date().toISOString(),
      user_id: getUserId(),
      user_type: getUserType(),
      page: window.location.pathname,
      session_id: getSessionId(),
      ...eventData
    };
    
    // 存储到本地
    saveEventToLocalStorage(event);
    
    // 如果在线，尝试立即发送
    if (navigator.onLine) {
      sendEventToServer(event);
    }
    
    return event;
  }
  
  // 获取或创建会话ID
  function getSessionId() {
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
      sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  }
  
  // 初始化
  function init() {
    // 设置定期发送批量事件
    setInterval(sendBatchEvents, 30000); // 每30秒
    
    // 在页面卸载时尝试发送剩余事件
    window.addEventListener('beforeunload', function() {
      sendBatchEvents();
    });
    
    // 页面加载事件
    trackEvent('page_view', {
      url: window.location.href,
      referrer: document.referrer,
      title: document.title
    });
    
    console.log('NexusOrbital Analytics initialized');
  }
  
  // 公共API
  return {
    init: init,
    trackEvent: trackEvent,
    getUserId: getUserId,
    getUserType: getUserType
  };
})();

// 自动初始化
document.addEventListener('DOMContentLoaded', function() {
  NexusOrbital.Analytics.init();
});
