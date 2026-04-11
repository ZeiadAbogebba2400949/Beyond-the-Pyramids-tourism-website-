// 1. Grab elements
const printBtn = document.getElementById("print-btn");
const copyBtn = document.getElementById("copy-btn");
const voucherNumber = document.getElementById("voucher-number").textContent;
const tripStatusElement = document.getElementById("trip-status");
const reviewSection = document.getElementById("review-section");

// 2. Print functionality
if (printBtn) {
    printBtn.addEventListener("click", function() {
        window.print();
    });
}

// 3. Bulletproof Copy to Clipboard functionality
if (copyBtn) {
    copyBtn.addEventListener("click", function() {
        const tempInput = document.createElement("input");
        tempInput.value = voucherNumber;
        document.body.appendChild(tempInput);
        
        tempInput.select();
        document.execCommand("copy");
        
        document.body.removeChild(tempInput);

        copyBtn.textContent = "Copied!";
        setTimeout(function() {
            copyBtn.textContent = "Copy Number";
        }, 2000); 
    });
}

// 4. Conditional Review Display
if (tripStatusElement && reviewSection) {
    const currentStatus = tripStatusElement.dataset.status;
    if (currentStatus === "completed") {
        reviewSection.style.display = "block";
    }
}

// Review Button Alert
const reviewBtn = document.querySelector(".review-btn");
if (reviewBtn) {
    reviewBtn.addEventListener("click", function() {
        alert("Redirecting to the review submission page...");
    });
}

// 5. Accordion Logic for Cancellation Policy
const accordionBtn = document.querySelector(".accordion-btn");
const accordionContent = document.querySelector(".accordion-content");

if (accordionBtn && accordionContent) {
    const arrowIcon = accordionBtn.querySelector("span");

    accordionBtn.addEventListener("click", function() {
        // Check if it's currently open or closed
        if (accordionContent.style.display === "block") {
            accordionContent.style.display = "none";
            arrowIcon.innerHTML = "&#9660;"; // Point arrow down
        } else {
            accordionContent.style.display = "block";
            arrowIcon.innerHTML = "&#9650;"; // Point arrow up
        }
    });
}

// 4. Dynamic Status Badge & Review Display
if (tripStatusElement) {
    // Read the status and make sure it's lowercase
    const currentStatus = tripStatusElement.dataset.status.toLowerCase();
    
    // Apply the correct color class based on the word
    if (currentStatus === "completed") {
        tripStatusElement.classList.add("status-completed");
        // Show review section if completed
        if (reviewSection) {
            reviewSection.style.display = "block";
        }
    } else if (currentStatus === "upcoming") {
        tripStatusElement.classList.add("status-upcoming");
    } else if (currentStatus === "cancelled") {
        tripStatusElement.classList.add("status-cancelled");
    }
}