/*
 * First-party progressive enhancement for the site nav.
 * Without JavaScript the menu renders expanded; with JavaScript the
 * hamburger collapses it on small screens.
 */
(function () {
  'use strict';

  var toggle = document.querySelector('[data-nav-toggle]');
  var menu = document.querySelector('#site-nav-menu');
  if (!toggle || !menu) return;

  document.documentElement.classList.add('has-js');

  function setOpen(open) {
    menu.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  }

  function isOpen() {
    return menu.classList.contains('is-open');
  }

  toggle.addEventListener('click', function () {
    setOpen(!isOpen());
  });

  menu.addEventListener('click', function (event) {
    if (event.target.closest('a')) setOpen(false);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && isOpen()) {
      setOpen(false);
      toggle.focus();
    }
  });

  document.addEventListener('click', function (event) {
    if (isOpen() && !event.target.closest('.site-nav')) setOpen(false);
  });

  var media = window.matchMedia('(min-width: 861px)');
  function syncToViewport() {
    if (media.matches) setOpen(false);
  }
  if (media.addEventListener) {
    media.addEventListener('change', syncToViewport);
  } else if (media.addListener) {
    media.addListener(syncToViewport);
  }
  syncToViewport();
}());
