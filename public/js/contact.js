document.addEventListener("DOMContentLoaded", function() {

    const contactForm = document.getElementById("contact-form");
    const submitBtn = document.querySelector(".btn--primary");

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
        contactForm.addEventListener("submit", async function(event) {
            event.preventDefault();
            if (!validateContactForm()) return;

            const originalText = submitBtn.textContent;
            submitBtn.textContent = "Dispatching inquiry...";
            submitBtn.disabled = true;

            try {
                const res = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        name:     document.getElementById('name').value.trim(),
                        email:    document.getElementById('email').value.trim(),
                        subject:  document.getElementById('subject').value.trim(),
                        message:  document.getElementById('message').value.trim(),
                        category: document.getElementById('category')?.value || 'General',
                    }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Submission failed');

                showInquirySuccess();
                contactForm.reset();
                loadMyTickets();
            } catch (err) {
                const msgEl = document.getElementById('message');
                if (msgEl) showFieldError(msgEl, err.message);
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    function escHtml(s) {
        return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    function loadMyTickets() {
        const container = document.getElementById('my-tickets-container');
        if (!container) return;
        fetch('/api/contact/my-tickets', { credentials: 'include' })
            .then(r => r.json())
            .then(data => {
                const tickets = data.data?.tickets || [];
                if (!tickets.length) {
                    container.innerHTML = '<p style="opacity:0.6;">You have not sent any inquiries yet.</p>';
                    return;
                }
                container.innerHTML = tickets.map(t => `
                    <div class="glass-card" style="margin-bottom:1rem;padding:1.25rem;">
                        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem;margin-bottom:0.5rem;">
                            <strong>${escHtml(t.subject)}</strong>
                            <span style="padding:4px 14px;border-radius:20px;font-size:0.78rem;font-weight:600;
                                background:${t.status==='resolved'?'rgba(52,199,89,0.15)':'rgba(255,149,0,0.15)'};
                                color:${t.status==='resolved'?'#34c759':'#ff9500'};">
                                ${t.status==='resolved'?'Resolved':'Open'}
                            </span>
                        </div>
                        <p style="font-size:0.85rem;opacity:0.7;margin:0;">${escHtml(t.message)}</p>
                        ${t.adminReply ? `<div style="border-left:3px solid var(--gold-primary);padding-left:0.75rem;margin-top:0.75rem;font-size:0.85rem;">
                            <strong>Admin Reply:</strong><br>${escHtml(t.adminReply)}
                        </div>` : ''}
                    </div>
                `).join('');
            })
            .catch(() => { container.innerHTML = '<p style="opacity:0.6;">Could not load inquiries.</p>'; });
    }

    loadMyTickets();

    function showInquirySuccess() {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'glass-card inquiry-success-alert';
        alertDiv.style.cssText = 'position:fixed;top:100px;right:20px;padding:20px 30px;border-left:4px solid var(--gold-primary);box-shadow:var(--shadow-lg);z-index:10000;color:var(--text-primary);animation:revealUp 0.5s ease forwards;';
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
