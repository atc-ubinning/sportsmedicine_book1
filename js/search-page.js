document.addEventListener('DOMContentLoaded', function () {
  var input = document.getElementById('search-page-input');
  var resultsEl = document.getElementById('search-page-results');
  var titleEl = document.getElementById('search-page-title');
  if (!resultsEl || typeof SEARCH_INDEX === 'undefined') return;

  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function snippetAround(text, query) {
    var idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return esc(text.slice(0, 160)) + (text.length > 160 ? '…' : '');
    var start = Math.max(0, idx - 40);
    var end = Math.min(text.length, idx + query.length + 160);
    var snippet = (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '');
    return esc(snippet).replace(
      new RegExp(esc(query).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'ig'),
      function (m) { return '<mark>' + m + '</mark>'; }
    );
  }

  function runSearch(q) {
    q = (q || '').trim();
    if (!q) {
      if (titleEl) titleEl.textContent = '검색';
      resultsEl.innerHTML = '<div class="search-empty">검색어를 입력해주세요.</div>';
      return;
    }
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
      .sort(function (a, b) { return a.score - b.score; });

    if (titleEl) titleEl.textContent = '"' + q + '" 검색 결과 (' + matches.length + '건)';

    if (!matches.length) {
      resultsEl.innerHTML = '<div class="search-empty">일치하는 내용이 없어요. 다른 검색어로 시도해보세요.</div>';
      return;
    }
    var hl = '?hl=' + encodeURIComponent(q);
    resultsEl.innerHTML = matches.map(function (item) {
      return '<a class="search-page-item" href="' + item.page + hl + '#' + item.anchor + '">' +
        '<div class="search-page-item-path">' + esc(item.part) + '</div>' +
        '<div class="search-page-item-title">' + esc(item.title) + '</div>' +
        '<div class="search-page-item-snippet">' + item.snippet + '</div>' +
        '</a>';
    }).join('');
  }

  var q0 = new URLSearchParams(window.location.search).get('q') || '';
  if (input) input.value = q0;
  runSearch(q0);

  if (input) {
    input.focus();
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        var q = input.value.trim();
        var url = 'search.html' + (q ? ('?q=' + encodeURIComponent(q)) : '');
        history.replaceState(null, '', url);
        runSearch(q);
      }
    });
  }
});
