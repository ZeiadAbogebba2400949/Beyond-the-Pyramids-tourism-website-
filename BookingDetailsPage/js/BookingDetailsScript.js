document.addEventListener('DOMContentLoaded', () => {
    loadFinalBooking();
    initVoucherActions();
});

function loadFinalBooking() {
    const historyRaw = localStorage.getItem('beyondPyramids_bookings');
    if (!historyRaw) return;

    try {
        const history = JSON.parse(historyRaw);
        if (history.length === 0) return;

        const finalBooking = history[history.length - 1];
        renderVoucherUI(finalBooking);
    } catch (e) {
        console.error("Error loading final booking", e);
    }
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

    const pkg = allPkgs.find(p => p.id === booking.packageId);
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
        // Fallback for older bookings that used price instead of totalPrice
        const rawPrice = booking.totalPrice || booking.price || 0;
        
        // Remove currency symbols or commas if stored as string, then parse
        const subtotal = typeof rawPrice === 'string' 
            ? parseFloat(rawPrice.replace(/[^0-9.-]+/g, "")) 
            : parseFloat(rawPrice);

        const travelers = parseInt(booking.travelers) || 1;
        const perPerson = Math.round(subtotal / travelers);

        receiptBody.innerHTML = `
            <div class="receipt-line">
                <span>Base Package (${booking.travelers} Traveler${booking.travelers > 1 ? 's' : ''})</span>
                <span>EGP ${perPerson.toLocaleString()} &times; ${booking.travelers}</span>
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
        const textElements = document.querySelectorAll('.editorial-title, .editorial-subtitle, .card-title, .info-row .label, .info-row .value, .itinerary-list li, .accordion-btn, .concierge-box h4, .concierge-box p, .concierge-link');
        
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