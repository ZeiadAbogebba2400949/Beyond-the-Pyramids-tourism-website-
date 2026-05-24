


(function () {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
})();


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

        if (!userSession) {
            alert("You must be logged in to view this page.");
            window.location.href = prefix + 'LoginPage/login.html';
            return false;
        }

        if (requiredRole && userSession.role !== requiredRole && userSession.role !== 'Admin') {
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
    if (!themeToggle) return;

    function applyThemeToUI(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        if (window.AppStorage) {
            window.AppStorage.setTheme(theme);
        } else {
            localStorage.setItem('theme', theme);
        }

        // Only update dashboard-style button elements (ignoring .sun-icon/.moon-icon which use CSS)
        const icon = themeToggle.querySelector('i:not(.sun-icon):not(.moon-icon)');
        const span = themeToggle.querySelector('span');

        if (icon) {
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }

        if (span) {
            span.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
        }
    }

    // Apply initial UI state immediately
    const currentTheme = document.documentElement.getAttribute('data-theme') || localStorage.getItem('theme') || 'dark';
    applyThemeToUI(currentTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
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

    // Intercept clicks on the dashboard link if the user isn't logged in
    const navDashboardLink = document.getElementById('nav-dashboard-link');
    if (!userSession || !userSession.role) {
        if (navDashboardLink) {
            navDashboardLink.addEventListener('click', (e) => {
                e.preventDefault();
                alert('You must be logged in to view the dashboard.');
            });
        }
        return; // not logged in — leave default buttons
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

    // ── 5. Sidebar logout link: wire up real logout ───────────────────────
    document.querySelectorAll('.logout-link').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            localStorage.removeItem('userSession');
            sessionStorage.removeItem('userSession');
            window.location.href = link.href.includes('login.html')
                ? link.href
                : `${prefix}index.html`;
        });
    });
}
