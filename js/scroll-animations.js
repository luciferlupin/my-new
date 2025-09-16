document.addEventListener('DOMContentLoaded', function() {
    // Configuration
    const config = {
        // Animation classes
        fadeInUp: 'fade-in-up',
        fadeIn: 'fade-in',
        slideInLeft: 'slide-in-left',
        slideInRight: 'slide-in-right',
        zoomIn: 'zoom-in',
        // Animation timing
        threshold: 0.12, // 12% of the element must be visible (more sensitive)
        rootMargin: '0px 0px -30px 0px', // Reduced margin for earlier trigger
        // Stagger delay between animations
        staggerDelay: 80, // Reduced from 100ms for faster sequence
        // Animation duration
        animationDuration: 700, // Base duration in ms
        // Scroll debounce
        scrollDebounce: 10, // Reduced from 20ms for more responsive tracking
        // Animation intensity
        translateDistance: 60, // Increased from 30-40px for more dramatic effect
        // Enable/disable animations
        enableParallax: true, // For future use
        enableStagger: true // Enable staggered animations
    };

    // Animation classes
    const animationClasses = [
        config.fadeInUp,
        config.fadeIn,
        config.slideInLeft,
        config.slideInRight,
        config.zoomIn
    ];

    // Elements to animate
    let animatedElements = [];
    let lastScrollTop = 0;
    let ticking = false;

    // Initialize animations
    function initAnimations() {
        // Get all elements with animation classes
        animationClasses.forEach(className => {
            const elements = document.querySelectorAll(`.${className}`);
            elements.forEach(el => {
                // Add initial state
                el.style.opacity = '0';
                el.style.transform = getInitialTransform(className);
                el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
                
                // Add to elements array
                animatedElements.push({
                    element: el,
                    className: className,
                    animated: false
                });
            });
        });

        // Initial check
        checkElementsInView();

        // Listen for scroll events with debouncing
        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    // Get initial transform based on animation class
    function getInitialTransform(className) {
        const distance = config.translateDistance;
        switch(className) {
            case config.fadeInUp:
                return `translateY(${distance}px)`;
            case config.slideInLeft:
                return `translateX(-${distance}px)`;
            case config.slideInRight:
                return `translateX(${distance}px)`;
            case config.zoomIn:
                return 'scale(0.88)';
            default:
                return 'none';
        }
    }

    // Handle scroll with debouncing
    function handleScroll() {
        lastScrollTop = window.scrollY;
        if (!ticking) {
            window.requestAnimationFrame(() => {
                checkElementsInView();
                ticking = false;
            });
            ticking = true;
        }
    }

    // Check if elements are in view
    function checkElementsInView() {
        const viewportHeight = window.innerHeight;
        const scrollPosition = window.scrollY || window.pageYOffset;
        
        animatedElements.forEach((item, index) => {
            if (item.animated) return;
            
            const rect = item.element.getBoundingClientRect();
            const elementTop = rect.top + scrollPosition;
            const elementVisible = viewportHeight * 0.2; // 20% of viewport height
            const elementBottom = elementTop + rect.height;
            
            // Calculate visibility ratio (0 to 1)
            const viewportBottom = scrollPosition + viewportHeight;
            const elementVisibleHeight = Math.min(rect.bottom, viewportBottom) - Math.max(rect.top, scrollPosition);
            const visibilityRatio = Math.min(1, elementVisibleHeight / rect.height);
            
            // Check if element is in view with threshold
            if (visibilityRatio > config.threshold) {
                // Calculate delay based on element position and index
                const baseDelay = config.enableStagger ? (index % 5) * config.staggerDelay : 0;
                const distanceFromViewport = Math.max(0, viewportHeight - rect.top);
                const scrollBasedDelay = Math.min(100, distanceFromViewport / 10); // Max 100ms delay
                
                // Apply animation with calculated delay
                setTimeout(() => {
                    item.element.style.opacity = '1';
                    item.element.style.transform = 'none';
                    
                    // Add a class for any post-animation effects
                    setTimeout(() => {
                        item.element.classList.add('animate-complete');
                    }, config.animationDuration);
                    
                    item.animated = true;
                }, baseDelay + scrollBasedDelay);
            }
        });
        
        // Clean up animated elements that are far out of view
        animatedElements = animatedElements.filter(item => {
            if (!item.animated) return true;
            const rect = item.element.getBoundingClientRect();
            return rect.bottom > -500 && rect.top < viewportHeight + 500; // Keep if within 500px of viewport
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAnimations);
    } else {
        initAnimations();
    }
});
