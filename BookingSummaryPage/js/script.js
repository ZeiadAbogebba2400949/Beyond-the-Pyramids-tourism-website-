

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
        repairBookingPrice(activeBooking);
        localStorage.setItem('currentBooking', JSON.stringify(activeBooking));
        renderSummaryUI();
    } catch (e) {
        console.error("Error parsing booking data", e);
    }
}

function repairBookingPrice(booking) {
    if (!booking) return booking;

    const travelers = parseInt(booking.travelers) || 1;
    const existingTotal = parseMoney(booking.totalPrice);
    if (existingTotal > 0) {
        booking.totalPrice = existingTotal;
        return booking;
    }

    const pkg = findPackageForBooking(booking);
    const perPerson = parseMoney(booking.basePrice)
        || parseMoney(pkg?.discountedPrice)
        || parseMoney(pkg?.price)
        || parseMoney(pkg?.basePrice);

    if (perPerson > 0) {
        booking.basePrice = perPerson;
        booking.totalPrice = perPerson * travelers;
    }

    return booking;
}

function findPackageForBooking(booking) {
    const packages = getPackageCatalog();
    return packages.find(p => p.id === booking.packageId)
        || packages.find(p => p.name === booking.packageName)
        || packages.find(p => booking.packageName && p.name && p.name.toLowerCase() === booking.packageName.toLowerCase())
        || null;
}

function getPackageCatalog() {
    const packages = [];

    try {
        if (window.AppStorage && AppStorage.getPackages) packages.push(...(AppStorage.getPackages() || []));
    } catch (e) {}

    if (window.MockData && Array.isArray(MockData.packages)) {
        MockData.packages.forEach(pkg => {
            if (!packages.some(existing => existing.id === pkg.id)) packages.push(pkg);
        });
    }

    return packages;
}

function parseMoney(value) {
    if (value === null || value === undefined || value === '') return 0;
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    const parsed = parseFloat(String(value).replace(/[^0-9.-]+/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
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
            <div class="grid-item"><span class="grid-label">Total Travelers</span><span class="grid-value">${activeBooking.travelers}</span></div>
        `;
    }

    const travelersContainer = document.getElementById("travelers-content");
    if (travelersContainer) {
        let travelersHTML = '';
        
        // 1. Main User (Primary Booker)
        let mainUser = "Primary Booker";
        let mainEmail = activeBooking.userEmail || "N/A";
        let mainName = activeBooking.userName || "N/A";
        
        // Retrieve session if available for more details
        let session = null;
        try {
            if (window.AppStorage && window.AppStorage.getUserSession) {
                session = window.AppStorage.getUserSession();
            } else {
                const s = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');
                if (s) session = JSON.parse(s);
            }
        } catch (e) {}

        if (session && session.name) mainName = session.name;

        travelersHTML += `
            <div style="grid-column: 1 / -1; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border-color);">
                <h4 style="margin: 0 0 0.5rem 0; color: var(--primary-gold);">Traveler 1 (Primary)</h4>
                <div class="grid-item"><span class="grid-label">Name</span><span class="grid-value">${mainName}</span></div>
                <div class="grid-item"><span class="grid-label">Email</span><span class="grid-value">${mainEmail}</span></div>
            </div>
        `;

        // 2. Additional Travelers
        if (activeBooking.additionalTravelers && activeBooking.additionalTravelers.length > 0) {
            activeBooking.additionalTravelers.forEach(t => {
                travelersHTML += `
                    <div style="grid-column: 1 / -1; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border-color);">
                        <h4 style="margin: 0 0 0.5rem 0; color: var(--primary-dark);">Traveler ${t.index}</h4>
                        <div style="display: flex; gap: 2rem; flex-wrap: wrap;">
                            <div class="grid-item"><span class="grid-label">Name</span><span class="grid-value">${t.name}</span></div>
                            <div class="grid-item"><span class="grid-label">Date of Birth</span><span class="grid-value">${t.dob}</span></div>
                            <div class="grid-item"><span class="grid-label">Nationality</span><span class="grid-value">${t.nationality}</span></div>
                            ${t.phone ? `<div class="grid-item"><span class="grid-label">Phone</span><span class="grid-value">${t.phone}</span></div>` : ''}
                        </div>
                    </div>
                `;
            });
        }
        
        travelersContainer.innerHTML = travelersHTML;
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
                showPaymentSuccessModal(activeBooking.packageName || activeBooking.location || "your destination", () => {
                    const paidBooking = {
                        ...activeBooking,
                        status: 'confirmed',
                        paymentStatus: 'Paid'
                    };

                    let history = JSON.parse(localStorage.getItem('beyondPyramids_bookings') || '[]');
                    history.push(paidBooking);
                    localStorage.setItem('beyondPyramids_bookings', JSON.stringify(history));
                    localStorage.setItem('currentBooking', JSON.stringify(paidBooking));

                    window.location.href = "../BookingDetailsPage/booking-details.html";
                });
            }, 1500);
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener("click", () => {
            showCancelRequestModal();
        });
    }
}

function showCancelRequestModal() {
    const existing = document.getElementById('cancel-request-modal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'cancel-request-modal';
    overlay.className = 'modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'cancel-modal-title');

    overlay.innerHTML = `
        <div class="modal-content login-required-modal">
            <div class="modal-header">
                <h2 id="cancel-modal-title"><i class="fas fa-rotate-left"></i> Cancel Request</h2>
            </div>
            <p class="login-required-message">This will discard the current booking summary and return you to the package details page.</p>
            <div class="modal-actions">
                <button type="button" id="cancel-modal-keep-btn" class="btn btn--outline">Keep Booking</button>
                <button type="button" id="cancel-modal-confirm-btn" class="btn btn--primary">Return to Package</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    const closeModal = () => {
        overlay.remove();
        document.body.style.overflow = '';
    };

    document.getElementById('cancel-modal-keep-btn')?.addEventListener('click', closeModal);
    document.getElementById('cancel-modal-confirm-btn')?.addEventListener('click', () => {
        const targetUrl = getCancelReturnUrl();
        localStorage.removeItem('currentBooking');
        window.location.href = targetUrl;
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });
}

function getCancelReturnUrl() {
    if (!activeBooking) return "../DayPackages/dayPackages.html";

    if (activeBooking.isCustom) {
        return "../CustomTripBuilderPage/CustomTripBuilderPage.html";
    }

    if (activeBooking.packageId) {
        const params = new URLSearchParams({ id: activeBooking.packageId });
        if (activeBooking.tier) params.set('tier', activeBooking.tier);
        return "../PackageDetailsPage/package-details.html?" + params.toString();
    }

    return "../DayPackages/dayPackages.html";
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
        <p style="color: var(--color-text-secondary); margin-bottom: 2rem; line-height: 1.5;">Your booking for <strong>${location}</strong> is now secured.</p>
        <button id="modal-continue-btn" class="btn btn--primary" style="width: 100%;">View Booking Receipt</button>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    document.getElementById('modal-continue-btn').addEventListener('click', () => {
        document.body.removeChild(overlay);
        callback();
    });
}
