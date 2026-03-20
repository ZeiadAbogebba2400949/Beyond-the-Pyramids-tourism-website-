const allTripsBtn = document.getElementById("btn-all");
const cheapTripsBtn = document.getElementById("btn-cheap");
const expensiveTripsBtn = document.getElementById("btn-expensive");
const allCards = document.querySelectorAll(".card");
const filterContainer = document.getElementById("filter-container");
const bookButtons = document.querySelectorAll(".book-btn");
const searchInput = document.getElementById("search-input");

searchInput.addEventListener("input", function() {
    const searchTerm = this.value.toLowerCase();

    allCards.forEach(function(card) {
        const tripName = card.querySelector("h3").textContent.toLowerCase();
        if (tripName.includes(searchTerm)) {
            card.style.display = "flex";
        } else {
            card.style.display = "none";
        }
    });
});

bookButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        const tripName = this.parentElement.querySelector("h3").textContent;
        alert(`Thank you for your interest in the "${tripName}"! Our team will contact you shortly to finalize your booking.`);
    });
});


allTripsBtn.addEventListener("click", function() {
    allCards.forEach(function(card) {
        card.style.display = "flex";
    });
});

cheapTripsBtn.addEventListener("click", function() {
    allCards.forEach(function(card) {
        if (card.dataset.price === "cheap") {
            card.style.display = "flex"; // Show the cheap trips
        } else {
            card.style.display = "none"; // Hide everything else
        }
    });
});

expensiveTripsBtn.addEventListener("click", function() {
    allCards.forEach(function(card) {
        if (card.dataset.price === "expensive") {
            card.style.display = "flex"; // Show the expensive trips
        } else {
            card.style.display = "none"; // Hide everything else
        }
    });
});

