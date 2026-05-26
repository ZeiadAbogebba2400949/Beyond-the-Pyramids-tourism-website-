'use strict';

document.addEventListener('DOMContentLoaded', () => {
    if (typeof PlatformErrorHandler !== 'undefined') {
        if (!PlatformErrorHandler.checkAccess('Tourist')) return;
    }

    setTimeGreeting();
    injectDashboardData();
    animateCounters();
});

function setTimeGreeting() {
    const hour = new Date().getHours();
    let greeting = 'Good evening';
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 17) greeting = 'Good afternoon';

    const el = document.getElementById('timeGreeting');
    if (el) el.textContent = greeting;
}

function injectDashboardData() {
    const session = getSession();
    const user = getUserRecord(session);
    const bookings = getUserBookings(session);
    const packages = getPackages();
    const stats = buildStats(bookings, packages);
    const nextTrip = getNextTrip(bookings, packages);

    updateStats(stats);
    renderNextTrip(nextTrip);
    renderDraft();
    renderStories(session, user);
}

function getSession() {
    try {
        if (window.AppStorage && AppStorage.getUserSession) {
            const appSession = AppStorage.getUserSession();
            if (appSession && appSession.email) return appSession;
        }

        const raw = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

function getUserRecord(session) {
    if (!session || !session.email) return null;

    try {
        if (window.AppStorage && AppStorage.getUserByEmail) {
            const user = AppStorage.getUserByEmail(session.email);
            if (user) return user;
        }

        if (window.MockData && Array.isArray(MockData.users)) {
            return MockData.users.find(u => u.email && u.email.toLowerCase() === session.email.toLowerCase()) || null;
        }
    } catch (e) {
        return null;
    }

    return null;
}

function getUserBookings(session) {
    if (!session || !session.email) return [];

    try {
        if (window.AppStorage && AppStorage.getUserBookings) {
            return AppStorage.getUserBookings(session.email) || [];
        }
    } catch (e) {
        return [];
    }

    return [];
}

function getPackages() {
    try {
        if (window.AppStorage && AppStorage.getPackages) return AppStorage.getPackages() || [];
        if (window.MockData && Array.isArray(MockData.packages)) return MockData.packages;
    } catch (e) {
        return [];
    }

    return [];
}

function buildStats(bookings, packages) {
    const activeBookings = bookings.filter(b => getBookingStatus(b) !== 'cancelled');
    const completedBookings = activeBookings.filter(b => getBookingStatus(b) === 'checked-out');
    const tripCount = activeBookings.length;

    const cities = new Set();
    const sites = new Set();

    activeBookings.forEach(booking => {
        const pkg = findPackageForBooking(booking, packages);
        const city = booking.city || booking.location || pkg?.city || pkg?.location;
        const packageName = booking.packageName || booking.tripName || pkg?.name;

        splitLocationText(city).forEach(item => cities.add(item));
        splitLocationText(packageName).forEach(item => sites.add(item));

        if (Array.isArray(booking.places)) {
            booking.places.forEach(place => {
                if (place) sites.add(String(place).trim());
            });
        }
    });

    return {
        monuments: Math.max(sites.size, completedBookings.length),
        cities: cities.size,
        trips: tripCount,
        level: getJourneyLevel(tripCount)
    };
}

function splitLocationText(value) {
    if (!value) return [];
    return String(value)
        .split(/,|&|\band\b| to /i)
        .map(item => item.trim())
        .filter(Boolean);
}

function getJourneyLevel(tripCount) {
    if (tripCount >= 8) return 'Legend';
    if (tripCount >= 5) return 'Voyager';
    if (tripCount >= 2) return 'Explorer';
    return 'Initiate';
}

function updateStats(stats) {
    setCounterTarget('stat-monuments', stats.monuments);
    setCounterTarget('stat-cities', stats.cities);
    setCounterTarget('stat-trips', stats.trips);

    const level = document.getElementById('stat-level');
    if (level) level.textContent = stats.level;
}

function setCounterTarget(id, value) {
    const el = document.getElementById(id);
    if (!el) return;

    const safeValue = Number.isFinite(value) ? value : 0;
    el.dataset.target = String(safeValue);
    el.textContent = '0';
}

function getNextTrip(bookings, packages) {
    const sorted = bookings
        .filter(b => getBookingStatus(b) !== 'cancelled')
        .map(booking => ({ booking, start: parseBookingDate(booking) }))
        .filter(entry => entry.start)
        .sort((a, b) => a.start - b.start);

    const today = startOfDay(new Date());
    const upcoming = sorted.find(entry => startOfDay(entry.start) >= today);
    const selected = upcoming || sorted[sorted.length - 1];

    if (!selected) return null;

    const booking = selected.booking;
    const pkg = findPackageForBooking(booking, packages);
    const status = getBookingStatus(booking);
    const endDate = parseBookingEndDate(booking);
    const dateLabel = formatDateRange(selected.start, endDate, booking.date);

    return {
        title: booking.packageName || booking.tripName || pkg?.name || 'Your Egyptian Journey',
        date: dateLabel,
        people: booking.travelers || booking.peopleCount || 1,
        image: booking.image || pkg?.image || '../WebsiteBanner.png',
        status: getStatusLabel(status),
        daysUntil: Math.max(0, Math.ceil((startOfDay(selected.start) - today) / 86400000))
    };
}

function renderNextTrip(trip) {
    const tripContainer = document.getElementById('next-trip-container');
    if (!tripContainer) return;

    if (!trip) {
        tripContainer.innerHTML = `
            <div class="hero-card">
                <div class="hero-card__media">
                    <img src="../WebsiteBanner.png" alt="Beyond the Pyramids">
                </div>
                <div class="hero-card__gradient"></div>
                <div class="hero-card__body">
                    <span class="hero-badge"><i class="fas fa-compass"></i> Ready when you are</span>
                    <h2 class="hero-card__title">No journeys booked yet</h2>
                    <div class="hero-card__meta">
                        <span><i class="far fa-calendar"></i> Choose your first date</span>
                        <span><i class="far fa-user"></i> Your party awaits</span>
                    </div>
                    <div class="hero-card__actions">
                        <a href="../DayPackages/dayPackages.html" class="hero-btn hero-btn--primary">Explore Packages</a>
                    </div>
                </div>
            </div>
        `;
        return;
    }

    tripContainer.innerHTML = `
        <div class="hero-card">
            <div class="hero-card__media">
                <img src="${trip.image}" alt="${escapeHtml(trip.title)}">
            </div>
            <div class="hero-card__gradient"></div>
            <div class="hero-card__body">
                <span class="hero-badge"><i class="fas fa-check-circle"></i> ${trip.status}</span>
                <h2 class="hero-card__title">${escapeHtml(trip.title)}</h2>
                <div class="hero-card__meta">
                    <span><i class="far fa-calendar"></i> ${trip.date}</span>
                    <span><i class="far fa-user"></i> ${trip.people} ${trip.people > 1 ? 'Travelers' : 'Traveler'}</span>
                </div>
                <div class="hero-card__actions">
                    <a href="../BookingDetailsPage/booking-details.html" class="hero-btn hero-btn--primary">View Voucher</a>
                </div>
            </div>
            <div class="hero-card__side">
                <div class="countdown-ring">
                    <span class="ring-num">${trip.daysUntil}</span>
                    <span class="ring-label">Days</span>
                </div>
            </div>
        </div>
    `;
}

function renderDraft() {
    const draftContainer = document.getElementById('draft-container');
    if (!draftContainer) return;

    let draft = null;
    try {
        draft = window.AppStorage && AppStorage.getDraft ? AppStorage.getDraft() : null;
    } catch (e) {
        draft = null;
    }

    const currentBooking = getCurrentBooking();
    const hasCustomPending = currentBooking && currentBooking.isCustom;

    if (!draft && !hasCustomPending) {
        draftContainer.innerHTML = '<p class="muted">No active blueprints currently.</p>';
        return;
    }

    const title = draft?.packageName || draft?.title || currentBooking?.packageName || 'Custom Architect Journey';
    const progress = draft?.progress || (hasCustomPending ? 75 : 35);
    const updatedLabel = draft?.updatedAt
        ? formatRelativeDate(new Date(draft.updatedAt))
        : (currentBooking?.timestamp ? formatRelativeDate(new Date(currentBooking.timestamp)) : 'Recently updated');

    draftContainer.innerHTML = `
        <div class="draft-card-mini">
            <h4>${escapeHtml(title)}</h4>
            <div class="draft-progress">
                <div class="progress-fill" style="width: 0%"></div>
            </div>
            <div class="draft-meta">
                <span>${progress}% complete</span>
                <span>${updatedLabel}</span>
            </div>
        </div>
    `;

    setTimeout(() => {
        const fill = draftContainer.querySelector('.progress-fill');
        if (fill) fill.style.width = progress + '%';
    }, 300);
}

function getCurrentBooking() {
    try {
        if (window.AppStorage && AppStorage.getCurrentBooking) return AppStorage.getCurrentBooking();
        const raw = localStorage.getItem('currentBooking');
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

function renderStories(session, user) {
    const feed = document.getElementById('story-feed');
    if (!feed) return;

    const displayName = user?.name || session?.name || session?.email?.split('@')[0] || 'Traveler';
    const userReviews = getReviews()
        .filter(review => {
            const reviewUser = review.user || review.userName || review.name || '';
            const reviewEmail = review.email || review.userEmail || '';
            return reviewEmail.toLowerCase() === (session?.email || '').toLowerCase()
                || reviewUser.toLowerCase() === displayName.toLowerCase();
        })
        .slice(0, 3);

    const reviewsToShow = userReviews.length ? userReviews : getReviews().slice(0, 3);

    if (!reviewsToShow.length) {
        feed.innerHTML = `
            <article class="story-item">
                <div class="story-content">
                    <h5>Your story belongs here</h5>
                    <p class="story-text">Share a review after your next journey.</p>
                </div>
            </article>
        `;
        return;
    }

    feed.innerHTML = reviewsToShow.map(review => {
        const name = review.user || review.userName || review.name || displayName;
        const text = review.review || review.text || review.title || 'A memorable journey with Beyond the Pyramids.';
        const avatar = user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

        return `
            <article class="story-item">
                <img src="${avatar}" alt="${escapeHtml(name)}" class="story-avatar">
                <div class="story-content">
                    <h5>${escapeHtml(name)}</h5>
                    <p class="story-text">"${escapeHtml(text)}"</p>
                </div>
            </article>
        `;
    }).join('');
}

function getReviews() {
    const reviews = [];

    try {
        const storedKeys = ['websiteReviews', 'beyondPyramids_reviews', 'customerReviews'];
        storedKeys.forEach(key => {
            const raw = localStorage.getItem(key);
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) reviews.push(...parsed);
        });
    } catch (e) {
        // Ignore malformed optional review stores.
    }

    if (window.MockData && Array.isArray(MockData.websiteReviews)) {
        reviews.push(...MockData.websiteReviews);
    }

    return reviews;
}

function findPackageForBooking(booking, packages) {
    if (!booking || !packages.length) return null;

    return packages.find(pkg => pkg.id === booking.packageId)
        || packages.find(pkg => pkg.name === booking.packageName)
        || null;
}

function getBookingStatus(booking) {
    const lowerStatus = (booking.status || 'confirmed').toLowerCase();
    if (lowerStatus === 'cancelled' || lowerStatus === 'canceled') return 'cancelled';

    const start = parseBookingDate(booking);
    if (!start) return lowerStatus;

    const today = startOfDay(new Date());
    const startDay = startOfDay(start);
    const end = parseBookingEndDate(booking);
    const endDay = end ? startOfDay(end) : startDay;

    if (today < startDay) return 'confirmed';
    if (today >= startDay && today <= endDay) return 'checked-in';
    return 'checked-out';
}

function parseBookingDate(booking) {
    const raw = booking.startDate || booking.date || booking.travelDate || booking.bookingDate || booking.timestamp;
    return parseFlexibleDate(raw);
}

function parseBookingEndDate(booking) {
    const raw = booking.endDate || booking.checkoutDate;
    return parseFlexibleDate(raw);
}

function parseFlexibleDate(value) {
    if (!value) return null;

    const text = String(value);
    const firstPart = text.includes(' to ') ? text.split(' to ')[0] : text;
    const date = new Date(firstPart);
    return Number.isNaN(date.getTime()) ? null : date;
}

function startOfDay(date) {
    const copy = new Date(date);
    copy.setHours(0, 0, 0, 0);
    return copy;
}

function formatDateRange(start, end, fallback) {
    if (!start) return fallback || 'Date pending';

    const startLabel = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    if (!end || start.toDateString() === end.toDateString()) return startLabel;

    const endLabel = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startLabel} - ${endLabel}`;
}

function formatRelativeDate(date) {
    if (!date || Number.isNaN(date.getTime())) return 'Recently updated';

    const diffDays = Math.max(0, Math.floor((Date.now() - date.getTime()) / 86400000));
    if (diffDays === 0) return 'Updated today';
    if (diffDays === 1) return 'Updated yesterday';
    return `Updated ${diffDays} days ago`;
}

function getStatusLabel(status) {
    const labels = {
        confirmed: 'Confirmed',
        'checked-in': 'Checked In',
        'checked-out': 'Completed',
        cancelled: 'Cancelled',
        canceled: 'Cancelled'
    };

    return labels[status] || status.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function animateCounters() {
    const counters = document.querySelectorAll('.pill-value[data-target]');
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'), 10);
        if (isNaN(target)) return;

        let current = 0;
        const duration = 1200;
        const increment = target > 0 ? target / (duration / 30) : 0;
        const startDelay = 300;

        if (target === 0) {
            counter.textContent = '0';
            return;
        }

        setTimeout(() => {
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    counter.textContent = target;
                    clearInterval(timer);
                } else {
                    counter.textContent = Math.floor(current);
                }
            }, 30);
        }, startDelay);
    });
}
