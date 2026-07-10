/**
 * FR-3309 — review overlay client (walking skeleton). Dev-only: injected by
 * the `bai-dev-review-overlay` Vite plugin (apply: 'serve').
 *
 * Everything lives inside a Shadow DOM host on document.body; the only
 * global surface is the `window.__baiReviewOverlay` re-entry guard.
 *
 * Talks to the reviewer's OWN local board relay (lablup/claude-mp
 * dev-server-board, spec R2.2): http://localhost:7777/api/teams/*.
 * The dev server itself has no review backend.
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

  // ---------------------------------------------------------------- anchor

  const b64encode = (s) =>
    btoa(String.fromCharCode(...new TextEncoder().encode(s)));
  const b64decode = (b) =>
    new TextDecoder().decode(Uint8Array.from(atob(b), (c) => c.charCodeAt(0)));

  /** Selector-only anchor for the walking skeleton (multi-signal is later). */
  function buildSelector(el) {
    const esc = (v) => (window.CSS && CSS.escape ? CSS.escape(v) : v);
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

  function encodeAnchor(selector) {
    return b64encode(JSON.stringify({ v: 1, s: selector, p: location.pathname }));
  }

  function decodeAnchor(b64) {
    try {
      const obj = JSON.parse(b64decode(b64));
      return obj && typeof obj.s === 'string' ? obj : null;
    } catch {
      return null;
    }
  }

  function buildDeepLink(selector) {
    return (
      location.origin +
      location.pathname +
      location.search +
      `#${HASH_KEY}=` +
      encodeAnchor(selector)
    );
  }

  function anchorFromText(text) {
    const m = /#bai-review=([A-Za-z0-9+/=_-]+)/.exec(text || '');
    return m ? decodeAnchor(m[1]) : null;
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
      font-size: 14px; display: flex; align-items: center; gap: 8px;
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
    .reply .meta { color: #888; font-size: 11px; margin-bottom: 3px; display: flex; gap: 6px; align-items: center; }
    .reply .meta .author { color: #333; font-weight: 600; }
    .reply .body { white-space: pre-wrap; word-break: break-word; }
    .reply .pinbtn { border: none; background: none; cursor: pointer; font-size: 13px; padding: 0 2px; }
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
      font-size: 11px; font-weight: 700; cursor: default;
      box-shadow: 0 1px 4px rgba(0,0,0,.35);
    }
    .pin > span { transform: rotate(45deg); }
    .pinlayer { position: absolute; top: 0; left: 0; width: 0; height: 0; }
    .compose {
      position: fixed; z-index: 2147483001; width: 260px; background: #fff;
      border: 1px solid #ddd; border-radius: 8px; padding: 10px;
      box-shadow: 0 4px 18px rgba(0,0,0,.2); display: none;
    }
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
    .flash { outline: 3px solid #ff7a00 !important; outline-offset: 2px; }
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
      <button class="iconbtn" data-act="close">✕</button>
    </header>
    <div class="settings">
      <label>Teams 스레드 URL (PR 스레드의 메시지 링크 붙여넣기)</label>
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
    <textarea placeholder="이 요소에 대한 코멘트…"></textarea>
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
  threadInput.value = localStorage.getItem(LS_THREAD_KEY) || '';

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
  function dropPin(target) {
    const rect = target.getBoundingClientRect();
    const pin = el('div', 'pin');
    pin.append(el('span', '', String(++pinSeq)));
    pin.style.left = `${rect.left + window.scrollX + 6}px`;
    pin.style.top = `${rect.top + window.scrollY + 6}px`;
    pinLayer.appendChild(pin);
    return pin;
  }

  function flash(target) {
    target.classList.add('flash');
    setTimeout(() => target.classList.remove('flash'), 2400);
  }

  // ---------------------------------------------------------------- picking

  let picking = false;
  let pickTarget = null;

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
    dropPin(t);
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

  // ---------------------------------------------------------------- compose

  const composeText = compose.querySelector('textarea');
  const composeErr = compose.querySelector('.err');

  function openCompose(x, y) {
    composeErr.style.display = 'none';
    composeText.value = '';
    compose.style.display = 'block';
    const w = 260;
    compose.style.left = `${Math.min(x, window.innerWidth - w - 12)}px`;
    compose.style.top = `${Math.min(y + 10, window.innerHeight - 160)}px`;
    composeText.focus();
  }

  function closeCompose() {
    compose.style.display = 'none';
    pickTarget = null;
  }

  compose.addEventListener('click', async (evt) => {
    const act = evt.target.dataset && evt.target.dataset.act;
    if (act === 'cancel') closeCompose();
    if (act === 'send') {
      const text = composeText.value.trim();
      if (!text) return;
      const threadUrl = (threadInput.value || '').trim();
      if (!threadUrl) {
        composeErr.textContent = '패널에서 Teams 스레드 URL을 먼저 저장하세요';
        composeErr.style.display = 'block';
        return;
      }
      const selector = pickTarget ? buildSelector(pickTarget) : null;
      const deepLink = selector ? buildDeepLink(selector) : undefined;
      evt.target.disabled = true;
      try {
        const res = await fetch(`${RELAY}/api/teams/reply`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ threadUrl, text, deepLink }),
        });
        if (res.status === 401) {
          composeErr.textContent = RELAY_HINT;
          composeErr.style.display = 'block';
          showHint(RELAY_HINT);
          return;
        }
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          composeErr.textContent = data.error || `릴레이 오류 (HTTP ${res.status})`;
          composeErr.style.display = 'block';
          return;
        }
        closeCompose();
        showToast('Teams 스레드에 전송됐어요 ✅');
        pollReplies();
      } catch {
        composeErr.textContent = RELAY_HINT;
        composeErr.style.display = 'block';
        showHint(RELAY_HINT);
      } finally {
        evt.target.disabled = false;
      }
    }
  });

  // ---------------------------------------------------------------- replies

  let pollTimer = 0;
  let pollBusy = false;

  function renderReplies(replies) {
    repliesBox.textContent = '';
    if (!replies.length) {
      repliesBox.appendChild(el('div', 'empty', '아직 답글이 없어요'));
      return;
    }
    for (const r of replies) {
      const item = el('div', 'reply');
      const meta = el('div', 'meta');
      const author = el('span', 'author');
      author.textContent = r.author || '(unknown)';
      const when = el('span');
      when.textContent = (r.createdDateTime || '').replace('T', ' ').slice(0, 16);
      meta.append(author, when);
      const anchor = anchorFromText(r.text) || anchorFromText(r.html);
      if (anchor) {
        const pinBtn = el('button', 'pinbtn', '📍');
        pinBtn.title = '이 코멘트의 위치로 이동';
        pinBtn.addEventListener('click', () => resolveAnchor(anchor));
        meta.appendChild(pinBtn);
      }
      const body = el('div', 'body');
      body.textContent = r.text || '';
      item.append(meta, body);
      repliesBox.appendChild(item);
    }
    repliesBox.scrollTop = repliesBox.scrollHeight;
  }

  async function pollReplies() {
    const threadUrl = (threadInput.value || '').trim();
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
    if (act === 'save') {
      localStorage.setItem(LS_THREAD_KEY, (threadInput.value || '').trim());
      showToast('스레드 URL 저장됨');
      startPolling();
    }
  });

  // ------------------------------------------------------- anchor resolve

  function resolveAnchor(anchor, attempt = 0) {
    if (anchor.p && anchor.p !== location.pathname && attempt === 0) {
      showToast(`다른 페이지의 코멘트예요: ${anchor.p}`);
    }
    let target = null;
    try {
      target = document.querySelector(anchor.s);
    } catch {
      /* invalid selector */
    }
    if (target) {
      target.scrollIntoView({ block: 'center', behavior: 'smooth' });
      flash(target);
      dropPin(target);
      return;
    }
    if (attempt < 20) {
      // SPA content renders asynchronously — retry briefly.
      setTimeout(() => resolveAnchor(anchor, attempt + 1), 500);
    } else {
      showToast('앵커 요소를 찾지 못했어요 — UI가 바뀌었을 수 있어요');
    }
  }

  const hashMatch = /[#&]bai-review=([A-Za-z0-9+/=_-]+)/.exec(location.hash);
  if (hashMatch) {
    const anchor = decodeAnchor(hashMatch[1]);
    if (anchor) resolveAnchor(anchor);
    else showToast('딥링크 앵커를 해석하지 못했어요');
  }
})();
