/**
 * FR-3791 PROTOTYPE — review overlay v3 READ SIDE. THROWAWAY.
 *
 * Rebuilt from the FR-3309/FR-3310 client on the FR-3782 map decisions:
 *  - pins come from the DEV SERVER (`/__review/pins`), which reads the PR
 *    (GitHub) and its Teams thread read-only and merges `#bai=v3` ids
 *    (FR-3785/3788/3789). No board relay, no Teams writes.
 *  - deep links `#bai=v3.<id>[.<anchor>]` open from any channel; the URL
 *    carries path + query, so `q` is applied before anchoring.
 *  - resolved pins dim; replied-but-unresolved pins show "awaiting check"
 *    (FR-3793); orphaned anchors fall into a list-panel section.
 *  - write side is reduced to "copy block to clipboard" (paste it into a
 *    GitHub PR comment / Teams reply / Claude prompt yourself).
 *
 * Multi-signal anchor resolution machinery is carried over from #8249.
 */

(() => {
  if (window.__baiReviewOverlay) return;
  window.__baiReviewOverlay = true;

  const HASH_RE = /[#&]bai=v3\.(c_[a-z2-7]{7})(?:\.([A-Za-z0-9_-]{8,}))?/;
  const POLL_VISIBLE_MS = 25000;
  const POLL_IDLE_MS = 120000;
  const IDLE_AFTER_MS = 5 * 60 * 1000;

  const esc = (v) => (window.CSS && CSS.escape ? CSS.escape(v) : v);
  const normText = (s) => (s || '').replace(/\s+/g, ' ').trim();

  // ------------------------------------------------------------ v3 codec

  const b64urlFromBytes = (bytes) => {
    let bin = '';
    for (const b of bytes) bin += String.fromCharCode(b);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };
  const bytesFromB64url = (s) => {
    const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
    return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  };

  async function pipeStream(bytes, stream) {
    const out = new Response(
      new Blob([bytes]).stream().pipeThrough(stream),
    ).arrayBuffer();
    return new Uint8Array(await out);
  }

  async function encodeAnchorV3(anchor) {
    const raw = new TextEncoder().encode(JSON.stringify(anchor));
    const deflated = await pipeStream(raw, new CompressionStream('deflate-raw'));
    return b64urlFromBytes(deflated);
  }

  const isSafePath = (p) => typeof p === 'string' && /^\/(?!\/)/.test(p);

  async function decodeAnchorV3(b64url) {
    try {
      const inflated = await pipeStream(
        bytesFromB64url(b64url),
        new DecompressionStream('deflate-raw'),
      );
      const obj = JSON.parse(new TextDecoder().decode(inflated));
      if (!obj || typeof obj !== 'object') return null;
      if (obj.p != null && !isSafePath(obj.p)) return null;
      return obj;
    } catch {
      return null;
    }
  }

  // Compact SHA-256 (public-domain style) — crypto.subtle is unavailable on
  // the plain-http gateway origin (same gap as navigator.clipboard, FR-3786).
  function sha256Bytes(msgBytes) {
    const K = [];
    const H = [];
    for (let p = 2, n = 0; n < 64; p++) {
      let prime = true;
      for (let f = 2; f * f <= p; f++) if (p % f === 0) prime = false;
      if (!prime) continue;
      if (n < 8) H[n] = (Math.pow(p, 0.5) * 2 ** 32) | 0;
      K[n] = (Math.pow(p, 1 / 3) * 2 ** 32) | 0;
      n++;
    }
    const rr = (x, n2) => (x >>> n2) | (x << (32 - n2));
    const len = msgBytes.length;
    const bitLen = len * 8;
    const withPad = new Uint8Array(((len + 8) >> 6 << 6) + 64);
    withPad.set(msgBytes);
    withPad[len] = 0x80;
    const dv = new DataView(withPad.buffer);
    dv.setUint32(withPad.length - 4, bitLen >>> 0);
    dv.setUint32(withPad.length - 8, Math.floor(bitLen / 2 ** 32));
    const w = new Int32Array(64);
    const h = H.slice();
    for (let i = 0; i < withPad.length; i += 64) {
      for (let t = 0; t < 16; t++) w[t] = dv.getInt32(i + t * 4);
      for (let t = 16; t < 64; t++) {
        const s0 = rr(w[t - 15], 7) ^ rr(w[t - 15], 18) ^ (w[t - 15] >>> 3);
        const s1 = rr(w[t - 2], 17) ^ rr(w[t - 2], 19) ^ (w[t - 2] >>> 10);
        w[t] = (w[t - 16] + s0 + w[t - 7] + s1) | 0;
      }
      let [a, b, c, d, e, f, g, hh] = h;
      for (let t = 0; t < 64; t++) {
        const S1 = rr(e, 6) ^ rr(e, 11) ^ rr(e, 25);
        const ch = (e & f) ^ (~e & g);
        const t1 = (hh + S1 + ch + K[t] + w[t]) | 0;
        const S0 = rr(a, 2) ^ rr(a, 13) ^ rr(a, 22);
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const t2 = (S0 + maj) | 0;
        hh = g; g = f; f = e; e = (d + t1) | 0;
        d = c; c = b; b = a; a = (t1 + t2) | 0;
      }
      h[0] = (h[0] + a) | 0; h[1] = (h[1] + b) | 0;
      h[2] = (h[2] + c) | 0; h[3] = (h[3] + d) | 0;
      h[4] = (h[4] + e) | 0; h[5] = (h[5] + f) | 0;
      h[6] = (h[6] + g) | 0; h[7] = (h[7] + hh) | 0;
    }
    const outBytes = new Uint8Array(32);
    const odv = new DataView(outBytes.buffer);
    for (let i2 = 0; i2 < 8; i2++) odv.setInt32(i2 * 4, h[i2]);
    return outBytes;
  }

  const B32 = 'abcdefghijklmnopqrstuvwxyz234567';
  function base32(bytes, chars) {
    let bits = 0;
    let value = 0;
    let out = '';
    for (const b of bytes) {
      value = (value << 8) | b;
      bits += 8;
      while (bits >= 5 && out.length < chars) {
        out += B32[(value >>> (bits - 5)) & 31];
        bits -= 5;
      }
      if (out.length >= chars) break;
    }
    return out;
  }

  /** id = 'c_' + base32(sha256(pr + anchorB64 + at))[0:7]  (FR-3785). */
  function pinId(pr, anchorB64, at) {
    const bytes = new TextEncoder().encode(`${pr}${anchorB64}${at}`);
    return `c_${base32(sha256Bytes(bytes), 7)}`;
  }

  // ------------------------------------------------- anchor signals (#8249)

  function buildSelector(el2) {
    const testid = el2.getAttribute && el2.getAttribute('data-testid');
    if (testid) return `[data-testid="${esc(testid)}"]`;
    if (el2.id) return `#${esc(el2.id)}`;
    const parts = [];
    let node = el2;
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

  /** v3 payload {v:3, s, tid, tag, txt, rect, p, q} — v2 signals + query. */
  function captureAnchorSignals(target) {
    const anchor = { v: 3, s: buildSelector(target), p: location.pathname };
    const q = location.search.replace(/^\?/, '');
    if (q) anchor.q = q;
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

  const textMatches = (el2, txt) => {
    if (!txt) return true;
    const t = normText(el2.innerText || el2.textContent).slice(0, 160);
    return t.includes(txt) || txt.includes(t.slice(0, 64));
  };
  const safeTag = (tag) => (/^[a-z][a-z0-9-]*$/.test(tag || '') ? tag : '*');

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
        return rectProjectedTarget(container, anchor) || container;
      }
    }
    return null;
  }

  function findAnchorTarget(anchor) {
    if (!anchor || typeof anchor.s !== 'string') return null;
    let weak = null;
    try {
      const bySel = document.querySelector(anchor.s);
      if (bySel) {
        if (textMatches(bySel, anchor.txt)) return bySel;
        weak = bySel;
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
        if (!best || best.contains(c)) best = c;
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

  // ------------------------------------------------------------- host UI

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
    .toggle .cnt {
      background: #fff; color: #ff7a00; border-radius: 10px; padding: 0 6px;
      font-size: 11px; margin-left: 6px;
    }
    .panel {
      position: fixed; top: 0; right: 0; bottom: 0; width: 340px;
      z-index: 2147483000; background: #fff; border-left: 1px solid #ddd;
      box-shadow: -4px 0 16px rgba(0,0,0,.12); display: none;
      flex-direction: column; color: #1f1f1f;
    }
    .panel.open { display: flex; }
    .panel header {
      padding: 10px 12px; border-bottom: 1px solid #eee; font-weight: 700;
      font-size: 14px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
    }
    .panel header .spacer { flex: 1; }
    .iconbtn {
      border: 1px solid #ddd; background: #fafafa; border-radius: 6px;
      cursor: pointer; font-size: 12px; padding: 4px 8px;
    }
    .iconbtn.primary { background: #ff7a00; border-color: #ff7a00; color: #fff; }
    .srcline {
      padding: 6px 12px; border-bottom: 1px solid #eee; font-size: 11px;
      color: #888; display: flex; gap: 10px; flex-wrap: wrap;
    }
    .srcline .ok { color: #237804; }
    .srcline .bad { color: #c0392b; }
    .items { flex: 1; overflow-y: auto; padding: 8px 12px; }
    .item { border-bottom: 1px solid #f0f0f0; padding: 8px 0; font-size: 12px; }
    .item.resolved { opacity: .5; }
    .item.hl { background: #fff7e6; margin: 0 -6px; padding: 8px 6px; border-radius: 6px; }
    .item .meta { color: #888; font-size: 11px; margin-bottom: 3px; display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
    .item .meta .author { color: #333; font-weight: 600; }
    .item .body { white-space: pre-wrap; word-break: break-word; }
    .item .lastreply {
      margin-top: 4px; padding: 4px 6px; border-left: 3px solid #91caff;
      background: #f0f8ff; color: #444; font-size: 11px;
      white-space: pre-wrap; word-break: break-word;
    }
    .item .actions { margin-top: 4px; display: flex; gap: 6px; }
    .item .actions button { font-size: 11px; }
    .badge {
      font-size: 10px; border-radius: 8px; padding: 0 6px; border: 1px solid;
    }
    .badge.resolved { color: #237804; background: #f6ffed; border-color: #b7eb8f; }
    .badge.replied { color: #0958d9; background: #e6f4ff; border-color: #91caff; }
    .badge.hint { color: #874d00; background: #fff7e6; border-color: #ffd591; }
    .badge.outdated { color: #999; background: #fafafa; border-color: #ddd; }
    .badge.src { color: #555; background: #fafafa; border-color: #ddd; text-decoration: none; }
    .section {
      font-size: 11px; color: #874d00; background: #fff7e6;
      border: 1px solid #ffd591; border-radius: 6px; padding: 4px 8px;
      margin: 10px 0 2px;
    }
    .section.other { color: #555; background: #fafafa; border-color: #ddd; }
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
      font-size: 11px; font-weight: 700; cursor: pointer; pointer-events: auto;
      box-shadow: 0 1px 4px rgba(0,0,0,.35);
    }
    .pin > span { transform: rotate(45deg); }
    .pin.replied { background: #1677ff; }
    .pin.hint { background: #d4a017; }
    .pin.resolved { opacity: .35; filter: grayscale(.9); }
    .pin.outdated { background: #999; border: 2px dashed #666; }
    .pin.orphan { opacity: .3; }
    .pin.pulse { animation: baipulse 1s ease-in-out 4; }
    @keyframes baipulse {
      0%,100% { box-shadow: 0 1px 4px rgba(0,0,0,.35); }
      50% { box-shadow: 0 0 0 8px rgba(255,122,0,.35); }
    }
    .pinlayer { position: absolute; top: 0; left: 0; width: 0; height: 0; }
    .compose {
      position: fixed; z-index: 2147483001; width: 300px; background: #fff;
      border: 1px solid #ddd; border-radius: 8px; padding: 10px;
      box-shadow: 0 4px 18px rgba(0,0,0,.2); display: none;
    }
    .compose .pathlabel { font-size: 10px; color: #888; margin-bottom: 4px; word-break: break-all; }
    .compose textarea {
      width: 100%; height: 64px; font-size: 12px; padding: 6px;
      border: 1px solid #ddd; border-radius: 6px; resize: vertical;
    }
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

  const toggle = el('button', 'toggle', '📍 리뷰 핀');
  const panel = el('div', 'panel');
  panel.innerHTML = `
    <header>📍 리뷰 핀 <span class="spacer"></span>
      <button class="iconbtn primary" data-act="pick">📋 코멘트 복사 모드</button>
      <button class="iconbtn" data-act="refresh" title="지금 새로고침">↻</button>
      <button class="iconbtn" data-act="close">✕</button>
    </header>
    <div class="srcline"></div>
    <div class="items"><div class="empty">핀을 불러오는 중…</div></div>
  `;
  const hoverbox = el('div', 'hoverbox');
  const pinLayer = el('div', 'pinlayer');
  const compose = el('div', 'compose');
  compose.innerHTML = `
    <div class="pathlabel"></div>
    <textarea placeholder="이 요소에 대한 코멘트…"></textarea>
    <div class="err"></div>
    <div class="actions">
      <button class="iconbtn" data-act="cancel">취소</button>
      <button class="iconbtn primary" data-act="copy">📋 블록 복사</button>
    </div>
  `;
  const toast = el('div', 'toast');
  root.append(toggle, panel, hoverbox, pinLayer, compose, toast);

  const srcLine = panel.querySelector('.srcline');
  const itemsBox = panel.querySelector('.items');
  const toggleCnt = el('span', 'cnt', '');

  let toastTimer = 0;
  function showToast(msg, ms = 3500) {
    toast.textContent = msg;
    toast.style.display = 'block';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (toast.style.display = 'none'), ms);
  }

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

  // ------------------------------------------------------------ pin state

  // id → { data, anchor (decoded), pinEl, located: Element|null }
  const pinState = new Map();
  let serverState = null; // /__review/state
  let highlightId = null; // deep-link target awaiting data
  let lastPayload = '';
  let lastChangeAt = Date.now();

  const pinClass = (d) =>
    d.resolved
      ? 'resolved'
      : d.outdated
        ? 'outdated'
        : d.replies && d.replies.length
          ? 'replied'
          : d.resolvedHint
            ? 'hint'
            : '';

  const stateBadge = (d) => {
    if (d.resolved)
      return `<span class="badge resolved">✅ 해결됨${d.resolvedBy ? ` · ${d.resolvedBy}` : ''}</span>`;
    if (d.outdated) return '<span class="badge outdated">⌛ outdated</span>';
    if (d.replies && d.replies.length)
      return '<span class="badge replied">💬 답변 있음 — 확인 후 해결해 주세요</span>';
    if (d.resolvedHint) return '<span class="badge hint">👍 처리된 듯</span>';
    return '';
  };

  function positionPin(st) {
    const target = st.anchor ? quickFindTarget(st.anchor) : null;
    st.located = target;
    if (target) {
      const rect = target.getBoundingClientRect();
      st.pinEl.style.left = `${rect.left + window.scrollX + 6}px`;
      st.pinEl.style.top = `${rect.top + window.scrollY + 6}px`;
      st.pinEl.classList.remove('orphan');
      st.pinEl.style.display = '';
    } else {
      st.pinEl.classList.add('orphan');
      // Keep the last position if we had one; hide if never located.
      if (!st.pinEl.style.left) st.pinEl.style.display = 'none';
    }
  }

  function onCurrentPage(anchor) {
    return anchor && anchor.p === location.pathname;
  }

  function renderPins(pins) {
    const seen = new Set();
    for (const d of pins) {
      const st = pinState.get(d.id) || {};
      st.data = d;
      if (!st.anchorReady) {
        st.anchorReady = true;
        st.anchor = d.anchor || null; // server pre-decodes; fallback below
        if (!st.anchor && d.anchorB64) {
          decodeAnchorV3(d.anchorB64).then((a) => {
            st.anchor = a;
            refreshPinLayer();
          });
        }
      }
      pinState.set(d.id, st);
      seen.add(d.id);
    }
    for (const [id, st] of pinState) {
      if (!seen.has(id)) {
        if (st.pinEl) st.pinEl.remove();
        pinState.delete(id);
      }
    }
    // Stable numbering: createdAt rank, assigned per payload — never
    // re-counted per render pass, so page pins, panel order, and numbers
    // stay in sync and don't shift when an anchor is located late.
    [...pinState.values()]
      .sort((a, b) =>
        String(a.data.createdAt || '9999').localeCompare(
          String(b.data.createdAt || '9999'),
        ),
      )
      .forEach((st, i) => {
        st.num = i + 1;
      });
    refreshPinLayer();
    renderPanel();
    const onPage = [...pinState.values()].filter(
      (st) => onCurrentPage(st.anchor) && !st.data.resolved,
    ).length;
    toggleCnt.textContent = String(onPage);
    if (onPage && !toggleCnt.parentNode) toggle.appendChild(toggleCnt);
    if (!onPage && toggleCnt.parentNode) toggleCnt.remove();
  }

  function refreshPinLayer() {
    for (const st of pinState.values()) {
      const show = onCurrentPage(st.anchor) && typeof st.anchor.s === 'string';
      if (!show) {
        if (st.pinEl) {
          st.pinEl.remove();
          st.pinEl = null;
        }
        continue;
      }
      if (!st.pinEl) {
        st.pinEl = el('div', 'pin');
        st.pinEl.appendChild(el('span'));
        st.pinEl.title = '이 핀의 코멘트 보기';
        const id = st.data.id;
        st.pinEl.addEventListener('click', () => revealItem(id));
        pinLayer.appendChild(st.pinEl);
      }
      st.pinEl.querySelector('span').textContent = String(st.num || '·');
      st.pinEl.className = `pin ${pinClass(st.data)}`;
      positionPin(st);
      if (st.data.id === highlightId) st.pinEl.classList.add('pulse');
    }
  }

  let settleTimer = 0;
  const scheduleReposition = () => {
    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => {
      for (const st of pinState.values()) if (st.pinEl) positionPin(st);
      // located-ness feeds the panel's orphan section — keep it in sync.
      renderPanel();
    }, 800);
  };
  const mo = new MutationObserver((muts) => {
    if (muts.every((m) => m.target === host || host.contains(m.target))) return;
    if (pinState.size) scheduleReposition();
  });
  mo.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('resize', scheduleReposition);

  // ------------------------------------------------------------- panel

  const age = (iso) => {
    if (!iso) return '';
    const s = (Date.now() - new Date(iso).getTime()) / 1000;
    if (s < 3600) return `${Math.max(1, Math.round(s / 60))}m`;
    if (s < 86400) return `${Math.round(s / 3600)}h`;
    return `${Math.round(s / 86400)}d`;
  };

  function buildItem(st) {
    const d = st.data;
    const item = el('div', `item ${d.resolved ? 'resolved' : ''}`);
    item.dataset.pinId = d.id;
    const meta = el('div', 'meta');
    const author = el('span', 'author');
    author.textContent = `#${st.num || '·'} ${d.author || '(unknown)'}`;
    meta.append(author, el('span', '', age(d.createdAt)));
    if (!onCurrentPage(st.anchor)) {
      meta.appendChild(el('span', 'badge outdated', '다른 페이지'));
    } else if (
      st.anchor &&
      typeof st.anchor.s === 'string' &&
      !st.located &&
      !d.resolved
    ) {
      meta.appendChild(el('span', 'badge hint', '⚠️ 위치 못 찾음'));
    }
    if (d.github && d.github.url) {
      const a = el('a', 'badge src', '🐙 GitHub');
      a.href = d.github.url;
      a.target = '_blank';
      meta.appendChild(a);
    }
    if (d.teams) meta.appendChild(el('span', 'badge src', '💬 Teams'));
    const sb = stateBadge(d);
    if (sb) meta.insertAdjacentHTML('beforeend', sb);
    const body = el('div', 'body');
    body.textContent = d.text || '(no text)';
    item.append(meta, body);
    if (d.replies && d.replies.length) {
      const last = d.replies[d.replies.length - 1];
      const lr = el('div', 'lastreply');
      lr.textContent = `↳ ${last.author || '?'}: ${(last.body || '').slice(0, 160)}`;
      if (d.replies.length > 1) lr.textContent += `  (+${d.replies.length - 1})`;
      item.appendChild(lr);
    }
    const actions = el('div', 'actions');
    const current = onCurrentPage(st.anchor);
    if (current && typeof (st.anchor || {}).s === 'string') {
      const locate = el('button', 'iconbtn', '📍 위치');
      locate.addEventListener('click', () => locatePin(d.id, { full: true }));
      actions.appendChild(locate);
    } else if (st.anchor && isSafePath(st.anchor.p)) {
      const open = el('button', 'iconbtn', '↗ 페이지 열기');
      open.addEventListener('click', () => {
        const q = st.anchor.q ? `?${st.anchor.q}` : '';
        location.assign(
          `${st.anchor.p}${q}#bai=v3.${d.id}${d.anchorB64 ? `.${d.anchorB64}` : ''}`,
        );
      });
      actions.appendChild(open);
    }
    const copy = el('button', 'iconbtn', '🔗 링크 복사');
    copy.addEventListener('click', () => {
      const q = st.anchor && st.anchor.q ? `?${st.anchor.q}` : '';
      const p = st.anchor ? st.anchor.p : location.pathname;
      copyText(
        `${location.origin}${p}${q}#bai=v3.${d.id}${d.anchorB64 ? `.${d.anchorB64}` : ''}`,
      );
    });
    actions.appendChild(copy);
    item.appendChild(actions);
    return item;
  }

  function renderPanel() {
    itemsBox.textContent = '';
    const states = [...pinState.values()].sort(
      (a, b) => (a.num || 1e9) - (b.num || 1e9),
    );
    if (!states.length) {
      itemsBox.appendChild(
        el('div', 'empty', 'PR/Teams에서 발견된 핀이 없어요 — 📋 복사 모드로 첫 코멘트를 만들어 보세요'),
      );
      return;
    }
    // One flat list in fixed number order — items never move between
    // sections; a late anchor location updates the ⚠️ badge in place
    // instead of reordering the list.
    for (const st of states) itemsBox.appendChild(buildItem(st));
  }

  function revealItem(id) {
    if (!panel.classList.contains('open')) openPanel();
    const item = itemsBox.querySelector(`.item[data-pin-id="${id}"]`);
    if (item) {
      item.scrollIntoView({ block: 'center', behavior: 'smooth' });
      item.classList.add('hl');
      setTimeout(() => item.classList.remove('hl'), 2400);
    }
  }

  /** Locate a pin's element on this page (full = expensive text scan too). */
  function locatePin(id, { full = false } = {}) {
    const st = pinState.get(id);
    if (!st || !st.anchor) return;
    const target = full ? findAnchorTarget(st.anchor) : quickFindTarget(st.anchor);
    if (target) {
      target.scrollIntoView({ block: 'center', behavior: 'smooth' });
      flash(target);
      st.located = target;
      if (st.pinEl) {
        positionPin(st);
        st.pinEl.classList.add('pulse');
        setTimeout(() => st.pinEl && st.pinEl.classList.remove('pulse'), 4200);
      }
    } else {
      showToast('앵커 요소를 찾지 못했어요 — UI가 바뀌었을 수 있어요');
    }
  }

  // ------------------------------------------------------------- polling

  let pollTimer = 0;
  let pollBusy = false;

  async function fetchPins() {
    if (pollBusy) return;
    pollBusy = true;
    try {
      const res = await fetch('/__review/pins');
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.error) {
        srcLine.innerHTML = `<span class="bad">서버: ${data.error || res.status}</span>`;
        return;
      }
      const payload = JSON.stringify(data.pins || []);
      if (payload !== lastPayload) {
        lastPayload = payload;
        lastChangeAt = Date.now();
      }
      const s = data.sources || {};
      const fmt = (name, v) =>
        v && v.ok
          ? `<span class="ok">${name} ✓ ${v.count}</span>`
          : `<span class="bad">${name} ✗ ${(v && v.error) || '?'}</span>`;
      srcLine.innerHTML =
        `${data.pr ? `PR #${data.pr.number}` : 'PR 없음'} · ` +
        `${fmt('GitHub', s.github)} · ${fmt('Teams', s.teams)}`;
      renderPins(data.pins || []);
      if (highlightId && pinState.has(highlightId)) {
        const id = highlightId;
        onDeepLinkDataReady(id);
      }
    } catch {
      srcLine.innerHTML = '<span class="bad">dev server unreachable</span>';
    } finally {
      pollBusy = false;
    }
  }

  function schedulePoll() {
    clearTimeout(pollTimer);
    if (document.hidden) return; // FR-3788/3789: stop when hidden
    const idle = Date.now() - lastChangeAt > IDLE_AFTER_MS;
    pollTimer = setTimeout(async () => {
      await fetchPins();
      schedulePoll();
    }, idle ? POLL_IDLE_MS : POLL_VISIBLE_MS);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearTimeout(pollTimer);
    else {
      fetchPins();
      schedulePoll();
    }
  });
  window.addEventListener('focus', () => {
    fetchPins();
  });

  // ------------------------------------------------------------ deep link

  let navigatedForHash = false;

  async function handleFragment() {
    const m = HASH_RE.exec(location.hash);
    if (!m) return;
    const [, id, anchorB64] = m;
    highlightId = id;
    if (anchorB64) {
      const anchor = await decodeAnchorV3(anchorB64);
      if (!anchor) {
        showToast('딥링크 앵커를 해석하지 못했어요');
        return;
      }
      const wantQ = anchor.q ? `?${anchor.q}` : '';
      if (
        !navigatedForHash &&
        isSafePath(anchor.p) &&
        (anchor.p !== location.pathname || wantQ !== location.search)
      ) {
        // FR-3785: apply path + query BEFORE anchoring.
        navigatedForHash = true;
        location.assign(`${anchor.p}${wantQ}${location.hash}`);
        return;
      }
      // Anchor immediately from the self-contained payload; the id lookup
      // enriches the pin once /__review/pins returns.
      let attempt = 0;
      const tryResolve = () => {
        const target = findAnchorTarget(anchor);
        if (target) {
          target.scrollIntoView({ block: 'center', behavior: 'smooth' });
          flash(target);
          if (!pinState.has(id)) {
            pinState.set(id, {
              data: {
                id,
                text: '(채널에서 코멘트를 불러오는 중…)',
                author: null,
                replies: [],
              },
              anchor,
              anchorReady: true,
              pinEl: null,
              located: target,
            });
          }
          refreshPinLayer();
          openPanel();
        } else if (attempt++ < 20) {
          setTimeout(tryResolve, 500);
        } else {
          showToast('앵커 요소를 찾지 못했어요 — 패널에서 내용은 볼 수 있어요');
          openPanel();
        }
      };
      tryResolve();
    } else {
      // Short form: pin only after the id is found in a channel.
      openPanel();
      showToast('채널에서 핀을 찾는 중…');
    }
    fetchPins();
  }

  function onDeepLinkDataReady(id) {
    const st = pinState.get(id);
    if (!st) return;
    highlightId = null;
    if (onCurrentPage(st.anchor)) {
      locatePin(id, { full: true });
    } else if (st.anchor && isSafePath(st.anchor.p) && !navigatedForHash) {
      navigatedForHash = true;
      const q = st.anchor.q ? `?${st.anchor.q}` : '';
      location.assign(`${st.anchor.p}${q}${location.hash}`);
      return;
    }
    revealItem(id);
  }

  window.addEventListener('hashchange', () => {
    navigatedForHash = false;
    handleFragment();
  });

  // -------------------------------------------------------- copy composer

  function copyText(text) {
    const done = () => showToast('클립보드에 복사했어요 — PR 코멘트/Teams에 붙여넣으세요 📋');
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, () => legacyCopy(text, done));
    } else {
      // Plain-http gateway origin: no navigator.clipboard (FR-3786).
      legacyCopy(text, done);
    }
  }
  function legacyCopy(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0';
    root.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy') ? done() : showToast('복사 실패');
    } finally {
      ta.remove();
    }
  }

  /** Path label: route title › testid landmark › tag "text" (FR-3785). */
  function pathLabel(target, anchor) {
    const seg = location.pathname.split('/').filter(Boolean);
    // Prototype approximation of the route's English i18n title.
    const route = seg.length
      ? seg[seg.length - 1].replace(/^\w/, (c) => c.toUpperCase())
      : 'Home';
    const parts = [route];
    if (anchor.tid) parts.push(anchor.tid);
    const txt = anchor.txt ? ` "${anchor.txt.slice(0, 40)}"` : '';
    parts.push(`${anchor.tag}${txt}`);
    return parts.join(' › ');
  }

  /**
   * React component identity via react-grab's global API — the app already
   * loads it in dev (react/src/index.tsx), so no import is needed here.
   */
  async function reactInfo(target) {
    const api = window.__REACT_GRAB__;
    if (!api) return null;
    try {
      const name = api.getDisplayName(target);
      const src = await api.getSource(target).catch(() => null);
      if (!name && !src) return null;
      const file =
        src && src.filePath
          ? src.filePath.replace(/^.*\/(react\/|packages\/)/, '$1')
          : null;
      const loc = file
        ? `${file}${src.lineNumber ? `:${src.lineNumber}` : ''}`
        : null;
      return { name: (src && src.componentName) || name || null, loc };
    } catch {
      return null;
    }
  }

  async function buildBlock(target, text) {
    const anchor = captureAnchorSignals(target);
    const anchorB64 = await encodeAnchorV3(anchor);
    const prNum = serverState && serverState.pr ? serverState.pr.number : 0;
    const at = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
    const id = pinId(prNum, anchorB64, at);
    const q = anchor.q ? `?${anchor.q}` : '';
    const url = `${location.origin}${anchor.p}${q}#bai=v3.${id}.${anchorB64}`;
    const label = pathLabel(target, anchor);
    const info = await reactInfo(target);
    const reactLine =
      info && (info.name || info.loc)
        ? [`> ⚛️ in ${info.name || '?'}${info.loc ? ` (at ${info.loc})` : ''}`]
        : [];
    const block = [
      `> 📍 **${label}** · \`${id}\``,
      ...reactLine,
      ...text.split('\n').map((l) => `> ${l}`),
      `> [Open on dev server](${url})`,
      `<!-- bai-review v3 id=${id} pr=${prNum} at=${at} -->`,
    ].join('\n');
    return { block, id, url, anchor, anchorB64 };
  }

  // picking
  let picking = false;
  let pickTarget = null;

  const isOwn = (evt) => evt.composedPath().includes(host);

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
    openCompose(evt.clientX, evt.clientY);
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

  const composeText = compose.querySelector('textarea');
  const composeErr = compose.querySelector('.err');
  const composeLabel = compose.querySelector('.pathlabel');

  function openCompose(x, y) {
    composeErr.style.display = 'none';
    composeText.value = '';
    composeLabel.textContent = pickTarget
      ? pathLabel(pickTarget, captureAnchorSignals(pickTarget))
      : '';
    if (pickTarget) {
      const t = pickTarget;
      reactInfo(t).then((info) => {
        if (pickTarget !== t || !info || (!info.name && !info.loc)) return;
        composeLabel.textContent += `  ·  ⚛️ ${info.name || '?'}${info.loc ? ` (${info.loc})` : ''}`;
      });
    }
    compose.style.display = 'block';
    const w = 300;
    compose.style.left = `${Math.min(x, window.innerWidth - w - 12)}px`;
    compose.style.top = `${Math.min(y + 10, window.innerHeight - 180)}px`;
    composeText.focus();
  }
  function closeCompose() {
    compose.style.display = 'none';
    pickTarget = null;
  }

  compose.addEventListener('click', async (evt) => {
    const btn = evt.target;
    const act = btn.dataset && btn.dataset.act;
    if (act === 'cancel') closeCompose();
    if (act === 'copy') {
      const text = composeText.value.trim();
      if (!text || !pickTarget) return;
      btn.disabled = true;
      try {
        const { block } = await buildBlock(pickTarget, text);
        copyText(block);
        closeCompose();
      } catch (e) {
        composeErr.textContent = `블록 생성 실패: ${e}`;
        composeErr.style.display = 'block';
      } finally {
        btn.disabled = false;
      }
    }
  });

  // ------------------------------------------------------------- panel

  function openPanel() {
    panel.classList.add('open');
    toggle.classList.add('active');
  }
  function closePanel() {
    panel.classList.remove('open');
    toggle.classList.remove('active');
  }
  toggle.addEventListener('click', () => {
    if (panel.classList.contains('open')) closePanel();
    else openPanel();
  });
  panel.addEventListener('click', (evt) => {
    const act = evt.target.dataset && evt.target.dataset.act;
    if (act === 'close') closePanel();
    if (act === 'pick') startPicking();
    if (act === 'refresh') fetchPins();
  });

  // ------------------------------------------------------------- boot

  // Debug hook for scripted prototype testing (Playwright / console):
  // await __baiReviewProto.blockFor('[data-testid=x]', 'comment text')
  window.__baiReviewProto = {
    blockFor: async (selector, text) => {
      const t = document.querySelector(selector);
      if (!t) throw new Error(`no element: ${selector}`);
      return (await buildBlock(t, text)).block;
    },
    fetchPins,
    pinState,
  };

  fetch('/__review/state')
    .then((r) => r.json())
    .then((s) => {
      serverState = s;
    })
    .catch(() => {});

  handleFragment();
  fetchPins();
  schedulePoll();
})();
