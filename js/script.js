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

// floating home button: shows once the top-left home icon scrolls out of view
document.addEventListener('DOMContentLoaded', function () {
  var topBack = document.querySelector('.top-back');
  var floatHome = document.querySelector('.float-home');
  if (!topBack || !floatHome) return;

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        floatHome.classList.toggle('show', !entry.isIntersecting);
      });
    }, { threshold: 0 });
    observer.observe(topBack);
  } else {
    // fallback for very old browsers without IntersectionObserver
    window.addEventListener('scroll', function () {
      var rect = topBack.getBoundingClientRect();
      floatHome.classList.toggle('show', rect.bottom < 0);
    });
  }
});

// persistent keyword highlight when arriving from a search result (?hl=keyword)
document.addEventListener('DOMContentLoaded', function () {
  var main = document.querySelector('main');
  if (!main) return;
  var hl = new URLSearchParams(window.location.search).get('hl');
  if (!hl) return;

  var pattern = hl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  var testRe = new RegExp(pattern, 'i');   // no 'g' flag: safe to call .test() repeatedly
  var replaceRe = new RegExp(pattern, 'gi'); // used only inside String.replace, which resets per call

  var walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT, {
    acceptNode: function (node) {
      var p = node.parentNode;
      if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      if (p && (p.tagName === 'SCRIPT' || p.tagName === 'STYLE' || p.tagName === 'MARK')) return NodeFilter.FILTER_REJECT;
      return testRe.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });
  var targets = [];
  var n;
  while ((n = walker.nextNode())) targets.push(n);

  targets.forEach(function (node) {
    var text = node.nodeValue;
    var frag = document.createDocumentFragment();
    var lastIndex = 0;
    text.replace(replaceRe, function (match, p1, offset) {
      frag.appendChild(document.createTextNode(text.slice(lastIndex, offset)));
      var mark = document.createElement('mark');
      mark.className = 'hl-target';
      mark.textContent = match;
      frag.appendChild(mark);
      lastIndex = offset + match.length;
    });
    frag.appendChild(document.createTextNode(text.slice(lastIndex)));
    node.parentNode.replaceChild(frag, node);
  });

  // scroll after the browser's own #anchor jump has settled, so it doesn't
  // get overridden and yank the view back up to the section heading
  function scrollToFirstHighlight() {
    var first = main.querySelector('.hl-target');
    if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  window.addEventListener('load', function () {
    setTimeout(scrollToFirstHighlight, 150);
  });
  // fallback in case 'load' already fired before this ran
  if (document.readyState === 'complete') {
    setTimeout(scrollToFirstHighlight, 150);
  }
});
