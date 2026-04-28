(function () {
  var toggles = document.querySelectorAll('[data-toggle="collapse"][data-target]');

  toggles.forEach(function (toggle) {
    var targetSelector = toggle.getAttribute('data-target');
    var target = targetSelector ? document.querySelector(targetSelector) : null;
    if (!target) return;

    toggle.addEventListener('click', function () {
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      target.classList.toggle('show', !expanded);
    });
  });
}());
