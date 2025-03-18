// Star Dust Points System for NexusOrbital Space Colonization Community
// Includes referral program with 100 Star Dust points per successful referral

import languageSwitcher from '../lang/languageSwitcher.js';

class StarDustSystem {
  constructor() {
    this.userId = null;
    this.userPoints = 0;
    this.userTransactions = [];
    this.referralCode = null;
    this.referralBonus = 100; // Points per successful referral
    this.isInitialized = false;
  }

  // Initialize the system
  async init(userId = null) {
    // In a real system, we would authenticate the user and load their data
    // For this demo, we'll create some fake data
    this.userId = userId || this.generateTemporaryUserId();
    await this.loadUserData();
    this.generateReferralCode();
    this.isInitialized = true;
    
    // Update UI
    this.updatePointsDisplay();
    
    // Check for referral code in URL
    this.checkForReferralInURL();
    
    return this.isInitialized;
  }

  // Generate a temporary user ID for demo purposes
  generateTemporaryUserId() {
    return 'user_' + Math.random().toString(36).substring(2, 15);
  }

  // Load user data (in a real app, this would come from a database)
  async loadUserData() {
    // Simulate API call with a small delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Create sample data for demo
    this.userPoints = Math.floor(Math.random() * 500) + 100;
    this.userTransactions = [
      {
        id: 't1',
        type: 'earning',
        amount: 100,
        description: 'Welcome bonus',
        timestamp: new Date(Date.now() - 864000000).toISOString() // 10 days ago
      },
      {
        id: 't2',
        type: 'earning',
        amount: 50,
        description: 'Completed profile',
        timestamp: new Date(Date.now() - 432000000).toISOString() // 5 days ago
      },
      {
        id: 't3',
        type: 'earning',
        amount: this.referralBonus,
        description: 'Referral bonus',
        timestamp: new Date(Date.now() - 172800000).toISOString() // 2 days ago
      },
      {
        id: 't4',
        type: 'spending',
        amount: -75,
        description: 'Mars Base Model upgrade',
        timestamp: new Date(Date.now() - 86400000).toISOString() // 1 day ago
      }
    ];
  }

  // Generate a unique referral code for the user
  generateReferralCode() {
    if (!this.userId) return null;
    
    // In a real app, this would be a unique, hard-to-guess code stored in a database
    // For this demo, we'll use a simple derivation from the user ID
    const baseCode = this.userId.replace('user_', '');
    this.referralCode = `NO${baseCode.substring(0, 6).toUpperCase()}`;
    
    return this.referralCode;
  }

  // Check for referral code in the URL when the page loads
  checkForReferralInURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const referralCode = urlParams.get('ref');
    
    if (referralCode && referralCode !== this.referralCode) {
      // Store the referral code in localStorage for later use during registration
      localStorage.setItem('referral_code', referralCode);
      
      // Show a message about the referral (in a real app, this would be done after confirming the code is valid)
      this.showReferralMessage(referralCode);
    }
  }

  // Show a message about the referral
  showReferralMessage(referralCode) {
    const referralBanner = document.createElement('div');
    referralBanner.className = 'referral-banner';
    
    referralBanner.innerHTML = `
      <i class="fas fa-gift"></i>
      <p>${languageSwitcher.getTranslation('stardust_referral_desc')}</p>
      <span>${referralCode}</span>
      <button class="close-banner"><i class="fas fa-times"></i></button>
    `;
    
    // Add close button functionality
    const closeButton = referralBanner.querySelector('.close-banner');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        referralBanner.remove();
      });
    }
    
    // Add to the page
    document.body.appendChild(referralBanner);
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
      if (document.body.contains(referralBanner)) {
        referralBanner.remove();
      }
    }, 10000);
  }

  // Get user's points balance
  getPointsBalance() {
    return this.userPoints;
  }

  // Get user's transaction history
  getTransactionHistory() {
    return [...this.userTransactions].sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
  }

  // Get user's referral code
  getReferralCode() {
    return this.referralCode;
  }

  // Get user's referral link
  getReferralLink() {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?ref=${this.referralCode}`;
  }

  // Add points to user's account
  async addPoints(amount, description) {
    if (!this.isInitialized) {
      console.error('StarDust system not initialized');
      return false;
    }
    
    if (amount <= 0) {
      console.error('Amount must be positive');
      return false;
    }
    
    // In a real app, this would be an API call to the server
    // For this demo, we'll just update the local data
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Add transaction
    const transaction = {
      id: 't' + Date.now(),
      type: 'earning',
      amount: amount,
      description: description,
      timestamp: new Date().toISOString()
    };
    
    this.userTransactions.push(transaction);
    this.userPoints += amount;
    
    // Update UI
    this.updatePointsDisplay();
    
    return true;
  }

  // Subtract points from user's account (for rewards/purchases)
  async spendPoints(amount, description) {
    if (!this.isInitialized) {
      console.error('StarDust system not initialized');
      return false;
    }
    
    if (amount <= 0) {
      console.error('Amount must be positive');
      return false;
    }
    
    if (this.userPoints < amount) {
      console.error('Insufficient points');
      return false;
    }
    
    // In a real app, this would be an API call to the server
    // For this demo, we'll just update the local data
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Add transaction
    const transaction = {
      id: 't' + Date.now(),
      type: 'spending',
      amount: -amount, // Negative amount for spending
      description: description,
      timestamp: new Date().toISOString()
    };
    
    this.userTransactions.push(transaction);
    this.userPoints -= amount;
    
    // Update UI
    this.updatePointsDisplay();
    
    return true;
  }

  // Process a successful referral
  async processReferral(referredUserId, referredUserName) {
    if (!this.isInitialized) {
      console.error('StarDust system not initialized');
      return false;
    }
    
    // In a real app, this would verify the referral and ensure it hasn't been claimed before
    // For this demo, we'll just add the points
    
    // Add referral bonus points
    await this.addPoints(
      this.referralBonus,
      `Referral bonus for inviting ${referredUserName || 'a new user'}`
    );
    
    return true;
  }

  // Update points display in UI
  updatePointsDisplay() {
    // Find all elements that should display the points balance
    const pointsDisplays = document.querySelectorAll('.stardust-balance');
    pointsDisplays.forEach(display => {
      display.textContent = this.userPoints;
    });
    
    // Dispatch custom event that other components can listen for
    const event = new CustomEvent('stardustUpdated', {
      detail: { points: this.userPoints }
    });
    document.dispatchEvent(event);
  }

  // Generate and display the transaction history in a specified container
  displayTransactionHistory(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container with ID "${containerId}" not found.`);
      return;
    }
    
    // Clear container
    container.innerHTML = '';
    
    // Get transactions sorted by date (newest first)
    const sortedTransactions = this.getTransactionHistory();
    
    if (sortedTransactions.length === 0) {
      container.innerHTML = '<p class="no-transactions">No transactions yet.</p>';
      return;
    }
    
    // Create transaction list
    const transactionList = document.createElement('ul');
    transactionList.className = 'transaction-list';
    
    sortedTransactions.forEach(transaction => {
      const item = document.createElement('li');
      item.className = `transaction-item ${transaction.type}`;
      
      // Format date
      const date = new Date(transaction.timestamp);
      const formattedDate = date.toLocaleDateString(
        languageSwitcher.currentLanguage === 'zh' ? 'zh-CN' : 'en-US',
        { year: 'numeric', month: 'short', day: 'numeric' }
      );
      
      item.innerHTML = `
        <div class="transaction-icon">
          <i class="fas ${transaction.type === 'earning' ? 'fa-plus-circle' : 'fa-minus-circle'}"></i>
        </div>
        <div class="transaction-details">
          <div class="transaction-description">${transaction.description}</div>
          <div class="transaction-date">${formattedDate}</div>
        </div>
        <div class="transaction-amount ${transaction.type}">${transaction.amount > 0 ? '+' : ''}${transaction.amount}</div>
      `;
      
      transactionList.appendChild(item);
    });
    
    container.appendChild(transactionList);
  }

  // Generate and display the referral UI in a specified container
  displayReferralUI(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container with ID "${containerId}" not found.`);
      return;
    }
    
    // Clear container
    container.innerHTML = '';
    
    // Create referral UI
    const referralUI = document.createElement('div');
    referralUI.className = 'referral-ui';
    
    referralUI.innerHTML = `
      <h3 data-i18n="stardust_referral">${languageSwitcher.getTranslation('stardust_referral')}</h3>
      <p data-i18n="stardust_referral_desc">${languageSwitcher.getTranslation('stardust_referral_desc')}</p>
      
      <div class="referral-link-container">
        <div class="referral-code-display">
          <span class="referral-code-label" data-i18n="stardust_referral_link">${languageSwitcher.getTranslation('stardust_referral_link')}</span>
          <input type="text" class="referral-link" value="${this.getReferralLink()}" readonly>
        </div>
        <button class="copy-referral-btn btn-primary" data-i18n="stardust_copy">${languageSwitcher.getTranslation('stardust_copy')}</button>
      </div>
      
      <div class="share-buttons">
        <button class="share-btn share-twitter">
          <i class="fab fa-twitter"></i> Twitter
        </button>
        <button class="share-btn share-facebook">
          <i class="fab fa-facebook"></i> Facebook
        </button>
        <button class="share-btn share-telegram">
          <i class="fab fa-telegram"></i> Telegram
        </button>
        <button class="share-btn share-weixin">
          <i class="fab fa-weixin"></i> WeChat
        </button>
      </div>
    `;
    
    container.appendChild(referralUI);
    
    // Add copy button functionality
    const copyButton = container.querySelector('.copy-referral-btn');
    const referralLinkInput = container.querySelector('.referral-link');
    
    if (copyButton && referralLinkInput) {
      copyButton.addEventListener('click', () => {
        referralLinkInput.select();
        document.execCommand('copy');
        
        // Show copied message
        const originalText = copyButton.textContent;
        copyButton.textContent = languageSwitcher.currentLanguage === 'zh' ? '已复制!' : 'Copied!';
        
        setTimeout(() => {
          copyButton.textContent = originalText;
        }, 2000);
      });
    }
    
    // Add share button functionality
    const shareButtons = container.querySelectorAll('.share-btn');
    const referralLink = this.getReferralLink();
    const shareText = languageSwitcher.currentLanguage === 'zh' 
      ? `加入寰宇轨道太空殖民社区，一起探索火星定居的未来！使用我的邀请链接，获得100星尘积分。`
      : `Join the NexusOrbital Space Colonization Community and explore the future of Mars settlement! Use my referral link and get 100 Star Dust points.`;
    
    shareButtons.forEach(button => {
      button.addEventListener('click', () => {
        let shareUrl = '';
        
        if (button.classList.contains('share-twitter')) {
          shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(referralLink)}`;
        } else if (button.classList.contains('share-facebook')) {
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${encodeURIComponent(shareText)}`;
        } else if (button.classList.contains('share-telegram')) {
          shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`;
        } else if (button.classList.contains('share-weixin')) {
          // For WeChat, we typically show a QR code modal
          // This is simplified for the demo
          alert(languageSwitcher.currentLanguage === 'zh' 
            ? '请打开微信，使用"扫一扫"功能扫描二维码分享。'
            : 'Please open WeChat and use the "Scan" feature to scan the QR code.');
          return;
        }
        
        // Open share dialog
        if (shareUrl) {
          window.open(shareUrl, '_blank', 'width=600,height=400');
        }
      });
    });
  }
}

// Create and export a singleton instance
const starDustSystem = new StarDustSystem();
export default starDustSystem;
