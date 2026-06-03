const LETTERS_ONLY = /^[a-zA-Z\s'-]+$/;

function tErr(id, msg) { const el = document.getElementById(id); if (el) el.textContent = msg; }
function tClear(id)    { const el = document.getElementById(id); if (el) el.textContent = ''; }

function validateFirstName(i) {
    const val = (document.querySelector(`[name="firstName_${i}"]`)?.value || '').trim();
    if (val.length < 2)          { tErr(`firstName_error_${i}`, 'First name must be at least 2 characters'); return false; }
    if (!LETTERS_ONLY.test(val)) { tErr(`firstName_error_${i}`, 'First name must contain letters only');     return false; }
    tClear(`firstName_error_${i}`); return true;
}

function validateLastName(i) {
    const val = (document.querySelector(`[name="lastName_${i}"]`)?.value || '').trim();
    if (val.length < 2)          { tErr(`lastName_error_${i}`, 'Last name must be at least 2 characters'); return false; }
    if (!LETTERS_ONLY.test(val)) { tErr(`lastName_error_${i}`, 'Last name must contain letters only');     return false; }
    tClear(`lastName_error_${i}`); return true;
}

function validateDob(i) {
    const val = document.querySelector(`[name="dob_${i}"]`)?.value || '';
    if (!val) { tErr(`dob_error_${i}`, 'Date of birth is required'); return false; }
    const now = Date.now();
    const dob = new Date(val).getTime();
    const ageMs = now - dob;
    const oneMonth = 30 * 24 * 60 * 60 * 1000;
    const hundredYears = 100 * 365.25 * 24 * 60 * 60 * 1000;
    if (ageMs < oneMonth)      { tErr(`dob_error_${i}`, 'Traveler must be at least 1 month old');  return false; }
    if (ageMs > hundredYears)  { tErr(`dob_error_${i}`, 'Age cannot exceed 100 years');            return false; }
    tClear(`dob_error_${i}`); return true;
}

function validateNationality(i) {
    const val = document.querySelector(`[name="nationality_${i}"]`)?.value || '';
    if (!val) { tErr(`nationality_error_${i}`, 'Please select a nationality'); return false; }
    tClear(`nationality_error_${i}`); return true;
}

function validateIdNumber(i) {
    const digits = (document.querySelector(`[name="idNumber_${i}"]`)?.value || '').replace(/\D/g, '');
    if (digits.length < 9) { tErr(`idNumber_error_${i}`, 'Identity number must be at least 9 digits'); return false; }
    tClear(`idNumber_error_${i}`); return true;
}

function validateAllTravellers(totalTravelers) {
    let valid = true;
    for (let i = 1; i < totalTravelers; i++) {
        if (!validateFirstName(i))  valid = false;
        if (!validateLastName(i))   valid = false;
        if (!validateDob(i))        valid = false;
        if (!validateNationality(i)) valid = false;
        if (!validateIdNumber(i))   valid = false;
    }
    return valid;
}

document.addEventListener('DOMContentLoaded', () => {
    const totalTravelers = window.TRAVELERS || 1;

    for (let i = 1; i < totalTravelers; i++) {
        const idx = i;

        document.querySelector(`[name="firstName_${idx}"]`)
            ?.addEventListener('input', () => validateFirstName(idx));

        document.querySelector(`[name="lastName_${idx}"]`)
            ?.addEventListener('input', () => validateLastName(idx));

        document.querySelector(`[name="dob_${idx}"]`)
            ?.addEventListener('change', () => validateDob(idx));

        document.querySelector(`[name="nationality_${idx}"]`)
            ?.addEventListener('change', () => validateNationality(idx));

        const idInput = document.querySelector(`[name="idNumber_${idx}"]`);
        if (idInput) {
            idInput.addEventListener('input', () => {
                idInput.value = idInput.value.replace(/\D/g, '');
                validateIdNumber(idx);
            });
        }
    }

    document.getElementById('back-btn')?.addEventListener('click', () => window.history.back());
});
