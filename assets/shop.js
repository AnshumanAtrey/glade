/**
 * Shop Page Component
 * Handles product grid interactions and performance optimizations
 */

class ShopPage {
  constructor() {
    this.productsGrid = document.querySelector('.shop-products-grid');
    this.productCards = document.querySelectorAll('.shop-product-card');
    this.productsData = this.getProductsData();
    
    this.init();
  }
  
  init() {
    this.setupIntersectionObserver();
    this.setupProductInteractions();
    this.setupKeyboardNavigation();
    this.setupPerformanceOptimizations();
  }
  
  getProductsData() {
    const dataScript = document.getElementById('shop-products-data');
    if (dataScript) {
      try {
        return JSON.parse(dataScript.textContent);
      } catch (error) {
        console.warn('Failed to parse products data:', error);
        return { products: [] };
      }
    }
    return { products: [] };
  }
  
  setupIntersectionObserver() {
    // Lazy load product images for better performance
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.1
    });
    
    // Observe all product images
    const productImages = document.querySelectorAll('.shop-product-image img[data-src]');
    productImages.forEach(img => imageObserver.observe(img));
    
    // Animate cards on scroll
    const cardObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, {
      rootMargin: '20px 0px',
      threshold: 0.1
    });
    
    // Initially hide cards for animation
    this.productCards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      card.style.transition = `opacity 0.6s ease ${index * 0.05}s, transform 0.6s ease ${index * 0.05}s`;
      cardObserver.observe(card);
    });
  }
  
  setupProductInteractions() {
    this.productCards.forEach(card => {
      const link = card.querySelector('.shop-product-link');
      const image = card.querySelector('.shop-product-image img');
      
      // Enhanced hover effects
      card.addEventListener('mouseenter', () => {
        this.handleCardHover(card, true);
      });
      
      card.addEventListener('mouseleave', () => {
        this.handleCardHover(card, false);
      });
      
      // Click tracking for analytics
      link.addEventListener('click', (e) => {
        const productId = card.dataset.productId;
        this.trackProductClick(productId);
      });
    });
  }
  
  handleCardHover(card, isHovering) {
    const image = card.querySelector('.shop-product-image img');
    const productInfo = card.querySelector('.shop-product-info');
    
    if (isHovering) {
      // Add hover class for CSS animations
      card.classList.add('shop-product-card--hovered');
      
      // Subtle info animation
      if (productInfo) {
        productInfo.style.transform = 'translateY(-2px)';
      }
    } else {
      card.classList.remove('shop-product-card--hovered');
      
      if (productInfo) {
        productInfo.style.transform = 'translateY(0)';
      }
    }
  }
  
  setupKeyboardNavigation() {
    // Enhanced keyboard navigation for accessibility
    this.productCards.forEach((card, index) => {
      const link = card.querySelector('.shop-product-link');
      
      link.addEventListener('keydown', (e) => {
        switch (e.key) {
          case 'ArrowRight':
            e.preventDefault();
            this.focusNextProduct(index, 1);
            break;
          case 'ArrowLeft':
            e.preventDefault();
            this.focusNextProduct(index, -1);
            break;
          case 'ArrowDown':
            e.preventDefault();
            this.focusNextProduct(index, 3); // 3 columns
            break;
          case 'ArrowUp':
            e.preventDefault();
            this.focusNextProduct(index, -3); // 3 columns
            break;
        }
      });
    });
  }
  
  focusNextProduct(currentIndex, direction) {
    const nextIndex = currentIndex + direction;
    if (nextIndex >= 0 && nextIndex < this.productCards.length) {
      const nextLink = this.productCards[nextIndex].querySelector('.shop-product-link');
      if (nextLink) {
        nextLink.focus();
      }
    }
  }
  
  setupPerformanceOptimizations() {
    // Debounced resize handler
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.handleResize();
      }, 250);
    });
    
    // Optimize scroll performance
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    });
  }
  
  handleResize() {
    // Recalculate grid layout if needed
    const gridColumns = window.getComputedStyle(this.productsGrid).gridTemplateColumns;
    console.log('Grid columns updated:', gridColumns);
  }
  
  handleScroll() {
    // Add scroll-based optimizations here if needed
    const scrollY = window.pageYOffset;
    
    // Example: Parallax effect for hero section
    const hero = document.querySelector('.shop-hero');
    if (hero && scrollY < window.innerHeight) {
      const parallaxSpeed = 0.5;
      hero.style.transform = `translateY(${scrollY * parallaxSpeed}px)`;
    }
  }
  
  trackProductClick(productId) {
    // Analytics tracking
    console.log('Product clicked:', productId);
    
    // Example: Send to analytics service
    if (typeof gtag !== 'undefined') {
      gtag('event', 'select_item', {
        item_list_id: 'shop_page',
        item_list_name: 'Shop Page',
        items: [{
          item_id: productId,
          item_name: this.getProductName(productId),
          item_category: 'Product',
          item_list_position: this.getProductPosition(productId)
        }]
      });
    }
  }
  
  getProductName(productId) {
    const product = this.productsData.products.find(p => p.id == productId);
    return product ? product.title : 'Unknown Product';
  }
  
  getProductPosition(productId) {
    const productCard = document.querySelector(`[data-product-id="${productId}"]`);
    if (productCard) {
      return Array.from(this.productCards).indexOf(productCard) + 1;
    }
    return 0;
  }
  
  // Public methods for external use
  filterProducts(category) {
    this.productCards.forEach(card => {
      const productCategory = card.querySelector('.shop-product-category')?.textContent.toLowerCase();
      const shouldShow = !category || category === 'all' || productCategory === category.toLowerCase();
      
      card.style.display = shouldShow ? 'block' : 'none';
    });
  }
  
  sortProducts(sortBy) {
    const productsArray = Array.from(this.productCards);
    
    productsArray.sort((a, b) => {
      const aData = this.getProductDataFromCard(a);
      const bData = this.getProductDataFromCard(b);
      
      switch (sortBy) {
        case 'price-low':
          return aData.price - bData.price;
        case 'price-high':
          return bData.price - aData.price;
        case 'name':
          return aData.title.localeCompare(bData.title);
        default:
          return 0;
      }
    });
    
    // Re-append sorted elements
    productsArray.forEach(card => {
      this.productsGrid.appendChild(card);
    });
  }
  
  getProductDataFromCard(card) {
    const productId = card.dataset.productId;
    return this.productsData.products.find(p => p.id == productId) || {};
  }
  
  destroy() {
    // Clean up event listeners and observers
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('scroll', this.handleScroll);
  }
}

// Initialize Shop Page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('Shop JS: DOM loaded, initializing shop page...');
  
  if (document.querySelector('.shop-page')) {
    try {
      window.shopPage = new ShopPage();
      console.log('Shop JS: Shop page initialized successfully');
    } catch (error) {
      console.error('Failed to initialize shop page:', error);
    }
  }
});

// Handle Shopify section reloads
document.addEventListener('shopify:section:load', (event) => {
  if (event.target.querySelector('.shop-page')) {
    window.shopPage = new ShopPage();
  }
});

// GSAP Animations (if GSAP is available)
if (typeof gsap !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  
  document.addEventListener('DOMContentLoaded', () => {
    const shopPage = document.querySelector('.shop-page');
    if (!shopPage) return;
    
    // Animate hero title
    const shopTitle = document.querySelector('.shop-title');
    if (shopTitle) {
      gsap.set(shopTitle, {
        opacity: 0,
        y: 50
      });
      
      gsap.to(shopTitle, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power2.out',
        delay: 0.2
      });
    }
    
    // Animate product cards
    const productCards = document.querySelectorAll('.shop-product-card');
    if (productCards.length > 0) {
      gsap.set(productCards, {
        opacity: 0,
        y: 30
      });
      
      ScrollTrigger.create({
        trigger: '.shop-products-grid',
        start: 'top 80%',
        onEnter: () => {
          gsap.to(productCards, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.05,
            ease: 'power2.out'
          });
        }
      });
    }
  });
}

// Export for potential external use
window.ShopPage = ShopPage;