/*
 * First-party progressive enhancement for the site nav.
 * Wires the mobile menu toggle; Escape and outside-click close it.
 */
(function () {
  'use strict';

  const toggle = document.querySelector('[data-nav-toggle]');
  const menu = document.getElementById('site-menu');

  if (!toggle || !menu) return;

  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    menu.classList.toggle('is-open', open);
  };

  toggle.addEventListener('click', () => {
    setOpen(!isOpen());
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) {
      setOpen(false);
      toggle.focus();
    }
  });

  document.addEventListener('click', (event) => {
    if (!isOpen()) return;
    if (event.target instanceof Node && (menu.contains(event.target) || toggle.contains(event.target))) return;
    setOpen(false);
  });

  menu.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('a')) {
      setOpen(false);
    }
  });

  const desktop = window.matchMedia('(min-width: 760px)');
  const onChange = (mq) => {
    if (mq.matches) setOpen(false);
  };
  if (desktop.addEventListener) {
    desktop.addEventListener('change', onChange);
  } else if (desktop.addListener) {
    desktop.addListener(onChange);
  }
})();
