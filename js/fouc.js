try {
  var p = localStorage.getItem('__td_pack') || 'default';
  if (p !== 'brutal' && p !== 'atelier' && p !== 'holodeck' && p !== 'mono') p = 'default';
  var t = localStorage.getItem('__td_theme');
  var a = localStorage.getItem('__td_accent');
  var r = document.documentElement;

  r.dataset.pack = p;
  if (t) r.dataset.theme = t;

  var link = document.getElementById('theme-pack-css');
  var href = 'css/themes/' + p + '.css';
  if (link) {
    if (link.getAttribute('href') !== href) link.setAttribute('href', href);
  } else {
    link = document.createElement('link');
    link.id = 'theme-pack-css';
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  if (a) {
    r.style.setProperty('--accent', a);
    r.style.setProperty('--accent-light', a + 'cc');
    r.style.setProperty('--accent-bg', a + '2e');
    r.style.setProperty('--accent-subtle', a + '14');
    r.style.setProperty('--accent-glow', a + '80');
  }
} catch (e) {}
