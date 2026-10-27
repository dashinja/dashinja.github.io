/*
 * navbar-toggle.js — first-party progressive enhancement for the site nav.
 *
 * Without JavaScript the menu stays visible (stacked/wrapped below the
 * brand); with JavaScript on small screens it collapses behind the toggle
 * button. Escape closes the menu and returns focus to the toggle; clicking
 * a link or outside the nav also closes it.
 */
(function () {
  document.documentElement.classList.add('js');

  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('nav-menu');
  if (!toggle || !menu) return;

  function isOpen() {
    return menu.classList.contains('open');
  }

  function setOpen(open) {
    toggle.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('open', open);
  }

  toggle.addEventListener('click', function () {
    setOpen(!isOpen());
  });

  menu.addEventListener('click', function (event) {
    if (event.target instanceof Element && event.target.closest('a')) {
      setOpen(false);
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && isOpen()) {
      setOpen(false);
      toggle.focus();
    }
  });

  document.addEventListener('click', function (event) {
    if (!isOpen()) return;
    if (event.target instanceof Element && !event.target.closest('.site-nav')) {
      setOpen(false);
    }
  });
}());
