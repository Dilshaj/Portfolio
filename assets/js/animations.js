/**
 * Animations Logic
 * Handles Intersection Observers, Card Flips, and Scroll Effects.
 */

// Initialize all animations
function initAnimations() {
    initObserver();
    initServicesScroll();
}

// Intersection Observer for Scroll Animations
function initObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Attach to elements
    const animatedElements = document.querySelectorAll('.hero-content, .about-content, .service-card-custom, .portfolio-card-large, .career-info-side, .role-card');
    animatedElements.forEach(el => {
        // Set initial state via JS to ensure CSS exists
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Add CSS class for visibility dynamically if not present
    if (!document.getElementById('anim-style')) {
        const style = document.createElement('style');
        style.id = 'anim-style';
        style.innerHTML = `
            .visible { opacity: 1 !important; transform: translateY(0) !important; }
        `;
        document.head.appendChild(style);
    }
}

// Card Flip Logic (Career Page/Home Page)
// Exposed globally because it's often called via onclick attributes in existing HTML
window.toggleFlip = function (cardId) {
    const card = document.getElementById(cardId);
    if (card) {
        card.classList.toggle('flipped');
    }
};

// Services Scroll Pagination Logic (Mobile Dots)
function initServicesScroll() {
    const servicesGrid = document.querySelector('.services-grid');
    const serviceDots = document.querySelectorAll('.mobile-dots-container .mobile-dot');

    if (servicesGrid && serviceDots.length > 0) {
        servicesGrid.addEventListener('scroll', () => {
            const scrollLeft = servicesGrid.scrollLeft;
            const card = servicesGrid.querySelector('.service-card-custom');
            if (card) {
                const cardWidth = card.offsetWidth;
                const gap = 20;
                const index = Math.round(scrollLeft / (cardWidth + gap));

                serviceDots.forEach((dot, i) => {
                    if (i === index) {
                        dot.classList.add('active');
                    } else {
                        dot.classList.remove('active');
                    }
                });
            }
        });
    }
}

window.Animations = {
    initAnimations
};
