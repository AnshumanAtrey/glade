/**
 * Product Page Component
 * Handles product gallery, variant selection, and cart functionality
 */

class ProductPage {
  constructor() {
    this.product = window.product || {};
    this.productForm = document.querySelector('.product-form');
    this.variantSelect = document.querySelector('.product-variants');
    this.addToCartBtn = document.querySelector('.product-add-to-cart');
    this.priceContainer = document.querySelector('.product-price-container');
    this.mainImage = document.getElementById('main-product-image');
    this.thumbnails = document.querySelectorAll('.product-thumb');
    this.tabs = document.querySelectorAll('.product-tab');
    this.tabPanels = document.querySelectorAll('.tab-panel');
    this.quantityInput = document.querySelector('.quantity-input');
    this.quantityBtns = document.querySelectorAll('.quantity-btn');
    this.optionInputs = document.querySelectorAll('.product-option-values input[type="radio"]');
    
    this.init();
  }
  
  init() {
    this.setupImageGallery();
    this.setupTabs();
    this.setupQuantitySelector();
    this.setupVariantSelection();
    this.setupAddToCart();
    this.setupAccessibility();
  }
  
  setupImageGallery() {
    if (!this.mainImage || this.thumbnails.length === 0) return;
    
    this.thumbnails.forEach((thumb, index) => {
      thumb.addEventListener('click', () => {
        const imageUrl = thumb.dataset.image;
        if (imageUrl) {
          this.updateMainImage(imageUrl);
          this.setActiveThumbnail(index);
        }
      });
      
      // Keyboard navigation
      thumb.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          thumb.click();
        }
      });
    });
    
    // Touch/swipe support for mobile
    this.setupTouchGallery();
  }
  
  setupTouchGallery() {
    if (!this.mainImage) return;
    
    let startX = 0;
    let currentIndex = 0;
    
    this.mainImage.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    });
    
    this.mainImage.addEventListener('touchend', (e) => {
      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;
      
      if (Math.abs(diff) > 50) { // Minimum swipe distance
        if (diff > 0 && currentIndex < this.thumbnails.length - 1) {
          // Swipe left - next image
          currentIndex++;
        } else if (diff < 0 && currentIndex > 0) {
          // Swipe right - previous image
          currentIndex--;
        }
        
        if (this.thumbnails[currentIndex]) {
          this.thumbnails[currentIndex].click();
        }
      }
    });
  }
  
  updateMainImage(imageUrl) {
    if (this.mainImage) {
      this.mainImage.src = imageUrl;
      this.mainImage.style.opacity = '0';
      
      this.mainImage.onload = () => {
        this.mainImage.style.opacity = '1';
      };
    }
  }
  
  setActiveThumbnail(index) {
    this.thumbnails.forEach((thumb, i) => {
      thumb.classList.toggle('active', i === index);
    });
  }
  
  setupTabs() {
    if (this.tabs.length === 0) return;
    
    this.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;
        this.switchTab(targetTab);
      });
    });
  }
  
  switchTab(targetTab) {
    // Update tab buttons
    this.tabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === targetTab);
    });
    
    // Update tab panels
    this.tabPanels.forEach(panel => {
      panel.classList.toggle('active', panel.id === targetTab);
    });
  }
  
  setupQuantitySelector() {
    if (!this.quantityInput) return;
    
    this.quantityBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const isPlus = btn.classList.contains('quantity-plus');
        const currentValue = parseInt(this.quantityInput.value) || 1;
        const newValue = isPlus ? currentValue + 1 : Math.max(1, currentValue - 1);
        
        this.quantityInput.value = newValue;
        this.quantityInput.dispatchEvent(new Event('change'));
      });
    });
    
    // Validate quantity input
    this.quantityInput.addEventListener('input', () => {
      const value = parseInt(this.quantityInput.value);
      if (isNaN(value) || value < 1) {
        this.quantityInput.value = 1;
      }
    });
  }
  
  setupVariantSelection() {
    if (!this.variantSelect || this.optionInputs.length === 0) return;
    
    this.optionInputs.forEach(input => {
      input.addEventListener('change', () => {
        this.updateSelectedVariant();
      });
    });
    
    // Initialize with first variant
    this.updateSelectedVariant();
  }
  
  updateSelectedVariant() {
    const selectedOptions = [];
    
    // Get selected option values
    this.optionInputs.forEach(input => {
      if (input.checked) {
        selectedOptions.push(input.value);
      }
    });
    
    // Find matching variant
    const variants = Array.from(this.variantSelect.options);
    const matchingVariant = variants.find(option => {
      const variantTitle = option.textContent.trim();
      return selectedOptions.every(selectedOption => 
        variantTitle.includes(selectedOption)
      );
    });
    
    if (matchingVariant) {
      this.variantSelect.value = matchingVariant.value;
      this.updateProductInfo(matchingVariant);
    }
  }
  
  updateProductInfo(variantOption) {
    const isAvailable = variantOption.dataset.available === 'true';
    const price = parseInt(variantOption.dataset.price);
    const comparePrice = parseInt(variantOption.dataset.comparePrice);
    
    // Update button state
    if (this.addToCartBtn) {
      this.addToCartBtn.disabled = !isAvailable;
      const btnText = this.addToCartBtn.querySelector('.btn-text');
      if (btnText) {
        btnText.textContent = isAvailable ? 
          (this.addToCartBtn.dataset.addText || 'ADD TO BAG') : 
          (this.addToCartBtn.dataset.soldOutText || 'SOLD OUT');
      }
    }
    
    // Update price display
    this.updatePriceDisplay(price, comparePrice);
  }
  
  updatePriceDisplay(price, comparePrice) {
    if (!this.priceContainer) return;
    
    const formatPrice = (cents) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(cents / 100);
    };
    
    let priceHTML = `<span class="product-price">${formatPrice(price)}</span>`;
    
    if (comparePrice && comparePrice > price) {
      priceHTML += `<span class="product-price product-price--compare">${formatPrice(comparePrice)}</span>`;
      priceHTML += `<span class="product-sale-badge">SALE</span>`;
    }
    
    this.priceContainer.innerHTML = priceHTML;
  }
  
  setupAddToCart() {
    if (!this.productForm) return;
    
    this.productForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.addToCart();
    });
  }
  
  async addToCart() {
    if (!this.addToCartBtn || this.addToCartBtn.disabled) return;
    
    const formData = new FormData(this.productForm);
    const originalText = this.addToCartBtn.querySelector('.btn-text').textContent;
    
    try {
      // Show loading state
      this.setButtonLoading(true);
      
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const item = await response.json();
        this.handleAddToCartSuccess(item);
      } else {
        throw new Error('Failed to add to cart');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      this.handleAddToCartError();
    } finally {
      this.setButtonLoading(false, originalText);
    }
  }
  
  setButtonLoading(loading, originalText = '') {
    if (!this.addToCartBtn) return;
    
    const btnText = this.addToCartBtn.querySelector('.btn-text');
    if (loading) {
      btnText.textContent = 'ADDING...';
      this.addToCartBtn.disabled = true;
    } else {
      btnText.textContent = originalText || 'ADD TO BAG';
      this.addToCartBtn.disabled = false;
    }
  }
  
  handleAddToCartSuccess(item) {
    // Update cart count
    this.updateCartCount();
    
    // Show success feedback
    this.showAddToCartFeedback('Added to bag!', 'success');
    
    // Open cart drawer if available
    if (typeof openCartDrawer === 'function') {
      setTimeout(() => openCartDrawer(), 500);
    }
    
    // Analytics tracking
    this.trackAddToCart(item);
  }
  
  handleAddToCartError() {
    this.showAddToCartFeedback('Failed to add to cart', 'error');
  }
  
  showAddToCartFeedback(message, type) {
    // Create or update feedback element
    let feedback = document.querySelector('.add-to-cart-feedback');
    if (!feedback) {
      feedback = document.createElement('div');
      feedback.className = 'add-to-cart-feedback';
      this.addToCartBtn.parentNode.appendChild(feedback);
    }
    
    feedback.textContent = message;
    feedback.className = `add-to-cart-feedback add-to-cart-feedback--${type}`;
    feedback.style.cssText = `
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
      z-index: 10;
      border-radius: 0;
      animation: slideDown 0.3s ease-out;
    `;
    
    // Remove after 3 seconds
    setTimeout(() => {
      if (feedback.parentNode) {
        feedback.remove();
      }
    }, 3000);
  }
  
  async updateCartCount() {
    try {
      const response = await fetch('/cart.js');
      const cart = await response.json();
      
      const cartBadges = document.querySelectorAll('.cart-count');
      cartBadges.forEach(badge => {
        badge.textContent = cart.item_count;
      });
    } catch (error) {
      console.error('Failed to update cart count:', error);
    }
  }
  
  trackAddToCart(item) {
    // Analytics tracking
    if (typeof gtag !== 'undefined') {
      gtag('event', 'add_to_cart', {
        currency: 'USD',
        value: item.price / 100,
        items: [{
          item_id: item.product_id,
          item_name: item.product_title,
          item_variant: item.variant_title,
          quantity: item.quantity,
          price: item.price / 100
        }]
      });
    }
  }
  
  setupAccessibility() {
    // Add ARIA labels and roles
    this.thumbnails.forEach((thumb, index) => {
      thumb.setAttribute('role', 'button');
      thumb.setAttribute('aria-label', `View image ${index + 1}`);
      thumb.setAttribute('tabindex', '0');
    });
    
    // Add keyboard navigation for tabs
    this.tabs.forEach(tab => {
      tab.setAttribute('role', 'tab');
      tab.setAttribute('tabindex', '0');
    });
    
    // Add form validation
    if (this.productForm) {
      this.productForm.setAttribute('novalidate', '');
    }
  }
  
  destroy() {
    // Clean up event listeners if needed
    this.thumbnails.forEach(thumb => {
      thumb.removeEventListener('click', this.handleThumbnailClick);
    });
  }
}

// Initialize Product Page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('Product JS: DOM loaded, initializing product page...');
  
  if (document.querySelector('.product-main-section')) {
    try {
      window.productPage = new ProductPage();
      console.log('Product JS: Product page initialized successfully');
    } catch (error) {
      console.error('Failed to initialize product page:', error);
    }
  }
});

// Handle Shopify section reloads
document.addEventListener('shopify:section:load', (event) => {
  if (event.target.querySelector('.product-main-section')) {
    window.productPage = new ProductPage();
  }
});

// Export for potential external use
window.ProductPage = ProductPage;