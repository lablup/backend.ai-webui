/**
 * Overlay chrome: a Shadow-DOM host carrying the dock, the composer, the
 * selection outline and the toast.
 *
 * The host sits outside React and keeps its own CSS — the project's Astryx
 * rules apply to the app source, not to a dev-server-injected script that must
 * not import anything from the bundle. `data-react-grab-ignore-events` makes
 * react-grab skip our own chrome while its select mode is on, so the dock and
 * the composer stay clickable mid-pick.
 */

const LS_ALWAYS_SHOW = 'bai-review:alwaysShowDock';

export interface OverlayUICallbacks {
  onStartPick: () => void;
  /** Resolve to close the composer; reject to show the message inline. */
  onCopy: (text: string) => Promise<void>;
  onComposeClosed: () => void;
  onEscape: () => void;
}

const el = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  html?: string,
): HTMLElementTagNameMap[K] => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html !== undefined) node.innerHTML = html;
  return node;
};

export function createOverlayUI(callbacks: OverlayUICallbacks) {
  const host = document.createElement('div');
  host.setAttribute('data-bai-review-overlay', '');
  host.setAttribute('data-react-grab-ignore-events', '');
  const root = host.attachShadow({ mode: 'open' });
  document.body.appendChild(host);

  const style = document.createElement('style');
  style.textContent = `
    :host { all: initial; }
    * { box-sizing: border-box; font-family: ui-sans-serif, system-ui, sans-serif; }
    .dock {
      position: fixed; right: 16px; bottom: 16px; z-index: 2147483000;
      display: none; flex-direction: column; align-items: flex-end; gap: 6px;
    }
    .dock.show { display: flex; }
    .alwayschk {
      font-size: 12px; color: #555; background: rgba(255,255,255,.92);
      border: 1px solid #ddd; border-radius: 10px; padding: 3px 9px;
      display: flex; gap: 5px; align-items: center; cursor: pointer;
    }
    .toggle {
      border: none; border-radius: 24px; padding: 10px 16px; cursor: pointer;
      background: #ff7a00; color: #fff; font-size: 14px; font-weight: 600;
      box-shadow: 0 2px 10px rgba(0,0,0,.25);
    }
    .toggle.active { background: #1f1f1f; }
    .btn {
      border: 1px solid #ddd; background: #fafafa; border-radius: 6px;
      cursor: pointer; font-size: 14px; padding: 5px 10px;
    }
    .btn.primary { background: #ff7a00; border-color: #ff7a00; color: #fff; }
    .hoverbox {
      position: fixed; z-index: 2147482998; pointer-events: none; display: none;
      border: 2px solid #ff7a00; border-radius: 3px;
      background: rgba(255,122,0,.08);
    }
    .compose {
      position: fixed; z-index: 2147483001; width: 300px; background: #fff;
      border: 1px solid #ddd; border-radius: 8px; padding: 10px;
      box-shadow: 0 4px 18px rgba(0,0,0,.2); display: none;
    }
    .compose .pathlabel {
      font-size: 12px; color: #888; margin-bottom: 4px; word-break: break-all;
      white-space: pre-line; max-height: 96px; overflow-y: auto;
    }
    .compose textarea {
      width: 100%; height: 64px; font-size: 14px; padding: 6px;
      border: 1px solid #ddd; border-radius: 6px; resize: vertical;
    }
    .compose .actions {
      display: flex; justify-content: flex-end; gap: 6px; margin-top: 6px;
    }
    .compose .err { color: #c0392b; font-size: 11px; margin-top: 4px; display: none; }
    .toast {
      position: fixed; z-index: 2147483002; left: 50%; bottom: 64px;
      transform: translateX(-50%); background: #1f1f1f; color: #fff;
      font-size: 14px; padding: 8px 14px; border-radius: 16px; display: none;
      max-width: 70vw;
    }
  `;
  root.appendChild(style);

  const toggle = el('button', 'toggle', '📍 Review');
  const alwaysChk = el('label', 'alwayschk');
  alwaysChk.innerHTML = '<input type="checkbox" /> Always show';
  const dock = el('div', 'dock');
  dock.append(alwaysChk, toggle);

  const hoverbox = el('div', 'hoverbox');
  const compose = el('div', 'compose');
  compose.innerHTML = `
    <div class="pathlabel"></div>
    <textarea placeholder="Comment on this element… (⌘⏎ to copy the block; may be empty)"></textarea>
    <div class="err"></div>
    <div class="actions">
      <button class="btn" data-act="cancel">Cancel</button>
      <button class="btn primary" data-act="copy">📋 Copy block</button>
    </div>
  `;
  const toast = el('div', 'toast');
  root.append(dock, hoverbox, compose, toast);

  const composeText = compose.querySelector('textarea') as HTMLTextAreaElement;
  const composeErr = compose.querySelector('.err') as HTMLElement;
  const composeLabel = compose.querySelector('.pathlabel') as HTMLElement;
  const alwaysInput = alwaysChk.querySelector('input') as HTMLInputElement;

  let alwaysShow = false;
  try {
    alwaysShow = localStorage.getItem(LS_ALWAYS_SHOW) === '1';
  } catch {
    /* storage unavailable */
  }
  alwaysInput.checked = alwaysShow;
  alwaysInput.addEventListener('change', () => {
    alwaysShow = alwaysInput.checked;
    try {
      localStorage.setItem(LS_ALWAYS_SHOW, alwaysShow ? '1' : '0');
    } catch {
      /* storage unavailable */
    }
    updateDock();
  });

  let pickActive = false;
  let pickTarget: Element | null = null;

  /**
   * The dock is hidden until something is happening — a dev server should not
   * carry a permanent floating button. "Always show" is inside the dock on
   * purpose: you reveal it once with ⌘⌃C, then pin it.
   */
  function updateDock() {
    dock.classList.toggle('show', alwaysShow || pickActive || isComposeOpen());
    toggle.classList.toggle('active', pickActive);
  }

  const isComposeOpen = () => compose.style.display === 'block';
  const isOwnEvent = (evt: Event) => evt.composedPath().includes(host);

  let toastTimer = 0;
  function showToast(message: string, ms = 3500) {
    toast.textContent = message;
    toast.style.display = 'block';
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.style.display = 'none';
    }, ms);
  }

  function setHoverRect(rect: DOMRect | null) {
    if (!rect) {
      hoverbox.style.display = 'none';
      return;
    }
    Object.assign(hoverbox.style, {
      display: 'block',
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
    });
  }

  /**
   * Keep the picked element outlined until the composer closes — react-grab's
   * own grabbed box fades after a couple of seconds, and the reviewer is still
   * typing about that element.
   */
  function syncPickHighlight() {
    if (!isComposeOpen() || !pickTarget) return;
    setHoverRect(pickTarget.getBoundingClientRect());
  }
  window.addEventListener('scroll', syncPickHighlight, true);
  window.addEventListener('resize', syncPickHighlight);

  function openCompose(target: Element, x: number, y: number) {
    pickTarget = target;
    composeErr.style.display = 'none';
    composeText.value = '';
    compose.style.display = 'block';
    const width = 300;
    compose.style.left = `${Math.min(x, window.innerWidth - width - 12)}px`;
    compose.style.top = `${Math.min(y + 10, window.innerHeight - 180)}px`;
    syncPickHighlight();
    updateDock();
    composeText.focus();
    // Win over any late focus restoration (react-grab unfreeze / deactivate).
    setTimeout(() => {
      if (isComposeOpen()) composeText.focus();
    }, 200);
  }

  function closeCompose() {
    if (!isComposeOpen()) return;
    compose.style.display = 'none';
    pickTarget = null;
    setHoverRect(null);
    updateDock();
    callbacks.onComposeClosed();
  }

  function setComposeLabel(text: string) {
    composeLabel.textContent = text;
  }

  function appendComposeLabel(text: string) {
    composeLabel.textContent += text;
  }

  function getComposeTarget() {
    return pickTarget;
  }

  function setPickActive(active: boolean) {
    pickActive = active;
    updateDock();
  }

  // ------------------------------------------------------------- clipboard

  function legacyCopy(text: string): boolean {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0';
    root.appendChild(ta);
    ta.select();
    try {
      return document.execCommand('copy');
    } finally {
      ta.remove();
    }
  }

  /** The plain-http gateway origin is not a secure context: no `navigator.clipboard`. */
  async function copyText(text: string): Promise<boolean> {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        /* fall through to execCommand */
      }
    }
    return legacyCopy(text);
  }

  // ---------------------------------------------------------------- events

  toggle.addEventListener('click', () => callbacks.onStartPick());

  async function runCopy(button: HTMLButtonElement) {
    button.disabled = true;
    try {
      // Empty text is allowed — the block still carries label, stack and link.
      await callbacks.onCopy(composeText.value.trim());
      closeCompose();
    } catch (e) {
      composeErr.textContent = `Could not build the block: ${e}`;
      composeErr.style.display = 'block';
    } finally {
      button.disabled = false;
    }
  }

  compose.addEventListener('click', (evt) => {
    const button = evt.target;
    if (!(button instanceof HTMLButtonElement)) return;
    if (button.dataset.act === 'cancel') closeCompose();
    if (button.dataset.act === 'copy') void runCopy(button);
  });

  composeText.addEventListener('keydown', (evt) => {
    if ((evt.metaKey || evt.ctrlKey) && evt.key === 'Enter') {
      evt.preventDefault();
      void runCopy(
        compose.querySelector('[data-act="copy"]') as HTMLButtonElement,
      );
    }
  });

  document.addEventListener('keydown', (evt) => {
    if (evt.key !== 'Escape') return;
    callbacks.onEscape();
    closeCompose();
  });

  document.addEventListener(
    'mousedown',
    (evt) => {
      if (!isComposeOpen()) return;
      if (evt.composedPath().includes(compose)) return;
      closeCompose();
    },
    true,
  );

  updateDock();

  return {
    host,
    root,
    showToast,
    setHoverRect,
    openCompose,
    closeCompose,
    isComposeOpen,
    setComposeLabel,
    appendComposeLabel,
    getComposeTarget,
    setPickActive,
    copyText,
    isOwnEvent,
  };
}

export type OverlayUI = ReturnType<typeof createOverlayUI>;
