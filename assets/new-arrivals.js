document.addEventListener('DOMContentLoaded', () => {
    // Wait for GSAP to load
    function initNewArrivalsAnimation() {
        if (typeof gsap === 'undefined') {
            setTimeout(initNewArrivalsAnimation, 100);
            return;
        }

        // Animate elements when they come into view
        const observerOptions = {
            threshold: 0.2,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const section = entry.target;
                    
                    // Animate brutal text
                    const brutalText = section.querySelector('.brutal-big-text h1');
                    const brutalSubtext = section.querySelector('.brutal-big-text p');
                    
                    if (brutalText) {
                        gsap.fromTo(brutalText, 
                            {
                                opacity: 0,
                                y: 50,
                                scale: 0.9
                            },
                            {
                                opacity: 1,
                                y: 0,
                                scale: 1,
                                duration: 1,
                                ease: "power3.out"
                            }
                        );
                    }
                    
                    if (brutalSubtext) {
                        gsap.fromTo(brutalSubtext, 
                            {
                                opacity: 0,
                                y: 30
                            },
                            {
                                opacity: 1,
                                y: 0,
                                duration: 0.8,
                                delay: 0.3,
                                ease: "power3.out"
                            }
                        );
                    }
                    
                    // Animate promo content
                    const promoHeadline = section.querySelector('.arrivals-headline');
                    const promoButton = section.querySelector('.animated-btn');
                    
                    if (promoHeadline) {
                        gsap.fromTo(promoHeadline, 
                            {
                                opacity: 0,
                                x: -50
                            },
                            {
                                opacity: 1,
                                x: 0,
                                duration: 0.8,
                                delay: 0.2,
                                ease: "power3.out"
                            }
                        );
                    }
                    
                    if (promoButton) {
                        gsap.fromTo(promoButton, 
                            {
                                opacity: 0,
                                x: -30
                            },
                            {
                                opacity: 1,
                                x: 0,
                                duration: 0.6,
                                delay: 0.5,
                                ease: "power3.out"
                            }
                        );
                    }
                    
                    // Stop observing this element
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe all new arrivals sections
        const newArrivalsSections = document.querySelectorAll('.new-arrivals-section');
        newArrivalsSections.forEach(section => {
            observer.observe(section);
        });
    }

    initNewArrivalsAnimation();
});