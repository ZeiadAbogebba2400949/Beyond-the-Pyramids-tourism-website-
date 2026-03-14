const form = document.querySelector("form");

  function showError(el, message) {
    const msg = document.getElementById(el.id + "_error");
    if (msg) {
      msg.textContent = message;
    }
  }

  function clearError(el) {
    showError(el, "");
  }

  function validateField(el) {
    clearError(el);

    if (el.id === "firstname" || el.id === "lastname") {
      if (el.value.trim() === "") {
        showError(el, "This field is required");
        return false;
      }
      if (el.value.trim().length < 2) {
        showError(el, "Must be at least 2 characters");
        return false;
      }
    }

    if (el.id === "email") {
      if (el.value.trim() === "") {
        showError(el, "Email is required");
        return false;
      }
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(el.value)) {
        showError(el, "Enter a valid email address");
        return false;
      }
    }

    if (el.id === "password") {
      if (el.value === "") {
        showError(el, "Password is required");
        return false;
      }
      if (el.value.length < 6) {
        showError(el, "Password must be at least 6 characters");
        return false;
      }
      if (!/\d/.test(el.value)) {
        showError(el, "Password must contain at least one number");
        return false;
      }
      if (!/[!@#$%^&*()-+]/.test(el.value)) {
        showError(el, "Password must contain at least one special character");
        return false;
      }
    }

    if (el.id === "confirm_password") {
      if (el.value === "") {
        showError(el, "Please confirm your password");
        return false;
      }
      const password = document.getElementById("password").value;
      if (el.value !== password) {
        showError(el, "Passwords do not match");
        return false;
      }
    }

    if (el.id === "dob") {
      if (el.value === "") {
        showError(el, "Date of birth is required");
        return false;
      }
      const birthDate = new Date(el.value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 18) {
        showError(el, "You must be at least 18 years old");
        return false;
      }
    }

    if (el.id === "nationality" || el.id === "country_code") {
      if (el.value === "" || el.value === null) {
        showError(el, "Please select an option");
        return false;
      }
    }

    if (el.id === "phone") {
      if (el.value.trim() === "") {
        showError(el, "Phone number is required");
        return false;
      }
      const digitsOnly = el.value.replace(/\D/g, "");
      if (digitsOnly.length < 7) {
        showError(el, "Phone number must have at least 7 digits");
        return false;
      }
    }

    return true;
  }

  document.querySelectorAll("input, select").forEach(el => {
    el.addEventListener("input", function() {
      validateField(this);
      if (this.id === "password") {
        validateField(document.getElementById("confirm_password"));
      }
    });
    
    el.addEventListener("blur", function() {
      validateField(this);
    });
    
    el.addEventListener("change", function() {
      validateField(this);
    });
  });

  form.addEventListener("submit", function(e) {
    e.preventDefault();
    
    let isValid = true;
    
    document.querySelectorAll("input, select").forEach(el => {
      if (!validateField(el)) {
        isValid = false;
      }
    });
    
    if (isValid) {
      const userData = {
        firstName: document.getElementById("firstname").value.trim(),
        lastName: document.getElementById("lastname").value.trim(),
        dateOfBirth: document.getElementById("dob").value,
        nationality: document.getElementById("nationality").value,
        countryCode: document.getElementById("country_code").value,
        phone: document.getElementById("phone").value.trim(),
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("password").value
      };
      
      let users = JSON.parse(localStorage.getItem("beyondPyramids_users")) || [];
      
      const emailExists = users.some(user => user.email === userData.email);
      if (emailExists) {
        alert("This email is already registered. Please use a different email.");
        return;
      }
      
      users.push(userData);
      localStorage.setItem("beyondPyramids_users", JSON.stringify(users));
      
      alert("Registration successful! Redirecting to login...");
      
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1500);
    }
    });