

document.addEventListener('DOMContentLoaded', function () {
    if (window.LoginGate && !LoginGate.requireLogin({ message: 'You must be logged in to write reviews.' })) {
        return;
    }

    displayUserName();
    setupPackageSelection();
    setupStarRating();
    setupPhotoUpload();
    setupFormSubmission();

    initAnimations();
});

function displayUserName() {
    const userName = document.getElementById('user-name');
    const avatar = document.getElementById('reviewer-avatar');
    const session = getSession();
    const userRecord = getUserRecord(session);
    const displayName = userRecord?.name || session?.name || session?.email?.split('@')[0] || 'Traveler';
    const image = userRecord?.image || session?.image || '';

    if (userName) userName.textContent = displayName;
    if (avatar && image) {
        avatar.innerHTML = `<img src="${image}" alt="${displayName}">`;
    }
}

function getSession() {
    try {
        if (window.AppStorage && AppStorage.getUserSession) {
            const appSession = AppStorage.getUserSession();
            if (appSession && appSession.email) return appSession;
        }

        const raw = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

function getUserRecord(session) {
    if (!session || !session.email) return null;

    try {
        if (window.AppStorage && AppStorage.getUserByEmail) {
            return AppStorage.getUserByEmail(session.email);
        }
    } catch (e) {
        return null;
    }

    return null;
}

function setupPackageSelection() {
    const radioButtons = document.querySelectorAll('input[name="packageType"]');
    const packageLabel = document.getElementById('package-label');
    const packageSelect = document.getElementById('package-select');

    radioButtons.forEach(radio => {
        radio.addEventListener('change', function () {
            const selectedType = this.value;
            const typeLabel = getPackageTypeLabel(selectedType);
            const packages = getPackagesByType(selectedType);

            if (packageLabel) packageLabel.textContent = typeLabel.toLowerCase();
            if (!packageSelect) return;

            packageSelect.innerHTML = `<option value="">Choose a ${typeLabel.toLowerCase()}</option>`;

            packages.forEach(pkg => {
                const option = document.createElement('option');
                option.value = pkg.id;
                option.textContent = pkg.name;
                packageSelect.appendChild(option);
            });
        });
    });
}

function getPackageCatalog() {
    const packages = [];

    try {
        if (window.AppStorage && AppStorage.getPackages) {
            packages.push(...(AppStorage.getPackages() || []));
        }
    } catch (e) {}

    if (window.MockData && Array.isArray(MockData.packages)) {
        MockData.packages.forEach(pkg => {
            if (!packages.some(existing => existing.id === pkg.id)) packages.push(pkg);
        });
    }

    return packages;
}

function getPackagesByType(type) {
    return getPackageCatalog().filter(pkg => getPackageType(pkg) === type);
}

function getPackageType(pkg) {
    const raw = [
        pkg?.type,
        pkg?.category,
        pkg?._category,
        pkg?.packageType
    ].filter(Boolean).join(' ').toLowerCase();

    if (raw.includes('week')) return 'week';
    if (raw.includes('single') || raw.includes('location')) return 'single';
    return 'day';
}

function getPackageTypeLabel(type) {
    const labels = {
        day: 'Day Package',
        week: 'Week Package',
        single: 'Single Location'
    };

    return labels[type] || 'Package';
}

function setupStarRating() {
    const stars = document.querySelectorAll('.stars-glamour i');
    let currentRating = 0;

    stars.forEach(star => {
        star.addEventListener('mouseenter', function () {
            const rating = parseInt(this.getAttribute('data-rating'));
            highlightStars(rating);
        });

        star.addEventListener('mouseleave', function () {
            highlightStars(currentRating);
        });

        star.addEventListener('click', function () {
            currentRating = parseInt(this.getAttribute('data-rating'));
            highlightStars(currentRating);
        });
    });

    function highlightStars(rating) {
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('fas');
                star.classList.remove('far');
            } else {
                star.classList.add('far');
                star.classList.remove('fas');
            }
        });
    }
}

let selectedFiles = [];

function setupPhotoUpload() {
    const uploadArea = document.getElementById('upload-area');
    const photoInput = document.getElementById('photo-input');
    const photoPreview = document.getElementById('photo-preview');

    if (uploadArea) {
        uploadArea.addEventListener('click', function () {
            photoInput.click();
        });

        uploadArea.addEventListener('dragover', function (e) {
            e.preventDefault();
            uploadArea.classList.add('is-dragover');
        });

        uploadArea.addEventListener('dragleave', function () {
            uploadArea.classList.remove('is-dragover');
        });

        uploadArea.addEventListener('drop', function (e) {
            e.preventDefault();
            uploadArea.classList.remove('is-dragover');
            selectedFiles = Array.from(e.dataTransfer.files).filter(file => /^image\/(jpeg|png)$/.test(file.type));
            displayPhotoPreviews();
        });
    }

    if (photoInput) {
        photoInput.addEventListener('change', function (e) {
            selectedFiles = Array.from(e.target.files);
            displayPhotoPreviews();
        });
    }

    function displayPhotoPreviews() {
        photoPreview.innerHTML = '';

        selectedFiles.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = function (e) {
                const preview = document.createElement('div');
                preview.className = 'preview-item';
                preview.innerHTML = `
                    <img src="${e.target.result}" alt="Preview">
                    <button class="remove-photo" data-index="${index}" aria-label="Remove photo">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                photoPreview.appendChild(preview);

                preview.querySelector('.remove-photo').addEventListener('click', function () {
                    selectedFiles.splice(index, 1);
                    displayPhotoPreviews();
                    photoInput.value = '';
                });
            };
            reader.readAsDataURL(file);
        });
    }
}

function setupFormSubmission() {
    const submitBtn = document.getElementById('submit-review');
    const feedback = document.getElementById('form-feedback');

    function showFeedback(message, type = 'error') {
        if (!feedback) return;
        feedback.textContent = message;
        feedback.classList.toggle('success', type === 'success');
    }

    if (submitBtn) {
        submitBtn.addEventListener('click', function () {
            showFeedback('');
            const selectedType = document.querySelector('input[name="packageType"]:checked');
            const packageType = selectedType ? selectedType.value : null;

            const packageSelect = document.getElementById('package-select');
            const selectedPackageId = packageSelect?.value || '';
            const selectedPackage = getPackageCatalog().find(pkg => pkg.id === selectedPackageId);

            const filledStars = document.querySelectorAll('.stars-glamour i.fas');
            const rating = filledStars.length;

            const reviewText = document.getElementById('review-text').value.trim();

            if (!packageType) {
                showFeedback('Choose a package type.');
                return;
            }

            if (!selectedPackage) {
                showFeedback('Choose a specific package.');
                return;
            }

            if (rating === 0) {
                showFeedback('Choose a star rating.');
                return;
            }

            if (reviewText.length < 10) {
                showFeedback('Write at least 10 characters.');
                return;
            }

            const session = getSession();
            const userRecord = getUserRecord(session);
            const displayName = userRecord?.name || session?.name || session?.email?.split('@')[0] || 'Traveler';
            const review = {
                id: 'REV-' + Date.now(),
                type: packageType,
                packageType: packageType,
                item: selectedPackage.name,
                packageId: selectedPackage.id,
                packageName: selectedPackage.name,
                rating: rating,
                title: selectedPackage.name,
                review: reviewText,
                text: reviewText,
                photos: selectedFiles.length,
                user: displayName,
                userName: displayName,
                email: session?.email || '',
                userEmail: session?.email || '',
                date: new Date().toISOString().slice(0, 10)
            };

            const stored = JSON.parse(localStorage.getItem('beyondPyramids_reviews') || '[]');
            stored.unshift(review);
            localStorage.setItem('beyondPyramids_reviews', JSON.stringify(stored));

            showFeedback('Review submitted.', 'success');
            document.getElementById('success-modal').style.display = 'flex';
        });
    }
}

function closeModal() {
    window.location.href = '../UserDashboardPage/dashboard.html';
}



function initAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal-up').forEach(el => observer.observe(el));
}
