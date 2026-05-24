// ─────────────────────────────────────────────────────────────────────────────
// registration_form.js
// Validates the registration form and PERSISTS new users to localStorage
// so they can log in again after page reload.
// ─────────────────────────────────────────────────────────────────────────────

const form = document.querySelector('form');

// ─── Notification helper (replaces alert()) ───────────────────────────────────
function showNotification(message, type = 'info') {
    let container = document.querySelector('.reg-notification-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'reg-notification-container';
        container.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 9999;
            display: flex; flex-direction: column; gap: 10px;
        `;
        document.body.appendChild(container);
    }

    const colors = {
        success: '#3D8B5E',
        error  : '#C0392B',
        info   : '#2471A3',
        warning: '#D4930A'
    };
    const icons = {
        success: 'fa-check-circle',
        error  : 'fa-exclamation-circle',
        info   : 'fa-info-circle',
        warning: 'fa-exclamation-triangle'
    };

    const notif = document.createElement('div');
    notif.style.cssText = `
        background: var(--color-surface, #fff);
        color: var(--color-text, #1A1A1A);
        padding: 14px 20px;
        border-radius: 10px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        display: flex; align-items: center; gap: 12px;
        min-width: 300px; max-width: 400px;
        border-left: 4px solid ${colors[type] || colors.info};
        animation: slideInRight 0.3s ease;
        font-family: 'Montserrat', sans-serif;
        font-size: 0.875rem;
    `;
    notif.innerHTML = `
        <i class="fas ${icons[type] || icons.info}" style="color:${colors[type]};font-size:1.1rem;flex-shrink:0;"></i>
        <span>${message}</span>
    `;

    // Add keyframe if not present
    if (!document.getElementById('regNotifStyles')) {
        const style = document.createElement('style');
        style.id = 'regNotifStyles';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(120%); opacity: 0; }
                to   { transform: translateX(0);    opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0);    opacity: 1; }
                to   { transform: translateX(120%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    container.appendChild(notif);

    setTimeout(() => {
        notif.style.animation = 'slideOutRight 0.3s ease forwards';
        setTimeout(() => notif.remove(), 300);
    }, 4000);
}

// ─── Field validation ─────────────────────────────────────────────────────────
function showError(el, message) {
    const msg = document.getElementById(el.id + '_error');
    if (msg) msg.textContent = message;
}

function clearError(el) {
    showError(el, '');
}

function validateField(el) {
    clearError(el);

    if (el.id === 'firstname' || el.id === 'lastname') {
        if (!el.value.trim()) { showError(el, 'This field is required'); return false; }
        if (el.value.trim().length < 2) { showError(el, 'Must be at least 2 characters'); return false; }
    }

    if (el.id === 'email') {
        if (!el.value.trim()) { showError(el, 'Email is required'); return false; }
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(el.value)) { showError(el, 'Enter a valid email address'); return false; }

        // Check for duplicate email in registered users
        if (window.AppStorage && window.AppStorage.getRegisteredUsers) {
            const existing = window.AppStorage.getRegisteredUsers();
            if (existing.some(u => u.email.toLowerCase() === el.value.trim().toLowerCase())) {
                showError(el, 'An account with this email already exists');
                return false;
            }
        }
        // Check MockData accounts too
        if (window.MockData && window.MockData.accounts) {
            if (Object.values(window.MockData.accounts).some(a => a.email.toLowerCase() === el.value.trim().toLowerCase())) {
                showError(el, 'An account with this email already exists');
                return false;
            }
        }
    }

    if (el.id === 'password') {
        if (!el.value) { showError(el, 'Password is required'); return false; }
        if (el.value.length < 6) { showError(el, 'Password must be at least 6 characters'); return false; }
        if (!/\d/.test(el.value)) { showError(el, 'Password must contain at least one number'); return false; }
        if (!/[!@#$%^&*()\-+]/.test(el.value)) { showError(el, 'Password must contain at least one special character'); return false; }
    }

    if (el.id === 'confirm_password') {
        if (!el.value) { showError(el, 'Please confirm your password'); return false; }
        const password = document.getElementById('password')?.value;
        if (el.value !== password) { showError(el, 'Passwords do not match'); return false; }
    }

    if (el.id === 'dob') {
        if (!el.value) { showError(el, 'Date of birth is required'); return false; }
        const birthDate = new Date(el.value);
        const today     = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        if (age < 18) { showError(el, 'You must be at least 18 years old'); return false; }
    }

    if (el.id === 'nationality' || el.id === 'country_code') {
        if (!el.value) { showError(el, 'Please select an option'); return false; }
    }

    if (el.id === 'phone') {
        if (!el.value.trim()) { showError(el, 'Phone number is required'); return false; }
        if (el.value.replace(/\D/g, '').length < 7) { showError(el, 'Phone number must have at least 7 digits'); return false; }
    }

    return true;
}

// ─── Live validation ──────────────────────────────────────────────────────────
document.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('input',  () => {
        validateField(el);
        if (el.id === 'password') validateField(document.getElementById('confirm_password'));
    });
    el.addEventListener('blur',   () => validateField(el));
    el.addEventListener('change', () => validateField(el));
});

// ─── Submit: persist user + auto-login ────────────────────────────────────────
form.addEventListener('submit', function (e) {
    e.preventDefault();

    let isValid = true;
    document.querySelectorAll('input, select').forEach(el => {
        if (!validateField(el)) isValid = false;
    });

    if (!isValid) {
        showNotification('Please fix the errors above before continuing.', 'error');
        return;
    }

    const firstName   = document.getElementById('firstname').value.trim();
    const lastName    = document.getElementById('lastname').value.trim();
    const dob         = document.getElementById('dob').value;
    const nationality = document.getElementById('nationality').value;
    const countryCode = document.getElementById('country_code').value;
    const phone       = document.getElementById('phone').value.trim();
    const email       = document.getElementById('email').value.trim();
    const password    = document.getElementById('password').value;

    // ── Build new user record ──
    const userId = 'USR-REG-' + Date.now();
    const newUser = {
        id          : userId,
        name        : firstName + ' ' + lastName,
        firstName   : firstName,
        lastName    : lastName,
        email       : email,
        password    : password,
        phone       : countryCode + ' ' + phone,
        nationality : nationality,
        dob         : dob,
        role        : 'Tourist',
        status      : 'active',
        joinDate    : new Date().toISOString().split('T')[0],
        dashboard   : '../UserDashboardPage/dashboard.html',
        image       : `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName + '+' + lastName)}&background=C5A059&color=fff&size=128`,
        bookings    : []
    };

    // ── Persist to localStorage ──
    if (window.AppStorage && window.AppStorage.saveRegisteredUser) {
        window.AppStorage.saveRegisteredUser(newUser);
    } else {
        // Fallback: save directly
        const key   = 'bp_registered_users';
        const users = JSON.parse(localStorage.getItem(key) || '[]');
        users.push(newUser);
        localStorage.setItem(key, JSON.stringify(users));
    }

    // ── Auto-login: set session ──
    const sessionData = {
        email    : email,
        name     : newUser.name,
        role     : 'Tourist',
        loginTime: new Date().toISOString(),
        dashboard: '../UserDashboardPage/dashboard.html'
    };
    localStorage.setItem('userSession', JSON.stringify(sessionData));

    showNotification(`Welcome, ${firstName}! Your account has been created.`, 'success');

    setTimeout(() => {
        window.location.href = '../UserDashboardPage/dashboard.html';
    }, 1500);
});