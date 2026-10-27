(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  if (!toggle) return;

  var panel = document.getElementById(toggle.getAttribute('aria-controls'));
  if (!panel) return;

  function setOpen(open) {
    toggle.setAttribute('aria-expanded', String(open));
    panel.classList.toggle('is-open', open);
  }

  toggle.addEventListener('click', function () {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  panel.addEventListener('click', function (event) {
    if (event.target instanceof Element && event.target.closest('a')) {
      setOpen(false);
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') setOpen(false);
  });
}());
