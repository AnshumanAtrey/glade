/**
 * Carousel Component
 * Handles product carousel functionality with smooth transitions
 */

class ProductCarousel {
  constructor(element) {
    this.carousel = element;
    this.track = this.carousel.querySelector('.carousel-track');
    this.slides = this.carousel.querySelectorAll('.carousel-slide');
    this.prevBtn = this.carousel.querySelector('.carousel-prev');
    this.nextBtn = this.carousel.querySelector('.carousel-next');
    this.indicators = this.carousel.querySelectorAll('.carousel-indicator');
    
    this.currentIndex = 0;
    this.slidesPerView = this.getSlidesPerView();
    this.totalSlides = this.slides.length;
    this.maxIndex = Math.max(0, this.totalSlides - this.slidesPerView);
    
    this.autoplayEnabled = this.carousel.dataset.autoplay !== 'false';
    this.autoplaySpeed = parseInt(this.carousel.dataset.autoplaySpeed) || 5000;
    this.autoplayTimer = null;
    this.resizeTimer = null;
    
    this.isTransitioning = false;
    
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.setupHoverEffects();
    this.updateCarousel();
    this.handleResize();
    
    if (this.autoplayEnabled) {
      this.startAutoplay();
    }
  }
  
  getSlidesPerView() {
    const width = window.innerWidth;
    if (width <= 768) return 1;
    if (width <= 1024) return 2;
    return 3;
  }
  
  setupEventListeners() {
    // Navigation buttons
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.prevSlide());
    }
    
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.nextSlide());
    }
    
    // Indicators
    this.indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => {
        const slideIndex = parseInt(indicator.dataset.slide) || index * this.slidesPerView;
        this.goToSlide(slideIndex);
      });
    });
    
    // Pause autoplay on hover
    this.carousel.addEventListener('mouseenter', () => this.pauseAutoplay());
    this.carousel.addEventListener('mouseleave', () => this.resumeAutoplay());
    
    // Keyboard navigation
    this.carousel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.prevSlide();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.nextSlide();
      }
    });
    
    // Touch/swipe support
    this.setupTouchEvents();
    
    // Window resize
    window.addEventListener('resize', () => this.handleResize());
  }
  
  setupTouchEvents() {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    
    this.track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
      this.pauseAutoplay();
    });
    
    this.track.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
      e.preventDefault();
    });
    
    this.track.addEventListener('touchend', () => {
      if (!isDragging) return;
      
      const diff = startX - currentX;
      const threshold = 50;
      
      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          this.nextSlide();
        } else {
          this.prevSlide();
        }
      }
      
      isDragging = false;
      this.resumeAutoplay();
    });
  }
  
  setupHoverEffects() {
    this.slides.forEach(slide => {
      const productCard = slide.querySelector('.carousel-product-card');
      const productImage = slide.querySelector('.carousel-product-image');
      const hoverImage = productImage?.dataset.hoverImage;
      
      if (productCard && productImage && hoverImage) {
        const originalImage = productImage.style.backgroundImage;
        
        productCard.addEventListener('mouseenter', () => {
          productImage.style.backgroundImage = `url('${hoverImage}')`;
        });
        
        productCard.addEventListener('mouseleave', () => {
          productImage.style.backgroundImage = originalImage;
        });
      }
    });
  }
  
  prevSlide() {
    if (this.isTransitioning) return;
    
    this.currentIndex = Math.max(0, this.currentIndex - 1);
    this.updateCarousel();
  }
  
  nextSlide() {
    if (this.isTransitioning) return;
    
    this.currentIndex = Math.min(this.maxIndex, this.currentIndex + 1);
    this.updateCarousel();
  }
  
  goToSlide(index) {
    if (this.isTransitioning) return;
    
    this.currentIndex = Math.max(0, Math.min(this.maxIndex, index));
    this.updateCarousel();
  }
  
  updateCarousel() {
    if (!this.track || this.slides.length === 0) return;
    
    this.isTransitioning = true;
    
    // Calculate transform based on current viewport
    const slideWidth = this.slides[0] ? this.slides[0].offsetWidth : 0;
    const trackWidth = this.track.offsetWidth;
    const translateX = -(this.currentIndex * slideWidth);
    
    // Apply transform with smooth transition
    this.track.style.transform = `translateX(${translateX}px)`;
    
    // Update button states
    this.updateButtonStates();
    
    // Update indicators
    this.updateIndicators();
    
    // Reset transition flag after animation
    setTimeout(() => {
      this.isTransitioning = false;
    }, 600);
  }
  
  updateButtonStates() {
    if (this.prevBtn) {
      this.prevBtn.disabled = this.currentIndex === 0;
    }
    
    if (this.nextBtn) {
      this.nextBtn.disabled = this.currentIndex >= this.maxIndex;
    }
  }
  
  updateIndicators() {
    this.indicators.forEach((indicator, index) => {
      const slideIndex = parseInt(indicator.dataset.slide) || index * this.slidesPerView;
      const isActive = slideIndex === this.currentIndex;
      indicator.classList.toggle('active', isActive);
    });
  }
  
  startAutoplay() {
    if (!this.autoplayEnabled || this.totalSlides <= this.slidesPerView) return;
    
    this.autoplayTimer = setInterval(() => {
      if (this.currentIndex >= this.maxIndex) {
        this.currentIndex = 0;
      } else {
        this.currentIndex++;
      }
      this.updateCarousel();
    }, this.autoplaySpeed);
  }
  
  pauseAutoplay() {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  }
  
  resumeAutoplay() {
    if (this.autoplayEnabled) {
      this.startAutoplay();
    }
  }
  
  handleResize() {
    // Debounce resize events
    clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      const newSlidesPerView = this.getSlidesPerView();
      
      if (newSlidesPerView !== this.slidesPerView) {
        this.slidesPerView = newSlidesPerView;
        this.maxIndex = Math.max(0, this.totalSlides - this.slidesPerView);
        this.currentIndex = Math.min(this.currentIndex, this.maxIndex);
        this.updateCarousel();
      }
    }, 250);
  }
  
  destroy() {
    this.pauseAutoplay();
    clearTimeout(this.resizeTimer);
    
    // Remove event listeners
    window.removeEventListener('resize', this.handleResize);
    
    // Clean up touch events
    this.track.removeEventListener('touchstart', this.handleTouchStart);
    this.track.removeEventListener('touchmove', this.handleTouchMove);
    this.track.removeEventListener('touchend', this.handleTouchEnd);
  }
}

// Initialize carousels when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const carousels = document.querySelectorAll('.carousel-section');
  
  carousels.forEach(carousel => {
    try {
      // Get settings from section
      const section = carousel.closest('[data-section-type="carousel"]') || carousel;
      const enableAutoplay = section.dataset.enableAutoplay !== 'false';
      const autoplaySpeed = parseInt(section.dataset.autoplaySpeed) || 5000;
      
      // Set data attributes for carousel instance
      carousel.dataset.autoplay = enableAutoplay;
      carousel.dataset.autoplaySpeed = autoplaySpeed;
      
      // Initialize carousel
      new ProductCarousel(carousel);
    } catch (error) {
      console.warn('Failed to initialize carousel:', error);
    }
  });
});

// Handle Shopify section reloads
document.addEventListener('shopify:section:load', (event) => {
  const carousel = event.target.querySelector('.carousel-section');
  if (carousel) {
    new ProductCarousel(carousel);
  }
});

// GSAP Animations (if GSAP is available)
if (typeof gsap !== 'undefined') {
  // Animate carousel slides on scroll
  gsap.registerPlugin(ScrollTrigger);
  
  document.addEventListener('DOMContentLoaded', () => {
    const carouselSections = document.querySelectorAll('.carousel-section');
    
    carouselSections.forEach(section => {
      const slides = section.querySelectorAll('.carousel-slide');
      
      gsap.set(slides, {
        opacity: 0,
        y: 50
      });
      
      ScrollTrigger.create({
        trigger: section,
        start: 'top 80%',
        onEnter: () => {
          gsap.to(slides, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out'
          });
        }
      });
    });
  });
}

// Export for potential external use
window.ProductCarousel = ProductCarousel;