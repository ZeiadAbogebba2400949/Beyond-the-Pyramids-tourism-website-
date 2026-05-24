
var hotels = [
    { id: 1, name: 'Royal Nile Hotel', stars: 5, location: 'Cairo', phone: '+20 123 456', email: 'royal@nile.com', totalRooms: 150 },
    { id: 2, name: 'Luxor Palace', stars: 5, location: 'Luxor', phone: '+20 987 654', email: 'luxor@palace.com', totalRooms: 80 },
    { id: 3, name: 'Red Sea Resort', stars: 4, location: 'Sharm El-Sheikh', phone: '+20 111 222', email: 'info@redsearesort.com', totalRooms: 200 },
    { id: 4, name: 'Oasis Desert Camp', stars: 3, location: 'Siwa', phone: '+20 333 444', email: 'camp@oasis.com', totalRooms: 30 }
];

var hmRoomTypes = [
    { id: 1, hotelId: 1, category: 'Suite', name: 'Nile View Suite', adults: 2, children: 1, bedType: 'King', pricePerNight: 450, count: 10 },
    { id: 2, hotelId: 1, category: 'Deluxe', name: 'Standard Deluxe', adults: 2, children: 0, bedType: 'Queen', pricePerNight: 200, count: 50 },
    { id: 3, hotelId: 2, category: 'Presidential', name: 'Pharaoh Suite', adults: 4, children: 2, bedType: 'King', pricePerNight: 800, count: 2 },
    { id: 4, hotelId: 3, category: 'Suite', name: 'Ocean View Suite', adults: 2, children: 2, bedType: 'King', pricePerNight: 350, count: 20 }
];

var reservations = [
    { id: 'HBK-1001', guestName: 'John Doe', hotelId: 1, roomTypeId: 1, checkIn: '2026-05-10', checkOut: '2026-05-15', adults: 2, children: 0, totalPrice: 2250, status: 'confirmed', createdAt: '2026-04-15' },
    { id: 'HBK-1002', guestName: 'Sarah Smith', hotelId: 2, roomTypeId: 3, checkIn: '2026-06-01', checkOut: '2026-06-05', adults: 4, children: 0, totalPrice: 3200, status: 'confirmed', createdAt: '2026-04-18' },
    { id: 'HBK-1003', guestName: 'Ahmed Ali', hotelId: 1, roomTypeId: 2, checkIn: '2026-05-20', checkOut: '2026-05-22', adults: 2, children: 0, totalPrice: 400, status: 'checked-out', createdAt: '2026-04-20' },
    { id: 'HBK-1004', guestName: 'Emma Watson', hotelId: 3, roomTypeId: 4, checkIn: '2026-07-10', checkOut: '2026-07-20', adults: 2, children: 2, totalPrice: 3500, status: 'rejected', createdAt: '2026-04-25' },
    { id: 'HBK-1005', guestName: 'Michael Brown', hotelId: 4, roomTypeId: 1, checkIn: '2026-08-05', checkOut: '2026-08-10', adults: 2, children: 1, totalPrice: 1500, status: 'confirmed', createdAt: '2026-04-28' }
];

var availability = {};

var editHotelId = null;
var editRoomId  = null;
var calDate     = new Date();

function today() {
    var d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

function pad(n) {
    return String(n).padStart(2, '0');
}

function fmtDate(s) {
    if (!s) return '-';
    var p = s.split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function hotelName(id) {
    var h = hotels.find(function(h) { return h.id === id; });
    return h ? h.name : '-';
}

function roomName(id) {
    var r = hmRoomTypes.find(function(r) { return r.id === id; });
    return r ? r.name : '-';
}

function badge(status) {
    return '<span class="badge badge-' + status + '">' + status.replace('-', ' ') + '</span>';
}

function nextId(arr) {
    return arr.length ? Math.max.apply(null, arr.map(function(x) { return x.id; })) + 1 : 1;
}

function showSection(name) {
    document.querySelectorAll('.section').forEach(function(s) { s.classList.remove('active'); });
    document.querySelectorAll('.sub-link').forEach(function(n) { n.classList.remove('active'); });
    
    document.getElementById('section-' + name).classList.add('active');
    const activeSubLink = document.querySelector(`.sub-link[data-section="${name}"]`);
    if (activeSubLink) activeSubLink.classList.add('active');

    document.getElementById('pageTitle').textContent = {
        overview: 'Hotel Overview', hotels: 'Properties', rooms: 'Room Categories',
        availability: 'Availability Control', reservations: 'Booking Management',
        reports: 'Performance Insight'
    }[name];

    ({
        overview: renderOverview, hotels: renderHotels, rooms: renderRooms,
        availability: renderAvailability, reservations: renderReservations,
        reports: renderReports
    })[name]();
}

function getComputedReservationStatus(checkIn, checkOut, baseStatus) {
    if (baseStatus === 'cancelled' || baseStatus === 'rejected') return 'cancelled';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(checkIn);
    start.setHours(0, 0, 0, 0);
    const end = new Date(checkOut);
    end.setHours(0, 0, 0, 0);
    
    if (today < start) return 'confirmed';
    if (today >= start && today <= end) return 'checked-in';
    return 'checked-out';
}

function renderOverview() {
    document.getElementById('stat-hotels').textContent    = hotels.length;
    document.getElementById('stat-rooms').textContent     = hmRoomTypes.reduce(function(s, r) { return s + r.count; }, 0);
    document.getElementById('stat-pending').textContent   = reservations.filter(function(r) { return getComputedReservationStatus(r.checkIn, r.checkOut, r.status) === 'cancelled'; }).length;
    document.getElementById('stat-checkins').textContent  = reservations.filter(function(r) { return getComputedReservationStatus(r.checkIn, r.checkOut, r.status) === 'checked-in'; }).length;

    var rows = reservations.slice().sort(function(a, b) {
        return new Date(b.createdAt) - new Date(a.createdAt);
    }).slice(0, 5);

    document.getElementById('recentReservationsBody').innerHTML = rows.length
        ? rows.map(function(r) {
            var cs = getComputedReservationStatus(r.checkIn, r.checkOut, r.status);
            return '<tr><td>' + r.id + '</td><td>' + r.guestName + '</td><td>' + hotelName(r.hotelId) +
                   '</td><td>' + fmtDate(r.checkIn) + '</td><td>' + fmtDate(r.checkOut) +
                   '</td><td>EGP ' + r.totalPrice + '</td><td>' + badge(cs) + '</td></tr>';
        }).join('')
        : '<tr><td colspan="7">No reservations.</td></tr>';
}

function renderHotels() {
    var g = document.getElementById('hotelsGrid');
    g.innerHTML = hotels.length
        ? hotels.map(function(h) {
            return `
            <div class="hotel-card-refined">
                <div class="hotel-image-placeholder"><i class="fas fa-hotel"></i></div>
                <div class="hotel-info">
                    <h3>${h.name}</h3>
                    <div class="hotel-tags">
                        <span class="hotel-tag">${h.stars} Stars</span>
                        <span class="hotel-tag">${h.totalRooms} Rooms</span>
                    </div>
                    <p style="color:var(--color-text-muted); font-size:0.8rem; margin-bottom: 4px;"><i class="fas fa-map-marker-alt" style="margin-right:8px"></i>${h.location}</p>
                    <p style="color:var(--color-text-muted); font-size:0.8rem;"><i class="fas fa-phone" style="margin-right:8px"></i>${h.phone}</p>
                    <div class="hotel-actions">
                        <button class="btn-ghost" onclick="openHotelModal(${h.id})">Edit</button>
                        <button class="btn-ghost" style="color:var(--color-danger)" onclick="deleteHotel(${h.id})">Delete</button>
                    </div>
                </div>
            </div>`;
        }).join('')
        : '<p>No hotels yet.</p>';
}

function openHotelModal(id) {
    editHotelId = id || null;
    document.getElementById('hotelForm').reset();
    document.getElementById('hotelModalTitle').textContent = id ? 'Edit Hotel' : 'Add Hotel';
    if (id) {
        var h = hotels.find(function(h) { return h.id === id; });
        document.getElementById('hName').value     = h.name;
        document.getElementById('hStars').value    = h.stars;
        document.getElementById('hLocation').value = h.location;
        document.getElementById('hPhone').value    = h.phone;
        document.getElementById('hEmail').value    = h.email;
        document.getElementById('hRooms').value    = h.totalRooms;
    }
    document.getElementById('hotelModal').classList.add('open');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('open');
}

function saveHotel() {
    var name = document.getElementById('hName').value.trim();
    var loc  = document.getElementById('hLocation').value.trim();
    if (!name || !loc) return;
    
    var entry = {
        id: editHotelId || nextId(hotels),
        name: name,
        stars: +document.getElementById('hStars').value,
        location: loc,
        phone: document.getElementById('hPhone').value.trim(),
        email: document.getElementById('hEmail').value.trim(),
        totalRooms: +document.getElementById('hRooms').value || 0
    };
    
    if (editHotelId) {
        hotels = hotels.map(function(h) { return h.id === editHotelId ? entry : h; });
    } else {
        hotels.push(entry);
    }
    closeModal('hotelModal');
    renderHotels();
}

function deleteHotel(id) {
    if (!confirm('Delete hotel and its room types?')) return;
    hotels    = hotels.filter(function(h) { return h.id !== id; });
    hmRoomTypes = hmRoomTypes.filter(function(r) { return r.hotelId !== id; });
    renderHotels();
}

function renderRooms() {
    var sel  = document.getElementById('roomFilterHotel');
    var prev = sel.value;
    sel.innerHTML = '<option value="">All Hotels</option>' +
        hotels.map(function(h) { return '<option value="' + h.id + '">' + h.name + '</option>'; }).join('');
    sel.value = prev;
    var hid  = sel.value ? +sel.value : null;
    var list = hid ? hmRoomTypes.filter(function(r) { return r.hotelId === hid; }) : hmRoomTypes;
    document.getElementById('roomsTableBody').innerHTML = list.length
        ? list.map(function(r) {
            return `<tr>
                <td>${hotelName(r.hotelId)}</td>
                <td>${r.category}</td>
                <td>${r.name}</td>
                <td>${r.adults}A/${r.children}C</td>
                <td>${r.bedType || 'King'}</td>
                <td>EGP ${r.pricePerNight}</td>
                <td>${r.count}</td>
                <td>
                    <button class="btn-ghost" onclick="openRoomModal(${r.id})">Edit</button>
                </td>
            </tr>`;
        }).join('')
        : '<tr><td colspan="8">No room types.</td></tr>';
}

function openRoomModal(id) {
    editRoomId = id || null;
    document.getElementById('roomForm').reset();
    document.getElementById('rHotel').innerHTML =
        hotels.map(function(h) { return '<option value="' + h.id + '">' + h.name + '</option>'; }).join('');
    document.getElementById('roomModalTitle').textContent = id ? 'Edit Room Type' : 'Add Room Type';
    if (id) {
        var r = hmRoomTypes.find(function(r) { return r.id === id; });
        document.getElementById('rHotel').value     = r.hotelId;
        document.getElementById('rCategory').value  = r.category;
        document.getElementById('rName').value      = r.name;
        document.getElementById('rPrice').value     = r.pricePerNight;
    }
    document.getElementById('roomModal').classList.add('open');
}

function saveRoom() {
    var name = document.getElementById('rName').value.trim();
    var hid  = +document.getElementById('rHotel').value;
    if (!name || !hid) return;
    
    var entry = {
        id: editRoomId || nextId(hmRoomTypes),
        hotelId: hid,
        category: document.getElementById('rCategory').value,
        name: name,
        pricePerNight: +document.getElementById('rPrice').value || 100,
        count: 10,
        adults: 2, children: 0
    };
    
    if (editRoomId) {
        hmRoomTypes = hmRoomTypes.map(function(r) { return r.id === editRoomId ? entry : r; });
    } else {
        hmRoomTypes.push(entry);
    }
    closeModal('roomModal');
    renderRooms();
}

function renderAvailability() {
    var sel = document.getElementById('availHotel');
    var prev = sel.value;
    sel.innerHTML = hotels.map(function(h) {
        return '<option value="' + h.id + '">' + h.name + '</option>';
    }).join('');
    if (prev) sel.value = prev;
    renderCalendar();
}

/**
 * Returns a Set of date strings 'YYYY-MM-DD' that are booked
 * for the selected hotel (any non-cancelled reservation covering that day).
 */
function getBookedDates(hotelId) {
    var booked = new Set();
    reservations.forEach(function(r) {
        if (r.hotelId !== hotelId) return;
        var cs = getComputedReservationStatus(r.checkIn, r.checkOut, r.status);
        if (cs === 'cancelled') return;
        var cur = new Date(r.checkIn);
        var fin = new Date(r.checkOut);
        while (cur <= fin) {
            booked.add(
                cur.getFullYear() + '-' + pad(cur.getMonth() + 1) + '-' + pad(cur.getDate())
            );
            cur.setDate(cur.getDate() + 1);
        }
    });
    return booked;
}

function renderCalendar() {
    var y    = calDate.getFullYear();
    var m    = calDate.getMonth();
    var hid  = +document.getElementById('availHotel').value;
    var t    = today();
    var booked = getBookedDates(hid);

    document.getElementById('calMonthLabel').textContent =
        new Date(y, m, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });

    var html  = '';
    var first = new Date(y, m, 1).getDay();
    var total = new Date(y, m + 1, 0).getDate();

    for (var i = 0; i < first; i++) html += '<div class="cal-day empty"></div>';

    for (var d = 1; d <= total; d++) {
        var ds  = y + '-' + pad(m + 1) + '-' + pad(d);
        var isBooked    = booked.has(ds);
        var isToday     = ds === t;
        var cls = 'cal-day';
        if (isToday)       cls += ' cal-today';
        else if (isBooked) cls += ' cal-booked';
        else               cls += ' cal-available';
        html += '<div class="' + cls + '">' +
                    '<span class="cal-num">' + d + '</span>' +
                '</div>';
    }
    document.getElementById('calGrid').innerHTML = html;
}

function renderReservations() {
    document.getElementById('resFilterHotel').innerHTML =
        '<option value="">All Hotels</option>' +
        hotels.map(function(h) { return '<option value="' + h.id + '">' + h.name + '</option>'; }).join('');
    applyFilters();
}

function applyFilters() {
    var sf   = document.getElementById('resFilterStatus').value;
    var hf   = document.getElementById('resFilterHotel').value ? +document.getElementById('resFilterHotel').value : null;
    var list = reservations.filter(function(r) {
        var cs = getComputedReservationStatus(r.checkIn, r.checkOut, r.status);
        return (!sf || cs === sf) && (!hf || r.hotelId === hf);
    });
    document.getElementById('reservationsTableBody').innerHTML = list.length
        ? list.map(function(r) {
            var cs = getComputedReservationStatus(r.checkIn, r.checkOut, r.status);
            var cancelBtn = cs !== 'cancelled'
                ? '<button class="btn-cancel-row" onclick="cancelRes(\'' + r.id + '\')"><i class="fas fa-ban"></i> Cancel</button>'
                : '<span class="cancelled-label">Cancelled</span>';
            return '<tr><td>' + r.id + '</td><td>' + r.guestName + '</td><td>' + hotelName(r.hotelId) +
                   '</td><td>' + roomName(r.roomTypeId) + '</td><td>' + fmtDate(r.checkIn) +
                   '</td><td>' + fmtDate(r.checkOut) + '</td><td>' + (r.adults + r.children) +
                   '</td><td>EGP ' + r.totalPrice + '</td><td>' + badge(cs) + '</td>' +
                   '<td class="actions-cell"><button class="btn-ghost" onclick="viewRes(\'' + r.id + '\')">View</button>' +
                   cancelBtn + '</td></tr>';
        }).join('')
        : '<tr><td colspan="10">No reservations found.</td></tr>';
}

var activeResId = null;

function cancelRes(id) {
    if (!confirm('Are you sure you want to cancel this reservation? This cannot be undone.')) return;
    var r = reservations.find(function(r) { return r.id === id; });
    if (r) {
        r.status = 'cancelled';
        applyFilters();
        // If the modal is open for this reservation, refresh it
        if (activeResId === id) {
            viewRes(id);
        }
    }
}

function viewRes(id) {
    activeResId = id;
    var r = reservations.find(function(r) { return r.id === id; });
    if (!r) return;
    var cs = getComputedReservationStatus(r.checkIn, r.checkOut, r.status);
    document.getElementById('resDetailContent').innerHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px">
            <div><strong>Booking ID:</strong> ${r.id}</div>
            <div><strong>Status:</strong> ${badge(cs)}</div>
            <div><strong>Guest:</strong> ${r.guestName}</div>
            <div><strong>Hotel:</strong> ${hotelName(r.hotelId)}</div>
            <div><strong>Room:</strong> ${roomName(r.roomTypeId)}</div>
            <div><strong>Guests:</strong> ${r.adults} Adults, ${r.children} Children</div>
            <div><strong>Check-In:</strong> ${fmtDate(r.checkIn)}</div>
            <div><strong>Check-Out:</strong> ${fmtDate(r.checkOut)}</div>
            <div><strong>Total:</strong> EGP ${r.totalPrice.toLocaleString()}</div>
        </div>`;

    // Show/hide the cancel button in modal footer based on status
    var modalCancelBtn = document.getElementById('modalCancelResBtn');
    if (cs !== 'cancelled') {
        modalCancelBtn.style.display = 'inline-flex';
        modalCancelBtn.onclick = function() { cancelRes(id); };
    } else {
        modalCancelBtn.style.display = 'none';
    }

    document.getElementById('reservationModal').classList.add('open');
}

function renderReports() {
    var rev = reservations.reduce(function(s, r) { 
        var cs = getComputedReservationStatus(r.checkIn, r.checkOut, r.status);
        return cs !== 'cancelled' ? s + r.totalPrice : s; 
    }, 0);
    document.getElementById('rep-revenue').textContent  = 'EGP ' + rev.toLocaleString();
    document.getElementById('rep-bookings').textContent = reservations.length;
    document.getElementById('rep-active').textContent   = reservations.filter(function(r) { 
        var cs = getComputedReservationStatus(r.checkIn, r.checkOut, r.status);
        return cs === 'checked-in' || cs === 'confirmed'; 
    }).length;

    // Calculate Monthly Performance
    var monthlyData = {};
    reservations.forEach(r => {
        var cs = getComputedReservationStatus(r.checkIn, r.checkOut, r.status);
        if (cs !== 'cancelled') {
            var m = new Date(r.checkIn).toLocaleString('default', { month: 'short', year: 'numeric' });
            if (!monthlyData[m]) monthlyData[m] = { bookings: 0, revenue: 0 };
            monthlyData[m].bookings++;
            monthlyData[m].revenue += r.totalPrice;
        }
    });

    document.getElementById('monthlyTableBody').innerHTML = Object.keys(monthlyData).length
        ? Object.keys(monthlyData).map(m => `<tr><td>${m}</td><td>${monthlyData[m].bookings}</td><td>EGP ${monthlyData[m].revenue.toLocaleString()}</td></tr>`).join('')
        : '<tr><td colspan="3">No monthly data.</td></tr>';

    // Calculate Hotel Performance
    var hotelData = {};
    reservations.forEach(r => {
        var cs = getComputedReservationStatus(r.checkIn, r.checkOut, r.status);
        if (!hotelData[r.hotelId]) hotelData[r.hotelId] = { total: 0, revenue: 0, active: 0 };
        hotelData[r.hotelId].total++;
        if (cs !== 'cancelled') {
            hotelData[r.hotelId].revenue += r.totalPrice;
        }
        if (cs === 'checked-in' || cs === 'confirmed') {
            hotelData[r.hotelId].active++;
        }
    });

    document.getElementById('hotelPerfTableBody').innerHTML = Object.keys(hotelData).length
        ? Object.keys(hotelData).map(hid => `<tr><td>${hotelName(+hid)}</td><td>${hotelData[hid].total}</td><td>EGP ${hotelData[hid].revenue.toLocaleString()}</td><td>${hotelData[hid].active}</td></tr>`).join('')
        : '<tr><td colspan="4">No hotel performance data.</td></tr>';
}

document.addEventListener('DOMContentLoaded', function() {
    try {
        document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

        document.querySelectorAll('.sub-link').forEach(function(item) {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                showSection(this.dataset.section);
            });
        });

        document.querySelectorAll('.modal-close').forEach(function(btn) {
            btn.addEventListener('click', function() { closeModal(this.dataset.close); });
        });

        document.getElementById('addHotelBtn').addEventListener('click', function() { openHotelModal(null); });
        document.getElementById('saveHotelBtn').addEventListener('click', saveHotel);
        document.getElementById('addRoomBtn').addEventListener('click', function() { openRoomModal(null); });
        document.getElementById('saveRoomBtn').addEventListener('click', saveRoom);
        document.getElementById('roomFilterHotel').addEventListener('change', renderRooms);
        document.getElementById('availHotel').addEventListener('change', renderCalendar);
        document.getElementById('calPrev').addEventListener('click', function() { calDate.setMonth(calDate.getMonth() - 1); renderCalendar(); });
        document.getElementById('calNext').addEventListener('click', function() { calDate.setMonth(calDate.getMonth() + 1); renderCalendar(); });
        document.getElementById('resFilterStatus').addEventListener('change', applyFilters);
        document.getElementById('resFilterHotel').addEventListener('change', applyFilters);

        showSection('overview');
    } catch (e) {
        console.error("HotelManagement JS Error:", e);
        alert("HotelManagement.js Error: " + e.message);
    }
});
