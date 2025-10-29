/**
 * Instagram Section Component
 * Handles auto-scrolling photo marquee with customizable speed
 */

class InstagramMarquee {
  constructor(element) {
    this.section = element;
    this.marqueeTrack = this.section.querySelector('.marquee-track');
    this.images = this.section.querySelectorAll('.marquee-track img');

    if (!this.marqueeTrack || this.images.length === 0) {
      console.warn('Instagram marquee: No track or images found');
      return;
    }

    this.isAutoplayEnabled = this.section.dataset.autoplay !== 'false';
    this.scrollSpeed = parseInt(this.section.dataset.scrollSpeed) || 20;
    this.isPaused = false;

    this.init();
  }

  init() {
    this.setupMarquee();
    this.setupEventListeners();
    this.handleResize();
  }

  setupMarquee() {
    // Calculate total width for seamless loop
    const imageWidth = 300; // Base image width
    const gap = 2; // Gap between images
    const totalImages = this.images.length / 2; // Half because we duplicate
    const totalWidth = (imageWidth + gap) * totalImages;

    // Set CSS custom properties for animation
    this.marqueeTrack.style.setProperty('--scroll-duration', `${this.scrollSpeed}s`);
    this.marqueeTrack.style.setProperty('--scroll-duration-mobile', `${Math.max(12, this.scrollSpeed - 5)}s`);

    // Ensure smooth animation
    this.marqueeTrack.style.width = `${totalWidth * 2}px`;

    if (!this.isAutoplayEnabled) {
      this.pauseAnimation();
    }
  }

  setupEventListeners() {
    // Only handle visibility change and resize - let CSS handle hover
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseAnimation();
      } else if (this.isAutoplayEnabled) {
        this.resumeAnimation();
      }
    });

    // Window resize
    window.addEventListener('resize', () => this.handleResize());
  }

  pauseAnimation() {
    this.isPaused = true;
    this.marqueeTrack.style.animationPlayState = 'paused';
  }

  resumeAnimation() {
    if (this.isAutoplayEnabled && !this.isPaused) {
      this.marqueeTrack.style.animationPlayState = 'running';
    }
  }

  handleResize() {
    // Debounce resize events
    clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      this.setupMarquee();
    }, 250);
  }

  updateSpeed(newSpeed) {
    this.scrollSpeed = newSpeed;
    this.setupMarquee();
  }

  toggleAutoplay(enabled) {
    this.isAutoplayEnabled = enabled;
    if (enabled) {
      this.resumeAnimation();
    } else {
      this.pauseAnimation();
    }
  }

  destroy() {
    clearTimeout(this.resizeTimer);
    window.removeEventListener('resize', this.handleResize);
  }
}

// Initialize Instagram sections when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('Instagram JS: DOM loaded, looking for sections...');
  const instagramSections = document.querySelectorAll('.instagram-section');
  console.log('Instagram JS: Found sections:', instagramSections.length);

  instagramSections.forEach((section, index) => {
    try {
      console.log(`Instagram JS: Initializing section ${index + 1}`);

      // Set default data attributes
      section.dataset.autoplay = 'true';
      section.dataset.scrollSpeed = '20';

      // Initialize marquee
      new InstagramMarquee(section);
      console.log(`Instagram JS: Section ${index + 1} initialized successfully`);
    } catch (error) {
      console.error('Failed to initialize Instagram marquee:', error);
    }
  });
});

// Handle Shopify section reloads
document.addEventListener('shopify:section:load', (event) => {
  const instagramSection = event.target.querySelector('.instagram-section');
  if (instagramSection) {
    new InstagramMarquee(instagramSection);
  }
});

// GSAP Animations (if GSAP is available)
if (typeof gsap !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);

  document.addEventListener('DOMContentLoaded', () => {
    const instagramSections = document.querySelectorAll('.instagram-section');

    instagramSections.forEach(section => {
      const header = section.querySelector('.instagram-header');
      const marquee = section.querySelector('.photo-marquee');

      if (header && marquee) {
        // Animate header on scroll
        gsap.set(header, {
          opacity: 0,
          y: 30
        });

        ScrollTrigger.create({
          trigger: section,
          start: 'top 80%',
          onEnter: () => {
            gsap.to(header, {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: 'power2.out'
            });
          }
        });

        // Animate marquee images on scroll
        const images = section.querySelectorAll('.marquee-track img');

        gsap.set(images, {
          opacity: 0,
          scale: 0.8
        });

        ScrollTrigger.create({
          trigger: marquee,
          start: 'top 90%',
          onEnter: () => {
            gsap.to(images, {
              opacity: 1,
              scale: 1,
              duration: 0.6,
              stagger: 0.05,
              ease: 'power2.out'
            });
          }
        });
      }
    });
  });
}

// Export for potential external use
window.InstagramMarquee = InstagramMarquee;