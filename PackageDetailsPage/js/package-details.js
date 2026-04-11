document.addEventListener('DOMContentLoaded', function () {
    displayUserName(); setupPricingSelection(); setupDateSelection(); setupBookingButtons(); setupHelpfulButtons();
}
);

function displayUserName() {
    const userName = document.getElementById('username');
    const data = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');

    if (data && userName) {
        const user = JSON.parse(data);
        const name = user.email ? user.email.split('@')[0] : 'Guest';
        userName.textContent = name;
    }
}

function setupPricingSelection() {
    const withAccom = document.querySelector('.with-acom');
    const withoutAccom = document.querySelector('.without-acom');

    if (withAccom && withoutAccom) {
        withAccom.classList.add('selected');

        withAccom.addEventListener('click', function () {
            this.classList.add('selected');
            withoutAccom.classList.remove('selected');
        })

        withoutAccom.addEventListener('click', function () {
            this.classList.add('selected');
            withAccom.classList.remove('selected');
        })

    }

}

function setupDateSelection() {
    let dateBtns = document.querySelectorAll('.dates button');

    dateBtns.forEach(button => {
        button.addEventListener('click', function () {
            dateBtns.forEach(btn => btn.classList.remove('selected-date'));
            this.classList.add('selected-date');
            let selectedDate = this.getAttribute('data-date');
        });

    });
}


function setupBookingButtons() {
    let bookBtn = document.getElementById('book-now-btn');
    if (bookBtn) {
        bookBtn.addEventListener('click', function () {
            let selectedPrice = document.querySelector('.with-accom.selected, .without-accom.selected');
            let pricingType = selectedPrice ? (selectedPrice.classList.contains('with-accom') ? 'with-accommodation' : 'without-acommodation') : 'standard';

            let selectedDate = document.querySelector('.dates button.selected-date');
            let date = selectedDate ? selectedDate.getAttribute('data-date') : 'Not selected';

            const bookingInfo = {
                package: 'Timeless Egypt: Cairo, Luxor & Nile Cruise',
                pricing: pricingType,
                date: date,
                price: pricingType === 'with-accommodation' ? '$3,000' : '$2,000'
            };
            sessionStorage.setItem('pendingBooking', JSON.stringify(bookingInfo));

            showNotification('Redirecting to booking page...', 'success');

            setTimeout(() => {
                window.location.href = 'booking.html';
            }, 800);
        });
    }


    let customizeBtn = document.getElementById('customize-btn');
    if (customizeBtn) {
        customizeBtn.addEventListener('click', function () {
            let packageInfo = {
                Name: 'Timeless Egypt: Cairo, Luxor & Nile Cruise', duration: '7 days', type: 'week-package'
            };

            sessionStorage.setItem('customizePackage', JSON.stringify(packageInfo));
            setTimeout(() => { window.location.href = 'custom-trip.html' }, 800);
        })
    }


}


function setupHelpfulButtons() {
    let helpBtn = document.querySelector('.helpful');
    if (helpBtn) {
        helpBtn.addEventListener('click', function () {
            let currentText = this.innerHTML;
            if (!this.classList.contains('clicked')) {
                this.classList.add('clicked');
                this.innerHTML = '<i class="fas fa-thumbs-up"></i> Helpful (157)';
                showNotification('Thank you for the feedback!', 'info');

            }
        })
    }

    let viewAllBtn = document.querySelector('.view-all');
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', function () {
            showNotification('Loading reviews...', 'info');
        });
    }
}

function showNotification(message, type = 'info') {
    // Create notification container if it doesn't exist
    let container = document.querySelector('.notification-container');

    if (!container) {
        container = document.createElement('div');
        container.className = 'notification-container';
        document.body.appendChild(container);
    }

    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;

    // Icon based on type
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-exclamation-circle';

    notification.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;

    container.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.remove();
        if (container.children.length === 0) {
            container.remove();
        }
    }, 3000);
}