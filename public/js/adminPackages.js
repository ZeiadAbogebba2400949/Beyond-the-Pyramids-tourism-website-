let packages = [];
let currentDeleteId = null;
let currentPackageType = 'all';

function loadData() {
    packages = (window.SERVER_DATA && window.SERVER_DATA.packages) ? window.SERVER_DATA.packages : [];
    updateStats();
    renderPackages();
}

function updateStats() {
    const total = packages.length;
    const active = packages.filter(p => p.status === 'active').length;

    let mostPopular = '--';
    if (packages.length > 0) {
        const sorted = [...packages].sort((a, b) => (b.rating * b.reviews) - (a.rating * a.reviews));
        mostPopular = sorted[0].name.substring(0, 15) + (sorted[0].name.length > 15 ? '...' : '');
    }

    const totalEl = document.getElementById('totalPackages');
    const activeEl = document.getElementById('activePackages');
    const popularEl = document.getElementById('mostPopular');
    if (totalEl) totalEl.textContent = total;
    if (activeEl) activeEl.textContent = active;
    if (popularEl) popularEl.textContent = mostPopular;
}

function renderPackages() {
    const container = document.getElementById('packagesContainer');
    if (!container) return;
    container.innerHTML = '';

    let filtered = [...packages];

    const typeFilterValue = document.getElementById('typeFilter').value;
    if (typeFilterValue !== 'all') filtered = filtered.filter(p => p.type === typeFilterValue);

    const statusFilterValue = document.getElementById('statusFilter').value;
    if (statusFilterValue !== 'all') filtered = filtered.filter(p => p.status === statusFilterValue);

    const searchInput = document.getElementById('searchInput');
    if (searchInput && searchInput.value) {
        const search = searchInput.value.toLowerCase();
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(search) ||
            (p.city || '').toLowerCase().includes(search)
        );
    }

    if (currentPackageType !== 'all') {
        filtered = filtered.filter(p => p.type === currentPackageType);
    }

    if (filtered.length === 0) {
        container.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:60px 0;">
                <i class="fas fa-box-open" style="font-size:3rem;color:var(--color-border);margin-bottom:20px;display:block;"></i>
                <p style="color:var(--color-text-muted);font-size:1.1rem;">No packages match your refinement criteria.</p>
            </div>`;
        return;
    }

    filtered.forEach(pkg => {
        container.innerHTML += createPackageCard(pkg);
    });
}

function createPackageCard(pkg) {
    const typeLabel = { single: 'Single Location', day: 'Day Package', week: 'Week Package' }[pkg.type] || pkg.type;
    const statusClass = pkg.status === 'active' ? 'status-active' : 'status-inactive';
    return `
    <article class="package-card-refined">
        <div class="package-media">
            <img src="${pkg.image || '/images/WebsiteBanner.png'}" alt="${pkg.name}" onerror="this.src='/images/WebsiteBanner.png'">
            <span class="package-status-tag ${statusClass}">${pkg.status}</span>
        </div>
        <div class="package-content">
            <div class="package-meta">${typeLabel}</div>
            <h4 class="package-title">${pkg.name}</h4>
            <div class="package-location"><i class="fas fa-map-marker-alt" style="color:var(--gold-primary)"></i> ${pkg.city || '—'}</div>
            <p style="font-size:0.8rem;color:var(--color-text-muted);line-height:1.5;margin-bottom:20px;">
                ${(pkg.description || '').substring(0, 85)}${(pkg.description || '').length > 85 ? '...' : ''}
            </p>
            <div class="package-footer">
                <div class="price-display">
                    ${pkg.discountedPrice ? `<span class="discount-label">${pkg.price} EGP</span>` : ''}
                    <span class="price-value">${pkg.discountedPrice || pkg.price} EGP</span>
                </div>
                <div class="action-buttons">
                    <button class="btn-ghost" onclick="openEditModal('${pkg.id}')">Edit</button>
                    <button class="btn-danger" onclick="openDeleteModal('${pkg.id}', '${pkg.name.replace(/'/g, "\\'")}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        </div>
    </article>`;
}

function openModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.add('open');
}

function closeModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.remove('open');
}

function openCreateModal() {
    openModal('selectTypeModal');
}

function selectPackageType(type) {
    closeModal('selectTypeModal');
    setupForm(type);
    openModal('packageModal');
}

function setupForm(type, pkg = null) {
    document.getElementById('packageForm').reset();
    document.getElementById('modalTitle').textContent = pkg ? 'Edit Package' : 'Create New ' + type.charAt(0).toUpperCase() + type.slice(1);
    document.getElementById('packageId').value = pkg ? (pkg.id || pkg._id) : '';
    document.getElementById('pkgType').value = pkg ? pkg.type : type;
    document.getElementById('formError').style.display = 'none';

    const preview     = document.getElementById('imagePreview');
    const placeholder = document.getElementById('imageUploadPlaceholder');
    if (pkg && pkg.image) {
        preview.src             = pkg.image;
        preview.style.display   = 'block';
        placeholder.style.display = 'none';
    } else {
        preview.src             = '';
        preview.style.display   = 'none';
        placeholder.style.display = 'block';
    }

    const t = pkg ? pkg.type : type;
    document.getElementById('singleFields').style.display = t === 'single' ? 'block' : 'none';
    document.getElementById('dayFields').style.display    = t === 'day'    ? 'block' : 'none';
    document.getElementById('weekFields').style.display   = t === 'week'   ? 'block' : 'none';

    if (pkg) {
        document.getElementById('pkgName').value            = pkg.name || '';
        document.getElementById('pkgCity').value            = pkg.city || '';
        document.getElementById('pkgDescription').value     = pkg.description || '';
        document.getElementById('pkgPrice').value           = pkg.price || '';
        document.getElementById('pkgDiscountedPrice').value = pkg.discountedPrice || '';
        document.getElementById('pkgStatus').value          = pkg.status || 'active';

        if (t === 'single') {
            document.getElementById('openingHours').value        = pkg.openingHours || '';
            document.getElementById('closingDays').value         = pkg.closingDays || '';
            document.getElementById('recommendedDuration').value = pkg.recommendedDuration || '';
            document.getElementById('guidedTour').value          = pkg.guidedTour || 'yes';
        } else if (t === 'day') {
            document.getElementById('dayDuration').value      = pkg.duration || '';
            document.getElementById('languages').value        = pkg.languages || '';
            document.getElementById('minGroup').value         = pkg.minGroup || '';
            document.getElementById('maxGroup').value         = pkg.maxGroup || '';
            document.getElementById('includedServices').value = pkg.includedServices || '';
            document.getElementById('itinerary').value        = pkg.itinerary || '';
        } else if (t === 'week') {
            document.getElementById('weekDuration').value          = pkg.durationDays || '';
            document.getElementById('nights').value                = pkg.nights || '';
            document.getElementById('accommodationIncluded').value = pkg.accommodationIncluded || 'yes';
            document.getElementById('hotelName').value             = pkg.hotelName || '';
            document.getElementById('dailyItinerary').value        = pkg.dailyItinerary || '';
        }
    }
}

function openEditModal(id) {
    const pkg = packages.find(p => p.id === id || p._id === id);
    if (!pkg) return;
    setupForm(pkg.type, pkg);
    openModal('packageModal');
}

async function savePackage() {
    const id   = document.getElementById('packageId').value;
    const type = document.getElementById('pkgType').value;
    const name = document.getElementById('pkgName').value.trim();
    const city = document.getElementById('pkgCity').value;
    const price = parseFloat(document.getElementById('pkgPrice').value);
    const discountedPriceRaw = document.getElementById('pkgDiscountedPrice').value.trim();
    const discountedPrice = discountedPriceRaw !== '' ? parseFloat(discountedPriceRaw) : null;
    const imageFile = document.getElementById('pkgImageFile').files[0] || null;
    const errDiv = document.getElementById('formError');
    const errMsg = document.getElementById('formErrorMsg');

    function showErr(msg) { errMsg.textContent = msg; errDiv.style.display = 'block'; }

    if (!name)                      { showErr('Package name is required.');                        return; }
    if (name.length < 3)            { showErr('Package name must be at least 3 characters.');     return; }
    if (!city)                      { showErr('Please select a city.');                            return; }
    if (isNaN(price) || price <= 0) { showErr('Price must be a positive number.');                 return; }
    if (price > 1000000)            { showErr('Price seems unrealistically high.');                return; }
    if (discountedPrice !== null) {
        if (isNaN(discountedPrice) || discountedPrice <= 0) { showErr('Discounted price must be positive.'); return; }
        if (discountedPrice >= price) { showErr('Discounted price must be less than original price.'); return; }
    }

    const pkgData = {
        type, name, city,
        description:  document.getElementById('pkgDescription').value,
        price,
        discountedPrice,
        status: document.getElementById('pkgStatus').value,
    };

    if (type === 'single') {
        pkgData.openingHours        = document.getElementById('openingHours').value;
        pkgData.closingDays         = document.getElementById('closingDays').value;
        pkgData.recommendedDuration = document.getElementById('recommendedDuration').value;
        pkgData.guidedTour          = document.getElementById('guidedTour').value;
    } else if (type === 'day') {
        pkgData.duration          = document.getElementById('dayDuration').value;
        pkgData.languages         = document.getElementById('languages').value;
        pkgData.minGroup          = document.getElementById('minGroup').value;
        pkgData.maxGroup          = document.getElementById('maxGroup').value;
        pkgData.includedServices  = document.getElementById('includedServices').value;
        const itinRaw = document.getElementById('itinerary').value;
        try { pkgData.itinerary = itinRaw ? JSON.parse(itinRaw) : []; } catch { pkgData.itinerary = []; }
    } else if (type === 'week') {
        pkgData.durationDays          = document.getElementById('weekDuration').value;
        pkgData.nights                = document.getElementById('nights').value;
        pkgData.accommodationIncluded = document.getElementById('accommodationIncluded').value;
        pkgData.hotelName             = document.getElementById('hotelName').value;
        const dailyRaw = document.getElementById('dailyItinerary').value;
        try { pkgData.dailyItinerary = dailyRaw ? JSON.parse(dailyRaw) : []; } catch { pkgData.dailyItinerary = []; }
    }

    const saveBtn = document.getElementById('savePackageBtn');
    saveBtn.textContent = 'Saving...'; saveBtn.disabled = true;
    errDiv.style.display = 'none';

    try {
        const url    = id ? '/api/packages/' + id : '/api/packages';
        const method = id ? 'PUT' : 'POST';
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(pkgData)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Save failed');

        const pkgId = id || data.data.package._id;
        if (imageFile && pkgId) {
            const formData = new FormData();
            formData.append('image', imageFile);
            await fetch('/api/packages/' + pkgId + '/image', {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });
        }

        window.location.reload();
    } catch (err) {
        showErr(err.message);
        saveBtn.textContent = 'Save Changes'; saveBtn.disabled = false;
    }
}

function openDeleteModal(id, name) {
    currentDeleteId = id;
    document.getElementById('deletePackageName').textContent = name;
    openModal('deleteModal');
}

async function confirmDelete() {
    if (!currentDeleteId) return;
    try {
        const res = await fetch('/api/packages/' + currentDeleteId, {
            method: 'DELETE',
            credentials: 'include'
        });
        if (res.ok || res.status === 204) {
            window.location.reload();
        } else {
            const d = await res.json();
            alert(d.message || 'Delete failed');
        }
    } catch (err) {
        alert('An error occurred: ' + err.message);
    }
}

function initFilters() {
    document.getElementById('searchInput').addEventListener('input', renderPackages);
    document.getElementById('typeFilter').addEventListener('change', renderPackages);
    document.getElementById('statusFilter').addEventListener('change', renderPackages);

    document.querySelectorAll('.tab-link').forEach(tab => {
        tab.addEventListener('click', function () {
            document.querySelectorAll('.tab-link').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentPackageType = this.dataset.type;
            renderPackages();
        });
    });
}

function init() {
    loadData();
    initFilters();

    document.getElementById('pkgImageFile').addEventListener('change', function () {
        const file = this.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview     = document.getElementById('imagePreview');
            const placeholder = document.getElementById('imageUploadPlaceholder');
            preview.src             = e.target.result;
            preview.style.display   = 'block';
            placeholder.style.display = 'none';
        };
        reader.readAsDataURL(file);
    });

    document.getElementById('createPackageBtn').onclick = openCreateModal;
    document.getElementById('savePackageBtn').onclick   = savePackage;
    document.getElementById('confirmDeleteBtn').onclick = confirmDelete;

    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.onclick = () => selectPackageType(btn.dataset.type);
    });
}

window.openEditModal   = openEditModal;
window.openDeleteModal = openDeleteModal;
window.closeModal      = closeModal;

document.addEventListener('DOMContentLoaded', init);
