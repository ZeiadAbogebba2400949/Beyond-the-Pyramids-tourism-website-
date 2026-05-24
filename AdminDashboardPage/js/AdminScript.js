/* ═══════════════════════════════════════════════════════════
   AdminScript.js — Dynamic admin dashboard
   Reads session + live bookings from AppStorage/MockData
═══════════════════════════════════════════════════════════ */

'use strict';

// ── System health cycling ──────────────────────────────────────────────────
function updateSystemHealth() {
    const statuses  = ['Excellent', 'Stable', 'Running Smoothly'];
    const statusText = document.getElementById('health-text');
    setInterval(() => {
        if (statusText) {
            statusText.textContent = statuses[Math.floor(Math.random() * statuses.length)];
        }
    }, 10000);
}

// ── Inject admin display name ──────────────────────────────────────────────
function injectAdminName() {
    let session = null;
    try {
        const local = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');
        if (local) session = JSON.parse(local);
    } catch (e) {}

    const nameEl = document.getElementById('admin-display-name');
    if (nameEl && session && session.name) {
        nameEl.textContent = session.name.split(' ')[0]; // first name only
    }
}

// ── Collect all bookings (localStorage + MockData) ─────────────────────────
function getAllBookings() {
    let bookings = [];

    // 1. localStorage bookings (placed by real users)
    if (window.AppStorage && window.AppStorage.getBookings) {
        bookings = window.AppStorage.getBookings();
    }

    // 2. Merge MockData bookings (demo data)
    if (window.MockData && window.MockData.bookings) {
        window.MockData.bookings.forEach(mb => {
            if (!bookings.some(b => b.id === mb.id)) {
                bookings.push(mb);
            }
        });
    }

    return bookings;
}

// ── Collect all users (localStorage registered + MockData) ─────────────────
function getAllUsers() {
    let users = [];

    if (window.AppStorage && window.AppStorage.getRegisteredUsers) {
        users = window.AppStorage.getRegisteredUsers();
    }

    if (window.MockData && window.MockData.users) {
        window.MockData.users.forEach(mu => {
            if (!users.some(u => u.email === mu.email)) {
                users.push(mu);
            }
        });
    }

    return users;
}

// ── Format a timestamp nicely ──────────────────────────────────────────────
function formatRelativeTime(ts) {
    if (!ts) return '—';
    const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
    if (diff < 60)  return diff + 's ago';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    return new Date(ts).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
}

// ── Update stat cards with live counts ────────────────────────────────────
function updateStatCards() {
    const bookings  = getAllBookings();
    const users     = getAllUsers();
    const revenue   = bookings.reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0);

    // Total Users
    const userStatEl = document.querySelector('.stat-card:nth-child(1) .stat-number');
    if (userStatEl) userStatEl.textContent = users.length.toLocaleString();

    // Total Bookings
    const bookingStatEl = document.querySelector('.stat-card:nth-child(2) .stat-number');
    if (bookingStatEl) bookingStatEl.textContent = bookings.length.toLocaleString();

    // Total Revenue
    const revenueStatEl = document.querySelector('.stat-card:nth-child(3) .stat-number');
    if (revenueStatEl && revenue > 0) {
        revenueStatEl.textContent = 'EGP ' + revenue.toLocaleString();
    }
}

// ── Populate Recent Activities table with real bookings ───────────────────
function populateRecentActivities() {
    const tbody = document.querySelector('.activity-table tbody');
    if (!tbody) return;

    const bookings = getAllBookings();

    // Take 5 most recent
    const recent = bookings.slice(0, 5);

    if (recent.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align:center; color:var(--color-text-muted); padding:24px;">
                    No bookings yet.
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = recent.map(b => {
        const name      = b.userName || b.userEmail?.split('@')[0] || 'Guest';
        const pkg       = b.packageName || b.title || 'Package Booking';
        const timeLabel = formatRelativeTime(b.timestamp || b.bookingDate);
        const statusCls = (b.status || 'confirmed').toLowerCase();

        return `
            <tr>
                <td>
                    <div style="display:flex;align-items:center;gap:8px;">
                        <div style="
                            width:30px; height:30px; border-radius:50%;
                            background:rgba(197,160,89,0.15);
                            display:flex; align-items:center; justify-content:center;
                            font-size:0.75rem; font-weight:700; color:var(--gold-primary);
                            flex-shrink:0;">
                            ${name.charAt(0).toUpperCase()}
                        </div>
                        <span>${name}</span>
                    </div>
                </td>
                <td>
                    <span>Booked <em>${pkg}</em></span>
                    <span class="badge badge-${statusCls}" style="margin-left:8px;font-size:0.7rem;">
                        ${b.status || 'confirmed'}
                    </span>
                </td>
                <td style="white-space:nowrap;">${timeLabel}</td>
            </tr>`;
    }).join('');
}

// ── Main entry point ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

    // Access guard (kept from original)
    if (typeof PlatformErrorHandler !== 'undefined') {
        if (!PlatformErrorHandler.checkAccess('Admin')) return;
    }

    injectAdminName();
    updateSystemHealth();
    updateStatCards();
    populateRecentActivities();
});