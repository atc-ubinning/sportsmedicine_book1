document.addEventListener('DOMContentLoaded', function () {
  var main = document.querySelector('main');
  var topBar = document.querySelector('.page-top-bar');
  var topInput = document.getElementById('page-search-input');
  var topCount = document.getElementById('page-search-count');
  var floatWrap = document.getElementById('float-page-search');
  var floatPanel = document.getElementById('float-page-search-panel');
  var floatBtn = document.getElementById('float-page-search-btn');
  var floatInput = document.getElementById('page-search-input-float');
  var floatCount = document.getElementById('page-search-count-float');
  if (!main || !topInput || !floatInput) return;

  var marks = [];
  var currentIndex = -1;

  function clearHighlights() {
    var existing = main.querySelectorAll('mark.page-hl');
    existing.forEach(function (m) {
      var parent = m.parentNode;
      if (!parent) return;
      parent.replaceChild(document.createTextNode(m.textContent), m);
      parent.normalize();
    });
    marks = [];
    currentIndex = -1;
  }

  function updateCount() {
    var hasQuery = !!(topInput.value || floatInput.value);
    var text = marks.length ? ((currentIndex + 1) + ' / ' + marks.length) : (hasQuery ? '0건' : '');
    if (topCount) topCount.textContent = text;
    if (floatCount) floatCount.textContent = text;
  }

  function focusCurrent(scroll) {
    marks.forEach(function (m) { m.classList.remove('page-hl-current'); });
    if (currentIndex < 0 || currentIndex >= marks.length) return;
    var m = marks[currentIndex];
    m.classList.add('page-hl-current');
    if (scroll !== false) m.scrollIntoView({ behavior: 'smooth', block: 'center' });
    updateCount();
  }

  function highlight(query) {
    clearHighlights();
    if (!query) { updateCount(); return; }
    var pattern = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    var testRe = new RegExp(pattern, 'i');
    var replaceRe = new RegExp(pattern, 'gi');

    var walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        var p = node.parentNode;
        if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        if (p && (p.tagName === 'SCRIPT' || p.tagName === 'STYLE' || p.tagName === 'MARK')) return NodeFilter.FILTER_REJECT;
        if (p && p.closest && p.closest('.page-top-bar, .float-page-search')) return NodeFilter.FILTER_REJECT;
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
        mark.className = 'page-hl';
        mark.textContent = match;
        frag.appendChild(mark);
        lastIndex = offset + match.length;
      });
      frag.appendChild(document.createTextNode(text.slice(lastIndex)));
      node.parentNode.replaceChild(frag, node);
    });

    marks = Array.prototype.slice.call(main.querySelectorAll('mark.page-hl'));
    currentIndex = marks.length ? 0 : -1;
    if (marks.length) focusCurrent(false);
    updateCount();
  }

  function next() {
    if (!marks.length) return;
    currentIndex = (currentIndex + 1) % marks.length;
    focusCurrent(true);
  }
  function prev() {
    if (!marks.length) return;
    currentIndex = (currentIndex - 1 + marks.length) % marks.length;
    focusCurrent(true);
  }

  function syncInputs(value, source) {
    if (topInput !== source) topInput.value = value;
    if (floatInput !== source) floatInput.value = value;
  }

  [topInput, floatInput].forEach(function (inp) {
    inp.addEventListener('input', function () {
      syncInputs(inp.value, inp);
      highlight(inp.value.trim());
    });
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (e.shiftKey) prev(); else next();
      }
      if (e.key === 'Escape') {
        inp.value = '';
        syncInputs('', inp);
        clearHighlights();
        updateCount();
        inp.blur();
      }
    });
  });

  if (floatBtn && floatWrap) {
    floatBtn.addEventListener('click', function () {
      var isOpen = floatWrap.classList.toggle('open');
      if (isOpen) floatInput.focus();
    });
  }

  document.addEventListener('click', function (e) {
    if (floatWrap && floatWrap.classList.contains('open') && !e.target.closest('.float-page-search')) {
      floatWrap.classList.remove('open');
    }
  });

  // collapse the top search bar into a floating icon once it scrolls out of view
  if (topBar && floatWrap && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        floatWrap.classList.toggle('show', !entry.isIntersecting);
        if (entry.isIntersecting) floatWrap.classList.remove('open');
      });
    }, { threshold: 0 });
    observer.observe(topBar);
  }
});
