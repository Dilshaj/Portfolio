/**
 * Forms Logic
 * Handles all form submissions and modals involving forms.
 */

// Initialize all forms
function initForms() {
    initGenericForms();
    initCareerModal();
    initScheduleModal();
}

// Generic Form Handler (Contact, Newsletter, etc.)
function initGenericForms() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        // Avoid double-binding if already removed/added
        form.removeEventListener('submit', handleFormSubmit);
        form.addEventListener('submit', handleFormSubmit);
    });
}

async function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;

    // Status Container
    let statusDiv = form.querySelector('.form-status');
    if (!statusDiv) {
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
        let actionUrl = '/backend/contact.php'; // Hardcoded absolute path for safety

        const formData = new FormData(form);
        const finalActionUrl = actionUrl + '?t=' + new Date().getTime();

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
                const result = await response.json();
                if (result.status === 'success') {
                    statusDiv.innerHTML = `<span style="color: green;"><i class="fas fa-check-circle"></i> ${result.message}</span>`;
                    form.reset();

                    // Specific behavior for career modal
                    if (form.id === 'careerForm') {
                        setTimeout(() => {
                            const modal = document.getElementById('careerModal');
                            if (modal) modal.classList.remove('active');
                            statusDiv.innerHTML = '';
                        }, 2000);
                    }

                } else {
                    statusDiv.innerHTML = `<span style="color: red;"><i class="fas fa-exclamation-circle"></i> ${result.message}</span>`;
                }
            } else {
                const text = await response.text();
                console.error("Non-JSON response:", text.substring(0, 200));
                statusDiv.innerHTML = '<span style="color: red;">Error: Server returned unexpected format.</span>';
            }
        } else {
            statusDiv.innerHTML = `<span style="color: red;">Server Error (${response.status})</span>`;
        }
    } catch (error) {
        console.error("Form Error:", error);
        statusDiv.innerHTML = '<span style="color: red;">Network Error. Please try again.</span>';
    }

    if (btn) {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// Career Modal Logic
function initCareerModal() {
    const careerModal = document.getElementById('careerModal');
    if (!careerModal) return;

    const openBtns = document.querySelectorAll('.apply-btn, #btn-submit-call');
    const closeBtn = careerModal.querySelector('.modal-close');
    const roleInput = document.querySelector('input[name="role"]');

    openBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            careerModal.classList.add('active');

            // Prefill role if applicable
            if (roleInput) {
                const card = btn.closest('.position-card');
                if (card) {
                    const title = card.querySelector('.position-title');
                    if (title) roleInput.value = title.innerText;
                } else {
                    roleInput.value = '';
                }
            }
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            careerModal.classList.remove('active');
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === careerModal) {
            careerModal.classList.remove('active');
        }
    });
}

// Schedule Call Modal Logic
function initScheduleModal() {
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
}

window.Forms = {
    initForms
};
