/**
 * admin-theme.js
 * Shared light/dark mode toggle for all admin pages.
 * Persists choice in localStorage under the key 'theme'.
 * Works alongside the existing global.js IIFE that applies the saved theme on load.
 */

(function () {
    /* ── Apply saved theme immediately (before paint) ── */
    const saved = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
})();

document.addEventListener('DOMContentLoaded', function () {
    const btn    = document.getElementById('admin-theme-toggle');
    const sunIcon  = document.getElementById('theme-icon-sun');
    const moonIcon = document.getElementById('theme-icon-moon');

    if (!btn) return;

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);

        if (theme === 'dark') {
            sunIcon.style.display  = 'block';
            moonIcon.style.display = 'none';
            btn.title = 'Switch to Light Mode';
        } else {
            sunIcon.style.display  = 'none';
            moonIcon.style.display = 'block';
            btn.title = 'Switch to Dark Mode';
        }
    }

    /* ── Initialise icon state ── */
    const current = localStorage.getItem('theme') || 'dark';
    applyTheme(current);

    /* ── Toggle on click ── */
    btn.addEventListener('click', function () {
        const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(next);
    });

    /* ── Listen for changes made in other tabs / pages ── */
    window.addEventListener('storage', function (e) {
        if (e.key === 'theme' && e.newValue) {
            applyTheme(e.newValue);
        }
    });
});
