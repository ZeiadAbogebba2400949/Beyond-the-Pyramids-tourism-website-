let currentBookings = [];
let filteredBookings = [];

const bookingsList = document.getElementById('bookingsList');
const statusFilter = document.getElementById('statusFilter');
const typeFilter   = document.getElementById('typeFilter');
const modal        = document.getElementById('detailsModal');
const modalBody    = document.getElementById('modalBody');
const closeModal   = document.querySelector('.close-modal');

const statusClasses = {
    'confirmed':   'status--confirmed',
    'checked-in':  'status--checked-in',
    'checked-out': 'status--checked-out',
    'cancelled':   'status--cancelled',
    'canceled':    'status--cancelled'
};

const statusLabels = {
    'confirmed':   'Confirmed',
    'checked-in':  'Checked In',
    'checked-out': 'Checked Out',
    'cancelled':   'Cancelled',
    'canceled':    'Cancelled'
};

document.addEventListener('DOMContentLoaded', function() {
    currentBookings = (window.SERVER_BOOKINGS || []).map(normaliseServerBooking);
    filteredBookings = [...currentBookings];
    renderBookings();
    attachEventListeners();
});

function normaliseServerBooking(b) {
    return {
        id:             b._id || b.id,
        bookingId:      b._id || b.id,
        bookingNumber:  b.bookingNumber,
        packageName:    b.packageName,
        tripName:       b.packageName,
        date:           b.date,
        travelDate:     b.date,
        travelers:      b.travelers,
        peopleCount:    b.travelers,
        totalPrice:     b.totalPrice,
        status:         b.status,
        computedStatus: b.computedStatus || b.status,
        location:       b.packageId && b.packageId.city  ? b.packageId.city  : '',
        image:          b.packageId && b.packageId.image ? b.packageId.image : '',
        type:           b.packageId && b.packageId.type  ? b.packageId.type  : 'day',
        _id:            b._id,
    };
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    if (typeof dateString === 'string' && dateString.includes(' to ')) {
        const parts = dateString.split(' to ');
        const fmt = s => {
            const d = new Date(s.trim());
            return isNaN(d) ? s.trim() : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        };
        return fmt(parts[0]) + ' – ' + fmt(parts[1]);
    }
    const d = new Date(dateString);
    if (isNaN(d)) return dateString;
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
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
    if (rawType.includes('single') || rawType.includes('location'))  return 'single';
    if (rawType.includes('week')   || rawType.includes('weekly') || rawType.includes('multi')) return 'week';
    return 'day';
}

function getBookingTypeLabel(type) {
    const labels = { day: 'Day Package', week: 'Week Package', single: 'Single Location', custom: 'Custom Trip' };
    return labels[type] || 'Day Package';
}

function renderBookings() {
    if (filteredBookings.length === 0) {
        bookingsList.innerHTML = `
            <div class="empty-state glass-card" style="text-align:center; padding:4rem 2rem;">
                <i class="fas fa-suitcase-rolling" style="font-size:3rem; color:var(--color-text-muted); margin-bottom:1rem; opacity:0.5;"></i>
                <h3 style="margin-bottom:0.5rem; font-size:1.5rem;">No Journeys Found</h3>
                <p style="color:var(--color-text-secondary); margin-bottom:1.5rem;">Your travel journal is currently empty. Start your next adventure today.</p>
                <a href="/packages/day" class="btn btn--primary">Explore Packages</a>
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
    const computedStatus = booking.computedStatus;
    const statusClass = statusClasses[computedStatus] || '';
    const statusLabel = statusLabels[computedStatus] || computedStatus.toUpperCase();

    const title  = booking.packageName || booking.tripName || 'Package Booking';
    const type   = getBookingTypeLabel(getBookingType(booking));
    const refId  = booking.bookingNumber || booking.id || booking.bookingId || 'N/A';
    const pCount = booking.travelers || booking.peopleCount || 1;
    const tPrice = booking.totalPrice ? 'EGP ' + Number(booking.totalPrice).toLocaleString() : 'N/A';

    let placesText = booking.location || booking.city;
    if (!placesText && booking.places) {
        placesText = Array.isArray(booking.places) ? booking.places.join(', ') : booking.places;
    }
    if (!placesText) placesText = 'Various Locations';

    const canCancel = computedStatus !== 'cancelled' && computedStatus !== 'checked-out';

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
            <button class="view-details-btn btn btn--outline" data-id="${booking.id || booking._id}">View Journey Manifesto</button>
            ${canCancel && booking._id
                ? `<button class="cancel-booking-btn btn btn--outline btn--cancel" data-id="${booking._id}">Cancel Booking</button>`
                : ''}
        </div>
    `;

    return card;
}

function filterBookings() {
    const statusValue = statusFilter?.value || 'all';
    const typeValue   = typeFilter?.value   || 'all';

    filteredBookings = currentBookings.filter(booking => {
        const matchesStatus = statusValue === 'all' || booking.computedStatus === statusValue;
        const matchesType   = typeValue   === 'all' || getBookingType(booking) === typeValue;
        return matchesStatus && matchesType;
    });

    renderBookings();
}

function showDetails(bookingId) {
    const booking = currentBookings.find(b => (b.id === bookingId || b.bookingId === bookingId || b.bookingNumber === bookingId));
    if (!booking) return;

    const rawDate = booking.date || booking.travelDate || booking.bookingDate || booking.timestamp;
    const computedStatus = booking.computedStatus;
    const statusLabel = statusLabels[computedStatus] || computedStatus.toUpperCase();

    let placesText = booking.location || booking.city;
    if (!placesText && booking.places) {
        placesText = Array.isArray(booking.places) ? booking.places.join(', ') : booking.places;
    }
    if (!placesText) placesText = 'Various Locations';

    const title  = booking.packageName || booking.tripName || 'Package Booking';
    const type   = getBookingTypeLabel(getBookingType(booking));
    const refId  = booking.bookingNumber || booking.id || booking.bookingId || 'N/A';
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

function confirmCancel(bookingId, bookingTitle) {
    const existing = document.getElementById('cancel-confirm-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'cancel-confirm-overlay';
    overlay.className = 'modal-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.6);backdrop-filter:blur(12px)';
    overlay.innerHTML = `
        <div class="modal-content login-required-modal">
            <div class="modal-header">
                <h2><i class="fas fa-exclamation-triangle" style="color:#e53e3e;"></i> Cancel Booking</h2>
            </div>
            <p class="login-required-message">Are you sure you want to cancel <strong>${bookingTitle}</strong>? This action cannot be undone.</p>
            <div class="modal-actions">
                <button type="button" id="cancel-no-btn" class="btn btn--outline">Keep Booking</button>
                <button type="button" id="cancel-yes-btn" class="btn btn--danger">Yes, Cancel</button>
            </div>
        </div>`;
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    const close = () => { overlay.remove(); document.body.style.overflow = ''; };

    document.getElementById('cancel-no-btn').addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

    document.getElementById('cancel-yes-btn').addEventListener('click', async () => {
        const btn = document.getElementById('cancel-yes-btn');
        btn.disabled = true;
        btn.textContent = 'Cancelling…';
        try {
            const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ reason: 'Cancelled by user' }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Cancellation failed');

            const b = currentBookings.find(x => x._id === bookingId || x.id === bookingId);
            if (b) { b.status = 'cancelled'; b.computedStatus = 'cancelled'; }
            filteredBookings = filteredBookings.map(x =>
                (x._id === bookingId || x.id === bookingId) ? { ...x, status: 'cancelled', computedStatus: 'cancelled' } : x
            );
            renderBookings();
            close();
        } catch (err) {
            btn.disabled = false;
            btn.textContent = 'Yes, Cancel';
            alert(err.message);
        }
    });
}

function attachEventListeners() {
    statusFilter?.addEventListener('change', filterBookings);
    typeFilter?.addEventListener('change', filterBookings);
    closeModal?.addEventListener('click', closeModalWindow);

    bookingsList?.addEventListener('click', (e) => {
        if (e.target.classList.contains('view-details-btn')) {
            const bookingId = e.target.dataset.id || e.target.closest('.booking-card')?.dataset.id;
            showDetails(bookingId);
        }
        if (e.target.classList.contains('cancel-booking-btn')) {
            const bookingId = e.target.dataset.id;
            const booking = currentBookings.find(b => b._id === bookingId || b.id === bookingId);
            const title = booking ? (booking.packageName || 'this booking') : 'this booking';
            confirmCancel(bookingId, title);
        }
    });

    window.addEventListener('click', function(e) {
        if (e.target === modal) closeModalWindow();
    });
}
