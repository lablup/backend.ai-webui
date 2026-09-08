/**
 * PR preview overlay (FR-3879).
 *
 * Marks the blocks a PR changed on the published docs page, shows a
 * word-level diff on hover, and offers a per-language change navigator.
 * Reads `<slug>.changes.json` next to the page and `../changes-manifest.json`;
 * a 404 on either leaves the page untouched.
 */
(() => {
  'use strict';

  const script =
    document.currentScript || document.querySelector('script[data-page]');
  const slug =
    (script && script.dataset.page) ||
    location.pathname.split('/').pop().replace(/\.html$/, '');
  const segs = location.pathname.split('/');
  const lang = segs[segs.length - 2];

  const KIND_LABEL = {
    paragraph: 'paragraph',
    heading: 'heading',
    'list-item': 'list item',
    'table-row': 'table row',
    image: 'image',
    code: 'code block',
    'admonition-title': 'admonition',
    summary: 'summary',
    other: 'block',
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const el = (tag, cls, html) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  };
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

  // Inline / side-by-side choice, remembered across pages.
  let modeOverride = null;
  try {
    modeOverride = localStorage.getItem('bai-pr-preview:mode') || null;
  } catch {
    /* private mode */
  }
  const setMode = (m) => {
    modeOverride = m;
    try {
      localStorage.setItem('bai-pr-preview:mode', m);
    } catch {
      /* private mode */
    }
  };

  Promise.all([
    fetch(`./${slug}.changes.json`).then((r) =>
      r.ok ? r.json() : { status: 'unchanged', changes: [], counts: { total: 0 } },
    ),
    fetch('../changes-manifest.json').then((r) => (r.ok ? r.json() : null)),
  ])
    .then(([page, manifest]) => {
      if (manifest) init(page, manifest);
    })
    .catch(() => {
      /* no preview data — the page renders normally */
    });

  function init(page, manifest) {
    const section = $('section.chapter');
    let marks = [];
    let current = -1;
    let marksOn = true;

    // ---------------------------------------------------------- viewed state
    // Scoped to the deployment root (`/pr/<n>/docs/` on gh-pages, else the
    // channel directory) so it survives new pushes to the same PR.
    const scope = (() => {
      const p = location.pathname;
      const i = p.indexOf('/docs/');
      if (i >= 0) return p.slice(0, i + 6);
      const parts = p.split('/');
      parts.pop();
      parts.pop();
      return `${parts.join('/')}/`;
    })();
    const storeKey = (l, s) => `bai-pr-viewed:${scope}:${l}/${s}`;
    const readViewed = (l, s) => {
      try {
        return new Set(JSON.parse(localStorage.getItem(storeKey(l, s)) || '[]'));
      } catch {
        return new Set();
      }
    };
    const writeViewed = (l, s, set) => {
      try {
        localStorage.setItem(storeKey(l, s), JSON.stringify([...set]));
      } catch {
        /* private mode */
      }
    };
    const viewed = readViewed(lang, slug);
    const live = new Set((page.changes || []).map((c) => c.fingerprint));
    const staleViewed = [...viewed].filter((f) => !live.has(f)).length;
    if (staleViewed) {
      for (const f of [...viewed]) if (!live.has(f)) viewed.delete(f);
      writeViewed(lang, slug, viewed);
    }
    const isViewed = (change) => viewed.has(change.fingerprint);
    function setViewed(change, on) {
      if (on) viewed.add(change.fingerprint);
      else viewed.delete(change.fingerprint);
      writeViewed(lang, slug, viewed);
      const m = marks.find((x) => x.change === change);
      if (m) m.el.classList.toggle('bai-viewed', on);
      updatePos();
      if (!panel.hidden) renderPanel();
    }
    const viewedCountOf = (p) => {
      if (!p.fingerprints) return 0;
      const s = readViewed(lang, p.slug);
      return p.fingerprints.filter((f) => s.has(f)).length;
    };

    // ---------------------------------------------------------- copyable reference
    const pageUrl = () => {
      const u = new URL(location.href);
      return u.origin + u.pathname + u.search;
    };
    const refText = (change) => {
      const lines = [
        `[docs-preview] ${lang}/${slug} · change ${change.id}/${page.changes.length} · ${change.type} ${KIND_LABEL[change.blockKind] || change.blockKind}`,
      ];
      lines.push(
        `- file: ${page.sourcePath || `${lang}/${slug}/${slug}.md`}${change.line ? `:${change.line}` : ''}`,
      );
      if (change.section)
        lines.push(
          `- section: "${change.section.text}"${change.section.id ? ` (#${change.section.id})` : ''}`,
        );
      lines.push(`- page: ${pageUrl()}#bai-change-${change.id}`);
      if (change.blockKind === 'image') {
        lines.push(
          `- image: ${change.newText || change.oldText} (${change.type === 'modified' ? 'replaced' : change.type})`,
        );
      } else {
        if (change.oldText) lines.push(`- old: ${change.oldText}`);
        if (change.newText) lines.push(`- new: ${change.newText}`);
      }
      return lines.join('\n');
    };
    const pageSummaryText = () =>
      [
        `[docs-preview] ${lang}/${slug} — ${page.title} · ${page.changes.length} changes`,
        `- file: ${page.sourcePath}`,
        `- page: ${pageUrl()}`,
        ...page.changes.map((c) => {
          const body = c.newText || c.oldText;
          return `${isViewed(c) ? '[x]' : '[ ]'} #${c.id} ${c.type} ${KIND_LABEL[c.blockKind] || c.blockKind}${c.line ? ` (line ${c.line})` : ''}${c.section ? ` — ${c.section.text}` : ''}: ${body.slice(0, 100)}${body.length > 100 ? '…' : ''}`;
        }),
      ].join('\n');
    async function copy(text, btn) {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const ta = el('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      if (btn) {
        const old = btn.textContent;
        btn.textContent = 'Copied';
        btn.classList.add('bai-copied');
        setTimeout(() => {
          btn.textContent = old;
          btn.classList.remove('bai-copied');
        }, 1200);
      }
    }

    // ---------------------------------------------------------- marks
    const blockEl = (idx) =>
      idx == null || idx < 0 ? null : $(`[data-bai-block="${idx}"]`);
    const wrapInline = (change, inner) => {
      switch (change.blockKind) {
        case 'table-row':
          return `<table><tbody><tr>${inner}</tr></tbody></table>`;
        case 'list-item':
          return `<ul><li>${inner}</li></ul>`;
        case 'code':
          return `<pre>${inner}</pre>`;
        case 'heading':
          return `<${change.tag}>${inner}</${change.tag}>`;
        default:
          return `<p>${inner}</p>`;
      }
    };
    // Caption, alt text, title and size can all change without the bytes.
    const captionLine = (change) => {
      const facets = [];
      const differs = (a, b) => (a || '') !== (b || '');
      if (differs(change.oldCaption, change.newCaption))
        facets.push(['caption', change.oldCaption, change.newCaption]);
      else if (differs(change.oldAlt, change.newAlt))
        facets.push(['alt text', change.oldAlt, change.newAlt]);
      if (differs(change.oldTitle, change.newTitle))
        facets.push(['title', change.oldTitle, change.newTitle]);
      if (differs(change.oldStyle, change.newStyle))
        facets.push(['size', change.oldStyle, change.newStyle]);
      if (!facets.length) return '';
      const rows = facets
        .map(
          ([label, o, n]) =>
            `<div>${label}: <del class="bai-del">${esc(o || '(none)')}</del> → <ins class="bai-ins">${esc(n || '(none)')}</ins></div>`,
        )
        .join('');
      return `<div class="bai-popover__caption">${rows}</div>`;
    };
    const imagePair = (change) => {
      const col = (label, src) =>
        `<div><div class="bai-col-label">${label}</div>${src ? `<img class="bai-popover__img" src="${src}" data-bai-zoom="${change.id}" alt="${label}" />` : '<em>—</em>'}</div>`;
      return `<div class="bai-popover__sbs">${col('Old', change.oldImage)}${col('New', change.newImage)}</div>`;
    };

    function placeholderFor(change) {
      const short =
        change.oldText.length > 140
          ? `${change.oldText.slice(0, 140)}…`
          : change.oldText;
      let node;
      if (change.blockKind === 'table-row') {
        node = el(
          'tr',
          'bai-removed-placeholder',
          `<td colspan="20"><span class="bai-removed-text">${esc(short)}</span></td>`,
        );
      } else if (change.blockKind === 'image') {
        node = el(
          'figure',
          'bai-removed-placeholder',
          `<span class="bai-removed-text">${esc(change.oldText)}</span>`,
        );
      } else {
        const tag =
          change.blockKind === 'list-item'
            ? 'li'
            : change.blockKind === 'heading'
              ? change.tag
              : 'div';
        node = el(
          tag,
          'bai-removed-placeholder',
          `<span class="bai-removed-text">${esc(short)}</span>`,
        );
      }
      node.dataset.baiChange = change.id;
      node.dataset.baiType = 'removed';
      return node;
    }

    const listOf = (change) =>
      change.container === 'ol' ? 'ol' : change.container === 'ul' ? 'ul' : null;

    function wrapPlaceholder(node, change) {
      const list = listOf(change);
      if (list) {
        const holder = document.createElement(list);
        holder.appendChild(node);
        return holder;
      }
      const table = document.createElement('table');
      const body = document.createElement('tbody');
      body.appendChild(node);
      table.appendChild(body);
      return table;
    }

    // A removed <li>/<tr> has to land inside a real list / table, so it either
    // joins the neighbouring one or brings its own. Returns the outermost node
    // placed, which is what the next placeholder for this anchor follows.
    function placeRemoved(node, change, after, adopt) {
      const list = listOf(change);
      const needsHolder = list || change.container === 'table';
      if (!after) {
        const outer = needsHolder ? wrapPlaceholder(node, change) : node;
        section.prepend(outer);
        return outer;
      }
      if (!needsHolder) {
        // A plain block cannot sit inside a list or table — go after the whole one.
        const host = after.closest('li, tr') ? after.closest('ul, ol, table') : null;
        (host || after).after(node);
        return node;
      }
      const tag = after.tagName;
      if ((list && tag === 'LI') || (change.container === 'table' && tag === 'TR')) {
        after.after(node);
        return after.closest('ul, ol, table') || node;
      }
      const next = adopt ? after.nextElementSibling : null;
      if (list && next && next.tagName === list.toUpperCase()) {
        next.prepend(node);
        return next;
      }
      if (change.container === 'table' && next && next.tagName === 'TABLE') {
        (next.tBodies[0] || next).prepend(node);
        return next;
      }
      const holder = wrapPlaceholder(node, change);
      after.after(holder);
      return holder;
    }

    // Can the new placeholder simply follow the previous one, or would that put
    // it inside a container that cannot hold it?
    function chainable(prevNode, change) {
      const parent = prevNode.parentElement;
      if (!parent) return false;
      const list = listOf(change);
      if (list) return parent.tagName === list.toUpperCase();
      if (change.container === 'table')
        return ['TBODY', 'THEAD', 'TFOOT', 'TABLE'].includes(parent.tagName);
      return !prevNode.closest('ul, ol, table');
    }

    function apply() {
      document.body.classList.add('bai-pr-preview');
      document.body.classList.toggle('bai-marks-off', !marksOn);
      marks = [];
      if (page.status !== 'modified' || !section) return;
      // Consecutive removals share an anchor; each follows the previous one so
      // they keep their source order instead of stacking up reversed.
      const lastAt = new Map();
      for (const change of page.changes) {
        let node;
        if (change.type === 'removed') {
          node = placeholderFor(change);
          const key = change.insertAfter == null ? -1 : change.insertAfter;
          const prev = lastAt.get(key);
          let outer;
          if (prev && chainable(prev.inner, change)) {
            prev.inner.after(node);
            outer = prev.outer;
          } else {
            const after = prev ? prev.outer : blockEl(change.insertAfter);
            outer = placeRemoved(node, change, after, !prev);
          }
          lastAt.set(key, { inner: node, outer });
        } else {
          node = blockEl(change.anchor);
          if (!node) continue;
          node.dataset.baiChange = change.id;
          node.dataset.baiType = change.type;
        }
        node.classList.toggle('bai-viewed', isViewed(change));
        marks.push({ change, el: node });
      }
      marks.sort((a, b) =>
        a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING
          ? -1
          : 1,
      );
      for (const { change, el: node } of marks) {
        node.setAttribute('role', 'button');
        node.setAttribute(
          'aria-label',
          `Change ${change.id} of ${page.changes.length}: ${change.type} ${KIND_LABEL[change.blockKind] || change.blockKind} — press Enter to show the diff`,
        );
      }
      syncMarkFocus();
      updatePos();
    }

    // Hidden marks are inert, so they leave the tab order too.
    function syncMarkFocus() {
      for (const { el: node } of marks) {
        node.tabIndex = marksOn ? 0 : -1;
        if (marksOn) node.removeAttribute('aria-disabled');
        else node.setAttribute('aria-disabled', 'true');
      }
    }

    // ---------------------------------------------------------- popover
    const pop = el('div', 'bai-popover');
    pop.hidden = true;
    document.body.appendChild(pop);
    let pinned = null;
    let hovered = null;
    let hoverTimer = 0;
    let hideTimer = 0;
    const changeOf = (node) =>
      node && page.changes.find((c) => String(c.id) === node.dataset.baiChange);
    // What a shortcut acts on: pinned popover, else hovered block, else the
    // change last jumped to.
    const activeChange = () =>
      changeOf(pinned) ||
      changeOf(hovered) ||
      (current >= 0 && marks[current] ? marks[current].change : null);

    let toastTimer = 0;
    const toast = el('div', 'bai-toast');
    toast.hidden = true;
    document.body.appendChild(toast);
    const showToast = (text) => {
      toast.textContent = text;
      toast.hidden = false;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        toast.hidden = true;
      }, 1200);
    };

    function autoMode(change) {
      // Inline shows nothing when only markup moved — the two columns do.
      if (change.formattingOnly) return 'sbs';
      if (modeOverride) return modeOverride;
      const w = change.words || 0;
      if (
        change.blockKind === 'table-row' ||
        change.blockKind === 'list-item' ||
        change.blockKind === 'code'
      )
        return w > 40 ? 'sbs' : 'inline';
      return w > 120 ? 'sbs' : 'inline';
    }

    function render(change) {
      const type = change.type;
      const kind = KIND_LABEL[change.blockKind] || change.blockKind;
      let modeHtml = '';
      let body = '';
      if (change.blockKind === 'image') {
        body = imagePair(change) + captionLine(change);
      } else if (type === 'modified') {
        const mode = autoMode(change);
        const noInline = change.formattingOnly
          ? ' disabled title="A formatting-only change has no inline marks"'
          : '';
        modeHtml = `<span class="bai-popover__mode"><button data-mode="inline" aria-pressed="${mode === 'inline'}"${noInline}>Inline</button><button data-mode="sbs" aria-pressed="${mode === 'sbs'}">Side by side</button></span>`;
        body =
          mode === 'inline'
            ? wrapInline(change, change.diffHtml)
            : `<div class="bai-popover__sbs"><div class="bai-col--old"><div class="bai-col-label">Old</div>${wrapInline(change, change.oldHtml)}</div><div class="bai-col--new"><div class="bai-col-label">New</div>${wrapInline(change, change.newHtml)}</div></div>`;
      } else if (type === 'added') {
        body = `<div class="bai-popover__sbs bai-popover__sbs--single"><div class="bai-col--new"><div class="bai-col-label">New</div>${wrapInline(change, change.newHtml)}</div></div>`;
      } else {
        body = `<div class="bai-popover__sbs bai-popover__sbs--single"><div class="bai-col--old"><div class="bai-col-label">Old</div>${wrapInline(change, change.oldHtml)}</div></div>`;
      }
      const note = change.formattingOnly
        ? ' · formatting / link change'
        : change.similarity != null
          ? ` · ${Math.round(change.similarity * 100)}% similar`
          : '';
      const file = page.sourcePath ? page.sourcePath.split('/').pop() : '';
      const where = `${file}${change.line ? `:${change.line}` : ''}${change.section ? ` · ${esc(change.section.text)}` : ''}`;
      pop.innerHTML =
        `<div class="bai-popover__head">` +
        `<span class="bai-popover__type bai-popover__type--${type}">${type}</span>` +
        `<span class="bai-popover__kind">${kind}${note}</span>` +
        `<span class="bai-popover__spacer"></span>${modeHtml}` +
        `<button class="bai-popover__btn" data-copy title="Copy a reference to this change (file:line, section, link, old/new)">Copy ref</button>` +
        `<label class="bai-popover__viewed" title="Mark as viewed (v)"><input type="checkbox" data-viewed ${isViewed(change) ? 'checked' : ''}/> Viewed</label>` +
        `</div><div class="bai-popover__body">${body}</div>` +
        `<div class="bai-popover__hint"><span class="bai-popover__where">#${change.id} · ${where}</span>${change.blockKind === 'image' ? 'Click an image to enlarge · ' : ''}Click the block to pin · <kbd>c</kbd> copy ref · <kbd>v</kbd> viewed · Esc to close</div>`;
      pop.querySelectorAll('[data-mode]').forEach((b) =>
        b.addEventListener('click', () => {
          setMode(b.dataset.mode);
          render(change);
        }),
      );
      pop
        .querySelectorAll('[data-bai-zoom]')
        .forEach((img) => img.addEventListener('click', () => lightbox(change)));
      $('[data-copy]', pop).addEventListener('click', (e) =>
        copy(refText(change), e.currentTarget),
      );
      $('[data-viewed]', pop).addEventListener('change', (e) =>
        setViewed(change, e.target.checked),
      );
    }

    function position(target) {
      const r = target.getBoundingClientRect();
      pop.style.left = '0px';
      pop.style.top = '0px';
      const pw = pop.offsetWidth;
      const ph = pop.offsetHeight;
      const left = Math.min(Math.max(8, r.left), window.innerWidth - pw - 8);
      let top = r.bottom + 8;
      if (top + ph > window.innerHeight - 8) top = Math.max(8, r.top - ph - 8);
      pop.style.left = `${left}px`;
      pop.style.top = `${top}px`;
    }
    function show(target) {
      const change = changeOf(target);
      if (!change) return;
      current = marks.findIndex((m) => m.change === change);
      updatePos();
      render(change);
      pop.hidden = false;
      position(target);
    }
    function hide() {
      hovered = null;
      if (pinned) return;
      pop.hidden = true;
    }

    document.addEventListener('mouseover', (e) => {
      if (!marksOn || !(e.target instanceof Element)) return;
      const t = e.target.closest('[data-bai-change]');
      if (t) {
        hovered = t;
        clearTimeout(hideTimer);
        clearTimeout(hoverTimer);
        if (!pinned) hoverTimer = setTimeout(() => show(t), 120);
        return;
      }
      if (e.target.closest('.bai-popover')) clearTimeout(hideTimer);
    });
    document.addEventListener('mouseout', (e) => {
      if (!(e.target instanceof Element)) return;
      if (e.target.closest('[data-bai-change]') || e.target.closest('.bai-popover')) {
        clearTimeout(hoverTimer);
        clearTimeout(hideTimer);
        hideTimer = setTimeout(hide, 220);
      }
    });
    document.addEventListener('click', (e) => {
      if (!(e.target instanceof Element)) return;
      if (e.target.closest('.bai-popover') || e.target.closest('.bai-nav')) return;
      const t = e.target.closest('[data-bai-change]');
      if (marksOn && t && !e.target.closest('a')) {
        if (pinned === t) {
          pinned = null;
          pop.hidden = true;
        } else {
          pinned = t;
          show(t);
        }
        return;
      }
      if (pinned) {
        pinned = null;
        pop.hidden = true;
      }
    });

    function lightbox(change) {
      const box = el(
        'div',
        'bai-lightbox',
        `<div class="bai-lightbox__pair"><div>Old<br><img src="${change.oldImage || ''}" alt="Old" /></div><div>New<br><img src="${change.newImage || ''}" alt="New" /></div></div>`,
      );
      box.addEventListener('click', () => box.remove());
      document.body.appendChild(box);
    }

    // ---------------------------------------------------------- navigator
    const summary = (manifest.langs && manifest.langs[lang]) || {
      totals: { pages: 0, changes: 0 },
      pages: [],
    };
    const nav = el('div', 'bai-nav');
    nav.innerHTML =
      `<div class="bai-nav__panel" hidden></div>` +
      `<div class="bai-nav__badge"><strong>${summary.totals.pages} pages · ${summary.totals.changes} changes</strong>` +
      `<span class="bai-nav__pos"></span>` +
      `<button data-nav="prev" title="Previous change ([)">‹</button>` +
      `<button data-nav="next" title="Next change (])">›</button>` +
      `<button data-nav="panel" title="Changed pages">☰</button></div>`;
    document.body.appendChild(nav);
    const panel = $('.bai-nav__panel', nav);
    const posEl = $('.bai-nav__pos', nav);
    const pageIdx = summary.pages.findIndex((p) => p.slug === slug);

    function renderPanel() {
      const rows = summary.pages
        .map((p, i) => {
          const tag =
            p.status === 'new'
              ? '<span class="bai-nav__tag bai-nav__tag--new">NEW</span>'
              : p.status === 'deleted'
                ? '<span class="bai-nav__tag bai-nav__tag--deleted">DELETED</span>'
                : '';
          const v = viewedCountOf(p);
          const count =
            p.status === 'modified'
              ? `<span class="bai-nav__count${v === p.counts.total ? ' bai-nav__count--done' : ''}" title="viewed / total">${v}/${p.counts.total}</span>`
              : '';
          const inner = `${tag}<span class="bai-nav__title">${esc(p.title)}</span>${count}`;
          // A deleted page has no copy in this build, so it is not a link.
          if (p.status === 'deleted')
            return `<div class="bai-nav__row bai-nav__row--deleted">${inner}</div>`;
          return `<a class="bai-nav__row${i === pageIdx ? ' bai-nav__row--current' : ''}" href="./${p.slug}.html#bai-change-1">${inner}</a>`;
        })
        .join('');
      const langs = Object.entries(manifest.langs)
        .map(([l, s]) => {
          const target = s.pages.some((p) => p.slug === slug)
            ? slug
            : s.pages.find((p) => p.status !== 'deleted')?.slug || slug;
          return `<a class="${l === lang ? 'bai-nav__lang--current' : ''}" href="../${l}/${target}.html">${l} · ${s.totals.changes}</a>`;
        })
        .join('');
      const actions =
        `<div class="bai-nav__actions">` +
        (marks.length
          ? `<button data-act="copy-page">Copy page summary</button><button data-act="all-viewed">Mark all viewed</button><button data-act="reset-viewed">Reset</button>`
          : '') +
        `<button data-act="marks">${marksOn ? 'Hide marks' : 'Show marks'}</button></div>`;
      const stale = staleViewed
        ? `<div class="bai-nav__stale">${staleViewed} change${staleViewed > 1 ? 's' : ''} you had viewed ${staleViewed > 1 ? 'have' : 'has'} changed since — shown as unviewed again</div>`
        : '';
      panel.innerHTML =
        `<div class="bai-nav__section">Changed pages${manifest.label ? ` — ${esc(manifest.label)}` : ''}</div>` +
        `${rows || '<div class="bai-nav__row"><em>No page changed</em></div>'}${stale}${actions}` +
        `<div class="bai-nav__section">Languages</div><div class="bai-nav__lang">${langs}</div>`;
      panel.querySelectorAll('[data-act]').forEach((b) =>
        b.addEventListener('click', (e) => {
          const act = b.dataset.act;
          if (act === 'copy-page') return copy(pageSummaryText(), e.currentTarget);
          if (act === 'marks') {
            marksOn = !marksOn;
            document.body.classList.toggle('bai-marks-off', !marksOn);
            syncMarkFocus();
            if (!marksOn) {
              pinned = null;
              pop.hidden = true;
            }
            return renderPanel();
          }
          for (const m of marks) {
            if (act === 'all-viewed') viewed.add(m.change.fingerprint);
            else viewed.delete(m.change.fingerprint);
            m.el.classList.toggle('bai-viewed', act === 'all-viewed');
          }
          writeViewed(lang, slug, viewed);
          updatePos();
          renderPanel();
        }),
      );
    }

    function updatePos() {
      const v = marks.filter((m) => isViewed(m.change)).length;
      posEl.textContent = marks.length
        ? `${current < 0 ? '–' : current + 1} / ${marks.length}${v ? ` · ${v} viewed` : ''}`
        : page.status === 'new'
          ? 'new page'
          : 'no marks';
      posEl.classList.toggle(
        'bai-nav__pos--done',
        marks.length > 0 && v === marks.length,
      );
    }
    function jumpTo(i, flash = true) {
      if (!marks.length) return;
      current = (i + marks.length) % marks.length;
      const target = marks[current].el;
      target.scrollIntoView({ block: 'center', behavior: 'smooth' });
      // Keyboard users land on the change itself, not back at the badge.
      target.focus({ preventScroll: true });
      if (flash) {
        document
          .querySelectorAll('.bai-flash')
          .forEach((n) => n.classList.remove('bai-flash', 'bai-flash--fade'));
        target.classList.add('bai-flash');
        setTimeout(() => target.classList.add('bai-flash--fade'), 900);
        setTimeout(
          () => target.classList.remove('bai-flash', 'bai-flash--fade'),
          2200,
        );
      }
      updatePos();
    }
    function step(dir) {
      const next = current + dir;
      if (marks.length && next >= 0 && next < marks.length) return jumpTo(next);
      // At either end, hop to the neighbouring changed page. An unchanged page
      // is not in the list, so it enters from whichever end the step came from.
      const pages = summary.pages.filter((p) => p.status !== 'deleted');
      if (!pages.length) return;
      const here = pages.findIndex((p) => p.slug === slug);
      const target =
        here < 0
          ? dir > 0
            ? pages[0]
            : pages[pages.length - 1]
          : pages[(here + dir + pages.length) % pages.length];
      if (!target || target.slug === slug)
        return marks.length ? jumpTo(next) : undefined;
      location.href = `./${target.slug}.html#bai-change-${dir > 0 ? '1' : 'last'}`;
    }
    nav.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-nav]');
      if (!b) return;
      if (b.dataset.nav === 'prev') step(-1);
      else if (b.dataset.nav === 'next') step(1);
      else {
        renderPanel();
        panel.hidden = !panel.hidden;
      }
    });

    for (const p of summary.pages) {
      const a = document.querySelector(
        `.doc-sidebar-nav a[href="./${p.slug}.html"]`,
      );
      if (!a) continue;
      a.appendChild(
        el(
          'span',
          `bai-nav-badge bai-nav-badge--${p.status}`,
          p.status === 'new'
            ? 'NEW'
            : p.status === 'deleted'
              ? 'DEL'
              : String(p.counts.total),
        ),
      );
    }
    if (section && (page.status === 'new' || page.status === 'deleted')) {
      const banner = el(
        'div',
        `bai-page-banner bai-page-banner--${page.status}`,
        page.status === 'new'
          ? `<span class="bai-nav__tag bai-nav__tag--new">NEW</span>This page is added by this PR — everything on it is new, so no block marks are shown.`
          : `<span class="bai-nav__tag bai-nav__tag--deleted">DELETED</span>This page is removed by this PR. It is listed in the change navigator only.`,
      );
      section.before(banner);
    }

    // ---------------------------------------------------------- shortcuts
    document.addEventListener('keydown', (e) => {
      if (
        e.target instanceof Element &&
        e.target.closest('input, textarea, select, [contenteditable]')
      )
        return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      // Physical key codes, so the shortcuts survive an active IME.
      const code = e.code || '';
      if (code === 'Enter' || code === 'Space') {
        const t =
          e.target instanceof Element
            ? e.target.closest('[data-bai-change]')
            : null;
        if (!t || !marksOn) return;
        e.preventDefault();
        if (pinned === t) {
          pinned = null;
          pop.hidden = true;
        } else {
          pinned = t;
          show(t);
        }
      } else if (code === 'BracketLeft') step(-1);
      else if (code === 'BracketRight') step(1);
      else if (code === 'KeyV') {
        const c = activeChange();
        if (!c) return;
        e.preventDefault();
        setViewed(c, !isViewed(c));
        if (!pop.hidden) render(c);
        showToast(isViewed(c) ? `#${c.id} viewed` : `#${c.id} unviewed`);
      } else if (code === 'KeyC') {
        const c = activeChange();
        if (!c) return;
        e.preventDefault();
        copy(refText(c), pop.hidden ? null : $('[data-copy]', pop));
        showToast(`Copied ref #${c.id}`);
      } else if (code === 'Escape') {
        pinned = null;
        pop.hidden = true;
        panel.hidden = true;
        document.querySelectorAll('.bai-lightbox').forEach((n) => n.remove());
      }
    });

    apply();
    const m = location.hash.match(/^#bai-change-(\d+|last)$/);
    if (m && marks.length) {
      // Resolve by change id, the number Copy ref and the popover both show.
      const byId = marks.findIndex((x) => String(x.change.id) === m[1]);
      const i = m[1] === 'last' ? marks.length - 1 : byId >= 0 ? byId : 0;
      setTimeout(() => jumpTo(i), 50);
    }
  }
})();
