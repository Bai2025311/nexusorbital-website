// 会员系统模块
window.NexusOrbital = window.NexusOrbital || {};

// 会员系统模块
NexusOrbital.Membership = (function() {
  // 会员级别定义
  const tiers = [
    {
      id: 'basic',
      name: '基础版',
      price: 0,
      billingCycle: null,
      features: [
        '社区浏览',
        '基础设计工具',
        '参与投票',
        '查看公开资源'
      ],
      description: '面向所有探索者的免费体验版本，探索太空设计的基础功能'
    },
    {
      id: 'pro',
      name: '专业版',
      price: 299,
      billingCycle: 'yearly',
      features: [
        '社区内容发布权限',
        '高级设计工具',
        '设计导出功能',
        '优先访问新功能',
        '社区徽章展示'
      ],
      description: '为设计爱好者提供的进阶版本，享受更多创作和社区互动功能'
    },
    {
      id: 'enterprise',
      name: '企业版',
      price: 999,
      billingCycle: 'yearly',
      features: [
        '团队协作功能',
        '专用云存储空间',
        '定制设计服务',
        '商业授权',
        '优先技术支持',
        'API访问权限'
      ],
      description: '为企业客户提供的全功能版本，支持团队协作和商业应用'
    }
  ];
  
  // 活动促销定义
  const promotions = [
    {
      id: 'early-adopter',
      name: '早期支持者优惠',
      description: '限时50%折扣，仅限前100名专业版用户',
      startDate: new Date('2023-12-01'),
      endDate: new Date('2024-02-28'),
      discountPercentage: 50,
      applicableTiers: ['pro']
    },
    {
      id: 'team-discount',
      name: '团队折扣',
      description: '5人以上团队订阅企业版享受8折优惠',
      discountPercentage: 20,
      minTeamSize: 5,
      applicableTiers: ['enterprise']
    }
  ];
  
  // 获取当前用户会员状态
  function getCurrentMembership() {
    // MVP阶段模拟
    const token = sessionStorage.getItem('token');
    if (token) {
      try {
        const user = JSON.parse(atob(token.split('.')[1]));
        return user.membership || 'basic';
      } catch (e) {
        console.error('Failed to parse token:', e);
      }
    }
    
    return 'basic'; // 默认为基础版
  }
  
  // 获取所有会员级别
  function getAllTiers() {
    return tiers.map(tier => ({...tier}));
  }
  
  // 获取特定会员级别信息
  function getTier(tierId) {
    return tiers.find(tier => tier.id === tierId);
  }
  
  // 获取当前有效的促销活动
  function getActivePromotions() {
    const now = new Date();
    return promotions.filter(promo => {
      // 检查日期范围（如果有）
      if (promo.startDate && promo.endDate) {
        return promo.startDate <= now && now <= promo.endDate;
      }
      return true; // 无日期限制的促销一直有效
    });
  }
  
  // 应用促销折扣
  function applyPromotionToPrice(tierId, quantity = 1) {
    const tier = getTier(tierId);
    if (!tier) return null;
    
    let finalPrice = tier.price;
    const activePromos = getActivePromotions().filter(
      promo => promo.applicableTiers.includes(tierId)
    );
    
    // 应用最大折扣
    if (activePromos.length > 0) {
      const maxDiscount = Math.max(
        ...activePromos.map(p => p.discountPercentage)
      );
      finalPrice = finalPrice * (1 - maxDiscount / 100);
    }
    
    // 团队折扣特殊处理
    const teamPromo = activePromos.find(p => p.id === 'team-discount');
    if (teamPromo && quantity >= teamPromo.minTeamSize) {
      finalPrice = tier.price * (1 - teamPromo.discountPercentage / 100);
    }
    
    return {
      originalPrice: tier.price,
      finalPrice: finalPrice,
      appliedPromotions: activePromos.map(p => p.id)
    };
  }
  
  // 显示会员升级提示
  function showUpgradePrompt(requiredTierId, feature) {
    const requiredTier = getTier(requiredTierId);
    if (!requiredTier) return;
    
    // 跟踪事件
    if (NexusOrbital.Analytics) {
      NexusOrbital.Analytics.trackEvent('upgrade_prompt_shown', {
        required_tier: requiredTierId,
        feature: feature
      });
    }
    
    // 创建提示模态框
    const modal = document.createElement('div');
    modal.className = 'membership-modal';
    modal.innerHTML = `
      <div class="membership-modal-content">
        <span class="close-btn">&times;</span>
        <h2>升级会员以使用${feature}</h2>
        <p>此功能需要 ${requiredTier.name} 会员才能使用。</p>
        <div class="tier-card">
          <h3>${requiredTier.name}</h3>
          <p class="tier-price">${requiredTier.price}元/${requiredTier.billingCycle === 'yearly' ? '年' : '月'}</p>
          <p>${requiredTier.description}</p>
          <ul>
            ${requiredTier.features.map(feat => `<li>${feat}</li>`).join('')}
          </ul>
          <button class="upgrade-btn" data-tier="${requiredTierId}">立即升级</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // 添加事件监听
    modal.querySelector('.close-btn').addEventListener('click', function() {
      modal.remove();
    });
    
    modal.querySelector('.upgrade-btn').addEventListener('click', function() {
      // 记录点击事件
      if (NexusOrbital.Analytics) {
        NexusOrbital.Analytics.trackEvent('upgrade_button_clicked', {
          target_tier: requiredTierId
        });
      }
      
      // 转到会员页面
      window.location.href = '/membership.html?selected=' + requiredTierId;
    });
  }
  
  // 检查功能权限
  function checkFeatureAccess(feature) {
    const currentTier = getCurrentMembership();
    
    // 基础功能映射到会员级别
    const featureRequirements = {
      'post_community': 'pro',
      'advanced_design': 'pro',
      'export_design': 'pro',
      'team_collaboration': 'enterprise',
      'commercial_license': 'enterprise',
      'api_access': 'enterprise'
    };
    
    // 基础版可用功能
    const basicFeatures = [
      'view_community',
      'basic_design',
      'vote'
    ];
    
    // 基础功能总是允许
    if (basicFeatures.includes(feature)) {
      return true;
    }
    
    // 检查特定功能要求
    const requiredTier = featureRequirements[feature];
    if (!requiredTier) {
      console.warn(`未知功能权限检查: ${feature}`);
      return true; // 默认允许未知功能
    }
    
    // 会员级别比较
    const tierLevels = {
      'basic': 0,
      'pro': 1,
      'enterprise': 2
    };
    
    // 判断当前级别是否满足要求
    return tierLevels[currentTier] >= tierLevels[requiredTier];
  }
  
  // 初始化会员系统
  function init() {
    console.log('NexusOrbital Membership system initialized');
    
    // 如果当前页面是会员页面，设置UI
    if (window.location.pathname.includes('membership.html')) {
      setupMembershipPage();
    }
  }
  
  // 设置会员页面
  function setupMembershipPage() {
    const membershipContainer = document.getElementById('membership-tiers');
    if (!membershipContainer) return;
    
    // 清空容器
    membershipContainer.innerHTML = '';
    
    // 添加所有会员级别卡片
    tiers.forEach(tier => {
      const tierCard = document.createElement('div');
      tierCard.className = `tier-card ${tier.id}`;
      
      // 获取定价信息（含促销）
      const pricingInfo = applyPromotionToPrice(tier.id);
      const hasDiscount = pricingInfo && pricingInfo.originalPrice > pricingInfo.finalPrice;
      
      tierCard.innerHTML = `
        <h3>${tier.name}</h3>
        <div class="price-container">
          ${hasDiscount ? `<span class="original-price">${pricingInfo.originalPrice}元</span>` : ''}
          <p class="tier-price">${tier.price > 0 ? (pricingInfo ? pricingInfo.finalPrice : tier.price) + '元' : '免费'}</p>
          ${tier.billingCycle ? `<span class="billing-cycle">/${tier.billingCycle === 'yearly' ? '年' : '月'}</span>` : ''}
        </div>
        <p class="tier-desc">${tier.description}</p>
        <ul class="features-list">
          ${tier.features.map(feat => `<li>${feat}</li>`).join('')}
        </ul>
        <button class="subscribe-btn" data-tier="${tier.id}">
          ${tier.price > 0 ? '立即订阅' : '开始使用'}
        </button>
      `;
      
      membershipContainer.appendChild(tierCard);
    });
    
    // 添加按钮事件监听
    document.querySelectorAll('.subscribe-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const tierId = this.getAttribute('data-tier');
        
        // 基础版直接跳转到首页
        if (tierId === 'basic') {
          window.location.href = '/index.html';
          return;
        }
        
        // 记录订阅点击事件
        if (NexusOrbital.Analytics) {
          NexusOrbital.Analytics.trackEvent('subscription_button_clicked', {
            tier_id: tierId
          });
        }
        
        // 检查登录状态
        const token = sessionStorage.getItem('token');
        if (!token) {
          // 未登录，重定向到登录页面
          sessionStorage.setItem('after_login_redirect', `/membership.html?action=subscribe&tier=${tierId}`);
          window.location.href = '/login.html';
          return;
        }
        
        // 已登录，显示支付模态框（实际应用中替换为支付系统接入）
        showPaymentModal(tierId);
      });
    });
    
    // 处理URL参数
    const urlParams = new URLSearchParams(window.location.search);
    const selectedTier = urlParams.get('selected');
    if (selectedTier) {
      const tierElement = document.querySelector(`.tier-card.${selectedTier}`);
      if (tierElement) {
        tierElement.classList.add('highlighted');
        tierElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }
  
  // 显示支付模态框
  function showPaymentModal(tierId) {
    const tier = getTier(tierId);
    if (!tier) return;
    
    // 获取定价信息
    const pricingInfo = applyPromotionToPrice(tierId);
    const finalPrice = pricingInfo ? pricingInfo.finalPrice : tier.price;
    
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'payment-modal';
    modal.innerHTML = `
      <div class="payment-modal-content">
        <span class="close-btn">&times;</span>
        <h2>订阅 ${tier.name}</h2>
        <p class="order-summary">订单摘要</p>
        <div class="order-details">
          <p><span>会员类型:</span> ${tier.name}</p>
          <p><span>计费周期:</span> ${tier.billingCycle === 'yearly' ? '年度' : '月度'}</p>
          <p><span>金额:</span> ${finalPrice}元</p>
        </div>
        <div class="payment-methods">
          <h3>选择支付方式</h3>
          <div class="payment-options">
            <label>
              <input type="radio" name="payment" value="wechat" checked>
              <span>微信支付</span>
            </label>
            <label>
              <input type="radio" name="payment" value="alipay">
              <span>支付宝</span>
            </label>
            <label>
              <input type="radio" name="payment" value="creditcard">
              <span>信用卡</span>
            </label>
          </div>
        </div>
        <button class="confirm-payment">确认支付</button>
        <p class="terms">点击"确认支付"，表示您同意我们的<a href="/terms.html">服务条款</a>和<a href="/privacy.html">隐私政策</a></p>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // 添加事件监听
    modal.querySelector('.close-btn').addEventListener('click', function() {
      modal.remove();
    });
    
    modal.querySelector('.confirm-payment').addEventListener('click', function() {
      // 获取选择的支付方式
      const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
      
      // 记录支付尝试事件
      if (NexusOrbital.Analytics) {
        NexusOrbital.Analytics.trackEvent('payment_attempted', {
          tier_id: tierId,
          amount: finalPrice,
          payment_method: paymentMethod
        });
      }
      
      // MVP阶段模拟支付流程
      modal.querySelector('.payment-modal-content').innerHTML = `
        <h2>支付处理中</h2>
        <div class="payment-processing">
          <div class="spinner"></div>
          <p>正在处理您的支付，请稍候...</p>
        </div>
      `;
      
      // 模拟支付成功
      setTimeout(() => {
        // 记录支付成功事件
        if (NexusOrbital.Analytics) {
          NexusOrbital.Analytics.trackEvent('payment_successful', {
            tier_id: tierId,
            amount: finalPrice,
            payment_method: paymentMethod
          });
        }
        
        modal.querySelector('.payment-modal-content').innerHTML = `
          <h2>支付成功!</h2>
          <div class="payment-success">
            <svg viewBox="0 0 24 24" width="64" height="64">
              <circle cx="12" cy="12" r="11" fill="none" stroke="#4CAF50" stroke-width="2"/>
              <path d="M7 13l3 3 7-7" fill="none" stroke="#4CAF50" stroke-width="2"/>
            </svg>
            <p>感谢您的订阅，您已成功升级为${tier.name}！</p>
            <button class="success-btn">开始体验</button>
          </div>
        `;
        
        modal.querySelector('.success-btn').addEventListener('click', function() {
          window.location.href = '/index.html';
        });
      }, 2000);
    });
  }
  
  // 公共API
  return {
    init: init,
    getAllTiers: getAllTiers,
    getCurrentMembership: getCurrentMembership,
    checkFeatureAccess: checkFeatureAccess,
    showUpgradePrompt: showUpgradePrompt
  };
})();

// 自动初始化
document.addEventListener('DOMContentLoaded', function() {
  NexusOrbital.Membership.init();
});
