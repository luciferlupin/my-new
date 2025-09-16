document.addEventListener('DOMContentLoaded', function() {
    const carouselTrack = document.querySelector('.carousel-track');
    if (!carouselTrack) return;

    const slides = document.querySelectorAll('.carousel-slide');
    const totalSlides = slides.length;
    
    // Clone slides for infinite loop
    function cloneSlides() {
        const slidesArray = Array.from(slides);
        slidesArray.forEach(slide => {
            const clone = slide.cloneNode(true);
            carouselTrack.appendChild(clone);
        });
    }
    
    // Initialize carousel
    function initCarousel() {
        cloneSlides();
        
        // Set initial position
        carouselTrack.style.transform = 'translateX(0)';
        
        // Start auto-scroll
        startAutoScroll();
    }
    
    // Auto-scroll functionality
    let scrollInterval;
    
    function startAutoScroll() {
        scrollInterval = setInterval(() => {
            const currentScroll = carouselTrack.scrollLeft;
            const itemWidth = document.querySelector('.carousel-slide').offsetWidth + 24; // width + gap
            
            // If we've scrolled all cloned items, reset to start without animation
            if (currentScroll >= (totalSlides * itemWidth)) {
                carouselTrack.style.transition = 'none';
                carouselTrack.scrollLeft = 0;
                // Force reflow
                void carouselTrack.offsetWidth;
                carouselTrack.style.transition = 'transform 0.6s ease-in-out';
            } else {
                carouselTrack.scrollLeft += 1;
            }
        }, 20); // Adjust speed as needed
    }
    
    // Pause on hover
    carouselTrack.addEventListener('mouseenter', () => {
        clearInterval(scrollInterval);
    });
    
    carouselTrack.addEventListener('mouseleave', () => {
        startAutoScroll();
    });
    
    // Touch support
    let touchStartX = 0;
    let touchEndX = 0;
    
    carouselTrack.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        clearInterval(scrollInterval);
    }, { passive: true });
    
    carouselTrack.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].clientX;
        handleSwipe();
        startAutoScroll();
    }, { passive: true });
    
    function handleSwipe() {
        const minSwipeDistance = 50;
        const swipeDistance = touchEndX - touchStartX;
        
        if (Math.abs(swipeDistance) >= minSwipeDistance) {
            if (swipeDistance > 0) {
                // Swipe right
                carouselTrack.scrollLeft -= 300; // Adjust scroll distance as needed
            } else {
                // Swipe left
                carouselTrack.scrollLeft += 300; // Adjust scroll distance as needed
            }
        }
    }
    
    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            carouselTrack.style.transition = 'none';
            carouselTrack.scrollLeft = 0;
            void carouselTrack.offsetWidth; // Force reflow
            carouselTrack.style.transition = 'transform 0.6s ease-in-out';
        }, 250);
    });
    
    // Initialize the carousel
    initCarousel();
});
