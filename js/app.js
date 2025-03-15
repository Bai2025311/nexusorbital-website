// 太空人居社区网站 - 主应用程序初始化文件

// 导入所需组件
import languageSwitcher from './lang/languageSwitcher.js';
import agentSystem from './agents/agentSystem.js';
import MarsBaseModel from './models/marsBaseModel.js';
import starDustSystem from './stardust/pointsSystem.js';
import paymentSystem from '../payment/paymentSystem.js';

// 应用程序主类
class NexusOrbitalApp {
  constructor() {
    this.initialized = false;
    this.components = {
      languageSwitcher: null,
      agentSystem: null,
      marsBaseModel: null,
      starDustSystem: null,
      paymentSystem: null
    };
    this.currentUser = null;
  }

  // 初始化应用程序
  async init() {
    console.log('正在初始化寰宇脉络太空人居社区应用...');
    
    try {
      // 初始化语言切换器
      await this.initLanguageSwitcher();
      
      // 初始化智能体系统
      await this.initAgentSystem();
      
      // 初始化火星基地模型（如果在页面上存在容器）
      if (document.getElementById('mars-base-container')) {
        await this.initMarsBaseModel();
      }
      
      // 初始化星尘积分系统
      await this.initStarDustSystem();
      
      // 初始化支付系统
      await this.initPaymentSystem();
      
      // 设置事件监听器和UI交互
      this.setupEventListeners();
      
      this.initialized = true;
      console.log('NexusOrbital应用初始化完成!');
      
      // 触发应用程序就绪事件
      const readyEvent = new CustomEvent('nexusorbital:ready');
      document.dispatchEvent(readyEvent);
      
      return true;
    } catch (error) {
      console.error('应用程序初始化失败:', error);
      return false;
    }
  }

  // 初始化语言切换器
  async initLanguageSwitcher() {
    try {
      // 使用导入的languageSwitcher单例
      this.components.languageSwitcher = languageSwitcher;
      await this.components.languageSwitcher.init();
      console.log('语言切换器初始化完成');
      return true;
    } catch (error) {
      console.error('语言切换器初始化失败:', error);
      return false;
    }
  }

  // 初始化智能体系统
  async initAgentSystem() {
    try {
      // 使用导入的agentSystem单例
      this.components.agentSystem = agentSystem;
      // 更新智能体翻译
      this.components.agentSystem.updateAgentTranslations();
      console.log('智能体系统初始化完成');
      return true;
    } catch (error) {
      console.error('智能体系统初始化失败:', error);
      return false;
    }
  }

  // 初始化火星基地3D模型
  async initMarsBaseModel() {
    try {
      // 创建火星基地模型实例
      const marsBaseModel = new MarsBaseModel('mars-base-container');
      const initialized = await marsBaseModel.init();
      
      if (initialized) {
        this.components.marsBaseModel = marsBaseModel;
        console.log('火星基地3D模型初始化完成');
        return true;
      } else {
        console.error('火星基地3D模型初始化返回false');
        return false;
      }
    } catch (error) {
      console.error('火星基地3D模型初始化失败:', error);
      return false;
    }
  }

  // 初始化星尘积分系统
  async initStarDustSystem() {
    try {
      // 使用导入的starDustSystem单例
      this.components.starDustSystem = starDustSystem;
      
      // 如果用户已登录，则使用其ID初始化
      const userId = this.currentUser ? this.currentUser.id : null;
      await this.components.starDustSystem.init(userId);
      
      // 显示星尘余额
      this.updateStarDustDisplay();
      
      // 如果存在交易历史容器，显示交易历史
      if (document.getElementById('transaction-history')) {
        this.components.starDustSystem.displayTransactionHistory('transaction-history');
      }
      
      // 如果存在邀请界面容器，显示邀请界面
      if (document.getElementById('referral-container')) {
        this.components.starDustSystem.displayReferralUI('referral-container');
      }
      
      console.log('星尘积分系统初始化完成');
      return true;
    } catch (error) {
      console.error('星尘积分系统初始化失败:', error);
      return false;
    }
  }

  // 初始化支付系统
  async initPaymentSystem() {
    try {
      // 使用导入的paymentSystem单例
      this.components.paymentSystem = paymentSystem;
      await this.components.paymentSystem.init();
      console.log('支付系统初始化完成');
      return true;
    } catch (error) {
      console.error('支付系统初始化失败:', error);
      return false;
    }
  }

  // 设置全局事件监听器
  setupEventListeners() {
    // 监听语言变化事件
    document.addEventListener('languageChanged', (event) => {
      console.log(`语言已切换至: ${event.detail.language}`);
      // 更新需要根据语言变化的UI元素
      this.updateUIForLanguage(event.detail.language);
    });
    
    // 激活所有智能体按钮
    const activateAgentsBtn = document.getElementById('activate-all-agents');
    if (activateAgentsBtn) {
      activateAgentsBtn.addEventListener('click', () => {
        this.activateAllAgents();
      });
    }
    
    // 购买按钮
    const purchaseButtons = document.querySelectorAll('.purchase-btn');
    purchaseButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const productId = button.getAttribute('data-product-id');
        const productName = button.getAttribute('data-product-name');
        const price = parseFloat(button.getAttribute('data-price') || '0');
        
        this.handlePurchase(productId, productName, price);
      });
    });
  }

  // 根据语言更新UI
  updateUIForLanguage(language) {
    // 更新页面标题
    document.title = language === 'zh' ? 
      'NexusOrbital - 太空人居社区' : 
      'NexusOrbital - Space Colonization Community';
      
    // 其他需要更新的UI元素...
  }

  // 激活所有智能体
  activateAllAgents() {
    if (!this.components.agentSystem) {
      console.error('智能体系统未初始化');
      return;
    }
    
    const result = this.components.agentSystem.activateAll();
    console.log('智能体激活结果:', result);
    
    // 更新UI以显示智能体状态
    this.updateAgentStatusUI();
    
    // 显示成功消息
    this.showNotification(
      languageSwitcher.currentLanguage === 'zh' ? 
      '所有智能体已成功激活，正在协同工作中...' : 
      'All agents successfully activated and working together...'
    );
  }

  // 更新智能体状态UI
  updateAgentStatusUI() {
    if (!this.components.agentSystem) return;
    
    const agentCards = document.querySelectorAll('.agent-card');
    const systemStatus = this.components.agentSystem.getSystemStatus();
    
    // 更新每个智能体卡片的状态
    agentCards.forEach(card => {
      const agentId = parseInt(card.getAttribute('data-agent-id'));
      const agentStatus = systemStatus.agents.find(a => a.id === agentId);
      
      if (agentStatus) {
        // 更新活跃状态
        if (agentStatus.active) {
          card.classList.add('active');
          const statusBadge = card.querySelector('.agent-status');
          if (statusBadge) {
            statusBadge.textContent = languageSwitcher.currentLanguage === 'zh' ? '活跃中' : 'Active';
            statusBadge.classList.add('active');
          }
        }
        
        // 更新任务数量
        const taskCounter = card.querySelector('.task-counter');
        if (taskCounter) {
          taskCounter.textContent = agentStatus.tasksCount + agentStatus.completedTasksCount;
        }
      }
    });
    
    // 更新系统状态指示器
    const systemStatusIndicator = document.getElementById('agent-system-status');
    if (systemStatusIndicator) {
      systemStatusIndicator.textContent = systemStatus.status === 'active' ? 
        (languageSwitcher.currentLanguage === 'zh' ? '系统活跃中' : 'System Active') : 
        (languageSwitcher.currentLanguage === 'zh' ? '系统待机中' : 'System Standby');
      
      systemStatusIndicator.className = `status-badge ${systemStatus.status}`;
    }
  }

  // 处理购买
  async handlePurchase(productId, productName, price) {
    if (!this.components.paymentSystem) {
      console.error('支付系统未初始化');
      return;
    }
    
    // 创建支付UI
    const paymentCreated = this.components.paymentSystem.createPaymentUI(
      'payment-container',
      price,
      productName,
      (result) => {
        if (result.success) {
          // 支付成功
          this.handleSuccessfulPayment(productId, price, result);
        } else {
          // 支付失败
          this.handleFailedPayment(result.error);
        }
      }
    );
    
    if (!paymentCreated) {
      console.error('无法创建支付界面');
    }
  }

  // 处理成功支付
  handleSuccessfulPayment(productId, price, paymentResult) {
    console.log('支付成功:', paymentResult);
    
    // 根据产品ID处理不同的购买后逻辑
    switch(productId) {
      case 'membership':
        // 处理会员购买
        this.showNotification(
          languageSwitcher.currentLanguage === 'zh' ? 
          '会员购买成功！您的账户已升级。' : 
          'Membership purchased successfully! Your account has been upgraded.'
        );
        break;
        
      case 'stardust':
        // 处理星尘购买
        const stardustAmount = Math.floor(price * 10); // 假设每1元可以购买10星尘
        
        if (this.components.starDustSystem) {
          this.components.starDustSystem.addPoints(
            stardustAmount,
            languageSwitcher.currentLanguage === 'zh' ? '购买星尘' : 'Stardust Purchase'
          );
        }
        
        this.showNotification(
          languageSwitcher.currentLanguage === 'zh' ? 
          `购买成功！已添加 ${stardustAmount} 星尘到您的账户。` : 
          `Purchase successful! Added ${stardustAmount} Star Dust to your account.`
        );
        break;
        
      case 'premium_model':
        // 处理高级模型购买
        if (this.components.marsBaseModel) {
          // 这里可以解锁高级模型功能
          console.log('解锁高级火星基地模型功能');
        }
        
        this.showNotification(
          languageSwitcher.currentLanguage === 'zh' ? 
          '高级模型购买成功！新功能已解锁。' : 
          'Premium model purchased successfully! New features unlocked.'
        );
        break;
        
      default:
        this.showNotification(
          languageSwitcher.currentLanguage === 'zh' ? 
          '购买成功！' : 
          'Purchase successful!'
        );
    }
  }

  // 处理失败支付
  handleFailedPayment(errorMessage) {
    console.error('支付失败:', errorMessage);
    
    this.showNotification(
      languageSwitcher.currentLanguage === 'zh' ? 
      `支付失败：${errorMessage || '未知错误'}` : 
      `Payment failed: ${errorMessage || 'Unknown error'}`
    );
  }

  // 显示通知
  showNotification(message, type = 'success', duration = 5000) {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <p>${message}</p>
      </div>
      <button class="close-notification">×</button>
    `;
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 添加关闭按钮功能
    const closeButton = notification.querySelector('.close-notification');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        notification.remove();
      });
    }
    
    // 设置自动关闭
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.remove();
      }
    }, duration);
  }

  // 更新星尘显示
  updateStarDustDisplay() {
    if (!this.components.starDustSystem) return;
    
    const stardustBalance = this.components.starDustSystem.getPointsBalance();
    const balanceDisplays = document.querySelectorAll('.stardust-balance');
    
    balanceDisplays.forEach(display => {
      display.textContent = stardustBalance;
    });
  }
}

// 创建应用实例
const app = new NexusOrbitalApp();

// 当DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});

// 导出应用实例以便在控制台中访问（用于调试）
window.nexusOrbitalApp = app;

export default app;
