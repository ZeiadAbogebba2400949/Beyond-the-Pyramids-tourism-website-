

const DEMO_ACCOUNTS = window.MockData.accounts;

document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM for Login page loaded');

    passwordToggle();
    loginForm();
    rememberMe();
    checkExistingSession();
});


function passwordToggle() {
    const toggleBtn = document.getElementById('togglePasswordBtn');
    const passwordInput = document.getElementById('password');

    if (!toggleBtn || !passwordInput) {
        console.warn('Password toggle elements not found');
        return;
    }

    toggleBtn.addEventListener('click', function () {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);

        const icon = this.querySelector('i');
        if (icon) {
            if (type === 'text') {
                icon.className = 'far fa-eye-slash';
                this.setAttribute('aria-label', 'Hide password');
            } else {
                icon.className = 'far fa-eye';
                this.setAttribute('aria-label', 'Show password');
            }
        }
    });
}




function loginForm() {
    const loginForm = document.getElementById('login-form');
    const submitBtn = document.querySelector('.submit-btn');

    if (!loginForm) {
        console.warn('Login form not found');
        return;
    }

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        if (!username || !password) {
            showNotification('Please enter both email and password', 'error');
            return;
        }

        if (submitBtn) {
            const originalText = submitBtn.textContent;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
            submitBtn.disabled = true;
        }

        setTimeout(() => {
            const loginResult = attemptLogin(username, password);

            if (submitBtn) {
                submitBtn.innerHTML = 'Sign in';
                submitBtn.disabled = false;
            }

            if (loginResult.success) {
                showNotification(`Welcome, ${loginResult.role}!`, 'success');

                storeUserSession(loginResult, rememberMe);

                setTimeout(() => {
                    window.location.href = loginResult.dashboard;
                }, 1000);
            } else {
                showNotification(loginResult.message, 'error');
            }
        }, 800);
    });
}


function attemptLogin(username, password) {
    const usernameLower = username.toLowerCase();

    // ── 1. Check MockData accounts (pre-seeded admin/staff/demo accounts) ──
    for (const [key, account] of Object.entries(DEMO_ACCOUNTS)) {
        if ((usernameLower === account.email.toLowerCase() || usernameLower === key) &&
            password === account.password) {
            return {
                success: true,
                role: account.role,
                name: account.name,
                email: account.email,
                dashboard: account.dashboard
            };
        }
    }

    // ── 2. Check localStorage-persisted registered users ───────────────────
    if (window.AppStorage && window.AppStorage.getRegisteredUsers) {
        const registeredUsers = window.AppStorage.getRegisteredUsers();
        for (const user of registeredUsers) {
            if (user.email.toLowerCase() === usernameLower && user.password === password) {
                return {
                    success: true,
                    role: user.role || 'Tourist',
                    name: user.name,
                    email: user.email,
                    dashboard: user.dashboard || '../UserDashboardPage/dashboard.html'
                };
            }
        }
    }

    return {
        success: false,
        message: 'Invalid credentials. Please check your email and password.'
    };
}


function storeUserSession(userData, rememberMe) {
    const sessionData = {
        email: userData.email,
        role: userData.role,
        loginTime: new Date().toISOString(),
        dashboard: userData.dashboard
    };

    if (rememberMe) {
        AppStorage.setUserSessionLocal(sessionData);
        AppStorage.removeSessionItem('userSession');
        console.log('Session remembered');
    } else {
        AppStorage.setUserSessionSession(sessionData);
        AppStorage.removeItem('userSession');
        console.log('Session saved temporarily');
    }
}

function checkExistingSession() {
    const localSession = AppStorage.getItem('userSession');
    const sessionSession = AppStorage.getSessionItem('userSession');

    const sessionData = localSession || sessionSession;

    if (sessionData) {
        try {
            const userData = JSON.parse(sessionData);

            const stayLoggedIn = confirm(`You are already logged in as ${userData.role}. Would you like to continue?`);

            if (stayLoggedIn) {
                window.location.href = userData.dashboard || 'main.html';
            } else {
                AppStorage.removeItem('userSession');
                AppStorage.removeSessionItem('userSession');
                showNotification('Session cleared. You can log in again.', 'info');
            }
        } catch (e) {
            AppStorage.removeItem('userSession');
            AppStorage.removeSessionItem('userSession');
        }
    }
}


function rememberMe() {
    const rememberMeCheckbox = document.getElementById('rememberMe');

    if (!rememberMeCheckbox) {
        console.warn('Remember me checkbox not found');
        return;
    }

    rememberMeCheckbox.addEventListener('change', function () {
        if (this.checked) {
            console.log('Remember me enabled (session continues after browser closes)');
        } else {
            console.log('Remember me disabled (session clears after browser closes)');
        }
    });
}


function showNotification(message, type = 'info') {
    let notificationContainer = document.querySelector('.notification-container');

    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);

        notificationContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
        `;
    }

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;

    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-exclamation-circle';
    if (type === 'warning') icon = 'fa-exclamation-triangle';

    notification.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;

    notification.style.cssText = `
        background: white;
        color: #333;
        padding: 12px 20px;
        margin-bottom: 10px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 300px;
        animation: slideIn 0.3s ease;
        border-left: 4px solid ${getNotificationColor(type)};
    `;

    notificationContainer.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }

            if (notificationContainer.children.length === 0) {
                notificationContainer.remove();
            }
        }, 300);
    }, 3000);
}

function getNotificationColor(type) {
    switch (type) {
        case 'success': return '#4CAF50';
        case 'error': return '#ff4d4d';
        case 'warning': return '#FF9800';
        default: return '#2196F3';
    }
}


function clearForm() {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const rememberMe = document.getElementById('rememberMe');

    if (usernameInput) usernameInput.value = '';
    if (passwordInput) passwordInput.value = '';
    if (rememberMe) rememberMe.checked = false;

    document.querySelectorAll('.role-chip').forEach(btn => {
        btn.classList.remove('selected');
    });

    showNotification('Form cleared', 'info');
}

function getCurrentRole() {
    const sessionData = AppStorage.getItem('userSession') || AppStorage.getSessionItem('userSession');
    if (sessionData) {
        try {
            return JSON.parse(sessionData).role;
        } catch (e) {
            return null;
        }
    }
    return null;
}

function logout() {
    AppStorage.removeItem('userSession');
    AppStorage.removeSessionItem('userSession');
    showNotification('Log out successful', 'success');

    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1000);
}

function addAnimationStyles() {
    if (!document.getElementById('notification-animations')) {
        const style = document.createElement('style');
        style.id = 'notification-animations';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
            
            .role-chip.selected {
                background: rgba(197, 160, 89, 0.2);
                border: 1px solid var(--gold-primary);
                transform: scale(1.05);
                transition: all 0.2s ease;
            }
        `;
        document.head.appendChild(style);
    }
}

addAnimationStyles();

window.demoUtils = {
    clearForm: clearForm,
    getCurrentRole: getCurrentRole,
    logout: logout,
    accounts: DEMO_ACCOUNTS
};

console.log('Login.js is initialized successfully');
console.log('Demo accounts available:', Object.keys(DEMO_ACCOUNTS).length);
