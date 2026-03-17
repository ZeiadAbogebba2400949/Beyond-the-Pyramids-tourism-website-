

const DEMO_ACCOUNTS = {
    admin: {
        email: 'admin@egypt.com',
        password: 'admin123',
        role: 'Admin',
        dashboard: 'admin-dashboard.html'
    },
    planner: {
        email: 'planner@egypt.com',
        password: 'planner123',
        role: 'Planner',
        dashboard: 'planner-dashboard.html'
    },
    booking: {
        email: 'booking@egypt.com',
        password: 'booking123',
        role: 'Booking Manager',
        dashboard: 'booking-dashboard.html'
    },
    guide: {
        email: 'guide@egypt.com',
        password: 'guide123',
        role: 'Tour Guide',
        dashboard: 'guide-dashboard.html'
    },
    support: {
        email: 'support@egypt.com',
        password: 'support123',
        role: 'Customer Support',
        dashboard: 'support-dashboard.html'
    },
    hotel: {
        email: 'hotel@egypt.com',
        password: 'hotel123',
        role: 'Hotel Manager',
        dashboard: 'hotel-dashboard.html'
    },
    transport: {
        email: 'transport@egypt.com',
        password: 'transport123',
        role: 'Transportation',
        dashboard: 'transport-dashboard.html'
    },
    user: {
        email: 'user@egypt.com',
        password: 'user123',
        role: 'Tourist',
        dashboard: 'user-dashboard.html'
    }
};

document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM for Login page loaded');

    passwordToggle();
    forgotPasswordLink();
    demoButtons();
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

function forgotPasswordLink() {
    const forgotLink = document.getElementById('forgot-link');

    if (!forgotLink) {
        console.warn('Forgot password link not found');
        return;
    }

    forgotLink.addEventListener('click', function (e) {
        e.preventDefault();
        showNotification(
            'This is Demo Mode: For password reset, please use the demo credentials below.',
            'info'
        );
    });
}


function demoButtons() {
    const roleButtons = document.querySelectorAll('.role-item');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    if (!roleButtons.length) {
        console.warn('No role buttons found');
        return;
    }

    if (!usernameInput || !passwordInput) {
        console.warn('Username or password not found');
        return;
    }

    roleButtons.forEach(button => {
        button.addEventListener('click', function () {
            const role = this.getAttribute('data-role');
            const account = DEMO_ACCOUNTS[role];

            if (account) {
                usernameInput.value = account.email;
                passwordInput.value = account.password;

                roleButtons.forEach(btn => btn.classList.remove('selected'));

                this.classList.add('selected');

                showNotification(`${account.role} credentials loaded. Click Sign in to continue.`, 'success');
            }
        });
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

    for (const [key, account] of Object.entries(DEMO_ACCOUNTS)) {
        if ((usernameLower === account.email.toLowerCase() || usernameLower === key) &&
            password === account.password) {
            return {
                success: true,
                role: account.role,
                email: account.email,
                dashboard: account.dashboard
            };
        }
    }

    for (const [key, account] of Object.entries(DEMO_ACCOUNTS)) {
        if (password === account.password) {
            return {
                success: true,
                role: account.role,
                email: username,
                dashboard: account.dashboard
            };
        }
    }

    return {
        success: false,
        message: 'Invalid credentials. Please use the demo accounts below.'
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
        localStorage.setItem('userSession', JSON.stringify(sessionData));
        sessionStorage.removeItem('userSession');
        console.log('Session remembered');
    } else {
        sessionStorage.setItem('userSession', JSON.stringify(sessionData));
        localStorage.removeItem('userSession');
        console.log('Session saved temporarily');
    }
}

function checkExistingSession() {
    const localSession = localStorage.getItem('userSession');
    const sessionSession = sessionStorage.getItem('userSession');

    const sessionData = localSession || sessionSession;

    if (sessionData) {
        try {
            const userData = JSON.parse(sessionData);

            const stayLoggedIn = confirm(`You are already logged in as ${userData.role}. Would you like to continue?`);

            if (stayLoggedIn) {
                window.location.href = userData.dashboard || 'main.html';
            } else {
                localStorage.removeItem('userSession');
                sessionStorage.removeItem('userSession');
                showNotification('Session cleared. You can log in again.', 'info');
            }
        } catch (e) {
            localStorage.removeItem('userSession');
            sessionStorage.removeItem('userSession');
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
        case 'error': return '#F44336';
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

    document.querySelectorAll('.role-item').forEach(btn => {
        btn.classList.remove('selected');
    });

    showNotification('Form cleared', 'info');
}

function getCurrentRole() {
    const sessionData = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');
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
    localStorage.removeItem('userSession');
    sessionStorage.removeItem('userSession');
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
            
            .role-item.selected {
                background-color: #e6f0ff;
                border: 2px solid #007bff;
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
