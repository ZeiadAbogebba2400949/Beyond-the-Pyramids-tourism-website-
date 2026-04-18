document.addEventListener("DOMContentLoaded", function() {
    
    const contactForm = document.getElementById("contact-form");
    const submitBtn = document.querySelector(".btn-submit");

    if (contactForm) {
        contactForm.addEventListener("submit", function(event) {
            // Stop the page from reloading
            event.preventDefault();

            // Change button text to make it feel like it's sending
            submitBtn.textContent = "Sending...";
            submitBtn.style.backgroundColor = "#ccc";
            submitBtn.style.cursor = "not-allowed";

            // Fake a 1.5 second loading delay before showing success
            setTimeout(function() {
                alert("Thank you! Your message has been sent successfully. We will get back to you soon.");
                
                // Reset the form and the button
                contactForm.reset();
                submitBtn.textContent = "Send Message";
                submitBtn.style.backgroundColor = "#0056b3";
                submitBtn.style.cursor = "pointer";
            }, 1500);
        });
    }

});