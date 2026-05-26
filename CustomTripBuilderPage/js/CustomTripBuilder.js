

var DESTINATIONS = [
    { id: "giza", name: "Giza Pyramids", price: 45 },
    { id: "luxor", name: "Luxor Temple", price: 35 },
    { id: "valley", name: "Valley of Kings", price: 50 },
    { id: "aswan", name: "Aswan High Dam", price: 25 },
    { id: "abusimbel", name: "Abu Simbel", price: 65 },
    { id: "alexandria", name: "Alexandria Library", price: 30 },
    { id: "sharm", name: "Sharm El Sheikh", price: 55 },
    { id: "siwa", name: "Siwa Oasis", price: 40 },
    { id: "hurghada", name: "Hurghada", price: 50 },
    { id: "saqqara", name: "Saqqara", price: 30 }
];

var ACC_TYPES = [
    { id: "budget", name: "Budget Hostel", price: 25 },
    { id: "standard", name: "Standard Hotel", price: 60 },
    { id: "premium", name: "Premium Hotel", price: 120 },
    { id: "luxury", name: "Luxury Resort", price: 250 }
];

var ROOM_TYPES = [
    { id: "single", name: "Single Room", mult: 1 },
    { id: "double", name: "Double Room", mult: 1.4 },
    { id: "suite", name: "Suite", mult: 2 }
];



var currentStep = 0;
var selectedDests = [];
var selectedTransport = "";
var selectedGuide = "";
var travelerCount = 1;

document.addEventListener("DOMContentLoaded", function () {
    if (window.LoginGate && !LoginGate.requireLogin()) {
        return;
    }

    buildStep1();
    buildStep3();

    var today = new Date().toISOString().split("T")[0];
    document.getElementById("trip-start").min = today;
    document.getElementById("trip-end").min = today;

    document.getElementById("trip-start").addEventListener("change", onDateChange);
    document.getElementById("trip-end").addEventListener("change", onDateChange);
    document.getElementById("acc-type").addEventListener("change", recalcPrice);
    document.getElementById("acc-room").addEventListener("change", recalcPrice);
    document.getElementById("traveler-count").addEventListener("input", onTravelerCountChange);

    showStep(0);
});



function showStep(n) {
    currentStep = n;
    var steps = document.querySelectorAll(".wizard-step");
    for (var i = 0; i < steps.length; i++) {
        steps[i].classList.toggle("active", i === n);
    }
    var items = document.querySelectorAll(".stepper-step");
    for (var i = 0; i < items.length; i++) {
        items[i].classList.remove("active", "completed");
        if (i === n) items[i].classList.add("active");
        else if (i < n) items[i].classList.add("completed");
    }
    if (n === 4) buildReview();
    recalcPrice();
}

function nextStep() {
    if (!validateStep(currentStep)) return;
    if (currentStep < 4) showStep(currentStep + 1);
}

function prevStep() {
    if (currentStep > 0) showStep(currentStep - 1);
}



function validateStep(step) {
    hideAllErrors();
    if (step === 0 && selectedDests.length < 1) {
        showError("dest-error", "Please select at least 1 destination.");
        return false;
    }
    if (step === 1) {
        var s = document.getElementById("trip-start").value;
        var e = document.getElementById("trip-end").value;
        if (!s) { showError("date-error", "Please select a start date."); return false; }
        if (!e) { showError("date-error", "Please select an end date."); return false; }
        var d = getDuration();
        if (d < 1) { showError("date-error", "End date must be after start date."); return false; }
        if (d > 14) { showError("date-error", "Maximum trip duration is 14 days."); return false; }
    }
    if (step === 3) {
        var count = getTravelerCount();
        if (count < 1 || count > 15) {
            showError("traveler-error", "Please choose between 1 and 15 travelers.");
            return false;
        }
    }
    if (step === 4 && !document.getElementById("terms-check").checked) {
        showError("review-error", "Please accept the terms and conditions.");
        return false;
    }
    return true;
}

function showError(id, msg) {
    var el = document.getElementById(id);
    if (el) { el.textContent = msg; el.classList.add("show"); }
}

function hideAllErrors() {
    var errs = document.querySelectorAll(".error-msg");
    for (var i = 0; i < errs.length; i++) { errs[i].classList.remove("show"); errs[i].textContent = ""; }
}



function buildStep1() {
    var grid = document.getElementById("dest-grid");
    for (var i = 0; i < DESTINATIONS.length; i++) {
        var card = document.createElement("div");
        card.className = "dest-card";
        card.dataset.id = DESTINATIONS[i].id;
        card.innerHTML = "<strong>" + DESTINATIONS[i].name + "</strong><br>EGP " + DESTINATIONS[i].price;
        card.addEventListener("click", (function (id) {
            return function () { toggleDest(id); };
        })(DESTINATIONS[i].id));
        grid.appendChild(card);
    }
}

function toggleDest(id) {
    var idx = selectedDests.indexOf(id);
    if (idx > -1) { selectedDests.splice(idx, 1); }
    else if (selectedDests.length < 5) { selectedDests.push(id); }
    else { alert("Maximum 5 destinations."); return; }

    var cards = document.querySelectorAll(".dest-card");
    for (var i = 0; i < cards.length; i++) {
        cards[i].classList.toggle("selected", selectedDests.indexOf(cards[i].dataset.id) > -1);
    }
    document.getElementById("dest-counter").textContent = selectedDests.length + " of 5 selected (min 1)";
    recalcPrice();
}



function onDateChange() {
    var startVal = document.getElementById("trip-start").value;
    var endEl = document.getElementById("trip-end");
    if (startVal) {
        var min = new Date(startVal); min.setDate(min.getDate() + 1);
        var max = new Date(startVal); max.setDate(max.getDate() + 14);
        endEl.min = min.toISOString().split("T")[0];
        endEl.max = max.toISOString().split("T")[0];
    }
    var dur = getDuration();
    document.getElementById("duration-display").textContent = dur > 0 ? dur + " day(s) / " + (dur - 1) + " night(s)" : "Select dates above";
    recalcPrice();
}

function getDuration() {
    var s = document.getElementById("trip-start").value;
    var e = document.getElementById("trip-end").value;
    if (!s || !e) return 0;
    var diff = Math.round((new Date(e) - new Date(s)) / 86400000);
    return diff > 0 ? diff : 0;
}

function onTravelerCountChange() {
    travelerCount = getTravelerCount();
    recalcPrice();
}

function getTravelerCount() {
    var input = document.getElementById("traveler-count");
    var count = parseInt(input?.value, 10);
    if (isNaN(count)) return 1;
    return Math.max(1, Math.min(15, count));
}



function buildStep3() {
    var sel1 = document.getElementById("acc-type");
    sel1.innerHTML = '<option value="">-- Select Type --</option>';
    for (var i = 0; i < ACC_TYPES.length; i++) {
        sel1.innerHTML += '<option value="' + ACC_TYPES[i].id + '">' + ACC_TYPES[i].name + ' - EGP ' + ACC_TYPES[i].price + '/night</option>';
    }
    var sel2 = document.getElementById("acc-room");
    sel2.innerHTML = '<option value="">-- Select Room --</option>';
    for (var i = 0; i < ROOM_TYPES.length; i++) {
        sel2.innerHTML += '<option value="' + ROOM_TYPES[i].id + '">' + ROOM_TYPES[i].name + '</option>';
    }
}





function recalcPrice() {
    var days = getDuration();
    var nights = days > 0 ? days - 1 : 0;

    var destTotal = 0;
    for (var i = 0; i < selectedDests.length; i++) {
        for (var j = 0; j < DESTINATIONS.length; j++) {
            if (DESTINATIONS[j].id === selectedDests[i]) destTotal += DESTINATIONS[j].price;
        }
    }

    var accTotal = 0;
    var at = document.getElementById("acc-type").value;
    var ar = document.getElementById("acc-room").value;
    if (at && nights > 0) {
        var ppn = 0, rm = 1;
        for (var i = 0; i < ACC_TYPES.length; i++) { if (ACC_TYPES[i].id === at) ppn = ACC_TYPES[i].price; }
        for (var i = 0; i < ROOM_TYPES.length; i++) { if (ROOM_TYPES[i].id === ar) rm = ROOM_TYPES[i].mult; }
        accTotal = ppn * rm * nights;
    }

    travelerCount = getTravelerCount();
    var perTravelerTotal = destTotal + Math.round(accTotal);
    var tripTotal = perTravelerTotal * travelerCount;

    document.getElementById("price-dest").textContent = "EGP " + destTotal;
    document.getElementById("price-acc").textContent = "EGP " + Math.round(accTotal);
    document.getElementById("price-travelers").textContent = "x " + travelerCount;
    document.getElementById("price-total").textContent = "EGP " + tripTotal;
    saveDraftProgress(tripTotal);
}

function saveDraftProgress(total) {
    if (!window.AppStorage || !AppStorage.setDraft) return;

    var start = document.getElementById("trip-start")?.value || "";
    var end = document.getElementById("trip-end")?.value || "";
    var accType = document.getElementById("acc-type")?.value || "";
    var roomType = document.getElementById("acc-room")?.value || "";
    var hasMeaningfulInput = selectedDests.length > 0 || start || end || accType || roomType || getTravelerCount() > 1 || selectedTransport || selectedGuide;

    if (!hasMeaningfulInput) return;

    var destNames = selectedDests.map(function (id) {
        var d = DESTINATIONS.find(function (dest) { return dest.id === id; });
        return d ? d.name : id;
    });

    var completedPieces = 0;
    if (selectedDests.length > 0) completedPieces++;
    if (start && end) completedPieces++;
    if (accType) completedPieces++;
    if (getTravelerCount() > 1 || currentStep >= 3) completedPieces++;
    if (currentStep >= 4) completedPieces++;

    AppStorage.setDraft({
        title: "Custom Architect Journey",
        packageName: destNames.length ? destNames.join(", ") : "Custom Architect Journey",
        destinations: destNames,
        startDate: start,
        endDate: end,
        accommodation: accType,
        roomType: roomType,
        travelers: getTravelerCount(),
        totalPrice: total,
        progress: Math.max(20, Math.min(95, completedPieces * 20)),
        updatedAt: new Date().toISOString()
    });
}



function buildReview() {
    var h = "";

    h += "<h3>Destinations</h3>";
    for (var i = 0; i < selectedDests.length; i++) {
        for (var j = 0; j < DESTINATIONS.length; j++) {
            if (DESTINATIONS[j].id === selectedDests[i]) h += "<p>" + DESTINATIONS[j].name + " - EGP " + DESTINATIONS[j].price + "</p>";
        }
    }

    h += "<h3>Dates</h3>";
    h += "<p>" + (document.getElementById("trip-start").value || "—") + " to " + (document.getElementById("trip-end").value || "—") + " (" + getDuration() + " days)</p>";

    h += "<h3>Travelers</h3>";
    h += "<p>" + getTravelerCount() + " " + (getTravelerCount() > 1 ? "travelers" : "traveler") + "</p>";

    h += "<h3>Accommodation</h3>";
    var at = document.getElementById("acc-type").value;
    if (at) {
        var name = "";
        for (var i = 0; i < ACC_TYPES.length; i++) { if (ACC_TYPES[i].id === at) name = ACC_TYPES[i].name; }
        h += "<p>" + name + "</p>";
    } else { h += "<p>Not selected</p>"; }

    document.getElementById("review-body").innerHTML = h;
}



function submitTrip() {
    if (!validateStep(4)) return;

    // Construct the booking object for the purchase flow
    const totalDisplay = document.getElementById("price-total").textContent;
    const total = parseInt(totalDisplay.replace("EGP ", "").replace(/,/g, "")) || 0;
    const travelers = getTravelerCount();
    const basePrice = Math.round(total / travelers);
    const start = document.getElementById("trip-start").value;
    const end = document.getElementById("trip-end").value;
    
    // Get destination names for the summary
    const destNames = selectedDests.map(id => {
        const d = DESTINATIONS.find(dest => dest.id === id);
        return d ? d.name : id;
    }).join(", ");

    const currentBooking = {
        packageName: "Custom Architect Journey",
        location: destNames,
        image: "../imagesUsed/custom-trip-hero.jpg", // Placeholder for custom architecture
        date: start + " to " + end,
        travelers: travelers,
        tier: "Architect Custom",
        totalPrice: total,
        basePrice: basePrice,
        timestamp: new Date().toISOString(),
        isCustom: true,
        type: "custom",
        tripType: "Custom Trip",
        packageType: "custom"
    };

    // Save to localStorage so Booking Summary can pick it up
    localStorage.setItem('currentBooking', JSON.stringify(currentBooking));

    if (window.AppStorage) {
        AppStorage.removeItem("btp_draft");
    }
    
    if (travelers > 1) {
        window.location.href = "../TravellersDetails/TravellersDetails.html";
    } else {
        window.location.href = "../BookingSummaryPage/BookingSummary.html";
    }
}
