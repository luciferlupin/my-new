document.addEventListener('DOMContentLoaded', function() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all items
            faqItems.forEach(i => {
                i.classList.remove('active');
            });
            
            // Toggle current item if it wasn't active
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
    
    // Initialize first FAQ item as open by default
    if (faqItems.length > 0) {
        faqItems[0].classList.add('active');
    }
});
