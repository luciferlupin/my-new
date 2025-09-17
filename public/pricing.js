document.addEventListener('DOMContentLoaded', function() {
    // Pricing Toggle Functionality
    const toggleOptions = document.querySelectorAll('.toggle-option');
    const toggleSlider = document.querySelector('.toggle-slider');
    const monthlyPrice = document.querySelector('.monthly-price');
    const yearlyPrice = document.querySelector('.yearly-price');
    const monthlyPeriod = document.querySelector('.monthly-period');
    const yearlyPeriod = document.querySelector('.yearly-period');
    const bestValueBadge = document.querySelector('.best-value');

    // Initial state
    let isYearly = false;

    // Toggle between monthly and yearly
    function updatePricing() {
        if (isYearly) {
            toggleSlider.classList.add('yearly');
            monthlyPrice.style.display = 'none';
            yearlyPrice.style.display = 'block';
            monthlyPeriod.style.display = 'none';
            yearlyPeriod.style.display = 'block';
            bestValueBadge.style.opacity = '1';
        } else {
            toggleSlider.classList.remove('yearly');
            monthlyPrice.style.display = 'block';
            yearlyPrice.style.display = 'none';
            monthlyPeriod.style.display = 'block';
            yearlyPeriod.style.display = 'none';
            bestValueBadge.style.opacity = '0';
        }
    }

    // Toggle on option click
    toggleOptions.forEach(option => {
        option.addEventListener('click', function() {
            isYearly = this.dataset.plan === 'yearly';
            toggleOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            updatePricing();
        });
    });

    // Initialize
    updatePricing();

    // Add hover effect to CTA buttons
    const ctaButtons = document.querySelectorAll('.cta-button');
    ctaButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.2)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        });
    });

    // Add animation to feature items on scroll
    const featureItems = document.querySelectorAll('.feature-item');
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    featureItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
        observer.observe(item);
    });
});
