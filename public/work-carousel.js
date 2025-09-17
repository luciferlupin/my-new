document.addEventListener('DOMContentLoaded', function() {
    const track = document.querySelector('.work-showcase .showcase-track');
    const cards = document.querySelectorAll('.work-showcase .showcase-card');
    const prevBtn = document.querySelector('.work-showcase .showcase-nav.prev');
    const nextBtn = document.querySelector('.work-showcase .showcase-nav.next');
    
    if (!track || cards.length === 0) return;
    
    const cardWidth = cards[0].offsetWidth + 32; // Width + gap
    let currentPosition = 0;
    let isDragging = false;
    let startX, scrollLeft;
    let isAnimating = false;
    
    // Clone cards for infinite loop
    function cloneCards() {
        // Clone all cards and append to the end
        const cardArray = Array.from(cards);
        cardArray.forEach(card => {
            const clone = card.cloneNode(true);
            track.appendChild(clone);
        });
        
        // Clone all cards and prepend to the beginning
        const reversedCards = Array.from(cards).reverse();
        reversedCards.forEach(card => {
            const clone = card.cloneNode(true);
            track.insertBefore(clone, track.firstChild);
        });
        
        // Update cards NodeList
        return document.querySelectorAll('.work-showcase .showcase-card');
    }
    
    // Initialize slider
    function initSlider() {
        const allCards = cloneCards();
        const totalWidth = allCards.length * cardWidth;
        track.style.width = `${totalWidth}px`;
        
        // Set initial position to show first original card
        currentPosition = cards.length * cardWidth;
        track.style.transform = `translateX(-${currentPosition}px)`;
    }
    
    // Animate to position
    function animateTo(position, instant = false) {
        if (isAnimating) return;
        isAnimating = true;
        
        if (instant) {
            track.style.transition = 'none';
        } else {
            track.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        }
        
        track.style.transform = `translateX(-${position}px)`;
        
        // Reset animation flag after transition ends
        const onTransitionEnd = () => {
            track.removeEventListener('transitionend', onTransitionEnd);
            isAnimating = false;
        };
        track.addEventListener('transitionend', onTransitionEnd);
    }
    
    // Check if we need to jump to the other side
    function checkPosition() {
        const allCards = document.querySelectorAll('.work-showcase .showcase-card');
        const totalCards = allCards.length;
        const originalCards = cards.length;
        const lastCardPosition = (totalCards - originalCards) * cardWidth;
        
        // If we're at the end of the cloned set, jump to the original
        if (currentPosition >= lastCardPosition) {
            // Wait for the transition to complete before jumping
            setTimeout(() => {
                currentPosition = originalCards * cardWidth;
                track.style.transition = 'none';
                track.style.transform = `translateX(-${currentPosition}px)`;
                // Force reflow
                track.offsetHeight;
            }, 500);
        } 
        // If we're at the beginning of the cloned set, jump to the end of the original
        else if (currentPosition < originalCards * cardWidth) {
            // Wait for the transition to complete before jumping
            setTimeout(() => {
                currentPosition = (totalCards - originalCards * 2) * cardWidth;
                track.style.transition = 'none';
                track.style.transform = `translateX(-${currentPosition}px)`;
                // Force reflow
                track.offsetHeight;
            }, 500);
        }
    }
    
    // Go to next card
    function nextCard() {
        if (isAnimating) return;
        
        const allCards = document.querySelectorAll('.work-showcase .showcase-card');
        const lastCardPosition = (allCards.length - cards.length) * cardWidth;
        
        // If we're at the end, prepare to jump to the beginning
        if (currentPosition >= lastCardPosition) {
            // First, jump to the first card without animation
            currentPosition = cards.length * cardWidth;
            track.style.transition = 'none';
            track.style.transform = `translateX(-${currentPosition}px)`;
            // Force reflow
            track.offsetHeight;
            
            // Then move to the next card with animation
            setTimeout(() => {
                currentPosition += cardWidth;
                animateTo(currentPosition);
            }, 10);
        } else {
            // Normal case - just move to next card
            currentPosition += cardWidth;
            animateTo(currentPosition);
        }
        
        // Check if we need to jump after animation
        setTimeout(checkPosition, 600);
    }
    
    // Go to previous card
    function prevCard() {
        if (isAnimating) return;
        
        const allCards = document.querySelectorAll('.work-showcase .showcase-card');
        const firstCardPosition = cards.length * cardWidth;
        
        // If we're at the beginning, prepare to jump to the end
        if (currentPosition <= firstCardPosition) {
            // First, jump to the last card without animation
            currentPosition = (allCards.length - cards.length * 2) * cardWidth;
            track.style.transition = 'none';
            track.style.transform = `translateX(-${currentPosition}px)`;
            // Force reflow
            track.offsetHeight;
            
            // Then move to the previous card with animation
            setTimeout(() => {
                currentPosition -= cardWidth;
                animateTo(currentPosition);
            }, 10);
        } else {
            // Normal case - just move to previous card
            currentPosition -= cardWidth;
            animateTo(currentPosition);
        }
        
        // Check if we need to jump after animation
        setTimeout(checkPosition, 600);
    }
    
    // Event Listeners
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextCard();
        });
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevCard();
        });
    }
    
    // Touch and drag support
    track.addEventListener('mousedown', (e) => {
        if (isAnimating) return;
        isDragging = true;
        startX = e.pageX - track.getBoundingClientRect().left;
        scrollLeft = currentPosition;
        track.style.cursor = 'grabbing';
        track.style.transition = 'none';
        e.preventDefault();
    });
    
    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            track.style.cursor = 'grab';
            
            // Calculate velocity for momentum scrolling
            const velocity = (currentPosition - scrollLeft) / 10;
            
            // Snap to nearest card with momentum
            const snapPosition = Math.round((currentPosition + velocity * 2) / cardWidth) * cardWidth;
            currentPosition = snapPosition;
            
            // Animate to the snapped position
            animateTo(currentPosition);
            
            // Check if we need to jump after animation
            setTimeout(checkPosition, 600);
        }
    });
    
    // Mouse move handler
    function handleMouseMove(e) {
        if (!isDragging) return;
        
        const x = e.pageX - track.getBoundingClientRect().left;
        const walk = (x - startX) * 1.5;
        const newPosition = scrollLeft - walk;
        
        // Update position during drag
        currentPosition = newPosition;
        track.style.transform = `translateX(-${currentPosition}px)`;
    }
    
    // Touch event handlers
    function handleTouchStart(e) {
        isDragging = true;
        startX = e.touches[0].pageX - track.getBoundingClientRect().left;
        scrollLeft = currentPosition;
        track.style.transition = 'none';
        track.style.cursor = 'grabbing';
    }
    
    function handleTouchEnd() {
        isDragging = false;
        track.style.transition = 'transform 0.3s ease-out';
        track.style.cursor = 'grab';
        checkPosition();
    }
    
    function handleTouchMove(e) {
        if (!isDragging) return;
        
        const x = e.touches[0].pageX - track.getBoundingClientRect().left;
        const walk = (x - startX) * 1.5;
        currentPosition = scrollLeft - walk;
        track.style.transform = `translateX(-${currentPosition}px)`;
        
        // Only prevent default if we're actually dragging
        if (Math.abs(x - startX) > 5) {
            e.preventDefault();
        }
    }
    
    // Add event listeners with proper passive options
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    track.addEventListener('touchstart', handleTouchStart, { passive: true });
    track.addEventListener('touchend', handleTouchEnd, { passive: true });
    track.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    // Auto-scroll functionality
    let autoScroll = setInterval(nextCard, 5000);
    
    // Pause auto-scroll on hover
    const workSection = document.querySelector('.work-showcase');
    if (workSection) {
        workSection.addEventListener('mouseenter', () => {
            clearInterval(autoScroll);
        });
        
        workSection.addEventListener('mouseleave', () => {
            clearInterval(autoScroll);
            autoScroll = setInterval(nextCard, 5000);
        });
    }
    
    // Initialize the slider
    initSlider();
    
    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const allCards = document.querySelectorAll('.work-showcase .showcase-card');
            track.style.transition = 'none';
            track.style.width = `${allCards.length * cardWidth}px`;
            track.style.transform = `translateX(-${currentPosition}px)`;
        }, 250);
    });
});
