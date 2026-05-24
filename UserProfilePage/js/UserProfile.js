/* ═══════════════════════════════════════════════════════════
   UserProfile.js — Loads real session data into all fields
   and populates Travel History from per-user booking store.
═══════════════════════════════════════════════════════════ */

'use strict';

let hasUnsavedChanges = false;

// ── Helpers ────────────────────────────────────────────────────────────────
function showAlert(message, type = 'success') {
    const container = document.getElementById('alertContainer');
    if (!container) return;
    container.textContent = message;
    container.style.background = type === 'success' ? '#C5A059' : '#dc3545';
    container.style.color = '#fff';
    container.style.padding = '12px 20px';
    container.style.borderRadius = '8px';
    container.style.position = 'fixed';
    container.style.top = '20px';
    container.style.right = '20px';
    container.style.zIndex = '9999';
    container.style.fontWeight = '600';
    container.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
    container.classList.remove('hidden');
    setTimeout(() => container.classList.add('hidden'), 3500);
}

function setVal(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.tagName === 'TEXTAREA') el.textContent = value || '';
    else el.value = value || '';
}

function getSession() {
    try {
        const s = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');
        return s ? JSON.parse(s) : null;
    } catch (e) { return null; }
}

function getFullUserRecord(email) {
    if (!email) return null;
    // 1. Registered users (highest priority)
    if (window.AppStorage && window.AppStorage.getUserByEmail) {
        const u = window.AppStorage.getUserByEmail(email);
        if (u) return u;
    }
    // 2. MockData.users
    if (window.MockData && window.MockData.users) {
        return window.MockData.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
    }
    return null;
}

// ── Populate personal info fields from session + user record ───────────────
function populatePersonalInfo(session, userRecord) {
    const name  = userRecord?.name  || session?.name  || '';
    const email = userRecord?.email || session?.email || '';
    const phone = userRecord?.phone || userRecord?.phoneNumber || '';
    const dob   = userRecord?.dob   || userRecord?.dateOfBirth || '';
    const nat   = userRecord?.nationality || '';
    const addr  = userRecord?.address || '';

    // Header display
    const nameDisplay  = document.getElementById('userNameDisplay');
    const emailDisplay = document.getElementById('userEmailDisplay');
    if (nameDisplay)  nameDisplay.textContent  = name  || '—';
    if (emailDisplay) emailDisplay.textContent = email || '—';

    // Avatar
    const imgEl  = document.getElementById('profileAvatarImg');
    const iconEl = document.getElementById('profileAvatarIcon');
    const photoUrl = userRecord?.image || null;
    if (imgEl && photoUrl) {
        imgEl.src = photoUrl;
        imgEl.alt = name;
        imgEl.style.display = 'block';
        if (iconEl) iconEl.style.display = 'none';
    }

    // Form fields
    setVal('fullName',    name);
    setVal('email',       email);
    setVal('phoneNumber', phone);
    setVal('nationality', nat);
    setVal('address',     addr);

    // Date of birth: must be YYYY-MM-DD for <input type="date">
    if (dob) {
        const dobInput = document.getElementById('dob');
        if (dobInput) {
            // Handle ISO strings like "1995-05-15" or full timestamps
            dobInput.value = dob.substring(0, 10);
        }
    }

    // Member since
    const joinDate = userRecord?.joinDate || session?.loginTime?.substring(0, 10) || '';
    const memberSince = document.getElementById('memberSince');
    if (memberSince && joinDate) {
        memberSince.textContent = new Date(joinDate).toLocaleDateString('en-GB', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    }
}

// ── Travel History tab ─────────────────────────────────────────────────────
function populateTravelHistory(email) {
    const container = document.getElementById('historyList');
    if (!container) return;

    let bookings = [];
    if (window.AppStorage && window.AppStorage.getUserBookings) {
        bookings = window.AppStorage.getUserBookings(email);
    }

    if (!bookings || bookings.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:3rem 1rem; color:var(--color-text-muted);">
                <i class="fas fa-suitcase-rolling" style="font-size:3rem;margin-bottom:1rem;display:block;opacity:0.4;"></i>
                <p>No journeys recorded yet.</p>
                <a href="../DayPackages/dayPackages.html" class="btn btn--outline" style="margin-top:1rem;display:inline-flex;">
                    <i class="fas fa-compass"></i> Explore Packages
                </a>
            </div>`;
        return;
    }

    container.innerHTML = bookings.map(b => {
        const title    = b.packageName || b.title || 'Package Booking';
        const location = b.location || b.city || '';
        const date     = b.date || b.travelDate || b.timestamp?.substring(0, 10) || '';
        const status   = b.status || 'confirmed';
        const price    = b.totalPrice ? 'EGP ' + Number(b.totalPrice).toLocaleString() : '';
        const statusCls = status.toLowerCase();

        // Format display date
        let dateLabel = date;
        if (date) {
            try { dateLabel = new Date(date).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }); }
            catch (e) {}
        }

        return `
            <div class="history-item" style="
                display:flex; align-items:center; gap:1rem; justify-content:space-between;
                padding:1.2rem; border-radius:12px; margin-bottom:12px;
                background:var(--color-surface-alt); border:1px solid var(--color-border-light);
                transition:all 0.3s ease; flex-wrap:wrap;">
                <div style="display:flex;align-items:center;gap:1rem;flex:1;min-width:200px;">
                    <div style="
                        width:48px;height:48px;border-radius:10px;
                        background:rgba(197,160,89,0.12);
                        display:flex;align-items:center;justify-content:center;
                        flex-shrink:0;">
                        <i class="fas fa-map-marked-alt" style="color:var(--gold-primary);font-size:1.2rem;"></i>
                    </div>
                    <div>
                        <h4 style="margin-bottom:4px;font-size:var(--text-base);">${title}</h4>
                        <p style="margin:0;font-size:var(--text-sm);color:var(--color-text-muted);">
                            ${location ? location + ' · ' : ''}${dateLabel}
                            ${price ? ' · <strong style="color:var(--gold-primary);">' + price + '</strong>' : ''}
                        </p>
                    </div>
                </div>
                <div style="display:flex;align-items:center;gap:10px;flex-shrink:0;">
                    <span class="badge badge-${statusCls}">${status}</span>
                </div>
            </div>`;
    }).join('');
}

// ── Save personal info back to registered users ────────────────────────────
function savePersonalInfo(session) {
    const name  = document.getElementById('fullName')?.value.trim();
    const phone = document.getElementById('phoneNumber')?.value.trim();
    const dob   = document.getElementById('dob')?.value;
    const nat   = document.getElementById('nationality')?.value.trim();
    const addr  = document.getElementById('address')?.value.trim();

    if (!name) { showAlert('Full name is required.', 'error'); return false; }

    const updates = { name, phone, dob, nationality: nat, address: addr };

    if (window.AppStorage && window.AppStorage.updateRegisteredUser) {
        window.AppStorage.updateRegisteredUser(session.email, updates);
    }

    // Update session name
    try {
        const sLocal = localStorage.getItem('userSession');
        if (sLocal) {
            const parsed = JSON.parse(sLocal);
            parsed.name = name;
            localStorage.setItem('userSession', JSON.stringify(parsed));
        }
        const sSession = sessionStorage.getItem('userSession');
        if (sSession) {
            const parsed = JSON.parse(sSession);
            parsed.name = name;
            sessionStorage.setItem('userSession', JSON.stringify(parsed));
        }
    } catch (e) {}

    // Update header display
    const nameDisplay = document.getElementById('userNameDisplay');
    if (nameDisplay) nameDisplay.textContent = name;

    return true;
}

// ── Personal info edit/save/cancel ─────────────────────────────────────────
function initPersonalInfo(session) {
    const editBtn   = document.getElementById('editPersonalBtn');
    const saveBtn   = document.getElementById('savePersonalBtn');
    const cancelBtn = document.getElementById('cancelPersonalBtn');
    const inputs    = document.querySelectorAll('#personalInfoForm input:not(#email), #personalInfoForm textarea');

    if (!editBtn) return;

    let snapshot = {};

    editBtn.addEventListener('click', () => {
        // Snapshot current values for cancel
        inputs.forEach(inp => { snapshot[inp.id] = inp.value; });
        inputs.forEach(inp => { inp.disabled = false; });
        editBtn.classList.add('hidden');
        saveBtn.classList.remove('hidden');
        cancelBtn.classList.remove('hidden');
    });

    cancelBtn.addEventListener('click', () => {
        // Restore snapshot
        inputs.forEach(inp => {
            if (snapshot[inp.id] !== undefined) inp.value = snapshot[inp.id];
            inp.disabled = true;
        });
        editBtn.classList.remove('hidden');
        saveBtn.classList.add('hidden');
        cancelBtn.classList.add('hidden');
    });

    saveBtn.addEventListener('click', () => {
        if (savePersonalInfo(session)) {
            inputs.forEach(inp => { inp.disabled = true; });
            editBtn.classList.remove('hidden');
            saveBtn.classList.add('hidden');
            cancelBtn.classList.add('hidden');
            showAlert('Profile updated successfully!', 'success');
            hasUnsavedChanges = false;
        }
    });
}

// ── Tabs ───────────────────────────────────────────────────────────────────
function initTabs(email) {
    const tabNavs   = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabNavs.forEach(btn => {
        btn.addEventListener('click', e => {
            const targetTab = e.currentTarget.dataset.tab;
            tabNavs.forEach(b => b.classList.remove('active'));
            tabPanels.forEach(p => p.classList.add('hidden'));
            e.currentTarget.classList.add('active');
            document.getElementById(`tab-${targetTab}`)?.classList.remove('hidden');

            // Populate history on first visit to that tab
            if (targetTab === 'history') {
                populateTravelHistory(email);
            }
        });
    });
}

// ── Modals ─────────────────────────────────────────────────────────────────
function initModals(session) {
    const deleteBtn    = document.getElementById('deleteAccountBtn');
    const deleteModal  = document.getElementById('deleteModal');
    const cancelDelete = document.getElementById('cancelDeleteBtn');
    const confirmDel   = document.getElementById('confirmDeleteBtn');

    if (deleteBtn && deleteModal) {
        deleteBtn.addEventListener('click', () => deleteModal.classList.remove('hidden'));
        cancelDelete?.addEventListener('click', () => deleteModal.classList.add('hidden'));
        confirmDel?.addEventListener('click', () => {
            // Remove from registered users
            if (window.AppStorage && window.AppStorage.getRegisteredUsers) {
                const users = window.AppStorage.getRegisteredUsers().filter(
                    u => u.email.toLowerCase() !== session.email.toLowerCase()
                );
                localStorage.setItem('bp_registered_users', JSON.stringify(users));
            }
            localStorage.removeItem('userSession');
            sessionStorage.removeItem('userSession');
            window.location.href = '../LandingPage/LandingPage.html';
        });
    }
}

// ── Mobile sidebar ──────────────────────────────────────────────────────────
function initSidebar() {
    const toggle  = document.getElementById('mobileSidebarToggle');
    const sidebar = document.getElementById('sidebar');
    if (toggle && sidebar) {
        toggle.addEventListener('click', () => sidebar.classList.toggle('active'));
    }
}

// ── Security form ───────────────────────────────────────────────────────────
function initSecurity(session) {
    const updateBtn = document.getElementById('updatePasswordBtn');
    if (!updateBtn) return;

    updateBtn.addEventListener('click', () => {
        const currPassEl = document.getElementById('currPassword');
        const newPassEl  = document.getElementById('newPassword');
        const confPassEl = document.getElementById('confirmPassword');

        if (!currPassEl?.value || !newPassEl?.value || !confPassEl?.value) {
            showAlert('Please fill in all password fields.', 'error'); return;
        }
        if (newPassEl.value !== confPassEl.value) {
            showAlert('New passwords do not match.', 'error'); return;
        }
        if (newPassEl.value.length < 6) {
            showAlert('Password must be at least 6 characters.', 'error'); return;
        }

        // Verify current password against stored record
        if (window.AppStorage && window.AppStorage.getUserByEmail) {
            const record = window.AppStorage.getUserByEmail(session.email);
            if (record && record.password && record.password !== currPassEl.value) {
                showAlert('Current password is incorrect.', 'error'); return;
            }
        }

        // Update password in registered users
        if (window.AppStorage && window.AppStorage.updateRegisteredUser) {
            window.AppStorage.updateRegisteredUser(session.email, { password: newPassEl.value });
        }

        document.getElementById('securityForm')?.reset();
        showAlert('Password updated successfully!', 'success');
    });
}

// ── Global Save button ──────────────────────────────────────────────────────
function initGlobalSave(session) {
    const btn = document.getElementById('globalSaveBtn');
    if (!btn) return;

    document.querySelectorAll('input:not([type="password"]), textarea, select').forEach(inp => {
        inp.addEventListener('input', () => { hasUnsavedChanges = true; });
        inp.addEventListener('change', () => { hasUnsavedChanges = true; });
    });

    btn.addEventListener('click', () => {
        if (savePersonalInfo(session)) {
            hasUnsavedChanges = false;
            showAlert('All changes saved!', 'success');
        }
    });

    window.addEventListener('beforeunload', e => {
        if (hasUnsavedChanges) { e.preventDefault(); e.returnValue = ''; }
    });
}

// ── Validation helpers ─────────────────────────────────────────────────────
function validateField(input) {
    const errorSpan = input.nextElementSibling;
    let isValid = input.checkValidity();
    let message = '';

    if (!isValid) {
        if (input.validity.valueMissing)  message = 'This field is required.';
        else if (input.validity.typeMismatch) message = `Please enter a valid ${input.type}.`;
        else if (input.validity.tooShort) message = `Minimum ${input.getAttribute('minlength')} characters required.`;
        else if (input.validity.patternMismatch) message = 'Invalid format. (Example: +20 100 123 4567)';
        input.classList.add('invalid');
        if (errorSpan?.classList.contains('error-msg')) {
            errorSpan.textContent = message;
            errorSpan.classList.add('visible');
        }
    } else {
        if (input.id === 'confirmPassword') {
            const newPass = document.getElementById('newPassword');
            if (newPass && input.value !== newPass.value) {
                input.classList.add('invalid');
                if (errorSpan) { errorSpan.textContent = 'Passwords do not match.'; errorSpan.classList.add('visible'); }
                return false;
            }
        }
        input.classList.remove('invalid');
        if (errorSpan?.classList.contains('error-msg')) {
            errorSpan.textContent = '';
            errorSpan.classList.remove('visible');
        }
    }
    return isValid;
}

function initValidation() {
    document.querySelectorAll('input, textarea').forEach(inp => {
        inp.addEventListener('blur', () => validateField(inp));
        inp.addEventListener('input', () => {
            if (inp.classList.contains('invalid')) validateField(inp);
        });
    });
}

// ── MAIN ───────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const session = getSession();

    // Redirect to login if not logged in
    if (!session || !session.email) {
        window.location.href = '../LoginPage/login.html';
        return;
    }

    const userRecord = getFullUserRecord(session.email);

    populatePersonalInfo(session, userRecord);
    initTabs(session.email);
    initPersonalInfo(session);
    initSecurity(session);
    initModals(session);
    initSidebar();
    initValidation();
    initGlobalSave(session);
});
