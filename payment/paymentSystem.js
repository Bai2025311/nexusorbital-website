// Payment System for NexusOrbital Space Colonization Community
// Supports both Alipay and Stripe for international compliance

import languageSwitcher from '../lang/languageSwitcher.js';

class PaymentSystem {
  constructor() {
    this.availablePaymentMethods = ['alipay', 'stripe'];
    this.initialized = {
      alipay: false,
      stripe: false
    };
    this.config = {
      // These would be replaced with real keys in production environment
      // In a real system, API keys should never be exposed in client-side code,
      // instead, payments should be processed through a secure backend
      testMode: true,
      currency: 'USD', // Default currency
      stripePublicKey: 'pk_test_examplekey123456789',
      alipayPartnerID: 'test_partner_id'
    };
    this.stripe = null;
    this.stripeElements = null;
    this.pendingPayment = null;
  }

  // Initialize the payment system
  async init() {
    // Set currency based on language
    this.config.currency = languageSwitcher.currentLanguage === 'zh' ? 'CNY' : 'USD';
    
    // Load necessary scripts
    await this.loadScripts();
    
    // Listen for language changes
    document.addEventListener('languageChanged', (event) => {
      this.config.currency = event.detail.language === 'zh' ? 'CNY' : 'USD';
      // Update UI if needed
      if (this.pendingPayment) {
        this.updatePaymentUIText();
      }
    });
    
    return true;
  }

  // Load necessary scripts for payment providers
  async loadScripts() {
    const promiseStripe = new Promise((resolve, reject) => {
      // In a real application, we would load the Stripe.js script here
      console.log('Simulating Stripe.js loading...');
      
      // Simulate script loading
      setTimeout(() => {
        this.initialized.stripe = true;
        
        // Mock Stripe object for demo purposes
        this.stripe = {
          elements: () => ({
            create: (type, options) => ({
              mount: (element) => {
                console.log(`Mounted ${type} element to ${element}`);
                const el = document.querySelector(element);
                if (el) {
                  el.innerHTML = `<div class="mock-stripe-element">${type} form (demo)</div>`;
                }
                return { on: () => {} };
              }
            })
          }),
          createPaymentMethod: () => new Promise(resolve => {
            setTimeout(() => {
              resolve({
                paymentMethod: { id: 'pm_' + Math.random().toString(36).substring(2, 15) }
              });
            }, 500);
          }),
          confirmCardPayment: () => new Promise(resolve => {
            setTimeout(() => {
              resolve({ paymentIntent: { status: 'succeeded' } });
            }, 1000);
          })
        };
        
        resolve('Stripe loaded successfully');
      }, 800);
    });
    
    const promiseAlipay = new Promise((resolve, reject) => {
      // In a real application, we would load the Alipay SDK here
      console.log('Simulating Alipay SDK loading...');
      
      // Simulate script loading
      setTimeout(() => {
        this.initialized.alipay = true;
        resolve('Alipay loaded successfully');
      }, 800);
    });
    
    // Load all payment SDKs in parallel
    return Promise.all([promiseStripe, promiseAlipay]);
  }

  // Check if specific payment method is available
  isPaymentMethodAvailable(method) {
    return this.availablePaymentMethods.includes(method) && this.initialized[method];
  }

  // Create a payment UI in the specified container
  createPaymentUI(containerId, amount, description, callback) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container with ID "${containerId}" not found.`);
      return false;
    }
    
    // Store pending payment details
    this.pendingPayment = {
      amount,
      description,
      callback,
      currency: this.config.currency
    };
    
    // Clear container
    container.innerHTML = '';
    
    // Create payment UI
    const paymentUI = document.createElement('div');
    paymentUI.className = 'payment-ui';
    
    const formattedAmount = this.formatCurrency(amount);
    
    paymentUI.innerHTML = `
      <div class="payment-header">
        <h3 data-i18n="payment_title">${languageSwitcher.getTranslation('payment_title')}</h3>
        <p class="payment-description">${description}</p>
        <p class="payment-amount">${formattedAmount}</p>
      </div>
      
      <div class="payment-methods">
        <div class="payment-method-tabs">
          ${this.initialized.alipay ? `
            <button class="payment-method-tab active" data-method="alipay">
              <i class="fab fa-alipay"></i>
              <span data-i18n="payment_alipay">${languageSwitcher.getTranslation('payment_alipay')}</span>
            </button>
          ` : ''}
          
          ${this.initialized.stripe ? `
            <button class="payment-method-tab ${!this.initialized.alipay ? 'active' : ''}" data-method="stripe">
              <i class="far fa-credit-card"></i>
              <span data-i18n="payment_stripe">${languageSwitcher.getTranslation('payment_stripe')}</span>
            </button>
          ` : ''}
        </div>
        
        <div class="payment-method-content">
          <div class="payment-method-form alipay ${this.initialized.alipay ? 'active' : ''}">
            <div class="alipay-qr-placeholder">
              <div class="qr-code-area">
                <i class="fas fa-qrcode"></i>
                <p>${languageSwitcher.currentLanguage === 'zh' ? '扫描二维码支付' : 'Scan QR code to pay'}</p>
              </div>
              <button class="btn-primary pay-button alipay-button">
                ${languageSwitcher.currentLanguage === 'zh' ? '打开支付宝APP支付' : 'Open Alipay App'}
              </button>
            </div>
          </div>
          
          <div class="payment-method-form stripe ${!this.initialized.alipay && this.initialized.stripe ? 'active' : ''}">
            <div class="stripe-form">
              <div class="form-group">
                <label for="cardholder-name">
                  ${languageSwitcher.currentLanguage === 'zh' ? '持卡人姓名' : 'Cardholder Name'}
                </label>
                <input type="text" id="cardholder-name" class="form-control" required>
              </div>
              
              <div class="form-group">
                <label for="card-element">
                  ${languageSwitcher.currentLanguage === 'zh' ? '信用卡信息' : 'Credit Card Information'}
                </label>
                <div id="card-element" class="form-control"></div>
                <div id="card-errors" class="text-danger"></div>
              </div>
              
              <button class="btn-primary pay-button stripe-button">
                ${languageSwitcher.currentLanguage === 'zh' ? '支付' : 'Pay'} ${formattedAmount}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="payment-footer">
        <p data-i18n="payment_secure">${languageSwitcher.getTranslation('payment_secure')}</p>
        <div class="payment-security-icons">
          <i class="fas fa-lock"></i>
          <i class="fas fa-shield-alt"></i>
        </div>
      </div>
    `;
    
    container.appendChild(paymentUI);
    
    // Add tab switching functionality
    const tabs = container.querySelectorAll('.payment-method-tab');
    const forms = container.querySelectorAll('.payment-method-form');
    
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const method = tab.getAttribute('data-method');
        
        // Update active tab
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Update active form
        forms.forEach(form => form.classList.remove('active'));
        container.querySelector(`.payment-method-form.${method}`).classList.add('active');
      });
    });
    
    // Initialize Stripe Elements if available
    if (this.initialized.stripe) {
      // In a real app, we would mount Stripe elements here
      this.mountStripeElements('#card-element');
    }
    
    // Add payment button event listeners
    const stripeButton = container.querySelector('.stripe-button');
    if (stripeButton) {
      stripeButton.addEventListener('click', () => {
        this.processStripePayment(amount, description, callback);
      });
    }
    
    const alipayButton = container.querySelector('.alipay-button');
    if (alipayButton) {
      alipayButton.addEventListener('click', () => {
        this.processAlipayPayment(amount, description, callback);
      });
    }
    
    return true;
  }

  // Mount Stripe Elements for credit card input
  mountStripeElements(elementSelector) {
    if (!this.stripe) {
      console.error('Stripe not initialized');
      return;
    }
    
    // Create Stripe elements
    this.stripeElements = this.stripe.elements();
    
    // Create and mount the card element
    const cardElement = this.stripeElements.create('card', {
      style: {
        base: {
          color: '#32325d',
          fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
          fontSmoothing: 'antialiased',
          fontSize: '16px',
          '::placeholder': {
            color: '#aab7c4'
          }
        },
        invalid: {
          color: '#fa755a',
          iconColor: '#fa755a'
        }
      }
    });
    
    cardElement.mount(elementSelector);
    
    // Handle validation errors
    cardElement.on('change', ({error}) => {
      const displayError = document.getElementById('card-errors');
      if (displayError) {
        if (error) {
          displayError.textContent = error.message;
        } else {
          displayError.textContent = '';
        }
      }
    });
  }

  // Process Stripe payment
  async processStripePayment(amount, description, callback) {
    if (!this.stripe || !this.initialized.stripe) {
      console.error('Stripe not initialized');
      return { success: false, error: 'Stripe not initialized' };
    }
    
    // Get cardholder name
    const cardholderName = document.getElementById('cardholder-name')?.value;
    if (!cardholderName) {
      document.getElementById('card-errors').textContent = 
        languageSwitcher.currentLanguage === 'zh' ? '请输入持卡人姓名' : 'Please enter cardholder name';
      return { success: false, error: 'Missing cardholder name' };
    }
    
    try {
      // Show loading state
      const stripeButton = document.querySelector('.stripe-button');
      if (stripeButton) {
        stripeButton.disabled = true;
        stripeButton.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${languageSwitcher.currentLanguage === 'zh' ? '处理中...' : 'Processing...'}`;
      }
      
      // In a real app, we would create a payment intent on the server and confirm it here
      // This is a simplified mock implementation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful payment
      const result = {
        success: true,
        paymentId: 'pi_' + Math.random().toString(36).substring(2, 15),
        amount,
        currency: this.config.currency
      };
      
      // Restore button state
      if (stripeButton) {
        stripeButton.disabled = false;
        stripeButton.innerHTML = `<i class="fas fa-check"></i> ${languageSwitcher.currentLanguage === 'zh' ? '支付成功' : 'Payment Successful'}`;
      }
      
      // Call the callback with the result
      if (callback && typeof callback === 'function') {
        callback(result);
      }
      
      return result;
    } catch (error) {
      console.error('Payment error:', error);
      
      // Show error
      const cardErrors = document.getElementById('card-errors');
      if (cardErrors) {
        cardErrors.textContent = error.message || 
          (languageSwitcher.currentLanguage === 'zh' ? '支付处理时出错' : 'Error processing payment');
      }
      
      // Restore button state
      const stripeButton = document.querySelector('.stripe-button');
      if (stripeButton) {
        stripeButton.disabled = false;
        stripeButton.innerHTML = languageSwitcher.currentLanguage === 'zh' ? '重试' : 'Retry';
      }
      
      const result = { success: false, error: error.message || 'Payment failed' };
      
      // Call the callback with the error
      if (callback && typeof callback === 'function') {
        callback(result);
      }
      
      return result;
    }
  }

  // Process Alipay payment
  async processAlipayPayment(amount, description, callback) {
    if (!this.initialized.alipay) {
      console.error('Alipay not initialized');
      return { success: false, error: 'Alipay not initialized' };
    }
    
    try {
      // Show loading state
      const alipayButton = document.querySelector('.alipay-button');
      if (alipayButton) {
        alipayButton.disabled = true;
        alipayButton.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${languageSwitcher.currentLanguage === 'zh' ? '处理中...' : 'Processing...'}`;
      }
      
      // In a real app, we would redirect to Alipay or show a QR code
      // This is a simplified mock implementation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful payment
      const result = {
        success: true,
        paymentId: 'alipay_' + Math.random().toString(36).substring(2, 15),
        amount,
        currency: this.config.currency
      };
      
      // Restore button state
      if (alipayButton) {
        alipayButton.disabled = false;
        alipayButton.innerHTML = `<i class="fas fa-check"></i> ${languageSwitcher.currentLanguage === 'zh' ? '支付成功' : 'Payment Successful'}`;
      }
      
      // Call the callback with the result
      if (callback && typeof callback === 'function') {
        callback(result);
      }
      
      return result;
    } catch (error) {
      console.error('Payment error:', error);
      
      // Restore button state
      const alipayButton = document.querySelector('.alipay-button');
      if (alipayButton) {
        alipayButton.disabled = false;
        alipayButton.innerHTML = languageSwitcher.currentLanguage === 'zh' ? '重试' : 'Retry';
      }
      
      const result = { success: false, error: error.message || 'Payment failed' };
      
      // Call the callback with the error
      if (callback && typeof callback === 'function') {
        callback(result);
      }
      
      return result;
    }
  }

  // Format currency based on the current language and currency
  formatCurrency(amount) {
    const currency = this.config.currency;
    
    if (currency === 'CNY') {
      return `¥${amount.toFixed(2)}`;
    } else {
      return `$${amount.toFixed(2)}`;
    }
  }

  // Update payment UI text for current language
  updatePaymentUIText() {
    const tabs = document.querySelectorAll('.payment-method-tab');
    tabs.forEach(tab => {
      const method = tab.getAttribute('data-method');
      const span = tab.querySelector('span');
      if (span) {
        span.textContent = languageSwitcher.getTranslation(`payment_${method}`);
      }
    });
    
    // Update buttons
    const stripeButton = document.querySelector('.stripe-button');
    if (stripeButton) {
      stripeButton.textContent = `${languageSwitcher.currentLanguage === 'zh' ? '支付' : 'Pay'} ${this.formatCurrency(this.pendingPayment.amount)}`;
    }
    
    const alipayButton = document.querySelector('.alipay-button');
    if (alipayButton) {
      alipayButton.textContent = languageSwitcher.currentLanguage === 'zh' ? '打开支付宝APP支付' : 'Open Alipay App';
    }
    
    // Update form labels
    const cardholderLabel = document.querySelector('label[for="cardholder-name"]');
    if (cardholderLabel) {
      cardholderLabel.textContent = languageSwitcher.currentLanguage === 'zh' ? '持卡人姓名' : 'Cardholder Name';
    }
    
    const cardElementLabel = document.querySelector('label[for="card-element"]');
    if (cardElementLabel) {
      cardElementLabel.textContent = languageSwitcher.currentLanguage === 'zh' ? '信用卡信息' : 'Credit Card Information';
    }
    
    // Update QR code text
    const qrText = document.querySelector('.qr-code-area p');
    if (qrText) {
      qrText.textContent = languageSwitcher.currentLanguage === 'zh' ? '扫描二维码支付' : 'Scan QR code to pay';
    }
  }
}

// Create and export a singleton instance
const paymentSystem = new PaymentSystem();
export default paymentSystem;
