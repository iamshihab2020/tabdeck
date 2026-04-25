try {
  var a = localStorage.getItem('__td_accent');
  var t = localStorage.getItem('__td_theme');
  if (a) {
    var r = document.documentElement;
    r.style.setProperty('--accent', a);
    r.style.setProperty('--accent-light', a + 'cc');
    r.style.setProperty('--accent-bg', a + '2e');
    r.style.setProperty('--accent-subtle', a + '14');
    r.style.setProperty('--accent-glow', a + '80');
  }
  if (t) document.documentElement.dataset.theme = t;
} catch (e) {}
