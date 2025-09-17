// Lazy load particle animations
function initParticles(particlesId, config) {
    const container = document.getElementById(particlesId);
    if (container && !window.particlesJS(particlesId, config)) {
        // If particlesJS is not loaded yet, wait for it
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js';
        script.onload = () => window.particlesJS(particlesId, config);
        document.body.appendChild(script);
    }
}

// Intersection Observer for lazy loading particles
function setupParticleObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const particlesId = entry.target.id;
                const config = getParticlesConfig(particlesId);
                if (config) {
                    initParticles(particlesId, config);
                    observer.unobserve(entry.target); // Stop observing once loaded
                }
            }
        });
    }, { threshold: 0.1 });

    // Observe all particle containers
    document.querySelectorAll('[id^="particles-"]').forEach(el => {
        observer.observe(el);
    });
}

// Get appropriate config based on particle container ID
function getParticlesConfig(particlesId) {
    const baseConfig = {
        particles: {
            number: { value: 40, density: { enable: true, value_area: 800 } },
            color: { value: "#ffffff" },
            shape: { type: "circle" },
            opacity: { value: 0.5, random: true },
            size: { value: 3, random: true },
            line_linked: { enable: true, distance: 150, color: "#ffffff", opacity: 0.1, width: 1 },
            move: { enable: true, speed: 1, direction: "none", random: true, straight: false, out_mode: "out" }
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: { enable: true, mode: "grab" },
                onclick: { enable: true, mode: "push" },
                resize: true
            }
        },
        retina_detect: true
    };

    // Customize config based on section
    switch(particlesId) {
        case 'particles-js': // Hero section
            return {
                ...baseConfig,
                particles: { ...baseConfig.particles, number: { value: 80 } }
            };
        case 'particles-ourwork':
        case 'particles-process':
        case 'particles-services':
            return baseConfig;
        case 'particles-testimonials':
            return {
                ...baseConfig,
                particles: { ...baseConfig.particles, number: { value: 30 } }
            };
        case 'particles-pricing':
            return {
                ...baseConfig,
                particles: { ...baseConfig.particles, number: { value: 25 } }
            };
        default:
            return baseConfig;
    }
}

// Initialize particle observer when DOM is ready
document.addEventListener('DOMContentLoaded', setupParticleObserver);
