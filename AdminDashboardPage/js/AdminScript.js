// Function to simulate real-time system check
function updateSystemHealth() {
    // 1. Define the possible statuses
    const statuses = ["Excellent", "Stable", "Running Smoothly"];
    
    // 2. Grab the HTML element we want to change
    const statusText = document.getElementById("health-text");
    
    // 3. Set a timer to run every 10 seconds (10000 milliseconds)
    setInterval(function() {
        // Pick a random status from our array
        const randomIndex = Math.floor(Math.random() * statuses.length);
        const randomStatus = statuses[randomIndex];
        
        // Update the text on the page
        if (statusText) {
            statusText.textContent = randomStatus;
        }
    }, 10000); 
}

// 4. Wait for the page to finish loading before running the script
document.addEventListener("DOMContentLoaded", function() {
    updateSystemHealth();
}); 