document.addEventListener('DOMContentLoaded', function () {
  var input = document.getElementById('search-input');
  var results = document.getElementById('search-results');
  if (!input || !results || typeof SEARCH_INDEX === 'undefined') return;

  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function clearResults() {
    results.innerHTML = '';
    results.classList.remove('show');
  }

  function snippetAround(text, query) {
    var idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return esc(text.slice(0, 90)) + (text.length > 90 ? '…' : '');
    var start = Math.max(0, idx - 25);
    var end = Math.min(text.length, idx + query.length + 70);
    var snippet = (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '');
    return esc(snippet).replace(
      new RegExp(esc(query).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'ig'),
      function (m) { return '<mark>' + m + '</mark>'; }
    );
  }

  function render(items, q) {
    if (!items.length) {
      results.innerHTML = '<div class="search-empty">검색 결과가 없어요</div>';
      results.classList.add('show');
      return;
    }
    var hl = q ? ('?hl=' + encodeURIComponent(q)) : '';
    results.innerHTML = items.map(function (item) {
      return '<a class="search-item" href="' + item.page + hl + '#' + item.anchor + '">' +
        '<div class="search-item-path">' + esc(item.part) + '</div>' +
        '<div class="search-item-title">' + esc(item.title) + '</div>' +
        '<div class="search-item-snippet">' + item.snippet + '</div>' +
        '</a>';
    }).join('');
    results.classList.add('show');
  }

  input.addEventListener('input', function () {
    var q = input.value.trim();
    if (!q) { clearResults(); return; }
    var ql = q.toLowerCase();
    var matches = SEARCH_INDEX
      .map(function (item) {
        var titleHit = item.title.toLowerCase().indexOf(ql);
        var textHit = item.text.toLowerCase().indexOf(ql);
        if (titleHit === -1 && textHit === -1) return null;
        return {
          page: item.page,
          anchor: item.anchor,
          title: item.title,
          part: item.part,
          score: (titleHit !== -1 ? 0 : 1),
          snippet: snippetAround(titleHit !== -1 ? item.title : item.text, q)
        };
      })
      .filter(Boolean)
      .sort(function (a, b) { return a.score - b.score; })
      .slice(0, 15);
    render(matches, q);
  });

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { input.value = ''; clearResults(); input.blur(); }
    if (e.key === 'Enter') {
      var q = input.value.trim();
      if (q) window.location.href = 'search.html?q=' + encodeURIComponent(q);
    }
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.search-box')) clearResults();
  });
});
