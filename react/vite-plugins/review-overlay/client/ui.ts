/**
 * Overlay chrome: a Shadow-DOM host carrying the composer, the selection
 * outline and the toast.
 *
 * The host sits outside React and keeps its own CSS — the project's Astryx
 * rules apply to the app source, not to a dev-server-injected script that must
 * not import anything from the bundle. Colours still come from Astryx's
 * `--color-*` custom properties: `all: initial` does not reset custom
 * properties, so they inherit across the shadow boundary and the overlay
 * follows the page into dark mode. Each carries a literal fallback for a page
 * where the theme has not been applied yet.
 *
 * `data-react-grab-ignore-events` makes react-grab skip our own chrome while
 * its select mode is on, so the composer stays clickable mid-pick.
 */

/** react-grab restores focus asynchronously after a pick; outlast it. */
const FOCUS_GUARD_MS = 1000;

export interface OverlayUICallbacks {
  /**
   * Render the block for this note, SYNCHRONOUSLY — everything async was done
   * at pick time. `null` means the capture is not ready, which the composer
   * prevents by keeping the copy button disabled until it is.
   */
  onBuildBlock: (text: string) => string | null;
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
    :host {
      all: initial;
      --bai-review-surface: var(--color-background-popover, #fff);
      --bai-review-text: var(--color-text-primary, #0a1317);
      --bai-review-text-dim: var(--color-text-secondary, #4e606f);
      --bai-review-border: var(--color-border-emphasized, #ccd3db);
      --bai-review-accent: var(--color-icon-orange, #e9690b);
      --bai-review-accent-soft: color-mix(in srgb, var(--bai-review-accent) 35%, transparent);
      --bai-review-on-accent: var(--color-on-accent, #fff);
      --bai-review-inverted: var(--color-background-inverted, #0a1317);
      --bai-review-on-inverted: var(--color-background-surface, #fff);
      --bai-review-error: var(--color-text-red, #c0392b);
      --bai-review-shadow: var(--color-shadow, rgba(5, 54, 89, .25));
      /* react-grab 0.1.50's own selection box, so the pick reads as one tool:
         1px stroke at α.5 over an α.08 fill of rgb(210, 57, 192). */
      --bai-review-pick-line: rgba(210, 57, 192, .5);
      --bai-review-pick-fill: rgba(210, 57, 192, .08);
    }
    /* react-grab picks the wider gamut when the display has it, so follow it —
       otherwise its hover box and ours are different magentas on the same Mac. */
    @media (color-gamut: p3) {
      :host {
        --bai-review-pick-line: color(display-p3 0.84 0.19 0.78 / .5);
        --bai-review-pick-fill: color(display-p3 0.84 0.19 0.78 / .08);
      }
    }
    * { box-sizing: border-box; font-family: ui-sans-serif, system-ui, sans-serif; }
    .btn {
      border: 1px solid var(--bai-review-border);
      background: var(--bai-review-surface); color: var(--bai-review-text);
      border-radius: 6px; cursor: pointer; font-size: 14px; padding: 5px 10px;
    }
    .btn:disabled { cursor: default; opacity: .5; }
    .btn.primary {
      background: var(--bai-review-accent); border-color: var(--bai-review-accent);
      color: var(--bai-review-on-accent);
    }
    .hoverbox {
      position: fixed; z-index: 2147482998; pointer-events: none; display: none;
      border: 1px solid var(--bai-review-pick-line);
      background: var(--bai-review-pick-fill);
    }
    .compose {
      position: fixed; z-index: 2147483001; width: 300px;
      background: var(--bai-review-surface); color: var(--bai-review-text);
      border: 1px solid var(--bai-review-border); border-radius: 8px;
      padding: 10px; box-shadow: 0 4px 18px var(--bai-review-shadow);
      display: none;
    }
    .compose .pathlabel {
      font-size: 12px; color: var(--bai-review-text-dim); margin-bottom: 4px;
      word-break: break-all; white-space: pre-line; max-height: 96px;
      overflow-y: auto;
    }
    .compose textarea {
      width: 100%; height: 64px; font-size: 14px; padding: 6px;
      background: var(--color-background-surface, #fff);
      color: var(--bai-review-text);
      border: 1px solid var(--bai-review-border); border-radius: 6px;
      resize: vertical;
    }
    .compose .actions {
      display: flex; justify-content: flex-end; gap: 6px; margin-top: 6px;
    }
    .compose .err {
      color: var(--bai-review-error); font-size: 11px; margin-top: 4px;
      display: none;
    }
    .toast {
      position: fixed; z-index: 2147483002; left: 50%; bottom: 64px;
      transform: translateX(-50%); background: var(--bai-review-inverted);
      color: var(--bai-review-on-inverted); font-size: 14px; padding: 8px 14px;
      border-radius: 16px; display: none; max-width: 70vw;
    }
  `;
  root.appendChild(style);

  const hoverbox = el('div', 'hoverbox');
  const compose = el('div', 'compose');
  compose.innerHTML = `
    <div class="pathlabel"></div>
    <textarea aria-label="Review comment on the picked element" placeholder="Comment on this element… (⌘⏎ to copy the block; may be empty)"></textarea>
    <div class="err"></div>
    <div class="actions">
      <button class="btn" data-act="cancel">Cancel</button>
      <button class="btn primary" data-act="copy">📋 Copy block</button>
    </div>
  `;
  const toast = el('div', 'toast');
  root.append(hoverbox, compose, toast);

  const composeText = compose.querySelector('textarea') as HTMLTextAreaElement;
  const composeErr = compose.querySelector('.err') as HTMLElement;
  const composeLabel = compose.querySelector('.pathlabel') as HTMLElement;
  const copyButton = compose.querySelector(
    '[data-act="copy"]',
  ) as HTMLButtonElement;

  let pickActive = false;
  let pickTarget: Element | null = null;
  let focusGuardUntil = 0;

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

  /** react-grab rounds its box to the element's own corners; so do we. */
  function setHoverRect(rect: DOMRect | null, borderRadius = '0px') {
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
      borderRadius,
    });
  }

  /**
   * Keep the picked element outlined until the composer closes — react-grab's
   * own grabbed box fades after a couple of seconds, and the reviewer is still
   * typing about that element.
   */
  function syncPickHighlight() {
    if (!isComposeOpen() || !pickTarget) return;
    setHoverRect(
      pickTarget.getBoundingClientRect(),
      getComputedStyle(pickTarget).borderRadius,
    );
  }
  window.addEventListener('scroll', syncPickHighlight, true);
  window.addEventListener('resize', syncPickHighlight);

  function setComposeReady(ready: boolean) {
    copyButton.disabled = !ready;
  }

  function openCompose(target: Element, x: number, y: number) {
    pickTarget = target;
    composeErr.style.display = 'none';
    composeText.value = '';
    setComposeReady(false);
    compose.style.display = 'block';
    const width = 300;
    compose.style.left = `${Math.max(8, Math.min(x, window.innerWidth - width - 12))}px`;
    compose.style.top = `${Math.max(8, Math.min(y + 10, window.innerHeight - 180))}px`;
    syncPickHighlight();
    focusGuardUntil = Date.now() + FOCUS_GUARD_MS;
    composeText.focus();
  }

  /**
   * react-grab restores the previously focused app element when its pick
   * settles, which can land after our `focus()`. Take it back for as long as
   * the composer is open and the guard window has not expired — an outside
   * click closes the composer first, so this never fights a real intent.
   */
  composeText.addEventListener('focusout', () => {
    if (Date.now() > focusGuardUntil) return;
    setTimeout(() => {
      if (isComposeOpen() && Date.now() <= focusGuardUntil) composeText.focus();
    }, 0);
  });

  function closeCompose() {
    if (!isComposeOpen()) return;
    compose.style.display = 'none';
    pickTarget = null;
    focusGuardUntil = 0;
    setHoverRect(null);
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

  /**
   * The plain-http gateway origin is not a secure context: no
   * `navigator.clipboard`, so `execCommand` is the only path — and it must run
   * inside the gesture, which is why the block is rendered synchronously.
   */
  function copyText(text: string): boolean | Promise<boolean> {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(
        () => true,
        () => legacyCopy(text),
      );
    }
    return legacyCopy(text);
  }

  // ---------------------------------------------------------------- events

  function runCopy() {
    // Empty text is allowed — the block still carries label, stack and link.
    let block: string | null;
    try {
      block = callbacks.onBuildBlock(composeText.value.trim());
    } catch (e) {
      composeErr.textContent = `Could not build the block: ${e}`;
      composeErr.style.display = 'block';
      return;
    }
    if (!block) {
      composeErr.textContent = 'Still reading the element — try again.';
      composeErr.style.display = 'block';
      return;
    }
    const copied = copyText(block);
    // Close only on success. A failed copy tells the reviewer to press ⌘⏎
    // again, so the composer and the note they typed have to still be there.
    const done = (ok: boolean) => {
      showToast(
        ok
          ? 'Copied — paste it into the PR comment, the Teams thread, or Claude 📋'
          : 'Could not reach the clipboard — press ⌘⏎ again',
      );
      if (ok) closeCompose();
    };
    if (typeof copied === 'boolean') done(copied);
    else void copied.then(done);
  }

  compose.addEventListener('click', (evt) => {
    const button = evt.target;
    if (!(button instanceof HTMLButtonElement)) return;
    if (button.dataset.act === 'cancel') closeCompose();
    if (button.dataset.act === 'copy') runCopy();
  });

  composeText.addEventListener('keydown', (evt) => {
    if ((evt.metaKey || evt.ctrlKey) && evt.key === 'Enter') {
      evt.preventDefault();
      // Not gated on `copyButton.disabled`: `runCopy` says why it cannot build
      // yet, which is more use than a keystroke that does nothing.
      runCopy();
    }
  });

  // Only when the overlay owns the interaction — otherwise every Escape in the
  // app (closing a modal, clearing a select) would cancel a pick that is not
  // running.
  document.addEventListener('keydown', (evt) => {
    if (evt.key !== 'Escape') return;
    if (!pickActive && !isComposeOpen()) return;
    callbacks.onEscape();
    closeCompose();
  });

  document.addEventListener(
    'mousedown',
    (evt) => {
      if (!isComposeOpen()) return;
      // The whole shadow host is "inside" — closing on our own chrome threw
      // away the note the reviewer had already typed.
      if (isOwnEvent(evt)) return;
      // Mid-pick an outside mousedown IS the next selection. Closing here
      // would stop the picker before react-grab sees its own pointerup, and
      // the click would fall through to the app.
      if (pickActive) return;
      closeCompose();
    },
    true,
  );

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
    setComposeReady,
    getComposeTarget,
    setPickActive,
    copyText,
    isOwnEvent,
  };
}

export type OverlayUI = ReturnType<typeof createOverlayUI>;
