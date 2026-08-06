document.addEventListener('DOMContentLoaded', function () {
  var btn = document.querySelector('.menu-btn');
  var sidebar = document.querySelector('.sidebar');
  var overlay = document.querySelector('.overlay');
  if (!btn || !sidebar) return;

  function close() {
    sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('show');
  }
  function toggle() {
    sidebar.classList.toggle('open');
    if (overlay) overlay.classList.toggle('show');
  }

  btn.addEventListener('click', toggle);
  if (overlay) overlay.addEventListener('click', close);

  // close the mobile drawer after navigating to a link
  sidebar.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      if (window.innerWidth <= 900) close();
    });
  });
});
