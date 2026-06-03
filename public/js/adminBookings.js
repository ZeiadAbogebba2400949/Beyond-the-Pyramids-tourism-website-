let bookings = [];
let currentBookingId = null;

function loadData() {
    const raw = (window.SERVER_DATA && window.SERVER_DATA.bookings) ? window.SERVER_DATA.bookings : [];

    bookings = raw.map(b => ({
        id:             b.id || b.bookingId,
        bookingNumber:  b.bookingNumber || b.id || b.bookingId || 'BKG-000',
        userName:       b.userName || b.userEmail?.split('@')[0] || 'Guest',
        userEmail:      b.userEmail || 'unknown@email.com',
        packageName:    b.packageName || b.title || b.tripName || 'Package Tour',
        packageType:    b.packageType || b.tripType || 'Package',
        startDate:      b.date || b.startDate || b.bookingDate || b.timestamp?.substring(0,10) || '',
        endDate:        b.endDate || b.date || b.startDate || b.bookingDate || b.timestamp?.substring(0,10) || '',
        travelers:      b.travelers || b.peopleCount || 1,
        totalPrice:     Number(b.totalPrice) || 0,
        status:         b.status || 'confirmed',
        computedStatus: b.computedStatus || b.status || 'confirmed',
        specialRequests: b.specialRequests || '',
        createdAt:      b.createdAt || b.timestamp?.substring(0,10) || ''
    }));

    updateStats();
    renderBookings();
}

function updateStats() {
    document.getElementById('totalBookings').textContent = bookings.length;

    document.getElementById('activeCount').textContent    = `Confirmed: ${bookings.filter(b => b.computedStatus === 'confirmed').length}`;
    document.getElementById('cancelledCount').textContent = `Cancelled: ${bookings.filter(b => b.computedStatus === 'cancelled').length}`;
    document.getElementById('completedCount').textContent = bookings.filter(b => b.computedStatus === 'checked-out').length;

    const revenue = bookings.reduce((sum, b) => b.computedStatus !== 'cancelled' ? sum + b.totalPrice : sum, 0);
    document.getElementById('totalRevenue').textContent = revenue.toLocaleString() + ' EGP';
}

function renderBookings() {
    let filtered = [...bookings];

    const search = document.getElementById('searchInput').value.toLowerCase();
    if (search) {
        filtered = filtered.filter(b =>
            b.bookingNumber.toLowerCase().includes(search) ||
            b.userName.toLowerCase().includes(search) ||
            b.packageName.toLowerCase().includes(search)
        );
    }

    const status = document.getElementById('statusFilter').value;
    if (status !== 'all') {
        filtered = filtered.filter(b => b.computedStatus === status);
    }

    const type = document.getElementById('typeFilter').value;
    if (type !== 'all') {
        filtered = filtered.filter(b => b.packageType.toLowerCase().includes(type.toLowerCase()));
    }

    const container = document.getElementById('bookingsContainer');
    container.innerHTML = '';

    if (filtered.length === 0) {
        container.innerHTML = '<p style="text-align:center;padding:40px;color:var(--color-text-muted);">No bookings found</p>';
        return;
    }

    filtered.forEach(b => {
        const template = document.getElementById('bookingCardTemplate');
        if (!template) return;
        const card = template.content.cloneNode(true);

        card.querySelector('.booking-number').textContent = b.bookingNumber;
        const statusSpan = card.querySelector('.booking-status');
        statusSpan.textContent = b.computedStatus.replace('-', ' ').toUpperCase();
        statusSpan.classList.add(b.computedStatus);
        card.querySelector('.booking-package').textContent = b.packageName;
        card.querySelector('.booking-customer span').textContent = `${b.userName} (${b.userEmail})`;
        card.querySelector('.booking-dates span').textContent = `${b.startDate} to ${b.endDate}`;
        card.querySelector('.booking-price span').textContent = `${b.totalPrice.toLocaleString()} EGP`;
        card.querySelector('.booking-travelers span').textContent = `${b.travelers} traveler(s)`;

        const viewBtn = card.querySelector('.view-btn');
        const cancelBtn = card.querySelector('.cancel-btn');

        viewBtn.onclick = () => viewBooking(b.id);

        if (b.computedStatus === 'confirmed') {
            cancelBtn.style.display = 'inline-block';
            cancelBtn.onclick = () => openCancelModal(b.id);
        } else {
            cancelBtn.style.display = 'none';
        }

        container.appendChild(card);
    });
}

function viewBooking(id) {
    const b = bookings.find(b => b.id === id);
    const details = document.getElementById('viewDetails');
    if (!details) return;
    details.innerHTML = `
        <p><strong>Booking #:</strong> ${b.bookingNumber}</p>
        <p><strong>Customer:</strong> ${b.userName}</p>
        <p><strong>Email:</strong> ${b.userEmail}</p>
        <p><strong>Package:</strong> ${b.packageName}</p>
        <p><strong>Type:</strong> ${b.packageType.toUpperCase()}</p>
        <p><strong>Dates:</strong> ${b.startDate} to ${b.endDate}</p>
        <p><strong>Travelers:</strong> ${b.travelers}</p>
        <p><strong>Total Price:</strong> ${b.totalPrice.toLocaleString()} EGP</p>
        <p><strong>Status:</strong> <span class="booking-status ${b.computedStatus}">${b.computedStatus.replace('-', ' ').toUpperCase()}</span></p>
        <p><strong>Booked on:</strong> ${b.createdAt || b.startDate}</p>
        <p><strong>Special Requests:</strong> ${b.specialRequests || 'None'}</p>
    `;
    document.getElementById('viewModal')?.showModal();
}

function openCancelModal(id) {
    currentBookingId = id;
    const b = bookings.find(b => b.id === id);
    const nameEl = document.getElementById('cancelBookingName');
    if (nameEl) nameEl.textContent = b.packageName;
    const reasonEl = document.getElementById('cancelReason');
    if (reasonEl) reasonEl.value = '';
    document.getElementById('cancelModal')?.showModal();
}

function cancelBooking() {
    const reason = document.getElementById('cancelReason')?.value || '';
    if (!reason.trim()) {
        alert('Please provide a reason for cancellation.');
        return;
    }
    const b = bookings.find(b => b.id === currentBookingId);
    if (b) {
        fetch('/api/admin/bookings/' + b.id + '/status', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ status: 'cancelled' }),
        }).then(() => window.location.reload()).catch(() => {
            b.status = 'cancelled';
            b.computedStatus = 'cancelled';
            updateStats();
            renderBookings();
        });
    }
    document.getElementById('cancelModal')?.close();
}

function closeAllModals() {
    ['viewModal', 'cancelModal'].forEach(m => {
        const modal = document.getElementById(m);
        if (modal && modal.open) modal.close();
    });
}

function setupFilters() {
    document.getElementById('searchInput')?.addEventListener('input', () => renderBookings());
    document.getElementById('statusFilter')?.addEventListener('change', () => renderBookings());
    document.getElementById('typeFilter')?.addEventListener('change', () => renderBookings());
}

function setupEventListeners() {
    const confirmBtn = document.getElementById('confirmCancelBtn');
    if (confirmBtn) confirmBtn.onclick = cancelBooking;

    document.querySelectorAll('.close').forEach(btn => {
        btn.onclick = closeAllModals;
    });

    const cancelCancel = document.getElementById('cancelCancelBtn');
    if (cancelCancel) cancelCancel.onclick = () => document.getElementById('cancelModal').close();

    const closeView = document.getElementById('closeViewBtn');
    if (closeView) closeView.onclick = () => document.getElementById('viewModal').close();
}

function init() {
    loadData();
    setupFilters();
    setupEventListeners();
}

document.addEventListener('DOMContentLoaded', init);
