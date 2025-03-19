/**
 * NexusOrbital MVP 主脚本
 * 实现了主要功能整合和界面初始化
 */
window.NexusOrbital = window.NexusOrbital || {};

// MVP主模块
NexusOrbital.MVP = (function() {
  // 配置
  const CONFIG = {
    ANIMATION_DURATION: 500,
    AUTO_CAROUSEL_INTERVAL: 5000,
    SHOWCASE_COUNT: 3
  };
  
  // 私有变量
  let initialized = false;
  let currentUser = null;
  
  // DOM元素引用
  let elements = {};
  
  // 初始化DOM元素引用
  function cacheElements() {
    elements = {
      // 导航元素
      navMenu: document.querySelector('.nav-menu'),
      navToggle: document.querySelector('.nav-toggle'),
      navLinks: document.querySelectorAll('.nav-link'),
      
      // 认证相关
      loginBtn: document.querySelector('.login-btn'),
      registerBtn: document.querySelector('.register-btn'),
      loginModal: document.getElementById('login-modal'),
      registerModal: document.getElementById('register-modal'),
      userAvatar: document.querySelector('.user-avatar'),
      userMenu: document.querySelector('.user-menu'),
      
      // 内容区域
      heroSection: document.querySelector('.hero-section'),
      featureSection: document.querySelector('.feature-section'),
      showcaseSection: document.querySelector('.showcase-section'),
      showcaseContainer: document.querySelector('.showcase-container'),
      
      // 设计工具相关
      designCanvas: document.getElementById('design-canvas'),
      designToolbar: document.querySelector('.design-toolbar'),
      
      // 探索者相关
      explorerBadge: document.getElementById('explorer-badge'),
      explorerInfo: document.getElementById('explorer-info'),
      exploreButton: document.querySelector('.explore-btn'),
      
      // 社区相关
      communityFilters: document.querySelector('.community-filter'),
      postModal: document.getElementById('post-modal'),
      newPostBtn: document.querySelector('.new-post-btn'),
      fabNewPost: document.querySelector('.fab-new-post'),
      
      // 会员相关
      membershipTiers: document.querySelectorAll('.membership-tier-card'),
      upgradeButtons: document.querySelectorAll('.upgrade-btn'),
      
      // 其他
      loadingIndicator: document.querySelector('.loading-indicator'),
      toTopButton: document.querySelector('.to-top-btn'),
      
      // 用户操作区域
      userActions: document.querySelector('.user-actions'),
      guestActions: document.querySelector('.guest-actions'),
      userAvatarBtn: document.querySelector('.user-avatar-btn'),
      explorerModeBtn: document.querySelector('.explorer-mode-btn')
    };
  }
  
  // 设置事件监听
  function setupEventListeners() {
    // 导航菜单
    if (elements.navToggle) {
      elements.navToggle.addEventListener('click', toggleNavMenu);
    }
    
    // 导航链接点击
    if (elements.navLinks) {
      elements.navLinks.forEach(link => {
        link.addEventListener('click', () => {
          // 在移动端自动关闭菜单
          if (window.innerWidth < 768) {
            toggleNavMenu(false);
          }
          
          // 跟踪导航事件
          if (NexusOrbital.Analytics) {
            NexusOrbital.Analytics.trackEvent('navigation_link_clicked', {
              link: link.getAttribute('href') || link.textContent.trim()
            });
          }
        });
      });
    }
    
    // 认证相关
    if (elements.loginBtn) {
      elements.loginBtn.addEventListener('click', showLoginModal);
    }
    
    if (elements.registerBtn) {
      elements.registerBtn.addEventListener('click', showRegisterModal);
    }
    
    // 用户头像点击（登录后）
    if (elements.userAvatarBtn) {
      elements.userAvatarBtn.addEventListener('click', toggleUserMenu);
    }
    
    // 探索按钮点击（探索者模式）
    if (elements.exploreButton) {
      elements.exploreButton.addEventListener('click', activateExplorerMode);
    }
    
    // 社区发布按钮
    if (elements.newPostBtn) {
      elements.newPostBtn.addEventListener('click', handleNewPostClick);
    }
    
    if (elements.fabNewPost) {
      elements.fabNewPost.addEventListener('click', handleNewPostClick);
    }
    
    // 回到顶部按钮
    if (elements.toTopButton) {
      elements.toTopButton.addEventListener('click', () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
      
      // 监听滚动，显示/隐藏回到顶部按钮
      window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
          elements.toTopButton.classList.add('visible');
        } else {
          elements.toTopButton.classList.remove('visible');
        }
      });
    }
    
    // 窗口大小变化
    window.addEventListener('resize', handleWindowResize);
    
    // 页面卸载前保存状态
    window.addEventListener('beforeunload', function() {
      savePageState();
    });
  }
  
  // 设置集成
  function setupIntegrations() {
    // 初始化集成模块
    if (NexusOrbital.Integrations) {
      NexusOrbital.Integrations.init({
        onPermissionDenied: handlePermissionDenied,
        onExplorerActivated: handleExplorerActivated,
        onExplorerDeactivated: handleExplorerDeactivated
      });
      
      // 集成设计工具
      if (NexusOrbital.DesignTool) {
        NexusOrbital.Integrations.integrateDesignTool();
      }
      
      // 集成社区功能
      if (NexusOrbital.Community) {
        NexusOrbital.Integrations.integrateCommunity();
      }
      
      // 集成探索者模式
      if (NexusOrbital.ExplorerMode) {
        NexusOrbital.Integrations.integrateExplorerMode();
      }
      
      // 集成会员系统
      if (NexusOrbital.Membership) {
        NexusOrbital.Integrations.integrateMembership();
      }
      
      // 集成分析功能
      if (NexusOrbital.Analytics) {
        NexusOrbital.Analytics.trackPageView();
      }
    }
  }

  // 处理权限被拒绝
  function handlePermissionDenied(featureName, requiredPermission) {
    console.log(`访问 ${featureName} 需要 ${requiredPermission} 权限`);
    
    // 如果用户已登录但权限不足，显示需要升级的消息
    if (NexusOrbital.Auth && NexusOrbital.Auth.isLoggedIn()) {
      NexusOrbital.Integrations.showFeatureRestrictedMessage(
        featureName, 
        NexusOrbital.Membership.getTierNameByPermission(requiredPermission)
      );
    } else {
      // 用户未登录，显示登录或使用探索者模式的提示
      NexusOrbital.Integrations.showLoginOrExplorerPrompt(featureName);
    }
  }

  // 处理探索者模式激活
  function handleExplorerActivated() {
    console.log('探索者模式已激活');
    
    // 更新 UI
    updateUIBasedOnUserStatus();
    
    // 显示欢迎信息
    showWelcomeExplorerMessage();
    
    // 追踪事件
    if (NexusOrbital.Analytics) {
      NexusOrbital.Analytics.trackEvent('explorer_mode_activated');
    }
  }

  // 处理探索者模式关闭
  function handleExplorerDeactivated() {
    console.log('探索者模式已关闭');
    
    // 更新 UI
    updateUIBasedOnUserStatus();
    
    // 追踪事件
    if (NexusOrbital.Analytics) {
      NexusOrbital.Analytics.trackEvent('explorer_mode_deactivated');
    }
  }
  
  // 根据用户状态更新UI
  function updateUIBasedOnUserStatus() {
    // 确认DOM元素已缓存
    if (Object.keys(elements).length === 0) {
      cacheElements();
    }
    
    // 确定用户状态
    let isLoggedIn = false;
    let isExplorerMode = false;
    let userData = null;
    
    // 检查用户登录状态
    if (NexusOrbital.Auth && NexusOrbital.Auth.isLoggedIn()) {
      isLoggedIn = true;
      userData = NexusOrbital.Auth.getCurrentUser();
    }
    
    // 检查探索者模式
    if (NexusOrbital.ExplorerMode && NexusOrbital.ExplorerMode.isActive()) {
      isExplorerMode = true;
    }
    
    // 更新导航栏
    if (elements.userActions && elements.guestActions) {
      if (isLoggedIn || isExplorerMode) {
        elements.userActions.classList.remove('hidden');
        elements.guestActions.classList.add('hidden');
      } else {
        elements.userActions.classList.add('hidden');
        elements.guestActions.classList.remove('hidden');
      }
    }
    
    // 更新探索者模式相关UI
    if (elements.explorerModeBtn) {
      if (isExplorerMode) {
        elements.explorerModeBtn.textContent = '退出探索者模式';
        elements.explorerModeBtn.classList.add('active');
      } else {
        elements.explorerModeBtn.textContent = '探索者模式';
        elements.explorerModeBtn.classList.remove('active');
      }
    }
    
    // 更新探索者信息区域
    if (elements.explorerInfo) {
      if (isExplorerMode) {
        elements.explorerInfo.classList.remove('hidden');
      } else {
        elements.explorerInfo.classList.add('hidden');
      }
    }
    
    // 更新用户头像和菜单
    if (elements.userAvatarBtn && elements.userMenu) {
      if (isLoggedIn && userData) {
        // 用户已登录，显示用户信息
        const userNameElement = elements.userMenu.querySelector('.user-name');
        const userMembershipElement = elements.userMenu.querySelector('.user-membership');
        
        if (userNameElement) {
          userNameElement.textContent = userData.displayName || userData.username || '用户';
        }
        
        if (userMembershipElement) {
          userMembershipElement.textContent = getCurrentMembershipName(userData);
        }
        
        // 更新头像图片（如果有）
        const avatarIconElement = elements.userAvatarBtn.querySelector('i');
        if (userData.avatar && avatarIconElement) {
          // 替换图标为用户头像
          avatarIconElement.parentNode.innerHTML = `<img src="${userData.avatar}" alt="用户头像">`;
        }
      }
    }
    
    // 更新社区showcase区域
    loadCommunityShowcase();
    
    // 显示/隐藏新帖按钮
    if (elements.newPostBtn) {
      if (isLoggedIn || (isExplorerMode && NexusOrbital.Integrations.checkPermission('community_post_basic'))) {
        elements.newPostBtn.classList.remove('hidden');
      } else {
        elements.newPostBtn.classList.add('hidden');
      }
    }
    
    // 更新设计工具区域
    updateDesignTools(isLoggedIn, isExplorerMode);
  }
  
  // 更新设计工具区域
  function updateDesignTools(isLoggedIn, isExplorerMode) {
    const designTools = document.querySelectorAll('.design-tool');
    
    designTools.forEach(tool => {
      const requiredPermission = tool.dataset.permission;
      
      if (!requiredPermission) return;
      
      const hasPermission = NexusOrbital.Integrations.checkPermission(requiredPermission);
      
      if (hasPermission) {
        tool.classList.remove('locked');
        tool.querySelector('.tool-lock-overlay')?.remove();
      } else {
        tool.classList.add('locked');
        
        // 添加锁定提示
        if (!tool.querySelector('.tool-lock-overlay')) {
          const overlay = document.createElement('div');
          overlay.className = 'tool-lock-overlay';
          
          const message = isLoggedIn ? 
            '升级会员解锁此功能' : 
            '登录或使用探索者模式体验基础功能';
          
          overlay.innerHTML = `
            <div class="lock-icon"><i class="fas fa-lock"></i></div>
            <p>${message}</p>
          `;
          
          tool.appendChild(overlay);
        }
      }
    });
  }
  
  // 获取当前会员级别名称
  function getCurrentMembershipName(userData) {
    if (!userData || !userData.membership) return '基础版';
    
    const membershipMap = {
      'basic': '基础版',
      'pro': '专业版',
      'enterprise': '企业版'
    };
    
    return membershipMap[userData.membership] || '基础版';
  }
  
  // 显示登录模态框
  function showLoginModal() {
    if (!elements.loginModal) return;
    
    elements.loginModal.classList.remove('hidden');
    
    // 记录事件
    if (NexusOrbital.Analytics) {
      NexusOrbital.Analytics.trackEvent('login_modal_opened');
    }
  }
  
  // 显示注册模态框
  function showRegisterModal() {
    if (!elements.registerModal) return;
    
    elements.registerModal.classList.remove('hidden');
    
    // 记录事件
    if (NexusOrbital.Analytics) {
      NexusOrbital.Analytics.trackEvent('register_modal_opened');
    }
  }
  
  // 切换导航菜单（移动端）
  function toggleNavMenu(forcedState) {
    if (!elements.navMenu) return;
    
    const newState = typeof forcedState === 'boolean' ? 
      forcedState : 
      !elements.navMenu.classList.contains('active');
    
    if (newState) {
      elements.navMenu.classList.add('active');
      elements.navToggle?.classList.add('active');
    } else {
      elements.navMenu.classList.remove('active');
      elements.navToggle?.classList.remove('active');
    }
    
    // 记录事件
    if (NexusOrbital.Analytics) {
      NexusOrbital.Analytics.trackEvent('nav_menu_toggled', {
        state: newState ? 'opened' : 'closed'
      });
    }
  }
  
  // 切换用户菜单
  function toggleUserMenu() {
    if (!elements.userMenu) return;
    
    elements.userMenu.classList.toggle('visible');
    
    // 点击外部关闭菜单
    if (elements.userMenu.classList.contains('visible')) {
      const closeMenu = function(event) {
        if (!elements.userMenu.contains(event.target) && 
            !elements.userAvatarBtn.contains(event.target)) {
          elements.userMenu.classList.remove('visible');
          document.removeEventListener('click', closeMenu);
        }
      };
      
      // 延迟添加事件监听，避免立即触发
      setTimeout(() => {
        document.addEventListener('click', closeMenu);
      }, 0);
    }
  }
  
  // 激活探索者模式
  function activateExplorerMode() {
    if (NexusOrbital.ExplorerMode) {
      if (NexusOrbital.ExplorerMode.isActive()) {
        // 已经是探索者模式，则关闭
        NexusOrbital.ExplorerMode.deactivate();
        
        if (NexusOrbital.Analytics) {
          NexusOrbital.Analytics.trackEvent('explorer_mode_deactivated');
        }
      } else {
        // 激活探索者模式
        NexusOrbital.ExplorerMode.activate();
        
        if (NexusOrbital.Analytics) {
          NexusOrbital.Analytics.trackEvent('explorer_mode_activated');
        }
        
        // 显示欢迎信息
        showWelcomeExplorerMessage();
      }
      
      // 更新UI
      updateUIBasedOnUserStatus();
    }
  }
  
  // 显示探索者欢迎信息
  function showWelcomeExplorerMessage() {
    const welcomeMessage = document.getElementById('explorerWelcome');
    
    if (!welcomeMessage) return;
    
    welcomeMessage.classList.add('show');
    
    // 添加关闭按钮事件
    const closeBtn = welcomeMessage.querySelector('.btn-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        welcomeMessage.classList.remove('show');
      });
    }
    
    // 5秒后自动关闭
    setTimeout(function() {
      welcomeMessage.classList.remove('show');
    }, 5000);
    
    // 记录探索者欢迎信息查看事件
    if (NexusOrbital.Analytics) {
      NexusOrbital.Analytics.trackEvent('explorer_welcome_shown');
    }
  }
  
  // 处理新建帖子点击
  function handleNewPostClick(e) {
    e.preventDefault();
    
    // 检查权限
    const hasPermission = NexusOrbital.Integrations.checkPermission('community_post_basic');
    
    if (!hasPermission) {
      // 用户没有发帖权限，显示提示
      NexusOrbital.Integrations.showLoginOrExplorerPrompt('发布内容');
      return;
    }
    
    // 打开发帖模态框或跳转到发帖页面
    if (NexusOrbital.Community && NexusOrbital.Community.openPostEditor) {
      NexusOrbital.Community.openPostEditor();
    } else {
      window.location.href = '/community-post.html';
    }
    
    // 记录事件
    if (NexusOrbital.Analytics) {
      NexusOrbital.Analytics.trackEvent('new_post_clicked');
    }
  }
  
  // 加载社区精选内容
  function loadCommunityShowcase() {
    const showcaseContainer = document.getElementById('showcaseContainer');
    
    if (!showcaseContainer) return;
    
    // 检查是否有缓存数据
    const cachedShowcase = sessionStorage.getItem('community_showcase');
    
    if (cachedShowcase) {
      // 使用缓存数据（仅用于MVP）
      try {
        const showcaseData = JSON.parse(cachedShowcase);
        renderShowcaseItems(showcaseData);
      } catch (e) {
        console.error('解析社区展示缓存失败', e);
        loadShowcaseFromAPI();
      }
    } else {
      // 从API加载
      loadShowcaseFromAPI();
    }
  }
  
  // 从API加载社区展示内容
  function loadShowcaseFromAPI() {
    // MVP阶段使用静态数据
    const demoData = [
      {
        id: 1,
        title: '轨道太空站模块化设计',
        description: '这个模块化设计方案可以根据需要扩展，适应不同规模的太空任务...',
        imageSrc: 'assets/images/community/post1.jpg',
        author: {
          id: 101,
          name: '张明',
          avatar: 'assets/images/avatars/user1.jpg'
        },
        stats: {
          likes: 42,
          comments: 8,
          shares: 5
        }
      },
      {
        id: 2,
        title: '月球永久基地概念设计',
        description: '这个月球基地设计考虑了辐射防护、能源供应和资源利用等关键因素...',
        imageSrc: 'assets/images/community/post2.jpg',
        author: {
          id: 102,
          name: '李华',
          avatar: 'assets/images/avatars/user2.jpg'
        },
        stats: {
          likes: 57,
          comments: 14,
          shares: 11
        }
      },
      {
        id: 3,
        title: '新型火星探测器概念',
        description: '这款探测器采用创新的悬浮设计，可以适应火星复杂地形并延长任务寿命...',
        imageSrc: 'assets/images/community/post3.jpg',
        author: {
          id: 103,
          name: '王力',
          avatar: 'assets/images/avatars/user3.jpg'
        },
        stats: {
          likes: 36,
          comments: 9,
          shares: 4
        }
      }
    ];
    
    // 保存到会话存储
    sessionStorage.setItem('community_showcase', JSON.stringify(demoData));
    
    // 渲染到页面
    renderShowcaseItems(demoData);
  }
  
  // 渲染社区展示项目
  function renderShowcaseItems(items) {
    const showcaseContainer = document.getElementById('showcaseContainer');
    
    if (!showcaseContainer) return;
    
    // 清空现有内容
    showcaseContainer.innerHTML = '';
    
    // 渲染每个项目
    items.forEach(item => {
      const itemElement = document.createElement('div');
      itemElement.className = 'showcase-item';
      itemElement.setAttribute('data-id', item.id);
      
      itemElement.innerHTML = `
        <div class="showcase-image">
          <img src="${item.imageSrc}" alt="${item.title}">
        </div>
        <div class="showcase-content">
          <h3>${item.title}</h3>
          <div class="author-info">
            <img src="${item.author.avatar}" alt="${item.author.name}" class="author-avatar">
            <span class="author-name">${item.author.name}</span>
          </div>
          <p>${item.description}</p>
          <div class="interaction-stats">
            <span><i class="fas fa-heart"></i> ${item.stats.likes}</span>
            <span><i class="fas fa-comment"></i> ${item.stats.comments}</span>
            <span><i class="fas fa-share"></i> ${item.stats.shares}</span>
          </div>
        </div>
      `;
      
      // 添加点击事件
      itemElement.addEventListener('click', function() {
        if (NexusOrbital.Community && NexusOrbital.Community.openPostDetails) {
          NexusOrbital.Community.openPostDetails(item.id);
        } else {
          window.location.href = `/community-post.html?id=${item.id}`;
        }
        
        // 记录事件
        if (NexusOrbital.Analytics) {
          NexusOrbital.Analytics.trackEvent('post_clicked', { post_id: item.id });
        }
      });
      
      showcaseContainer.appendChild(itemElement);
    });
  }
  
  // 处理窗口大小变化
  function handleWindowResize() {
    // 更新响应式UI元素
    if (window.innerWidth >= 768) {
      // 在桌面视图下始终显示菜单
      if (elements.navMenu) elements.navMenu.classList.remove('hidden');
    }
  }
  
  // 保存页面状态
  function savePageState() {
    // 保存滚动位置
    const scrollPosition = window.scrollY || window.pageYOffset;
    sessionStorage.setItem('scrollPosition', scrollPosition.toString());
    
    // 其他状态保存
    // ...
  }
  
  // 恢复页面状态
  function restorePageState() {
    // 恢复滚动位置
    const scrollPosition = sessionStorage.getItem('scrollPosition');
    if (scrollPosition) {
      window.scrollTo(0, parseInt(scrollPosition, 10));
    }
    
    // 其他状态恢复
    // ...
  }
  
  // 初始化
  function init() {
    if (initialized) return;
    
    console.log('初始化 NexusOrbital MVP...');
    
    // 缓存DOM元素
    cacheElements();
    
    // 设置事件监听
    setupEventListeners();
    
    // 设置集成
    setupIntegrations();
    
    // 更新UI
    updateUIBasedOnUserStatus();
    
    // 加载社区展示内容
    loadCommunityShowcase();
    
    // 页面滚动监听（用于显示回到顶部按钮）
    window.addEventListener('scroll', function() {
      if (window.scrollY > 300) {
        elements.toTopButton?.classList.add('visible');
      } else {
        elements.toTopButton?.classList.remove('visible');
      }
    });
    
    // 窗口大小变化
    window.addEventListener('resize', handleWindowResize);
    
    // 标记已初始化
    initialized = true;
    
    console.log('NexusOrbital MVP 初始化完成');
    
    // 记录初始化完成事件
    if (NexusOrbital.Analytics) {
      NexusOrbital.Analytics.trackEvent('mvp_initialized');
    }
  }
  
  // 公共API
  return {
    init: init,
    updateUIBasedOnUserStatus: updateUIBasedOnUserStatus
  };
})();

// 在DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
  NexusOrbital.MVP.init();
});
