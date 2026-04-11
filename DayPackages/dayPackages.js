// Package Data
const allPackages = [
    {
        id: 1,
        name: "Blue Hole Adventure",
        location: "Sinai",
        price: 45,
        type: "coastal",
        overnightAvailable: true,
        overnightPrice: 35,
        mealAvailable: true,
        mealPrice: 15,
        description: "Snorkeling • Coral reefs • Marine life • Professional guide • Beach lunch"
    },
    {
        id: 2,
        name: "Pyramids of Giza",
        location: "Giza",
        price: 60,
        type: "historical",
        overnightAvailable: true,
        overnightPrice: 45,
        mealAvailable: true,
        mealPrice: 18,
        description: "Great Pyramid • Sphinx • Solar Boat • Camel ride • Egyptologist guide"
    },
    {
        id: 3,
        name: "Salah El-Din Castle",
        location: "Cairo",
        price: 35,
        type: "historical",
        overnightAvailable: false,
        overnightPrice: 0,
        mealAvailable: true,
        mealPrice: 12,
        description: "Medieval fortress • Mohamed Ali Mosque • Military Museum • Cairo views"
    },
    {
        id: 4,
        name: "Qayt Bay Castle",
        location: "Alexandria",
        price: 40,
        type: "historical",
        overnightAvailable: true,
        overnightPrice: 40,
        mealAvailable: true,
        mealPrice: 14,
        description: "15th-century fortress • Ancient Lighthouse site • Mediterranean views • Naval Museum"
    },
    {
        id: 5,
        name: "Fayoum Oasis",
        location: "Fayoum",
        price: 50,
        type: "cultural",
        overnightAvailable: true,
        overnightPrice: 38,
        mealAvailable: true,
        mealPrice: 16,
        description: "Water wheels • Wadi El-Rayan waterfalls • Lake Qarun • Pottery village"
    },
    {
        id: 6,
        name: "Nubian Village",
        location: "Aswan",
        price: 55,
        type: "cultural",
        overnightAvailable: true,
        overnightPrice: 42,
        mealAvailable: true,
        mealPrice: 17,
        description: "Colorful houses • Crocodile museum • Traditional music • Henna • Nile boat"
    }
];

let selectedPackage = null;
let currentOptions = {
    overnight: false,
    meal: false,
    people: 1,
    translator: false,
    translatorLang: "",
    groupType: "small"
};

// DOM Elements
const packagesGrid = document.getElementById('packagesGrid');
const priceFilter = document.getElementById('priceFilter');
const typeFilter = document.getElementById('typeFilter');
const applyFiltersBtn = document.getElementById('applyFiltersBtn');
const resetFiltersBtn = document.getElementById('resetFiltersBtn');
const bookingOptions = document.getElementById('bookingOptions');
const overnightCheckbox = document.getElementById('overnightCheckbox');
const mealCheckbox = document.getElementById('mealCheckbox');
const peopleCount = document.getElementById('peopleCount');
const translatorCheckbox = document.getElementById('translatorCheckbox');
const languageSelect = document.getElementById('languageSelect');
const bookNowBtn = document.getElementById('bookNowBtn');
const cancelBookingBtn = document.getElementById('cancelBookingBtn');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    renderPackages(allPackages);
    attachEventListeners();
});

function renderPackages(packagesToShow) {
    packagesGrid.innerHTML = '';
    
    packagesToShow.forEach(pkg => {
        const card = document.createElement('div');
        card.className = 'package-card';
        card.setAttribute('data-id', pkg.id);
        
        const typeDisplay = {
            coastal: 'Coastal',
            historical: 'Historical',
            cultural: 'Cultural'
        };
        
        card.innerHTML = `
            <h3>${pkg.name}</h3>
            <p><strong>Location:</strong> ${pkg.location}</p>
            <p><strong>Type:</strong> ${typeDisplay[pkg.type]}</p>
            <p><strong>Price:</strong> $${pkg.price}</p>
            <p><strong>Activities:</strong> ${pkg.description}</p>
            <p><strong>Overnight:</strong> ${pkg.overnightAvailable ? 'Available (+$' + pkg.overnightPrice + ')' : 'Not available'}</p>
            <p><strong>Meal:</strong> ${pkg.mealAvailable ? 'Available (+$' + pkg.mealPrice + ')' : 'Not available'}</p>
            <button onclick="selectPackage(${pkg.id})">Select This Package</button>
        `;
        
        packagesGrid.appendChild(card);
    });
}

function selectPackage(packageId) {
    selectedPackage = allPackages.find(p => p.id === packageId);
    
    // HIDE ALL OTHER PACKAGES - show only selected one
    const allCards = document.querySelectorAll('.package-card');
    allCards.forEach(card => {
        const cardId = parseInt(card.getAttribute('data-id'));
        if (cardId === packageId) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
    
    // Reset options
    currentOptions = {
        overnight: false,
        meal: false,
        people: 1,
        translator: false,
        translatorLang: "",
        groupType: "small"
    };
    
    overnightCheckbox.checked = false;
    mealCheckbox.checked = false;
    peopleCount.value = "1";
    translatorCheckbox.checked = false;
    languageSelect.style.display = "none";
    document.getElementById('translatorLanguage').value = "";
    document.querySelector('input[value="small"]').checked = true;
    
    bookingOptions.style.display = "block";
    updatePriceDisplay();
    bookingOptions.scrollIntoView({ behavior: 'smooth' });
}

function cancelSelection() {
    selectedPackage = null;
    bookingOptions.style.display = "none";
    
    // SHOW ALL PACKAGES AGAIN
    const allCards = document.querySelectorAll('.package-card');
    allCards.forEach(card => {
        card.style.display = 'block';
    });
}

function updatePriceDisplay() {
    if (!selectedPackage) return;
    
    let basePrice = selectedPackage.price;
    let overnightPrice = 0;
    let mealPrice = 0;
    let translatorPrice = 0;
    let groupPrice = 0;
    
    document.getElementById('basePriceDisplay').textContent = basePrice;
    
    if (currentOptions.overnight && selectedPackage.overnightAvailable) {
        overnightPrice = selectedPackage.overnightPrice;
        document.getElementById('overnightDisplay').style.display = 'block';
        document.getElementById('overnightPriceDisplay').textContent = overnightPrice;
    } else {
        document.getElementById('overnightDisplay').style.display = 'none';
    }
    
    if (currentOptions.meal && selectedPackage.mealAvailable) {
        mealPrice = selectedPackage.mealPrice;
        document.getElementById('mealDisplay').style.display = 'block';
        document.getElementById('mealPriceDisplay').textContent = mealPrice;
    } else {
        document.getElementById('mealDisplay').style.display = 'none';
    }
    
    if (currentOptions.translator && currentOptions.translatorLang) {
        translatorPrice = 30;
        document.getElementById('translatorDisplay').style.display = 'block';
    } else {
        document.getElementById('translatorDisplay').style.display = 'none';
    }
    
    if (currentOptions.groupType === "small") {
        groupPrice = 50;
        document.getElementById('groupDisplay').style.display = 'block';
    } else {
        document.getElementById('groupDisplay').style.display = 'none';
    }
    
    let totalPerPerson = basePrice + overnightPrice + mealPrice + translatorPrice + groupPrice;
    let finalTotal = totalPerPerson * currentOptions.people;
    
    document.getElementById('totalPerPerson').textContent = totalPerPerson;
    document.getElementById('peopleCountDisplay').textContent = currentOptions.people;
    document.getElementById('totalFinal').textContent = finalTotal;
}

function filterPackages() {
    const priceValue = priceFilter.value;
    const typeValue = typeFilter.value;
    
    let filtered = [...allPackages];
    
    if (priceValue !== 'all') {
        filtered = filtered.filter(pkg => {
            if (priceValue === 'under40') return pkg.price < 40;
            if (priceValue === '40to50') return pkg.price >= 40 && pkg.price <= 50;
            if (priceValue === '50to60') return pkg.price >= 50 && pkg.price <= 60;
            if (priceValue === 'over60') return pkg.price > 60;
            return true;
        });
    }
    
    if (typeValue !== 'all') {
        filtered = filtered.filter(pkg => pkg.type === typeValue);
    }
    
    renderPackages(filtered);
    
    if (selectedPackage && !filtered.find(p => p.id === selectedPackage.id)) {
        cancelSelection();
    }
}

function resetFilters() {
    priceFilter.value = 'all';
    typeFilter.value = 'all';
    renderPackages(allPackages);
    if (selectedPackage) cancelSelection();
}

function attachEventListeners() {
    applyFiltersBtn.addEventListener('click', filterPackages);
    resetFiltersBtn.addEventListener('click', resetFilters);
    cancelBookingBtn.addEventListener('click', cancelSelection);
    
    overnightCheckbox.addEventListener('change', function(e) {
        currentOptions.overnight = e.target.checked;
        updatePriceDisplay();
    });
    
    mealCheckbox.addEventListener('change', function(e) {
        currentOptions.meal = e.target.checked;
        updatePriceDisplay();
    });
    
    peopleCount.addEventListener('change', function(e) {
        currentOptions.people = parseInt(e.target.value);
        updatePriceDisplay();
    });
    
    translatorCheckbox.addEventListener('change', function(e) {
        currentOptions.translator = e.target.checked;
        languageSelect.style.display = currentOptions.translator ? 'block' : 'none';
        if (!currentOptions.translator) currentOptions.translatorLang = "";
        updatePriceDisplay();
    });
    
    document.getElementById('translatorLanguage').addEventListener('change', function(e) {
        currentOptions.translatorLang = e.target.value;
        updatePriceDisplay();
    });
    
    document.querySelectorAll('input[name="groupType"]').forEach(radio => {
        radio.addEventListener('change', function(e) {
            currentOptions.groupType = e.target.value;
            updatePriceDisplay();
        });
    });
    
    bookNowBtn.addEventListener('click', processBooking);
}

function processBooking() {
    if (!selectedPackage) {
        alert('Please select a package first.');
        return;
    }
    
    if (currentOptions.translator && !currentOptions.translatorLang) {
        alert('Please select a language for the translator.');
        return;
    }
    
    let basePrice = selectedPackage.price;
    let overnightPrice = currentOptions.overnight && selectedPackage.overnightAvailable ? selectedPackage.overnightPrice : 0;
    let mealPrice = currentOptions.meal && selectedPackage.mealAvailable ? selectedPackage.mealPrice : 0;
    let translatorPrice = currentOptions.translator ? 30 : 0;
    let groupPrice = currentOptions.groupType === "small" ? 50 : 0;
    let totalPerPerson = basePrice + overnightPrice + mealPrice + translatorPrice + groupPrice;
    let finalTotal = totalPerPerson * currentOptions.people;
    
    const booking = {
        bookingId: 'BKG' + Date.now(),
        packageName: selectedPackage.name,
        location: selectedPackage.location,
        peopleCount: currentOptions.people,
        basePrice: selectedPackage.price,
        overnight: currentOptions.overnight,
        overnightPrice: overnightPrice,
        meal: currentOptions.meal,
        mealPrice: mealPrice,
        translator: currentOptions.translator,
        translatorLang: currentOptions.translatorLang,
        groupType: currentOptions.groupType,
        groupPrice: groupPrice,
        totalPrice: finalTotal,
        bookingDate: new Date().toLocaleString()
    };
    
    let bookings = JSON.parse(localStorage.getItem('beyondPyramids_bookings')) || [];
    bookings.push(booking);
    localStorage.setItem('beyondPyramids_bookings', JSON.stringify(bookings));
    localStorage.setItem('currentBooking', JSON.stringify(booking));
    
    alert(`Booking Confirmed!\n\nPackage: ${selectedPackage.name}\nTotal: $${finalTotal}\nBooking ID: ${booking.bookingId}`);
    
    window.location.href = 'bookingSummary.html';
}