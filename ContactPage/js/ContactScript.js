document.addEventListener("DOMContentLoaded", function() {
    
    const contactForm = document.getElementById("contact-form");
    const submitBtn = document.querySelector(".btn--primary");

    if (contactForm) {
        contactForm.addEventListener("submit", function(event) {
            
            event.preventDefault();

            
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