document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initDropdowns();
});

function initNavigation() {
    const sidebar = document.getElementById('sidebar');
    const hamburgerBtn = document.getElementById('hamburgerMenu');
    const closeBtn = document.getElementById('closeSidebar');

    if (hamburgerBtn && sidebar) {
        hamburgerBtn.addEventListener('click', () => {
            sidebar.style.display = 'block';
        });
    }

    if (closeBtn && sidebar) {
        closeBtn.addEventListener('click', () => {
            sidebar.style.display = 'none';
        });
    }
}

function initDropdowns() {
    const profileBtn = document.getElementById('profileBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    
    const notifBtn = document.getElementById('notifBtn');
    const notifDropdown = document.getElementById('notifDropdown');

    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isHidden = profileDropdown.style.display === 'none';
            profileDropdown.style.display = isHidden ? 'block' : 'none';
            if (notifDropdown) notifDropdown.style.display = 'none';
        });
    }

    if (notifBtn && notifDropdown) {
        notifBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isHidden = notifDropdown.style.display === 'none';
            notifDropdown.style.display = isHidden ? 'block' : 'none';
            if (profileDropdown) profileDropdown.style.display = 'none';
        });
    }

    document.addEventListener('click', () => {
        if (profileDropdown) profileDropdown.style.display = 'none';
        if (notifDropdown) notifDropdown.style.display = 'none';
    });

    if (profileDropdown) profileDropdown.addEventListener('click', (e) => e.stopPropagation());
    if (notifDropdown) notifDropdown.addEventListener('click', (e) => e.stopPropagation());
}
