document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navbarMenu = document.querySelector('.navbar-menu');
    const navbarLinks = document.querySelectorAll('.navbar-link');
    
    // Toggle mobile menu
    function toggleMenu() {
        menuToggle.classList.toggle('active');
        navbarMenu.classList.toggle('active');
        document.body.style.overflow = menuToggle.classList.contains('active') ? 'hidden' : '';
    }
    
    // Close mobile menu when clicking a link
    function closeMenu() {
        menuToggle.classList.remove('active');
        navbarMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // Event listeners
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMenu);
    }
    
    navbarLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });
    
    // Use native browser behavior for anchor links (no custom smooth scrolling)
    
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;
    let ticking = false;
    
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                
                // Always show navbar when at the top
                if (scrollTop <= 100) {
                    navbar.classList.remove('scrolled');
                    navbar.style.transform = 'translateY(0)';
                    ticking = false;
                    return;
                }
                
                // Add scrolled class when past 100px
                navbar.classList.add('scrolled');
                
                // Only hide on scroll down if scrolled past 200px
                if (scrollTop > lastScrollTop && scrollTop > 200) {
                    // Scrolling down - hide navbar
                    navbar.style.transform = 'translateY(-100%)';
                } else {
                    // Scrolling up or at top - show navbar
                    navbar.style.transform = 'translateY(0)';
                }
                
                lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
                ticking = false;
            });
            
            ticking = true;
        }
    });
    
    // Highlight active section in navbar
    const sections = document.querySelectorAll('section[id]');
    
    function highlightNav() {
        let scrollY = window.pageYOffset;
        
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 200;
            const sectionId = section.getAttribute('id');
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                document.querySelector(`.navbar-link[href*=${sectionId}]`)?.classList.add('active');
            } else {
                document.querySelector(`.navbar-link[href*=${sectionId}]`)?.classList.remove('active');
            }
        });
    }
    
    window.addEventListener('scroll', highlightNav);
    window.addEventListener('load', highlightNav);
});
