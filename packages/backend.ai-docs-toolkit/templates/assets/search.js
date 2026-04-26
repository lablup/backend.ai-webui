/* docs-toolkit client search.
 * Loads search-index.json (relative), tokenizes queries with CJK bigram
 * + Thai bigram support, and renders results in a dropdown.
 *
 * Localized strings (placeholder, "no results", etc.) are owned by the page
 * — this script reads `noResults` from `#search-input[data-no-results]` so
 * the script itself stays language-agnostic and can be content-hashed once
 * and shared across every page.
 *
 * Behavior must stay byte-identical with the previously inlined IIFE:
 *   - CJK + Thai bigram tokenization
 *   - Latin word split with min-length 2
 *   - 200ms debounce on input
 *   - Cmd-K / Ctrl-K focus shortcut
 *   - Escape blurs and hides results
 *   - URL allow-list ('./...' or '/...') guards rendered links
 */
(function () {
  var CJK = /[一-鿿가-힯぀-ゟ゠-ヿ]/;
  var THAI = /[฀-๿]/;
  var idx = null;
  var inp = document.getElementById('search-input');
  var res = document.getElementById('search-results');
  if (!inp || !res) return;
  var noResultsText =
    (inp.getAttribute('data-no-results') || 'No results found');

  function tokenize(t) {
    var tokens = [];
    var s = t.toLowerCase();
    var seg = '';
    var tp = 'l';
    function flush() {
      if (!seg) return;
      if (tp === 'c' || tp === 't') {
        for (var i = 0; i < seg.length - 1; i++) tokens.push(seg.slice(i, i + 2));
        if (seg.length === 1) tokens.push(seg);
      } else {
        seg.split(/[^\p{L}\p{N}]+/u).forEach(function (w) {
          if (w.length >= 2) tokens.push(w);
        });
      }
      seg = '';
    }
    for (var i = 0; i < s.length; i++) {
      var ch = s[i];
      if (CJK.test(ch)) {
        if (tp !== 'c') {
          flush();
          tp = 'c';
        }
        seg += ch;
      } else if (THAI.test(ch)) {
        if (tp !== 't') {
          flush();
          tp = 't';
        }
        seg += ch;
      } else {
        if (tp !== 'l') {
          flush();
          tp = 'l';
        }
        seg += ch;
      }
    }
    flush();
    return tokens;
  }

  function search(q) {
    if (!idx) return [];
    var toks = tokenize(q);
    if (!toks.length) return [];
    var scores = {};
    toks.forEach(function (tok) {
      var entries = idx.index[tok];
      if (!entries) return;
      entries.forEach(function (e) {
        scores[e.doc] = (scores[e.doc] || 0) + e.freq;
      });
    });
    return Object.keys(scores)
      .map(function (d) {
        return { doc: +d, score: scores[d] };
      })
      .sort(function (a, b) {
        return b.score - a.score;
      })
      .slice(0, 10);
  }

  function render(results) {
    while (res.firstChild) res.removeChild(res.firstChild);
    if (!results.length) {
      var nr = document.createElement('div');
      nr.className = 'search-no-results';
      nr.textContent = noResultsText;
      res.appendChild(nr);
      res.hidden = false;
      return;
    }
    results.forEach(function (r) {
      var d = idx.documents[r.doc];
      if (!d) return;
      if (
        typeof d.url !== 'string' ||
        !(d.url.startsWith('./') || d.url.startsWith('/'))
      )
        return;
      var snippet = (d.body || '').slice(0, 100) + '...';
      var a = document.createElement('a');
      a.className = 'search-result-item';
      a.href = d.url;
      var t = document.createElement('div');
      t.className = 'search-result-title';
      t.textContent = d.title;
      var s = document.createElement('div');
      s.className = 'search-result-snippet';
      s.textContent = snippet;
      a.appendChild(t);
      a.appendChild(s);
      res.appendChild(a);
    });
    res.hidden = false;
  }

  var timer;
  inp.addEventListener('input', function () {
    clearTimeout(timer);
    var q = inp.value.trim();
    if (!q) {
      res.hidden = true;
      return;
    }
    timer = setTimeout(function () {
      var r = search(q);
      render(r);
    }, 200);
  });
  inp.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      res.hidden = true;
      inp.blur();
    }
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.doc-search')) res.hidden = true;
  });
  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      inp.focus();
    }
  });
  fetch('./search-index.json')
    .then(function (r) {
      return r.json();
    })
    .then(function (d) {
      idx = d;
    })
    .catch(function (err) {
      console.error('Failed to load search-index.json', err);
    });
})();
