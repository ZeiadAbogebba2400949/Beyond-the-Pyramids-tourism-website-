


let packages = [];
let currentEditId = null;
let currentDeleteId = null;
let currentPackageType = 'all';


const demoPackages = window.MockData.packages;

function loadData() {
    if (window.AppStorage) {
        packages = window.AppStorage.getPackages();
    } else {
        packages = [...demoPackages];
    }
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
    if (typeFilterValue !== 'all') {
        filtered = filtered.filter(p => p.type === typeFilterValue);
    }

    const statusFilterValue = document.getElementById('statusFilter').value;
    if (statusFilterValue !== 'all') {
        filtered = filtered.filter(p => p.status === statusFilterValue);
    }

    const searchInput = document.getElementById('searchInput');
    if (searchInput && searchInput.value) {
        const search = searchInput.value.toLowerCase();
        filtered = filtered.filter(p => p.name.toLowerCase().includes(search) || p.city.toLowerCase().includes(search));
    }

    if (currentPackageType !== 'all') {
        filtered = filtered.filter(p => p.type === currentPackageType);
    }

    if (filtered.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align:center; padding: 60px 0;">
                <i class="fas fa-box-open" style="font-size: 3rem; color: var(--color-border); margin-bottom: 20px; display:block;"></i>
                <p style="color: var(--color-text-muted); font-size: 1.1rem;">No packages match your refinement criteria.</p>
            </div>
        `;
        return;
    }

    filtered.forEach(pkg => {
        const card = createPackageCard(pkg);
        container.innerHTML += card;
    });
}

function createPackageCard(pkg) {
    const typeLabel = { single: 'Single Location', day: 'Day Package', week: 'Week Package' }[pkg.type];
    const statusClass = pkg.status === 'active' ? 'status-active' : 'status-inactive';
    
    return `
    <article class="package-card-refined">
        <div class="package-media">
            <img src="${pkg.image}" alt="${pkg.name}">
            <span class="package-status-tag ${statusClass}">${pkg.status}</span>
        </div>
        <div class="package-content">
            <div class="package-meta">${typeLabel}</div>
            <h4 class="package-title">${pkg.name}</h4>
            <div class="package-location"><i class="fas fa-map-marker-alt" style="color: var(--gold-primary)"></i> ${pkg.city}</div>
            <p style="font-size: 0.8rem; color: var(--color-text-muted); line-height: 1.5; margin-bottom: 20px;">
                ${pkg.description.substring(0, 85)}${pkg.description.length > 85 ? '...' : ''}
            </p>
            
            <div class="package-footer">
                <div class="price-display">
                    ${pkg.discountedPrice ? `<span class="discount-label">${pkg.price} EGP</span>` : ''}
                    <span class="price-value">${pkg.discountedPrice || pkg.price} EGP</span>
                </div>
                <div class="action-buttons">
                    <button class="btn-ghost" onclick="openEditModal('${pkg.id}')">Edit</button>
                    <button class="btn-ghost" onclick="duplicatePackage('${pkg.id}')" title="Duplicate"><i class="fas fa-copy"></i></button>
                    <button class="btn-danger" onclick="openDeleteModal('${pkg.id}', '${pkg.name}')" title="Delete"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        </div>
    </article>
    `;
}



function openModal(id) {
    const m = document.getElementById(id);
    if(m) m.classList.add('open');
}

function closeModal(id) {
    const m = document.getElementById(id);
    if(m) m.classList.remove('open');
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
    
    document.getElementById('packageId').value = pkg ? pkg.id : '';
    document.getElementById('pkgType').value = pkg ? pkg.type : type;

    const t = pkg ? pkg.type : type;
    document.getElementById('singleFields').style.display = t === 'single' ? 'block' : 'none';
    document.getElementById('dayFields').style.display = t === 'day' ? 'block' : 'none';
    document.getElementById('weekFields').style.display = t === 'week' ? 'block' : 'none';

    if (pkg) {
        document.getElementById('pkgName').value = pkg.name;
        document.getElementById('pkgCity').value = pkg.city;
        document.getElementById('pkgDescription').value = pkg.description || '';
        document.getElementById('pkgImage').value = pkg.image || '';
        document.getElementById('pkgPrice').value = pkg.price;
        document.getElementById('pkgDiscountedPrice').value = pkg.discountedPrice || '';
        document.getElementById('pkgStatus').value = pkg.status;

        if (t === 'single') {
            document.getElementById('openingHours').value = pkg.openingHours || '';
            document.getElementById('closingDays').value = pkg.closingDays || '';
            document.getElementById('recommendedDuration').value = pkg.recommendedDuration || '';
            document.getElementById('guidedTour').value = pkg.guidedTour || 'yes';
        } else if (t === 'day') {
            document.getElementById('dayDuration').value = pkg.duration || '';
            document.getElementById('languages').value = pkg.languages || '';
            document.getElementById('minGroup').value = pkg.minGroup || '';
            document.getElementById('maxGroup').value = pkg.maxGroup || '';
            document.getElementById('includedServices').value = pkg.includedServices || '';
            document.getElementById('itinerary').value = pkg.itinerary || '';
        } else if (t === 'week') {
            document.getElementById('weekDuration').value = pkg.durationDays || '';
            document.getElementById('nights').value = pkg.nights || '';
            document.getElementById('accommodationIncluded').value = pkg.accommodationIncluded || 'yes';
            document.getElementById('hotelName').value = pkg.hotelName || '';
            document.getElementById('dailyItinerary').value = pkg.dailyItinerary || '';
        }
    }
}

function openEditModal(id) {
    const pkg = packages.find(p => p.id === id);
    if (!pkg) return;
    setupForm(pkg.type, pkg);
    openModal('packageModal');
}

function savePackage() {
    const id = document.getElementById('packageId').value;
    const type = document.getElementById('pkgType').value;
    const name = document.getElementById('pkgName').value.trim();
    if (!name) return alert('Name is required');

    const pkgData = {
        id: id || 'P' + Date.now(),
        type: type,
        name: name,
        city: document.getElementById('pkgCity').value,
        description: document.getElementById('pkgDescription').value,
        image: document.getElementById('pkgImage').value,
        price: parseFloat(document.getElementById('pkgPrice').value),
        discountedPrice: parseFloat(document.getElementById('pkgDiscountedPrice').value) || null,
        status: document.getElementById('pkgStatus').value,
        rating: 4.5,
        reviews: 0
    };

    if (id) {
        const idx = packages.findIndex(p => p.id === id);
        packages[idx] = { ...packages[idx], ...pkgData };
    } else {
        packages.push(pkgData);
    }

    if (window.AppStorage) {
        window.AppStorage.setPackages(packages);
    }

    closeModal('packageModal');
    updateStats();
    renderPackages();
}

function duplicatePackage(id) {
    const original = packages.find(p => p.id === id);
    if (!original) return;
    const dupe = { ...original, id: 'P' + Date.now(), name: original.name + ' (Copy)', reviews: 0 };
    packages.push(dupe);
    if (window.AppStorage) {
        window.AppStorage.setPackages(packages);
    }
    renderPackages();
    updateStats();
}

function openDeleteModal(id, name) {
    currentDeleteId = id;
    document.getElementById('deletePackageName').textContent = name;
    openModal('deleteModal');
}

function confirmDelete() {
    if (currentDeleteId) {
        packages = packages.filter(p => p.id !== currentDeleteId);
        if (window.AppStorage) {
            window.AppStorage.setPackages(packages);
        }
        updateStats();
        renderPackages();
        closeModal('deleteModal');
    }
}



function initFilters() {
    document.getElementById('searchInput').addEventListener('input', renderPackages);
    document.getElementById('typeFilter').addEventListener('change', renderPackages);
    document.getElementById('statusFilter').addEventListener('change', renderPackages);

    document.querySelectorAll('.tab-link').forEach(tab => {
        tab.addEventListener('click', function() {
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
    
    document.getElementById('createPackageBtn').onclick = openCreateModal;
    document.getElementById('savePackageBtn').onclick = savePackage;
    document.getElementById('confirmDeleteBtn').onclick = confirmDelete;

    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.onclick = () => selectPackageType(btn.dataset.type);
    });
}

document.addEventListener('DOMContentLoaded', init);