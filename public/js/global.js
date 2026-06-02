


(function () {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
})();

window.AccountChip = {
    getSession: function () {
        try {
            if (window.AppStorage && AppStorage.getUserSession) {
                const session = AppStorage.getUserSession();
                if (session && session.email) return session;
            }

            const raw = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    },

    getUserRecord: function (session) {
        if (!session || !session.email) return null;
        try {
            if (window.AppStorage && AppStorage.getUserByEmail) {
                return AppStorage.getUserByEmail(session.email);
            }
        } catch (e) {}
        return null;
    },

    init: function () {
        const chips = document.querySelectorAll('[data-account-chip]');
        if (!chips.length) return;

        const session = this.getSession();
        if (!session || !session.email) return;

        const userRecord = this.getUserRecord(session);
        const name = userRecord?.name || session.name || session.email.split('@')[0] || 'Traveler';
        const image = userRecord?.image || session.image || '';

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
        try {
            if (window.AppStorage && AppStorage.getUserSession) {
                const session = AppStorage.getUserSession();
                if (session && session.email) return true;
            }
            if (window.AppStorage && AppStorage.isLoggedIn && AppStorage.isLoggedIn()) {
                const user = AppStorage.getCurrentUser && AppStorage.getCurrentUser();
                if (user && (user.email || user.username)) return true;
            }
            const raw = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && parsed.email) return true;
            }
        } catch (e) { /* ignore */ }
        return false;
    },

    getMessageForPage: function () {
        const p = window.location.pathname.toLowerCase();
        if (p.includes('dashboard')) return 'You must be logged in to view the dashboard.';
        if (p.includes('mybookings')) return 'You must be logged in to view your journeys.';
        if (p.includes('userprofile')) return 'You must be logged in to view profile settings.';
        if (p.includes('writing-reviews') || p.includes('customerreviews')) {
            return 'You must be logged in to write reviews.';
        }
        if (p.includes('customtripbuilder')) {
            return 'You must be logged in to use the Custom Trip Builder.';
        }
        return 'You must be logged in to view this page.';
    },

    ensureModal: function () {
        if (document.getElementById('login-required-modal')) return;

        const prefix = this.getPathPrefix();
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
                    <a href="${prefix}LoginPage/login.html" id="login-gate-login-btn" class="btn btn--primary">Log In</a>
                </div>
            </div>`;
        document.body.appendChild(modal);

        const self = this;
        document.getElementById('login-gate-go-back-btn').addEventListener('click', (e) => {
            e.preventDefault();
            self.hide();
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = prefix + 'index.html';
            }
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
        if (loginBtn) loginBtn.href = this.getPathPrefix() + 'LoginPage/login.html';

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
            { segment: 'dashboard.html', message: 'You must be logged in to view the dashboard.' },
            { segment: 'myBookings.html', message: 'You must be logged in to view your journeys.' },
            { segment: 'UserProfile.html', message: 'You must be logged in to view profile settings.' },
            { segment: 'writing-reviews.html', message: 'You must be logged in to write reviews.' },
            { segment: 'CustomTripBuilderPage.html', message: 'You must be logged in to use the Custom Trip Builder.' }
        ];
    },

    guardProtectedNavLinks: function () {
        if (this.isLoggedIn()) return;

        const protectedSegments = this.getProtectedSegments();
        const selector = [
            '.dashboard-sidebar a[href]',
            '.page-sidebar a[href]',
            '.navbar .nav-menu a[href]'
        ].join(', ');

        document.querySelectorAll(selector).forEach(anchor => {
            const href = anchor.getAttribute('href') || '';
            const match = protectedSegments.find(item => href.includes(item.segment));
            if (!match) return;

            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                this.show({ message: match.message });
            });
        });
    },

    /** @deprecated use guardProtectedNavLinks */
    guardPersonalDeskLinks: function () {
        this.guardProtectedNavLinks();
    }
};


window.PlatformErrorHandler = {
    
    redirectToError: function (type) {
        
        if (window.location.pathname.includes('/ErrorPages/')) return;

        const path = window.location.pathname;
        const depth = (path.match(/\//g) || []).length;
        
        let prefix = './';
        
        if (depth >= 1) {
            prefix = '../';
        }

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
        let userSession = null;
        try {
            const local = localStorage.getItem('userSession');
            if (local) userSession = JSON.parse(local);
            if (!userSession) {
                const temp = sessionStorage.getItem('userSession');
                if (temp) userSession = JSON.parse(temp);
            }
        } catch (e) { }

        // Compute relative path
        const path = window.location.pathname;
        const depth = (path.match(/\//g) || []).length;
        const isRoot = path.endsWith('/') || path.includes('LandingPage');
        const prefix = isRoot ? './' : '../';

        if (!userSession || !userSession.email) {
            if (window.LoginGate) {
                LoginGate.show();
            } else {
                alert("You must be logged in to view this page.");
                window.location.href = prefix + 'LoginPage/login.html';
            }
            return false;
        }

        const currentRole = String(userSession.role || '').toLowerCase();
        const neededRole = String(requiredRole || '').toLowerCase();
        const isAdmin = currentRole === 'admin';

        if (requiredRole && currentRole !== neededRole && !isAdmin) {
            alert("Access Denied: You do not have permission to view this page.");
            window.location.href = prefix + 'index.html';
            return false;
        }

        return true;
    }
};


window.onerror = function (message, source, lineno, colno, error) {
    console.error("Platform Fracture Detected:", {
        message,
        source,
        lineno,
        colno,
        error
    });

    
    
    
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
        const progressBar = document.querySelector(".scroll-progress");
        if (progressBar) {
            progressBar.style.width = scrolled + "%";
        }
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

    // ── Global Newsletter Form Validation ──────────────────────────────────
    document.querySelectorAll('.newsletter-form').forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = form.querySelector('input[type="email"]');
            if (input) {
                const email = input.value.trim();
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(email)) {
                    alert('Please enter a valid email address to join the Inner Circle.');
                    return;
                }
                const btn = form.querySelector('button');
                const oldText = btn.textContent;
                btn.textContent = 'Subscribed!';
                btn.style.pointerEvents = 'none';
                btn.style.background = 'var(--color-success)';
                setTimeout(() => {
                    form.reset();
                    btn.textContent = oldText;
                    btn.style.pointerEvents = 'auto';
                    btn.style.background = '';
                }, 3000);
            }
        });
    });

    // Fill the #user-avatar circle used by dashboard-shell pages
    // (TravellersDetails, BookingSummary, BookingDetails, etc.)
    populateDashboardAvatar();
    
    initGlobalThemeToggle();
});


/**
 * populateDashboardAvatar()
 * Populates the #user-avatar element present in every dashboard-shell page
 * (TravellersDetails, BookingSummary, BookingDetails, etc.) with the user's
 * real profile photo when available, or a styled gold icon fallback.
 * Called automatically from DOMContentLoaded in global.js.
 */
function populateDashboardAvatar() {
    const avatarEl = document.getElementById('user-avatar');
    if (!avatarEl) return; // Not a dashboard-shell page — skip

    // Resolve session
    let session = null;
    try {
        const s = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');
        if (s) session = JSON.parse(s);
    } catch (e) {}
    if (!session) return;

    // Resolve full user record (same lookup chain as updateAuthUI)
    let userRecord = null;
    try {
        if (window.AppStorage && window.AppStorage.getUserByEmail) {
            userRecord = window.AppStorage.getUserByEmail(session.email);
        }
        if (!userRecord && window.MockData && window.MockData.users) {
            userRecord = window.MockData.users.find(
                u => u.email && u.email.toLowerCase() === session.email.toLowerCase()
            ) || null;
        }
        if (!userRecord && window.MockData && window.MockData.accounts) {
            const match = Object.values(window.MockData.accounts).find(
                a => a.email === session.email
            );
            if (match) userRecord = match;
        }
    } catch (e) {}

    const displayName = userRecord?.name || session.name || session.email.split('@')[0];
    const photoUrl    = userRecord?.image || null;

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
        if (window.AppStorage && window.AppStorage.setTheme) {
            window.AppStorage.setTheme(theme);
        } else {
            localStorage.setItem('theme', theme);
        }

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

        // Dashboard-style toggle (single icon + label)
        const icon = themeToggle.querySelector('i:not(.sun-icon):not(.moon-icon)');
        const span = themeToggle.querySelector('span');

        if (icon) {
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }

        if (span) {
            span.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
        }
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

    // Listen for changes made in other tabs
    window.addEventListener('storage', function (e) {
        if (e.key === 'theme' && e.newValue) {
            applyThemeToUI(e.newValue);
        }
    });
}


function getRelativePathToRoot(targetPath) {
    const path = window.location.pathname;
    const depth = (path.match(/\//g) || []).length;
    
    const isLocalFile = window.location.protocol === 'file:';

    if (!targetPath.startsWith('../')) {
        return targetPath;
    }

    const isRoot = path.endsWith('/index.html') || path.endsWith('/Beyond-the-Pyramids-tourism-website-/');
    if (isRoot) {
        return targetPath.replace('../', './');
    }
    return targetPath; 
}

function updateAuthUI() {
    // ── 1. Get session ────────────────────────────────────────────────────
    let userSession = null;
    try {
        const local = localStorage.getItem('userSession');
        if (local) userSession = JSON.parse(local);
        if (!userSession) {
            const temp = sessionStorage.getItem('userSession');
            if (temp) userSession = JSON.parse(temp);
        }
    } catch (e) { console.warn('Could not retrieve session'); }

    if (!userSession || !userSession.email) {
        return; // not logged in — leave default buttons; LoginGate guards nav links
    }

    const heroStartJourney = document.getElementById('hero-start-journey');
    if (heroStartJourney) {
        heroStartJourney.style.display = 'none';
    }

    // ── 2. Resolve full user record (for photo + display name) ───────────
    let userRecord = null;
    if (window.AppStorage && window.AppStorage.getUserByEmail) {
        userRecord = window.AppStorage.getUserByEmail(userSession.email);
    }
    // Fallback: check MockData.accounts
    if (!userRecord && window.MockData && window.MockData.accounts) {
        const match = Object.values(window.MockData.accounts).find(a => a.email === userSession.email);
        if (match) userRecord = match;
    }

    const displayName = userRecord?.name || userSession.name || userSession.email.split('@')[0];
    const truncatedName = displayName.length > 14 ? displayName.substring(0, 14) + '…' : displayName;
    const photoUrl = userRecord?.image || null;

    // Compute relative path to root from current page depth
    const path = window.location.pathname;
    const depth = (path.match(/\//g) || []).length;
    const isRoot = path.endsWith('/') || path.includes('LandingPage');
    const prefix = isRoot ? './' : '../';

    const dashboardRaw = userSession.dashboard || `${prefix}UserDashboardPage/dashboard.html`;
    const profileLink  = `${prefix}UserProfilePage/UserProfile.html`;

    // Avatar HTML: real photo or icon fallback
    const avatarHTML = photoUrl
        ? `<img src="${photoUrl}" alt="${displayName}" class="nav-user-avatar">`
        : `<i class="fas fa-user-circle" style="font-size:1.6rem; color:var(--gold-primary);"></i>`;

    // ── 3. Inject into PUBLIC nav (.nav-buttons) ─────────────────────────
    const navButtonsContainer = document.querySelector('.nav-buttons');
    if (navButtonsContainer) {
        // Ensure dashboard URL correctly defaults based on role if it's missing
        let destLink = dashboardRaw;
        if (!userSession.dashboard && userSession.role !== 'Admin') {
            destLink = profileLink;
        }

        navButtonsContainer.innerHTML = `
            <div class="admin-user-chip" style="cursor:pointer;" onclick="window.location.href='${destLink}'">
                ${photoUrl
                    ? `<img src="${photoUrl}" alt="${displayName}" class="admin-avatar">`
                    : `<i class="fas fa-user-circle" style="color:var(--gold-primary);font-size:1.4rem;"></i>`}
                <span style="font-weight:600; color:var(--color-text);">${truncatedName}</span>
                <a href="#" id="globalLogoutBtn" class="admin-logout-btn" title="Logout" onclick="event.stopPropagation();">
                    <i class="fas fa-sign-out-alt"></i>
                </a>
            </div>`;

        // Reveal the Dashboard link in the nav menu and update its href
        const navDashboardLink = document.getElementById('nav-dashboard-link');
        if (navDashboardLink) {
            navDashboardLink.style.display = 'block';
            const aTag = navDashboardLink.querySelector('a');
            if (aTag) aTag.href = destLink;
        }

        setTimeout(() => {
            document.getElementById('globalLogoutBtn')?.addEventListener('click', e => {
                e.preventDefault();
                e.stopPropagation();
                localStorage.removeItem('userSession');
                sessionStorage.removeItem('userSession');
                window.location.href = `${prefix}index.html`;
            });
        }, 100);
    }

    // ── 4. Admin dashboard header & User Dashboard Greeting ──────────────────
    const welcomeStrong = document.querySelector('.welcome-text strong');
    if (welcomeStrong) {
        welcomeStrong.textContent = displayName;
    }

    const userGreeting = document.getElementById('userGreeting');
    if (userGreeting) {
        userGreeting.textContent = displayName;
    }

    // Inject admin user chip into .top-bar if a placeholder exists
    const adminUserDisplay = document.getElementById('admin-user-display');
    if (adminUserDisplay) {
        adminUserDisplay.innerHTML = `
            <div class="admin-user-chip">
                ${photoUrl
                    ? `<img src="${photoUrl}" alt="${displayName}" class="admin-avatar">`
                    : `<i class="fas fa-user-shield" style="color:var(--gold-primary);font-size:1.4rem;"></i>`}
                <span>${truncatedName}</span>
                <a href="#" id="adminLogoutBtn" class="admin-logout-btn" title="Logout">
                    <i class="fas fa-sign-out-alt"></i>
                </a>
            </div>`;
        setTimeout(() => {
            document.getElementById('adminLogoutBtn')?.addEventListener('click', e => {
                e.preventDefault();
                localStorage.removeItem('userSession');
                sessionStorage.removeItem('userSession');
                window.location.href = `${prefix}index.html`;
            });
        }, 100);
    }

    // ── 5. Sidebar logout link: wire up real logout (logged-in only) ─────
    document.querySelectorAll('.dashboard-sidebar .logout-link, .page-sidebar .logout-link').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            localStorage.removeItem('userSession');
            sessionStorage.removeItem('userSession');
            if (window.AppStorage && AppStorage.clearCurrentUser) AppStorage.clearCurrentUser();
            if (window.AppStorage && AppStorage.setLoggedIn) AppStorage.setLoggedIn(false);
            window.location.href = link.href.includes('login.html')
                ? link.href
                : `${prefix}index.html`;
        });
    });

    if (window.LoginGate) LoginGate.updateSidebarAuth();
}
