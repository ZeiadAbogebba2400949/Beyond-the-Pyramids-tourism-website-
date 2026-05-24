
// ─── State ───────────────────────────────────────────────────────────────────

let vehicles = [
    { id: 1, type: 'Tourist Bus',    capacity: 40, driver: 'Ahmed Mahmoud', licensePlate: 'BUS-101', notes: 'Perfect condition, recently serviced.' },
    { id: 2, type: 'Premium Van',    capacity: 12, driver: 'Mohamed Ali',   licensePlate: 'VAN-202', notes: 'Assigned to Giza Group A.'          },
    { id: 3, type: 'Luxury Car',     capacity: 4,  driver: 'Karim Hassan',  licensePlate: 'CAR-303', notes: 'Oil change and tire rotation.'       },
    { id: 4, type: 'Executive SUV',  capacity: 6,  driver: 'Tarek Nour',    licensePlate: 'SUV-404', notes: 'New addition to the fleet.'          },
    { id: 5, type: 'Limousine',      capacity: 6,  driver: 'Hassan Mostafa',licensePlate: 'LIM-505', notes: 'VIP transfers only.'                 }
];

// All transport bookings are auto-confirmed when a user books.
// status: 'confirmed' | 'cancelled'
let transportBookings = [
    { id: 'TB-001', customer: 'Emily Carter',    passengers: 2,  vehicleId: 2, vehicleType: 'Premium Van',   pickup: 'Cairo Airport',       dropoff: 'Marriott Mena House', date: '2026-05-15', time: '14:00', status: 'confirmed' },
    { id: 'TB-002', customer: 'Hans Müller',     passengers: 4,  vehicleId: 3, vehicleType: 'Luxury Car',    pickup: 'Luxor Temple',        dropoff: 'Valley of the Kings', date: '2026-05-18', time: '07:00', status: 'confirmed' },
    { id: 'TB-003', customer: 'Fatima Al-Rashid',passengers: 1,  vehicleId: 3, vehicleType: 'Luxury Car',    pickup: 'Four Seasons Nile',   dropoff: 'Egyptian Museum',     date: '2026-05-20', time: '09:30', status: 'confirmed' },
    { id: 'TB-004', customer: 'Ahmed Traveler',  passengers: 25, vehicleId: 1, vehicleType: 'Tourist Bus',   pickup: 'Cairo Opera House',   dropoff: 'Giza Plateau',        date: '2026-06-01', time: '08:00', status: 'confirmed' },
    { id: 'TB-005', customer: 'Yuki Tanaka',     passengers: 3,  vehicleId: 2, vehicleType: 'Premium Van',   pickup: 'Aswan Airport',       dropoff: 'Philae Temple',       date: '2026-06-10', time: '11:00', status: 'confirmed' },
    { id: 'TB-006', customer: "Liam O'Brien",    passengers: 5,  vehicleId: 4, vehicleType: 'Executive SUV', pickup: 'Luxor Airport',       dropoff: 'Winter Palace Hotel', date: '2026-05-18', time: '16:00', status: 'cancelled' }
];

let nextVehicleId = 6;
let currentDeleteId = null;
let currentDetailId = null;

// The date the admin is inspecting (for vehicle availability)
let selectedDate = new Date().toISOString().split('T')[0];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns 'booked' if any confirmed booking uses this vehicle on the given date,
 * otherwise 'available'.
 */
function getVehicleStatus(vehicleId, date) {
    const booked = transportBookings.some(b =>
        b.vehicleId === vehicleId &&
        b.date === date &&
        b.status === 'confirmed'
    );
    return booked ? 'booked' : 'available';
}

// ─── Render: Fleet Grid ───────────────────────────────────────────────────────

function displayVehicles() {
    const container = document.getElementById('vehicles-list');
    if (!container) return;

    const statusFilter = document.getElementById('statusFilter').value;
    const searchTerm   = document.getElementById('fleetSearch').value.toLowerCase();

    let filtered = vehicles.filter(v => {
        const status = getVehicleStatus(v.id, selectedDate);
        const matchStatus = statusFilter === 'all' || status === statusFilter;
        const matchSearch = !searchTerm ||
            v.type.toLowerCase().includes(searchTerm) ||
            v.driver.toLowerCase().includes(searchTerm) ||
            v.licensePlate.toLowerCase().includes(searchTerm);
        return matchStatus && matchSearch;
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:60px 0;">
                <i class="fas fa-car-side" style="font-size:3rem;color:var(--color-border);margin-bottom:20px;display:block;"></i>
                <p style="color:var(--color-text-muted);">No vehicles match your criteria for <strong>${selectedDate}</strong>.</p>
            </div>`;
        updateStats();
        return;
    }

    container.innerHTML = filtered.map(v => createVehicleCard(v)).join('');
    updateStats();
}

function createVehicleCard(v) {
    const status      = getVehicleStatus(v.id, selectedDate);
    const statusClass = `status-${status}`;
    const icon        = v.type.includes('Bus')  ? 'fa-bus'
                      : v.type.includes('Van')  ? 'fa-shuttle-van'
                      : v.type.includes('Limo') ? 'fa-car-side'
                      : 'fa-car';

    // Find the booking for this vehicle on the selected date (if any)
    const booking = transportBookings.find(b =>
        b.vehicleId === v.id && b.date === selectedDate && b.status === 'confirmed'
    );

    return `
        <article class="vehicle-card">
            <div class="vehicle-media">
                <i class="fas ${icon}"></i>
                <span class="vehicle-status-badge ${statusClass}">${status}</span>
            </div>
            <div class="vehicle-info">
                <div class="vehicle-type">${v.type}</div>
                <h4 class="vehicle-name">${v.licensePlate}</h4>

                <div class="vehicle-specs">
                    <div class="spec-item"><i class="fas fa-users"></i> ${v.capacity} Seats</div>
                    <div class="spec-item"><i class="fas fa-tag"></i> ID: VH-${String(v.id).padStart(3,'0')}</div>
                </div>

                ${booking ? `
                <div class="vehicle-booking-tag">
                    <i class="fas fa-calendar-check"></i>
                    Booked by <strong>${booking.customer}</strong><br>
                    <span style="font-size:0.72rem;opacity:0.8;">${booking.pickup} → ${booking.dropoff} · ${booking.time}</span>
                </div>` : ''}

                <div class="vehicle-driver">
                    <div class="driver-avatar">${v.driver.charAt(0)}</div>
                    <div class="driver-info">
                        <div style="font-weight:600;font-size:0.9rem;">${v.driver}</div>
                        <div style="font-size:0.75rem;color:var(--color-text-muted);">Primary Driver</div>
                    </div>
                </div>

                <div class="vehicle-actions">
                    <button class="btn-ghost" onclick="openEditModal(${v.id})" style="flex:1">Manage</button>
                    <button class="btn-danger" onclick="openDeleteModal(${v.id},'${v.licensePlate}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        </article>`;
}

// ─── Render: Bookings Table ───────────────────────────────────────────────────

function displayBookings() {
    const container = document.getElementById('bookings-list');
    if (!container) return;

    // Show all non-deleted bookings (both confirmed and cancelled)
    const rows = transportBookings;

    if (rows.length === 0) {
        container.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--color-text-muted);">No transportation bookings yet.</td></tr>';
        return;
    }

    container.innerHTML = rows.map(b => {
        const statusBadge = b.status === 'cancelled'
            ? `<span class="badge-cancelled">Cancelled</span>`
            : `<span class="badge-confirmed">Confirmed</span>`;

        const vehicle = vehicles.find(v => v.id === b.vehicleId);
        const plateTxt = vehicle ? vehicle.licensePlate : '—';

        const cancelBtn = b.status === 'confirmed'
            ? `<button class="btn-cancel-row" onclick="cancelBooking('${b.id}')"><i class="fas fa-ban"></i> Cancel</button>`
            : `<span class="cancelled-label">—</span>`;

        return `
            <tr>
                <td><strong>${b.id}</strong></td>
                <td style="font-weight:600;">${b.customer}</td>
                <td>${b.vehicleType}<br><span style="font-size:0.75rem;color:var(--color-text-muted);">${plateTxt}</span></td>
                <td>${b.date}<br><span style="font-size:0.75rem;color:var(--color-text-muted);">${b.time}</span></td>
                <td>${b.pickup} → ${b.dropoff}</td>
                <td>${statusBadge}</td>
                <td>
                    <div class="actions-cell">
                        <button class="btn-ghost" style="padding:7px 12px;font-size:0.78rem;" onclick="viewBookingDetail('${b.id}')"><i class="fas fa-eye"></i> View</button>
                        ${cancelBtn}
                    </div>
                </td>
            </tr>`;
    }).join('');
}

// ─── Stats ────────────────────────────────────────────────────────────────────

function updateStats() {
    const totalEl     = document.getElementById('totalVehiclesCount');
    const availEl     = document.getElementById('availableVehiclesCount');
    const bookedEl    = document.getElementById('bookedCount');
    const confirmedEl = document.getElementById('confirmedBookingsCount');

    if (totalEl)     totalEl.textContent  = vehicles.length;
    if (availEl)     availEl.textContent  = vehicles.filter(v => getVehicleStatus(v.id, selectedDate) === 'available').length;
    if (bookedEl)    bookedEl.textContent = vehicles.filter(v => getVehicleStatus(v.id, selectedDate) === 'booked').length;
    if (confirmedEl) confirmedEl.textContent = transportBookings.filter(b => b.status === 'confirmed').length;
}

// ─── Date Picker ─────────────────────────────────────────────────────────────

function setupDatePicker() {
    const picker = document.getElementById('availabilityDate');
    if (!picker) return;
    picker.value = selectedDate;
    picker.addEventListener('change', () => {
        selectedDate = picker.value;
        displayVehicles();
        // also update the section label
        const lbl = document.getElementById('fleetDateLabel');
        if (lbl) lbl.textContent = `Fleet Availability · ${selectedDate}`;
    });
}

// ─── Cancel Booking ───────────────────────────────────────────────────────────

function cancelBooking(id) {
    const b = transportBookings.find(b => b.id === id);
    if (!b || b.status === 'cancelled') return;
    if (!confirm(`Cancel booking ${id} for ${b.customer}?\nThis cannot be undone.`)) return;
    b.status = 'cancelled';
    displayBookings();
    displayVehicles(); // refresh availability badges
}

// ─── View Detail Modal ────────────────────────────────────────────────────────

function viewBookingDetail(id) {
    const b = transportBookings.find(b => b.id === id);
    if (!b) return;
    const vehicle = vehicles.find(v => v.id === b.vehicleId);

    const statusBadge = b.status === 'cancelled'
        ? `<span class="badge-cancelled">Cancelled</span>`
        : `<span class="badge-confirmed">Confirmed</span>`;

    document.getElementById('bookingDetailContent').innerHTML = `
        <div class="detail-grid">
            <div class="detail-row"><span class="detail-label">Booking ID</span><span class="detail-value">${b.id}</span></div>
            <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value">${statusBadge}</span></div>
            <div class="detail-row"><span class="detail-label">Customer</span><span class="detail-value">${b.customer}</span></div>
            <div class="detail-row"><span class="detail-label">Passengers</span><span class="detail-value">${b.passengers}</span></div>
            <div class="detail-row"><span class="detail-label">Vehicle Type</span><span class="detail-value">${b.vehicleType}</span></div>
            <div class="detail-row"><span class="detail-label">Plate</span><span class="detail-value">${vehicle ? vehicle.licensePlate : '—'}</span></div>
            <div class="detail-row"><span class="detail-label">Driver</span><span class="detail-value">${vehicle ? vehicle.driver : '—'}</span></div>
            <div class="detail-row"><span class="detail-label">Date</span><span class="detail-value">${b.date}</span></div>
            <div class="detail-row"><span class="detail-label">Time</span><span class="detail-value">${b.time}</span></div>
            <div class="detail-row"><span class="detail-label">Pickup</span><span class="detail-value">${b.pickup}</span></div>
            <div class="detail-row"><span class="detail-label">Drop-off</span><span class="detail-value">${b.dropoff}</span></div>
        </div>`;

    // Show or hide the cancel button in the modal
    const modalCancelBtn = document.getElementById('modalCancelBookingBtn');
    if (modalCancelBtn) {
        if (b.status === 'confirmed') {
            modalCancelBtn.style.display = 'inline-flex';
            modalCancelBtn.onclick = () => {
                cancelBooking(id);
                closeModal('bookingDetailModal');
            };
        } else {
            modalCancelBtn.style.display = 'none';
        }
    }

    currentDetailId = id;
    openModal('bookingDetailModal');
}

// ─── Vehicle CRUD ─────────────────────────────────────────────────────────────

function openModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.add('open');
}

function closeModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.remove('open');
}

function openAddModal() {
    document.getElementById('vehicleForm').reset();
    document.getElementById('vehicleId').value = '';
    document.getElementById('modalTitle').textContent = 'Register New Vehicle';
    openModal('vehicleModal');
}

function openEditModal(id) {
    const v = vehicles.find(v => v.id === id);
    if (!v) return;
    document.getElementById('vehicleId').value      = v.id;
    document.getElementById('vehicle-type').value   = v.type;
    document.getElementById('vehicle-plate').value  = v.licensePlate;
    document.getElementById('vehicle-capacity').value = v.capacity;
    document.getElementById('vehicle-driver').value = v.driver;
    document.getElementById('vehicleNotes').value   = v.notes || '';
    document.getElementById('modalTitle').textContent = 'Update Asset Detail';
    openModal('vehicleModal');
}

function saveVehicle() {
    const id       = document.getElementById('vehicleId').value;
    const type     = document.getElementById('vehicle-type').value;
    const plate    = document.getElementById('vehicle-plate').value.trim();
    const capacity = parseInt(document.getElementById('vehicle-capacity').value);
    const driver   = document.getElementById('vehicle-driver').value.trim();
    const notes    = document.getElementById('vehicleNotes').value;

    if (!plate || !driver || !capacity) {
        alert('Please complete all required fields.');
        return;
    }

    const vehicleData = { id: id ? parseInt(id) : nextVehicleId++, type, licensePlate: plate, capacity, driver, notes };

    if (id) {
        const idx = vehicles.findIndex(v => v.id === parseInt(id));
        vehicles[idx] = vehicleData;
    } else {
        vehicles.push(vehicleData);
    }

    closeModal('vehicleModal');
    displayVehicles();
}

function openDeleteModal(id, plate) {
    currentDeleteId = id;
    document.getElementById('deleteVehicleLabel').textContent = plate;
    openModal('deleteModal');
}

function confirmDelete() {
    if (!currentDeleteId) return;
    vehicles = vehicles.filter(v => v.id !== currentDeleteId);
    displayVehicles();
    closeModal('deleteModal');
    currentDeleteId = null;
}

// ─── Init ─────────────────────────────────────────────────────────────────────

function init() {
    setupDatePicker();
    displayVehicles();
    displayBookings();

    document.getElementById('addVehicleTrigger').onclick = openAddModal;
    document.getElementById('saveVehicleBtn').onclick    = saveVehicle;
    document.getElementById('confirmDeleteBtn').onclick  = confirmDelete;

    document.getElementById('fleetSearch').addEventListener('input',  displayVehicles);
    document.getElementById('statusFilter').addEventListener('change', displayVehicles);
}

document.addEventListener('DOMContentLoaded', init);