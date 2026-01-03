/**
 * Navigation & Component Loading Logic
 * Handles Header/Footer injection, active link highlighting, and navigation interactions.
 */

const CONFIG = {
    basePath: '/'
};

// Load Header and Footer dynamically
async function loadComponents() {
    try {
        const headerPlaceholder = document.getElementById('header-container');
        const footerPlaceholder = document.getElementById('footer-placeholder');

        // Load Header
        if (headerPlaceholder) {
            const headerRes = await fetch(`${CONFIG.basePath}assets/components/header.html`);
            if (headerRes.ok) {
                headerPlaceholder.innerHTML = await headerRes.text();
            } else {
                console.error('Failed to load header');
            }
        }

        // Load Footer
        if (footerPlaceholder) {
            const footerRes = await fetch(`${CONFIG.basePath}assets/components/footer.html`);
            if (footerRes.ok) {
                footerPlaceholder.innerHTML = await footerRes.text();
            } else {
                console.error('Failed to load footer');
            }
        }

        // Initialize features after DOM updates
        initNavigation();
        initSmoothScroll();

    } catch (error) {
        console.error('Error loading components:', error);
    }
}

// Initialize Navigation Logic (Call this after header injection)
function initNavigation() {
    // Mobile Menu Toggle
    const mobileBtn = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileBtn && navLinks) {
        // Clone to remove old listeners ensures we don't duplicate events if re-initialized
        const newBtn = mobileBtn.cloneNode(true);
        mobileBtn.parentNode.replaceChild(newBtn, mobileBtn);

        // Helper to Toggle Menu
        const toggleMenu = (forceClose = false) => {
            const icon = newBtn.querySelector('i');
            const isActive = navLinks.classList.contains('active');

            // If we are forcing close, OR if it's currently active (so we are closing it)
            if (forceClose) {
                if (isActive) {
                    navLinks.classList.remove('active');
                    if (icon) icon.className = 'fas fa-bars';
                }
            } else {
                // Toggle logic
                if (isActive) {
                    navLinks.classList.remove('active');
                    if (icon) icon.className = 'fas fa-bars';
                } else {
                    navLinks.classList.add('active');
                    if (icon) icon.className = 'fas fa-times'; // Fixed: using fa-times for cross
                }
            }
        };

        // Toggle Button Click
        newBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent document click from firing immediately
            e.preventDefault();
            toggleMenu();
        });

        // Close menu when clicking outside
        const closeOnOutsideClick = (e) => {
            if (navLinks.classList.contains('active') &&
                !navLinks.contains(e.target) &&
                !newBtn.contains(e.target)) {
                toggleMenu(true);
            }
        };

        // Remove potentially existing listeners to avoid duplicates (best effort)
        // Note: Generic addEventListener doesn't deduplicate anonymously, but replacing logic helps.
        // Since we can't reference the previous anonymous function easily, we rely on the fact 
        // that each reload/initNavigation() adds a new one. 
        // To be safe against multiple inits without reload, we could scope this better, 
        // but for now, simple addition is fine as long as logic is correct.
        document.addEventListener('click', closeOnOutsideClick);

        // Close menu when ANY link inside nav is clicked
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                toggleMenu(true);
            });
        });
    }

    // Auto-Highlight Active Link
    highlightActiveLink();
}

function highlightActiveLink() {
    const currentPath = window.location.pathname;
    const links = document.querySelectorAll('.nav-links a');

    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
            const linkFile = href.split('/').pop().split(/[?#]/)[0].toLowerCase();
            const currentFile = currentPath.split('/').pop().split(/[?#]/)[0].toLowerCase();

            // Robust matching
            const isHomeMatch = (currentFile === '' || currentFile === 'index.html' || currentFile === 'home.html') &&
                (linkFile === 'index.html' || linkFile === 'home.html');

            const isFileMatch = linkFile === currentFile && linkFile !== '';

            if (isFileMatch || isHomeMatch) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        }
    });
}

// Smooth Scroll for Anchor Links
function initSmoothScroll() {
    document.addEventListener('click', function (e) {
        const target = e.target.closest('a');
        if (target && target.getAttribute('href') && target.getAttribute('href').startsWith('#')) {
            e.preventDefault();
            const targetId = target.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // Close mobile menu if open
                const navLinks = document.querySelector('.nav-links');
                if (navLinks && navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    const mobileBtn = document.querySelector('.mobile-toggle i');
                    if (mobileBtn) {
                        mobileBtn.classList.remove('fa-times');
                        mobileBtn.classList.add('fa-bars');
                    }
                }
            }
        }
    });
}

// Expose to window for main.js orchestrator
window.Navigation = {
    loadComponents,
    initNavigation
};
