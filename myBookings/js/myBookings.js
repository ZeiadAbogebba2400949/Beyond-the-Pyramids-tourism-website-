// Sample booking data for testing (since pages aren't connected yet)
const sampleBookings = [
    {
        bookingId: "BKG001",
        tripType: "Day Package",
        tripName: "Pyramids of Giza",
        places: ["Giza Pyramids", "Sphinx", "Solar Boat Museum"],
        bookingDate: "2024-01-15",
        status: "completed",
        peopleCount: 2,
        totalPrice: 120,
        overnight: false,
        meal: true
    },
    {
        bookingId: "BKG002",
        tripType: "Day Package",
        tripName: "Blue Hole Adventure",
        places: ["Blue Hole", "Coral Reefs", "Dahab Beach"],
        bookingDate: "2024-02-20",
        status: "booked",
        peopleCount: 1,
        totalPrice: 45,
        overnight: false,
        meal: false
    },
    {
        bookingId: "BKG003",
        tripType: "Week Package",
        tripName: "Cairo & Luxor Explorer",
        places: ["Pyramids", "Egyptian Museum", "Karnak Temple", "Valley of Kings"],
        bookingDate: "2024-03-10",
        status: "pending approval",
        peopleCount: 3,
        totalPrice: 450,
        overnight: true,
        meal: true
    },
    {
        bookingId: "BKG004",
        tripType: "Single Location",
        tripName: "Salah El-Din Castle",
        places: ["Salah El-Din Castle", "Mohamed Ali Mosque"],
        bookingDate: "2023-12-05",
        status: "completed",
        peopleCount: 1,
        totalPrice: 35,
        overnight: false,
        meal: false
    },
    {
        bookingId: "BKG005",
        tripType: "Customized",
        tripName: "Alexandria Custom Tour",
        places: ["Qayt Bay Castle", "Alexandria Library", "Montaza Palace"],
        bookingDate: "2024-01-28",
        status: "canceled",
        peopleCount: 2,
        totalPrice: 140,
        overnight: true,
        meal: true
    },
    {
        bookingId: "BKG006",
        tripType: "Day Package",
        tripName: "Nubian Village",
        places: ["Nubian Village", "Nile Boat Ride"],
        bookingDate: "2024-04-01",
        status: "booked",
        peopleCount: 4,
        totalPrice: 220,
        overnight: false,
        meal: true
    }
];

// Global variables
let currentBookings = [];
let filteredBookings = [];

// DOM Elements
const bookingsList = document.getElementById('bookingsList');
const dateFrom = document.getElementById('dateFrom');
const dateTo = document.getElementById('dateTo');
const statusFilter = document.getElementById('statusFilter');
const applyDateFilter = document.getElementById('applyDateFilter');
const resetDateFilter = document.getElementById('resetDateFilter');
const modal = document.getElementById('detailsModal');
const modalBody = document.getElementById('modalBody');
const closeModal = document.querySelector('.close-modal');

// Status display configuration - covers all possible statuses
const statusConfig = {
    'pending approval': { text: 'Pending Approval', color: 'orange' },
    'booked': { text: 'Booked', color: 'green' },
    'completed': { text: 'Completed', color: 'blue' },
    'canceled': { text: 'Canceled', color: 'red' },
    'confirmed': { text: 'Confirmed', color: 'green' }
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Load bookings (use sample data for testing)
    loadBookings();
    attachEventListeners();
    checkLoginStatus();
});

// Load bookings from localStorage or use sample data
function loadBookings() {
    // TEMPORARILY DISABLED: Loading from localStorage
    // TODO: Re-enable this when pages are connected and real booking data exists
    /*
    let stored = localStorage.getItem('beyondPyramids_bookings');
    let storedBookings = stored ? JSON.parse(stored) : null;
    
    if (storedBookings && storedBookings.length > 0) {
        // Convert stored bookings to match our format
        currentBookings = storedBookings.map(booking => ({
            bookingId: booking.bookingId,
            tripType: booking.tripType || "Day Package",
            tripName: booking.packageName,
            places: [booking.location],
            bookingDate: booking.bookingDate ? booking.bookingDate.split(',')[0] : new Date().toISOString().split('T')[0],
            status: booking.status || "booked",
            peopleCount: booking.peopleCount || 1,
            totalPrice: booking.totalPrice,
            overnight: booking.overnight || false,
            meal: booking.meal || false
        }));
    } else {
        // Use sample data for testing
        currentBookings = [...sampleBookings];
    }
    */
    
    // TEMPORARILY: Always use sample data
    currentBookings = [...sampleBookings];
    
    filteredBookings = [...currentBookings];
    renderBookings();
}

// Render bookings to the page
function renderBookings() {
    if (filteredBookings.length === 0) {
        bookingsList.innerHTML = `
            <div class="empty-state">
                <p>No trips booked yet. Would you like to get started?</p>
                <a href="dayPackages.html" class="get-started-btn">Browse Packages</a>
            </div>
        `;
        return;
    }
    
    bookingsList.innerHTML = '';
    
    filteredBookings.forEach(booking => {
        const card = createBookingCard(booking);
        bookingsList.appendChild(card);
    });
}

// Create a single booking card
function createBookingCard(booking) {
    const card = document.createElement('div');
    card.className = 'booking-card';
    card.setAttribute('data-id', booking.bookingId);
    
    const status = statusConfig[booking.status] || { text: booking.status, color: 'gray' };
    
    // Format places as comma-separated
    const placesText = Array.isArray(booking.places) ? booking.places.join(', ') : booking.places;
    
    card.innerHTML = `
        <div class="booking-header">
            <div>
                <span class="booking-type">${booking.tripType}</span>
                <span class="booking-status" style="color: ${status.color}; border-color: ${status.color};">${status.text}</span>
            </div>
            <div class="booking-id">ID: ${booking.bookingId}</div>
        </div>
        <div class="booking-body">
            <h3>${booking.tripName}</h3>
            <p><strong>Places:</strong> ${placesText}</p>
            <p><strong>Booking Date:</strong> ${formatDate(booking.bookingDate)}</p>
            <p><strong>People:</strong> ${booking.peopleCount}</p>
            <p><strong>Total Price:</strong> $${booking.totalPrice}</p>
        </div>
        <div class="booking-footer">
            <button class="view-details-btn">View Trip Details</button>
        </div>
    `;
    
    return card;
}

// Format date for display
const formatDate = dateString => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

// Filter bookings by date range AND status
function filterByDateRange() {
    const fromDate = dateFrom.value;
    const toDate = dateTo.value;
    const statusValue = statusFilter.value;
    
    // Start with all bookings
    let filtered = [...currentBookings];
    
    // Apply from date filter if not empty
    if (fromDate !== '') {
        filtered = filtered.filter(booking => booking.bookingDate >= fromDate);
    }
    
    // Apply to date filter if not empty
    if (toDate !== '') {
        filtered = filtered.filter(booking => booking.bookingDate <= toDate);
    }
    
    // Apply status filter if not "all"
    if (statusValue !== 'all') {
        filtered = filtered.filter(booking => booking.status === statusValue);
    }
    
    filteredBookings = filtered;
    renderBookings();
}

// Reset all filters - shows ALL bookings
function resetDateFilters() {
    // Clear the date input fields
    dateFrom.value = '';
    dateTo.value = '';
    
    // Reset status filter to "all"
    statusFilter.value = 'all';
    
    // Reset filtered bookings to show ALL bookings
    filteredBookings = [...currentBookings];
    renderBookings();
}

// Show trip details modal
function showDetails(bookingId) {
    const booking = filteredBookings.find(b => b.bookingId === bookingId);
    if (!booking) return;
    
    const status = statusConfig[booking.status] || { text: booking.status, color: 'gray' };
    const placesText = Array.isArray(booking.places) ? booking.places.join(', ') : booking.places;
    
    modalBody.innerHTML = `
        <div class="detail-row">
            <strong>Booking ID:</strong> ${booking.bookingId}
        </div>
        <div class="detail-row">
            <strong>Trip Type:</strong> ${booking.tripType}
        </div>
        <div class="detail-row">
            <strong>Trip Name:</strong> ${booking.tripName}
        </div>
        <div class="detail-row">
            <strong>Places Visited:</strong> ${placesText}
        </div>
        <div class="detail-row">
            <strong>Booking Date:</strong> ${formatDate(booking.bookingDate)}
        </div>
        <div class="detail-row">
            <strong>Status:</strong> <span style="color: ${status.color};">${status.text}</span>
        </div>
        <div class="detail-row">
            <strong>Number of People:</strong> ${booking.peopleCount}
        </div>
        <div class="detail-row">
            <strong>Total Price:</strong> $${booking.totalPrice}
        </div>
        <div class="detail-row">
            <strong>Overnight Stay:</strong> ${booking.overnight ? 'Yes' : 'No'}
        </div>
        <div class="detail-row">
            <strong>Meal Included:</strong> ${booking.meal ? 'Yes' : 'No'}
        </div>
    `;
    
    modal.style.display = 'block';
}

// Close modal
function closeModalWindow() {
    modal.style.display = 'none';
}

// Attach event listeners
function attachEventListeners() {
    // Filter button listeners
    applyDateFilter.addEventListener('click', filterByDateRange);
    resetDateFilter.addEventListener('click', resetDateFilters);
    statusFilter.addEventListener('change', filterByDateRange);
    closeModal.addEventListener('click', closeModalWindow);
    
    // Event delegation for "View Trip Details" buttons
    bookingsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('view-details-btn')) {
            const bookingId = e.target.closest('.booking-card').dataset.id;
            showDetails(bookingId);
        }
    });
    
    // Close modal when clicking outside of it
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModalWindow();
        }
    });
}

// Check login status for header
function checkLoginStatus() {
    // TEMPORARILY DISABLED: Login status checking from localStorage
    // TODO: Re-enable when authentication system is connected
    /*
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const authLink = document.getElementById('authLink');
    
    if (isLoggedIn) {
        let stored = localStorage.getItem('beyondPyramids_currentUser');
        const user = stored ? JSON.parse(stored) : null;
        authLink.textContent = user ? `Logout (${user.firstName})` : 'Logout';
        authLink.href = '#';
        authLink.onclick = function(e) {
            e.preventDefault();
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('beyondPyramids_currentUser');
            alert('Logged out!');
            window.location.reload();
        };
    } else {
        authLink.textContent = 'Login';
        authLink.href = 'login.html';
    }
    */
    
    // TEMPORARILY: Default to not logged in state
    const authLink = document.getElementById('authLink');
    authLink.textContent = 'Login';
    authLink.href = 'login.html';
}