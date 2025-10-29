document.addEventListener('DOMContentLoaded', () => {
    const heroSection = document.querySelector('.hero-section');
    const thumbnails = document.querySelectorAll('.thumb');
    const headlineElement = document.querySelector('.hero-headline');
    const subtextElement = document.querySelector('.hero-subtext');
    const tagElement = document.querySelector('.hero-tag');
    const bgLayers = [document.getElementById('hero-bg-1'), document.getElementById('hero-bg-2')];

    if (!heroSection || bgLayers.includes(null) || thumbnails.length === 0 || !headlineElement || !subtextElement) {
        console.log('Hero elements not found');
        return;
    }

    // Wait for GSAP to load
    function initHeroAnimation() {
        if (typeof gsap === 'undefined') {
            setTimeout(initHeroAnimation, 100);
            return;
        }

        // Extract data from thumbnails
        const slides = Array.from(thumbnails).map(thumb => ({
            image: thumb.style.backgroundImage.match(/url\(['"]?([^'")]+)['"]?\)/)?.[1] || '',
            headline: thumb.dataset.headline || '',
            subtext: thumb.dataset.subtext || '',
            tag: thumb.dataset.tag || 'OUTERWEAR'
        }));

        let currentIndex = 0;
        let currentBgLayer = 0;
        let isAnimating = false;

        // Function to set text content (no character splitting for block animation)
        function setText(element, text) {
            element.textContent = text;
            return element;
        }

        // Function to animate text in (smooth block animation)
        function animateTextIn(element, delay = 0) {
            gsap.fromTo(element, 
                {
                    opacity: 0,
                    y: 30,
                    scale: 0.98
                },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.8,
                    ease: "power2.out",
                    delay: delay
                }
            );
        }

        // Function to animate text out (smooth block animation)
        function animateTextOut(element, callback) {
            gsap.to(element, {
                opacity: 0,
                y: -20,
                scale: 0.98,
                duration: 0.5,
                ease: "power2.in",
                onComplete: callback
            });
        }

        // Function to change slide content
        function changeSlide(nextIndex) {
            if (isAnimating || nextIndex === currentIndex) return;
            
            isAnimating = true;
            const nextBgLayer = 1 - currentBgLayer;

            // Update background image
            bgLayers[nextBgLayer].style.backgroundImage = `url('${slides[nextIndex].image}')`;
            bgLayers[nextBgLayer].classList.add('is-active');
            bgLayers[currentBgLayer].classList.remove('is-active');

            // Animate out current text blocks smoothly
            const timeline = gsap.timeline();
            
            timeline.to([tagElement, headlineElement, subtextElement], {
                opacity: 0,
                y: -20,
                scale: 0.98,
                duration: 0.5,
                ease: "power2.in",
                stagger: 0.05
            });

            // After out animation, change text and animate in
            timeline.call(() => {
                // Update all text content
                setText(tagElement, slides[nextIndex].tag);
                setText(headlineElement, slides[nextIndex].headline);
                setText(subtextElement, slides[nextIndex].subtext);

                // Animate in new text smoothly
                gsap.delayedCall(0.2, () => {
                    gsap.to([tagElement, headlineElement, subtextElement], {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: 0.8,
                        ease: "power2.out",
                        stagger: 0.1
                    });
                });

                // Update active thumbnail
                thumbnails[currentIndex].classList.remove('active');
                thumbnails[nextIndex].classList.add('active');

                // Update indices
                currentIndex = nextIndex;
                currentBgLayer = nextBgLayer;
                
                // Reset animation flag
                gsap.delayedCall(1.2, () => {
                    isAnimating = false;
                });
            });
        }

        // Initialize first slide
        function initializeHero() {
            // Set initial background
            bgLayers[currentBgLayer].style.backgroundImage = `url('${slides[currentIndex].image}')`;
            bgLayers[currentBgLayer].classList.add('is-active');

            // Set initial text
            setText(tagElement, slides[currentIndex].tag);
            setText(headlineElement, slides[currentIndex].headline);
            setText(subtextElement, slides[currentIndex].subtext);

            // Set active thumbnail
            thumbnails[currentIndex].classList.add('active');

            // Animate in initial content
            gsap.delayedCall(0.3, () => {
                // Animate tag
                gsap.to(tagElement, {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    ease: "power3.out"
                });

                // Animate thumbnails
                gsap.to(thumbnails, {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    stagger: 0.08,
                    ease: "power3.out",
                    delay: 0.1
                });

                // Animate text blocks
                animateTextIn(headlineElement, 0.2);
                animateTextIn(subtextElement, 0.4);
            });
        }

        // Add click handlers to thumbnails
        thumbnails.forEach((thumb, index) => {
            thumb.addEventListener('click', () => {
                changeSlide(index);
            });
        });

        // Auto-advance carousel
        function startAutoAdvance() {
            setInterval(() => {
                if (!isAnimating) {
                    const nextIndex = (currentIndex + 1) % slides.length;
                    changeSlide(nextIndex);
                }
            }, 5000);
        }

        // Initialize everything
        initializeHero();
        startAutoAdvance();
    }

    initHeroAnimation();
});