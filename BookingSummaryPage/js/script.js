const mockBookingData = {
    bookingId: "BK" + Date.now(),
    location: {
        id: 1,
        name: "The Great Pyramids of Giza"
    },
    visitDate: "2024-05-15",
    timeSlot: {
        id: 1,
        time: "10:00 AM"
    },
    quantity: 2,
    guide: {
        id: 101,
        name: "John Sturgis",
        fee: 50
    },
    basePricePerPerson: 25,
    status: "pending",
    bookingDate: new Date().toISOString()
};

function calculateTotals() {
    const baseTotal = mockBookingData.basePricePerPerson * mockBookingData.quantity;
    const guideFee = mockBookingData.guide ? mockBookingData.guide.fee : 0;
    const grandTotal = baseTotal + guideFee;
    
    return {
        baseTotal: baseTotal,
        guideFee: guideFee,
        grandTotal: grandTotal
    };
}

function displayReference() {
    const refElement = document.getElementById("ref-number");
    if (refElement) {
        refElement.textContent = mockBookingData.bookingId;
    }
}

function displayTripDetails() {
    const container = document.getElementById("details-content");
    if (!container) return;
    
    const guideText = mockBookingData.guide 
        ? `${mockBookingData.guide.name} ($${mockBookingData.guide.fee})`
        : "No guide selected";
    
    const detailsHTML = `
        <p><strong>Location:</strong> ${mockBookingData.location.name}</p>
        <p><strong>Date:</strong> ${mockBookingData.visitDate}</p>
        <p><strong>Time:</strong> ${mockBookingData.timeSlot.time}</p>
        <p><strong>Number of People:</strong> ${mockBookingData.quantity}</p>
        <p><strong>Tourist Guide:</strong> ${guideText}</p>
        <p><strong>Booking Date:</strong> ${new Date(mockBookingData.bookingDate).toLocaleDateString()}</p>
    `;
    
    container.innerHTML = detailsHTML;
}

function displayPriceBreakdown() {
    const container = document.getElementById("price-content");
    if (!container) return;
    
    const totals = calculateTotals();
    
    const priceHTML = `
        <p><strong>Base Price:</strong> $${mockBookingData.basePricePerPerson} × ${mockBookingData.quantity} = $${totals.baseTotal}</p>
        <p><strong>Guide Fee:</strong> $${totals.guideFee}</p>
        <p><strong>Taxes & Fees:</strong> $0 (included)</p>
        <hr>
        <p><strong>Total Amount:</strong> $${totals.grandTotal}</p>
    `;
    
    container.innerHTML = priceHTML;
}

function displayStatus() {
    const statusElement = document.getElementById("status-text");
    if (statusElement) {
        const status = mockBookingData.status;
        const statusText = status === "pending" ? "Pending Confirmation" : "Confirmed";
        statusElement.textContent = statusText;
    }
}


function handleConfirmBooking() {
    const confirmResult = confirm("Are you sure you want to confirm this booking?");
    
    if (confirmResult) {
       
        mockBookingData.status = "confirmed";
      
        displayStatus();
        const totals = calculateTotals();
        
        alert("✅ Booking Confirmed!\n\n" +
              "Reference: " + mockBookingData.bookingId + "\n" +
              "Total: $" + totals.grandTotal + "\n\n" +
              "A confirmation email has been sent (demo mode).");
        
        const confirmBtn = document.getElementById("confirm-booking");
        if (confirmBtn) {
            confirmBtn.disabled = true;
            confirmBtn.textContent = "Confirmed ✓";
        }
        
        const paymentBtn = document.getElementById("payment-booking");
        if (paymentBtn) {
            paymentBtn.disabled = false;
        }
    }
}

function handleEditBooking() {
    const editConfirm = confirm("Go back to edit your booking? Any changes will not be saved.");
    
    if (editConfirm) {
        
        window.location.href = "single-location.html";
    }
}


function handlePayment() {
    
    if (mockBookingData.status !== "confirmed") {
        alert("Please confirm your booking before proceeding to payment.");
        return;
    }
    
    const totals = calculateTotals();
    
    
    alert("💳 Payment Gateway (Demo Mode)\n\n" +
          "Booking: " + mockBookingData.bookingId + "\n" +
          "Amount: $" + totals.grandTotal + "\n\n" +
          "This is a demo. No actual payment will be processed.");
    
    
    const paymentConfirm = confirm("Simulate successful payment?");
    if (paymentConfirm) {
        alert("✅ Payment successful!\n\n" +
              "Your booking is now complete.\n" +
              "Thank you for choosing Egypt Tourism Hub!");
        
       
    }
}

function handleCancelBooking() {
    const cancelConfirm = confirm("Are you sure you want to cancel this booking?");
    
    if (cancelConfirm) {
        alert("❌ Booking " + mockBookingData.bookingId + " has been cancelled.\n\n" +
              "No charges were made.");
        
        window.location.href = "dashboard.html";
    }
}
function setupEventListeners() {
    
    const confirmBtn = document.getElementById("confirm-booking");
    const editBtn = document.getElementById("edit-booking");
    const paymentBtn = document.getElementById("payment-booking");
    const cancelBtn = document.getElementById("cancel-booking");
    
    if (confirmBtn) {
        confirmBtn.addEventListener("click", handleConfirmBooking);
    }
    
    if (editBtn) {
        editBtn.addEventListener("click", handleEditBooking);
    }
    
    if (paymentBtn) {
        paymentBtn.addEventListener("click", handlePayment);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener("click", handleCancelBooking);
    }
}

function initializeButtons() {
    const paymentBtn = document.getElementById("payment-booking");
    if (paymentBtn) {
        
        paymentBtn.disabled = true;
    }
    
    const confirmBtn = document.getElementById("confirm-booking");
    if (confirmBtn) {
        
        if (mockBookingData.status === "confirmed") {
            confirmBtn.disabled = true;
            confirmBtn.textContent = "Confirmed ✓";
            paymentBtn.disabled = false;
        }
    }
}

function loadBookingSummary() {
    displayReference();
    displayTripDetails();
    displayPriceBreakdown();
    displayStatus();
}

function getDataFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.has('location')) {
        mockBookingData.location.name = urlParams.get('location');
    }
    
    if (urlParams.has('date')) {
        mockBookingData.visitDate = urlParams.get('date');
    }
    
    if (urlParams.has('people')) {
        mockBookingData.quantity = parseInt(urlParams.get('people'));
    }
    
    if (urlParams.has('time')) {
        mockBookingData.timeSlot.time = urlParams.get('time');
    }
}

function getDataFromStorage() {
    const savedBooking = localStorage.getItem("currentBooking");
    if (savedBooking) {
        try {
            const parsed = JSON.parse(savedBooking);
            Object.assign(mockBookingData, parsed);
            console.log("Loaded booking from storage");
        } catch(e) {
            console.log("Error loading from storage");
        }
    }
}

function initPage() {
    
    getDataFromURL();
    
    loadBookingSummary();
    
    initializeButtons();
    
    setupEventListeners();
    
    console.log("✅ Booking summary page loaded");
    console.log("Booking ID:", mockBookingData.bookingId);
    console.log("Total:", calculateTotals().grandTotal);
}

window.addEventListener("DOMContentLoaded", initPage);

