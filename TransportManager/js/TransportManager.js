// ============ SAMPLE DATA ============
let vehicles = [
    { id: "VH001", type: "Bus", licensePlate: "ABC123", capacity: 50, driverId: "", driverName: "", status: "available" },
    { id: "VH002", type: "Van", licensePlate: "XYZ789", capacity: 15, driverId: "DR002", driverName: "Ahmed Hassan", status: "in-use" },
    { id: "VH003", type: "Car", licensePlate: "DEF456", capacity: 4, driverId: "", driverName: "", status: "available" },
    { id: "VH004", type: "Minibus", licensePlate: "GHI789", capacity: 25, driverId: "", driverName: "", status: "available" },
    { id: "VH005", type: "Bus", licensePlate: "JKL012", capacity: 50, driverId: "", driverName: "", status: "available" },
    { id: "VH006", type: "Van", licensePlate: "MNO345", capacity: 15, driverId: "DR004", driverName: "Omar El-Sayed", status: "in-use" }
];

let drivers = [
    { id: "DR001", name: "Mohamed Ali", phone: "+20123456789", licenseNumber: "DL123456", status: "available", assignedVehicleId: "", tripsCompleted: 45 },
    { id: "DR002", name: "Ahmed Hassan", phone: "+20123456780", licenseNumber: "DL123457", status: "on-trip", assignedVehicleId: "VH002", tripsCompleted: 32 },
    { id: "DR003", name: "Sara Mahmoud", phone: "+20123456781", licenseNumber: "DL123458", status: "available", assignedVehicleId: "", tripsCompleted: 18 },
    { id: "DR004", name: "Omar El-Sayed", phone: "+20123456782", licenseNumber: "DL123459", status: "on-trip", assignedVehicleId: "VH006", tripsCompleted: 27 },
    { id: "DR005", name: "Laila Ibrahim", phone: "+20123456783", licenseNumber: "DL123460", status: "available", assignedVehicleId: "", tripsCompleted: 12 },
    { id: "DR006", name: "Khaled Youssef", phone: "+20123456784", licenseNumber: "DL123461", status: "inactive", assignedVehicleId: "", tripsCompleted: 8 },
    { id: "DR007", name: "Yasmin Ibrahim", phone: "+20123456785", licenseNumber: "DL123462", status: "available", assignedVehicleId: "", tripsCompleted: 3 }
];

let transportBookings = [
    { id: "TB001", bookingId: "BKG001", tripName: "Pyramids Tour", date: "2025-05-10", pickupLocation: "Cairo Airport", dropoffLocation: "Pyramids Hotel", passengers: 10, vehicleType: "Bus", status: "pending", assignedVehicleId: "", assignedDriverId: "", customerName: "Ahmed Hassan", customerPhone: "+20123456790" },
    { id: "TB002", bookingId: "BKG002", tripName: "Luxor Tour", date: "2025-05-15", pickupLocation: "Luxor Station", dropoffLocation: "Valley of Kings", passengers: 8, vehicleType: "Van", status: "confirmed", assignedVehicleId: "VH002", assignedDriverId: "DR002", customerName: "Sara Mahmoud", customerPhone: "+20123456791" },
    { id: "TB003", bookingId: "BKG003", tripName: "Alexandria Tour", date: "2025-05-20", pickupLocation: "Alexandria Port", dropoffLocation: "Library of Alexandria", passengers: 4, vehicleType: "Car", status: "pending", assignedVehicleId: "", assignedDriverId: "", customerName: "Nourhan Adel", customerPhone: "+20123456792" },
    { id: "TB004", bookingId: "BKG004", tripName: "Nubian Village", date: "2025-04-10", pickupLocation: "Aswan Airport", dropoffLocation: "Nubian Village", passengers: 12, vehicleType: "Minibus", status: "completed", assignedVehicleId: "VH004", assignedDriverId: "DR003", customerName: "Omar El-Sayed", customerPhone: "+20123456793" },
    { id: "TB005", bookingId: "BKG005", tripName: "Sinai Adventure", date: "2025-05-25", pickupLocation: "Sharm Airport", dropoffLocation: "Dahab Beach", passengers: 6, vehicleType: "Van", status: "pending", assignedVehicleId: "", assignedDriverId: "", customerName: "Khaled Youssef", customerPhone: "+20123456794" },
    { id: "TB006", bookingId: "BKG006", tripName: "White Desert Trip", date: "2025-04-25", pickupLocation: "Cairo", dropoffLocation: "White Desert", passengers: 8, vehicleType: "Bus", status: "confirmed", assignedVehicleId: "VH001", assignedDriverId: "DR001", customerName: "Mona Said", customerPhone: "+20123456795" },
    { id: "TB007", bookingId: "BKG007", tripName: "Cairo Food Tour", date: "2025-05-05", pickupLocation: "Downtown Cairo", dropoffLocation: "Islamic Cairo", passengers: 5, vehicleType: "Car", status: "cancelled", assignedVehicleId: "", assignedDriverId: "", customerName: "Yasmin Ibrahim", customerPhone: "+20123456796" }
];

// Current filter values
let currentVehicleStatus = 'all';
let currentVehicleType = 'all';
let currentDriverStatus = 'all';
let currentBookingStatus = 'all';
let currentBookingStart = '';
let currentBookingEnd = '';

let currentVehicleId = null;
let currentDriverId = null;
let currentBookingId = null;

// DOM Elements
const vehiclesBody = document.getElementById('vehiclesTableBody');
const driversBody = document.getElementById('driversTableBody');
const bookingsBody = document.getElementById('bookingsTableBody');
const availabilityDate = document.getElementById('availabilityDate');
const checkAvailabilityBtn = document.getElementById('checkAvailabilityBtn');
const availabilityResult = document.getElementById('availabilityResult');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    setDefaultDates();
    loadData();
    attachEventListeners();
    checkAccess();
    updateStats();
    syncAllData();
});

function setDefaultDates() {
    let today = new Date().toISOString().split('T')[0];
    availabilityDate.value = today;
}

function loadData() {
    let storedVehicles = localStorage.getItem('transport_vehicles');
    let storedDrivers = localStorage.getItem('transport_drivers');
    let storedBookings = localStorage.getItem('transport_bookings');
    
    if (storedVehicles) vehicles = JSON.parse(storedVehicles);
    if (storedDrivers) drivers = JSON.parse(storedDrivers);
    if (storedBookings) transportBookings = JSON.parse(storedBookings);
    
    syncAllData();
    renderVehicles();
    renderDrivers();
    renderBookings();
    updateStats();
}

function saveData() {
    localStorage.setItem('transport_vehicles', JSON.stringify(vehicles));
    localStorage.setItem('transport_drivers', JSON.stringify(drivers));
    localStorage.setItem('transport_bookings', JSON.stringify(transportBookings));
}

function syncAllData() {
    // Sync vehicle driver names based on driverId
    vehicles.forEach(vehicle => {
        if (vehicle.driverId) {
            let driver = drivers.find(d => d.id === vehicle.driverId);
            if (driver) {
                vehicle.driverName = driver.name;
                vehicle.status = 'in-use';
            } else {
                vehicle.driverId = '';
                vehicle.driverName = '';
                vehicle.status = 'available';
            }
        } else {
            vehicle.driverName = '';
            // Only set to available if not in maintenance
            if (vehicle.status !== 'maintenance') {
                vehicle.status = 'available';
            }
        }
    });
    
    // Sync driver assignedVehicleId based on vehicle assignments
    drivers.forEach(driver => {
        let vehicle = vehicles.find(v => v.driverId === driver.id);
        if (vehicle) {
            driver.assignedVehicleId = vehicle.id;
            if (driver.status !== 'inactive') {
                driver.status = 'on-trip';
            }
        } else {
            driver.assignedVehicleId = '';
            if (driver.status !== 'inactive' && driver.status !== 'on-trip') {
                driver.status = 'available';
            }
        }
    });
    
    // Sync booking assignments
    transportBookings.forEach(booking => {
        if (booking.status === 'confirmed') {
            let vehicle = vehicles.find(v => v.id === booking.assignedVehicleId);
            let driver = drivers.find(d => d.id === booking.assignedDriverId);
            
            if (!vehicle || !driver) {
                booking.status = 'pending';
                booking.assignedVehicleId = '';
                booking.assignedDriverId = '';
            }
        }
    });
    
    saveData();
}

function updateStats() {
    document.getElementById('totalVehicles').textContent = vehicles.length;
    document.getElementById('availableVehicles').textContent = vehicles.filter(v => v.status === 'available').length;
    document.getElementById('totalDrivers').textContent = drivers.length;
    document.getElementById('activeDrivers').textContent = drivers.filter(d => d.status === 'available').length;
    document.getElementById('pendingBookings').textContent = transportBookings.filter(b => b.status === 'pending').length;
    
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    let tripsThisMonth = transportBookings.filter(b => {
        let bDate = new Date(b.date);
        return bDate.getMonth() === currentMonth && bDate.getFullYear() === currentYear && b.status === 'completed';
    }).length;
    document.getElementById('tripsThisMonth').textContent = tripsThisMonth;
}

// ============ VEHICLES ============
function renderVehicles() {
    let filtered = vehicles.filter(v => 
        (currentVehicleStatus === 'all' || v.status === currentVehicleStatus) &&
        (currentVehicleType === 'all' || v.type === currentVehicleType)
    );
    
    vehiclesBody.innerHTML = filtered.map(v => `
        <tr>
            <td>${v.id}</td>
            <td>${v.type}</td>
            <td>${v.licensePlate}</td>
            <td>${v.capacity}</td>
            <td>${v.driverName || '-'}</td>
            <td class="status-${v.status}">${v.status === 'available' ? 'Available' : v.status === 'in-use' ? 'In Use' : 'Maintenance'}</td>
            <td>
                <button class="edit-btn" onclick="editVehicle('${v.id}')">Edit</button>
                <button class="delete-btn" onclick="deleteVehicle('${v.id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

function editVehicle(id) {
    let v = vehicles.find(v => v.id === id);
    if (!v) return;
    currentVehicleId = id;
    document.getElementById('vehicleModalTitle').textContent = 'Edit Vehicle';
    document.getElementById('vehicleId').value = v.id;
    document.getElementById('vehicleType').value = v.type;
    document.getElementById('vehiclePlate').value = v.licensePlate;
    document.getElementById('vehicleCapacity').value = v.capacity;
    document.getElementById('vehicleStatusSelect').value = v.status;
    document.getElementById('vehicleModal').style.display = 'block';
}

function deleteVehicle(id) {
    if (confirm('Delete this vehicle? It will be removed from all bookings.')) {
        let hasUpcoming = transportBookings.some(b => b.assignedVehicleId === id && (b.status === 'confirmed' || b.status === 'pending'));
        if (hasUpcoming) {
            alert('Cannot delete vehicle with upcoming bookings. Cancel or complete them first.');
            return;
        }
        
        vehicles = vehicles.filter(v => v.id !== id);
        syncAllData();
        saveData();
        renderVehicles();
        renderDrivers();
        renderBookings();
        updateStats();
    }
}

function addVehicle() {
    currentVehicleId = null;
    document.getElementById('vehicleModalTitle').textContent = 'Add Vehicle';
    document.getElementById('vehicleId').value = '';
    document.getElementById('vehicleType').value = '';
    document.getElementById('vehiclePlate').value = '';
    document.getElementById('vehicleCapacity').value = '';
    document.getElementById('vehicleStatusSelect').value = 'available';
    document.getElementById('vehicleModal').style.display = 'block';
}

function saveVehicle() {
    let type = document.getElementById('vehicleType').value.trim();
    let plate = document.getElementById('vehiclePlate').value.trim();
    let capacity = parseInt(document.getElementById('vehicleCapacity').value);
    let status = document.getElementById('vehicleStatusSelect').value;
    
    if (!type || !plate || !capacity) { alert('Fill all fields'); return; }
    
    if (currentVehicleId) {
        let index = vehicles.findIndex(v => v.id === currentVehicleId);
        vehicles[index] = { ...vehicles[index], type, licensePlate: plate, capacity, status };
    } else {
        let newId = 'VH' + String(vehicles.length + 1).padStart(3, '0');
        vehicles.push({ id: newId, type, licensePlate: plate, capacity, driverId: '', driverName: '', status });
    }
    
    syncAllData();
    saveData();
    closeVehicleModal();
    renderVehicles();
    renderDrivers();
    updateStats();
}

function closeVehicleModal() {
    document.getElementById('vehicleModal').style.display = 'none';
}

function applyVehicleFilter() {
    currentVehicleStatus = document.getElementById('vehicleStatusFilter').value;
    currentVehicleType = document.getElementById('vehicleTypeFilter').value;
    renderVehicles();
}

// ============ DRIVERS ============
function renderDrivers() {
    let filtered = drivers.filter(d => currentDriverStatus === 'all' || d.status === currentDriverStatus);
    
    driversBody.innerHTML = filtered.map(d => {
        let statusText = '';
        let statusClass = '';
        
        if (d.status === 'available') {
            statusText = 'Available';
            statusClass = 'status-available';
        } else if (d.status === 'on-trip') {
            statusText = 'On Trip';
            statusClass = 'status-on-trip';
        } else if (d.status === 'inactive') {
            statusText = 'Inactive';
            statusClass = 'status-inactive';
        } else {
            statusText = d.status;
            statusClass = 'status-inactive';
        }
        
        return `
        <tr>
            <td>${d.name}</td>
            <td>${d.phone}</td>
            <td>${d.licenseNumber}</td>
            <td>${d.assignedVehicleId || '-'}</td>
            <td class="${statusClass}">${statusText}</td>
            <td>${d.tripsCompleted}</td>
            <td>
                <button class="edit-btn" onclick="editDriver('${d.id}')">Edit</button>
                <button class="delete-btn" onclick="deleteDriver('${d.id}')">Delete</button>
            </td>
        </tr>
    `}).join('');
}

function editDriver(id) {
    let d = drivers.find(d => d.id === id);
    if (!d) return;
    currentDriverId = id;
    document.getElementById('driverModalTitle').textContent = 'Edit Driver';
    document.getElementById('driverId').value = d.id;
    document.getElementById('driverName').value = d.name;
    document.getElementById('driverPhone').value = d.phone;
    document.getElementById('driverLicense').value = d.licenseNumber;
    document.getElementById('driverStatusSelect').value = d.status;
    updateDriverVehicleDropdown(d.assignedVehicleId);
    document.getElementById('driverModal').style.display = 'block';
}

function deleteDriver(id) {
    if (confirm('Delete this driver? They will be removed from assigned vehicles.')) {
        let driver = drivers.find(d => d.id === id);
        if (!driver) return;
        
        let hasUpcoming = transportBookings.some(b => b.assignedDriverId === id && (b.status === 'confirmed' || b.status === 'pending'));
        if (hasUpcoming) {
            alert('Cannot delete driver with upcoming bookings. Cancel or complete them first.');
            return;
        }
        
        drivers = drivers.filter(d => d.id !== id);
        syncAllData();
        saveData();
        renderDrivers();
        renderVehicles();
        updateStats();
    }
}

function addDriver() {
    currentDriverId = null;
    document.getElementById('driverModalTitle').textContent = 'Add Driver';
    document.getElementById('driverId').value = '';
    document.getElementById('driverName').value = '';
    document.getElementById('driverPhone').value = '';
    document.getElementById('driverLicense').value = '';
    document.getElementById('driverStatusSelect').value = 'available';
    updateDriverVehicleDropdown('');
    document.getElementById('driverModal').style.display = 'block';
}

function updateDriverVehicleDropdown(selectedId) {
    let select = document.getElementById('driverVehicleAssign');
    select.innerHTML = '<option value="">Assign to Vehicle (Optional)</option>';
    vehicles.forEach(v => {
        let selected = (v.id === selectedId) ? 'selected' : '';
        let isAvailable = v.status === 'available' || v.id === selectedId;
        if (isAvailable) {
            select.innerHTML += `<option value="${v.id}" ${selected}>${v.id} - ${v.type} (${v.licensePlate})</option>`;
        }
    });
}

function saveDriver() {
    let name = document.getElementById('driverName').value.trim();
    let phone = document.getElementById('driverPhone').value.trim();
    let license = document.getElementById('driverLicense').value.trim();
    let status = document.getElementById('driverStatusSelect').value;
    let vehicleId = document.getElementById('driverVehicleAssign').value;
    
    if (!name || !phone || !license) { alert('Fill all fields'); return; }
    
    // Check if vehicle is already assigned to another driver
    if (vehicleId) {
        let existingDriver = drivers.find(d => d.assignedVehicleId === vehicleId && d.id !== currentDriverId);
        if (existingDriver) {
            alert(`Vehicle ${vehicleId} is already assigned to driver ${existingDriver.name}. Remove that assignment first.`);
            return;
        }
    }
    
    if (currentDriverId) {
        let index = drivers.findIndex(d => d.id === currentDriverId);
        drivers[index] = { ...drivers[index], name, phone, licenseNumber: license, status, assignedVehicleId: vehicleId };
    } else {
        let newId = 'DR' + String(drivers.length + 1).padStart(3, '0');
        drivers.push({ id: newId, name, phone, licenseNumber: license, status: status, assignedVehicleId: vehicleId, tripsCompleted: 0 });
    }
    
    syncAllData();
    saveData();
    closeDriverModal();
    renderDrivers();
    renderVehicles();
    updateStats();
}

function closeDriverModal() {
    document.getElementById('driverModal').style.display = 'none';
}

function applyDriverFilter() {
    currentDriverStatus = document.getElementById('driverStatusFilter').value;
    renderDrivers();
}

// ============ BOOKINGS ============
function renderBookings() {
    let filtered = transportBookings.filter(b => {
        let matchesStatus = currentBookingStatus === 'all' || b.status === currentBookingStatus;
        let matchesDate = true;
        if (currentBookingStart && b.date < currentBookingStart) matchesDate = false;
        if (currentBookingEnd && b.date > currentBookingEnd) matchesDate = false;
        return matchesStatus && matchesDate;
    });
    
    bookingsBody.innerHTML = filtered.map(b => `
        <tr>
            <td>${b.id}</td>
            <td>${b.tripName}</td>
            <td>${b.date}</td>
            <td>${b.pickupLocation}</td>
            <td>${b.dropoffLocation}</td>
            <td>${b.passengers}</td>
            <td class="status-${b.status}">${b.status}</td>
            <td>${getBookingActions(b)}</td>
        </tr>
    `).join('');
}

function getBookingActions(b) {
    if (b.status === 'pending') {
        return `<button class="confirm-btn" onclick="openConfirmModal('${b.id}')">Confirm</button>
                <button class="reject-btn" onclick="openRejectModal('${b.id}')">Reject</button>`;
    } else if (b.status === 'confirmed') {
        return `<button class="complete-btn" onclick="completeTrip('${b.id}')">Complete</button>`;
    } else if (b.status === 'completed') {
        return `<span>Completed</span>`;
    } else {
        return `<span>Cancelled</span>`;
    }
}

function checkDriverAvailability(driverId, date) {
    let driverBookings = transportBookings.filter(b => 
        b.assignedDriverId === driverId && 
        b.date === date && 
        (b.status === 'confirmed' || b.status === 'pending')
    );
    return driverBookings.length === 0;
}

function checkVehicleAvailability(vehicleId, date) {
    let vehicleBookings = transportBookings.filter(b => 
        b.assignedVehicleId === vehicleId && 
        b.date === date && 
        (b.status === 'confirmed' || b.status === 'pending')
    );
    return vehicleBookings.length === 0;
}

function openConfirmModal(bookingId) {
    currentBookingId = bookingId;
    let booking = transportBookings.find(b => b.id === bookingId);
    if (!booking) return;
    
    document.getElementById('confirmBookingDetails').innerHTML = `
        <strong>${booking.tripName}</strong><br>
        Date: ${booking.date}<br>
        Passengers: ${booking.passengers}<br>
        Vehicle Type Needed: ${booking.vehicleType}
    `;
    
    let vehicleSelect = document.getElementById('confirmVehicleSelect');
    vehicleSelect.innerHTML = '<option value="">Select Vehicle</option>';
    let availableVehicles = vehicles.filter(v => 
        v.status === 'available' && 
        v.type === booking.vehicleType &&
        v.capacity >= booking.passengers &&
        checkVehicleAvailability(v.id, booking.date)
    );
    
    if (availableVehicles.length === 0) {
        vehicleSelect.innerHTML = '<option value="">No vehicles available</option>';
    } else {
        availableVehicles.forEach(v => {
            vehicleSelect.innerHTML += `<option value="${v.id}">${v.id} - ${v.type} (${v.licensePlate}) - Capacity: ${v.capacity}</option>`;
        });
    }
    
    let driverSelect = document.getElementById('confirmDriverSelect');
    driverSelect.innerHTML = '<option value="">Select Driver</option>';
    let availableDrivers = drivers.filter(d => 
        d.status === 'available' &&
        checkDriverAvailability(d.id, booking.date)
    );
    
    if (availableDrivers.length === 0) {
        driverSelect.innerHTML = '<option value="">No drivers available</option>';
    } else {
        availableDrivers.forEach(d => {
            driverSelect.innerHTML += `<option value="${d.id}">${d.name} (${d.tripsCompleted} trips completed)</option>`;
        });
    }
    
    document.getElementById('confirmModal').style.display = 'block';
}

function confirmBooking() {
    let vehicleId = document.getElementById('confirmVehicleSelect').value;
    let driverId = document.getElementById('confirmDriverSelect').value;
    
    if (!vehicleId || !driverId) {
        alert('Please select both a vehicle and a driver');
        return;
    }
    
    let booking = transportBookings.find(b => b.id === currentBookingId);
    let vehicle = vehicles.find(v => v.id === vehicleId);
    let driver = drivers.find(d => d.id === driverId);
    
    if (!booking || !vehicle || !driver) return;
    
    if (!checkVehicleAvailability(vehicleId, booking.date)) {
        alert(`Vehicle ${vehicleId} is no longer available on ${booking.date}`);
        openConfirmModal(currentBookingId);
        return;
    }
    
    if (!checkDriverAvailability(driverId, booking.date)) {
        alert(`Driver ${driver.name} is no longer available on ${booking.date}`);
        openConfirmModal(currentBookingId);
        return;
    }
    
    booking.status = 'confirmed';
    booking.assignedVehicleId = vehicleId;
    booking.assignedDriverId = driverId;
    
    vehicle.driverId = driverId;
    vehicle.driverName = driver.name;
    driver.assignedVehicleId = vehicleId;
    
    syncAllData();
    saveData();
    closeConfirmModal();
    renderVehicles();
    renderDrivers();
    renderBookings();
    updateStats();
    alert(`Booking ${booking.id} confirmed!\nVehicle: ${vehicle.id} (${vehicle.type})\nDriver: ${driver.name}`);
}

function openRejectModal(bookingId) {
    currentBookingId = bookingId;
    document.getElementById('rejectReason').value = '';
    document.getElementById('rejectModal').style.display = 'block';
}

function rejectBooking() {
    let reason = document.getElementById('rejectReason').value;
    let booking = transportBookings.find(b => b.id === currentBookingId);
    if (booking) {
        booking.status = 'cancelled';
        booking.assignedVehicleId = '';
        booking.assignedDriverId = '';
        saveData();
        renderBookings();
        updateStats();
        alert(`Booking ${booking.id} rejected. Reason: ${reason || 'No reason provided'}`);
    }
    closeRejectModal();
}

function completeTrip(bookingId) {
    let booking = transportBookings.find(b => b.id === bookingId);
    if (!booking) return;
    
    booking.status = 'completed';
    booking.assignedVehicleId = '';
    booking.assignedDriverId = '';
    
    syncAllData();
    saveData();
    renderVehicles();
    renderDrivers();
    renderBookings();
    updateStats();
    alert(`Trip ${booking.id} marked as completed!`);
}

function applyBookingFilter() {
    currentBookingStatus = document.getElementById('bookingStatusFilter').value;
    currentBookingStart = document.getElementById('bookingStartDate').value;
    currentBookingEnd = document.getElementById('bookingEndDate').value;
    renderBookings();
}

function closeConfirmModal() {
    document.getElementById('confirmModal').style.display = 'none';
}

function closeRejectModal() {
    document.getElementById('rejectModal').style.display = 'none';
}

// ============ AVAILABILITY ============
function checkAvailability() {
    let date = availabilityDate.value;
    if (!date) { alert('Select a date'); return; }
    
    let availableVehiclesList = [];
    
    for (let v of vehicles) {
        let isBooked = transportBookings.some(b => 
            b.assignedVehicleId === v.id && 
            b.date === date && 
            (b.status === 'confirmed' || b.status === 'pending')
        );
        
        if (v.status === 'available' && !isBooked) {
            availableVehiclesList.push(v);
        }
    }
    
    if (availableVehiclesList.length === 0) {
        availabilityResult.innerHTML = '<p>No vehicles available on this date.</p>';
    } else {
        availabilityResult.innerHTML = '<strong>Available Vehicles:</strong>' + 
            availableVehiclesList.map(v => 
                `<div class="available-vehicle">${v.id} - ${v.type} (${v.licensePlate}) - Capacity: ${v.capacity} people</div>`
            ).join('');
    }
}

// ============ ACCESS CONTROL ============
function checkAccess() {
    let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    let user = JSON.parse(localStorage.getItem('beyondPyramids_currentUser'));
    let authLink = document.getElementById('authLink');
    
    if (isLoggedIn && user) {
        authLink.innerText = `Logout (${user.firstName})`;
        authLink.href = '#';
        authLink.onclick = (e) => {
            e.preventDefault();
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('beyondPyramids_currentUser');
            window.location.href = 'login.html';
        };
    } else {
        authLink.innerText = 'Login';
        authLink.href = 'login.html';
    }
}

// ============ EVENT LISTENERS ============
function attachEventListeners() {
    document.getElementById('applyVehicleFilter').addEventListener('click', applyVehicleFilter);
    document.getElementById('addVehicleBtn').addEventListener('click', addVehicle);
    document.getElementById('saveVehicleBtn').addEventListener('click', saveVehicle);
    document.getElementById('cancelVehicleBtn').addEventListener('click', closeVehicleModal);
    document.querySelector('.close-modal').addEventListener('click', closeVehicleModal);
    
    document.getElementById('applyDriverFilter').addEventListener('click', applyDriverFilter);
    document.getElementById('addDriverBtn').addEventListener('click', addDriver);
    document.getElementById('saveDriverBtn').addEventListener('click', saveDriver);
    document.getElementById('cancelDriverBtn').addEventListener('click', closeDriverModal);
    document.querySelector('.close-driver-modal').addEventListener('click', closeDriverModal);
    
    document.getElementById('applyBookingFilter').addEventListener('click', applyBookingFilter);
    document.getElementById('confirmBookingBtn').addEventListener('click', confirmBooking);
    document.getElementById('cancelConfirmBtn').addEventListener('click', closeConfirmModal);
    document.querySelector('.close-confirm-modal').addEventListener('click', closeConfirmModal);
    
    document.getElementById('confirmRejectBtn').addEventListener('click', rejectBooking);
    document.getElementById('cancelRejectBtn').addEventListener('click', closeRejectModal);
    document.querySelector('.close-reject-modal').addEventListener('click', closeRejectModal);
    
    checkAvailabilityBtn.addEventListener('click', checkAvailability);
    
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) e.target.style.display = 'none';
    });
}

// Make functions global
window.editVehicle = editVehicle;
window.deleteVehicle = deleteVehicle;
window.editDriver = editDriver;
window.deleteDriver = deleteDriver;
window.openConfirmModal = openConfirmModal;
window.openRejectModal = openRejectModal;
window.completeTrip = completeTrip;