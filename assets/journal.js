/**
 * Journal Section Component
 * Handles interactive elements and animations for the journal section
 */

class JournalSection {
  constructor(element) {
    this.section = element;
    this.journalContent = this.section.querySelector('.journal-content');
    this.journalCards = this.section.querySelectorAll('.journal-card');
    this.animatedButtons = this.section.querySelectorAll('.animated-btn');
    
    this.init();
  }
  
  init() {
    this.setupHoverEffects();
    this.setupAccessibility();
    this.handleResize();
  }
  
  setupHoverEffects() {
    // Enhanced hover effects for the main journal content
    if (this.journalContent) {
      const image = this.journalContent.querySelector('.journal-image-column img');
      const textButton = this.journalContent.querySelector('.journal-text-column .animated-btn');
      
      if (image && textButton) {
        this.journalContent.addEventListener('mouseenter', () => {
          this.animateButton(textButton);
        });
        
        this.journalContent.addEventListener('mouseleave', () => {
          this.resetButton(textButton);
        });
      }
    }
    
    // Enhanced hover effects for journal cards
    this.journalCards.forEach(card => {
      const image = card.querySelector('img');
      const button = card.querySelector('.animated-btn');
      
      if (image && button) {
        card.addEventListener('mouseenter', () => {
          this.animateButton(button);
        });
        
        card.addEventListener('mouseleave', () => {
          this.resetButton(button);
        });
      }
    });
  }
  
  animateButton(button) {
    const arrow1 = button.querySelector('.arrow-1');
    const arrow2 = button.querySelector('.arrow-2');
    const text = button.querySelector('.text');
    
    if (arrow1 && arrow2 && text) {
      // Animate text underline
      text.style.textDecoration = 'underline';
      text.style.textUnderlineOffset = '4px';
      
      // Animate arrows
      arrow1.style.opacity = '0';
      arrow1.style.transform = 'translate(10px, -10px)';
      
      arrow2.style.opacity = '1';
      arrow2.style.transform = 'translate(0, 0)';
      arrow2.style.transitionDelay = '0.15s';
    }
  }
  
  resetButton(button) {
    const arrow1 = button.querySelector('.arrow-1');
    const arrow2 = button.querySelector('.arrow-2');
    const text = button.querySelector('.text');
    
    if (arrow1 && arrow2 && text) {
      // Reset text underline
      text.style.textDecoration = 'none';
      
      // Reset arrows
      arrow1.style.opacity = '1';
      arrow1.style.transform = 'translate(0, 0)';
      
      arrow2.style.opacity = '0';
      arrow2.style.transform = 'translate(-10px, 10px)';
      arrow2.style.transitionDelay = '0s';
    }
  }
  
  setupAccessibility() {
    // Add keyboard navigation support
    this.animatedButtons.forEach(button => {
      button.addEventListener('focus', () => {
        this.animateButton(button);
      });
      
      button.addEventListener('blur', () => {
        this.resetButton(button);
      });
      
      // Add keyboard interaction
      button.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          button.click();
        }
      });
    });
    
    // Add ARIA labels for better accessibility
    this.journalCards.forEach((card, index) => {
      const title = card.querySelector('h4');
      if (title) {
        card.setAttribute('aria-label', `Journal article: ${title.textContent}`);
      }
    });
  }
  
  handleResize() {
    // Handle responsive behavior
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768;
      
      // Adjust animations for mobile
      if (isMobile) {
        this.journalCards.forEach(card => {
          card.style.transform = 'none';
        });
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call
  }
  
  // Method to update content dynamically (for potential future use)
  updateContent(newContent) {
    if (newContent.title) {
      const titleElement = this.section.querySelector('.journal-header-left h2');
      if (titleElement) {
        titleElement.textContent = newContent.title;
      }
    }
    
    if (newContent.subtitle) {
      const subtitleElement = this.section.querySelector('.journal-header-left p');
      if (subtitleElement) {
        subtitleElement.textContent = newContent.subtitle;
      }
    }
  }
  
  destroy() {
    // Clean up event listeners if needed
    window.removeEventListener('resize', this.handleResize);
  }
}

// Initialize Journal sections when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const journalSections = document.querySelectorAll('.journal-section');
  
  journalSections.forEach(section => {
    try {
      new JournalSection(section);
    } catch (error) {
      console.warn('Failed to initialize Journal section:', error);
    }
  });
});

// Handle Shopify section reloads
document.addEventListener('shopify:section:load', (event) => {
  const journalSection = event.target.querySelector('.journal-section');
  if (journalSection) {
    new JournalSection(journalSection);
  }
});

// GSAP Animations (if GSAP is available)
if (typeof gsap !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  
  document.addEventListener('DOMContentLoaded', () => {
    const journalSections = document.querySelectorAll('.journal-section');
    
    journalSections.forEach(section => {
      const header = section.querySelector('.journal-header');
      const content = section.querySelector('.journal-content');
      const cards = section.querySelectorAll('.journal-card');
      
      // Animate header on scroll
      if (header) {
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
      }
      
      // Animate main content
      if (content) {
        gsap.set(content, {
          opacity: 0,
          y: 50
        });
        
        ScrollTrigger.create({
          trigger: content,
          start: 'top 85%',
          onEnter: () => {
            gsap.to(content, {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: 'power2.out',
              delay: 0.2
            });
          }
        });
      }
      
      // Animate journal cards
      if (cards.length > 0) {
        gsap.set(cards, {
          opacity: 0,
          y: 40
        });
        
        ScrollTrigger.create({
          trigger: cards[0],
          start: 'top 90%',
          onEnter: () => {
            gsap.to(cards, {
              opacity: 1,
              y: 0,
              duration: 0.6,
              stagger: 0.1,
              ease: 'power2.out',
              delay: 0.4
            });
          }
        });
      }
    });
  });
}

// Export for potential external use
window.JournalSection = JournalSection;