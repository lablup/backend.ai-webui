/**
 * The set dock: the draft set listed bottom-right, with the set-wide actions.
 * It lists the SET, not what the layer managed to draw — a card can be
 * anywhere on the page, and two of them can overlap, so this is the one place
 * that reaches every pin.
 *
 * Labels come off links a stranger may have written, so every one of them goes
 * in through `textContent`. Copy-all runs inside the click that asked for it:
 * the gateway origin has only `execCommand`, so nothing may be awaited first.
 */
import { icon, ICON_STYLE, type IconName } from './icons.js';
import { isMac } from './picker.js';
import type { SetPin } from './types.js';

/** ⌘⇧H / Ctrl⇧H — plain ⌘H hides the app and Ctrl+H opens history. */
export const CARDS_CHORD = isMac() ? '⌘⇧H' : 'Ctrl⇧H';

const CARDS_LABEL = `Pin cards (${CARDS_CHORD})`;

/** Where a dragged dock is parked, per tab. Cleared with the tab, not the set. */
export const DOCK_POS_KEY = 'bai-review:dock-pos';

/** The dock's own `width`, for a jsdom clamp that has no layout to read. */
const DOCK_WIDTH = 260;
/** Stand-in height while the dock is still `display: none` and measures 0. */
const DOCK_HEIGHT = 160;
/** Margin the dock keeps to every viewport edge, dragged or default. */
const EDGE_PAD = 8;

export interface DockPos {
  left: number;
  top: number;
}

const STYLE = `
  .setdock {
    position: fixed; right: 12px; bottom: 12px; z-index: 2147483000;
    display: none; flex-direction: column; width: 260px;
    background: var(--bai-review-surface); color: var(--bai-review-text);
    border: 1px solid var(--bai-review-border); border-radius: 8px;
    box-shadow: 0 4px 18px var(--bai-review-shadow);
    font-size: 13px; pointer-events: auto;
  }
  .setdock.shown { display: flex; }
  .setdock.folded { display: none; }
  .setdock .head {
    display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
    padding: 6px 8px; border-bottom: 1px solid var(--bai-review-border);
  }
  /* The whole dock moves from here, so it takes the pointer and never lets
     the gesture reach the page as a selection or a pick. */
  .setdock .grip {
    flex: none; display: flex; align-items: center; cursor: grab;
    color: var(--bai-review-text-dim); touch-action: none;
    -webkit-user-select: none; user-select: none;
  }
  .setdock.dragging .grip { cursor: grabbing; }
  .setdock .title {
    font-weight: 600; margin-right: auto; display: flex; align-items: center;
    gap: 4px;
  }
  .setdock .act {
    cursor: pointer; border: 0; background: none; padding: 2px 4px;
    font: inherit; color: var(--bai-review-text-dim); border-radius: 4px;
    display: inline-flex; align-items: center; gap: 4px;
  }
  .setdock .act:hover { color: var(--bai-review-text); }
  .setdock .confirm { display: none; align-items: center; gap: 4px; }
  .setdock.confirming .confirm { display: flex; }
  .setdock.confirming .clear { display: none; }
  .setdock .chord {
    font-size: 11px; color: var(--bai-review-text-dim);
  }
  .setdock .rows { max-height: 40vh; overflow-y: auto; }
  .setdock .row {
    display: flex; align-items: center; gap: 6px; padding: 4px 8px;
  }
  .setdock .idx {
    flex: none; width: 16px; text-align: right;
    color: var(--bai-review-text-dim); font-size: 11px; font-weight: 600;
  }
  /* One line per pin: the whole label is in the block, not in this list. The
     row IS the control — clicking it goes to the pin and beats its marker. */
  .setdock .rowlabel {
    flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis;
    white-space: nowrap; text-align: left; cursor: pointer; border: 0;
    background: none; padding: 0; font: inherit; color: inherit;
  }
  /* Its card is hidden; the pin is still in the set and still on the page. */
  .setdock .row.off .rowlabel { opacity: 0.55; }
${ICON_STYLE}
`;

export interface SetDockOptions {
  /** The overlay's shadow root — the dock is a sibling of the pin layer. */
  root: ShadowRoot;
  /** Runs inside the click: build and write the set, synchronously. */
  onCopyAll: () => void;
  onClear: () => void;
  /** Scroll the page back to this pin, and beat its marker again. */
  onLocate: (id: string) => void;
  /** 🗑 on one row: that pin leaves the set. No confirm — one pin is cheap. */
  onRemove: (id: string) => void;
  /** Its card comes back: the row's 👁, or the row itself. */
  onUnhide: (id: string) => void;
  /** The header switch: every card off, or on again. */
  onToggleCards: () => void;
}

/**
 * The icon is `aria-hidden`, so `label` is the button's whole accessible name
 * whether or not it also shows `text`.
 */
const button = (
  className: string,
  name: IconName,
  label: string,
  text?: string,
): HTMLButtonElement => {
  const node = document.createElement('button');
  node.className = `act ${className}`;
  node.append(icon(name));
  if (text !== undefined) {
    const span = document.createElement('span');
    span.className = 'lbl';
    span.textContent = text;
    node.append(span);
  }
  node.title = label;
  node.setAttribute('aria-label', label);
  return node;
};

const setText = (node: HTMLElement, text: string) => {
  (node.querySelector('.lbl') as HTMLElement).textContent = text;
};

const setIcon = (node: HTMLElement, name: IconName) => {
  node.querySelector('svg')?.replaceWith(icon(name));
};

/** A tab that refuses storage still drags; it just forgets on reload. */
const readPos = (): DockPos | null => {
  try {
    const raw = sessionStorage.getItem(DOCK_POS_KEY);
    const value = raw ? (JSON.parse(raw) as unknown) : null;
    if (!value || typeof value !== 'object') return null;
    const { left, top } = value as Record<string, unknown>;
    if (typeof left !== 'number' || typeof top !== 'number') return null;
    if (!Number.isFinite(left) || !Number.isFinite(top)) return null;
    return { left, top };
  } catch {
    return null;
  }
};

export function createSetDock(options: SetDockOptions) {
  const style = document.createElement('style');
  style.textContent = STYLE;
  const dock = document.createElement('div');
  dock.className = 'setdock';
  const head = document.createElement('div');
  head.className = 'head';
  const grip = document.createElement('span');
  grip.className = 'grip';
  grip.append(icon('grip-vertical'));
  grip.title = 'Drag the dock';
  const title = document.createElement('span');
  title.className = 'title';
  title.append(icon('map-pin'));
  const titleText = document.createElement('span');
  title.append(titleText);
  const copyAll = button(
    'copyall',
    'files',
    'Copy every pin as one comment',
    'Copy all',
  );
  const clear = button('clear', 'trash-2', 'Clear the whole set', 'Clear all');
  const cards = button('cards', 'eye', CARDS_LABEL, 'Cards');
  const chord = document.createElement('span');
  chord.className = 'chord';
  chord.textContent = CARDS_CHORD;
  const confirm = document.createElement('span');
  confirm.className = 'confirm';
  const confirmText = document.createElement('span');
  const yes = button('yes', 'check', 'Yes, clear the whole set');
  const no = button('no', 'x', 'Keep the set');
  confirm.append(confirmText, yes, no);
  head.append(grip, title, cards, chord, copyAll, clear, confirm);
  const rows = document.createElement('div');
  rows.className = 'rows';
  dock.append(head, rows);
  options.root.append(style, dock);

  /**
   * Dragged position, or `null` for the default bottom-right corner. Clamped
   * on every move, on resize and on restore, so a dock parked at the edge of a
   * wide window is still reachable in a narrow one.
   */
  let pos: DockPos | null = null;

  function clamp({ left, top }: DockPos): DockPos {
    const width = dock.offsetWidth || DOCK_WIDTH;
    const height = dock.offsetHeight || DOCK_HEIGHT;
    return {
      left: Math.min(
        Math.max(left, EDGE_PAD),
        Math.max(EDGE_PAD, window.innerWidth - width - EDGE_PAD),
      ),
      top: Math.min(
        Math.max(top, EDGE_PAD),
        Math.max(EDGE_PAD, window.innerHeight - height - EDGE_PAD),
      ),
    };
  }

  /** `right`/`bottom` are the CSS default; a placed dock has to drop them. */
  function moveTo(next: DockPos) {
    pos = clamp(next);
    dock.style.left = `${pos.left}px`;
    dock.style.top = `${pos.top}px`;
    dock.style.right = 'auto';
    dock.style.bottom = 'auto';
  }

  function savePos() {
    if (!pos) return;
    try {
      sessionStorage.setItem(DOCK_POS_KEY, JSON.stringify(pos));
    } catch {
      // Storage off or full: the dock still sits where it was dragged.
    }
  }

  /** Grab offset inside the dock, so it does not jump to the cursor. */
  let grab: { dx: number; dy: number } | null = null;

  grip.addEventListener('pointerdown', (evt) => {
    if (evt.button) return;
    const box = dock.getBoundingClientRect();
    grab = { dx: evt.clientX - box.left, dy: evt.clientY - box.top };
    // Without this the gesture becomes a text selection, and react-grab's
    // select mode would read it as a pick.
    evt.preventDefault();
    evt.stopPropagation();
    dock.classList.add('dragging');
    // Capture keeps the moves — and the click the release synthesises — on the
    // grip, so a drag that ends over a row never fires that row's action.
    try {
      grip.setPointerCapture(evt.pointerId);
    } catch {
      // jsdom, and any browser that refuses a capture it has no pointer for.
    }
  });

  grip.addEventListener('pointermove', (evt) => {
    if (!grab) return;
    evt.preventDefault();
    moveTo({ left: evt.clientX - grab.dx, top: evt.clientY - grab.dy });
  });

  const endDrag = (evt: PointerEvent) => {
    if (!grab) return;
    grab = null;
    dock.classList.remove('dragging');
    try {
      grip.releasePointerCapture(evt.pointerId);
    } catch {
      // Never captured; nothing to release.
    }
    savePos();
  };
  grip.addEventListener('pointerup', endDrag);
  grip.addEventListener('pointercancel', endDrag);

  const reclamp = () => {
    if (pos) moveTo(pos);
  };
  window.addEventListener('resize', reclamp);

  const stored = readPos();
  if (stored) moveTo(stored);

  /** Clearing is the one action with no undo, so it is asked twice. */
  const setConfirming = (on: boolean) =>
    dock.classList.toggle('confirming', on);

  copyAll.addEventListener('click', () => options.onCopyAll());
  cards.addEventListener('click', () => options.onToggleCards());
  clear.addEventListener('click', () => setConfirming(true));
  no.addEventListener('click', () => setConfirming(false));
  yes.addEventListener('click', () => {
    setConfirming(false);
    options.onClear();
  });

  /** `cardsHidden` is the switch's own state; each pin carries its own ✕. */
  function render(pins: SetPin[], cardsHidden = false) {
    setConfirming(false);
    dock.classList.toggle('shown', pins.length > 0);
    titleText.textContent = `${pins.length} ${pins.length === 1 ? 'pin' : 'pins'}`;
    setText(clear, `Clear all (${pins.length})`);
    confirmText.textContent = `Clear all ${pins.length}?`;
    // A toggle's name is stable and `aria-pressed` carries the state; naming
    // it after the action it would take announces the opposite of the state.
    setIcon(cards, cardsHidden ? 'eye-off' : 'eye');
    cards.setAttribute('aria-pressed', String(cardsHidden));
    rows.replaceChildren(
      ...pins.map((pin, index) => {
        const row = document.createElement('div');
        row.className = 'row';
        row.dataset.pinId = pin.id;
        const idx = document.createElement('span');
        idx.className = 'idx';
        idx.textContent = String(index + 1);
        const label = document.createElement('button');
        label.className = 'rowlabel';
        label.textContent = pin.label;
        label.title = pin.label;
        // The card comes back with the pin the reviewer just asked to see.
        label.addEventListener('click', () => {
          if (pin.hidden) options.onUnhide(pin.id);
          options.onLocate(pin.id);
        });
        row.append(idx, label);
        if (pin.hidden) {
          row.classList.add('off');
          const unhide = button('unhide', 'eye', 'Show this pin’s card again');
          unhide.addEventListener('click', () => options.onUnhide(pin.id));
          row.append(unhide);
        }
        const remove = button(
          'remove',
          'trash-2',
          'Remove this pin from the set',
        );
        remove.addEventListener('click', () => options.onRemove(pin.id));
        row.append(remove);
        return row;
      }),
    );
    // The restore clamped against the stand-in height, with the dock still
    // `display: none`; shown and filled, it has a real box to clamp against.
    reclamp();
  }

  return {
    render,
    /**
     * Mid-pick the dock is 260px of the page the reviewer cannot pick through,
     * the same way the cards are — so it folds away with them.
     */
    setCollapsed: (next: boolean) => dock.classList.toggle('folded', next),
    /** Tests and hot reloads: one dock lives as long as the page. */
    dispose() {
      window.removeEventListener('resize', reclamp);
      dock.remove();
      style.remove();
    },
  };
}

export type SetDock = ReturnType<typeof createSetDock>;
