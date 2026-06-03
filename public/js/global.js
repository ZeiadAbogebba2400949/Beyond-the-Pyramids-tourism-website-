(function () {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
})();

window.AccountChip = {
    init: function () {
        const chips = document.querySelectorAll('[data-account-chip]');
        if (!chips.length) return;

        const session = window.SERVER_USER;
        if (!session) return;

        const name = session.name || session.email?.split('@')[0] || 'Traveler';
        const image = session.image || '';

        chips.forEach(chip => {
            const nameEl = chip.querySelector('[data-account-name]');
            const avatarEl = chip.querySelector('[data-account-avatar]');

            if (nameEl) nameEl.textContent = name;

            if (avatarEl) {
                avatarEl.innerHTML = '';
                if (image) {
                    const img = document.createElement('img');
                    img.src = image;
                    img.alt = name;
                    avatarEl.appendChild(img);
                } else {
                    const icon = document.createElement('i');
                    icon.className = 'fas fa-user';
                    avatarEl.appendChild(icon);
                }
            }

            chip.hidden = false;
        });
    }
};

document.addEventListener('DOMContentLoaded', function () {
    if (window.AccountChip) window.AccountChip.init();
});


window.LoginGate = {
    getPathPrefix: function () {
        const path = window.location.pathname;
        const isRoot = path.endsWith('/index.html') || path.endsWith('/') ||
            path.endsWith('Beyond-the-Pyramids-tourism-website-') ||
            path.includes('LandingPage');
        return isRoot ? './' : '../';
    },

    isLoggedIn: function () {
        const u = window.SERVER_USER || (window.SERVER_DATA && window.SERVER_DATA.user);
        return !!(u && (u.email || u._id));
    },

    getMessageForPage: function () {
        const p = window.location.pathname.toLowerCase();
        if (p.includes('dashboard')) return 'You must be logged in to view the dashboard.';
        if (p.includes('my-bookings') || p.includes('mybookings')) return 'You must be logged in to view your journeys.';
        if (p.includes('profile') || p.includes('userprofile')) return 'You must be logged in to view profile settings.';
        if (p.includes('reviews') || p.includes('writing-reviews') || p.includes('customerreviews')) {
            return 'You must be logged in to write reviews.';
        }
        if (p.includes('custom-trip') || p.includes('customtripbuilder')) {
            return 'You must be logged in to use the Custom Trip Builder.';
        }
        return 'You must be logged in to view this page.';
    },

    ensureModal: function () {
        if (document.getElementById('login-required-modal')) return;

        const modal = document.createElement('div');
        modal.id = 'login-required-modal';
        modal.className = 'modal-overlay hidden';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'login-modal-title');
        modal.innerHTML = `
            <div class="modal-content login-required-modal">
                <div class="modal-header">
                    <h2 id="login-modal-title"><i class="fas fa-lock"></i> Login Required</h2>
                </div>
                <p id="login-required-message" class="login-required-message"></p>
                <div class="modal-actions">
                    <button type="button" id="login-gate-go-back-btn" class="btn btn--outline">Go Back</button>
                    <a href="/login" id="login-gate-login-btn" class="btn btn--primary">Log In</a>
                </div>
            </div>`;
        document.body.appendChild(modal);

        const self = this;
        document.getElementById('login-gate-go-back-btn').addEventListener('click', (e) => {
            e.preventDefault();
            self.hide();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) self.hide();
        });
    },

    hide: function () {
        const modal = document.getElementById('login-required-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        }
        const customCursor = document.getElementById('custom-cursor');
        if (customCursor) customCursor.style.opacity = '1';
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        const shell = document.querySelector('.page-shell, .dashboard-shell');
        if (shell) shell.removeAttribute('aria-hidden');
    },

    show: function (options) {
        const opts = options || {};
        const message = opts.message || this.getMessageForPage();
        this.ensureModal();

        const msgEl = document.getElementById('login-required-message');
        if (msgEl) msgEl.textContent = message;

        const loginBtn = document.getElementById('login-gate-login-btn');
        if (loginBtn) loginBtn.href = '/login';

        const modal = document.getElementById('login-required-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.style.display = 'flex';
            modal.style.cssText = [
                'position:fixed',
                'inset:0',
                'z-index:10000',
                'display:flex',
                'align-items:center',
                'justify-content:center',
                'background:rgba(0,0,0,0.6)',
                'backdrop-filter:blur(12px)'
            ].join(';');
        }

        const customCursor = document.getElementById('custom-cursor');
        if (customCursor) customCursor.style.opacity = '0';

        const shell = document.querySelector('.page-shell, .dashboard-shell');
        if (shell) shell.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = 'hidden';
    },

    requireLogin: function (options) {
        if (this.isLoggedIn()) return true;
        this.show(options);
        return false;
    },

    updateSidebarAuth: function () {
        const loggedIn = this.isLoggedIn();
        document.querySelectorAll('.dashboard-sidebar .logout-link, .page-sidebar .logout-link').forEach(link => {
            link.style.display = loggedIn ? '' : 'none';
        });
    },

    getProtectedSegments: function () {
        return [
            { segment: '/dashboard',     message: 'You must be logged in to view the dashboard.' },
            { segment: '/my-bookings',   message: 'You must be logged in to view your journeys.' },
            { segment: '/profile',       message: 'You must be logged in to view profile settings.' },
            { segment: '/reviews/write', message: 'You must be logged in to write reviews.' },
            { segment: '/custom-trip',   message: 'You must be logged in to use the Custom Trip Builder.' },
        ];
    },

    guardProtectedNavLinks: function () {
        if (this.isLoggedIn()) return;

        const protectedSegments = this.getProtectedSegments();

        const selector = [
            '.dashboard-sidebar a[href]',
            '.page-sidebar a[href]',
            '.navbar .nav-menu a[href]',
            '.nav-menu a[href]',
            'nav a[href]'
        ].join(', ');

        const seen = new WeakSet();
        document.querySelectorAll(selector).forEach(anchor => {
            if (seen.has(anchor)) return;
            seen.add(anchor);

            const href = anchor.getAttribute('href') || '';
            const match = protectedSegments.find(item => {
                if (item.segment.startsWith('/')) {
                    return href === item.segment || href.startsWith(item.segment + '?') || href.startsWith(item.segment + '/');
                }
                return href.includes(item.segment);
            });
            if (!match) return;

            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                this.show({ message: match.message });
            });
        });
    }
};


window.PlatformErrorHandler = {
    redirectToError: function (type) {
        if (window.location.pathname.includes('/ErrorPages/')) return;

        const path = window.location.pathname;
        const depth = (path.match(/\//g) || []).length;
        let prefix = './';
        if (depth >= 1) prefix = '../';

        const errorPaths = {
            403: 'ErrorPages/403-Access Denied/403.html',
            404: 'ErrorPages/404-PageNotFound/404.html',
            500: 'ErrorPages/500-Server Error/500.html'
        };

        const target = errorPaths[type] || errorPaths[500];
        window.location.href = prefix + target;
    },

    catchFetch: function (response) {
        if (!response.ok) {
            if (response.status === 403) this.redirectToError(403);
            if (response.status === 404) this.redirectToError(404);
            if (response.status >= 500) this.redirectToError(500);
            return false;
        }
        return true;
    },

    checkAccess: function (requiredRole) {
        const user = window.SERVER_USER;
        if (!user) {
            if (window.LoginGate) LoginGate.show();
            else window.location.href = '/login';
            return false;
        }
        const currentRole = String(user.role || '').toLowerCase();
        const neededRole  = String(requiredRole || '').toLowerCase();
        if (requiredRole && currentRole !== neededRole && currentRole !== 'admin') {
            alert('Access Denied: You do not have permission to view this page.');
            window.location.href = '/';
            return false;
        }
        return true;
    }
};

window.addEventListener('pageshow', () => {
    if (window.LoginGate) LoginGate.hide();
});

document.addEventListener('DOMContentLoaded', () => {
    if (!document.querySelector('.scroll-progress')) {
        const progress = document.createElement('div');
        progress.className = 'scroll-progress';
        document.body.appendChild(progress);
    }
    if (!document.querySelector('.noise-overlay')) {
        const noise = document.createElement('div');
        noise.className = 'noise-overlay';
        document.body.appendChild(noise);
    }

    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
        const progressBar = document.querySelector('.scroll-progress');
        if (progressBar) progressBar.style.width = scrolled + '%';
    });

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal-up').forEach(el => {
        revealObserver.observe(el);
    });

    const sidebarLinks = document.querySelectorAll('.dashboard-sidebar a, .sidebar a');
    const currentPath = window.location.pathname.split('/').pop();

    sidebarLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });

    if (window.LoginGate) {
        LoginGate.hide();
        LoginGate.updateSidebarAuth();
        LoginGate.guardProtectedNavLinks();
    }
    updateAuthUI();

    populateDashboardAvatar();
    initGlobalThemeToggle();
});


function populateDashboardAvatar() {
    const avatarEl = document.getElementById('user-avatar');
    if (!avatarEl) return;

    const user = window.SERVER_USER;
    if (!user) return;

    const displayName = user.name || user.email?.split('@')[0] || 'Traveler';
    const photoUrl    = user.image || null;

    if (photoUrl) {
        avatarEl.innerHTML = `
            <img src="${photoUrl}" alt="${displayName}"
                style="width:100%;height:100%;object-fit:cover;border-radius:50%;"
                onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
            <span style="display:none;align-items:center;justify-content:center;width:100%;height:100%;">
                <i class="fas fa-user-circle" style="font-size:1.5rem;color:var(--gold-primary);"></i>
            </span>`;
    } else {
        avatarEl.innerHTML = `<i class="fas fa-user-circle" style="font-size:1.5rem;color:var(--gold-primary);"></i>`;
    }
    avatarEl.title = displayName;
}

function initGlobalThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle || themeToggle.dataset.themeBound === 'true') return;
    themeToggle.dataset.themeBound = 'true';

    function applyThemeToUI(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);

        const sunIcon = themeToggle.querySelector('.sun-icon');
        const moonIcon = themeToggle.querySelector('.moon-icon');
        if (sunIcon && moonIcon) {
            if (theme === 'dark') {
                sunIcon.style.display = 'block';
                moonIcon.style.display = 'none';
                themeToggle.setAttribute('aria-label', 'Switch to Light Mode');
            } else {
                sunIcon.style.display = 'none';
                moonIcon.style.display = 'block';
                themeToggle.setAttribute('aria-label', 'Switch to Dark Mode');
            }
        }

        const icon = themeToggle.querySelector('i:not(.sun-icon):not(.moon-icon)');
        const span = themeToggle.querySelector('span');

        if (icon) icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        if (span) span.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
    }

    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const currentTheme = document.documentElement.getAttribute('data-theme')
        || savedTheme
        || (prefersDark ? 'dark' : 'light');
    applyThemeToUI(currentTheme);

    themeToggle.addEventListener('click', () => {
        const activeTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
        applyThemeToUI(newTheme);
    });

    window.addEventListener('storage', function (e) {
        if (e.key === 'theme' && e.newValue) applyThemeToUI(e.newValue);
    });
}

function updateAuthUI() {
    const userSession = window.SERVER_USER;
    if (!userSession) return;

    const heroStartJourney = document.getElementById('hero-start-journey');
    if (heroStartJourney) heroStartJourney.style.display = 'none';

    const displayName = userSession.name || userSession.email?.split('@')[0] || 'Traveler';

    const welcomeStrong = document.querySelector('.welcome-text strong');
    if (welcomeStrong) welcomeStrong.textContent = displayName;

    const userGreeting = document.getElementById('userGreeting');
    if (userGreeting) userGreeting.textContent = displayName;

    const logoutHandler = async e => {
        e.preventDefault();
        await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
        window.location.href = '/';
    };

    ['logout-btn', 'logout-link'].forEach(id => {
        const el = document.getElementById(id);
        if (el && !el.dataset.wired) { el.dataset.wired = 'true'; el.addEventListener('click', logoutHandler); }
    });

    document.querySelectorAll('.dashboard-sidebar .logout-link, .page-sidebar .logout-link').forEach(link => {
        if (link.dataset.wired) return;
        link.dataset.wired = 'true';
        link.addEventListener('click', logoutHandler);
    });

    if (window.LoginGate) LoginGate.updateSidebarAuth();
}
