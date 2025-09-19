/**
 * Main JavaScript file for Kaizer Website
 * This file includes all the interactive elements and animations
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if document is defined (for SSR)
    if (typeof document === 'undefined' || !document.querySelector) {
        console.warn('Document not available for DOM operations');
        return;
    }

    /**
     * Safely query a single DOM element
     * @param {string} selector - CSS selector
     * @param {Element|Document} [parent=document] - Parent element to search within
     * @returns {Element|null} The found element or null
     */
    const $ = (selector, parent = document) => {
        try {
            if (typeof selector !== 'string' || !selector.trim()) {
                console.warn('Invalid selector provided to $():', String(selector));
                return null;
            }
            if (!parent || !(parent instanceof Element || parent === document)) {
                console.warn('Invalid parent element provided to $()');
                return null;
            }
            const el = parent.querySelector(selector);
            if (!(el instanceof Element)) {
                console.warn(`Element not found: ${selector}`);
                return null;
            }
            return el;
        } catch (error) {
            console.error('Error in $() utility:', error);
            return null;
        }
    };

    /**
     * Safely query multiple DOM elements
     * @param {string} selector - CSS selector
     * @param {Element|Document} [parent=document] - Parent element to search within
     * @returns {Element[]} Array of found elements (empty if none found)
     */
    const $$ = (selector, parent = document) => {
        try {
            if (typeof selector !== 'string' || !selector.trim()) {
                console.warn('Invalid selector provided to $$():', String(selector));
                return [];
            }
            if (!parent || !(parent instanceof Element || parent === document)) {
                console.warn('Invalid parent element provided to $$()');
                return [];
            }
            const elements = Array.from(parent.querySelectorAll(selector));
            if (elements.length === 0) {
                console.warn(`No elements found for selector: ${selector}`);
            }
            return elements;
        } catch (error) {
            console.error('Error in $$() utility:', error);
            return [];
        }
    };

    /**
     * Safely apply styles to an element
     * @param {Element|null} element - The element to style
     * @param {Object.<string, string>} styles - Object of CSS styles to apply
     * @returns {void}
     */
    const safeStyle = (element, styles) => {
        try {
            if (!(element instanceof Element) || !element.style) {
                console.warn('Invalid element provided to safeStyle()');
                return;
            }
            if (typeof styles !== 'object' || styles === null) {
                console.warn('Invalid styles object provided to safeStyle()');
                return;
            }
            Object.entries(styles).forEach(([prop, value]) => {
                if (typeof prop === 'string' && typeof value === 'string') {
                    element.style[prop] = value;
                }
            });
        } catch (error) {
            console.error('Error in safeStyle():', error);
        }
    };

    /**
     * Initialize all components with error handling
     * @returns {void}
     */
    function initComponents() {
        try {
            // Safely check for elements before initializing
            const processSection = $('#process');
            if (processSection) {
                if (typeof initProcessSection === 'function') {
                    initProcessSection();
                } else {
                    console.warn('initProcessSection function not found');
                }
            }

            // Initialize particles if containers exist and function is available
            if (typeof initParticles === 'function') {
                initParticles();
            } else {
                console.warn('initParticles function not found');
            }
        } catch (error) {
            console.error('Error initializing components:', error);
        }
    }

    // Initialize particles for different sections
    function initParticles() {
        const particleContainers = {
            'particles-showcase': {
                number: { value: 50 },
                // Add other particle configurations as needed
            },
            'particles-options': {
                number: { value: 50 }
            },
            'particles-ourwork': {
                number: { value: 40 }
            },
            'particles-process': {
                number: { value: 60 }
            },
            'particles-js': {
                number: { value: 80 }
            }
        };

        Object.entries(particleContainers).forEach(([id, config]) => {
            const container = document.getElementById(id);
            if (container && window.particlesJS) {
                particlesJS(id, {
                    particles: {
                        ...config,
                        color: { value: "#ffffff" },
                        shape: { type: "circle" },
                        opacity: {
                            value: 0.2,
                            random: true,
                            anim: { enable: true, speed: 1, opacity_min: 0.05 }
                        },
                        size: {
                            value: 2,
                            random: true,
                            anim: { enable: true, speed: 2, size_min: 0.1 }
                        },
                        line_linked: {
                            enable: true,
                            distance: 200,
                            color: "#ffffff",
                            opacity: 0.1,
                            width: 1
                        },
                        move: {
                            enable: true,
                            speed: 1,
                            direction: "none",
                            random: true,
                            straight: false,
                            out_mode: "out"
                        }
                    },
                    interactivity: {
                        detect_on: "canvas",
                        events: {
                            onhover: { enable: false },
                            onclick: { enable: false },
                            resize: true
                        }
                    },
                    retina_detect: true
                });
            }
        });
    }

    /**
     * Initialize process section with scroll animations
     * @returns {void}
     */
    function initProcessSection() {
        try {
            const processSteps = $$('.process-step');
            if (!Array.isArray(processSteps) || processSteps.length === 0) {
                console.warn('No process steps found');
                return;
            }

            // Throttle scroll events for better performance
            let isScrolling = false;
            let lastScrollTime = 0;
            const SCROLL_THROTTLE = 100; // ms
            
            /**
             * Check if elements are in viewport and trigger animations
             * @returns {void}
             */
            function checkIfInView() {
                const now = Date.now();
                if (isScrolling || now - lastScrollTime < SCROLL_THROTTLE) {
                    return;
                }
                
                isScrolling = true;
                lastScrollTime = now;
                
                requestAnimationFrame(() => {
                    try {
                        const windowHeight = window.innerHeight || 0;
                        const windowTop = Math.max(window.scrollY || 0, window.pageYOffset || 0, document.documentElement.scrollTop || 0);
                        const windowBottom = windowTop + windowHeight;

                        processSteps.forEach(step => {
                            if (!(step instanceof Element) || typeof step.getBoundingClientRect !== 'function') {
                                return;
                            }
                            
                            const rect = step.getBoundingClientRect();
                            const elementTop = rect.top + windowTop;
                            const elementBottom = elementTop + (rect.height || 0);
                            
                            // If element is in viewport
                            if (elementBottom >= windowTop && elementTop <= windowBottom) {
                                const stepNumber = step.dataset?.step;
                                if (!stepNumber) {
                                    console.warn('Process step missing data-step attribute');
                                    return;
                                }
                                
                                const animationFunctions = {
                                    '1': animateStep1,
                                    '2': animateStep2,
                                    '3': animateStep3,
                                    '4': animateStep4,
                                    '5': animateStep5
                                };
                                
                                const animationFunction = animationFunctions[stepNumber];
                                if (typeof animationFunction === 'function') {
                                    try {
                                        animationFunction();
                                    } catch (e) {
                                        console.error(`Error in animation function for step ${stepNumber}:`, e);
                                    }
                                }
                            }
                        });
                    } catch (error) {
                        console.error('Error in checkIfInView:', error);
                    } finally {
                        isScrolling = false;
                    }
                });
            }

        /**
         * Animation for step 1
         * @returns {void}
         */
        function animateStep1() {
            try {
                const stepContainer = $('.process-step[data-step="1"]');
                if (!stepContainer) {
                    console.warn('Step 1 container not found');
                    return;
                }
                
                const elements = {
                    title: stepContainer.querySelector('h3'),
                    description: stepContainer.querySelector('p'),
                    icon: stepContainer.querySelector('.icon')
                };

                safeStyle(elements.title, { animation: 'fadeInUp 0.8s ease-out forwards' });
                safeStyle(elements.description, { animation: 'fadeInUp 0.8s ease-out 0.2s forwards' });
                safeStyle(elements.icon, { animation: 'bounceIn 1s ease-out 0.4s forwards' });
            } catch (error) {
                console.error('Error in animateStep1:', error);
            }
        }

        // Animation for step 2 - Completely rewritten for reliability
        function animateStep2() {
            try {
                // Safely get elements with null checks
                const icons = Array.from(document.querySelectorAll('.request-icons .icon')).filter(icon => 
                    icon && typeof icon === 'object' && 'style' in icon
                );
                
                const requestBox = document.querySelector('.request-box');
                
                // Skip if no elements to animate
                if (!icons.length && !requestBox) {
                    console.log('No elements found to animate in step 2');
                    return;
                }
                
                // Animate icons if they exist
                if (icons.length > 0) {
                    icons.forEach((icon, index) => {
                        if (!icon || typeof icon.style === 'undefined') {
                            console.warn('Invalid icon element found, skipping animation');
                            return;
                        }
                        
                        // Initial state
                        safeStyle(icon, {
                            opacity: '1',
                            transform: 'translateY(0)'
                        });
                        
                        // Animate after a delay
                        const timer = setTimeout(() => {
                            try {
                                // First animation
                                safeStyle(icon, {
                                    transition: 'all 0.8s cubic-bezier(0.68, -0.55, 0.27, 1.55)',
                                    transform: 'translate(0, -30px) scale(0.8)',
                                    opacity: '0.5'
                                });
                                
                                // Animate request box after last icon
                                if (index === icons.length - 1 && requestBox) {
                                    setTimeout(() => {
                                        safeStyle(requestBox, { 
                                            borderColor: 'rgba(79, 172, 254, 0.4)',
                                            boxShadow: '0 0 30px rgba(79, 172, 254, 0.2)',
                                            transform: 'translateY(-5px)'
                                        });
                                    }, 500);
                                }
                            } catch (e) {
                                console.error('Error in icon animation:', e);
                                clearTimeout(timer);
                            }
                        }, 1500 + (index * 200));
                    });
                } else if (requestBox && typeof requestBox.style !== 'undefined') {
                    // If no icons but requestBox exists, just animate the box
                    const timer = setTimeout(() => {
                        try {
                            safeStyle(requestBox, { 
                                borderColor: 'rgba(79, 172, 254, 0.4)',
                                boxShadow: '0 0 30px rgba(79, 172, 254, 0.2)',
                                transform: 'translateY(-5px)'
                            });
                        } catch (e) {
                            console.error('Error in requestBox animation:', e);
                            clearTimeout(timer);
                        }
                    }, 500);
                }
            } catch (error) {
                console.error('Error in animateStep2:', error);
            }
        }

        // Animation for step 3 - Code typing effect with error handling
        function animateStep3() {
            try {
                // Safely get the code lines container
                const codeLines = document.querySelector('.code-lines');
                
                // If codeLines doesn't exist or is not a valid element, exit the function
                if (!codeLines || !(codeLines instanceof HTMLElement) || !codeLines.appendChild) {
                    console.warn('Code lines container not found or invalid');
                    return;
                }

                // Clear existing content safely
                try {
                    codeLines.innerHTML = '';
                } catch (e) {
                    console.error('Error clearing code lines container:', e);
                    return;
                }

                // Define code snippets
                const codeSnippets = [
                    'function processRequest(data) {',
                    '  // Process incoming data',
                    '  const result = analyze(data);',
                    '  return optimize(result);',
                    '}'
                ];
                
                // Process each line
                codeSnippets.forEach((line, lineIndex) => {
                    try {
                        // Create line element
                        const lineElement = document.createElement('div');
                        lineElement.className = 'code-line';
                        
                        // Safely append to container
                        try {
                            if (codeLines && codeLines.appendChild) {
                                codeLines.appendChild(lineElement);
                            } else {
                                console.warn('Cannot append to codeLines: invalid element');
                                return;
                            }
                        } catch (e) {
                            console.error('Error appending line element:', e);
                            return;
                        }
                        
                        // Add typing effect
                        for (let i = 0; i < line.length; i++) {
                            setTimeout(() => {
                                try {
                                    if (lineElement && lineElement.textContent !== undefined) {
                                        lineElement.textContent = line.substring(0, i + 1);
                                    }
                                } catch (e) {
                                    console.error('Error updating text content:', e);
                                }
                            }, (lineIndex * 100) + (i * 50));
                        }
                    } catch (e) {
                        console.error('Error creating code line:', e);
                    }
                });
            } catch (error) {
                console.error('Error in animateStep3:', error);
            }
        }

        // Animation for step 4
        function animateStep4() {
            try {
                const testResults = $('.test-results');
                const metrics = $$('.metric');
                
                safeStyle(testResults, {
                    opacity: '1',
                    transform: 'translateY(0)',
                    transition: 'opacity 0.5s ease, transform 0.5s ease'
                });
                
                metrics.forEach((metric, index) => {
                    if (!metric) return;
                    
                    setTimeout(() => {
                        safeStyle(metric, {
                            opacity: '1',
                            transform: 'scale(1)',
                            transition: 'opacity 0.3s ease, transform 0.3s ease'
                        });
                    }, index * 200);
                });
            } catch (error) {
                console.error('Error in animateStep4:', error);
            }
        }

        // Animation for step 5
        function animateStep5() {
            // Animation handled by CSS
            return;
        }

            // Initial check and scroll listener with debounce
            if (typeof checkIfInView === 'function') {
                // Initial check
                checkIfInView();
                
                // Debounce the scroll event
                let scrollTimeout;
                const handleScroll = () => {
                    clearTimeout(scrollTimeout);
                    scrollTimeout = setTimeout(checkIfInView, 100);
                };
                
                // Add event listener
                window.addEventListener('scroll', handleScroll, { passive: true });
                
                // Also check on window resize
                window.addEventListener('resize', handleScroll, { passive: true });
            }
        } catch (error) {
            console.error('Error initializing process section:', error);
        }
    }

    // Initialize all components with error handling
    try {
        if (document.readyState === 'loading') {
            // Use a named function for proper cleanup
            const initHandler = () => {
                document.removeEventListener('DOMContentLoaded', initHandler);
                initComponents();
            };
            document.addEventListener('DOMContentLoaded', initHandler);
        } else {
            // DOMContentLoaded has already fired
            // Use setTimeout to ensure the DOM is fully ready
            setTimeout(initComponents, 0);
        }
    } catch (error) {
        console.error('Error during initialization:', error);
        // Try to initialize components anyway as a fallback
        try {
            initComponents();
        } catch (e) {
            console.error('Fallback initialization failed:', e);
        }
    }
});
