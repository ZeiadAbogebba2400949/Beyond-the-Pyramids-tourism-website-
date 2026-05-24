document.addEventListener("DOMContentLoaded", function () {
    let guides = window.MockData ? [...window.MockData.guides] : [];

    const guideTableBody = document.querySelector("#guide-table tbody");
    const addModal = document.getElementById("add-modal");
    const btnAddGuide = document.getElementById("btn-add-guide");
    const btnCancel = document.getElementById("btn-cancel");
    const btnCancelX = document.getElementById("btn-cancel-x");
    const addForm = document.getElementById("add-form");
    const searchInput = document.getElementById("search-input");
    const statusFilter = document.getElementById("status-filter");

    let editMode = false;
    let currentEditId = null;

    // ── Language toggle buttons ──────────────────────────────
    const LANGUAGES = ['English', 'Arabic', 'Spanish', 'French', 'German'];
    let selectedLanguages = [];

    function renderLanguageButtons() {
        const container = document.getElementById('lang-buttons');
        container.innerHTML = '';
        LANGUAGES.forEach(lang => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'lang-btn' + (selectedLanguages.includes(lang) ? ' lang-btn--active' : '');
            btn.textContent = lang;
            btn.dataset.lang = lang;
            btn.addEventListener('click', () => {
                if (selectedLanguages.includes(lang)) {
                    selectedLanguages = selectedLanguages.filter(l => l !== lang);
                } else {
                    selectedLanguages.push(lang);
                }
                renderLanguageButtons();
            });
            container.appendChild(btn);
        });
    }

    // ── Render table ─────────────────────────────────────────
    function renderTable(searchTerm = '', filterStatus = 'all') {
        guideTableBody.innerHTML = '';

        const filtered = guides.filter(g => {
            const matchesSearch =
                g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (g.languages || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === 'all' || g.status === filterStatus;
            return matchesSearch && matchesStatus;
        });

        if (filtered.length === 0) {
            guideTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--color-text-muted);">No guides found.</td></tr>`;
        } else {
            filtered.forEach(guide => {
                const tr = document.createElement('tr');

                // Build language pill tags
                const langs = (guide.languages || '').split(',').map(l => l.trim()).filter(Boolean);
                const langHtml = langs.map(l =>
                    `<span class="lang-pill">${l}</span>`
                ).join('');

                // Inline status dropdown
                const statusOptions = ['available', 'on-tour', 'inactive'];
                const statusSelectHtml = `
                    <select class="status-inline-select status-select-${guide.status}" data-id="${guide.id}" title="Change status">
                        ${statusOptions.map(s => `
                            <option value="${s}" ${guide.status === s ? 'selected' : ''}>
                                ${s === 'on-tour' ? 'On Tour' : s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                        `).join('')}
                    </select>
                `;

                tr.innerHTML = `
                    <td><strong>${guide.name}</strong></td>
                    <td>${langHtml || '<span style="color:var(--color-text-muted)">—</span>'}</td>
                    <td><span style="color:#FFD700">★</span> ${guide.rating || '—'}</td>
                    <td>${statusSelectHtml}</td>
                    <td class="action-btns">
                        <button class="btn-icon" data-edit="${guide.id}" title="Edit"><i class="fas fa-edit"></i></button>
                        <button class="btn-icon delete" data-delete="${guide.id}" title="Delete"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                guideTableBody.appendChild(tr);
            });

            // Inline status change
            guideTableBody.querySelectorAll('.status-inline-select').forEach(sel => {
                sel.addEventListener('change', function () {
                    const id = this.dataset.id;
                    const newStatus = this.value;
                    const guide = guides.find(g => g.id === id);
                    if (guide) {
                        guide.status = newStatus;
                        renderTable(searchInput.value, statusFilter.value);
                    }
                });
            });

            // Edit / Delete via event delegation
            guideTableBody.querySelectorAll('[data-edit]').forEach(btn => {
                btn.addEventListener('click', () => editGuide(btn.dataset.edit));
            });
            guideTableBody.querySelectorAll('[data-delete]').forEach(btn => {
                btn.addEventListener('click', () => deleteGuide(btn.dataset.delete));
            });
        }

        updateStats();
    }

    function updateStats() {
        document.getElementById('totalGuidesCount').innerText = guides.length;
        document.getElementById('onTourCount').innerText = guides.filter(g => g.status === 'on-tour').length;
        document.getElementById('availableCount').innerText = guides.filter(g => g.status === 'available').length;
    }

    // ── Modal open / close ───────────────────────────────────
    function openModal() {
        addModal.classList.add('active');
        renderLanguageButtons();
    }

    function closeModal() {
        addModal.classList.remove('active');
        addForm.reset();
        editMode = false;
        currentEditId = null;
        selectedLanguages = [];
        document.getElementById('modalTitle').innerText = 'Add New Guide';
        renderLanguageButtons();
    }

    btnAddGuide.addEventListener('click', openModal);
    btnCancel.addEventListener('click', closeModal);
    btnCancelX.addEventListener('click', closeModal);

    // Close on backdrop click
    addModal.addEventListener('click', e => {
        if (e.target === addModal) closeModal();
    });

    // ── Delete ───────────────────────────────────────────────
    function deleteGuide(id) {
        if (confirm('Remove this guide from the roster?')) {
            guides = guides.filter(g => g.id !== id);
            renderTable(searchInput.value, statusFilter.value);
        }
    }

    // ── Edit ─────────────────────────────────────────────────
    function editGuide(id) {
        const guide = guides.find(g => g.id === id);
        if (!guide) return;

        editMode = true;
        currentEditId = id;
        document.getElementById('modalTitle').innerText = 'Edit Guide Details';
        document.getElementById('new-name').value = guide.name;
        document.getElementById('new-status').value = guide.status;

        // Pre-select languages from the guide's data
        selectedLanguages = (guide.languages || '')
            .split(',')
            .map(l => l.trim())
            .filter(l => LANGUAGES.includes(l));

        openModal();
    }

    // ── Save (add / edit) ────────────────────────────────────
    addForm.addEventListener('submit', e => {
        e.preventDefault();

        if (selectedLanguages.length === 0) {
            alert('Please select at least one language for this guide.');
            return;
        }

        const data = {
            name: document.getElementById('new-name').value.trim(),
            languages: selectedLanguages.join(', '),
            status: document.getElementById('new-status').value
        };

        if (editMode) {
            const idx = guides.findIndex(g => g.id === currentEditId);
            if (idx !== -1) guides[idx] = { ...guides[idx], ...data };
        } else {
            guides.push({
                id: 'G-' + Math.floor(100 + Math.random() * 900),
                rating: '5.0',
                ...data
            });
        }

        renderTable(searchInput.value, statusFilter.value);
        closeModal();
    });

    // ── Filters ──────────────────────────────────────────────
    searchInput.addEventListener('input', () => renderTable(searchInput.value, statusFilter.value));
    statusFilter.addEventListener('change', () => renderTable(searchInput.value, statusFilter.value));

    // ── Init ─────────────────────────────────────────────────
    renderTable();
});