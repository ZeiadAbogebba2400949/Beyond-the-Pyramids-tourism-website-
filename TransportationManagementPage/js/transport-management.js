let vehicles = [
    {
        id: 1,
        type: "Tourist Bus",
        capacity: 40,
        driver: "Ahmed Mahmoud",
        licensePlate: "BUS-101",
        status: "available"
    },
    {
        id: 2,
        type: "Minivan",
        capacity: 7,
        driver: "Mohamed Ali",
        licensePlate: "VAN-202",
        status: "booked"
    },
    {
        id: 3,
        type: "Luxury Car",
        capacity: 4,
        driver: "Karim Hassan",
        licensePlate: "CAR-303",
        status: "maintenance"
    }
];

let bookings = [
    {
        id: 1,
        customer: "John Doe",
        passengers: 25,
        vehicleType: "Tourist Bus",
        pickupDate: "2024-05-20",
        status: "pending"
    },
    {
        id: 2,
        customer: "Sarah Smith",
        passengers: 5,
        vehicleType: "Minivan",
        pickupDate: "2024-05-21",
        status: "pending"
    }
];

let nextVehicleId = 4;
let nextBookingId = 3;
let currentStatusFilter = "all";
let currentSearchTerm = "";

function displayVehicles() {
    const container = document.getElementById("vehicles-list");
    if (!container) return;
    
    let filtered = vehicles;
    
    if (currentStatusFilter !== "all") {
        filtered = filtered.filter(v => v.status === currentStatusFilter);
    }
    
    if (currentSearchTerm !== "") {
        const search = currentSearchTerm.toLowerCase();
        filtered = filtered.filter(v => 
            v.type.toLowerCase().includes(search) || 
            v.driver.toLowerCase().includes(search)
        );
    }
    
    if (filtered.length === 0) {
        container.innerHTML = "<p>No vehicles found.</p>";
        return;
    }
    
    let html = '<table border="1" cellpadding="8" cellspacing="0" width="100%">';
    html += '<tr bgcolor="#f0f0f0">';
    html += '<th>ID</th><th>Type</th><th>Capacity</th><th>Driver</th><th>Plate</th><th>Status</th><th>Actions</th>';
    html += '</tr>';
    
    for (let i = 0; i < filtered.length; i++) {
        const v = filtered[i];
        
        let statusText = v.status;
        if (v.status === "available") statusText = "✅ Available";
        if (v.status === "booked") statusText = "📖 Booked";
        if (v.status === "maintenance") statusText = "🔧 Maintenance";
        
        html += `
            <tr>
                <td>${v.id}</td>
                <td>${v.type}</td>
                <td>${v.capacity}</td>
                <td>${v.driver}</td>
                <td>${v.licensePlate}</td>
                <td>${statusText}</td>
                <td>
                    <button onclick="editVehicle(${v.id})">Edit</button>
                    <button onclick="deleteVehicle(${v.id})">Delete</button>
                    <select onchange="changeStatus(${v.id}, this.value)">
                        <option value="">Set Status</option>
                        <option value="available">Available</option>
                        <option value="booked">Booked</option>
                        <option value="maintenance">Maintenance</option>
                    </select>
                </td>
            </tr>
        `;
    }
    
    html += '</table>';
    container.innerHTML = html;
}

function addVehicle(event) {
    event.preventDefault();
    
    const type = document.getElementById("vehicle-type").value;
    const capacity = parseInt(document.getElementById("vehicle-capacity").value);
    const driver = document.getElementById("vehicle-driver").value;
    const plate = document.getElementById("vehicle-plate").value;
    const status = document.getElementById("vehicle-status").value;
    
    if (!type || !capacity || !driver || !plate) {
        alert("Please fill all fields");
        return;
    }
    
    const newVehicle = {
        id: nextVehicleId++,
        type: type,
        capacity: capacity,
        driver: driver,
        licensePlate: plate,
        status: status
    };
    
    vehicles.push(newVehicle);
    document.getElementById("add-vehicle-form").reset();
    displayVehicles();
    alert(`Vehicle "${type}" added!`);
}

function editVehicle(id) {
    const vehicle = vehicles.find(v => v.id === id);
    if (!vehicle) return;
    
    const newType = prompt("Enter vehicle type:", vehicle.type);
    if (newType) vehicle.type = newType;
    
    const newCapacity = prompt("Enter capacity:", vehicle.capacity);
    if (newCapacity) vehicle.capacity = parseInt(newCapacity);
    
    const newDriver = prompt("Enter driver name:", vehicle.driver);
    if (newDriver) vehicle.driver = newDriver;
    
    const newPlate = prompt("Enter license plate:", vehicle.licensePlate);
    if (newPlate) vehicle.licensePlate = newPlate;
    
    displayVehicles();
    alert(`Vehicle ${id} updated!`);
}

function deleteVehicle(id) {
    if (confirm("Delete this vehicle?")) {
        vehicles = vehicles.filter(v => v.id !== id);
        displayVehicles();
        alert("Vehicle deleted!");
    }
}

function changeStatus(id, newStatus) {
    if (!newStatus) return;
    
    const vehicle = vehicles.find(v => v.id === id);
    if (vehicle) {
        vehicle.status = newStatus;
        displayVehicles();
        alert(`Status changed to ${newStatus}`);
    }
}

function displayBookings() {
    const container = document.getElementById("bookings-list");
    if (!container) return;
    
    const pending = bookings.filter(b => b.status === "pending");
    
    if (pending.length === 0) {
        container.innerHTML = "<p>No pending bookings.</p>";
        return;
    }
    
    let html = '<table border="1" cellpadding="8" cellspacing="0" width="100%">';
    html += '<tr bgcolor="#f0f0f0">';
    html += '<th>ID</th><th>Customer</th><th>Passengers</th><th>Vehicle Type</th><th>Date</th><th>Actions</th>';
    html += '</tr>';
    
    for (let i = 0; i < pending.length; i++) {
        const b = pending[i];
        
        html += `
            <tr>
                <td>${b.id}</td>
                <td>${b.customer}</td>
                <td>${b.passengers}</td>
                <td>${b.vehicleType}</td>
                <td>${b.pickupDate}</td>
                <td>
                    <button onclick="approveBooking(${b.id})">Approve</button>
                    <button onclick="rejectBooking(${b.id})">Reject</button>
                    <button onclick="assignVehicleToBooking(${b.id})">Assign Vehicle</button>
                </td>
            </tr>
        `;
    }
    
    html += '</table>';
    container.innerHTML = html;
}

function approveBooking(id) {
    const booking = bookings.find(b => b.id === id);
    if (booking) {
        booking.status = "approved";
        displayBookings();
        alert(`Booking ${id} approved!`);
    }
}

function rejectBooking(id) {
    const booking = bookings.find(b => b.id === id);
    if (booking) {
        booking.status = "rejected";
        displayBookings();
        alert(`Booking ${id} rejected.`);
    }
}

function assignVehicleToBooking(bookingId) {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;
    
    const available = vehicles.filter(v => 
        v.status === "available" && v.capacity >= booking.passengers
    );
    
    if (available.length === 0) {
        alert("No available vehicles for " + booking.passengers + " passengers.");
        return;
    }
    
    let msg = "Available vehicles:\n\n";
    for (let i = 0; i < available.length; i++) {
        const v = available[i];
        msg += `${v.id} | ${v.type} (${v.capacity} seats) | Driver: ${v.driver}\n`;
    }
    
    const selectedId = prompt(msg + "\nEnter vehicle ID:");
    if (selectedId) {
        const vehicle = available.find(v => v.id === parseInt(selectedId));
        if (vehicle) {
            vehicle.status = "booked";
            booking.status = "assigned";
            booking.assignedVehicle = vehicle.id;
            displayBookings();
            displayVehicles();
            alert(`Vehicle ${vehicle.type} assigned!`);
        } else {
            alert("Invalid ID");
        }
    }
}

function applyFilter() {
    const filter = document.getElementById("status-filter");
    currentStatusFilter = filter.value;
    displayVehicles();
}

function applySearch() {
    const search = document.getElementById("search-input");
    currentSearchTerm = search.value;
    displayVehicles();
}

function resetFilters() {
    document.getElementById("status-filter").value = "all";
    document.getElementById("search-input").value = "";
    currentStatusFilter = "all";
    currentSearchTerm = "";
    displayVehicles();
}

function setupEventListeners() {
    const form = document.getElementById("add-vehicle-form");
    if (form) {
        form.addEventListener("submit", addVehicle);
    }
    
    const filter = document.getElementById("status-filter");
    if (filter) {
        filter.addEventListener("change", applyFilter);
    }
    
    const searchBtn = document.getElementById("search-btn");
    if (searchBtn) {
        searchBtn.addEventListener("click", applySearch);
    }
    
    const resetBtn = document.getElementById("reset-btn");
    if (resetBtn) {
        resetBtn.addEventListener("click", resetFilters);
    }
    
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
        searchInput.addEventListener("keypress", function(e) {
            if (e.key === "Enter") {
                applySearch();
            }
        });
    }
}

window.editVehicle = editVehicle;
window.deleteVehicle = deleteVehicle;
window.changeStatus = changeStatus;
window.approveBooking = approveBooking;
window.rejectBooking = rejectBooking;
window.assignVehicleToBooking = assignVehicleToBooking;

function init() {
    displayVehicles();
    displayBookings();
    setupEventListeners();
}

window.addEventListener("DOMContentLoaded", init);