document.addEventListener('DOMContentLoaded', function() {
    // Initialize service card animations
    function initServiceAnimations() {
        const serviceCards = document.querySelectorAll('.service-pill.animate-on-scroll');
        
        // Set initial styles and delays
        serviceCards.forEach((card, index) => {
            const delay = card.getAttribute('data-delay') || 0;
            card.style.setProperty('--delay', delay);
            
            // Add animation class based on data attribute
            const animation = card.getAttribute('data-animation') || 'fade-up';
            card.classList.add(animation);
        });
        
        // Create intersection observer for scroll animations
        const observerOptions = {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const card = entry.target;
                    const delay = card.getAttribute('data-delay') || 0;
                    
                    // Add animation class after delay
                    setTimeout(() => {
                        card.classList.add('animate');
                        observer.unobserve(card); // Stop observing once animated
                    }, parseInt(delay));
                }
            });
        }, observerOptions);
        
        // Observe all service cards
        serviceCards.forEach(card => {
            observer.observe(card);
        });
        
        // Add hover effect for desktop
        if (window.innerWidth > 768) {
            serviceCards.forEach(card => {
                card.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-5px) scale(1.02)';
                    this.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.2)';
                    
                    // Add subtle stagger to child elements
                    const icon = this.querySelector('.service-icon');
                    const title = this.querySelector('h3');
                    
                    if (icon) {
                        icon.style.transform = 'scale(1.1) rotate(5deg)';
                    }
                    if (title) {
                        title.style.transform = 'translateX(5px)';
                    }
                });
                
                card.addEventListener('mouseleave', function() {
                    this.style.transform = '';
                    this.style.boxShadow = '';
                    
                    const icon = this.querySelector('.service-icon');
                    const title = this.querySelector('h3');
                    
                    if (icon) {
                        icon.style.transform = '';
                    }
                    if (title) {
                        title.style.transform = '';
                    }
                });
            });
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initServiceAnimations);
    } else {
        initServiceAnimations();
    }
});
