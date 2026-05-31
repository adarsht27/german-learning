/* ============================================================
   German Learning KB — nav.js
   Handles the dark / light theme toggle.
   The inline script in each <head> applies the saved theme
   instantly (no flash); this file wires up the button.
   ============================================================ */

(function () {
  var DARK = 'dark';

  function applyTheme(dark) {
    document.documentElement.setAttribute('data-theme', dark ? DARK : 'light');
    var btn = document.getElementById('themeToggle');
    if (btn) {
      btn.textContent    = dark ? '☀️' : '🌙';
      btn.title          = dark ? 'Switch to light mode' : 'Switch to dark mode';
      btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var dark = localStorage.getItem('theme') === DARK;
    applyTheme(dark);

    var btn = document.getElementById('themeToggle');
    if (btn) {
      btn.addEventListener('click', function () {
        dark = !dark;
        localStorage.setItem('theme', dark ? DARK : 'light');
        applyTheme(dark);
      });
    }
  });
})();
