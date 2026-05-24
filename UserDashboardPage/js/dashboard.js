
const MOCK_USER_DATA = {
    stats: {
        monuments: 12,
        cities: 2,
        trips: 3,
        level: "Explorer"
    },
    upcomingTrip: {
        title: "Timeless Egypt: Cairo & Luxor",
        date: "May 25 - June 01, 2024",
        people: 2,
        image: "../PackageDetailsPage/imagesUsed/Screenshot2025-01-17at1.53.44-PM-636x426.webp",
        status: "Confirmed",
        daysUntil: 21
    },
    draftTrip: {
        title: "Alexandria: Mediterranean Jewel",
        progress: 65,
        lastEdited: "2 days ago"
    },
    stories: [
        {
            name: "Sarah Jenkins",
            avatar: "https://ui-avatars.com/api/?name=Sarah+Jenkins&background=random",
            text: "The Nile cruise was the highlight of my year. Definitely check out the Aswan night market!"
        },
        {
            name: "Marco Polo",
            avatar: "https://ui-avatars.com/api/?name=Marco+Polo&background=random",
            text: "Cairo's food scene is underrated. Ask your guide for the best Koshary in the city."
        }
    ]
};

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
    // Level text (not animated as number)
    document.getElementById('stat-level').textContent = MOCK_USER_DATA.stats.level;

    // Hero journey card
    const tripContainer = document.getElementById('next-trip-container');
    const trip = MOCK_USER_DATA.upcomingTrip;

    tripContainer.innerHTML = `
        <div class="hero-card">
            <div class="hero-card__media">
                <img src="${trip.image}" alt="${trip.title}">
            </div>
            <div class="hero-card__gradient"></div>
            <div class="hero-card__body">
                <span class="hero-badge"><i class="fas fa-check-circle"></i> ${trip.status}</span>
                <h2 class="hero-card__title">${trip.title}</h2>
                <div class="hero-card__meta">
                    <span><i class="far fa-calendar"></i> ${trip.date}</span>
                    <span><i class="far fa-user"></i> ${trip.people} Travelers</span>
                </div>
                <div class="hero-card__actions">
                    <a href="../BookingDetailsPage/booking-details.html" class="hero-btn hero-btn--primary">View Voucher</a>
                    <a href="../FAQpage/FAQpage.html" class="hero-btn hero-btn--ghost">Get Support</a>
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

    // Draft trip
    const draftContainer = document.getElementById('draft-container');
    const draft = MOCK_USER_DATA.draftTrip;

    draftContainer.innerHTML = `
        <div class="draft-card-mini">
            <h4>${draft.title}</h4>
            <div class="draft-progress">
                <div class="progress-fill" style="width: 0%"></div>
            </div>
            <div class="draft-meta">
                <span>${draft.progress}% complete</span>
                <span>Edited ${draft.lastEdited}</span>
            </div>
        </div>
    `;

    // Animate progress bar
    setTimeout(() => {
        const fill = draftContainer.querySelector('.progress-fill');
        if (fill) fill.style.width = draft.progress + '%';
    }, 800);

    // Stories
    const feed = document.getElementById('story-feed');
    feed.innerHTML = MOCK_USER_DATA.stories.map(story => `
        <article class="story-item">
            <img src="${story.avatar}" alt="${story.name}" class="story-avatar">
            <div class="story-content">
                <h5>${story.name}</h5>
                <p class="story-text">"${story.text}"</p>
            </div>
        </article>
    `).join('');
}


function animateCounters() {
    const counters = document.querySelectorAll('.pill-value[data-target]');
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        if (isNaN(target)) return;

        let current = 0;
        const duration = 1200;
        const increment = target / (duration / 30);
        const startDelay = 600;

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
