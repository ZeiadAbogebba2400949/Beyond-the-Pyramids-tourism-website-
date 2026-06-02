/* ═══════════════════════════════════════════════════════════
   myBookings.js
   Dynamic user bookings history using localStorage & MockData
═══════════════════════════════════════════════════════════ */

'use strict';

let currentBookings = [];
let filteredBookings = [];

const bookingsList    = document.getElementById('bookingsList');
const statusFilter    = document.getElementById('statusFilter');
const typeFilter      = document.getElementById('typeFilter');
const modal           = document.getElementById('detailsModal');
const modalBody       = document.getElementById('modalBody');
const closeModal      = document.querySelector('.close-modal');

const statusClasses = {
    'confirmed': 'status--confirmed',
    'checked-in': 'status--checked-in',
    'checked-out': 'status--checked-out',
    'cancelled': 'status--cancelled',
    'canceled': 'status--cancelled'
};

const statusLabels = {
    'confirmed': 'Confirmed',
    'checked-in': 'Checked In',
    'checked-out': 'Checked Out',
    'cancelled': 'Cancelled',
    'canceled': 'Cancelled'
};

// ── Authentication & Init ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
    if (window.LoginGate && !LoginGate.requireLogin({ message: 'You must be logged in to view your journeys.' })) {
        return;
    }

    const session = getSession();
    if (!session || !session.email) {
        return;
    }

    loadBookings(session.email);
    attachEventListeners();
});

function getSession() {
    try {
        const s = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');
        return s ? JSON.parse(s) : null;
    } catch (e) { return null; }
}

// ── Data Loading ───────────────────────────────────────────────────────────
function loadBookings(email) {
    if (window.AppStorage && window.AppStorage.getUserBookings) {
        currentBookings = window.AppStorage.getUserBookings(email);
    } else {
        currentBookings = [];
    }

    filteredBookings = [...currentBookings];
    renderBookings();
}

function getComputedBookingStatus(dateString, baseStatus) {
    const lowerStatus = (baseStatus || 'confirmed').toLowerCase();
    if (lowerStatus === 'cancelled' || lowerStatus === 'canceled') return 'cancelled';
    
    if (!dateString) return lowerStatus;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const start = new Date(dateString);
    start.setHours(0, 0, 0, 0);
    
    if (today < start) return 'confirmed';
    if (today.getTime() === start.getTime()) return 'checked-in';
    return 'checked-out';
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
        return dateString;
    }
}

function getBookingType(booking) {
    if (booking.isCustom) return 'custom';

    const rawType = [
        booking.tripType,
        booking.packageType,
        booking.type,
        booking.category,
        booking.packageName,
        booking.tripName
    ].filter(Boolean).join(' ').toLowerCase();

    if (rawType.includes('custom') || rawType.includes('architect')) return 'custom';
    if (rawType.includes('single') || rawType.includes('location')) return 'single';
    if (rawType.includes('week') || rawType.includes('weekly') || rawType.includes('multi')) return 'week';
    return 'day';
}

function getBookingTypeLabel(type) {
    const labels = {
        day: 'Day Package',
        week: 'Week Package',
        single: 'Single Location',
        custom: 'Custom Trip'
    };

    return labels[type] || 'Day Package';
}

// ── Rendering ──────────────────────────────────────────────────────────────
function renderBookings() {
    if (filteredBookings.length === 0) {
        bookingsList.innerHTML = `
            <div class="empty-state glass-card" style="text-align:center; padding:4rem 2rem;">
                <i class="fas fa-suitcase-rolling" style="font-size:3rem; color:var(--color-text-muted); margin-bottom:1rem; opacity:0.5;"></i>
                <h3 style="margin-bottom:0.5rem; font-size:1.5rem;">No Journeys Found</h3>
                <p style="color:var(--color-text-secondary); margin-bottom:1.5rem;">Your travel journal is currently empty. Start your next adventure today.</p>
                <a href="../DayPackages/dayPackages.html" class="btn btn--primary">Explore Packages</a>
            </div>
        `;
        return;
    }
    
    bookingsList.innerHTML = '';
    
    filteredBookings.forEach(booking => {
        const card = createBookingCard(booking);
        bookingsList.appendChild(card);
    });
}

function createBookingCard(booking) {
    const card = document.createElement('div');
    card.className = 'booking-card glass-card';
    card.setAttribute('data-id', booking.id || booking.bookingId || '');
    
    const rawDate = booking.date || booking.travelDate || booking.bookingDate || booking.timestamp;
    const computedStatus = getComputedBookingStatus(rawDate, booking.status);
    const statusClass = statusClasses[computedStatus] || '';
    const statusLabel = statusLabels[computedStatus] || computedStatus.toUpperCase();
    
    const title = booking.packageName || booking.tripName || 'Package Booking';
    const type = getBookingTypeLabel(getBookingType(booking));
    const refId = booking.bookingNumber || booking.id || booking.bookingId || 'N/A';
    
    let placesText = booking.location || booking.city;
    if (!placesText && booking.places) {
        placesText = Array.isArray(booking.places) ? booking.places.join(', ') : booking.places;
    }
    if (!placesText) placesText = 'Various Locations';
    
    const pCount = booking.travelers || booking.peopleCount || 1;
    const tPrice = booking.totalPrice ? 'EGP ' + Number(booking.totalPrice).toLocaleString() : 'N/A';

    card.innerHTML = `
        <div class="booking-header">
            <div class="booking-main-info">
                <span class="booking-type">${type}</span>
                <span class="booking-status ${statusClass}">${statusLabel}</span>
            </div>
            <div class="booking-id">REF: ${refId}</div>
        </div>
        <div class="booking-body">
            <h3 style="margin-bottom:0.5rem;">${title}</h3>
            <p style="color:var(--color-text-secondary); font-size:var(--text-sm);">${placesText}</p>
            
            <div class="booking-info-grid">
                <div class="info-item">
                    <span class="info-label">Arrival</span>
                    <span class="info-value">${formatDate(rawDate)}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Explorers</span>
                    <span class="info-value">${pCount} ${pCount > 1 ? 'People' : 'Person'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Total Investment</span>
                    <span class="info-value" style="color:var(--gold-primary); font-weight:700;">${tPrice}</span>
                </div>
            </div>
        </div>
        <div class="booking-footer">
            <button class="view-details-btn btn btn--outline">View Journey Manifesto</button>
        </div>
    `;
    
    return card;
}

// ── Filtering ──────────────────────────────────────────────────────────────
function filterBookings() {
    const statusValue = statusFilter?.value || 'all';
    const typeValue = typeFilter?.value || 'all';

    filteredBookings = currentBookings.filter(booking => {
        const rawDate = booking.date || booking.travelDate || booking.bookingDate || booking.timestamp;
        const matchesStatus = statusValue === 'all' || getComputedBookingStatus(rawDate, booking.status) === statusValue;
        const matchesType = typeValue === 'all' || getBookingType(booking) === typeValue;

        return matchesStatus && matchesType;
    });

    renderBookings();
}

// ── Modal Details ──────────────────────────────────────────────────────────
function showDetails(bookingId) {
    const booking = currentBookings.find(b => (b.id === bookingId || b.bookingId === bookingId || b.bookingNumber === bookingId));
    if (!booking) return;
    
    const rawDate = booking.date || booking.travelDate || booking.bookingDate || booking.timestamp;
    const computedStatus = getComputedBookingStatus(rawDate, booking.status);
    const statusLabel = statusLabels[computedStatus] || computedStatus.toUpperCase();
    
    let placesText = booking.location || booking.city;
    if (!placesText && booking.places) {
        placesText = Array.isArray(booking.places) ? booking.places.join(', ') : booking.places;
    }
    if (!placesText) placesText = 'Various Locations';

    const title = booking.packageName || booking.tripName || 'Package Booking';
    const type = getBookingTypeLabel(getBookingType(booking));
    const refId = booking.bookingNumber || booking.id || booking.bookingId || 'N/A';
    const pCount = booking.travelers || booking.peopleCount || 1;
    const tPrice = booking.totalPrice ? 'EGP ' + Number(booking.totalPrice).toLocaleString() : 'N/A';
    
    modalBody.innerHTML = `
        <div class="detail-row" style="display:flex; justify-content:space-between; margin-bottom:1rem; border-bottom:1px solid var(--color-border-light); padding-bottom:0.5rem;">
            <span style="color:var(--color-text-secondary);">Reference ID</span>
            <span style="font-weight:600;">${refId}</span>
        </div>
        <div class="detail-row" style="display:flex; justify-content:space-between; margin-bottom:1rem; border-bottom:1px solid var(--color-border-light); padding-bottom:0.5rem;">
            <span style="color:var(--color-text-secondary);">Expedition Type</span>
            <span style="font-weight:600;">${type}</span>
        </div>
        <div class="detail-row" style="display:flex; justify-content:space-between; margin-bottom:1rem; border-bottom:1px solid var(--color-border-light); padding-bottom:0.5rem;">
            <span style="color:var(--color-text-secondary);">Designation</span>
            <span style="font-weight:600;">${title}</span>
        </div>
        <div class="detail-row" style="display:flex; justify-content:space-between; margin-bottom:1rem; border-bottom:1px solid var(--color-border-light); padding-bottom:0.5rem;">
            <span style="color:var(--color-text-secondary);">Landmarks</span>
            <span style="font-weight:600; text-align:right;">${placesText}</span>
        </div>
        <div class="detail-row" style="display:flex; justify-content:space-between; margin-bottom:1rem; border-bottom:1px solid var(--color-border-light); padding-bottom:0.5rem;">
            <span style="color:var(--color-text-secondary);">Arrival Date</span>
            <span style="font-weight:600;">${formatDate(rawDate)}</span>
        </div>
        <div class="detail-row" style="display:flex; justify-content:space-between; margin-bottom:1rem; border-bottom:1px solid var(--color-border-light); padding-bottom:0.5rem;">
            <span style="color:var(--color-text-secondary);">Status</span>
            <span style="font-weight:600;">${statusLabel}</span>
        </div>
        <div class="detail-row" style="display:flex; justify-content:space-between; margin-bottom:1rem; border-bottom:1px solid var(--color-border-light); padding-bottom:0.5rem;">
            <span style="color:var(--color-text-secondary);">Party Size</span>
            <span style="font-weight:600;">${pCount} ${pCount > 1 ? 'Explorers' : 'Explorer'}</span>
        </div>
        <div class="detail-row" style="display:flex; justify-content:space-between; margin-bottom:1rem;">
            <span style="color:var(--color-text-secondary);">Total Value</span>
            <span style="font-weight:700; color:var(--gold-primary);">${tPrice}</span>
        </div>
    `;
    
    modal.style.display = 'flex';
}

function closeModalWindow() {
    modal.style.display = 'none';
}

// ── Events ─────────────────────────────────────────────────────────────────
function attachEventListeners() {
    statusFilter?.addEventListener('change', filterBookings);
    typeFilter?.addEventListener('change', filterBookings);
    closeModal?.addEventListener('click', closeModalWindow);
    
    bookingsList?.addEventListener('click', (e) => {
        if (e.target.classList.contains('view-details-btn')) {
            const bookingId = e.target.closest('.booking-card').dataset.id;
            showDetails(bookingId);
        }
    });
    
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModalWindow();
        }
    });
}
