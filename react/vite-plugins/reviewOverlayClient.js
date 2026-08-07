/**
 * FR-3309/FR-3310 — review overlay client. Dev-only: injected by the
 * `bai-dev-review-overlay` Vite plugin (apply: 'serve').
 *
 * Everything lives inside a Shadow DOM host on document.body; the only
 * global surface is the `window.__baiReviewOverlay` re-entry guard.
 *
 * Talks to the reviewer's OWN local board relay (lablup/claude-mp
 * dev-server-board, spec R2.2): http://localhost:7777/api/teams/* and
 * /api/registry. The dev server itself has no review backend.
 *
 * FR-3310 completion on top of the FR-3309 skeleton:
 *  - multi-signal v2 anchors (selector + data-testid + text snippet +
 *    bbox-fraction rect), backward-compatible with v1 fragments.
 *    Spec §7 deviation (conscious): the 4th signal — screenshot crop — is
 *    NOT part of the anchor payload. The anchor rides a URL hash fragment
 *    inside the Teams message, so even a tiny thumbnail would blow the
 *    deep-link far past practical URL/message limits, and in-browser
 *    crop-matching would need CV we don't have. The full element screenshot
 *    is instead attached to the Teams reply itself (hostedContents), which
 *    covers the crop's human-disambiguation role.
 *  - element screenshots (vendored SVG-foreignObject capture — this file is
 *    served raw outside the Vite module graph, so no npm imports; approach
 *    follows html-to-image's foreignObject technique, MIT)
 *  - page-level comments (no element picked → no pin, page-path deep link)
 *  - resolve/unresolve via the relay's ✅ reaction; resolved replies and
 *    pins render dimmed
 *  - registry thread discovery (prefill the Teams thread URL by matching
 *    location.origin against /api/registry entries)
 *  - best-effort pin re-resolution on DOM change (MutationObserver debounce;
 *    Vite HMR emits vite:afterUpdate only inside transformed modules, so the
 *    observer is the actual workhorse — full re-anchor still needs 📍/reload)
 */

(() => {
  if (window.__baiReviewOverlay) return;
  window.__baiReviewOverlay = true;

  const RELAY = 'http://localhost:7777';
  const HASH_KEY = 'bai-review';
  const LS_THREAD_KEY = `bai-review:threadUrl:${location.host}`;
  const POLL_MS = 12000;
  const RELAY_HINT =
    '로컬 보드 릴레이가 필요해요 — 터미널에서 board serve를 실행하세요';
  // Screenshot budget: the relay caps decoded bytes at 4MB; base64 is ~1.37×,
  // so cap the data-URL length well under that and downscale until it fits.
  const MAX_SHOT_DATAURL = 3.5 * 1024 * 1024;
  const MAX_SHOT_WIDTH = 1280;
  const MAX_SHOT_NODES = 800; // skip capture on huge subtrees (style inlining cost)

  const esc = (v) => (window.CSS && CSS.escape ? CSS.escape(v) : v);

  // ---------------------------------------------------------------- anchor

  const b64encode = (s) =>
    btoa(String.fromCharCode(...new TextEncoder().encode(s)));
  const b64decode = (b) =>
    new TextDecoder().decode(Uint8Array.from(atob(b), (c) => c.charCodeAt(0)));

  /** Unique-ish CSS selector preferring data-testid / id landmarks. */
  function buildSelector(el) {
    const testid = el.getAttribute && el.getAttribute('data-testid');
    if (testid) return `[data-testid="${esc(testid)}"]`;
    if (el.id) return `#${esc(el.id)}`;
    // tag:nth-of-type path up to the nearest data-testid/id ancestor or body.
    const parts = [];
    let node = el;
    while (node && node.nodeType === 1 && node !== document.body) {
      const parent = node.parentElement;
      const anchorId = node.getAttribute('data-testid')
        ? `[data-testid="${esc(node.getAttribute('data-testid'))}"]`
        : node.id
          ? `#${esc(node.id)}`
          : null;
      if (anchorId) {
        parts.unshift(anchorId);
        break;
      }
      const tag = node.tagName.toLowerCase();
      let nth = 1;
      let sib = node;
      while ((sib = sib.previousElementSibling)) {
        if (sib.tagName === node.tagName) nth++;
      }
      parts.unshift(`${tag}:nth-of-type(${nth})`);
      node = parent;
    }
    return parts.join(' > ') || 'body';
  }

  const normText = (s) => (s || '').replace(/\s+/g, ' ').trim();

  /**
   * v2 multi-signal anchor payload for a picked element:
   *   { v:2, s, tid, tag, txt, rect, p }
   *   s    — CSS selector (v1-compatible primary signal)
   *   tid  — data-testid of the nearest testid-bearing ancestor-or-self
   *   tag  — element tag name (narrows the text-scan fallback)
   *   txt  — leading 64 chars of visible text (validation + fallback signal)
   *   rect — target bbox as fractions of the tid container's bbox
   *   p    — pathname at capture time
   * A page-level comment encodes { v:2, s:null, p }.
   */
  function captureAnchorSignals(target) {
    const anchor = { v: 2, s: buildSelector(target), p: location.pathname };
    anchor.tag = target.tagName.toLowerCase();
    const txt = normText(target.innerText || target.textContent).slice(0, 64);
    if (txt) anchor.txt = txt;
    const tidEl = target.closest && target.closest('[data-testid]');
    if (tidEl) {
      anchor.tid = tidEl.getAttribute('data-testid');
      if (tidEl !== target) {
        const cr = tidEl.getBoundingClientRect();
        const tr = target.getBoundingClientRect();
        if (cr.width && cr.height) {
          const f = (n) => Math.round(n * 1e4) / 1e4;
          anchor.rect = {
            x: f((tr.left - cr.left) / cr.width),
            y: f((tr.top - cr.top) / cr.height),
            w: f(tr.width / cr.width),
            h: f(tr.height / cr.height),
          };
        }
      }
    }
    return anchor;
  }

  function encodeAnchor(anchor) {
    return b64encode(JSON.stringify(anchor));
  }

  // anchor.p feeds location.assign(); a decoded reply is teammate-authored
  // content, so only accept a /-rooted, non-protocol-relative path — never
  // an absolute/off-origin URL.
  const isSafePath = (p) => typeof p === 'string' && /^\/(?!\/)/.test(p);

  /** Accepts v1 ({s: string}) and v2 ({s: string|null}) payloads. */
  function decodeAnchor(b64) {
    try {
      const obj = JSON.parse(b64decode(b64));
      if (!obj || typeof obj !== 'object') return null;
      if (obj.p != null && !isSafePath(obj.p)) return null;
      if ((obj.v || 1) >= 2) {
        return typeof obj.s === 'string' || obj.s === null ? obj : null;
      }
      return typeof obj.s === 'string' ? obj : null;
    } catch {
      return null;
    }
  }

  function anchorKeyFromText(text) {
    const m = /#bai-review=([A-Za-z0-9+/=_-]+)/.exec(text || '');
    return m ? m[1] : null;
  }

  const textMatches = (el, txt) => {
    if (!txt) return true;
    const t = normText(el.innerText || el.textContent).slice(0, 160);
    return t.includes(txt) || txt.includes(t.slice(0, 64));
  };

  // anchor.tag comes from a decoded (teammate-authored) reply — only use it
  // as a selector when it looks like a real tag name, else scan everything.
  const safeTag = (tag) => (/^[a-z][a-z0-9-]*$/.test(tag || '') ? tag : '*');

  /**
   * Percentage-rect signal (spec §7, 3rd signal): project the stored
   * fractional rect onto the landmark container's current bbox and hit-test
   * the element at its center. Best-effort — the projected point must be in
   * the viewport (elementFromPoint constraint) and the hit must live inside
   * the container; otherwise fall back to the container itself.
   */
  function rectProjectedTarget(container, anchor) {
    const r = anchor.rect;
    if (!r) return null;
    const cr = container.getBoundingClientRect();
    if (!cr.width || !cr.height) return null;
    const cx = cr.left + (r.x + (r.w || 0) / 2) * cr.width;
    const cy = cr.top + (r.y + (r.h || 0) / 2) * cr.height;
    if (cx < 0 || cy < 0 || cx >= window.innerWidth || cy >= window.innerHeight)
      return null;
    const hit = document.elementFromPoint(cx, cy);
    if (!hit || hit === host || host.contains(hit) || !container.contains(hit))
      return null;
    return hit;
  }

  /**
   * Cheap signal check (selector → unique testid + fractional-rect
   * projection). Used by render-time classification and pin repositioning —
   * no expensive text scan here.
   */
  function quickFindTarget(anchor) {
    if (!anchor || typeof anchor.s !== 'string') return null;
    try {
      const bySel = document.querySelector(anchor.s);
      if (bySel && textMatches(bySel, anchor.txt)) return bySel;
    } catch {
      /* invalid selector */
    }
    if (anchor.tid) {
      const byTid = document.querySelectorAll(
        `[data-testid="${esc(anchor.tid)}"]`,
      );
      if (byTid.length === 1) {
        const container = byTid[0];
        // Project the stored fractional rect inside the landmark when
        // present; otherwise the container itself is the (approximate) hit.
        return rectProjectedTarget(container, anchor) || container;
      }
    }
    return null;
  }

  /**
   * Full multi-signal resolution, in priority order:
   *  1. exact selector (validated against the text snippet when present)
   *  2. unique data-testid landmark (descendant text scan inside it, then
   *     fractional-rect projection)
   *  3. document-wide text scan over anchor.tag elements (smallest match)
   *  4. unvalidated selector hit as a last resort
   */
  function findAnchorTarget(anchor) {
    if (!anchor || typeof anchor.s !== 'string') return null;
    let weak = null;
    try {
      const bySel = document.querySelector(anchor.s);
      if (bySel) {
        if (textMatches(bySel, anchor.txt)) return bySel;
        weak = bySel; // structure drifted under a reused selector
      }
    } catch {
      /* invalid selector */
    }
    const scanScope = (scope) => {
      if (!anchor.txt) return null;
      const cands = scope.querySelectorAll(safeTag(anchor.tag));
      let best = null;
      for (let i = 0; i < cands.length && i < 5000; i++) {
        const c = cands[i];
        if (!normText(c.innerText || c.textContent).includes(anchor.txt))
          continue;
        if (!best || best.contains(c)) best = c; // prefer the innermost match
      }
      return best;
    };
    if (anchor.tid) {
      const byTid = document.querySelectorAll(
        `[data-testid="${esc(anchor.tid)}"]`,
      );
      if (byTid.length === 1) {
        const container = byTid[0];
        const inner = scanScope(container);
        if (inner) return inner;
        const projected = rectProjectedTarget(container, anchor);
        if (projected) return projected;
        if (textMatches(container, anchor.txt)) return container;
      }
    }
    const byText = scanScope(document);
    if (byText) return byText;
    return weak;
  }

  // ---------------------------------------------------------------- host UI

  const host = document.createElement('div');
  host.setAttribute('data-bai-review-overlay', '');
  const root = host.attachShadow({ mode: 'open' });
  document.body.appendChild(host);

  const style = document.createElement('style');
  style.textContent = `
    :host { all: initial; }
    * { box-sizing: border-box; font-family: ui-sans-serif, system-ui, sans-serif; }
    .toggle {
      position: fixed; right: 16px; bottom: 16px; z-index: 2147483000;
      border: none; border-radius: 24px; padding: 10px 16px; cursor: pointer;
      background: #ff7a00; color: #fff; font-size: 14px; font-weight: 600;
      box-shadow: 0 2px 10px rgba(0,0,0,.25);
    }
    .toggle.active { background: #1f1f1f; }
    .panel {
      position: fixed; top: 0; right: 0; bottom: 0; width: 320px;
      z-index: 2147483000; background: #fff; border-left: 1px solid #ddd;
      box-shadow: -4px 0 16px rgba(0,0,0,.12); display: none;
      flex-direction: column; color: #1f1f1f;
    }
    .panel.open { display: flex; }
    .panel header {
      padding: 10px 12px; border-bottom: 1px solid #eee; font-weight: 700;
      font-size: 14px; display: flex; align-items: center; gap: 6px;
      flex-wrap: wrap;
    }
    .panel header .spacer { flex: 1; }
    .iconbtn {
      border: 1px solid #ddd; background: #fafafa; border-radius: 6px;
      cursor: pointer; font-size: 12px; padding: 4px 8px;
    }
    .iconbtn.primary { background: #ff7a00; border-color: #ff7a00; color: #fff; }
    .settings { padding: 10px 12px; border-bottom: 1px solid #eee; }
    .settings label { font-size: 11px; color: #888; display: block; margin-bottom: 4px; }
    .settings .row { display: flex; gap: 6px; }
    .settings input {
      flex: 1; font-size: 12px; padding: 5px 7px; border: 1px solid #ddd;
      border-radius: 6px; min-width: 0;
    }
    .hint {
      margin: 8px 12px; padding: 8px 10px; border-radius: 6px; font-size: 12px;
      background: #fff7e6; border: 1px solid #ffd591; color: #874d00; display: none;
    }
    .hint.show { display: block; }
    .replies { flex: 1; overflow-y: auto; padding: 8px 12px; }
    .reply { border-bottom: 1px solid #f0f0f0; padding: 8px 0; font-size: 12px; }
    .reply .meta { color: #888; font-size: 11px; margin-bottom: 3px; display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
    .reply .meta .author { color: #333; font-weight: 600; }
    .reply .body { white-space: pre-wrap; word-break: break-word; }
    .reply .pinbtn { border: none; background: none; cursor: pointer; font-size: 13px; padding: 0 2px; }
    .reply .resolvebtn {
      border: 1px solid #ddd; background: #fafafa; border-radius: 5px;
      cursor: pointer; font-size: 10px; padding: 1px 6px; margin-left: auto;
    }
    .reply.resolved { opacity: .55; }
    .reply.resolved .body { text-decoration: line-through transparent; }
    .reply .badge {
      font-size: 10px; color: #237804; background: #f6ffed;
      border: 1px solid #b7eb8f; border-radius: 8px; padding: 0 6px;
    }
    .section {
      font-size: 11px; color: #874d00; background: #fff7e6;
      border: 1px solid #ffd591; border-radius: 6px; padding: 4px 8px;
      margin: 10px 0 2px;
    }
    .empty { color: #aaa; font-size: 12px; text-align: center; padding: 24px 0; }
    .hoverbox {
      position: fixed; z-index: 2147482998; pointer-events: none; display: none;
      border: 2px solid #ff7a00; border-radius: 3px;
      background: rgba(255,122,0,.08);
    }
    .pin {
      position: absolute; z-index: 2147482999; width: 22px; height: 22px;
      margin: -11px 0 0 -11px; border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg); background: #ff7a00; color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; cursor: default; pointer-events: auto;
      box-shadow: 0 1px 4px rgba(0,0,0,.35);
    }
    .pin > span { transform: rotate(45deg); }
    .pin.resolved { opacity: .4; filter: grayscale(.8); }
    .pin.orphan { opacity: .3; }
    .pinlayer { position: absolute; top: 0; left: 0; width: 0; height: 0; }
    .compose {
      position: fixed; z-index: 2147483001; width: 280px; background: #fff;
      border: 1px solid #ddd; border-radius: 8px; padding: 10px;
      box-shadow: 0 4px 18px rgba(0,0,0,.2); display: none;
    }
    .compose textarea {
      width: 100%; height: 64px; font-size: 12px; padding: 6px;
      border: 1px solid #ddd; border-radius: 6px; resize: vertical;
    }
    .compose .shotwrap { display: none; margin-top: 6px; position: relative; }
    .compose .shotwrap.show { display: block; }
    .compose .shotwrap img {
      display: block; max-width: 100%; max-height: 90px; border: 1px solid #eee;
      border-radius: 6px;
    }
    .compose .shotwrap .rmshot {
      position: absolute; top: 4px; right: 4px; font-size: 10px;
      padding: 1px 6px; background: rgba(255,255,255,.92);
    }
    .compose .shotnote { font-size: 10px; color: #aaa; margin-top: 3px; }
    .compose .actions { display: flex; justify-content: flex-end; gap: 6px; margin-top: 6px; }
    .compose .err { color: #c0392b; font-size: 11px; margin-top: 4px; display: none; }
    .toast {
      position: fixed; z-index: 2147483002; left: 50%; bottom: 64px;
      transform: translateX(-50%); background: #1f1f1f; color: #fff;
      font-size: 12px; padding: 8px 14px; border-radius: 16px; display: none;
      max-width: 70vw;
    }
  `;
  root.appendChild(style);

  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html !== undefined) n.innerHTML = html;
    return n;
  };

  const toggle = el('button', 'toggle', '💬 리뷰');
  const panel = el('div', 'panel');
  panel.innerHTML = `
    <header>💬 리뷰 <span class="spacer"></span>
      <button class="iconbtn primary" data-act="pick">📌 코멘트 모드</button>
      <button class="iconbtn" data-act="pagecomment" title="특정 요소가 아닌 페이지 전체에 대한 코멘트">📝 페이지</button>
      <button class="iconbtn" data-act="close">✕</button>
    </header>
    <div class="settings">
      <label>Teams 스레드 URL (레지스트리에서 자동 탐색; 직접 붙여넣기로 덮어쓰기 가능)</label>
      <div class="row">
        <input type="text" placeholder="https://teams.microsoft.com/l/message/..." />
        <button class="iconbtn" data-act="save">저장</button>
      </div>
    </div>
    <div class="hint"></div>
    <div class="replies"><div class="empty">스레드 URL을 저장하면 대화를 불러와요</div></div>
  `;
  const hoverbox = el('div', 'hoverbox');
  const pinLayer = el('div', 'pinlayer');
  const compose = el('div', 'compose');
  compose.innerHTML = `
    <textarea placeholder="코멘트…"></textarea>
    <div class="shotwrap">
      <img alt="screenshot preview" />
      <button class="iconbtn rmshot" data-act="rmshot">✕ 제거</button>
    </div>
    <div class="shotnote"></div>
    <div class="err"></div>
    <div class="actions">
      <button class="iconbtn" data-act="cancel">취소</button>
      <button class="iconbtn primary" data-act="send">보내기</button>
    </div>
  `;
  const toast = el('div', 'toast');
  root.append(toggle, panel, hoverbox, pinLayer, compose, toast);

  const threadInput = panel.querySelector('input');
  const hintBox = panel.querySelector('.hint');
  const repliesBox = panel.querySelector('.replies');

  // -------------------------------------------------- thread URL lifecycle

  const getThreadUrl = () => (threadInput.value || '').trim();
  function setThreadUrl(url, { persist = false } = {}) {
    threadInput.value = url || '';
    if (persist) localStorage.setItem(LS_THREAD_KEY, getThreadUrl());
  }
  setThreadUrl(localStorage.getItem(LS_THREAD_KEY) || '');

  /**
   * Registry thread discovery (FR-3310): the box registered this dev server
   * with its Teams thread (`registry.sh register --teams-thread …`), so the
   * relay's /api/registry already knows the URL — match this page's origin
   * against each entry's dev URL. A saved/manual URL always wins.
   */
  async function discoverThread() {
    if (getThreadUrl()) return;
    try {
      const res = await fetch(`${RELAY}/api/registry`);
      if (!res.ok) return;
      const data = await res.json().catch(() => ({}));
      for (const shard of data.boxes || []) {
        for (const s of shard.servers || []) {
          if (!s || !s.teamsThreadUrl || s.status !== 'up' || !s.url) continue;
          try {
            if (new URL(s.url).origin !== location.origin) continue;
          } catch {
            continue;
          }
          if (getThreadUrl()) return; // user typed meanwhile
          setThreadUrl(s.teamsThreadUrl); // prefill only — 저장 persists
          showToast('레지스트리에서 Teams 스레드를 자동으로 찾았어요');
          if (panel.classList.contains('open')) startPolling();
          return;
        }
      }
    } catch {
      /* relay absent — stay silent; the poll path shows the hint */
    }
  }

  let toastTimer = 0;
  function showToast(msg, ms = 3500) {
    toast.textContent = msg;
    toast.style.display = 'block';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (toast.style.display = 'none'), ms);
  }

  function showHint(msg) {
    hintBox.textContent = msg;
    hintBox.classList.add('show');
  }
  function clearHint() {
    hintBox.classList.remove('show');
  }

  // ---------------------------------------------------------------- pins

  let pinSeq = 0;
  // anchorKey → { pin, anchor }; drives resolved-dimming + repositioning.
  const livePins = new Map();

  function dropPin(target, anchorKey) {
    const rect = target.getBoundingClientRect();
    const pin = el('div', 'pin');
    pin.append(el('span', '', String(++pinSeq)));
    pin.style.left = `${rect.left + window.scrollX + 6}px`;
    pin.style.top = `${rect.top + window.scrollY + 6}px`;
    pinLayer.appendChild(pin);
    if (anchorKey) linkPin(pin, anchorKey);
    return pin;
  }

  /** pin→message: clicking a linked pin reveals its reply in the panel. */
  function linkPin(pin, anchorKey) {
    if (pin.dataset.anchorKey) return;
    pin.dataset.anchorKey = anchorKey;
    pin.style.cursor = 'pointer';
    pin.title = '이 핀의 코멘트 보기';
    pin.addEventListener('click', () => revealReply(anchorKey));
    livePins.set(anchorKey, { pin, anchor: decodeAnchor(anchorKey) });
    if (resolvedAnchors.has(anchorKey)) pin.classList.add('resolved');
  }

  function revealReply(anchorKey) {
    if (!panel.classList.contains('open')) {
      openPanel();
      toggle.classList.add('active');
    }
    const item = repliesBox.querySelector(
      `.reply[data-anchor-key="${anchorKey}"]`,
    );
    if (item) {
      item.scrollIntoView({ block: 'center', behavior: 'smooth' });
      flash(item);
    } else {
      showToast('해당 코멘트를 아직 불러오지 못했어요');
    }
  }

  // `.flash`-style class rules in the shadow-root <style> cannot style
  // light-DOM host-app elements, so highlight via inline styles instead.
  function flash(target) {
    const prev = {
      outline: target.style.outline,
      outlineOffset: target.style.outlineOffset,
    };
    target.style.outline = '3px solid #ff7a00';
    target.style.outlineOffset = '2px';
    setTimeout(() => {
      target.style.outline = prev.outline;
      target.style.outlineOffset = prev.outlineOffset;
    }, 2400);
  }

  /**
   * Best-effort pin survival across SPA re-renders / HMR: re-locate each
   * linked pin's target via the cheap signals and move (or orphan-dim) it.
   * Limitations (documented): only selector/testid signals are re-checked
   * here (no text scan — this runs on every DOM settle), and a pin whose
   * element is gone stays dimmed until 📍 re-resolution or reload.
   */
  function repositionPins() {
    for (const { pin, anchor } of livePins.values()) {
      if (!anchor || typeof anchor.s !== 'string') continue;
      if (anchor.p && anchor.p !== location.pathname) {
        pin.classList.add('orphan');
        continue;
      }
      const target = quickFindTarget(anchor);
      if (target) {
        const rect = target.getBoundingClientRect();
        pin.style.left = `${rect.left + window.scrollX + 6}px`;
        pin.style.top = `${rect.top + window.scrollY + 6}px`;
        pin.classList.remove('orphan');
      } else {
        pin.classList.add('orphan');
      }
    }
  }

  let settleTimer = 0;
  const scheduleReposition = () => {
    clearTimeout(settleTimer);
    settleTimer = setTimeout(repositionPins, 800);
  };
  const mo = new MutationObserver((muts) => {
    // Ignore our own host node (its shadow tree is invisible to this
    // observer anyway, but attribute/childList changes on the host are not).
    if (muts.every((m) => m.target === host || host.contains(m.target))) return;
    if (livePins.size) scheduleReposition();
  });
  mo.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('resize', scheduleReposition);
  // Vite only emits vite:afterUpdate through import.meta.hot inside
  // transformed modules — this raw-served file never receives it. Kept as a
  // harmless hook in case a future Vite dispatches it on window.
  window.addEventListener('vite:afterUpdate', scheduleReposition);

  // ---------------------------------------------------------------- picking

  let picking = false;
  let pickTarget = null;
  let pickPin = null; // pin dropped at pick time, linked to its reply on send

  function isOwn(evt) {
    return evt.composedPath().includes(host);
  }

  function onMove(evt) {
    if (isOwn(evt)) {
      hoverbox.style.display = 'none';
      return;
    }
    const t = evt.target;
    if (!(t instanceof Element)) return;
    const r = t.getBoundingClientRect();
    Object.assign(hoverbox.style, {
      display: 'block',
      left: `${r.left}px`,
      top: `${r.top}px`,
      width: `${r.width}px`,
      height: `${r.height}px`,
    });
  }

  function onPickClick(evt) {
    if (isOwn(evt)) return;
    evt.preventDefault();
    evt.stopPropagation();
    const t = evt.target;
    if (!(t instanceof Element)) return;
    stopPicking();
    pickTarget = t;
    pickPin = dropPin(t);
    openCompose(evt.clientX, evt.clientY);
    startShotCapture(t);
  }

  function startPicking() {
    if (picking) return;
    picking = true;
    document.documentElement.style.cursor = 'crosshair';
    document.addEventListener('mousemove', onMove, true);
    document.addEventListener('click', onPickClick, true);
    showToast('코멘트할 요소를 클릭하세요 (Esc 취소)');
  }

  function stopPicking() {
    picking = false;
    document.documentElement.style.cursor = '';
    document.removeEventListener('mousemove', onMove, true);
    document.removeEventListener('click', onPickClick, true);
    hoverbox.style.display = 'none';
  }

  document.addEventListener('keydown', (evt) => {
    if (evt.key === 'Escape' && picking) stopPicking();
  });

  // ------------------------------------------------------------ screenshot
  //
  // Vendored element capture via SVG <foreignObject> (the html-to-image /
  // SitePing technique — both MIT). This file is served raw by the Vite
  // middleware, outside the module graph, so an npm dependency cannot be
  // imported here; a compact inline implementation is used instead.
  // Notes / limitations (best-effort by design; failure NEVER blocks posting):
  //  - computed styles are inlined per element → subtrees over
  //    MAX_SHOT_NODES nodes are skipped for responsiveness
  //  - external images inside the SVG rasterization do not load (browser
  //    disables subresource loading for SVG-as-image) → they render blank,
  //    but the canvas is never tainted
  //  - <canvas> children are snapshotted via their own toDataURL when clean

  function cloneWithInlineStyles(node) {
    if (node.nodeType === Node.TEXT_NODE) return node.cloneNode(true);
    if (node.nodeType !== Node.ELEMENT_NODE) return null;
    const tag = node.tagName.toLowerCase();
    if (tag === 'script' || tag === 'iframe') return null;
    let clone;
    if (tag === 'canvas') {
      clone = document.createElement('img');
      try {
        clone.src = node.toDataURL();
      } catch {
        /* tainted canvas — leave a blank img */
      }
    } else {
      clone = node.cloneNode(false);
    }
    const cs = getComputedStyle(node);
    let cssText = '';
    for (let i = 0; i < cs.length; i++) {
      const p = cs[i];
      cssText += `${p}:${cs.getPropertyValue(p)};`;
    }
    clone.setAttribute('style', cssText);
    if (tag === 'input' || tag === 'textarea') {
      clone.setAttribute('value', node.value || '');
      if (tag === 'textarea') clone.textContent = node.value || '';
    }
    if (tag !== 'canvas') {
      for (const child of node.childNodes) {
        const c = cloneWithInlineStyles(child);
        if (c) clone.appendChild(c);
      }
    }
    return clone;
  }

  async function captureElement(target) {
    const rect = target.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    if (target.querySelectorAll('*').length > MAX_SHOT_NODES) return null;
    const clone = cloneWithInlineStyles(target);
    if (!clone) return null;
    clone.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
    const w = Math.ceil(rect.width);
    const h = Math.ceil(rect.height);
    const xhtml = new XMLSerializer().serializeToString(clone);
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">` +
      `<foreignObject width="100%" height="100%">${xhtml}</foreignObject></svg>`;
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    });
    let scale = Math.min(1, MAX_SHOT_WIDTH / w);
    for (;;) {
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(w * scale));
      canvas.height = Math.max(1, Math.round(h * scale));
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');
      if (dataUrl.length <= MAX_SHOT_DATAURL || canvas.width <= 200)
        return dataUrl.length <= MAX_SHOT_DATAURL ? dataUrl : null;
      scale /= 2; // stay under the relay's 4MB decoded cap
    }
  }

  // ---------------------------------------------------------------- compose

  const composeText = compose.querySelector('textarea');
  const composeErr = compose.querySelector('.err');
  const shotWrap = compose.querySelector('.shotwrap');
  const shotImg = shotWrap.querySelector('img');
  const shotNote = compose.querySelector('.shotnote');

  let composeShot = null; // data URL attached to the next send
  let shotToken = 0; // discards captures that finish after compose changed

  function setComposeShot(dataUrl) {
    composeShot = dataUrl;
    if (dataUrl) {
      shotImg.src = dataUrl;
      shotWrap.classList.add('show');
      shotNote.textContent = '';
    } else {
      shotImg.removeAttribute('src');
      shotWrap.classList.remove('show');
    }
  }

  function startShotCapture(target) {
    const token = ++shotToken;
    shotNote.textContent = '스크린샷 캡처 중…';
    captureElement(target)
      .catch(() => null)
      .then((dataUrl) => {
        if (token !== shotToken) return; // compose moved on
        if (dataUrl) {
          setComposeShot(dataUrl);
        } else {
          // Capture is a nice-to-have — never block or nag beyond a note.
          shotNote.textContent = '스크린샷을 캡처하지 못했어요 (텍스트만 전송)';
        }
      });
  }

  function openCompose(x, y) {
    composeErr.style.display = 'none';
    composeText.value = '';
    shotToken++;
    setComposeShot(null);
    shotNote.textContent = '';
    composeText.placeholder = pickTarget
      ? '이 요소에 대한 코멘트…'
      : '이 페이지에 대한 코멘트…';
    compose.style.display = 'block';
    const w = 280;
    compose.style.left = `${Math.min(x, window.innerWidth - w - 12)}px`;
    compose.style.top = `${Math.min(y + 10, window.innerHeight - 200)}px`;
    composeText.focus();
  }

  function closeCompose() {
    compose.style.display = 'none';
    // Cancelling before send would otherwise orphan the pick-time pin.
    if (pickPin && !pickPin.dataset.anchorKey) pickPin.remove();
    pickTarget = null;
    pickPin = null;
    shotToken++;
    setComposeShot(null);
  }

  compose.addEventListener('click', async (evt) => {
    // Capture the real target NOW: once dispatch finishes (i.e. after any
    // `await`), Shadow DOM re-targets evt.target to the host element, so a
    // late `evt.target.disabled = …` would silently hit the wrong node.
    const btn = evt.target;
    const act = btn.dataset && btn.dataset.act;
    if (act === 'cancel') closeCompose();
    if (act === 'rmshot') setComposeShot(null);
    if (act === 'send') {
      const text = composeText.value.trim();
      if (!text) return;
      const threadUrl = getThreadUrl();
      if (!threadUrl) {
        composeErr.textContent = '패널에서 Teams 스레드 URL을 먼저 저장하세요';
        composeErr.style.display = 'block';
        return;
      }
      // Element picked → multi-signal v2 anchor; nothing picked → page-level
      // comment whose deep link still carries the page path ({v:2, s:null}).
      const anchor = pickTarget
        ? captureAnchorSignals(pickTarget)
        : { v: 2, s: null, p: location.pathname };
      const anchorKey = encodeAnchor(anchor);
      const deepLink =
        location.origin +
        location.pathname +
        location.search +
        `#${HASH_KEY}=${anchorKey}`;
      btn.disabled = true;
      try {
        const res = await fetch(`${RELAY}/api/teams/reply`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            threadUrl,
            text,
            deepLink,
            ...(composeShot ? { screenshotDataUrl: composeShot } : {}),
          }),
        });
        if (res.status === 401) {
          composeErr.textContent = RELAY_HINT;
          composeErr.style.display = 'block';
          showHint(RELAY_HINT);
          return;
        }
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          composeErr.textContent =
            data.error || `릴레이 오류 (HTTP ${res.status})`;
          composeErr.style.display = 'block';
          return;
        }
        if (pickPin) linkPin(pickPin, anchorKey);
        closeCompose();
        showToast('Teams 스레드에 전송됐어요 ✅');
        pollReplies();
      } catch {
        composeErr.textContent = RELAY_HINT;
        composeErr.style.display = 'block';
        showHint(RELAY_HINT);
      } finally {
        btn.disabled = false;
      }
    }
  });

  // ---------------------------------------------------------------- replies

  let pollTimer = 0;
  let pollBusy = false;
  // anchorKeys whose reply currently bears the ✅ resolved reaction.
  const resolvedAnchors = new Set();
  const resolveBusy = new Set(); // message ids with an in-flight toggle

  async function toggleResolve(messageId, on) {
    const threadUrl = getThreadUrl();
    if (!threadUrl || resolveBusy.has(messageId)) return;
    resolveBusy.add(messageId);
    try {
      const res = await fetch(`${RELAY}/api/teams/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadUrl, messageId, on }),
      });
      if (res.status === 401) {
        showHint(RELAY_HINT);
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(data.error || `해결 처리 실패 (HTTP ${res.status})`);
        return;
      }
      showToast(on ? '해결됨으로 표시했어요 ✅' : '해결 표시를 취소했어요');
      pollReplies();
    } catch {
      showHint(RELAY_HINT);
    } finally {
      resolveBusy.delete(messageId);
    }
  }

  function buildReplyItem(r, { unresolvedSection = false } = {}) {
    const item = el('div', 'reply');
    const meta = el('div', 'meta');
    const author = el('span', 'author');
    author.textContent = r.author || '(unknown)';
    const when = el('span');
    when.textContent = (r.createdDateTime || '').replace('T', ' ').slice(0, 16);
    meta.append(author, when);

    const anchorKey = anchorKeyFromText(r.text) || anchorKeyFromText(r.html);
    const anchor = anchorKey ? decodeAnchor(anchorKey) : null;
    if (anchor) {
      item.dataset.anchorKey = anchorKey;
      if (typeof anchor.s === 'string') {
        const pinBtn = el('button', 'pinbtn', '📍');
        pinBtn.title = unresolvedSection
          ? '위치 재탐색 시도'
          : '이 코멘트의 위치로 이동';
        pinBtn.addEventListener('click', () => resolveAnchor(anchor, anchorKey));
        meta.appendChild(pinBtn);
      } else {
        // Page-level comment ({v:2, s:null}) — navigate, don't pin.
        const pageBtn = el('button', 'pinbtn', '📄');
        pageBtn.title = '이 코멘트의 페이지로 이동';
        pageBtn.addEventListener('click', () => {
          if (anchor.p && anchor.p !== location.pathname) {
            if (!isSafePath(anchor.p)) {
              showToast('이 코멘트의 페이지 경로가 올바르지 않아요');
              return;
            }
            location.assign(`${anchor.p}#${HASH_KEY}=${anchorKey}`);
          } else {
            showToast('이 페이지 전체에 대한 코멘트예요');
          }
        });
        meta.appendChild(pageBtn);
      }
    }
    if (r.resolved) {
      item.classList.add('resolved');
      meta.appendChild(el('span', 'badge', '✅ 해결됨'));
    }
    if (r.id) {
      const btn = el('button', 'resolvebtn');
      btn.textContent = r.resolved ? '↩ 해결 취소' : '✅ 해결';
      btn.title = r.resolved
        ? '✅ 반응을 제거해 다시 열어요'
        : '✅ 반응으로 해결 표시 (내 계정)';
      btn.addEventListener('click', () => toggleResolve(r.id, !r.resolved));
      meta.appendChild(btn);
    }
    const body = el('div', 'body');
    body.textContent = r.text || '';
    item.append(meta, body);
    return { item, anchorKey, anchor };
  }

  function renderReplies(replies) {
    // Preserve scroll position unless the user was already at the bottom
    // (a 12s full rebuild must not fight manual scrollback).
    const atBottom =
      repliesBox.scrollTop + repliesBox.clientHeight >=
      repliesBox.scrollHeight - 8;
    const prevScroll = repliesBox.scrollTop;
    repliesBox.textContent = '';
    resolvedAnchors.clear();
    if (!replies.length) {
      repliesBox.appendChild(el('div', 'empty', '아직 답글이 없어요'));
      return;
    }
    const main = [];
    const unresolved = [];
    for (const r of replies) {
      const built = buildReplyItem(r);
      if (built.anchorKey && r.resolved) resolvedAnchors.add(built.anchorKey);
      // Same-page element anchors whose cheap signals no longer match go to
      // the explicit "위치를 찾지 못한 코멘트" section — readable, unpinned,
      // with 📍 still running the full (text-scan) re-resolution on demand.
      const a = built.anchor;
      if (
        a &&
        typeof a.s === 'string' &&
        (!a.p || a.p === location.pathname) &&
        !quickFindTarget(a)
      ) {
        unresolved.push(buildReplyItem(r, { unresolvedSection: true }).item);
      } else {
        main.push(built.item);
      }
    }
    for (const item of main) repliesBox.appendChild(item);
    if (unresolved.length) {
      repliesBox.appendChild(
        el('div', 'section', '⚠️ 위치를 찾지 못한 코멘트 — UI가 바뀌었을 수 있어요'),
      );
      for (const item of unresolved) repliesBox.appendChild(item);
    }
    // Dim pins whose reply is resolved.
    for (const [key, { pin }] of livePins) {
      pin.classList.toggle('resolved', resolvedAnchors.has(key));
    }
    repliesBox.scrollTop = atBottom ? repliesBox.scrollHeight : prevScroll;
  }

  async function pollReplies() {
    const threadUrl = getThreadUrl();
    if (!threadUrl || pollBusy || !panel.classList.contains('open')) return;
    pollBusy = true;
    try {
      const res = await fetch(
        `${RELAY}/api/teams/replies?threadUrl=${encodeURIComponent(threadUrl)}`,
      );
      if (res.status === 401) {
        showHint(RELAY_HINT);
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showHint(data.error || `릴레이 오류 (HTTP ${res.status})`);
        return;
      }
      clearHint();
      renderReplies(data.replies || []);
    } catch {
      showHint(RELAY_HINT);
    } finally {
      pollBusy = false;
    }
  }

  function startPolling() {
    stopPolling();
    pollReplies();
    pollTimer = setInterval(pollReplies, POLL_MS);
  }
  function stopPolling() {
    clearInterval(pollTimer);
  }

  // ---------------------------------------------------------------- panel

  function openPanel() {
    panel.classList.add('open');
    startPolling();
  }
  function closePanel() {
    panel.classList.remove('open');
    stopPolling();
  }

  toggle.addEventListener('click', () => {
    if (panel.classList.contains('open')) {
      closePanel();
      toggle.classList.remove('active');
    } else {
      openPanel();
      toggle.classList.add('active');
    }
  });

  panel.addEventListener('click', (evt) => {
    const act = evt.target.dataset && evt.target.dataset.act;
    if (act === 'close') {
      closePanel();
      toggle.classList.remove('active');
    }
    if (act === 'pick') startPicking();
    if (act === 'pagecomment') {
      // Page-level comment: compose without a pick — no pin, page deep link.
      pickTarget = null;
      pickPin = null;
      openCompose(
        Math.max(12, window.innerWidth / 2 - 140),
        window.innerHeight / 3,
      );
    }
    if (act === 'save') {
      setThreadUrl(threadInput.value, { persist: true });
      showToast('스레드 URL 저장됨');
      startPolling();
    }
  });

  // ------------------------------------------------------- anchor resolve

  function resolveAnchor(anchor, anchorKey, attempt = 0) {
    if (anchor.p && anchor.p !== location.pathname && attempt === 0) {
      if (!isSafePath(anchor.p)) {
        showToast('이 코멘트의 페이지 경로가 올바르지 않아요');
        return;
      }
      // Cross-page anchor: navigate there with the fragment; the deep-link
      // boot resolves it after the (full) load.
      showToast(`다른 페이지의 코멘트예요 — 이동합니다: ${anchor.p}`);
      setTimeout(() => {
        location.assign(`${anchor.p}#${HASH_KEY}=${anchorKey}`);
      }, 600);
      return;
    }
    if (anchor.s === null) {
      showToast('이 페이지 전체에 대한 코멘트예요');
      return;
    }
    const target = findAnchorTarget(anchor);
    if (target) {
      target.scrollIntoView({ block: 'center', behavior: 'smooth' });
      flash(target);
      dropPin(target, anchorKey);
      return;
    }
    if (attempt < 20) {
      // SPA content renders asynchronously — retry briefly.
      setTimeout(() => resolveAnchor(anchor, anchorKey, attempt + 1), 500);
    } else {
      showToast(
        '앵커 요소를 찾지 못했어요 — 패널의 "위치를 찾지 못한 코멘트"에서 내용은 볼 수 있어요',
      );
    }
  }

  function resolveFromHash() {
    const hashMatch = /[#&]bai-review=([A-Za-z0-9+/=_-]+)/.exec(location.hash);
    if (!hashMatch) return;
    const anchor = decodeAnchor(hashMatch[1]);
    if (anchor) resolveAnchor(anchor, hashMatch[1]);
    else showToast('딥링크 앵커를 해석하지 못했어요');
  }

  resolveFromHash();
  // SPA-internal hash navigation (deep link pasted while the app is open).
  window.addEventListener('hashchange', resolveFromHash);

  discoverThread();
})();
