document.addEventListener('DOMContentLoaded', () => {
    loadFinalBooking();
    initVoucherActions();
});

function loadFinalBooking() {
    try {
        const finalBooking = getReceiptBooking();
        if (!finalBooking) return;
        renderVoucherUI(finalBooking);
    } catch (e) {
        console.error("Error loading final booking", e);
    }
}

function getReceiptBooking() {
    const currentRaw = localStorage.getItem('currentBooking');
    if (currentRaw) {
        const current = JSON.parse(currentRaw);
        if (current && (current.id || current.packageName)) return current;
    }

    const historyRaw = localStorage.getItem('beyondPyramids_bookings');
    const history = historyRaw ? JSON.parse(historyRaw) : [];
    if (!Array.isArray(history) || history.length === 0) return null;

    return history
        .filter(Boolean)
        .sort((a, b) => new Date(b.timestamp || b.createdAt || 0) - new Date(a.timestamp || a.createdAt || 0))[0];
}

function renderVoucherUI(booking) {
    // 1. Voucher Number
    const voucherNum = document.getElementById("voucher-number");
    if (voucherNum) voucherNum.textContent = booking.id;

    // 2. Trip Info
    const pkgNameEl = document.getElementById('val-package-name');
    const datesEl = document.getElementById('val-travel-dates');
    const travelersEl = document.getElementById('val-travelers');
    
    if (pkgNameEl) pkgNameEl.textContent = booking.packageName;
    if (datesEl) datesEl.textContent = booking.date;
    if (travelersEl) travelersEl.textContent = `${booking.travelers} Travelers (${booking.tier === 'full' ? 'Luxury' : 'Standard'})`;

    // 3. Itinerary List (Dynamic from AppStorage/MockData)
    const itineraryList = document.getElementById('val-itinerary-list');
    
    let allPkgs = [];
    if (window.AppStorage) {
        allPkgs = window.AppStorage.getPackages();
    } else if (window.MockData && window.MockData.packages) {
        allPkgs = window.MockData.packages;
    }

    const pkg = allPkgs.find(p => p.id === booking.packageId)
        || allPkgs.find(p => p.name === booking.packageName)
        || allPkgs.find(p => booking.packageName && p.name && p.name.toLowerCase() === booking.packageName.toLowerCase());
    if (itineraryList) {
        if (pkg && pkg.itinerary && pkg.itinerary.length > 0) {
            itineraryList.innerHTML = pkg.itinerary.map(step => `
                <li><strong>${step.day ? 'Day ' + step.day : 'Activity'}:</strong> ${step.title} - ${step.desc}</li>
            `).join('');
        } else if (pkg && pkg.dailyItinerary) { // Some packages use dailyItinerary string
            try {
                const days = JSON.parse(pkg.dailyItinerary);
                itineraryList.innerHTML = days.map(step => `
                    <li><strong>Day ${step.day}:</strong> ${step.title}</li>
                `).join('');
            } catch(e) {
                itineraryList.innerHTML = `<li><strong>Overview:</strong> ${pkg.description}</li>`;
            }
        } else if (pkg) {
            itineraryList.innerHTML = `<li><strong>Overview:</strong> ${pkg.description}</li>`;
        } else {
            itineraryList.innerHTML = `<li><strong>Status:</strong> Itinerary pending confirmation.</li>`;
        }
    }

    // 4. Receipt Payment Breakdown
    const receiptBody = document.querySelector('.receipt-body');
    if (receiptBody) {
        const travelers = parseInt(booking.travelers) || 1;
        const subtotal = resolveBookingTotal(booking, pkg, travelers);
        const perPerson = Math.round(subtotal / travelers);

        receiptBody.innerHTML = `
            <div class="receipt-line">
                <span>Base Package (${travelers} Traveler${travelers > 1 ? 's' : ''})</span>
                <span>EGP ${perPerson.toLocaleString()} &times; ${travelers}</span>
            </div>
            <div class="receipt-line">
                <span>Taxes &amp; Service Fees</span>
                <span>Included</span>
            </div>
            ${booking.tier === 'full' ? `
            <div class="receipt-line">
                <span>Luxury Upgrade (25% Premium)</span>
                <span>Included</span>
            </div>` : ''}
            <hr class="receipt-divider">
            <div class="receipt-line total-line">
                <span>Total Paid</span>
                <span>EGP ${subtotal.toLocaleString()}</span>
            </div>
            <p class="payment-method">Paid via Secure Wallet &bull; Egyptian Pound (EGP)</p>
        `;
    }
}

function resolveBookingTotal(booking, pkg, travelers) {
    const candidates = [
        booking.totalPrice,
        booking.price,
        booking.basePrice ? parseMoney(booking.basePrice) * travelers : null,
        pkg?.price ? parseMoney(pkg.price) * travelers : null,
        pkg?.discountedPrice ? parseMoney(pkg.discountedPrice) * travelers : null,
        pkg?.basePrice ? parseMoney(pkg.basePrice) * travelers : null
    ];

    for (const candidate of candidates) {
        const amount = parseMoney(candidate);
        if (amount > 0) return amount;
    }

    return 0;
}

function parseMoney(value) {
    if (value === null || value === undefined || value === '') return 0;
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;

    const parsed = parseFloat(String(value).replace(/[^0-9.-]+/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
}

function initVoucherActions() {
    // Print — relies entirely on @media print CSS to isolate the voucher
    const printBtn = document.getElementById("print-btn");
    if (printBtn) {
        printBtn.addEventListener("click", () => window.print());
    }

    // Copy
    const copyBtn = document.getElementById("copy-btn");
    if (copyBtn) {
        copyBtn.addEventListener("click", () => {
            const num = document.getElementById("voucher-number").textContent;
            navigator.clipboard.writeText(num);
            copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy ID', 2000);
        });
    }

    // Accordion Policy
    const accordionBtn = document.querySelector(".accordion-btn");
    const accordionContent = document.querySelector(".accordion-content");
    if (accordionBtn && accordionContent) {
        accordionBtn.addEventListener("click", () => {
            const isOpen = accordionContent.style.display === "block";
            accordionContent.style.display = isOpen ? "none" : "block";
            const arrow = accordionBtn.querySelector(".arrow");
            if (arrow) arrow.innerHTML = isOpen ? "&#9660;" : "&#9650;";
        });
    }

    // Force Light Mode text visibility via JS to bypass any CSS caching
    function enforceLightModeColors() {
        const isLight = document.documentElement.getAttribute("data-theme") === "light";
        const textElements = document.querySelectorAll('.editorial-title, .editorial-title span, .editorial-subtitle, .card-title, .info-row .label, .info-row .value, .itinerary-list li, .accordion-btn, .concierge-box h4, .concierge-box p, .concierge-link');
        
        textElements.forEach(el => {
            if (isLight) {
                el.style.setProperty("color", "#111111", "important");
            } else {
                el.style.removeProperty("color");
            }
        });

        // specific colors for labels/accents in light mode
        const accentElements = document.querySelectorAll('.info-row .label, .accordion-content strong');
        accentElements.forEach(el => {
            if (isLight) {
                el.style.setProperty("color", "#b88a44", "important");
            } else {
                el.style.removeProperty("color");
            }
        });
    }

    // Run once on load
    setTimeout(enforceLightModeColors, 100);

    // Watch for theme toggles
    const observer = new MutationObserver(enforceLightModeColors);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
}
