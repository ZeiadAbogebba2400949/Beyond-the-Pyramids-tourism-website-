// ── Week Packages Page — Dynamic Renderer ───────────────────────────────────
// Renders all packages with type === 'week' from MockData.packages.
// Each card links to the Package Details page with the correct ?id= param.

document.addEventListener('DOMContentLoaded', function () {
    renderWeekPackages();
    initFilters();
});

function renderWeekPackages() {
    const container = document.querySelector('.packages-container');
    if (!container) return;

    let allPkgs = [];
    if (window.AppStorage) {
        allPkgs = window.AppStorage.getPackages();
    } else if (window.MockData && window.MockData.packages) {
        allPkgs = window.MockData.packages;
    } else {
        container.innerHTML = '<p style="color:var(--text-muted);padding:2rem;">No packages available.</p>';
        return;
    }

    const weekPkgs = allPkgs.filter(p => p.type === 'week' && p.status !== 'inactive');

    if (weekPkgs.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted);padding:2rem;">No week packages available right now.</p>';
        return;
    }

    container.innerHTML = '';

    weekPkgs.forEach(pkg => {
        const durationDays = pkg.durationDays || 7;
        const nights = pkg.nights || (durationDays - 1);
        const price = pkg.discountedPrice || pkg.price || 0;
        const hasDiscount = pkg.discountedPrice && pkg.discountedPrice < pkg.price;
        const accomType = (pkg.hotelName || '').toLowerCase().includes('cruise') ? 'cruise' : 'hotel';
        const priceRange = price >= 20000 ? 'luxury' : 'budget';

        // Parse daily itinerary if present
        let itineraryHtml = '';
        if (pkg.dailyItinerary) {
            try {
                const days = JSON.parse(pkg.dailyItinerary);
                itineraryHtml = days.map(d => `<strong>Day ${d.day}:</strong> ${d.title}`).join('<br>');
            } catch (e) {
                itineraryHtml = pkg.description || '';
            }
        } else {
            itineraryHtml = pkg.description || '';
        }

        const card = document.createElement('article');
        card.className = 'card glass-card reveal-up';
        card.dataset.pkgId = pkg.id;
        card.dataset.duration = durationDays;
        card.dataset.price = priceRange;
        card.dataset.acc = accomType;

        card.innerHTML = `
            <div class="package-img-wrapper" style="aspect-ratio: 16/9; overflow: hidden; border-radius: 12px 12px 0 0;">
                <img src="${pkg.image}" alt="${pkg.name}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div style="padding:1.25rem;">
                <p class="duration">${durationDays} Days / ${nights} Nights</p>
                <h3>${pkg.name}</h3>
                <p class="highlights">${pkg.description}</p>
                ${hasDiscount
                ? `<p class="price">EGP ${pkg.discountedPrice.toLocaleString()} <span style="text-decoration:line-through;opacity:.6;font-size:.85em;">EGP ${pkg.price.toLocaleString()}</span></p>`
                : `<p class="price">EGP ${price.toLocaleString()}</p>`
            }
                ${pkg.hotelName ? `<p style="font-size:.8rem;opacity:.7;margin-bottom:.5rem;"><i class="fas fa-hotel"></i> ${pkg.hotelName}</p>` : ''}
                <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                    <button class="details-btn" data-id="${pkg.id}" data-tier="standard" style="flex: 1; padding: 0.5rem; background: var(--surface); color: var(--text-primary); border: 1px solid var(--border);">Standard (Inc. Acc. & Transport)</button>
                    <button class="details-btn" data-id="${pkg.id}" data-tier="deluxe" style="flex: 2; padding: 0.5rem;">Deluxe (Inc. Guide)</button>
                </div>
                <div class="itinerary-data" style="display:none;">${itineraryHtml}</div>
            </div>
        `;
        container.appendChild(card);
    });

    // Attach detail button listeners
    document.querySelectorAll('.details-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const card = this.closest('.card');
            const pkgId = card.dataset.pkgId;
            const tier = this.dataset.tier || 'standard';
            window.location.href = `../PackageDetailsPage/package-details.html?id=${pkgId}&tier=${tier}`;
        });
    });

    // Re-run IntersectionObserver for reveal-up animations
    if (typeof initRevealAnimations === 'function') {
        initRevealAnimations();
    } else {
        document.querySelectorAll('.reveal-up').forEach(el => {
            const obs = new IntersectionObserver((entries) => {
                entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('active'); obs.unobserve(e.target); } });
            }, { threshold: 0.1 });
            obs.observe(el);
        });
    }
}

// ── Filters ──────────────────────────────────────────────────────────────────
function initFilters() {
    const durationFilter = document.getElementById('filter-duration');
    const priceFilter = document.getElementById('filter-price');
    const accFilter = document.getElementById('filter-acc');
    if (!durationFilter) return;

    function applyFilters() {
        const selDuration = durationFilter.value;
        const selPrice = priceFilter.value;
        const selAcc = accFilter.value;

        document.querySelectorAll('.card').forEach(card => {
            const matchDur = selDuration === 'all' || selDuration === card.dataset.duration;
            const matchPrice = selPrice === 'all' || selPrice === card.dataset.price;
            const matchAcc = selAcc === 'all' || selAcc === card.dataset.acc;
            card.style.display = (matchDur && matchPrice && matchAcc) ? '' : 'none';
        });
    }

    durationFilter.addEventListener('change', applyFilters);
    priceFilter.addEventListener('change', applyFilters);
    accFilter.addEventListener('change', applyFilters);
}