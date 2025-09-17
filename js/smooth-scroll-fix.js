// Smooth scroll behavior for the entire site
document.addEventListener('DOMContentLoaded', function() {
    // Add smooth scrolling to all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                window.scrollTo({
                    top: target.offsetTop - 100, // Adjust for fixed header
                    behavior: 'smooth'
                });
                
                // Update URL without adding to history
                if (history.pushState) {
                    history.pushState(null, null, targetId);
                } else {
                    window.location.hash = targetId;
                }
            }
        });
    });
    
    // Improve touch scrolling on iOS
    if (navigator.userAgent.match(/(iPod|iPhone|iPad)/)) {
        document.body.addEventListener('touchmove', function(e) {
            // Only prevent default if we're not scrolling a scrollable element
            if (!e.target.closest('.scrollable, [data-scrollable]')) {
                e.stopPropagation();
            }
        }, { passive: false });
    }
    
    // Add passive event listeners for better performance
    const addPassiveEventListener = (element, event, handler) => {
        let supportsPassive = false;
        try {
            const opts = Object.defineProperty({}, 'passive', {
                get: () => (supportsPassive = true)
            });
            window.addEventListener('test', null, opts);
            window.removeEventListener('test', null, opts);
        } catch (e) {}
        
        element.addEventListener(
            event, 
            handler, 
            supportsPassive ? { passive: true } : false
        );
    };
    
    // Apply passive listeners to scroll events
    addPassiveEventListener(window, 'scroll', () => {}, false);
});

// Force hardware acceleration for smoother animations
const forceHardwareAcceleration = () => {
    const elements = document.querySelectorAll('.hero, .section, .card, .showcase-card');
    elements.forEach(el => {
        el.style.transform = 'translateZ(0)';
        el.style.backfaceVisibility = 'hidden';
        el.style.perspective = '1000px';
    });
};

// Initialize on load
window.addEventListener('load', forceHardwareAcceleration);
window.addEventListener('resize', forceHardwareAcceleration);
