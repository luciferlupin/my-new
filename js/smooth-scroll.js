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
                currentScrollY = currentScroll;
                targetScrollY = currentScroll;
                return true;
            }
            
            // Don't prevent default for scrollbar wheel events, ctrl key, or touchpad pinch-zoom
            if (e.ctrlKey || e.metaKey || e.deltaMode === 1 || isScrollbarEvent(e)) {
                return true;
            }
            
            e.preventDefault();
            e.stopPropagation();
            
            const now = performance.now();
            // Normalize wheel delta (handling both wheel and trackpad events)
            let delta = e.deltaY;
            
            // Handle different delta modes (pixels, lines, or pages)
            if (e.deltaMode === 1) {  // Lines
                delta *= 40;  // Approximate line height
            } else if (e.deltaMode === 2) {  // Pages
                delta *= viewportHeight;
            }
            
            // Calculate time since last wheel event
            const deltaTime = Math.min(now - lastWheelTime, 100);
            lastWheelTime = now;
            
            // Calculate velocity with improved sensitivity
            let velocity = 0;
            if (deltaTime > 0) {
                // Apply non-linear sensitivity for better control
                const absDelta = Math.abs(delta);
                const direction = Math.sign(delta);
                const normalizedDelta = direction * Math.min(
                    Math.pow(absDelta * 0.2, 1.3) * config.wheel.sensitivity * 2,
                    config.wheel.maxSpeed * 0.5
                );
                
                // Smoother velocity calculation
                velocity = (normalizedDelta * 1000) / Math.max(deltaTime, 1);
                
                // Apply speed limits
                velocity = Math.max(-config.wheel.maxSpeed, Math.min(velocity, config.wheel.maxSpeed));
            }
            
            // Smoother velocity tracking with inertia
            const smoothFactor = Math.min(1, deltaTime / 16); // Normalize to 60fps
            wheelVelocity = velocity * smoothFactor + wheelVelocity * (1 - smoothFactor);
            
            // Update target scroll position with easing
            const scrollDistance = wheelVelocity * viewportHeight * (deltaTime / 1000);
            targetScrollY = Math.max(0, Math.min(targetScrollY + scrollDistance, maxScroll));
            
            lastWheelDelta = delta;
            isScrolling = true;
            
            // Ensure animation loop is running
            if (!animationFrameId) {
                lastScrollTime = now;
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
    
    // If mobile, use default scrolling
    if (isMobile) {
        // Re-enable default smooth scrolling
        document.documentElement.style.scrollBehavior = 'smooth';
        document.documentElement.style.overflowScrolling = 'touch';
        document.documentElement.style.webkitOverflowScrolling = 'touch';
        return; // Exit early for mobile devices
    }
    
    // Desktop touch event handling (kept for devices that might have both touch and mouse)
    let touchStartY = 0;
    let touchStartScrollY = 0;
    let lastTouchY = 0;
    let lastTouchTime = 0;
    let touchVelocity = 0;
    let isTouchActive = false;
    let touchMoved = false;
    let touchStartTime = 0;
    
    function handleTouchStart(e) {
        if (!isMobile || e.touches.length !== 1) return;
        
        const touch = e.touches[0];
        touchStartY = touch.clientY;
        lastTouchY = touchStartY;
        touchStartScrollY = window.scrollY;
        lastTouchTime = performance.now();
        touchStartTime = lastTouchTime;
        isTouchActive = true;
        touchMoved = false;
        touchVelocity = 0;
        
        // Use native scrolling for better touch response
        document.documentElement.style.scrollBehavior = 'auto';
        document.documentElement.style.overflowScrolling = 'touch';
        document.documentElement.style.webkitOverflowScrolling = 'touch';
        
        // Cancel any ongoing animations
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        
        // Prevent default to avoid text selection and other default behaviors
        e.preventDefault();
    }
    
    function handleTouchMove(e) {
        if (!isMobile || !isTouchActive || e.touches.length !== 1) return;
        
        const touchY = e.touches[0].clientY;
        const now = performance.now();
        const deltaTime = now - lastTouchTime;
        
        // Mark that touch has moved
        touchMoved = true;
        
        if (deltaTime > 0) {
            // Calculate velocity with smoothing
            const deltaY = touchY - lastTouchY;
            const newVelocity = (deltaY / deltaTime) * 16; // pixels per 16ms (roughly 1 frame)
            
            // Apply low-pass filter to smooth out the velocity
            touchVelocity = 0.3 * newVelocity + 0.7 * touchVelocity;
            lastTouchY = touchY;
            lastTouchTime = now;
            
            // Calculate the new scroll position
            const newScroll = touchStartScrollY - (touchY - touchStartY);
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            
            // Apply boundaries and update scroll position
            const boundedScroll = Math.max(0, Math.min(newScroll, maxScroll));
            
            // Only update if we've moved significantly to prevent jitter
            if (Math.abs(touchY - touchStartY) > 2) {
                window.scrollTo(0, boundedScroll);
            }
        }
        
        // Prevent default to avoid any default behaviors
        e.preventDefault();
    }
    
    function handleTouchEnd(e) {
        if (!isMobile || !isTouchActive) return;
        
        isTouchActive = false;
        
        // If it was a quick flick, apply momentum
        const timeSinceStart = performance.now() - touchStartTime;
        const isFlick = touchMoved && timeSinceStart < 300 && Math.abs(touchVelocity) > 20;
        
        if (isFlick) {
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const momentumDuration = 1000; // ms
            
            // Calculate distance based on velocity and time
            const distance = touchVelocity * (momentumDuration / 1000) * 0.5; // Reduced coefficient
            let newTarget = window.scrollY - distance;
            
            // Apply boundaries with rubber band effect
            if (newTarget < 0) {
                // Rubber band at top
                newTarget = newTarget * 0.3;
            } else if (newTarget > maxScroll) {
                // Rubber band at bottom
                newTarget = maxScroll + (newTarget - maxScroll) * 0.3;
            }
            
            // Ensure we stay within bounds
            newTarget = Math.max(0, Math.min(newTarget, maxScroll));
            
            // Use smooth scroll for the momentum effect
            window.scrollTo({
                top: newTarget,
                behavior: 'smooth'
            });
        }
        
        // Reset states
        touchVelocity = 0;
        touchMoved = false;
        
        // Prevent default to avoid any default behaviors
        e.preventDefault();
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
        if (document.visibilityState === 'visible') {
            // Reset scroll state when page becomes visible again
            resetScrollState();
        }
    }

    /**
     * Check if the event is from the scrollbar
     * @param {Event} event - The event to check
     * @returns {boolean} True if the event is from the scrollbar
     */
    function isScrollbarEvent(event) {
        // Check if the event target is the scrollbar
        const target = event.target;
        const isScrollbar = target === document.documentElement ||
                          target === document.body ||
                          (target && (target.scrollHeight > target.clientHeight ||
                                    target.scrollWidth > target.clientWidth));
        
        // Check if the click is near the right edge of the viewport (where scrollbar typically is)
        const viewportWidth = window.innerWidth;
        const clickX = event.clientX;
        const isNearRightEdge = clickX > viewportWidth - 20; // 20px from the right edge
        
        return isScrollbar || isNearRightEdge;
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

    // Only initialize smooth scrolling for non-mobile devices
    if (!isMobile) {
        init();
    }
});
