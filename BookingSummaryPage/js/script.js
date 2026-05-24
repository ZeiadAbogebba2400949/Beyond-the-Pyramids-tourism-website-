

let activeBooking = null;

document.addEventListener('DOMContentLoaded', () => {
    loadBookingFromStorage();
    setupEventListeners();
});

function loadBookingFromStorage() {
    const raw = localStorage.getItem('currentBooking');
    if (!raw) {
        
        console.warn("No active booking session found.");
        return;
    }

    try {
        activeBooking = JSON.parse(raw);
        renderSummaryUI();
    } catch (e) {
        console.error("Error parsing booking data", e);
    }
}

function renderSummaryUI() {
    if (!activeBooking) return;

    // Display booking reference
    const refElement = document.getElementById("ref-number");
    if (refElement) refElement.textContent = activeBooking.id;

    const statusElement = document.getElementById("status-text");
    if (statusElement) {
        statusElement.textContent = "Confirmed";
        statusElement.className = "status-badge confirmed";
    }

    // Booking details
    const detailsContainer = document.getElementById("details-content");
    if (detailsContainer) {
        detailsContainer.innerHTML = `
            <div class="grid-item"><span class="grid-label">Package</span><span class="grid-value">${activeBooking.packageName}</span></div>
            <div class="grid-item"><span class="grid-label">Location</span><span class="grid-value">${activeBooking.location}</span></div>
            <div class="grid-item"><span class="grid-label">Date</span><span class="grid-value">${activeBooking.date}</span></div>
            <div class="grid-item"><span class="grid-label">Tier</span><span class="grid-value">${activeBooking.tier === 'full' ? 'Complete Luxury' : 'Tour Only'}</span></div>
            <div class="grid-item"><span class="grid-label">Travelers</span><span class="grid-value">${activeBooking.travelers}</span></div>
        `;
    }

    
    const priceContainer = document.getElementById("price-content");
    if (priceContainer) {
        const perPerson = activeBooking.totalPrice / activeBooking.travelers;
        priceContainer.innerHTML = `
            <div class="price-line">
                <span>Base (${activeBooking.tier})</span>
                <span>EGP ${perPerson.toLocaleString()} &times; ${activeBooking.travelers}</span>
            </div>
            <div class="price-line">
                <span>Taxes & Fees</span>
                <span>Included</span>
            </div>
            <div class="price-line total">
                <span>Total Amount</span>
                <span>EGP ${activeBooking.totalPrice.toLocaleString()}</span>
            </div>
        `;
    }
}

function setupEventListeners() {
    const confirmBtn = document.getElementById("confirm-booking");
    const paymentBtn = document.getElementById("payment-booking");
    const cancelBtn = document.getElementById("cancel-booking");

    // Hide the manual confirm button — booking is already confirmed automatically
    if (confirmBtn) {
        confirmBtn.style.display = 'none';
    }

    // Payment button is immediately active
    if (paymentBtn) {
        paymentBtn.disabled = false;
        paymentBtn.addEventListener("click", () => {
            paymentBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            
            setTimeout(() => {
                // Show custom modal instead of alert
                showPaymentSuccessModal(activeBooking.location, () => {
                    let history = JSON.parse(localStorage.getItem('beyondPyramids_bookings') || '[]');
                    history.push({
                        ...activeBooking,
                        status: 'Confirmed',
                        paymentStatus: 'Paid'
                    });
                    localStorage.setItem('beyondPyramids_bookings', JSON.stringify(history));

                    window.location.href = "../BookingDetailsPage/booking-details.html";
                });
            }, 1500);
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener("click", () => {
            if (confirm("Are you sure you want to cancel this selection?")) {
                localStorage.removeItem('currentBooking');
                window.location.href = "../LandingPage/LandingPage.html";
            }
        });
    }
}

function showPaymentSuccessModal(location, callback) {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.6)';
    overlay.style.zIndex = '9999';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.backdropFilter = 'blur(5px)';

    const modal = document.createElement('div');
    modal.style.background = 'var(--color-surface, #fff)';
    modal.style.color = 'var(--color-text, #000)';
    modal.style.padding = '3rem 2rem';
    modal.style.borderRadius = '8px';
    modal.style.textAlign = 'center';
    modal.style.boxShadow = '0 20px 50px rgba(0,0,0,0.3)';
    modal.style.maxWidth = '400px';
    modal.style.width = '90%';
    modal.style.animation = 'revealUp 0.4s ease forwards';

    modal.innerHTML = `
        <div style="font-size: 3.5rem; color: var(--color-gold, #d4af37); margin-bottom: 1rem;">
            <i class="fas fa-check-circle"></i>
        </div>
        <h2 style="font-family: var(--font-heading, serif); font-size: 1.8rem; margin-bottom: 0.5rem;">Payment Successful</h2>
        <p style="color: var(--color-text-secondary); margin-bottom: 2rem; line-height: 1.5;">Your luxury journey to <strong>${location}</strong> is now secured.</p>
        <button id="modal-continue-btn" class="btn btn--primary" style="width: 100%;">View Booking Receipt</button>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    document.getElementById('modal-continue-btn').addEventListener('click', () => {
        document.body.removeChild(overlay);
        callback();
    });
}
