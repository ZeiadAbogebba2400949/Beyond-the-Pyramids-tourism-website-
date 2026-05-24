/* ═══════════════════════════════════════════════════════════
   UserManagement.js
   Reads and writes to localStorage + MockData for User Management
═══════════════════════════════════════════════════════════ */

'use strict';

let users = [];
let editingId  = null;
let deletingId = null;

// ─── Data Loading ─────────────────────────────────────────────────────────────

function loadAllUsers() {
    let combined = [];

    // 1. Registered users (from AppStorage)
    if (window.AppStorage && window.AppStorage.getRegisteredUsers) {
        combined = [...window.AppStorage.getRegisteredUsers()];
    }

    // 2. MockData users
    if (window.MockData && window.MockData.users) {
        window.MockData.users.forEach(mu => {
            if (!combined.some(u => u.email.toLowerCase() === mu.email.toLowerCase())) {
                combined.push(mu);
            }
        });
    }

    // Assign IDs if missing
    combined.forEach((u, i) => {
        if (!u.id) {
            u.id = (u.role === 'admin' ? 'ADM-' : 'USR-') + String(i + 1).padStart(3, '0');
        }
    });

    users = combined;
}

// ─── Stats ────────────────────────────────────────────────────────────────────

function updateStats() {
    document.getElementById('totalUsersCount').textContent = users.length;
    document.getElementById('adminCount').textContent      = users.filter(u => u.role === 'admin').length;
    document.getElementById('userCount').textContent       = users.filter(u => u.role === 'user').length;
    document.getElementById('suspendedCount').textContent  = users.filter(u => u.status === 'suspended').length;
}

// ─── Render Table ─────────────────────────────────────────────────────────────

function displayUsers() {
    const search     = document.getElementById('searchInput').value.toLowerCase();
    const roleFilter = document.getElementById('roleFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;

    const filtered = users.filter(u =>
        (search === '' || u.name?.toLowerCase().includes(search) || u.email?.toLowerCase().includes(search)) &&
        (roleFilter === 'all' || u.role === roleFilter) &&
        (statusFilter === 'all' || (u.status || 'active') === statusFilter)
    );

    const tbody      = document.getElementById('usersList');
    const emptyState = document.getElementById('emptyState');

    if (filtered.length === 0) {
        tbody.innerHTML     = '';
        emptyState.style.display = 'flex';
        return;
    }
    emptyState.style.display = 'none';

    tbody.innerHTML = filtered.map(u => {
        const role = u.role || 'user';
        const status = u.status || 'active';
        const roleClass = role === 'admin' ? 'badge-admin' : 'badge-user';
        const roleLabel = role === 'admin' ? '<i class="fas fa-user-shield"></i> Admin' : '<i class="fas fa-user"></i> User';
        const statusBadge = status === 'active'
            ? '<span class="badge-active">Active</span>'
            : '<span class="badge-suspended">Suspended</span>';

        const name = u.name || u.email?.split('@')[0] || 'Unknown';
        const avatarHtml = u.image
            ? \`<img src="\${u.image}" alt="\${name}" class="user-avatar-img" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">\`
            : '';
        const avatarFallback = \`<div class="user-avatar-fallback" \${u.image ? 'style="display:none"' : ''}>\${name.charAt(0).toUpperCase()}</div>\`;

        return \`
        <tr>
            <td>
                <div class="user-cell">
                    <div class="user-avatar">
                        \${avatarHtml}
                        \${avatarFallback}
                    </div>
                    <div>
                        <div class="user-name">\${name}</div>
                        <div class="user-id">\${u.id}</div>
                    </div>
                </div>
            </td>
            <td>\${u.email}</td>
            <td><span class="badge-role \${roleClass}">\${roleLabel}</span></td>
            <td>\${u.nationality || '—'}</td>
            <td>\${u.phone || '—'}</td>
            <td>\${u.joinDate || u.timestamp?.substring(0,10) || '—'}</td>
            <td>\${statusBadge}</td>
            <td>
                <div class="actions-cell">
                    <button class="btn-action-edit" onclick="openEditModal('\${u.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="btn-action-delete" onclick="openDeleteModal('\${u.id}', '\${name.replace(/'/g, "\\'")}')" title="Delete"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>\`;
    }).join('');
}

// ─── Modals ───────────────────────────────────────────────────────────────────

function openModal(id)  { document.getElementById(id).classList.add('open');    }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

function openAddModal() {
    editingId = null;
    document.getElementById('modalTitle').textContent = 'Add New User';
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    document.getElementById('userJoinDate').value = new Date().toISOString().split('T')[0];
    openModal('userModal');
}

function openEditModal(id) {
    const u = users.find(u => u.id === id);
    if (!u) return;
    editingId = id;
    document.getElementById('modalTitle').textContent = 'Edit User';
    document.getElementById('userId').value          = u.id;
    document.getElementById('userName').value         = u.name || '';
    document.getElementById('userEmail').value        = u.email || '';
    document.getElementById('userPhone').value        = u.phone || '';
    document.getElementById('userNationality').value  = u.nationality || '';
    document.getElementById('userRole').value         = u.role || 'user';
    document.getElementById('userStatus').value       = u.status || 'active';
    document.getElementById('userJoinDate').value     = u.joinDate || u.timestamp?.substring(0,10) || '';
    document.getElementById('userPassword').value     = u.password || '';
    openModal('userModal');
}

function openDeleteModal(id, name) {
    deletingId = id;
    document.getElementById('deleteUserName').textContent = name;
    openModal('deleteModal');
}

// ─── Save User ────────────────────────────────────────────────────────────────

function saveUser() {
    const name        = document.getElementById('userName').value.trim();
    const email       = document.getElementById('userEmail').value.trim();
    const phone       = document.getElementById('userPhone').value.trim();
    const nationality = document.getElementById('userNationality').value.trim();
    const role        = document.getElementById('userRole').value;
    const status      = document.getElementById('userStatus').value;
    const joinDate    = document.getElementById('userJoinDate').value;
    const password    = document.getElementById('userPassword').value.trim();

    if (!name || !email || !role) {
        alert('Name, Email, and Role are required.');
        return;
    }

    let updatedUser = null;

    if (editingId) {
        const idx = users.findIndex(u => u.id === editingId);
        if (idx !== -1) {
            users[idx] = {
                ...users[idx],
                name, email, phone, nationality, role, status, joinDate,
                ...(password ? { password } : {})
            };
            updatedUser = users[idx];
        }
    } else {
        const newId = role === 'admin'
            ? 'ADM-' + String(users.filter(u => u.role === 'admin').length + 1).padStart(3, '0')
            : 'USR-' + String(users.filter(u => u.role === 'user').length + 1).padStart(3, '0');
        updatedUser = { id: newId, name, email, phone, nationality, role, status, joinDate, password: password || 'changeme', image: '' };
        users.push(updatedUser);
    }

    // Persist to localStorage if available
    if (updatedUser && window.AppStorage && window.AppStorage.saveRegisteredUser) {
        // If it's an edit, we might need to use updateRegisteredUser, but save is fine if we're saving the whole record
        let existingLocal = window.AppStorage.getRegisteredUsers();
        let lIdx = existingLocal.findIndex(u => u.email.toLowerCase() === updatedUser.email.toLowerCase());
        if (lIdx !== -1) {
            existingLocal[lIdx] = updatedUser;
        } else {
            existingLocal.push(updatedUser);
        }
        localStorage.setItem('bp_registered_users', JSON.stringify(existingLocal));
    }

    closeModal('userModal');
    updateStats();
    displayUsers();
}

// ─── Delete User ──────────────────────────────────────────────────────────────

function deleteUser() {
    if (!deletingId) return;
    
    const u = users.find(x => x.id === deletingId);
    if (u && window.AppStorage) {
        let existingLocal = window.AppStorage.getRegisteredUsers();
        existingLocal = existingLocal.filter(x => x.email.toLowerCase() !== u.email.toLowerCase());
        localStorage.setItem('bp_registered_users', JSON.stringify(existingLocal));
    }

    users = users.filter(x => x.id !== deletingId);
    
    closeModal('deleteModal');
    updateStats();
    displayUsers();
    deletingId = null;
}

// ─── Init ─────────────────────────────────────────────────────────────────────

function init() {
    loadAllUsers();
    updateStats();
    displayUsers();

    document.getElementById('addUserBtn').onclick    = openAddModal;
    document.getElementById('saveUserBtn').onclick   = saveUser;
    document.getElementById('closeModalBtn').onclick = () => closeModal('userModal');
    document.getElementById('cancelModalBtn').onclick= () => closeModal('userModal');
    document.getElementById('cancelDeleteBtn').onclick= () => closeModal('deleteModal');
    document.getElementById('confirmDeleteBtn').onclick = deleteUser;

    document.getElementById('searchInput').addEventListener('input',   displayUsers);
    document.getElementById('roleFilter').addEventListener('change',   displayUsers);
    document.getElementById('statusFilter').addEventListener('change', displayUsers);
}

// Expose for inline onclick handlers
window.openEditModal   = openEditModal;
window.openDeleteModal = openDeleteModal;

document.addEventListener('DOMContentLoaded', init);