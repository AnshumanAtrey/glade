document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileNav = document.getElementById('mobile-nav');

    if (mobileMenuToggle && mobileNav) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileNav.classList.toggle('active');

            // Update hamburger icon to X when open
            const svg = mobileMenuToggle.querySelector('svg');
            if (mobileNav.classList.contains('active')) {
                svg.innerHTML = `
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                `;
            } else {
                svg.innerHTML = `
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                `;
            }
        });

        // Close mobile menu when clicking on a link
        const mobileNavLinks = mobileNav.querySelectorAll('a');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileNav.classList.remove('active');
                const svg = mobileMenuToggle.querySelector('svg');
                svg.innerHTML = `
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                `;
            });
        });
    }

    // GSAP Promo text animation (desktop only)
    const promoContainer = document.getElementById('promo-text-container');
    const promoTextSpan = document.getElementById('promo-text');

    // Check if we're on desktop and elements exist
    function isDesktop() {
        return window.innerWidth > 768;
    }

    if (promoContainer && promoTextSpan && isDesktop()) {
        const messages = [
            "FREE RETURNS WITHIN 30 DAYS",
            "ONLY MEMBERSHIP OFFERS GETS 20 PERCENT OFF",
            "FREE STANDARD SHIPPING ON ALL ORDERS"
        ];
        let currentIndex = 0;

        // Wait for GSAP to load
        function initAnimation() {
            if (typeof gsap === 'undefined') {
                setTimeout(initAnimation, 100);
                return;
            }

            // Function to split text into characters
            function splitTextIntoChars(element, text) {
                element.innerHTML = '';
                const chars = text.split('');
                chars.forEach(char => {
                    const span = document.createElement('span');
                    span.className = 'promo-char';
                    span.textContent = char === ' ' ? '\u00A0' : char;
                    element.appendChild(span);
                });
                return element.querySelectorAll('.promo-char');
            }

            // Function to animate text in
            function animateTextIn(chars) {
                gsap.fromTo(chars,
                    {
                        opacity: 0,
                        y: 25,
                        rotationX: -90,
                        scale: 0.8
                    },
                    {
                        opacity: 1,
                        y: 0,
                        rotationX: 0,
                        scale: 1,
                        duration: 0.4,
                        stagger: 0.015,
                        ease: "power3.out"
                    }
                );
            }

            // Function to animate text out
            function animateTextOut(chars, callback) {
                gsap.to(chars, {
                    opacity: 0,
                    y: -25,
                    rotationX: 90,
                    scale: 0.8,
                    duration: 0.3,
                    stagger: 0.01,
                    ease: "power3.in",
                    onComplete: callback
                });
            }

            // Initialize first message
            let chars = splitTextIntoChars(promoTextSpan, messages[currentIndex]);

            // Animate in the first message after a short delay
            setTimeout(() => {
                animateTextIn(chars);
            }, 500);

            // Set up rotation interval
            setInterval(() => {
                // Animate out current text
                animateTextOut(chars, () => {
                    currentIndex = (currentIndex + 1) % messages.length;
                    chars = splitTextIntoChars(promoTextSpan, messages[currentIndex]);

                    // Small delay before animating in new text
                    setTimeout(() => {
                        animateTextIn(chars);
                    }, 200);
                });
            }, 4000);
        }

        initAnimation();
    }

    // Cart count functionality
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        // Set data attribute for CSS targeting
        cartCount.setAttribute('data-count', cartCount.textContent.trim());

        // Hide if count is 0
        if (cartCount.textContent.trim() === '0') {
            cartCount.style.display = 'none';
        }
    }

    // Update cart count when cart changes (for AJAX cart updates)
    document.addEventListener('cart:updated', (event) => {
        const cartCount = document.getElementById('cart-count');
        if (cartCount && event.detail && event.detail.item_count !== undefined) {
            cartCount.textContent = event.detail.item_count;
            cartCount.setAttribute('data-count', event.detail.item_count);

            if (event.detail.item_count === 0) {
                cartCount.style.display = 'none';
            } else {
                cartCount.style.display = 'flex';
            }
        }
    });
});