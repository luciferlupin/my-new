/**
 * Enhanced smooth scroll behavior with native scrollbar support
 * This implementation ensures smooth scrolling while maintaining native scrollbar functionality
 */
document.addEventListener('DOMContentLoaded', function() {
    // Disable default smooth scrolling to prevent conflicts
    document.documentElement.style.scrollBehavior = 'auto';
    
    // Track if we're currently using the scrollbar
    let isUsingScrollbar = false;
    let scrollbarInteractionTimeout = null;
    
    // Store the last known scroll position
    let lastKnownScrollPosition = window.scrollY;
    // Configuration
    const config = {
        wheel: {
            // Base sensitivity for wheel events
            sensitivity: 0.0065,
            // Maximum speed as a fraction of viewport height per second
            maxSpeed: 2.8,
            // Time in ms to consider wheel events as part of the same gesture
            accelerationWindow: 100,
            // Decay rate for wheel velocity (0-1, higher = faster decay)
            deceleration: 0.92,
            // Minimum wheel delta to start scrolling
            minDelta: 0.1,
            // Momentum settings
            momentum: {
                // How much to reduce velocity by each frame (0.9 = 10% reduction per frame)
                friction: 0.9,
                // Minimum velocity before stopping (pixels per frame)
                minVelocity: 0.1,
                // Maximum duration of momentum (ms)
                maxDuration: 1000
            }
        },
        // Animation configuration
        animation: {
            // Base duration for scroll animations (ms) - significantly reduced for snappier response
            duration: 500,  // Reduced from 800
            // Easing function for smooth deceleration (more aggressive curve)
            ease: t => 1 - Math.pow(1 - t, 3.2),  // More aggressive curve
            // Minimum time between animation frames (ms)
            minFrameTime: 4,  // Reduced from 6 for ultra-smooth animation
            // Friction when not actively scrolling (0-1, higher = more friction)
            friction: 0.9,  // Reduced from 0.94 for much less resistance
            // Minimum scroll distance to continue animation (as fraction of viewport)
            minScrollDistance: 0.003,  // Increased from 0.002
            // Distance to scroll per wheel tick (greatly increased for maximum travel)
            wheelDistance: 0.7  // Increased from 0.5
        }
    };
    
    // Track wheel velocity for smooth acceleration/deceleration
    let wheelVelocity = 0;
    let lastWheelTime = 0;
    let lastWheelDelta = 0;

    // State
    let targetScrollY = window.scrollY;
    let currentScrollY = targetScrollY;
    let animationFrameId = null;
    let lastScrollTime = 0;
    let isScrolling = false;

    // Check if we're at the page boundaries
    function isAtBoundary(scrollY) {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        return scrollY <= 0 || scrollY >= maxScroll;
    }

    // Main animation loop
    function animateScroll(timestamp) {
        try {
            const now = timestamp || performance.now();
            const deltaTime = Math.min(now - lastScrollTime, 50); // Cap at 50ms
            lastScrollTime = now;
            
            const viewportHeight = window.innerHeight;
            const maxScroll = document.documentElement.scrollHeight - viewportHeight;
            
            // Calculate the distance to target (in viewport heights)
            let delta = targetScrollY - currentScrollY;
            const deltaViewport = delta / viewportHeight;
            
            // Check if we're at the boundaries
            const atTop = currentScrollY <= 0 && delta < 0;
            const atBottom = currentScrollY >= maxScroll && delta > 0;
            
            if (atTop || atBottom) {
                // At boundaries, use native scrolling
                isScrolling = false;
                wheelVelocity = 0;
                currentScrollY = atTop ? 0 : maxScroll;
                targetScrollY = currentScrollY;
                
                // Force update scroll position
                window.scrollTo(0, currentScrollY);
                
                // Stop the animation loop if we're at the boundary
                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                    animationFrameId = null;
                }
                return;
            }
            
            // Apply deceleration when not actively scrolling
            if (!isScrolling) {
                // Apply deceleration to wheel velocity (in viewport heights per second)
                wheelVelocity *= Math.pow(config.wheel.deceleration, deltaTime / 16.67); // Normalize to 60fps
                
                // If velocity is very low, snap to target
                if (Math.abs(wheelVelocity) < 0.01) {
                    wheelVelocity = 0;
                    currentScrollY = targetScrollY;
                } else {
                    // Continue moving based on velocity
                    currentScrollY += wheelVelocity * viewportHeight * (deltaTime / 1000);
                }
            } else {
                // When actively scrolling, use smooth easing
                const progress = Math.min(1, deltaTime / config.animation.duration);
                const easeProgress = config.animation.ease(progress);
                
                // Calculate the step based on viewport-relative distance
                const step = deltaViewport * easeProgress * viewportHeight;
                currentScrollY += step;
                
                // Check if we're close enough to snap to target (using viewport-relative distance)
                if (Math.abs(deltaViewport) < config.animation.minScrollDistance) {
                    currentScrollY = targetScrollY;
                }
            }
            
            // Ensure we don't overshoot the document bounds
            currentScrollY = Math.max(0, Math.min(currentScrollY, maxScroll));

            // Apply the scroll position with sub-pixel precision for smoother movement
            window.scrollTo({
                top: currentScrollY,
                behavior: 'auto'
            });

            // Continue the animation if we're not at the target or still have velocity
            const shouldContinue = currentScrollY !== targetScrollY || 
                                 Math.abs(wheelVelocity) > 0.1 || 
                                 isScrolling;
            
            if (shouldContinue) {
                animationFrameId = requestAnimationFrame(animateScroll);
            } else {
                isScrolling = false;
                animationFrameId = null;
            }
        } catch (error) {
            console.error('Error in animation loop:', error);
            // Fallback to native scroll if there's an error
            window.scrollTo(0, targetScrollY);
            isScrolling = false;
            animationFrameId = null;
        }
    }

    // Handle wheel events with velocity-based scrolling
    function handleWheel(e) {
        try {
            const viewportHeight = window.innerHeight;
            const maxScroll = document.documentElement.scrollHeight - viewportHeight;
            
            // Always use the current scroll position to prevent jumps
            const currentScroll = window.scrollY;
            currentScrollY = currentScroll;
            
            const atTop = currentScroll <= 0 && e.deltaY < 0;
            const atBottom = currentScroll >= maxScroll && e.deltaY > 0;
            
            // If at boundaries, let the native scroll handle it
            if ((atTop || atBottom) && Math.abs(e.deltaY) > 0) {
                isScrolling = false;
                wheelVelocity = 0;
                
                // Update our scroll position to match the native scroll
                currentScrollY = currentScroll;
                targetScrollY = currentScroll;
                
                return true;
            }
            
            // Don't prevent default for scrollbar wheel events or at boundaries
            if (e.ctrlKey || isScrollbarEvent(e) || atTop || atBottom) {
                // If we're at the boundary, let the native scroll handle it
                if ((atTop && e.deltaY < 0) || (atBottom && e.deltaY > 0)) {
                    isScrolling = false;
                    wheelVelocity = 0;
                    return true;
                }
                return true;
            }
            
            e.preventDefault();
            
            const now = performance.now();
            const delta = e.deltaY || e.detail || -e.wheelDelta; // Normalize wheel delta
            
            // Calculate time since last wheel event
            const deltaTime = Math.min(now - lastWheelTime, 100); // Cap at 100ms
            lastWheelTime = now;
            
            // Calculate velocity (viewport heights per second)
            let velocity = 0;
            if (deltaTime > 0) {
                // Normalize wheel delta and apply sensitivity
                const normalizedDelta = Math.sign(delta) * 
                    Math.max(Math.abs(delta) * config.wheel.sensitivity, config.wheel.minDelta);
                
                // Calculate velocity in viewport heights per second
                velocity = (normalizedDelta * config.animation.wheelDistance * 1000) / deltaTime;
                
                // Apply maximum speed limit (in viewport heights per second)
                velocity = Math.max(-config.wheel.maxSpeed, 
                                  Math.min(velocity, config.wheel.maxSpeed));
            }
            
            // Smooth the velocity using weighted average
            wheelVelocity = velocity * 0.3 + wheelVelocity * 0.7;
            
            // Update target scroll position (in pixels)
            targetScrollY += wheelVelocity * viewportHeight * (deltaTime / 1000);
            targetScrollY = Math.max(0, Math.min(targetScrollY, maxScroll));
            
            lastWheelDelta = delta;
            isScrolling = true;
            
            // Start animation if not running
            // Always ensure animation loop is running
            if (!animationFrameId) {
                animationFrameId = requestAnimationFrame(animateScroll);
            }
        } catch (error) {
            console.error('Error in wheel handler:', error);
            // Fallback to native scroll if there's an error
            window.scrollTo(0, targetScrollY);
        }
    }

    // Check if device is mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Handle touch events for mobile - using smooth scrolling
    let touchStartY = 0;
    let touchStartScrollY = 0;
    let lastTouchY = 0;
    let lastTouchTime = 0;
    let touchVelocity = 0;
    let isTouchActive = false;
    
    function handleTouchStart(e) {
        if (!isMobile) return;
        
        const touch = e.touches[0];
        touchStartY = touch.clientY;
        lastTouchY = touchStartY;
        touchStartScrollY = window.scrollY;
        lastTouchTime = performance.now();
        isTouchActive = true;
        touchVelocity = 0;
        
        // Enable smooth scrolling for mobile
        document.documentElement.style.scrollBehavior = 'smooth';
        document.documentElement.style.overflowScrolling = 'touch';
        document.documentElement.style.webkitOverflowScrolling = 'touch';
        
        // Cancel any ongoing animations
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }
    
    function handleTouchMove(e) {
        if (!isMobile || !isTouchActive) return;
        
        const touchY = e.touches[0].clientY;
        const now = performance.now();
        const deltaTime = now - lastTouchTime;
        
        if (deltaTime > 0) {
            // Calculate velocity
            const deltaY = touchY - lastTouchY;
            touchVelocity = (deltaY / deltaTime) * 1000; // pixels per second
            lastTouchY = touchY;
            lastTouchTime = now;
            
            // Directly update scroll position for immediate response
            const newScroll = touchStartScrollY - (touchY - touchStartY);
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            
            // Apply boundaries
            targetScrollY = Math.max(0, Math.min(newScroll, maxScroll));
            
            // Update current scroll position
            currentScrollY = targetScrollY;
            window.scrollTo(0, currentScrollY);
        }
    }
    
    function handleTouchEnd() {
        if (!isMobile) return;
        
        isTouchActive = false;
        
        // Apply momentum if there's enough velocity
        if (Math.abs(touchVelocity) > 100) {
            const momentumDuration = 800; // ms
            const distance = touchVelocity * (momentumDuration / 1000) * 0.3; // Reduced for subtle effect
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            
            // Calculate new target with boundaries
            let newTarget = currentScrollY - distance;
            targetScrollY = Math.max(0, Math.min(newTarget, maxScroll));
            
            // Start animation
            if (!animationFrameId) {
                isScrolling = true;
                lastScrollTime = performance.now();
                animationFrameId = requestAnimationFrame(animateScroll);
            }
        }
    }
    
    // Handle anchor links with smooth scrolling
    function handleAnchorClick(e) {
        const targetId = this.getAttribute('href');
        if (!targetId.startsWith('#')) return;
        
        const targetElement = document.querySelector(targetId);
        if (!targetElement) return;
        
        e.preventDefault();
        
        // Calculate target position with offset
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - 100; // 100px offset from top
        
        // Update target scroll position
        targetScrollY = Math.max(0, Math.min(targetPosition, document.documentElement.scrollHeight - window.innerHeight));
        
        // Start the animation if it's not already running
        if (!isScrolling) {
            isScrolling = true;
            lastScrollTime = performance.now();
            animationFrameId = requestAnimationFrame(animateScroll);
        }
    }

    // Reset scroll state and sync with current scroll position
    function resetScrollState() {
        // Always sync with the current scroll position
        const currentScroll = window.scrollY;
        currentScrollY = currentScroll;
        targetScrollY = currentScroll;
        lastKnownScrollPosition = currentScroll;
        
        wheelVelocity = 0;
        isScrolling = false;
        lastScrollTime = performance.now();
        
        // Clean up any running animations
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }

    // Handle page visibility changes
    function handleVisibilityChange() {
        if (!document.hidden) {
            // Page became visible again
            resetScrollState();
            // Start animation loop if not running
            if (!animationFrameId) {
                animationFrameId = requestAnimationFrame(animateScroll);
            }
        }
    }

    /**
     * Check if the event is from the scrollbar
     * @param {Event} event - The event to check
     * @returns {boolean} True if the event is from the scrollbar
     */
    function isScrollbarEvent(event) {
        // For wheel events, check if mouse is over scrollbar
        if (event.type === 'wheel' || event.type === 'mousedown' || event.type === 'click') {
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            
            // Check if mouse is in the scrollbar area (with a small buffer)
            const inScrollbarX = event.clientX >= (window.innerWidth - scrollbarWidth - 10);
            
            // For click events, also check if clicking on a scrollbar element
            let isClickingScrollbar = false;
            if (event.type === 'mousedown' || event.type === 'click') {
                const target = event.target;
                const isScrollbarVisible = target.scrollHeight > target.clientHeight || 
                                         target.scrollWidth > target.clientWidth;
                const isScrollbarClick = (event.offsetX > target.clientWidth) || 
                                       (event.offsetY > target.clientHeight);
                isClickingScrollbar = isScrollbarVisible && isScrollbarClick;
            }
            
            return inScrollbarX || isClickingScrollbar;
        }
        
        return false;
    }

    // Initialize the smooth scroll behavior
    function init() {
        // Set initial scroll state
        resetScrollState();
        
        // Track the last scroll position for delta calculations
        let lastWheelEventTime = 0;
        let lastScrollPosition = window.scrollY;
        
        // Handle wheel events
        window.addEventListener('wheel', (e) => {
            const currentTime = Date.now();
            const isScrollbarInteraction = isScrollbarEvent(e);
            
            // Always allow default behavior for:
            // 1. Scrollbar wheel events
            // 2. When holding Ctrl key (for zooming)
            // 3. When using trackpad with horizontal scrolling
            if (e.ctrlKey || isScrollbarInteraction || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                isScrolling = false;
                wheelVelocity = 0;
                
                // Update our scroll position to match the native scroll
                const currentScroll = window.scrollY;
                currentScrollY = currentScroll;
                targetScrollY = currentScroll;
                lastKnownScrollPosition = currentScroll;
                
                return true;
            }
            
            // For regular wheel events, update our scroll position first
            const currentScroll = window.scrollY;
            if (Math.abs(currentScroll - currentScrollY) > 5) {
                currentScrollY = currentScroll;
                targetScrollY = currentScroll;
            }
            
            // Then handle the wheel event for smooth scrolling
            e.preventDefault();
            handleWheel(e);
            
            // Prevent rapid wheel events from causing jumps
            if (currentTime - lastWheelEventTime < 16) { // ~60fps
                return;
            }
            lastWheelEventTime = currentTime;
            
        }, { passive: false });
        
        // Handle scrollbar interaction
        document.addEventListener('mousedown', (e) => {
            if (isScrollbarEvent(e)) {
                isUsingScrollbar = true;
                isScrolling = false;
                wheelVelocity = 0;
                
                // Sync with current scroll position
                const currentScroll = window.scrollY;
                currentScrollY = currentScroll;
                targetScrollY = currentScroll;
                lastKnownScrollPosition = currentScroll;
                
                // Clear any pending timeouts
                if (scrollbarInteractionTimeout) {
                    clearTimeout(scrollbarInteractionTimeout);
                }
                
                // Set a timeout to re-enable smooth scrolling after scrollbar interaction
                scrollbarInteractionTimeout = setTimeout(() => {
                    isUsingScrollbar = false;
                    
                    // One final sync after releasing the scrollbar
                    const finalScroll = window.scrollY;
                    currentScrollY = finalScroll;
                    targetScrollY = finalScroll;
                    lastKnownScrollPosition = finalScroll;
                }, 150);
            }
        });
        
        // Sync with native scroll position when user interacts with scrollbar
        let scrollTimeout;
        window.addEventListener('scroll', (e) => {
            const currentScroll = window.scrollY;
            
            // If the scroll position changed significantly, update our state
            if (Math.abs(currentScroll - lastKnownScrollPosition) > 1) {
                // If we're using the scrollbar, update immediately
                if (isUsingScrollbar) {
                    currentScrollY = currentScroll;
                    targetScrollY = currentScroll;
                    lastKnownScrollPosition = currentScroll;
                } else {
                    // For programmatic or other scrolls, update with a small delay
                    // to prevent janky behavior
                    clearTimeout(scrollTimeout);
                    scrollTimeout = setTimeout(() => {
                        currentScrollY = currentScroll;
                        targetScrollY = currentScroll;
                        lastKnownScrollPosition = currentScroll;
                    }, 50);
                }
            }
            
            // Update the last known position
            lastKnownScrollPosition = currentScroll;
        });
        
        // Touch events - using passive for better performance
        if (isMobile) {
            // On mobile, use smooth scrolling with touch support
            document.documentElement.style.scrollBehavior = 'smooth';
            document.documentElement.style.overflowScrolling = 'touch';
            document.documentElement.style.webkitOverflowScrolling = 'touch';
            
            // Add touch event listeners with passive: false to allow preventDefault
            window.addEventListener('touchstart', handleTouchStart, { passive: false });
            window.addEventListener('touchmove', handleTouchMove, { passive: false });
            window.addEventListener('touchend', handleTouchEnd, { passive: true });
            window.addEventListener('touchcancel', handleTouchEnd, { passive: true });
        } else {
            // On desktop, keep the existing smooth scrolling behavior
            window.addEventListener('touchstart', handleTouchStart, { passive: true });
            window.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true });
            window.addEventListener('touchend', handleTouchEnd, { passive: true });
        }
        
        // Handle page visibility changes
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // Handle window focus/blur
        window.addEventListener('blur', resetScrollState);
        window.addEventListener('focus', () => {
            resetScrollState();
            if (!animationFrameId) {
                animationFrameId = requestAnimationFrame(animateScroll);
            }
        });
        
        // Handle window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
                targetScrollY = Math.max(0, Math.min(targetScrollY, maxScroll));
                currentScrollY = Math.max(0, Math.min(currentScrollY, maxScroll));
                window.scrollTo(0, currentScrollY);
                
                // Ensure animation continues
                if (!animationFrameId) {
                    animationFrameId = requestAnimationFrame(animateScroll);
                }
            }, 100);
        });
        
        // Add smooth scrolling to anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', handleAnchorClick);
        });
        
        // Handle browser's back/forward navigation
        window.addEventListener('popstate', resetScrollState);
        
        // Start the animation loop
        if (!animationFrameId) {
            animationFrameId = requestAnimationFrame(animateScroll);
        }
        
        // Handle browser's back/forward navigation
        window.addEventListener('popstate', () => {
            targetScrollY = window.scrollY;
            currentScrollY = targetScrollY;
        });
    }

    // Start the smooth scrolling
    init();
});
