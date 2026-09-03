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
import { fractionWithin, projectFraction, type Box } from './selection.js';
import type { AnchorRect } from './types.js';

/** Everything the outline needs; a `DOMRect` and a projected region both fit. */
type RectLike = { left: number; top: number; width: number; height: number };

/** react-grab restores focus asynchronously after a pick; outlast it. */
const FOCUS_GUARD_MS = 1000;
const COMPOSE_WIDTH = 300;
const COMPOSE_GAP = 10;
const VIEWPORT_PAD = 8;

/** One copy, two flavours: a markdown textarea and a rich editor. */
export interface CopyPayload {
  text: string;
  html: string;
}

export interface OverlayUICallbacks {
  /**
   * Render the block for this note, SYNCHRONOUSLY — everything async was done
   * at pick time. `null` means the capture is not ready, which the composer
   * prevents by keeping the copy button disabled until it is.
   */
  onBuildBlock: (text: string) => CopyPayload | null;
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
    /* A viewport too short for the whole box scrolls INSIDE it, so the
       actions row stays reachable however short the window gets. */
    .compose {
      position: fixed; z-index: 2147483001; width: ${COMPOSE_WIDTH}px;
      background: var(--bai-review-surface); color: var(--bai-review-text);
      border: 1px solid var(--bai-review-border); border-radius: 8px;
      padding: 10px; box-shadow: 0 4px 18px var(--bai-review-shadow);
      max-height: calc(100vh - ${VIEWPORT_PAD * 2}px); overflow-y: auto;
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
  /**
   * A box select's region as a fraction of `pickTarget`, so a scroll or a
   * resize re-projects it exactly the way the pin will — the anchor stores
   * this same fraction.
   */
  let pickRegion: AnchorRect | null = null;
  let focusGuardUntil = 0;
  /** The picked element's box, frozen at pick time, plus the pick's own x. */
  let composeAnchor: { left: number; top: number; bottom: number } | null =
    null;

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
  function setHoverRect(rect: RectLike | null, borderRadius = '0px') {
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
    const box = pickTarget.getBoundingClientRect();
    // A region has no corners of its own — it is a rectangle over the frame,
    // exactly as react-grab draws its drag box.
    if (pickRegion) return setHoverRect(projectFraction(box, pickRegion));
    setHoverRect(box, getComputedStyle(pickTarget).borderRadius);
  }
  window.addEventListener('scroll', syncPickHighlight, true);
  window.addEventListener('resize', () => {
    syncPickHighlight();
    placeCompose();
  });

  function setComposeReady(ready: boolean) {
    copyButton.disabled = !ready;
  }

  /**
   * The box grows AFTER it opens — the path label and the ⚛️ stack land once
   * react-grab's fiber walk resolves — so its height is measured, never
   * guessed, and every growth re-places it. Below the picked element when it
   * fits, above it when it does not, clamped into the viewport either way, so
   * the actions row is never off-screen.
   */
  function placeCompose() {
    if (!isComposeOpen() || !composeAnchor) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const height = compose.offsetHeight;
    compose.style.left = `${Math.max(VIEWPORT_PAD, Math.min(composeAnchor.left, vw - COMPOSE_WIDTH - 12))}px`;
    const below = composeAnchor.bottom + COMPOSE_GAP;
    const top =
      below + height <= vh - VIEWPORT_PAD
        ? below
        : composeAnchor.top - COMPOSE_GAP - height;
    compose.style.top = `${Math.max(VIEWPORT_PAD, Math.min(top, vh - height - VIEWPORT_PAD))}px`;
  }

  function openCompose(
    target: Element,
    x: number,
    y: number,
    region?: Box | null,
  ) {
    pickTarget = target;
    composeErr.style.display = 'none';
    composeText.value = '';
    setComposeReady(false);
    compose.style.display = 'block';
    const frame = target.getBoundingClientRect();
    pickRegion = region ? fractionWithin(region, frame) : null;
    // The composer follows what is outlined, so a box select opens under the
    // region rather than under the frame that happens to hold it.
    const box: RectLike & { bottom: number } = region
      ? { ...region, bottom: region.top + region.height }
      : frame;
    // A rect with no size at all is jsdom or `display: contents`; the pick
    // point is then the only thing that says where the element was.
    const measured = box.width > 0 || box.height > 0;
    composeAnchor = {
      left: x,
      top: measured ? box.top : y,
      bottom: measured ? box.bottom : y,
    };
    placeCompose();
    syncPickHighlight();
    focusGuardUntil = Date.now() + FOCUS_GUARD_MS;
    composeText.focus();
  }

  // A drag on the textarea's resize handle changes the height too, and it goes
  // through no code path of ours.
  if (typeof ResizeObserver === 'function') {
    new ResizeObserver(() => placeCompose()).observe(compose);
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
    pickRegion = null;
    composeAnchor = null;
    focusGuardUntil = 0;
    setHoverRect(null);
    callbacks.onComposeClosed();
  }

  function setComposeLabel(text: string) {
    composeLabel.textContent = text;
    placeCompose();
  }

  function appendComposeLabel(text: string) {
    composeLabel.textContent += text;
    placeCompose();
  }

  function getComposeTarget() {
    return pickTarget;
  }

  function setPickActive(active: boolean) {
    pickActive = active;
  }

  // ------------------------------------------------------------- clipboard

  /**
   * The one-shot `copy` listener is what carries the HTML flavour: on its own
   * `execCommand` would write the hidden textarea's plain text and nothing else.
   */
  function legacyCopy(text: string, html?: string): boolean {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0';
    root.appendChild(ta);
    ta.select();
    const onCopy = (evt: ClipboardEvent) => {
      if (!evt.clipboardData) return;
      evt.preventDefault();
      evt.clipboardData.setData('text/plain', text);
      if (html) evt.clipboardData.setData('text/html', html);
    };
    document.addEventListener('copy', onCopy, true);
    try {
      return document.execCommand('copy');
    } finally {
      document.removeEventListener('copy', onCopy, true);
      ta.remove();
    }
  }

  /**
   * The plain-http gateway origin is not a secure context: no
   * `navigator.clipboard`, so `execCommand` is the only path — and it must run
   * inside the gesture, which is why the block is rendered synchronously.
   * Every fallback ends at the plain flavour: a copy never writes nothing.
   */
  function copyText(text: string, html?: string): boolean | Promise<boolean> {
    const plainOnly = (): boolean | Promise<boolean> =>
      navigator.clipboard
        ? navigator.clipboard.writeText(text).then(
            () => true,
            () => legacyCopy(text),
          )
        : legacyCopy(text);
    if (!navigator.clipboard || !window.isSecureContext) {
      return legacyCopy(text, html) || plainOnly();
    }
    if (
      html &&
      navigator.clipboard.write &&
      typeof ClipboardItem === 'function'
    ) {
      try {
        const item = new ClipboardItem({
          'text/plain': new Blob([text], { type: 'text/plain' }),
          'text/html': new Blob([html], { type: 'text/html' }),
        });
        return navigator.clipboard
          .write([item])
          .then(() => true)
          .catch(() => legacyCopy(text, html) || plainOnly());
      } catch {
        // This browser's `ClipboardItem` refuses one of the types.
      }
    }
    return plainOnly();
  }

  // ---------------------------------------------------------------- events

  function runCopy() {
    // Empty text is allowed — the block still carries label, stack and link.
    let block: CopyPayload | null;
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
    const copied = copyText(block.text, block.html);
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
    placeCompose,
    copyText,
    isOwnEvent,
  };
}

export type OverlayUI = ReturnType<typeof createOverlayUI>;
