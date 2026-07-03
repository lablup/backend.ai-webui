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

  function search(toks) {
    if (!idx) return [];
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

  /* Case-insensitive match ranges of `toks` within `text`, merged so that
   * overlapping/adjacent hits (e.g. CJK bigrams) collapse into one span.
   * Indices are computed on the lower-cased copy but applied to the
   * original text — safe because the scripts we tokenize preserve length
   * under toLowerCase(). */
  function matchRanges(text, toks) {
    var lower = text.toLowerCase();
    var ranges = [];
    toks.forEach(function (tok) {
      if (!tok) return;
      var from = 0;
      var i;
      while ((i = lower.indexOf(tok, from)) !== -1) {
        ranges.push([i, i + tok.length]);
        from = i + 1; // step by 1 so overlapping bigrams are all captured
      }
    });
    if (!ranges.length) return ranges;
    ranges.sort(function (a, b) {
      return a[0] - b[0];
    });
    var merged = [ranges[0].slice()];
    for (var k = 1; k < ranges.length; k++) {
      var last = merged[merged.length - 1];
      if (ranges[k][0] <= last[1]) {
        if (ranges[k][1] > last[1]) last[1] = ranges[k][1];
      } else {
        merged.push(ranges[k].slice());
      }
    }
    return merged;
  }

  /* Append `text` to `parent`, wrapping matched ranges in <mark>. Builds
   * DOM nodes (not innerHTML) so the same XSS-safe contract as textContent
   * is preserved. */
  function appendHighlighted(parent, text, toks) {
    var ranges = matchRanges(text, toks);
    if (!ranges.length) {
      parent.appendChild(document.createTextNode(text));
      return;
    }
    var pos = 0;
    ranges.forEach(function (rg) {
      if (rg[0] > pos)
        parent.appendChild(document.createTextNode(text.slice(pos, rg[0])));
      var m = document.createElement('mark');
      m.className = 'search-highlight';
      m.textContent = text.slice(rg[0], rg[1]);
      parent.appendChild(m);
      pos = rg[1];
    });
    if (pos < text.length)
      parent.appendChild(document.createTextNode(text.slice(pos)));
  }

  /* Build a ~120-char snippet window centred on the first matched token so
   * the highlighted term is actually visible; falls back to the head of the
   * body when nothing matches (e.g. title-only hits). */
  function buildSnippet(body, toks) {
    var text = body || '';
    if (!text) return '';
    var lower = text.toLowerCase();
    var first = -1;
    toks.forEach(function (tok) {
      if (!tok) return;
      var i = lower.indexOf(tok);
      if (i !== -1 && (first === -1 || i < first)) first = i;
    });
    var WINDOW = 120;
    var start = first > 40 ? first - 40 : 0;
    var slice = text.slice(start, start + WINDOW);
    return (
      (start > 0 ? '…' : '') +
      slice +
      (start + WINDOW < text.length ? '…' : '')
    );
  }

  function render(results, toks) {
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
      var snippet = buildSnippet(d.body, toks);
      var a = document.createElement('a');
      a.className = 'search-result-item';
      a.href = d.url;
      var t = document.createElement('div');
      t.className = 'search-result-title';
      appendHighlighted(t, d.title, toks);
      var s = document.createElement('div');
      s.className = 'search-result-snippet';
      appendHighlighted(s, snippet, toks);
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
      var toks = tokenize(q);
      render(search(toks), toks);
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
