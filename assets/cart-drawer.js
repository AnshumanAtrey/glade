/**
 * Cart Drawer Component
 * Handles cart drawer functionality, animations, and Shopify cart API
 */

class CartDrawer {
  constructor() {
    this.overlay = document.getElementById('cart-drawer-overlay');
    this.drawer = document.getElementById('cart-drawer');
    this.closeBtn = document.getElementById('cart-drawer-close');
    this.itemsContainer = document.getElementById('cart-drawer-items');
    this.countElement = document.getElementById('cart-drawer-count');
    this.subtotalElement = document.getElementById('cart-subtotal-amount');
    this.checkoutBtn = document.getElementById('cart-checkout-btn');
    
    this.isOpen = false;
    this.isLoading = false;
    
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.setupKeyboardNavigation();
    this.updateCartDisplay();
  }
  
  setupEventListeners() {
    // Close button
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }
    
    // Overlay click to close
    if (this.overlay) {
      this.overlay.addEventListener('click', (e) => {
        if (e.target === this.overlay) {
          this.close();
        }
      });
    }
    
    // Checkout button
    if (this.checkoutBtn) {
      this.checkoutBtn.addEventListener('click', () => {
        window.location.href = '/checkout';
      });
    }
    
    // Cart icon clicks (setup globally)
    this.setupCartIconListeners();
    
    // Quantity and remove buttons (delegated)
    if (this.itemsContainer) {
      this.itemsContainer.addEventListener('click', (e) => {
        this.handleItemAction(e);
      });
    }
  }
  
  setupCartIconListeners() {
    // Find all cart icons and add click listeners
    const cartIcons = document.querySelectorAll('.cart, [data-cart-trigger]');
    cartIcons.forEach(icon => {
      icon.addEventListener('click', (e) => {
        e.preventDefault();
        this.open();
      });
    });
  }
  
  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }
  
  async handleItemAction(e) {
    const target = e.target.closest('button');
    if (!target) return;
    
    const itemId = target.dataset.itemId;
    if (!itemId) return;
    
    e.preventDefault();
    
    if (target.classList.contains('quantity-increase') || target.classList.contains('quantity-decrease')) {
      const quantity = parseInt(target.dataset.quantity);
      await this.updateQuantity(itemId, quantity);
    } else if (target.classList.contains('cart-item-remove')) {
      await this.removeItem(itemId);
    }
  }
  
  async updateQuantity(itemId, quantity) {
    if (this.isLoading) return;
    
    try {
      this.setLoading(true);
      
      const response = await fetch('/cart/change.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: itemId,
          quantity: Math.max(0, quantity)
        })
      });
      
      if (response.ok) {
        await this.updateCartDisplay();
        this.showFeedback('Cart updated', 'success');
      } else {
        throw new Error('Failed to update cart');
      }
    } catch (error) {
      console.error('Cart update error:', error);
      this.showFeedback('Failed to update cart', 'error');
    } finally {
      this.setLoading(false);
    }
  }
  
  async removeItem(itemId) {
    await this.updateQuantity(itemId, 0);
  }
  
  async addItem(variantId, quantity = 1, properties = {}) {
    if (this.isLoading) return;
    
    try {
      this.setLoading(true);
      
      const formData = new FormData();
      formData.append('id', variantId);
      formData.append('quantity', quantity);
      
      // Add properties if provided
      Object.keys(properties).forEach(key => {
        formData.append(`properties[${key}]`, properties[key]);
      });
      
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const item = await response.json();
        await this.updateCartDisplay();
        this.showFeedback('Added to cart', 'success');
        this.open();
        
        // Analytics tracking
        this.trackAddToCart(item);
        
        return item;
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      this.showFeedback(error.message || 'Failed to add to cart', 'error');
      throw error;
    } finally {
      this.setLoading(false);
    }
  }
  
  async updateCartDisplay() {
    try {
      const response = await fetch('/cart.js');
      const cart = await response.json();
      
      this.updateCartCount(cart.item_count);
      this.updateSubtotal(cart.total_price);
      this.renderCartItems(cart.items);
      
      // Update checkout button state
      if (this.checkoutBtn) {
        this.checkoutBtn.disabled = cart.item_count === 0;
      }
      
    } catch (error) {
      console.error('Failed to update cart display:', error);
    }
  }
  
  updateCartCount(count) {
    // Update drawer count
    if (this.countElement) {
      this.countElement.textContent = count;
    }
    
    // Update all cart badges
    const cartBadges = document.querySelectorAll('.cart-count');
    cartBadges.forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'block' : 'none';
    });
  }
  
  updateSubtotal(totalPrice) {
    if (this.subtotalElement) {
      this.subtotalElement.textContent = this.formatMoney(totalPrice);
    }
  }
  
  renderCartItems(items) {
    if (!this.itemsContainer) return;
    
    if (items.length === 0) {
      this.renderEmptyState();
      return;
    }
    
    const itemsHTML = items.map(item => this.renderCartItem(item)).join('');
    this.itemsContainer.innerHTML = itemsHTML;
  }
  
  renderCartItem(item) {
    const imageUrl = item.image ? item.image : '';
    const variantTitle = item.variant_title !== 'Default Title' ? item.variant_title : '';
    const hasDiscount = item.original_line_price > item.final_line_price;
    
    return `
      <div class="cart-drawer-item" data-item-id="${item.id}">
        <div class="cart-item-image">
          ${imageUrl ? 
            `<img src="${imageUrl}" alt="${item.title}" width="80" height="100">` :
            `<div class="cart-item-placeholder"><span>No Image</span></div>`
          }
        </div>
        
        <div class="cart-item-details">
          <h4 class="cart-item-title">${item.product_title}</h4>
          ${variantTitle ? `<p class="cart-item-variant">${variantTitle}</p>` : ''}
          
          <div class="cart-item-price-row">
            <span class="cart-item-price">${this.formatMoney(item.final_line_price)}</span>
            ${hasDiscount ? `<span class="cart-item-original-price">${this.formatMoney(item.original_line_price)}</span>` : ''}
          </div>
          
          <div class="cart-item-quantity">
            <button class="quantity-btn quantity-decrease" 
                    data-item-id="${item.id}"
                    data-quantity="${item.quantity - 1}"
                    aria-label="Decrease quantity">
              -
            </button>
            <span class="quantity-display">${item.quantity}</span>
            <button class="quantity-btn quantity-increase" 
                    data-item-id="${item.id}"
                    data-quantity="${item.quantity + 1}"
                    aria-label="Increase quantity">
              +
            </button>
            <button class="cart-item-remove" 
                    data-item-id="${item.id}"
                    aria-label="Remove item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }
  
  renderEmptyState() {
    const emptyStateHTML = `
      <div class="cart-empty-state">
        <div class="cart-empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
        </div>
        <h3 class="cart-empty-title">Your bag is empty</h3>
        <p class="cart-empty-text">Add some products to get started</p>
        <a href="/collections/all" class="cart-empty-button">SHOP NOW</a>
      </div>
    `;
    
    this.itemsContainer.innerHTML = emptyStateHTML;
  }
  
  open() {
    if (this.isOpen) return;
    
    this.isOpen = true;
    document.body.style.overflow = 'hidden';
    
    if (this.overlay) {
      this.overlay.style.display = 'flex';
      // Force reflow
      this.overlay.offsetHeight;
      this.overlay.classList.add('active');
    }
    
    // Update cart display when opening
    this.updateCartDisplay();
    
    // Focus management
    if (this.closeBtn) {
      this.closeBtn.focus();
    }
  }
  
  close() {
    if (!this.isOpen) return;
    
    this.isOpen = false;
    document.body.style.overflow = '';
    
    if (this.overlay) {
      this.overlay.classList.remove('active');
      
      // Hide after animation
      setTimeout(() => {
        this.overlay.style.display = 'none';
      }, 300);
    }
  }
  
  setLoading(loading) {
    this.isLoading = loading;
    
    if (this.itemsContainer) {
      this.itemsContainer.classList.toggle('loading', loading);
    }
    
    if (this.checkoutBtn) {
      this.checkoutBtn.disabled = loading;
    }
  }
  
  showFeedback(message, type = 'info') {
    // Create or update feedback element
    let feedback = document.querySelector('.cart-feedback');
    if (!feedback) {
      feedback = document.createElement('div');
      feedback.className = 'cart-feedback';
      document.body.appendChild(feedback);
    }
    
    feedback.textContent = message;
    feedback.className = `cart-feedback cart-feedback--${type}`;
    feedback.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      background: ${type === 'success' ? '#fff' : type === 'error' ? '#ff6b6b' : '#333'};
      color: ${type === 'success' ? '#000' : '#fff'};
      border: ${type === 'success' ? '1px solid #fff' : 'none'};
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
      z-index: 10000;
      border-radius: 0;
      animation: slideInRight 0.3s ease-out;
    `;
    
    // Add CSS animation if not exists
    if (!document.querySelector('#cart-feedback-styles')) {
      const style = document.createElement('style');
      style.id = 'cart-feedback-styles';
      style.textContent = `
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }
    
    // Remove after 3 seconds
    setTimeout(() => {
      if (feedback.parentNode) {
        feedback.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(() => feedback.remove(), 300);
      }
    }, 3000);
  }
  
  formatMoney(cents) {
    // Simple money formatting - can be enhanced based on shop currency
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(cents / 100);
  }
  
  trackAddToCart(item) {
    // Analytics tracking
    if (typeof gtag !== 'undefined') {
      gtag('event', 'add_to_cart', {
        currency: 'INR',
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
  
  // Public API methods
  getCartData() {
    return fetch('/cart.js').then(res => res.json());
  }
  
  clearCart() {
    return fetch('/cart/clear.js', { method: 'POST' })
      .then(() => this.updateCartDisplay());
  }
  
  destroy() {
    // Clean up event listeners
    document.removeEventListener('keydown', this.handleKeydown);
    if (this.overlay) {
      this.overlay.removeEventListener('click', this.handleOverlayClick);
    }
  }
}

// Initialize Cart Drawer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('Cart Drawer JS: DOM loaded, initializing cart drawer...');
  
  try {
    window.cartDrawer = new CartDrawer();
    console.log('Cart Drawer JS: Cart drawer initialized successfully');
    
    // Global functions for backward compatibility
    window.openCartDrawer = () => window.cartDrawer.open();
    window.closeCartDrawer = () => window.cartDrawer.close();
    window.addToCart = (variantId, quantity, properties) => 
      window.cartDrawer.addItem(variantId, quantity, properties);
    
  } catch (error) {
    console.error('Failed to initialize cart drawer:', error);
  }
});

// Handle Shopify section reloads
document.addEventListener('shopify:section:load', (event) => {
  if (event.target.querySelector('.cart-drawer-overlay')) {
    window.cartDrawer = new CartDrawer();
  }
});

// Export for potential external use
window.CartDrawer = CartDrawer;