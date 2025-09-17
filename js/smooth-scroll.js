/**
 * Default smooth scrolling behavior
 * This implementation uses the browser's native smooth scrolling
 */
document.addEventListener('DOMContentLoaded', function() {
    // Enable smooth scrolling for the entire document
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Handle anchor links with smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (!targetId.startsWith('#')) return;
            
            const targetElement = document.querySelector(targetId);
            if (!targetElement) return;
            
            e.preventDefault();
            
            // Calculate target position with offset (100px from top)
            const targetPosition = targetElement.getBoundingClientRect().top + 
                                 window.pageYOffset - 100;
            
            // Use native smooth scrolling
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        });
    });
});
