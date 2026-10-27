/**
 * Astryx menus and popovers open as native `popover="auto"` in the browser's
 * top layer, which paints above every z-index. An overlay host shown as a
 * `popover="manual"` after them joins the top layer above them, and a manual
 * popover does not light-dismiss the auto ones that are already open.
 */

const LIFTED_ATTR = 'data-bai-review-lifted';
const BACKDROP_STYLE_ATTR = 'data-bai-review-lifted-style';

/** An open popover the overlay would otherwise paint underneath. */
export function hasOpenPopover(doc: Document = document): boolean {
  try {
    return !!doc.querySelector(`:popover-open:not([${LIFTED_ATTR}])`);
  } catch {
    // A DOM without `:popover-open` (jsdom) has no top layer to be under.
    return false;
  }
}

/** `width`/`height: auto` lets a fixed `inset: 0` host stretch again. */
const UA_POPOVER_RESET: Record<string, string> = {
  width: 'auto',
  height: 'auto',
  'max-width': 'none',
  'max-height': 'none',
  margin: '0',
  border: '0',
  padding: '0',
  overflow: 'visible',
  background: 'transparent',
};

/** A lifted host's `::backdrop` covers the viewport; it must not take a click. */
function ensureBackdropStyle(doc: Document) {
  if (doc.head.querySelector(`style[${BACKDROP_STYLE_ATTR}]`)) return;
  const style = doc.createElement('style');
  style.setAttribute(BACKDROP_STYLE_ATTR, '');
  style.textContent = `[${LIFTED_ATTR}]::backdrop { display: none; pointer-events: none; }`;
  doc.head.appendChild(style);
}

/**
 * Shows `host` in the top layer when an open popover would cover it, with the
 * UA's `[popover]` box (centred, fit-content, bordered, Canvas fill) undone so
 * it lays out as before. Returns the undo; a no-op when nothing was lifted.
 */
export function liftAboveTopLayer(host: HTMLElement | null): () => void {
  if (!host?.isConnected || typeof host.showPopover !== 'function') {
    return () => {};
  }
  const doc = host.ownerDocument;
  if (!hasOpenPopover(doc) || host.hasAttribute(LIFTED_ATTR)) return () => {};
  const priorPopover = host.getAttribute('popover');
  const priorStyle = host.getAttribute('style');
  try {
    ensureBackdropStyle(doc);
    host.setAttribute(LIFTED_ATTR, '');
    host.setAttribute('popover', 'manual');
    for (const [prop, value] of Object.entries(UA_POPOVER_RESET)) {
      host.style.setProperty(prop, value);
    }
    host.showPopover();
  } catch {
    restore(host, priorPopover, priorStyle);
    return () => {};
  }
  return () => {
    try {
      if (host.matches(':popover-open')) host.hidePopover();
    } catch {
      // Already hidden by a removal or a re-append; the attributes still go.
    }
    restore(host, priorPopover, priorStyle);
  };
}

function restore(
  host: HTMLElement,
  priorPopover: string | null,
  priorStyle: string | null,
) {
  host.removeAttribute(LIFTED_ATTR);
  if (priorPopover === null) host.removeAttribute('popover');
  else host.setAttribute('popover', priorPopover);
  if (priorStyle === null) host.removeAttribute('style');
  else host.setAttribute('style', priorStyle);
}
