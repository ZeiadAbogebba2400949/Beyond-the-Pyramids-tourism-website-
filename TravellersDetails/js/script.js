document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const session = getSession();
    if (!session || !session.email) {
        window.location.href = '../LoginPage/login.html';
        return;
    }

    // ── Populate topbar avatar (real photo → icon fallback) ──────────────
    // Mirror the same lookup used in global.js updateAuthUI() and UserProfile.js
    let userRecord = null;
    try {
        if (window.AppStorage && window.AppStorage.getUserByEmail) {
            userRecord = window.AppStorage.getUserByEmail(session.email);
        }
        if (!userRecord && window.MockData && window.MockData.users) {
            userRecord = window.MockData.users.find(
                u => u.email && u.email.toLowerCase() === session.email.toLowerCase()
            ) || null;
        }
        // Also check MockData.accounts (used by some mock setups)
        if (!userRecord && window.MockData && window.MockData.accounts) {
            const match = Object.values(window.MockData.accounts).find(
                a => a.email === session.email
            );
            if (match) userRecord = match;
        }
    } catch (e) { /* silent */ }

    const displayName = userRecord?.name || session.name || session.email.split('@')[0];
    const photoUrl    = userRecord?.image || null;

    const avatar = document.getElementById('user-avatar');
    if (avatar) {
        if (photoUrl) {
            avatar.innerHTML = `<img src="${photoUrl}" alt="${displayName}"
                style="width:100%;height:100%;object-fit:cover;border-radius:50%;"
                onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
                <span style="display:none;align-items:center;justify-content:center;width:100%;height:100%;">
                    <i class="fas fa-user-circle" style="font-size:1.5rem;color:var(--gold-primary);"></i>
                </span>`;
        } else {
            avatar.innerHTML = `<i class="fas fa-user-circle" style="font-size:1.5rem;color:var(--gold-primary);"></i>`;
        }
        avatar.title = displayName;
    }

    // Also update greeting name in topbar if present
    const greetingName = document.querySelector('.greeting-name');
    if (greetingName && greetingName.textContent === 'Traveler Details') {
        // keep the h1 text as-is, it's a page title not a user name
    }

    // Load current booking
    let currentBooking = null;
    try {
        if (window.AppStorage) {
            const raw = window.AppStorage.getItem('currentBooking');
            if (raw) currentBooking = JSON.parse(raw);
        } else {
            const raw = localStorage.getItem('currentBooking');
            if (raw) currentBooking = JSON.parse(raw);
        }
    } catch (e) {
        console.error('Error loading booking data:', e);
    }

    if (!currentBooking || currentBooking.travelers <= 1) {
        // Nothing to do here, proceed to summary
        window.location.href = '../BookingSummaryPage/BookingSummary.html';
        return;
    }

    const additionalCount = currentBooking.travelers - 1;
    const container = document.getElementById('travelers-container');

    // All world nationalities for the dropdown
    const NATIONALITIES = [
        'Afghan','Albanian','Algerian','American','Andorran','Angolan','Antiguans',
        'Argentinean','Armenian','Australian','Austrian','Azerbaijani','Bahamian',
        'Bahraini','Bangladeshi','Barbadian','Barbudans','Batswana','Belarusian',
        'Belgian','Belizean','Beninese','Bhutanese','Bolivian','Bosnian','Brazilian',
        'British','Bruneian','Bulgarian','Burkinabe','Burmese','Burundian','Cambodian',
        'Cameroonian','Canadian','Cape Verdean','Central African','Chadian','Chilean',
        'Chinese','Colombian','Comoran','Congolese','Costa Rican','Croatian','Cuban',
        'Cypriot','Czech','Danish','Djibouti','Dominican','Dutch','East Timorese',
        'Ecuadorean','Egyptian','Emirian','Equatorial Guinean','Eritrean','Estonian',
        'Ethiopian','Fijian','Finnish','French','Gabonese','Gambian','Georgian',
        'German','Ghanaian','Greek','Grenadian','Guatemalan','Guinea-Bissauan',
        'Guinean','Guyanese','Haitian','Herzegovinian','Honduran','Hungarian',
        'I-Kiribati','Icelander','Indian','Indonesian','Iranian','Iraqi','Irish',
        'Israeli','Italian','Ivorian','Jamaican','Japanese','Jordanian','Kazakhstani',
        'Kenyan','Kittian and Nevisian','Kuwaiti','Kyrgyz','Laotian','Latvian',
        'Lebanese','Liberian','Libyan','Liechtensteiner','Lithuanian','Luxembourger',
        'Macedonian','Malagasy','Malawian','Malaysian','Maldivian','Malian',
        'Maltese','Marshallese','Mauritanian','Mauritian','Mexican','Micronesian',
        'Moldovan','Monacan','Mongolian','Moroccan','Mosotho','Motswana','Mozambican',
        'Namibian','Nauruan','Nepalese','New Zealander','Ni-Vanuatu','Nicaraguan',
        'Nigerian','Nigerien','Norwegian','Omani','Pakistani','Palauan','Panamanian',
        'Papua New Guinean','Paraguayan','Peruvian','Philippine','Polish',
        'Portuguese','Qatari','Romanian','Russian','Rwandan','Saint Lucian',
        'Salvadoran','Samoan','San Marinese','Sao Tomean','Saudi','Senegalese',
        'Serbian','Seychellois','Sierra Leonean','Singaporean','Slovakian',
        'Slovenian','Solomon Islander','Somali','South African','South Korean',
        'Spanish','Sri Lankan','Sudanese','Surinamer','Swazi','Swedish','Swiss',
        'Syrian','Taiwanese','Tajik','Tanzanian','Thai','Togolese','Tongan',
        'Trinidadian or Tobagonian','Tunisian','Turkish','Tuvaluan','Ugandan',
        'Ukrainian','Uruguayan','Uzbekistani','Venezuelan','Vietnamese','Yemenite',
        'Zambian','Zimbabwean'
    ];

    const nationalityOptions = NATIONALITIES.map(n =>
        `<option value="${n}">${n}</option>`
    ).join('');

    // Generate form fields
    for (let i = 1; i <= additionalCount; i++) {
        const card = document.createElement('div');
        card.className = 'traveler-card';
        card.innerHTML = `
            <h4 data-num="${i + 1}">Traveler ${i + 1}</h4>

            <div class="form-row">
                <div class="form-group">
                    <label for="name-${i}">Full Name *</label>
                    <input type="text" id="name-${i}" name="name-${i}" required placeholder="e.g. Jane Doe">
                </div>

                <div class="form-group">
                    <label for="nationality-${i}">Nationality *</label>
                    <select id="nationality-${i}" name="nationality-${i}" required class="nationality-select">
                        <option value="" disabled selected>Select nationality…</option>
                        ${nationalityOptions}
                    </select>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="dob-${i}">Date of Birth *</label>
                    <input type="date" id="dob-${i}" name="dob-${i}" required class="dob-input" data-index="${i}">
                </div>

                <div class="form-group phone-group" id="phone-group-${i}">
                    <label for="phone-${i}">Phone Number *</label>
                    <input type="tel" id="phone-${i}" name="phone-${i}" placeholder="+20 123 456 7890">
                </div>
            </div>
        `;
        container.appendChild(card);
    }

    // Attach listeners for DOB to show/hide phone number
    const dobInputs = document.querySelectorAll('.dob-input');
    dobInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            const index = e.target.getAttribute('data-index');
            const dob = new Date(e.target.value);
            const today = new Date();
            let age = today.getFullYear() - dob.getFullYear();
            const m = today.getMonth() - dob.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                age--;
            }

            const phoneGroup = document.getElementById(`phone-group-${index}`);
            const phoneInput = document.getElementById(`phone-${index}`);

            if (age >= 18) {
                phoneGroup.classList.add('visible');
                phoneInput.setAttribute('required', 'required');
            } else {
                phoneGroup.classList.remove('visible');
                phoneInput.removeAttribute('required');
                phoneInput.value = ''; // clear if they change back to <18
            }
        });
    });

    // Handle form submission
    const form = document.getElementById('travelers-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const additionalTravelers = [];
        let isValid = true;
        
        for (let i = 1; i <= additionalCount; i++) {
            const nameInput = document.getElementById(`name-${i}`);
            const nationalityInput = document.getElementById(`nationality-${i}`);
            const dobInput = document.getElementById(`dob-${i}`);
            const phoneGroup = document.getElementById(`phone-group-${i}`);
            const phoneInput = document.getElementById(`phone-${i}`);
            
            const name = nameInput.value.trim();
            const nationality = nationalityInput.value;
            const dob = dobInput.value;
            const phone = phoneGroup.classList.contains('visible') ? phoneInput.value.trim() : null;

            // Basic validation
            if (name.length < 2) {
                alert(`Traveler ${i + 1}: Name must be at least 2 characters.`);
                isValid = false;
                break;
            }
            if (phone !== null && phone.replace(/\D/g, '').length < 7) {
                alert(`Traveler ${i + 1}: Phone number must have at least 7 digits.`);
                isValid = false;
                break;
            }

            additionalTravelers.push({
                index: i + 1,
                name,
                nationality,
                dob,
                phone
            });
        }
        
        if (!isValid) return;

        // Save back to currentBooking
        currentBooking.additionalTravelers = additionalTravelers;
        
        if (window.AppStorage) {
            window.AppStorage.setItem('currentBooking', JSON.stringify(currentBooking));
            // Update in history/bookings array if needed, but BookingSummary usually finalizes it.
            // Since package-details added it, we should update the entry in AppStorage bookings
            const allBookings = window.AppStorage.getBookings();
            const bIndex = allBookings.findIndex(b => b.id === currentBooking.id);
            if (bIndex !== -1) {
                allBookings[bIndex].additionalTravelers = additionalTravelers;
                window.AppStorage.setBookings(allBookings);
            }
        } else {
            localStorage.setItem('currentBooking', JSON.stringify(currentBooking));
        }

        window.location.href = '../BookingSummaryPage/BookingSummary.html';
    });

    // Back button
    document.getElementById('back-btn').addEventListener('click', () => {
        window.history.back();
    });

});

function getSession() {
    if (window.AppStorage && window.AppStorage.getUserSession) {
        return window.AppStorage.getUserSession();
    }
    const s = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');
    if (s) return JSON.parse(s);
    return null;
}
