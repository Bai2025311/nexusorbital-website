/**
 * NexusOrbital 集成模块
 * 用于确保所有模块之间的无缝整合，如探索者模式与设计工具、社区功能的整合
 */
window.NexusOrbital = window.NexusOrbital || {};

// 集成模块
NexusOrbital.Integrations = (function() {
  // 配置
  const PERMISSION_MAPPINGS = {
    'view': ['community_view', 'design_tool_view'],
    'read': ['community_read', 'design_tutorial_read'],
    'vote': ['community_vote'],
    'try_tools': ['design_tool_basic', 'design_export_preview'],
    'explorer': ['design_tool_basic', 'design_export_preview', 'community_view', 'community_read']
  };
  
  // 私有变量
  let config = {};
  let initialized = false;

  // 探索者权限会映射到具体功能权限
  function mapExplorerPermissionToFeature(explorerPermission) {
    return PERMISSION_MAPPINGS[explorerPermission] || [];
  }

  // 检查用户权限（支持探索者和注册用户）
  function checkPermission(permissionName) {
    // 检查是否登录
    const isLoggedIn = NexusOrbital.Auth && NexusOrbital.Auth.isLoggedIn();
    const userData = isLoggedIn ? NexusOrbital.Auth.getCurrentUser() : null;
    const isExplorerMode = NexusOrbital.ExplorerMode && NexusOrbital.ExplorerMode.isActive();
    
    // 社区浏览权限对所有用户开放
    if (permissionName === 'community_view' || permissionName === 'community_read') {
      return true;
    }
    
    // 匿名用户基础权限
    if (PERMISSION_MAPPINGS.view.includes(permissionName)) {
      return true;
    }
    
    // 探索者模式权限
    if (isExplorerMode && PERMISSION_MAPPINGS.explorer.includes(permissionName)) {
      return true;
    }
    
    // 首先检查是否为注册用户
    if (isLoggedIn) {
      const user = NexusOrbital.Auth.getCurrentUser();
      // 注册用户权限检查
      if (user && user.permissions) {
        return user.permissions.includes(permissionName);
      }
      
      // 根据会员等级分配权限
      if (user && user.membership) {
        // 基础用户可访问的功能
        if (user.membership === 'basic') {
          const basicFeatures = [
            'community_view', 'community_read', 'community_vote',
            'design_tool_basic', 'design_export_preview'
          ];
          return basicFeatures.includes(permissionName);
        }
        
        // 专业用户可访问的功能
        if (user.membership === 'pro') {
          const proFeatures = [
            'community_view', 'community_read', 'community_vote', 'community_post',
            'design_tool_basic', 'design_tool_advanced', 'design_export_full'
          ];
          return proFeatures.includes(permissionName);
        }
        
        // 企业用户拥有所有权限
        if (user.membership === 'enterprise') {
          return true;
        }
      }
      
      return false;
    }
    
    // 然后检查是否为探索者
    if (NexusOrbital.ExplorerMode && NexusOrbital.ExplorerMode.isExplorerMode()) {
      const explorer = NexusOrbital.ExplorerMode.getExplorerInfo();
      if (explorer && explorer.permissions) {
        // 映射探索者权限到具体功能权限
        const mappedPermissions = [];
        explorer.permissions.forEach(p => {
          mappedPermissions.push(...mapExplorerPermissionToFeature(p));
        });
        
        return mappedPermissions.includes(permissionName);
      }
    }
    
    // 默认无权限
    return false;
  }

  // 整合设计工具与权限
  function integrateDesignTool() {
    // 检查设计工具模块是否存在
    if (!NexusOrbital.DesignTool) return;
    
    // 覆盖设计工具的导出功能，加入权限检查
    const originalExportDesign = NexusOrbital.DesignTool.exportDesign;
    NexusOrbital.DesignTool.exportDesign = function() {
      // 检查是否有导出权限
      if (checkPermission('design_export_full')) {
        // 有完整导出权限
        return originalExportDesign.apply(this, arguments);
      } else if (checkPermission('design_export_preview')) {
        // 只有预览导出权限（低分辨率水印版）
        showLimitedFeatureMessage('完整导出', '升级到专业版会员可导出高分辨率无水印设计');
        return exportWithWatermark();
      } else {
        // 无导出权限
        showFeatureRestrictedMessage('导出设计', 'pro');
        return false;
      }
    };
    
    // 检查高级设计功能
    const originalSelectShape = NexusOrbital.DesignTool.selectShape;
    NexusOrbital.DesignTool.selectShape = function(shapeId) {
      const shapes = NexusOrbital.DesignTool.getShapes();
      const shape = shapes.find(s => s.id === shapeId);
      
      if (shape && shape.tier === 'pro' && !checkPermission('design_tool_advanced')) {
        showFeatureRestrictedMessage('高级形状', 'pro');
        return false;
      }
      
      return originalSelectShape.apply(this, arguments);
    };
    
    const originalSelectMaterial = NexusOrbital.DesignTool.selectMaterial;
    NexusOrbital.DesignTool.selectMaterial = function(materialId) {
      const materials = NexusOrbital.DesignTool.getMaterials();
      const material = materials.find(m => m.id === materialId);
      
      if (material && material.tier === 'pro' && !checkPermission('design_tool_advanced')) {
        showFeatureRestrictedMessage('高级材质', 'pro');
        return false;
      }
      
      return originalSelectMaterial.apply(this, arguments);
    };
    
    // 记录设计工具事件
    if (NexusOrbital.Analytics) {
      const canvas = document.getElementById('design-canvas');
      if (canvas) {
        canvas.addEventListener('click', function() {
          NexusOrbital.Analytics.trackEvent('design_tool_interaction');
        });
      }
    }
  }

  // 整合社区功能与权限
  function integrateCommunity() {
    // 可以在这里添加对社区功能的权限检查
    // 例如，在发帖前检查是否有发帖权限
    document.addEventListener('click', function(e) {
      // 检查是否点击了发帖按钮
      if (e.target.matches('.new-post-btn, .fab-new-post') || 
          e.target.closest('.new-post-btn, .fab-new-post')) {
        
        // 阻止默认行为
        e.preventDefault();
        
        // 如果设置了禁用社区登录检查标志，并且用户未登录，显示友好提示
        if (window.disableCommunityLoginCheck && !isLoggedIn()) {
          showMessage('请先登录后再发帖', '点击右上角的"登录发帖"按钮进行登录');
          return false;
        }
        
        // 检查是否有发帖权限
        if (!checkPermission('community_post')) {
          showFeatureRestrictedMessage('发布社区内容', 'pro');
          return false;
        }
        
        // 有权限则继续原有逻辑
        if (typeof showPostModal === 'function') {
          showPostModal();
        }
      }
      
      // 处理社区内容点赞
      if (e.target.matches('.like-btn') || e.target.closest('.like-btn')) {
        // 如果设置了禁用社区登录检查标志，并且用户未登录，显示友好提示
        if (window.disableCommunityLoginCheck && !isLoggedIn()) {
          e.preventDefault();
          showMessage('请先登录后再点赞', '点击右上角的"登录发帖"按钮进行登录');
          return false;
        }
        
        // 确保匿名浏览时也可以看到点赞交互，但会引导用户登录或使用探索者模式
        if (!NexusOrbital.Auth?.isLoggedIn() && !NexusOrbital.ExplorerMode?.isExplorerMode()) {
          showLoginOrExplorerPrompt('点赞功能');
          return false;
        }
        
        // 跟踪点赞事件
        if (NexusOrbital.Analytics) {
          const postId = e.target.closest('[data-post-id]')?.dataset.postId;
          if (postId) {
            NexusOrbital.Analytics.trackEvent('community_like', { post_id: postId });
          }
        }
      }
    }, true);
    
    // 添加社区内容过滤器集成
    const filterButtons = document.querySelectorAll('.community-filter button');
    if (filterButtons) {
      filterButtons.forEach(button => {
        button.addEventListener('click', function() {
          // 记录过滤事件
          if (NexusOrbital.Analytics) {
            NexusOrbital.Analytics.trackEvent('community_filter_used', {
              filter: this.dataset.filter || this.textContent.trim()
            });
          }
        });
      });
    }
  }
  
  // 整合会员系统
  function integrateMembership() {
    if (!NexusOrbital.Membership) return;
    
    // 添加会员选择事件跟踪
    document.addEventListener('click', function(e) {
      // 检查是否点击了会员卡片
      if (e.target.matches('.membership-tier-card') || e.target.closest('.membership-tier-card')) {
        const tierId = e.target.closest('.membership-tier-card').dataset.tierId;
        if (tierId && NexusOrbital.Analytics) {
          NexusOrbital.Analytics.trackEvent('membership_tier_viewed', { tier_id: tierId });
        }
      }
      
      // 检查是否点击了升级按钮
      if (e.target.matches('.upgrade-btn') || e.target.closest('.upgrade-btn')) {
        const tierId = e.target.closest('[data-tier]')?.dataset.tier;
        if (tierId && NexusOrbital.Analytics) {
          NexusOrbital.Analytics.trackEvent('membership_upgrade_clicked', { target_tier: tierId });
        }
      }
    });
  }
  
  // 整合探索者模式
  function integrateExplorerMode() {
    if (!NexusOrbital.ExplorerMode) return;
    
    // 更新UI元素基于探索者状态
    function updateExplorerUI() {
      const isExplorer = NexusOrbital.ExplorerMode.isExplorerMode();
      const explorerBadge = document.getElementById('explorer-badge');
      const explorerInfo = document.getElementById('explorer-info');
      
      if (explorerBadge) {
        explorerBadge.style.display = isExplorer ? 'block' : 'none';
      }
      
      if (explorerInfo) {
        explorerInfo.style.display = isExplorer ? 'block' : 'none';
        
        if (isExplorer) {
          const explorer = NexusOrbital.ExplorerMode.getExplorerInfo();
          if (explorer) {
            // 计算剩余时间
            const now = Math.floor(Date.now() / 1000);
            const remainingTime = explorer.exp - now;
            const hours = Math.floor(remainingTime / 3600);
            const minutes = Math.floor((remainingTime % 3600) / 60);
            
            // 更新信息显示
            explorerInfo.innerHTML = `
              <p>探索者模式已激活</p>
              <p>剩余时间: ${hours}小时${minutes}分钟</p>
              <button class="btn-register">注册账号保存进度</button>
            `;
            
            // 添加注册按钮事件
            const registerBtn = explorerInfo.querySelector('.btn-register');
            if (registerBtn) {
              registerBtn.addEventListener('click', function() {
                const registerModal = document.getElementById('register-modal');
                if (registerModal) {
                  registerModal.classList.remove('hidden');
                  
                  // 记录事件
                  if (NexusOrbital.Analytics) {
                    NexusOrbital.Analytics.trackEvent('explorer_register_prompt_clicked');
                  }
                }
              });
            }
          }
        }
      }
      
      // 如果有回调函数，执行
      if (config.onUserStatusChange && typeof config.onUserStatusChange === 'function') {
        config.onUserStatusChange();
      }
    }
    
    // 初始更新UI
    updateExplorerUI();
    
    // 监听存储变化以检测探索者状态变化
    window.addEventListener('storage', function(e) {
      if (e.key === 'explorer_token') {
        updateExplorerUI();
      }
    });
  }

  /**
   * 检查用户是否已登录
   * @returns {boolean} 是否已登录
   */
  function isLoggedIn() {
    // 首先检查NexusOrbital.Auth
    if (NexusOrbital.Auth && typeof NexusOrbital.Auth.isLoggedIn === 'function') {
      return NexusOrbital.Auth.isLoggedIn();
    }
    
    // 回退方法：检查localStorage中的auth_token
    const token = localStorage.getItem('auth_token');
    return !!token;
  }

  // 显示功能限制提示
  function showFeatureRestrictedMessage(featureName, requiredTier) {
    if (NexusOrbital.Membership) {
      NexusOrbital.Membership.showUpgradePrompt(requiredTier, featureName);
    } else {
      // 简单提示
      alert(`该功能需要${requiredTier === 'pro' ? '专业版' : '企业版'}会员才能使用。`);
    }
    
    // 跟踪事件
    if (NexusOrbital.Analytics) {
      NexusOrbital.Analytics.trackEvent('feature_restricted', {
        feature: featureName,
        required_tier: requiredTier
      });
    }
  }

  // 显示有限功能提示
  function showLimitedFeatureMessage(featureName, upgradeMessage) {
    const messageElement = document.createElement('div');
    messageElement.className = 'limited-feature-message';
    messageElement.innerHTML = `
      <p>您正在使用${featureName}的基础版功能。</p>
      <p>${upgradeMessage}</p>
      <button class="btn-upgrade">立即升级</button>
    `;
    
    document.body.appendChild(messageElement);
    
    // 显示后淡出
    setTimeout(() => {
      messageElement.classList.add('show');
    }, 10);
    
    // 自动关闭
    setTimeout(() => {
      messageElement.classList.remove('show');
      setTimeout(() => {
        messageElement.remove();
      }, 500);
    }, 5000);
    
    // 升级按钮点击
    messageElement.querySelector('.btn-upgrade').addEventListener('click', function() {
      // 导航到会员页面
      window.location.href = '/membership.html';
      
      // 记录事件
      if (NexusOrbital.Analytics) {
        NexusOrbital.Analytics.trackEvent('limited_feature_upgrade_clicked', {
          feature: featureName
        });
      }
    });
  }
  
  // 显示登录或探索者模式提示，仅用于发帖功能
  function showLoginOrExplorerPrompt(featureName) {
    const messageElement = document.createElement('div');
    messageElement.className = 'login-explorer-prompt';
    messageElement.innerHTML = `
      <div class="prompt-content">
        <h3>体验${featureName}</h3>
        <p>请登录或激活探索者模式以使用${featureName}</p>
        <div class="prompt-buttons">
          <button class="btn-login">登录</button>
          <button class="btn-explorer">激活探索者模式</button>
        </div>
        <button class="btn-close">&times;</button>
      </div>
    `;
    
    document.body.appendChild(messageElement);
    
    // 显示动画
    setTimeout(() => {
      messageElement.classList.add('show');
    }, 10);
    
    // 登录按钮
    messageElement.querySelector('.btn-login').addEventListener('click', function() {
      const loginModal = document.getElementById('login-modal');
      if (loginModal) {
        loginModal.classList.remove('hidden');
      }
      messageElement.remove();
      
      // 记录事件
      if (NexusOrbital.Analytics) {
        NexusOrbital.Analytics.trackEvent('login_prompt_clicked', {
          source: 'feature_prompt',
          feature: featureName
        });
      }
    });
    
    // 探索者模式按钮
    messageElement.querySelector('.btn-explorer').addEventListener('click', function() {
      if (NexusOrbital.ExplorerMode) {
        NexusOrbital.ExplorerMode.enable()
          .then(() => {
            // 记录事件
            if (NexusOrbital.Analytics) {
              NexusOrbital.Analytics.trackEvent('explorer_mode_activated', {
                source: 'feature_prompt',
                feature: featureName
              });
            }
            
            // 更新UI
            if (config.onUserStatusChange && typeof config.onUserStatusChange === 'function') {
              config.onUserStatusChange();
            }
          });
      }
      messageElement.remove();
    });
    
    // 关闭按钮
    messageElement.querySelector('.btn-close').addEventListener('click', function() {
      messageElement.classList.remove('show');
      setTimeout(() => {
        messageElement.remove();
      }, 300);
    });
  }

  // 导出预览版（带水印）
  function exportWithWatermark() {
    const canvas = document.getElementById('design-canvas');
    if (!canvas) return false;
    
    // 创建临时画布
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    // 复制原始设计
    tempCtx.drawImage(canvas, 0, 0);
    
    // 添加水印
    tempCtx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    tempCtx.font = '16px Arial';
    tempCtx.fillText('NexusOrbital 预览版', 20, 30);
    tempCtx.fillText('升级到专业版移除水印', 20, 50);
    
    // 输出低分辨率版本
    const dataURL = tempCanvas.toDataURL('image/jpeg', 0.7);
    
    // 创建下载链接
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'nexusorbital-design-preview.jpg';
    link.click();
    
    // 记录事件
    if (NexusOrbital.Analytics) {
      NexusOrbital.Analytics.trackEvent('design_exported_preview');
    }
    
    return true;
  }

  // 初始化集成
  function init(options = {}) {
    if (initialized) return;
    
    config = {
      explorerMode: null,
      auth: null,
      community: null,
      designTool: null,
      analytics: null,
      onUserStatusChange: null,
      ...options
    };
    
    // 初始化各模块集成
    integrateDesignTool();
    integrateCommunity();
    integrateMembership();
    integrateExplorerMode();
    
    // 处理登录/注册交互
    document.addEventListener('click', function(e) {
      // 注册完成后自动从探索者转为注册用户
      if (e.target.matches('#register-form button[type="submit"]') || 
          e.target.closest('#register-form button[type="submit"]')) {
        
        // 如果当前是探索者模式，需要保存探索者数据
        if (NexusOrbital.ExplorerMode && NexusOrbital.ExplorerMode.isExplorerMode()) {
          // 记录事件
          if (NexusOrbital.Analytics) {
            NexusOrbital.Analytics.trackEvent('explorer_converted_to_registered');
          }
        }
      }
    });
    
    initialized = true;
    console.log('NexusOrbital Integrations initialized');
  }

  // 公共API
  return {
    init: init,
    checkPermission: checkPermission,
    showFeatureRestrictedMessage: showFeatureRestrictedMessage,
    showLimitedFeatureMessage: showLimitedFeatureMessage,
    showLoginOrExplorerPrompt: showLoginOrExplorerPrompt
  };
})();

// 文档加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
  NexusOrbital.Integrations.init();
});
