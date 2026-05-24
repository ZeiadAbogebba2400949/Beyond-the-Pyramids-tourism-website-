

let allPackages = [];
if (window.AppStorage) {
    allPackages = window.AppStorage.getPackages().filter(p => p.type === "day");
} else if (window.MockData && window.MockData.packages) {
    allPackages = window.MockData.packages.filter(p => p.type === "day");
}
const packagesGrid = document.getElementById('packagesGrid');

// Execute immediately since the script is at the bottom of the body
renderPackages(allPackages);

function renderPackages(packagesToShow) {
    if (!packagesGrid) return;
    packagesGrid.innerHTML = '';

    packagesToShow.forEach(pkg => {
        const card = document.createElement('div');
        // Removed reveal-up just in case it's causing opacity issues
        card.className = 'package-card glass-card';

        const typeDisplay = {
            coastal: 'Coastal Escape',
            historical: 'Ancient Merit',
            cultural: 'Heritage Soul',
            day: 'Day Package',
            single: 'Single Location',
            week: 'Weekly Package'
        };

        card.innerHTML = `
            <div class="package-meta">
                <span><i class="fas fa-location-dot"></i> ${pkg.city || 'Egypt'}</span>
                <span><i class="fas fa-bookmark"></i> ${typeDisplay[pkg.type] || 'Legacy Tour'}</span>
            </div>
            <div class="package-img-wrapper" style="margin: 1rem 0; aspect-ratio: 16/9; overflow: hidden; border-radius: 12px;">
                <img src="${pkg.image}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <h3>${pkg.name}</h3>
            <p class="package-description">${pkg.description}</p>
            <div class="package-price-tag">EGP ${pkg.price} <small>/ explorer</small></div>
            <button class="btn btn--primary btn--small" onclick="selectPackage('${pkg.id}')">Explore Journey</button>
        `;

        packagesGrid.appendChild(card);
    });
}

function selectPackage(packageId) {
    window.location.href = `../PackageDetailsPage/package-details.html?id=${packageId}`;
}

function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        if (window.AppStorage) window.AppStorage.setTheme(newTheme);
    });
}