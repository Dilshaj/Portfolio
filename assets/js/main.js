// Main JS - Shared Logic

// Load Header and Footer dynamically
async function loadComponents() {
    try {
        const headerPlaceholder = document.getElementById('header-container');
        const footerPlaceholder = document.getElementById('footer-placeholder');

        // Determine base path based on current location
        const isPagesDir = window.location.pathname.includes('/pages/');
        const basePath = isPagesDir ? '../assets' : './assets';

        // Load Header
        if (headerPlaceholder) {
            const headerRes = await fetch(`${basePath}/components/header.html`);
            if (headerRes.ok) {
                let headerHtml = await headerRes.text();

                // header.html uses "../assets/" and "../pages/" by default (optimized for subdirectories)

                if (!isPagesDir) {
                    // We are in the root (index.html), so we must STRIP the "../" prefix
                    headerHtml = headerHtml.replace(/\.\.\/assets\//g, 'assets/')
                        .replace(/\.\.\/pages\//g, 'pages/')
                        .replace(/\.\.\/index\.html/g, 'index.html');
                }
                // Else: We are in pages/ directory. The default "../" paths in header.html are already correct.
                // No need to add extra "../" like the previous code did.

                headerPlaceholder.innerHTML = headerHtml;
            } else {
                console.error(`Failed to load header from ${basePath}/components/header.html`);
            }
        }

        // Load Footer
        if (footerPlaceholder) {
            const footerRes = await fetch(`${basePath}/components/footer.html`);
            if (footerRes.ok) {
                let footerHtml = await footerRes.text();

                // Fix relative paths for footer
                if (!isPagesDir) {
                    // Strip "../" for root usage
                    footerHtml = footerHtml.replace(/\.\.\/assets\//g, 'assets/')
                        .replace(/\.\.\/pages\//g, 'pages/');
                }

                footerPlaceholder.innerHTML = footerHtml;
            }
        }

        // Initialize features after DOM updates
        initNavigation();
        initGlobalInteractions();

    } catch (error) {
        console.error('Error loading components:', error);
    }
}

document.addEventListener('DOMContentLoaded', loadComponents);


// Initialize Navigation Logic (Call this after header injection)
function initNavigation() {
    console.log('Initializing Navigation...');

    // Mobile Menu Toggle
    const mobileBtn = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileBtn && navLinks) {
        // Clone to remove old listeners
        const newBtn = mobileBtn.cloneNode(true);
        mobileBtn.parentNode.replaceChild(newBtn, mobileBtn);

        // Helper to Toggle Menu
        const toggleMenu = (forceClose = false) => {
            const icon = newBtn.querySelector('i');
            const isActive = navLinks.classList.contains('active');

            if (forceClose) {
                if (isActive) {
                    navLinks.classList.remove('active');
                    if (icon) icon.className = 'fas fa-bars';
                }
            } else {
                if (isActive) {
                    navLinks.classList.remove('active');
                    if (icon) icon.className = 'fas fa-bars';
                } else {
                    navLinks.classList.add('active');
                    if (icon) icon.className = 'fas fa-times'; // Using fa-times for cross
                }
            }
        };

        // Toggle Button Click
        newBtn.addEventListener('click', (e) => {
            e.stopPropagation();
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
        // Ensure we don't stack listeners excessively (though main.js init implies fresh state often)
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
    const currentPath = window.location.pathname;
    const links = document.querySelectorAll('.nav-links a');

    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
            const linkFile = href.split('/').pop().split(/[?#]/)[0].toLowerCase();
            const currentFile = currentPath.split('/').pop().split(/[?#]/)[0].toLowerCase();

            // Robust matching
            // 1. Exact filename match
            // 2. Home page handling
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

// Initialize Global Common Interactions
function initGlobalInteractions() {
    console.log('Global JS Loaded');

    // Smooth Scroll for Anchor Links
    document.addEventListener('click', function (e) {
        if (e.target.tagName === 'A' && e.target.getAttribute('href') && e.target.getAttribute('href').startsWith('#')) {
            e.preventDefault();
            const targetId = e.target.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });

    // Form Handling (PHP Backend)
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            // Status Container
            let statusDiv = form.querySelector('.form-status');
            if (!statusDiv) {
                // If not found, create one
                statusDiv = document.createElement('div');
                statusDiv.className = 'form-status';
                statusDiv.style.marginTop = '10px';
                statusDiv.style.fontSize = '14px';
                form.appendChild(statusDiv);
            }

            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn ? btn.innerHTML : 'Submit';

            if (btn) {
                btn.innerHTML = 'Sending... <i class="fas fa-spinner fa-spin"></i>';
                btn.disabled = true;
            }

            try {
                // Determine Action URL
                let actionUrl = form.getAttribute('action'); // Get raw attribute value, not absolute URL

                // Fix path for pages/ directory
                if (window.location.pathname.includes('/pages/') && actionUrl) {
                    if (actionUrl === 'contact.php') {
                        actionUrl = '../backend/contact.php';
                    } else if (actionUrl.startsWith('assets/') || actionUrl.startsWith('backend/')) {
                        actionUrl = '../' + actionUrl;
                    }
                }

                // Fallback to form.action if attribute is complex or absolute
                if (!actionUrl) actionUrl = form.action;

                const formData = new FormData(form);
                // Add cache buster to avoid browser caching issues with the PHP script
                const finalActionUrl = actionUrl + (actionUrl.includes('?') ? '&' : '?') + 't=' + new Date().getTime();

                const response = await fetch(finalActionUrl, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    const contentType = response.headers.get("content-type");
                    if (contentType && contentType.indexOf("application/json") !== -1) {
                        try {
                            const result = await response.json();
                            if (result.status === 'success') {
                                statusDiv.innerHTML = `<span style="color: green;"><i class="fas fa-check-circle"></i> ${result.message}</span>`;
                                form.reset();
                            } else {
                                statusDiv.innerHTML = `<span style="color: red;"><i class="fas fa-exclamation-circle"></i> ${result.message}</span>`;
                            }
                        } catch (e) {
                            console.error("JSON Parse Error despite JSON header:", e);
                            statusDiv.innerHTML = `<span style="color: red;">Error: Server sent invalid JSON. Check console.</span>`;
                        }
                    } else {
                        // Response is OK but not JSON (likely HTML file returned by Live Server or PHP error)
                        const text = await response.text();
                        console.error("Expected JSON, but received:", text.substring(0, 500)); // Log first 500 chars
                        if (text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) {
                            statusDiv.innerHTML = '<span style="color: red;">Error: Server returned HTML instead of JSON. <br>Ensure you are running on a PHP server (e.g., XAMPP).</span>';
                        } else {
                            statusDiv.innerHTML = '<span style="color: red;">Error: Invalid server response. See console.</span>';
                        }
                    }
                } else {
                    // Handle HTTP Errors specifically
                    // ... (rest of error handling)
                    if (response.status === 405) {
                        statusDiv.innerHTML = '<span style="color: red;">Error 405: Method Not Allowed. <br>Static servers (Live Server) cannot send emails. Use XAMPP/WAMP.</span>';
                    } else if (response.status === 404) {
                        statusDiv.innerHTML = '<span style="color: red;">Error 404: contact.php not found. Check file path.</span>';
                    } else {
                        statusDiv.innerHTML = `<span style="color: red;">Server Error (${response.status}). Please try again later.</span>`;
                    }
                }
            } catch (error) {
                console.error("Form Submission Error:", error);
                statusDiv.innerHTML = '<span style="color: red;">Network or Script Error. Check console for details.</span>';
            }

            if (btn) {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    });
}

// Animations (Intersection Observer)
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Optional: stop observing once visible
            // observer.unobserve(entry.target); 
        }
    });
}, observerOptions);

// Function to attach observer to elements
function observeElements(selector) {
    document.querySelectorAll(selector).forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Add CSS class for visibility
const style = document.createElement('style');
style.innerHTML = `
    .visible { opacity: 1 !important; transform: translateY(0) !important; }
`;
document.head.appendChild(style);


// --- Additional Logic from Home Script ---

// Career Section Flip Logic
function toggleFlip(cardId) {
    const card = document.getElementById(cardId);
    if (card) {
        card.classList.toggle('flipped');
    }
}

// Services Scroll Pagination Logic
document.addEventListener('DOMContentLoaded', () => {
    const servicesGrid = document.querySelector('.services-grid');
    const serviceDots = document.querySelectorAll('.mobile-dots-container .mobile-dot');

    if (servicesGrid && serviceDots.length > 0) {
        servicesGrid.addEventListener('scroll', () => {
            const scrollLeft = servicesGrid.scrollLeft;
            const card = servicesGrid.querySelector('.service-card-custom');
            if (card) {
                const cardWidth = card.offsetWidth;
                const gap = 20; // Explicitly using the gap value from CSS
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
});

// Schedule Call Modal Logic (Projects Page)
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('scheduleModal');
    const openBtn = document.getElementById('btn-schedule-call');
    const closeBtn = document.querySelector('.modal-close');

    if (modal && openBtn) {
        openBtn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.add('active');
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('active');
            });
        }

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }
});

// Career Application Modal Logic
document.addEventListener('DOMContentLoaded', () => {
    const careerModal = document.getElementById('careerModal');
    const careerOpenBtn = document.getElementById('btn-submit-call'); // Bottom CTA
    const jobApplyBtns = document.querySelectorAll('.apply-btn'); // Individual Job Cards
    const careerCloseBtn = careerModal ? careerModal.querySelector('.modal-close') : null;
    const careerForm = document.getElementById('careerForm');

    function openCareerModal(e) {
        e.preventDefault();

        // Auto-fill Role if clicked from a job card
        const roleInput = careerForm.querySelector('input[name="role"]');
        const cardCallback = e.currentTarget.closest('.position-card');

        if (roleInput) {
            if (cardCallback) {
                const title = cardCallback.querySelector('.position-title').innerText;
                roleInput.value = title;
            } else {
                roleInput.value = ''; // Clear if not from a card (e.g. bottom CTA)
            }
        }

        if (careerModal) careerModal.classList.add('active');
    }

    if (careerModal) {
        // Open via Bottom CTA
        if (careerOpenBtn) {
            careerOpenBtn.addEventListener('click', openCareerModal);
        }

        // Open via Job Card Buttons (Apply Now)
        if (jobApplyBtns.length > 0) {
            jobApplyBtns.forEach(btn => {
                btn.addEventListener('click', openCareerModal);
            });
        }

        // Close via X
        if (careerCloseBtn) {
            careerCloseBtn.addEventListener('click', () => {
                careerModal.classList.remove('active');
            });
        }

        // Close via Outside Click
        window.addEventListener('click', (e) => {
            if (e.target === careerModal) {
                careerModal.classList.remove('active');
            }
        });

        // AJAX Form Submission
        if (careerForm) {
            careerForm.addEventListener('submit', async function (e) {
                e.preventDefault();
                const btn = careerForm.querySelector('button[type="submit"]');
                const originalText = btn.innerHTML;

                btn.innerHTML = 'Sending...';
                btn.disabled = true;

                const formData = new FormData(careerForm);

                try {
                    const response = await fetch(careerForm.action, {
                        method: 'POST',
                        body: formData
                    });

                    // Check if response is JSON
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        const result = await response.json();

                        if (result.status === 'success') {
                            btn.innerHTML = 'Sent Successfully!';
                            btn.style.background = '#10b981'; // Green

                            // Auto-close after 2 seconds
                            setTimeout(() => {
                                careerModal.classList.remove('active');
                                careerForm.reset();
                                btn.innerHTML = originalText;
                                btn.style.background = ''; // Reset color
                                btn.disabled = false;
                            }, 2000);
                        } else {
                            alert('Error: ' + result.message);
                            btn.innerHTML = originalText;
                            btn.disabled = false;
                        }
                    } else {
                        throw new Error('Server returned non-JSON response');
                    }
                } catch (error) {
                    console.error('Submission Error:', error);
                    alert('There was an error sending your application. Please try again.');
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }
            });
        }
    }
});

