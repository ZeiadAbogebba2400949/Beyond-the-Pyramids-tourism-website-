document.addEventListener("DOMContentLoaded", function() {
// Grabing Tools
    const searchInput = document.getElementById("search-input");
    const statusFilter = document.getElementById("status-filter");

    // Grabing Rows
    const guideRows = document.querySelectorAll(".guide-row");

    // Filtering Function
    function fitlerTable() {
        
        const searchTerm = searchInput.value.toLowerCase();
        const selectedStatus = statusFilter.value;

        guideRows.forEach(row => {
            const guideName = row.querySelector("strong").textContent.toLowerCase();
            const guideStatus = row.getAttribute("data-status");

            const matchesSearch = guideName.includes(searchTerm);
            const matchesStatus = (selectedStatus === "all" || guideStatus === selectedStatus);

            if (matchesSearch && matchesStatus) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        });
    }
    // Event Listeners
    searchInput.addEventListener("input", fitlerTable);
    statusFilter.addEventListener("change", fitlerTable);
});

// 5. Grab the popup elements
    const modal = document.getElementById("add-guide-modal");
    const btnAddGuide = document.querySelector(".btn-primary"); // Grabs the button from the header
    const btnCancel = document.getElementById("btn-cancel");
    const form = document.getElementById("add-guide-form");

    // 6. Open the Modal
    btnAddGuide.addEventListener("click", function() {
        // Change it from "none" to "flex" so it appears and centers everything
        modal.style.display = "flex"; 
    });

    // 7. Close the Modal (Cancel button)
    btnCancel.addEventListener("click", function() {
        modal.style.display = "none";
    });

    // 8. Handle the Form Submission (The Save Button)
    form.addEventListener("submit", function(event) {
        // CRITICAL: This stops the browser from refreshing the page!
        event.preventDefault(); 
        
        // This is where Phase 2 database logic will go! For now, we just prove it works:
        alert("Success! In Phase 2, this data will be sent to the database.");
        
        // Clear the typing boxes and hide the popup
        form.reset();
        modal.style.display = "none";
    });