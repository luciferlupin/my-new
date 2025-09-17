document.addEventListener('DOMContentLoaded', function() {
    // Animate progress bars when they come into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progressBars = entry.target.querySelectorAll('.progress-fill');
                progressBars.forEach(bar => {
                    const progress = bar.getAttribute('data-progress');
                    bar.style.width = `${progress}%`;
                    
                    // Animate the value counter
                    const valueElement = bar.closest('.metric').querySelector('.metric-value');
                    if (valueElement) {
                        const targetValue = parseFloat(progress);
                        const duration = 2000; // 2 seconds
                        const startTime = performance.now();
                        
                        const animateValue = (currentTime) => {
                            const elapsed = currentTime - startTime;
                            const progress = Math.min(elapsed / duration, 1);
                            
                            // Ease out function
                            const easeOut = (t) => 1 - Math.pow(1 - t, 3);
                            const currentValue = Math.floor(easeOut(progress) * targetValue);
                            
                            // Update the display
                            valueElement.textContent = `${currentValue}${targetValue % 1 !== 0 ? '.' + progress.toFixed(1).split('.')[1] : ''}%`;
                            
                            if (progress < 1) {
                                requestAnimationFrame(animateValue);
                            } else {
                                valueElement.textContent = `${targetValue}%`;
                            }
                        };
                        
                        requestAnimationFrame(animateValue);
                    }
                });
                
                // Unobserve after animation to prevent re-triggering
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    // Observe the metrics section
    const metricsSection = document.querySelector('[data-step="4"] .step-animation');
    if (metricsSection) {
        observer.observe(metricsSection);
    }
});
