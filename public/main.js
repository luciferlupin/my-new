/**
 * Main JavaScript file for Kaizer Website
 * This file includes all the interactive elements and animations
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if document is defined (for SSR)
    if (typeof document === 'undefined') return;

    // Utility functions with better error handling
    const $ = (selector, parent = document) => {
        try {
            if (!selector || typeof selector !== 'string') {
                console.warn('Invalid selector provided to $()');
                return null;
            }
            const el = parent.querySelector(selector);
            if (!el) {
                console.warn(`Element not found: ${selector}`);
                return null;
            }
            return el;
        } catch (error) {
            console.error('Error in $() utility:', error);
            return null;
        }
    };

    const $$ = (selector, parent = document) => {
        try {
            if (!selector || typeof selector !== 'string') {
                console.warn('Invalid selector provided to $$()');
                return [];
            }
            const elements = Array.from(parent.querySelectorAll(selector));
            if (elements.length === 0) {
                console.warn(`No elements found: ${selector}`);
            }
            return elements;
        } catch (error) {
            console.error('Error in $$() utility:', error);
            return [];
        }
    };

    const safeStyle = (element, styles) => {
        if (!element || !styles || typeof styles !== 'object') {
            return;
        }
        try {
            Object.assign(element.style, styles);
        } catch (error) {
            console.error('Error applying styles:', error);
        }
    };

    // Initialize components
    function initComponents() {
        try {
            // Safely check for elements before initializing
            const processSection = $('#process');
            if (processSection && typeof initProcessSection === 'function') {
                initProcessSection();
            }

            // Initialize particles if containers exist
            if (typeof initParticles === 'function') {
                initParticles();
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

    // Process section animations
    function initProcessSection() {
        try {
            const processSteps = $$('.process-step');
            if (!processSteps || !processSteps.length) {
                console.warn('No process steps found');
                return;
            }

            // Throttle scroll events for better performance
            let isScrolling = false;
            
            // Check if elements are in viewport
            function checkIfInView() {
                if (isScrolling) return;
                isScrolling = true;
                
                requestAnimationFrame(() => {
                    try {
                        const windowHeight = window.innerHeight;
                        const windowTop = window.scrollY || window.pageYOffset;
                        const windowBottom = windowTop + windowHeight;

                        processSteps.forEach(step => {
                            if (!step || !step.getBoundingClientRect) return;
                            
                            const rect = step.getBoundingClientRect();
                            const elementTop = rect.top + windowTop;
                            const elementBottom = elementTop + (rect.height || 0);
                            
                            // If element is in viewport
                            if (elementBottom >= windowTop && elementTop <= windowBottom) {
                                const stepNumber = step.dataset?.step;
                                const animationFunction = {
                                    '1': animateStep1,
                                    '2': animateStep2,
                                    '3': animateStep3,
                                    '4': animateStep4,
                                    '5': animateStep5
                                }[stepNumber];
                                
                                if (typeof animationFunction === 'function') {
                                    animationFunction();
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

        // Animation for step 1
        function animateStep1() {
            const elements = {
                title: $('.process-step[data-step="1"] h3'),
                description: $('.process-step[data-step="1"] p'),
                icon: $('.process-step[data-step="1"] .icon')
            };

            if (elements.title) elements.title.style.animation = 'fadeInUp 0.8s ease-out forwards';
            if (elements.description) elements.description.style.animation = 'fadeInUp 0.8s ease-out 0.2s forwards';
            if (elements.icon) elements.icon.style.animation = 'bounceIn 1s ease-out 0.4s forwards';
        }

        // Animation for step 2 - Completely rewritten for reliability
        function animateStep2() {
            try {
                // Safely get elements
                const icons = Array.from(document.querySelectorAll('.request-icons .icon')).filter(Boolean);
                const requestBox = document.querySelector('.request-box');
                
                // Skip if no elements to animate
                if (!icons.length && !requestBox) {
                    return;
                }
                
                // Animate icons if they exist
                if (icons.length > 0) {
                    icons.forEach((icon, index) => {
                        if (!icon) return;
                        
                        // Initial state
                        safeStyle(icon, {
                            opacity: '1',
                            transform: 'translateY(0)'
                        });
                        
                        // Animate after a delay
                        setTimeout(() => {
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
                        }, 1500 + (index * 200));
                    });
                } else if (requestBox) {
                    // If no icons but requestBox exists, just animate the box
                    setTimeout(() => {
                        safeStyle(requestBox, { 
                            borderColor: 'rgba(79, 172, 254, 0.4)',
                            boxShadow: '0 0 30px rgba(79, 172, 254, 0.2)',
                            transform: 'translateY(-5px)'
                        });
                    }, 500);
                }
            } catch (error) {
                console.error('Error in animateStep2:', error);
            }
        }

        // Animation for step 3 - Simplified to prevent errors
        function animateStep3() {
            // Safely get the code lines container
            const codeLines = document.querySelector('.code-lines');
            
            // If codeLines doesn't exist, exit the function
            if (!codeLines || !(codeLines instanceof HTMLElement)) {
                return; // Silently exit if element doesn't exist
            }
            
            // Clear existing content safely
            if (codeLines && codeLines.innerHTML) {
                codeLines.innerHTML = '';
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
                // Create line element
                const lineElement = document.createElement('div');
                lineElement.className = 'code-line';
                
                // Safely append to container
                if (codeLines && codeLines.appendChild) {
                    codeLines.appendChild(lineElement);
                    
                    // Add typing effect
                    for (let i = 0; i < line.length; i++) {
                        setTimeout(() => {
                            if (lineElement && lineElement.textContent !== undefined) {
                                lineElement.textContent = line.substring(0, i + 1);
                            }
                        }, (lineIndex * 100) + (i * 50));
                    }
                }
            });
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

        // Animation for step 5 - Completely disabled
        function animateStep5() {
            // All globe/map related code has been removed
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
            document.addEventListener('DOMContentLoaded', initComponents);
        } else {
            // DOMContentLoaded has already fired
            initComponents();
        }
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});
