(function () {
  var storageKey = 'dashinja-theme';
  var themes = [
    { value: 'midnight', label: 'Midnight' },
    { value: 'ember', label: 'Ember' },
  ];

  function findTheme(value) {
    for (var i = 0; i < themes.length; i += 1) {
      if (themes[i].value === value) return themes[i];
    }
    return themes[0];
  }

  function applyTheme(theme) {
    document.body.dataset.theme = theme.value;
    document.documentElement.style.colorScheme = 'dark';
    try {
      localStorage.setItem(storageKey, theme.value);
    } catch (_) {
      // Ignore storage failures in private browsing or blocked storage.
    }

    var button = document.querySelector('[data-theme-toggle]');
    if (button) {
      button.textContent = 'Theme: ' + theme.label;
      button.setAttribute('aria-label', 'Toggle site theme. Current theme: ' + theme.label);
      button.setAttribute('aria-pressed', theme.value === themes[0].value ? 'false' : 'true');
    }
  }

  var savedTheme = null;
  try {
    savedTheme = localStorage.getItem(storageKey);
  } catch (_) {
    savedTheme = null;
  }
  var currentTheme = findTheme(savedTheme || document.body.dataset.theme || themes[0].value);
  applyTheme(currentTheme);

  var button = document.querySelector('[data-theme-toggle]');
  if (button) {
    button.addEventListener('click', function () {
      var index = 0;
      for (var i = 0; i < themes.length; i += 1) {
        if (themes[i].value === document.body.dataset.theme) {
          index = i;
          break;
        }
      }

      var nextTheme = themes[(index + 1) % themes.length];
      applyTheme(nextTheme);
    });
  }
})();
