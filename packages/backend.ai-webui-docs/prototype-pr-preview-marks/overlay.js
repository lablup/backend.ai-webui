/* PROTOTYPE (FR-3882) — throwaway, not production.
 * Change marks (variants A/B/C), hover diff view, change navigator (D) and the
 * prototype-only variant switcher for the docs PR preview.
 * Reads `<slug>.changes.json` next to the page and `../changes-manifest.json`.
 */
(() => {
  'use strict';
  const VARIANTS = [
    ['A', 'Highlighter'],
    ['B', 'Gutter bar'],
    ['C', 'Track changes'],
  ];
  const params = new URLSearchParams(location.search);
  let variant = (params.get('variant') || 'A').toUpperCase();
  if (!VARIANTS.some((v) => v[0] === variant)) variant = 'A';
  let marksOn = params.get('marks') !== 'off';
  // 'inline' | 'sbs' chosen by the user in a popover; remembered across pages
  let modeOverride = null;
  try { modeOverride = localStorage.getItem('bai-pr-preview:mode') || null; } catch { /* private mode */ }
  const setMode = (m) => { modeOverride = m; try { localStorage.setItem('bai-pr-preview:mode', m); } catch { /* ignore */ } };

  const script = document.currentScript || document.querySelector('script[data-page]');
  const slug = (script && script.dataset.page) || location.pathname.split('/').pop().replace(/\.html$/, '');
  const segs = location.pathname.split('/');
  const lang = segs[segs.length - 2];
  const KIND_LABEL = { paragraph: 'paragraph', heading: 'heading', 'list-item': 'list item', 'table-row': 'table row', image: 'image', code: 'code block', 'admonition-title': 'admonition', summary: 'summary', other: 'block' };

  const $ = (sel, root = document) => root.querySelector(sel);
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const withParams = (href) => {
    try {
      const u = new URL(href, location.href);
      if (u.origin !== location.origin || !/\.html$/.test(u.pathname)) return href;
      u.searchParams.set('variant', variant);
      if (!marksOn) u.searchParams.set('marks', 'off'); else u.searchParams.delete('marks');
      return u.pathname + u.search + u.hash;
    } catch { return href; }
  };

  Promise.all([
    fetch(`./${slug}.changes.json`).then((r) => (r.ok ? r.json() : { status: 'unchanged', changes: [], counts: { total: 0 } })),
    fetch('../changes-manifest.json').then((r) => (r.ok ? r.json() : null)),
  ]).then(([page, manifest]) => init(page, manifest)).catch((e) => console.error('[bai-pr-preview]', e));

  function init(page, manifest) {
    const section = $('section.chapter');
    const originals = new Map();
    let marks = []; // [{change, el}] in document order
    let current = -1;

    // ---------------------------------------------------------- viewed state (localStorage)
    // Keyed by content fingerprint, so a change that is edited in a later push
    // no longer matches and drops back to unviewed; fingerprints that vanished
    // are counted as "changed since you viewed them" and pruned.
    const storeKey = (l, s) => `bai-pr-viewed:${manifest && manifest.label ? manifest.label : 'pr'}:${l}/${s}`;
    const readViewed = (l, s) => { try { return new Set(JSON.parse(localStorage.getItem(storeKey(l, s)) || '[]')); } catch { return new Set(); } };
    const writeViewed = (l, s, set) => { try { localStorage.setItem(storeKey(l, s), JSON.stringify([...set])); } catch { /* private mode */ } };
    const viewed = readViewed(lang, slug);
    const live = new Set((page.changes || []).map((c) => c.fingerprint));
    const staleViewed = [...viewed].filter((f) => !live.has(f)).length;
    if (staleViewed) { for (const f of [...viewed]) if (!live.has(f)) viewed.delete(f); writeViewed(lang, slug, viewed); }
    const isViewed = (change) => viewed.has(change.fingerprint);
    function setViewed(change, on) {
      if (on) viewed.add(change.fingerprint); else viewed.delete(change.fingerprint);
      writeViewed(lang, slug, viewed);
      const m = marks.find((x) => x.change === change);
      if (m) m.el.classList.toggle('bai-viewed', on);
      updatePos();
      if (!panel.hidden) renderPanel();
    }
    const viewedCountOf = (p) => { if (!p.fingerprints) return 0; const s = readViewed(lang, p.slug); return p.fingerprints.filter((f) => s.has(f)).length; };

    // ---------------------------------------------------------- copyable reference
    const pageUrl = () => { const u = new URL(location.href); u.hash = ''; return u.origin + u.pathname + u.search; };
    const refText = (change) => {
      const lines = [`[docs-preview] ${lang}/${slug} · change ${change.id}/${page.changes.length} · ${change.type} ${KIND_LABEL[change.blockKind] || change.blockKind}`];
      lines.push(`- file: ${page.sourcePath || `packages/backend.ai-webui-docs/src/${lang}/${slug}/${slug}.md`}${change.line ? `:${change.line}` : ''}`);
      if (change.section) lines.push(`- section: "${change.section.text}"${change.section.id ? ` (#${change.section.id})` : ''}`);
      lines.push(`- page: ${pageUrl()}#bai-change-${change.id}`);
      if (change.blockKind === 'image') {
        lines.push(`- image: ${change.newText || change.oldText} (${change.type === 'modified' ? 'replaced' : change.type})`);
      } else {
        if (change.oldText) lines.push(`- old: ${change.oldText}`);
        if (change.newText) lines.push(`- new: ${change.newText}`);
      }
      return lines.join('\n');
    };
    const pageSummaryText = () => [`[docs-preview] ${lang}/${slug} — ${page.title} · ${page.changes.length} changes`, `- file: ${page.sourcePath}`, `- page: ${pageUrl()}`, ...page.changes.map((c) => `${isViewed(c) ? '[x]' : '[ ]'} #${c.id} ${c.type} ${KIND_LABEL[c.blockKind] || c.blockKind}${c.line ? ` (line ${c.line})` : ''}${c.section ? ` — ${c.section.text}` : ''}: ${(c.newText || c.oldText).slice(0, 100)}${(c.newText || c.oldText).length > 100 ? '…' : ''}`)].join('\n');
    async function copy(text, btn) {
      try { await navigator.clipboard.writeText(text); } catch {
        const ta = el('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
      }
      if (btn) { const old = btn.textContent; btn.textContent = 'Copied'; btn.classList.add('bai-copied'); setTimeout(() => { btn.textContent = old; btn.classList.remove('bai-copied'); }, 1200); }
    }

    // ---------------------------------------------------------- marks
    const blockEl = (idx) => (idx == null || idx < 0 ? null : $(`[data-bai-block="${idx}"]`));
    const wrapInline = (change, inner) => {
      switch (change.blockKind) {
        case 'table-row': return `<table><tbody><tr>${inner}</tr></tbody></table>`;
        case 'list-item': return `<ul><li>${inner}</li></ul>`;
        case 'code': return `<pre>${inner}</pre>`;
        case 'heading': return `<${change.tag}>${inner}</${change.tag}>`;
        default: return `<p>${inner}</p>`;
      }
    };
    const imagePair = (change, cls = '') => {
      const col = (label, src) => `<div><div class="bai-col-label">${label}</div>${src ? `<img class="bai-popover__img ${cls}" src="${src}" data-bai-zoom="${change.id}" />` : '<em>—</em>'}</div>`;
      return `<div class="bai-popover__sbs">${col('Old', change.oldImage)}${col('New', change.newImage)}</div>`;
    };

    function placeholderFor(change) {
      const short = change.oldText.length > 140 ? change.oldText.slice(0, 140) + '…' : change.oldText;
      let node;
      if (change.blockKind === 'table-row') {
        node = el('tr', 'bai-removed-placeholder');
        if (variant === 'C') node.innerHTML = change.oldHtml;
        else node.innerHTML = `<td colspan="20"><span class="bai-removed-text">${esc(short)}</span></td>`;
      } else if (change.blockKind === 'image') {
        node = el('figure', 'bai-removed-placeholder', variant === 'C' ? `<img src="${change.oldImage}" style="max-width:100%" />` : `<span class="bai-removed-text">${esc(change.oldText)}</span>`);
      } else {
        const tag = change.blockKind === 'list-item' ? 'li' : change.blockKind === 'heading' ? change.tag : 'div';
        node = el(tag, 'bai-removed-placeholder', variant === 'C' ? change.oldHtml : `<span class="bai-removed-text">${esc(short)}</span>`);
      }
      node.dataset.baiChange = change.id;
      node.dataset.baiType = 'removed';
      return node;
    }

    function restore() {
      for (const [node, html] of originals) node.innerHTML = html;
      originals.clear();
      document.querySelectorAll('.bai-removed-placeholder').forEach((n) => n.remove());
      document.querySelectorAll('[data-bai-change]').forEach((n) => { delete n.dataset.baiChange; delete n.dataset.baiType; });
      document.body.classList.remove('bai-variant-A', 'bai-variant-B', 'bai-variant-C');
    }

    function apply() {
      restore();
      document.body.classList.add(`bai-variant-${variant}`);
      document.body.classList.toggle('bai-marks-off', !marksOn);
      marks = [];
      if (page.status !== 'modified' || !section) return;
      for (const change of page.changes) {
        let node;
        if (change.type === 'removed') {
          node = placeholderFor(change);
          const after = blockEl(change.insertAfter);
          if (after) {
            // an <li>/<tr> placeholder must stay inside its list/table; anything else goes after the block
            if (change.blockKind === 'table-row' && after.tagName !== 'TR') { const tbody = after.querySelector('tbody, tr')?.closest('table'); (tbody || after).after(node); }
            else after.after(node);
          } else section.prepend(node);
        } else {
          node = blockEl(change.anchor);
          if (!node) continue;
          node.dataset.baiChange = change.id;
          node.dataset.baiType = change.type;
          if (variant === 'C' && change.type === 'modified') {
            originals.set(node, node.innerHTML);
            if (change.blockKind === 'image') {
              const cap = node.querySelector('figcaption');
              node.innerHTML = `<div class="bai-inline-image-pair"><div>Old<br><img src="${change.oldImage}" /></div><div>New<br><img src="${change.newImage}" /></div></div>${cap ? cap.outerHTML : ''}`;
            } else node.innerHTML = change.diffHtml;
          }
        }
        node.classList.toggle('bai-viewed', isViewed(change));
        marks.push({ change, el: node });
      }
      marks.sort((a, b) => (a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
      updatePos();
    }

    // ---------------------------------------------------------- popover (A, B)
    const pop = el('div', 'bai-popover');
    pop.hidden = true;
    document.body.appendChild(pop);
    let pinned = null, hovered = null, hoverTimer = 0, hideTimer = 0;
    // the change a shortcut acts on: pinned popover, else the hovered block, else the last one jumped to
    const changeOf = (node) => node && page.changes.find((c) => String(c.id) === node.dataset.baiChange);
    const activeChange = () => changeOf(pinned) || changeOf(hovered) || (current >= 0 && marks[current] ? marks[current].change : null);
    let toastTimer = 0;
    const toast = el('div', 'bai-toast');
    toast.hidden = true;
    document.body.appendChild(toast);
    const showToast = (text) => { toast.textContent = text; toast.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { toast.hidden = true; }, 1200); };

    function autoMode(change) {
      if (modeOverride) return modeOverride;
      const w = change.words || 0;
      if (change.blockKind === 'table-row' || change.blockKind === 'list-item' || change.blockKind === 'code') return w > 40 ? 'sbs' : 'inline';
      return w > 120 ? 'sbs' : 'inline';
    }

    function render(change) {
      const type = change.type;
      const kind = KIND_LABEL[change.blockKind] || change.blockKind;
      let modeHtml = '', body = '';
      if (change.blockKind === 'image') {
        body = imagePair(change);
      } else if (type === 'modified') {
        const mode = autoMode(change);
        modeHtml = `<span class="bai-popover__mode"><button data-mode="inline" aria-pressed="${mode === 'inline'}">Inline</button><button data-mode="sbs" aria-pressed="${mode === 'sbs'}">Side by side</button></span>`;
        body = mode === 'inline'
          ? wrapInline(change, change.diffHtml)
          : `<div class="bai-popover__sbs"><div class="bai-col--old"><div class="bai-col-label">Old</div>${wrapInline(change, change.oldHtml)}</div><div class="bai-col--new"><div class="bai-col-label">New</div>${wrapInline(change, change.newHtml)}</div></div>`;
      } else if (type === 'added') {
        body = `<div class="bai-popover__sbs" style="grid-template-columns:1fr"><div class="bai-col--new"><div class="bai-col-label">New</div>${wrapInline(change, change.newHtml)}</div></div>`;
      } else {
        body = `<div class="bai-popover__sbs" style="grid-template-columns:1fr"><div class="bai-col--old"><div class="bai-col-label">Old</div>${wrapInline(change, change.oldHtml)}</div></div>`;
      }
      const where = `${page.sourcePath ? page.sourcePath.split('/').slice(-1)[0] : ''}${change.line ? `:${change.line}` : ''}${change.section ? ` · ${esc(change.section.text)}` : ''}`;
      pop.innerHTML = `<div class="bai-popover__head"><span class="bai-popover__type bai-popover__type--${type}">${type}</span><span class="bai-popover__kind">${kind}${change.similarity != null ? ` · ${Math.round(change.similarity * 100)}% similar` : ''}</span><span class="bai-popover__spacer"></span>${modeHtml}<button class="bai-popover__btn" data-copy title="Copy a reference to this change (file:line, section, link, old/new)">Copy ref</button><label class="bai-popover__viewed" title="Mark as viewed (v)"><input type="checkbox" data-viewed ${isViewed(change) ? 'checked' : ''}/> Viewed</label></div><div class="bai-popover__body">${body}</div><div class="bai-popover__hint"><span class="bai-popover__where">#${change.id} · ${where}</span>${change.blockKind === 'image' ? 'Click an image to enlarge · ' : ''}Click the block to pin · <kbd>c</kbd> copy ref · <kbd>v</kbd> viewed · Esc to close</div>`;
      pop.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => { setMode(b.dataset.mode); render(change); }));
      pop.querySelectorAll('[data-bai-zoom]').forEach((img) => img.addEventListener('click', () => lightbox(change)));
      $('[data-copy]', pop).addEventListener('click', (e) => copy(refText(change), e.currentTarget));
      $('[data-viewed]', pop).addEventListener('change', (e) => setViewed(change, e.target.checked));
    }

    function position(target) {
      const r = target.getBoundingClientRect();
      pop.style.left = '0px'; pop.style.top = '0px';
      const pw = pop.offsetWidth, ph = pop.offsetHeight;
      let left = Math.min(Math.max(8, r.left), window.innerWidth - pw - 8);
      let top = r.bottom + 8;
      if (top + ph > window.innerHeight - 8) top = Math.max(8, r.top - ph - 8);
      pop.style.left = `${left}px`; pop.style.top = `${top}px`;
    }
    function show(target) {
      const change = page.changes.find((c) => String(c.id) === target.dataset.baiChange);
      if (!change) return;
      current = marks.findIndex((m) => m.change === change);
      updatePos();
      render(change);
      pop.hidden = false;
      position(target);
    }
    function hide() { hovered = null; if (pinned) return; pop.hidden = true; }

    document.addEventListener('mouseover', (e) => {
      if (variant === 'C') return;
      const t = e.target.closest('[data-bai-change]');
      if (t) { hovered = t; clearTimeout(hideTimer); clearTimeout(hoverTimer); if (!pinned) hoverTimer = setTimeout(() => show(t), 120); return; }
      if (e.target.closest('.bai-popover')) { clearTimeout(hideTimer); return; }
    });
    document.addEventListener('mouseout', (e) => {
      if (variant === 'C') return;
      if (e.target.closest('[data-bai-change]') || e.target.closest('.bai-popover')) { clearTimeout(hoverTimer); clearTimeout(hideTimer); hideTimer = setTimeout(hide, 220); }
    });
    document.addEventListener('click', (e) => {
      if (e.target.closest('.bai-popover') || e.target.closest('.bai-nav') || e.target.closest('.bai-switcher')) return;
      const t = e.target.closest('[data-bai-change]');
      if (t && variant !== 'C' && !e.target.closest('a')) {
        if (pinned === t) { pinned = null; pop.hidden = true; } else { pinned = t; show(t); }
        return;
      }
      if (pinned) { pinned = null; pop.hidden = true; }
      const a = e.target.closest('a[href]');
      if (a && !a.target) { const h = withParams(a.getAttribute('href')); if (h !== a.getAttribute('href')) a.setAttribute('href', h); }
    });

    function lightbox(change) {
      const box = el('div', 'bai-lightbox', `<div class="bai-lightbox__pair"><div>Old<br><img src="${change.oldImage || ''}" /></div><div>New<br><img src="${change.newImage || ''}" /></div></div>`);
      box.addEventListener('click', () => box.remove());
      document.body.appendChild(box);
    }

    // ---------------------------------------------------------- navigator (D)
    const summary = manifest && manifest.langs[lang] ? manifest.langs[lang] : { totals: { pages: 0, changes: 0 }, pages: [] };
    const nav = el('div', 'bai-nav');
    nav.innerHTML = `<div class="bai-nav__panel" hidden></div><div class="bai-nav__badge"><strong>${summary.totals.pages} pages · ${summary.totals.changes} changes</strong><span class="bai-nav__pos"></span><button data-nav="prev" title="Previous change ([)">‹</button><button data-nav="next" title="Next change (])">›</button><button data-nav="panel" title="Changed pages">☰</button></div>`;
    document.body.appendChild(nav);
    const panel = $('.bai-nav__panel', nav);
    const posEl = $('.bai-nav__pos', nav);
    const pageIdx = summary.pages.findIndex((p) => p.slug === slug);

    function renderPanel() {
      const rows = summary.pages.map((p, i) => {
        const tag = p.status === 'new' ? '<span class="bai-nav__tag bai-nav__tag--new">NEW</span>' : p.status === 'deleted' ? '<span class="bai-nav__tag bai-nav__tag--deleted">DELETED</span>' : '';
        const demo = p.demo ? '<span class="bai-nav__tag bai-nav__tag--demo">demo</span>' : '';
        const href = p.status === 'deleted' ? withParams(p.baseUrl) : withParams(`./${p.slug}.html#bai-change-1`);
        const v = viewedCountOf(p);
        const count = p.status === 'modified' ? `<span class="bai-nav__count${v === p.counts.total ? ' bai-nav__count--done' : ''}" title="viewed / total">${v}/${p.counts.total}</span>` : '';
        return `<a class="bai-nav__row${i === pageIdx ? ' bai-nav__row--current' : ''}${p.status === 'deleted' ? ' bai-nav__row--deleted' : ''}" href="${href}">${tag}${demo}<span class="bai-nav__title">${esc(p.title)}</span>${count}</a>`;
      }).join('');
      const langs = manifest ? Object.entries(manifest.langs).map(([l, s]) => {
        const target = s.pages.some((p) => p.slug === slug) ? slug : (s.pages[0] && s.pages[0].status !== 'deleted' ? s.pages[0].slug : slug);
        return `<a class="${l === lang ? 'bai-nav__lang--current' : ''}" href="${withParams(`../${l}/${target}.html`)}">${l} · ${s.totals.changes}</a>`;
      }).join('') : '';
      const actions = marks.length ? `<div class="bai-nav__actions"><button data-act="copy-page">Copy page summary</button><button data-act="all-viewed">Mark all viewed</button><button data-act="reset-viewed">Reset</button></div>` : '';
      const stale = staleViewed ? `<div class="bai-nav__stale">${staleViewed} change${staleViewed > 1 ? 's' : ''} you had viewed ${staleViewed > 1 ? 'have' : 'has'} changed since — shown as unviewed again</div>` : '';
      panel.innerHTML = `<div class="bai-nav__section">Changed pages${manifest && manifest.label ? ` — ${esc(manifest.label)}` : ''}</div>${rows || '<div class="bai-nav__row"><em>No page changed — toolkit-only preview</em></div>'}${stale}${actions}<div class="bai-nav__section">Languages</div><div class="bai-nav__lang">${langs}</div>`;
      panel.querySelectorAll('[data-act]').forEach((b) => b.addEventListener('click', (e) => {
        const act = b.dataset.act;
        if (act === 'copy-page') copy(pageSummaryText(), e.currentTarget);
        else { for (const m of marks) { if (act === 'all-viewed') viewed.add(m.change.fingerprint); else viewed.delete(m.change.fingerprint); m.el.classList.toggle('bai-viewed', act === 'all-viewed'); } writeViewed(lang, slug, viewed); updatePos(); renderPanel(); }
      }));
    }

    function updatePos() {
      const v = marks.filter((m) => isViewed(m.change)).length;
      posEl.textContent = marks.length ? `${current < 0 ? '–' : current + 1} / ${marks.length}${v ? ` · ${v} viewed` : ''}` : page.status === 'new' ? 'new page' : 'no marks';
      posEl.classList.toggle('bai-nav__pos--done', marks.length > 0 && v === marks.length);
    }
    function jumpTo(i, flash = true) {
      if (!marks.length) return;
      current = (i + marks.length) % marks.length;
      const target = marks[current].el;
      target.scrollIntoView({ block: 'center', behavior: 'smooth' });
      if (flash) {
        document.querySelectorAll('.bai-flash').forEach((n) => n.classList.remove('bai-flash', 'bai-flash--fade'));
        target.classList.add('bai-flash');
        setTimeout(() => target.classList.add('bai-flash--fade'), 900);
        setTimeout(() => target.classList.remove('bai-flash', 'bai-flash--fade'), 2200);
      }
      updatePos();
    }
    function step(dir) {
      const next = current + dir;
      if (marks.length && next >= 0 && next < marks.length) return jumpTo(next);
      // cross-page: hop to the neighbouring changed page (skipping deleted ones)
      const pages = summary.pages.filter((p) => p.status !== 'deleted');
      const here = pages.findIndex((p) => p.slug === slug);
      const target = pages[(here + dir + pages.length) % pages.length];
      if (!target || target.slug === slug) return marks.length ? jumpTo(next) : undefined;
      location.href = withParams(`./${target.slug}.html#bai-change-${dir > 0 ? '1' : 'last'}`);
    }
    nav.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-nav]');
      if (!b) return;
      if (b.dataset.nav === 'prev') step(-1);
      else if (b.dataset.nav === 'next') step(1);
      else { renderPanel(); panel.hidden = !panel.hidden; }
    });

    // sidebar badges + page banner
    for (const p of summary.pages) {
      const a = document.querySelector(`.doc-sidebar-nav a[href="./${p.slug}.html"]`);
      if (!a) continue;
      const badge = el('span', `bai-nav-badge bai-nav-badge--${p.status}`, p.status === 'new' ? 'NEW' : p.status === 'deleted' ? 'DEL' : String(p.counts.total));
      a.appendChild(badge);
    }
    if (section && (page.status === 'new' || page.status === 'deleted')) {
      const banner = el('div', `bai-page-banner bai-page-banner--${page.status}`, page.status === 'new'
        ? `<span class="bai-nav__tag bai-nav__tag--new">NEW</span>This page is added by this PR — everything on it is new, so no block marks are shown.${page.demo ? ' <em>(demo: simulated)</em>' : ''}`
        : `<span class="bai-nav__tag bai-nav__tag--deleted">DELETED</span>This page is removed by this PR. It is listed in the change navigator only.${page.demo ? ' <em>(demo: simulated — the page is still present here)</em>' : ''}`);
      section.before(banner);
    }

    // ---------------------------------------------------------- prototype switcher
    const bar = el('div', 'bai-switcher');
    bar.innerHTML = `<span class="bai-switcher__proto">PROTOTYPE</span><button data-sw="prev" title="Previous variant (←)">◀</button><span class="bai-switcher__label"></span><button data-sw="next" title="Next variant (→)">▶</button><button class="bai-switcher__toggle" data-sw="marks" aria-pressed="${marksOn}">marks</button>`;
    document.body.appendChild(bar);
    const label = $('.bai-switcher__label', bar);
    function syncUrl() {
      const u = new URL(location.href);
      u.searchParams.set('variant', variant);
      if (!marksOn) u.searchParams.set('marks', 'off'); else u.searchParams.delete('marks');
      history.replaceState(null, '', u);
      const v = VARIANTS.find((x) => x[0] === variant);
      label.innerHTML = `<b>${v[0]}</b> — ${v[1]}`;
      $('[data-sw="marks"]', bar).setAttribute('aria-pressed', String(marksOn));
    }
    function setVariant(v) { variant = v; pinned = null; pop.hidden = true; syncUrl(); apply(); }
    function cycle(dir) { const i = VARIANTS.findIndex((x) => x[0] === variant); setVariant(VARIANTS[(i + dir + VARIANTS.length) % VARIANTS.length][0]); }
    bar.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-sw]');
      if (!b) return;
      if (b.dataset.sw === 'prev') cycle(-1);
      else if (b.dataset.sw === 'next') cycle(1);
      else { marksOn = !marksOn; syncUrl(); apply(); }
    });
    document.addEventListener('keydown', (e) => {
      if (e.target instanceof Element && e.target.closest('input, textarea, select, [contenteditable]')) return;
      // physical key codes, so the shortcuts also work while a Korean/Japanese IME is active (e.key would be 'ㅊ', 'ㅍ', …)
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const code = e.code || '';
      if (code === 'ArrowLeft') cycle(-1);
      else if (code === 'ArrowRight') cycle(1);
      else if (code === 'BracketLeft') step(-1);
      else if (code === 'BracketRight') step(1);
      else if (code === 'KeyV') { const c = activeChange(); if (!c) return; e.preventDefault(); setViewed(c, !isViewed(c)); if (!pop.hidden) render(c); showToast(isViewed(c) ? `#${c.id} viewed` : `#${c.id} unviewed`); }
      else if (code === 'KeyC') { const c = activeChange(); if (!c) return; e.preventDefault(); copy(refText(c), pop.hidden ? null : $('[data-copy]', pop)); showToast(`Copied ref #${c.id}`); }
      else if (code === 'Escape') { pinned = null; pop.hidden = true; panel.hidden = true; document.querySelectorAll('.bai-lightbox').forEach((n) => n.remove()); }
    });

    // ---------------------------------------------------------- go
    syncUrl();
    apply();
    const m = location.hash.match(/^#bai-change-(\d+|last)$/);
    if (m && marks.length) {
      const i = m[1] === 'last' ? marks.length - 1 : Math.max(0, Math.min(marks.length - 1, Number(m[1]) - 1));
      setTimeout(() => jumpTo(i), 50);
    }
  }
})();
