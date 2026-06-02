document.addEventListener("DOMContentLoaded", function() {
    
    const contactForm = document.getElementById("contact-form");
    const submitBtn = document.querySelector(".btn--primary");

    // ── Inline error helpers ──────────────────────────────────────────────
    function showFieldError(input, msg) {
        let errEl = input.parentElement.querySelector('.field-error');
        if (!errEl) {
            errEl = document.createElement('span');
            errEl.className = 'field-error';
            errEl.style.cssText = 'color:#e05260;font-size:0.78rem;display:block;margin-top:4px;';
            input.parentElement.appendChild(errEl);
        }
        errEl.textContent = msg;
        input.style.borderColor = 'var(--color-danger, #e05260)';
    }

    function clearFieldError(input) {
        const errEl = input.parentElement.querySelector('.field-error');
        if (errEl) errEl.textContent = '';
        input.style.borderColor = '';
    }

    function validateContactForm() {
        let valid = true;

        const name    = document.getElementById('name');
        const email   = document.getElementById('email');
        const subject = document.getElementById('subject');
        const message = document.getElementById('message');

        clearFieldError(name); clearFieldError(email);
        clearFieldError(subject); clearFieldError(message);

        if (!name.value.trim()) {
            showFieldError(name, 'Full name is required.'); valid = false;
        } else if (name.value.trim().length < 2) {
            showFieldError(name, 'Name must be at least 2 characters.'); valid = false;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.value.trim()) {
            showFieldError(email, 'Email address is required.'); valid = false;
        } else if (!emailPattern.test(email.value.trim())) {
            showFieldError(email, 'Please enter a valid email address.'); valid = false;
        }

        if (!subject.value.trim()) {
            showFieldError(subject, 'Subject is required.'); valid = false;
        } else if (subject.value.trim().length < 3) {
            showFieldError(subject, 'Subject must be at least 3 characters.'); valid = false;
        }

        if (!message.value.trim()) {
            showFieldError(message, 'Message is required.'); valid = false;
        } else if (message.value.trim().length < 10) {
            showFieldError(message, 'Message must be at least 10 characters.'); valid = false;
        }

        return valid;
    }

    // Live validation on blur
    ['name', 'email', 'subject', 'message'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('blur', () => validateContactForm());
            el.addEventListener('input', () => {
                clearFieldError(el);
                el.style.borderColor = '';
            });
        }
    });

    if (contactForm) {
        contactForm.addEventListener("submit", function(event) {
            event.preventDefault();

            if (!validateContactForm()) return;

            const originalText = submitBtn.textContent;
            submitBtn.textContent = "Dispatching inquiry...";
            submitBtn.style.opacity = "0.7";
            submitBtn.style.pointerEvents = "none";

            setTimeout(function() {
                showInquirySuccess();
                contactForm.reset();
                submitBtn.textContent = originalText;
                submitBtn.style.opacity = "1";
                submitBtn.style.pointerEvents = "all";
            }, 1500);
        });
    }

    function showInquirySuccess() {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'glass-card inquiry-success-alert';
        alertDiv.style.position = 'fixed';
        alertDiv.style.top = '100px';
        alertDiv.style.right = '20px';
        alertDiv.style.padding = '20px 30px';
        alertDiv.style.borderLeft = '4px solid var(--gold-primary)';
        alertDiv.style.boxShadow = 'var(--shadow-lg)';
        alertDiv.style.zIndex = '10000';
        alertDiv.style.color = 'var(--text-primary)';
        alertDiv.style.animation = 'revealUp 0.5s ease forwards';
        
        alertDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px;">
                <i class="fas fa-check-circle" style="color: var(--gold-primary); font-size: 1.5rem;"></i>
                <div>
                    <strong style="display: block; font-family: var(--font-display);">Inquiry Dispatched</strong>
                    <span style="font-size: 14px; opacity: 0.8;">Our concierge will contact you within 24 hours.</span>
                </div>
            </div>
        `;

        document.body.appendChild(alertDiv);

        setTimeout(() => {
            alertDiv.style.opacity = '0';
            alertDiv.style.transform = 'translateY(-20px)';
            alertDiv.style.transition = 'all 0.5s ease';
            setTimeout(() => alertDiv.remove(), 500);
        }, 4000);
    }

});
