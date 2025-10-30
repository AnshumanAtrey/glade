/**
 * Footer Section Component
 * Handles footer animations and newsletter functionality
 */

class FooterSection {
  constructor(element) {
    this.footer = element;
    this.footerBanner = this.footer.querySelector('.footer-banner');
    this.footerBannerText = this.footer.querySelector('.footer-banner-text h2 span');
    this.subscribeForm = this.footer.querySelector('.subscribe-form');
    this.newsletterInput = this.footer.querySelector('.subscribe-form input[type="email"]');
    this.privacyCheckbox = this.footer.querySelector('.subscribe-agreement input[type="checkbox"]');
    
    this.init();
  }
  
  init() {
    this.setupScrollAnimations();
    this.setupNewsletterForm();
    this.setupAccessibility();
  }
  
  setupScrollAnimations() {
    if (!this.footerBanner || !this.footerBannerText) return;
    
    // Initialize Lenis scroll listener if available
    if (typeof lenis !== 'undefined') {
      lenis.on('scroll', (e) => {
        const scrollProgress = e.progress; // 0 to 1
        
        // Zoom out animation at 60% scroll
        if (scrollProgress >= 0.6) {
          const zoomProgress = Math.min((scrollProgress - 0.6) / 0.2, 1); // 0.6 to 0.8
          const scale = 1 + (0.15 * (1 - zoomProgress)); // Start at 1.15, end at 1
          this.footerBanner.style.transform = `scale(${scale})`;
        } else {
          this.footerBanner.style.transform = 'scale(1.15)';
        }
        
        // Text height animation at 80% scroll
        if (scrollProgress >= 0.8) {
          const textProgress = Math.min((scrollProgress - 0.8) / 0.2, 1); // 0.8 to 1.0
          this.footerBannerText.style.height = `${textProgress * 100}%`;
          this.footerBannerText.style.overflow = 'hidden';
        } else {
          this.footerBannerText.style.height = '0%';
          this.footerBannerText.style.overflow = 'hidden';
        }
      });
    } else {
      // Fallback scroll listener
      window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollProgress = scrollTop / docHeight;
        
        // Zoom out animation at 60% scroll
        if (scrollProgress >= 0.6) {
          const zoomProgress = Math.min((scrollProgress - 0.6) / 0.2, 1);
          const scale = 1 + (0.15 * (1 - zoomProgress));
          this.footerBanner.style.transform = `scale(${scale})`;
        } else {
          this.footerBanner.style.transform = 'scale(1.15)';
        }
        
        // Text height animation at 80% scroll
        if (scrollProgress >= 0.8) {
          const textProgress = Math.min((scrollProgress - 0.8) / 0.2, 1);
          this.footerBannerText.style.height = `${textProgress * 100}%`;
          this.footerBannerText.style.overflow = 'hidden';
        } else {
          this.footerBannerText.style.height = '0%';
          this.footerBannerText.style.overflow = 'hidden';
        }
      });
    }
  }
  
  setupNewsletterForm() {
    if (!this.subscribeForm) return;
    
    this.subscribeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Validate email
      if (!this.newsletterInput.value || !this.isValidEmail(this.newsletterInput.value)) {
        this.showMessage('Please enter a valid email address.', 'error');
        return;
      }
      
      // Validate privacy checkbox
      if (this.privacyCheckbox && !this.privacyCheckbox.checked) {
        this.showMessage('Please agree to the privacy policy.', 'error');
        return;
      }
      
      // Submit newsletter signup
      this.submitNewsletter(this.newsletterInput.value);
    });
    
    // Real-time email validation
    if (this.newsletterInput) {
      this.newsletterInput.addEventListener('blur', () => {
        if (this.newsletterInput.value && !this.isValidEmail(this.newsletterInput.value)) {
          this.newsletterInput.style.borderColor = '#ff6b6b';
        } else {
          this.newsletterInput.style.borderColor = '#666';
        }
      });
      
      this.newsletterInput.addEventListener('input', () => {
        this.newsletterInput.style.borderColor = '#666';
      });
    }
  }
  
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  async submitNewsletter(email) {
    const submitButton = this.subscribeForm.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    try {
      // Show loading state
      submitButton.textContent = 'SUBSCRIBING...';
      submitButton.disabled = true;
      
      // Submit to Shopify customer API
      const response = await fetch('/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'form_type': 'customer',
          'utf8': '✓',
          'contact[email]': email,
          'contact[tags]': 'newsletter'
        })
      });
      
      if (response.ok) {
        this.showMessage('Thank you for subscribing!', 'success');
        this.newsletterInput.value = '';
        if (this.privacyCheckbox) {
          this.privacyCheckbox.checked = false;
        }
      } else {
        throw new Error('Subscription failed');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      this.showMessage('Something went wrong. Please try again.', 'error');
    } finally {
      // Reset button state
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    }
  }
  
  showMessage(message, type) {
    // Remove existing message
    const existingMessage = this.footer.querySelector('.newsletter-message');
    if (existingMessage) {
      existingMessage.remove();
    }
    
    // Create new message
    const messageElement = document.createElement('div');
    messageElement.className = `newsletter-message newsletter-message--${type}`;
    messageElement.textContent = message;
    messageElement.style.cssText = `
      position: absolute;
      top: -40px;
      left: 0;
      right: 0;
      padding: 10px;
      text-align: center;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      background: ${type === 'success' ? '#fff' : '#ff6b6b'};
      color: ${type === 'success' ? '#000' : '#fff'};
      border: ${type === 'success' ? '1px solid #fff' : 'none'};
      border-radius: 0;
      z-index: 10;
      animation: slideDown 0.3s ease-out;
    `;
    
    // Add CSS for animation
    if (!document.querySelector('#newsletter-message-styles')) {
      const style = document.createElement('style');
      style.id = 'newsletter-message-styles';
      style.textContent = `
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }
    
    // Position relative to form container
    const formContainer = this.subscribeForm.parentElement;
    formContainer.style.position = 'relative';
    formContainer.appendChild(messageElement);
    
    // Remove message after 5 seconds
    setTimeout(() => {
      if (messageElement.parentElement) {
        messageElement.style.animation = 'slideDown 0.3s ease-out reverse';
        setTimeout(() => messageElement.remove(), 300);
      }
    }, 5000);
  }
  
  setupAccessibility() {
    // Add ARIA labels
    const footerColumns = this.footer.querySelectorAll('.footer-column');
    footerColumns.forEach((column, index) => {
      const title = column.querySelector('h5');
      if (title) {
        column.setAttribute('aria-label', `Footer section: ${title.textContent}`);
      }
    });
    
    // Enhance form accessibility
    if (this.newsletterInput) {
      this.newsletterInput.setAttribute('aria-label', 'Email address for newsletter');
      this.newsletterInput.setAttribute('aria-describedby', 'newsletter-description');
      
      // Add description for screen readers
      const description = document.createElement('div');
      description.id = 'newsletter-description';
      description.className = 'sr-only';
      description.textContent = 'Enter your email to subscribe to our newsletter';
      description.style.cssText = `
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      `;
      this.subscribeForm.appendChild(description);
    }
  }
  
  destroy() {
    // Clean up event listeners if needed
    if (typeof lenis !== 'undefined') {
      lenis.off('scroll');
    } else {
      window.removeEventListener('scroll', this.handleScroll);
    }
  }
}

// Initialize Footer sections when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const footerSections = document.querySelectorAll('.main-footer-section');
  
  footerSections.forEach(footer => {
    try {
      new FooterSection(footer);
    } catch (error) {
      console.warn('Failed to initialize Footer section:', error);
    }
  });
});

// Handle Shopify section reloads
document.addEventListener('shopify:section:load', (event) => {
  const footerSection = event.target.querySelector('.main-footer-section');
  if (footerSection) {
    new FooterSection(footerSection);
  }
});

// GSAP Animations (if GSAP is available)
if (typeof gsap !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  
  document.addEventListener('DOMContentLoaded', () => {
    const footerSections = document.querySelectorAll('.main-footer-section');
    
    footerSections.forEach(footer => {
      const columns = footer.querySelectorAll('.footer-column');
      const subscribeSection = footer.querySelector('.footer-subscribe-section');
      
      // Animate footer columns
      if (columns.length > 0) {
        gsap.set(columns, {
          opacity: 0,
          y: 30
        });
        
        ScrollTrigger.create({
          trigger: footer,
          start: 'top 90%',
          onEnter: () => {
            gsap.to(columns, {
              opacity: 1,
              y: 0,
              duration: 0.6,
              stagger: 0.1,
              ease: 'power2.out'
            });
          }
        });
      }
      
      // Animate subscribe section
      if (subscribeSection) {
        gsap.set(subscribeSection, {
          opacity: 0,
          y: 20
        });
        
        ScrollTrigger.create({
          trigger: subscribeSection,
          start: 'top 95%',
          onEnter: () => {
            gsap.to(subscribeSection, {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: 'power2.out',
              delay: 0.3
            });
          }
        });
      }
    });
  });
}

// Export for potential external use
window.FooterSection = FooterSection;