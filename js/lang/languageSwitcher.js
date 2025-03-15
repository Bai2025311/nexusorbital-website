// Language switcher utility for NexusOrbital Space Colonization Community
import translations from './translations.js';

class LanguageSwitcher {
  constructor() {
    this.currentLanguage = this.detectUserLanguage();
    this.translations = translations;
    this.elements = [];
  }

  // Detect user's preferred language from browser settings or localStorage
  detectUserLanguage() {
    // First check if language is stored in localStorage
    const savedLanguage = localStorage.getItem('cosmicweave_language');
    if (savedLanguage) {
      return savedLanguage;
    }
    
    // Otherwise detect from browser
    const browserLang = navigator.language || navigator.userLanguage;
    return browserLang.startsWith('zh') ? 'zh' : 'en';
  }

  // Initialize language elements on the page
  init() {
    // Set initial language
    document.documentElement.lang = this.currentLanguage;
    
    // Find all elements with data-i18n attribute
    this.elements = document.querySelectorAll('[data-i18n]');
    
    // Apply translations
    this.applyTranslations();
    
    // Setup language switcher buttons
    this.setupLanguageSwitcher();
  }

  // Apply translations to all elements with data-i18n attribute
  applyTranslations() {
    this.elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      if (this.translations[this.currentLanguage][key]) {
        // Check if the element is an input element
        if (element.tagName === 'INPUT' && (element.type === 'text' || element.type === 'email' || element.type === 'password')) {
          element.placeholder = this.translations[this.currentLanguage][key];
        } else {
          element.textContent = this.translations[this.currentLanguage][key];
        }
      }
    });
    
    // Also update any dynamic content using a custom event
    const event = new CustomEvent('languageChanged', {
      detail: { language: this.currentLanguage }
    });
    document.dispatchEvent(event);
  }

  // Set up language switcher buttons
  setupLanguageSwitcher() {
    const switchers = document.querySelectorAll('.language-switch');
    
    switchers.forEach(switcher => {
      switcher.addEventListener('click', (e) => {
        e.preventDefault();
        const lang = switcher.getAttribute('data-lang');
        this.switchLanguage(lang);
      });
      
      // Highlight the current language button
      if (switcher.getAttribute('data-lang') === this.currentLanguage) {
        switcher.classList.add('active');
      } else {
        switcher.classList.remove('active');
      }
    });
  }

  // Switch language
  switchLanguage(lang) {
    if (lang && this.translations[lang]) {
      this.currentLanguage = lang;
      localStorage.setItem('cosmicweave_language', lang);
      document.documentElement.lang = lang;
      this.applyTranslations();
      
      // Update active class on switchers
      const switchers = document.querySelectorAll('.language-switch');
      switchers.forEach(switcher => {
        if (switcher.getAttribute('data-lang') === lang) {
          switcher.classList.add('active');
        } else {
          switcher.classList.remove('active');
        }
      });
    }
  }

  // Get translation for a specific key
  getTranslation(key) {
    return this.translations[this.currentLanguage][key] || key;
  }
}

// Create and export a singleton instance
const languageSwitcher = new LanguageSwitcher();
export default languageSwitcher;
