// ═══════════════════════════════════════════════════════
//  Reports & Analytics — aligned with the updated admin model
//  Data sources: window.MockData (mockData.js)
// ═══════════════════════════════════════════════════════

// ── Colour palette (reused across all charts) ──────────
const GOLD    = 'rgba(197,160,89,0.85)';
const GOLD_B  = '#C5A059';
const GREEN   = 'rgba(39,174,96,0.8)';
const GREEN_B = '#27AE60';
const RED     = 'rgba(220,53,69,0.75)';
const RED_B   = '#dc3545';
const BLUE    = 'rgba(41,128,185,0.8)';
const BLUE_B  = '#2980B9';
const MUTED   = 'rgba(150,150,150,0.6)';

// ── Live mock data pulled straight from MockData ───────
// (The individual management pages keep their own local copies;
//  here we snapshot the global source for cross-module reporting.)

const MD = window.MockData || {};

// Convenience accessors — fallback to [] if data isn't loaded
const getUsers        = () => MD.users              || [];
const getPackages     = () => MD.packages            || [];
const getBookings     = () => MD.bookings            || [];   // package bookings
const getHotels       = () => MD.hotels              || [];
const getHotelRes     = () => MD.hotelReservations   || [];
const getTransport    = () => MD.transportBookings   || [];
const getReviews      = () => MD.websiteReviews      || [];

// ── Chart instances (kept for .destroy() on re-render) ─
let usersChart, pkgStatusChart, pkgRevenueChart;
let hotelStatusChart, hotelRevenueChart;
let transportStatusChart, transportVehicleChart;
let ratingChart;

// ── Review filter state ────────────────────────────────
let reviewFilters = { startDate: '', endDate: '' };

// ── Review data (static, not in MockData) ─────────────
const websiteReviews = [
    { user: 'Emily Carter',    rating: 5, review: 'Incredible experience, seamless booking!',    date: '2026-01-20' },
    { user: 'Hans Müller',     rating: 4, review: 'Very professional guides and drivers.',        date: '2026-02-15' },
    { user: 'Fatima Al-Rashid',rating: 5, review: 'Best travel platform I have used.',           date: '2026-02-28' },
    { user: 'Ahmed Traveler',  rating: 4, review: 'Great value packages, loved Luxor tour.',     date: '2026-03-01' },
    { user: 'Yuki Tanaka',     rating: 5, review: 'Flawless organisation, highly recommend.',    date: '2026-03-15' },
    { user: 'Liam O\'Brien',   rating: 3, review: 'Good overall, minor hiccups with transport.', date: '2026-04-01' },
    { user: 'Sofia Martínez',  rating: 5, review: 'Magical — Egypt exceeded all expectations!', date: '2026-04-05' },
    { user: 'James Okafor',    rating: 4, review: 'Beautiful country, great team.',              date: '2026-04-10' }
];

// ═══════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════

function statCard(label, value, icon = '', colorStyle = '') {
    return `
        <div class="stat-card">
            ${icon ? `<div class="stat-icon" style="${colorStyle}"><i class="${icon}"></i></div>` : ''}
            <div class="stat-info">
                <h3>${label}</h3>
                <div class="stat-value">${value}</div>
            </div>
        </div>`;
}

function badgePill(text, type) {
    const map = {
        confirmed:    'badge-confirmed',
        'checked-in': 'badge-checkin',
        'checked-out':'badge-checkout',
        cancelled:    'badge-cancelled',
        active:       'badge-active',
        suspended:    'badge-suspended',
        admin:        'badge-admin',
        user:         'badge-user'
    };
    return `<span class="${map[type] || 'badge-role'}">${text}</span>`;
}

function destroyChart(chartRef) {
    if (chartRef) { try { chartRef.destroy(); } catch(e) {} }
}

function donutChart(ctx, labels, data, colors) {
    return new Chart(ctx, {
        type: 'doughnut',
        data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 2 }] },
        options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { position: 'bottom' } } }
    });
}

function barChart(ctx, labels, data, label, color = GOLD, borderColor = GOLD_B) {
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{ label, data, backgroundColor: color, borderColor, borderWidth: 1, borderRadius: 6 }]
        },
        options: {
            responsive: true, maintainAspectRatio: true,
            plugins: { legend: { position: 'top' } },
            scales: { y: { beginAtZero: true } }
        }
    });
}

// ═══════════════════════════════════════════════════════
//  SECTION 0 — KPI Summary Row
// ═══════════════════════════════════════════════════════

function renderKPIRow() {
    const users     = getUsers();
    const bookings  = getBookings();
    const hotelRes  = getHotelRes();
    const transport = getTransport();

    const totalUsers      = users.length;
    const confirmedPkg    = bookings.filter(b => b.status !== 'cancelled').length;
    const confirmedHotel  = hotelRes.filter(r => r.status !== 'cancelled').length;
    const confirmedTrans  = transport.filter(t => t.status === 'confirmed').length;

    // Revenue from hotel reservations
    const hotelRevenue = hotelRes
        .filter(r => r.status !== 'cancelled')
        .reduce((sum, r) => sum + (r.totalPrice || 0), 0);

    document.getElementById('kpiRow').innerHTML = `
        ${statCard('Total Users',          totalUsers,     'fas fa-users',          'color:#C5A059;background:rgba(197,160,89,0.1)')}
        ${statCard('Active Pkg Bookings',  confirmedPkg,   'fas fa-boxes-packing',  'color:#27AE60;background:rgba(39,174,96,0.1)')}
        ${statCard('Hotel Reservations',   confirmedHotel, 'fas fa-hotel',          'color:#2980B9;background:rgba(41,128,185,0.1)')}
        ${statCard('Transport Bookings',   confirmedTrans, 'fas fa-shuttle-van',    'color:#8e44ad;background:rgba(142,68,173,0.1)')}
        ${statCard('Hotel Revenue (EGP)',  `EGP ${hotelRevenue.toLocaleString()}`, 'fas fa-coins', 'color:#C5A059;background:rgba(197,160,89,0.1)')}
    `;
}

// ═══════════════════════════════════════════════════════
//  SECTION 1 — User Accounts
// ═══════════════════════════════════════════════════════

function renderUsers() {
    const roleFilter   = document.getElementById('userRoleFilter').value;
    const statusFilter = document.getElementById('userStatusFilter').value;

    let users = getUsers().filter(u =>
        (roleFilter === 'all'   || u.role   === roleFilter) &&
        (statusFilter === 'all' || u.status === statusFilter)
    );

    const totalUsers    = getUsers().length;
    const adminCount    = getUsers().filter(u => u.role   === 'admin').length;
    const userCount     = getUsers().filter(u => u.role   === 'user').length;
    const suspendedCount= getUsers().filter(u => u.status === 'suspended').length;

    document.getElementById('userStatsGrid').innerHTML = `
        ${statCard('Total Accounts', totalUsers,     'fas fa-users',       'color:#C5A059;background:rgba(197,160,89,0.1)')}
        ${statCard('Admins',         adminCount,     'fas fa-user-shield', 'color:#C5A059;background:rgba(197,160,89,0.1)')}
        ${statCard('Users',          userCount,      'fas fa-user',        'color:#27AE60;background:rgba(39,174,96,0.1)')}
        ${statCard('Suspended',      suspendedCount, 'fas fa-user-slash',  'color:#dc3545;background:rgba(220,53,69,0.1)')}
    `;

    // Chart
    destroyChart(usersChart);
    const ctx = document.getElementById('usersChart').getContext('2d');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const adminCounts = new Array(12).fill(0);
    const userCounts  = new Array(12).fill(0);
    getUsers().forEach(u => {
        const m = u.joinDate ? new Date(u.joinDate).getMonth() : -1;
        if (m < 0) return;
        if (u.role === 'admin') adminCounts[m]++;
        else                    userCounts[m]++;
    });
    usersChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [
                { label: 'Admins', data: adminCounts, backgroundColor: GOLD,  borderColor: GOLD_B, borderWidth:1, borderRadius:4 },
                { label: 'Users',  data: userCounts,  backgroundColor: GREEN, borderColor: GREEN_B,borderWidth:1, borderRadius:4 }
            ]
        },
        options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true, stacked: true }, x: { stacked: true } } }
    });

    // Table
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = users.length === 0
        ? '<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--color-text-muted);">No accounts match filter.</td></tr>'
        : users.map(u => `
            <tr>
                <td style="font-weight:600;">${u.name}</td>
                <td>${u.email}</td>
                <td>${badgePill(u.role === 'admin' ? 'Admin' : 'User', u.role)}</td>
                <td>${u.nationality || '—'}</td>
                <td>${badgePill(u.status, u.status)}</td>
                <td>${u.joinDate || '—'}</td>
            </tr>`).join('');
}

// ═══════════════════════════════════════════════════════
//  SECTION 2 — Package Bookings
// ═══════════════════════════════════════════════════════

let pkgFilters = { status: 'all', startDate: '', endDate: '' };

function renderPackages() {
    const statusFilter = document.getElementById('packageStatusFilter').value;
    const startDate    = document.getElementById('pkgStartDate').value;
    const endDate      = document.getElementById('pkgEndDate').value;

    let bookings = getBookings().filter(b => {
        const matchStatus = statusFilter === 'all' || b.status === statusFilter;
        const matchStart  = !startDate || (b.startDate || b.date || '') >= startDate;
        const matchEnd    = !endDate   || (b.startDate || b.date || '') <= endDate;
        return matchStatus && matchStart && matchEnd;
    });

    // Status counts
    const counts = { confirmed: 0, 'checked-in': 0, 'checked-out': 0, cancelled: 0 };
    bookings.forEach(b => { if (counts[b.status] !== undefined) counts[b.status]++; });

    // Package popularity
    const pkgCount = {};
    bookings.forEach(b => { pkgCount[b.packageName || b.packageId || 'Unknown'] = (pkgCount[b.packageName || b.packageId || 'Unknown'] || 0) + 1; });
    const sorted = Object.entries(pkgCount).sort((a,b) => b[1]-a[1]);

    document.getElementById('pkgStatsGrid').innerHTML = `
        ${statCard('Total Bookings',  bookings.length,           'fas fa-ticket-alt',   'color:#C5A059;background:rgba(197,160,89,0.1)')}
        ${statCard('Confirmed',       counts['confirmed'],        'fas fa-check-circle', 'color:#27AE60;background:rgba(39,174,96,0.1)')}
        ${statCard('Checked-In',      counts['checked-in'],       'fas fa-door-open',    'color:#2980B9;background:rgba(41,128,185,0.1)')}
        ${statCard('Checked-Out',     counts['checked-out'],      'fas fa-door-closed',  'color:#8e44ad;background:rgba(142,68,173,0.1)')}
        ${statCard('Cancelled',       counts['cancelled'],        'fas fa-ban',          'color:#dc3545;background:rgba(220,53,69,0.1)')}
    `;

    // Donut: statuses
    destroyChart(pkgStatusChart);
    pkgStatusChart = donutChart(
        document.getElementById('pkgStatusChart').getContext('2d'),
        ['Confirmed','Checked-In','Checked-Out','Cancelled'],
        [counts['confirmed'], counts['checked-in'], counts['checked-out'], counts['cancelled']],
        [GREEN, BLUE, GOLD, RED]
    );

    // Bar: popularity
    destroyChart(pkgRevenueChart);
    pkgRevenueChart = barChart(
        document.getElementById('pkgRevenueChart').getContext('2d'),
        sorted.map(e => e[0]).slice(0,8),
        sorted.map(e => e[1]).slice(0,8),
        'Bookings per Package', GOLD, GOLD_B
    );

    // Highlights
    document.getElementById('pkgHighlights').innerHTML = sorted.length > 0 ? `
        <div class="highlight-card most-popular">
            <i class="fas fa-fire"></i>
            <div>
                <h4>Most Popular Package</h4>
                <p>${sorted[0][0]} — ${sorted[0][1]} booking${sorted[0][1]!==1?'s':''}</p>
            </div>
        </div>
        ${sorted.length > 1 ? `
        <div class="highlight-card least-popular">
            <i class="fas fa-snowflake"></i>
            <div>
                <h4>Least Popular Package</h4>
                <p>${sorted[sorted.length-1][0]} — ${sorted[sorted.length-1][1]} booking${sorted[sorted.length-1][1]!==1?'s':''}</p>
            </div>
        </div>` : ''}
    ` : '';
}

// ═══════════════════════════════════════════════════════
//  SECTION 3 — Hotel Reservations
// ═══════════════════════════════════════════════════════

function populateHotelFilter() {
    const sel = document.getElementById('hotelFilter');
    sel.innerHTML = '<option value="all">All Hotels</option>';
    getHotels().forEach(h => {
        sel.innerHTML += `<option value="${h.id}">${h.name}</option>`;
    });
}

function renderHotels() {
    const hotelFilter  = document.getElementById('hotelFilter').value;
    const statusFilter = document.getElementById('hotelStatusFilter').value;

    let reservations = getHotelRes().filter(r =>
        (hotelFilter  === 'all' || r.hotelId === hotelFilter) &&
        (statusFilter === 'all' || r.status  === statusFilter)
    );

    const counts = { confirmed: 0, 'checked-in': 0, 'checked-out': 0, cancelled: 0 };
    reservations.forEach(r => { if (counts[r.status] !== undefined) counts[r.status]++; });

    // Revenue by hotel
    const revenueByHotel = {};
    getHotels().forEach(h => { revenueByHotel[h.name] = 0; });
    reservations.filter(r => r.status !== 'cancelled').forEach(r => {
        const hotel = getHotels().find(h => h.id === r.hotelId);
        if (!hotel) return;
        revenueByHotel[hotel.name] = (revenueByHotel[hotel.name] || 0) + (r.totalPrice || 0);
    });
    const totalRevenue = Object.values(revenueByHotel).reduce((s,v)=>s+v,0);

    document.getElementById('hotelStatsGrid').innerHTML = `
        ${statCard('Total Reservations', reservations.length,    'fas fa-bed',          'color:#2980B9;background:rgba(41,128,185,0.1)')}
        ${statCard('Confirmed',          counts['confirmed'],     'fas fa-check-circle', 'color:#27AE60;background:rgba(39,174,96,0.1)')}
        ${statCard('Checked-In',         counts['checked-in'],   'fas fa-door-open',    'color:#C5A059;background:rgba(197,160,89,0.1)')}
        ${statCard('Checked-Out',        counts['checked-out'],  'fas fa-door-closed',  'color:#8e44ad;background:rgba(142,68,173,0.1)')}
        ${statCard('Cancelled',          counts['cancelled'],     'fas fa-ban',          'color:#dc3545;background:rgba(220,53,69,0.1)')}
        ${statCard('Revenue (EGP)',       `EGP ${totalRevenue.toLocaleString()}`, 'fas fa-coins', 'color:#C5A059;background:rgba(197,160,89,0.1)')}
    `;

    destroyChart(hotelStatusChart);
    hotelStatusChart = donutChart(
        document.getElementById('hotelStatusChart').getContext('2d'),
        ['Confirmed','Checked-In','Checked-Out','Cancelled'],
        [counts['confirmed'], counts['checked-in'], counts['checked-out'], counts['cancelled']],
        [GREEN, GOLD, BLUE, RED]
    );

    destroyChart(hotelRevenueChart);
    const hotelNames = Object.keys(revenueByHotel).filter(k => revenueByHotel[k] > 0);
    hotelRevenueChart = barChart(
        document.getElementById('hotelRevenueChart').getContext('2d'),
        hotelNames,
        hotelNames.map(k => revenueByHotel[k]),
        'Revenue per Hotel (EGP)', BLUE, BLUE_B
    );

    // Table
    const tbody = document.getElementById('hotelTableBody');
    tbody.innerHTML = reservations.length === 0
        ? '<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--color-text-muted);">No reservations match filter.</td></tr>'
        : reservations.map(r => {
            const hotel  = getHotels().find(h => h.id === r.hotelId);
            const total  = r.totalPrice || 0;
            return `<tr>
                <td><strong>${r.id}</strong></td>
                <td>${r.guestName || '—'}</td>
                <td>${hotel ? hotel.name : r.hotelId}</td>
                <td>${r.checkIn  || '—'}</td>
                <td>${r.checkOut || '—'}</td>
                <td style="font-weight:600;color:var(--color-success);">EGP ${total.toLocaleString()}</td>
                <td>${badgePill(r.status, r.status)}</td>
            </tr>`;
        }).join('');
}

// ═══════════════════════════════════════════════════════
//  SECTION 4 — Transportation Bookings
// ═══════════════════════════════════════════════════════

function renderTransport() {
    const statusFilter = document.getElementById('transportStatusFilter').value;

    let bookings = getTransport().filter(b =>
        statusFilter === 'all' || b.status === statusFilter
    );

    const confirmed  = bookings.filter(b => b.status === 'confirmed').length;
    const cancelled  = bookings.filter(b => b.status === 'cancelled').length;

    // Bookings by vehicle type
    const byType = {};
    getTransport().forEach(b => {
        const t = b.vehicleType || 'Unknown';
        byType[t] = (byType[t] || 0) + 1;
    });

    document.getElementById('transportStatsGrid').innerHTML = `
        ${statCard('Total Bookings', bookings.length, 'fas fa-list',         'color:#8e44ad;background:rgba(142,68,173,0.1)')}
        ${statCard('Confirmed',      confirmed,        'fas fa-check-circle', 'color:#27AE60;background:rgba(39,174,96,0.1)')}
        ${statCard('Cancelled',      cancelled,        'fas fa-ban',          'color:#dc3545;background:rgba(220,53,69,0.1)')}
    `;

    destroyChart(transportStatusChart);
    transportStatusChart = donutChart(
        document.getElementById('transportStatusChart').getContext('2d'),
        ['Confirmed','Cancelled'],
        [getTransport().filter(b=>b.status==='confirmed').length, getTransport().filter(b=>b.status==='cancelled').length],
        [GREEN, RED]
    );

    destroyChart(transportVehicleChart);
    transportVehicleChart = barChart(
        document.getElementById('transportVehicleChart').getContext('2d'),
        Object.keys(byType),
        Object.values(byType),
        'Bookings by Vehicle Type',
        'rgba(142,68,173,0.75)', '#8e44ad'
    );
}

// ═══════════════════════════════════════════════════════
//  SECTION 5 — Reviews
// ═══════════════════════════════════════════════════════

function renderReviews() {
    const sd = document.getElementById('reviewStartDate').value;
    const ed = document.getElementById('reviewEndDate').value;

    const filtered = websiteReviews.filter(r =>
        (!sd || r.date >= sd) && (!ed || r.date <= ed)
    );

    const avg = filtered.length > 0
        ? filtered.reduce((s, r) => s + r.rating, 0) / filtered.length
        : 0;

    document.getElementById('overallRating').textContent = avg.toFixed(1);
    document.getElementById('reviewCount').textContent   = `Based on ${filtered.length} review${filtered.length !== 1 ? 's' : ''}`;

    const full = Math.floor(avg), half = avg % 1 >= 0.5;
    let stars = '★'.repeat(full);
    if (half) stars += '½';
    stars += '☆'.repeat(5 - full - (half ? 1 : 0));
    document.getElementById('starDisplay').innerHTML = stars;

    document.getElementById('reviewsList').innerHTML = filtered.length === 0
        ? '<div style="color:var(--color-text-muted);padding:20px;">No reviews in range.</div>'
        : filtered.map(r => `
            <div class="review-item">
                <div class="review-header">
                    <strong>${r.user}</strong>
                    <span style="color:#F1C40F;">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</span>
                    <span class="review-date">${r.date}</span>
                </div>
                <p class="review-text">"${r.review}"</p>
            </div>`).join('');

    // Donut by star count
    const starCounts = [0,0,0,0,0];
    filtered.forEach(r => { if (r.rating >= 1 && r.rating <= 5) starCounts[r.rating-1]++; });

    destroyChart(ratingChart);
    ratingChart = new Chart(document.getElementById('ratingChart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['1 ★','2 ★','3 ★','4 ★','5 ★'],
            datasets: [{
                label: 'Reviews',
                data: starCounts,
                backgroundColor: [RED, 'rgba(230,126,34,0.7)', MUTED, BLUE, GREEN],
                borderRadius: 6
            }]
        },
        options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });
}

// ═══════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════

function setDefaultDates() {
    const today    = new Date();
    const sixAgo   = new Date(); sixAgo.setMonth(sixAgo.getMonth() - 6);
    const threeAgo = new Date(); threeAgo.setMonth(threeAgo.getMonth() - 3);

    document.getElementById('pkgStartDate').value     = threeAgo.toISOString().split('T')[0];
    document.getElementById('pkgEndDate').value       = today.toISOString().split('T')[0];
    document.getElementById('reviewStartDate').value  = sixAgo.toISOString().split('T')[0];
    document.getElementById('reviewEndDate').value    = today.toISOString().split('T')[0];
}

function attachListeners() {
    // Users
    document.getElementById('userRoleFilter').addEventListener('change',   renderUsers);
    document.getElementById('userStatusFilter').addEventListener('change',  renderUsers);

    // Packages
    document.getElementById('packageStatusFilter').addEventListener('change', renderPackages);
    document.getElementById('applyPkgFilter').addEventListener('click',       renderPackages);
    document.getElementById('resetPkgFilter').addEventListener('click', () => {
        setDefaultDates();
        document.getElementById('packageStatusFilter').value = 'all';
        renderPackages();
    });

    // Hotels
    document.getElementById('hotelFilter').addEventListener('change',       renderHotels);
    document.getElementById('hotelStatusFilter').addEventListener('change', renderHotels);

    // Transport
    document.getElementById('transportStatusFilter').addEventListener('change', renderTransport);

    // Reviews
    document.querySelector('.apply-review-btn').addEventListener('click', renderReviews);
    document.querySelector('.reset-review-btn').addEventListener('click', () => {
        const today  = new Date();
        const sixAgo = new Date(); sixAgo.setMonth(sixAgo.getMonth() - 6);
        document.getElementById('reviewStartDate').value = sixAgo.toISOString().split('T')[0];
        document.getElementById('reviewEndDate').value   = today.toISOString().split('T')[0];
        renderReviews();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setDefaultDates();
    populateHotelFilter();
    attachListeners();

    renderKPIRow();
    renderUsers();
    renderPackages();
    renderHotels();
    renderTransport();
    renderReviews();
});