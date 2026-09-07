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

/** A toggle is named for what pressing it DOES, never for its state (R8.1). */
const HIDE_CARDS_LABEL = `Hide every card (${CARDS_CHORD})`;
const SHOW_CARDS_LABEL = `Show every card (${CARDS_CHORD})`;

/** Where a dragged dock is parked, per tab. Cleared with the tab, not the set. */
export const DOCK_POS_KEY = 'bai-review:dock-pos';

/** The dock's own `width`, for a jsdom clamp that has no layout to read. */
const DOCK_WIDTH = 260;
/** Stand-in height while the dock is still `display: none` and measures 0. */
const DOCK_HEIGHT = 160;
/** Margin the dock keeps to every viewport edge, dragged or default. */
const EDGE_PAD = 8;
/** The corner the CSS parks an unmoved dock at, as `right`/`bottom`. */
const EDGE_INSET = 12;
/** One arrow press: the dock's own spacing unit. */
const KEY_STEP = EDGE_PAD;
/** Shift+arrow — eight of those, so a 1280px viewport is 20 presses wide. */
const KEY_STEP_BIG = EDGE_PAD * 8;

/** Named for what it DOES (R8.1), and dragging is no longer the only way. */
const GRIP_LABEL = 'Move the dock (drag, or arrow keys)';

/** Which edge each arrow pushes the dock towards. */
const ARROWS: Readonly<Record<string, DockPos | undefined>> = {
  ArrowLeft: { left: -1, top: 0 },
  ArrowRight: { left: 1, top: 0 },
  ArrowUp: { left: 0, top: -1 },
  ArrowDown: { left: 0, top: 1 },
};

export interface DockPos {
  left: number;
  top: number;
}

/**
 * Where a pin is (R7): another page — `where` is what differs — or this one
 * with its element not in the DOM right now, which is not the same as gone.
 */
export type PinPlace =
  | { kind: 'here' }
  /** `href` is absolute: the row is a real link, so the browser owns it too. */
  | { kind: 'elsewhere'; where: string; href: string }
  | { kind: 'waiting' };

/** A plain left-click is ours; every other click is the browser's (R7.1). */
const plainClick = (evt: MouseEvent): boolean =>
  evt.button === 0 &&
  !evt.metaKey &&
  !evt.ctrlKey &&
  !evt.shiftKey &&
  !evt.altKey;

/** Component names a reviewer would recognise as "the thing it was inside". */
const DIALOGISH = /dialog|modal|drawer|sheet|popover/i;

/**
 * `  in CreateButton (at /src/Create.tsx:12:8)` → `CreateButton`; a frame that
 * names only its file (`  in /src/FolderModal.tsx`) → `FolderModal`.
 */
const frameName = (line: string): string =>
  /\bin\s+([\w$.]+)/.exec(line)?.[1] ??
  /([\w$.-]+)\.[jt]sx?\b/.exec(line)?.[1] ??
  line.trim();

/**
 * Where the reviewer last saw a waiting pin's element, in the order R7.3
 * gives: the landmark, else the dialog-ish frame of its ⚛️ stack, else the
 * component, else the element itself.
 */
export function whereItWas(pin: SetPin): string {
  const { tid, c, tag, txt } = pin.anchor;
  if (tid) return tid;
  // The NAME, never the raw line: every frame carries its source path, and
  // `RadioListItem (at …/VFolderCreateModal.tsx)` is not a dialog.
  const frame = pin.stack.find((line) => DIALOGISH.test(frameName(line)));
  if (frame) return frameName(frame);
  const name = c?.dn ?? c?.name;
  if (name) return name;
  if (txt) return `${tag ?? 'element'} "${txt.slice(0, 40)}"`;
  return tag ?? 'that element';
}

/**
 * The row is one line: the reviewer's own note names the pin, and only a pin
 * with none falls back to the landmark label (R6.1). Whitespace is no note.
 */
const rowNote = (pin: SetPin): string =>
  (pin.note ?? pin.anchor.n ?? '').trim();

const STYLE = `
  .setdock {
    position: fixed; right: ${EDGE_INSET}px; bottom: ${EDGE_INSET}px;
    z-index: 2147483000;
    display: none; flex-direction: column; width: ${DOCK_WIDTH}px;
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
    border: 0; background: none; padding: 0; font: inherit; border-radius: 4px;
  }
  .setdock.dragging .grip { cursor: grabbing; }
  /* Nothing of the app's focus styling crosses the shadow boundary, so every
     focusable in here is invisible to a keyboard without its own ring. */
  .setdock .grip:focus-visible,
  .setdock .act:focus-visible,
  .setdock .rowlabel:focus-visible {
    outline: 2px solid var(--bai-review-accent); outline-offset: 1px;
  }
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
  /* Its page is not this one; the row is all it has on screen. */
  .setdock .row.away .rowlabel { color: var(--bai-review-text-dim); }
  /* An off-page row is a real link, and a link is not underlined here. */
  .setdock a.rowlabel { display: block; text-decoration: none; }
  .setdock a.act { text-decoration: none; }
  /* Its page is this one; its element is not rendered right now. */
  .setdock .row.waiting .rowlabel { opacity: 0.55; }
  /* Where that pin is, or was — the row is the only thing that can say. */
  .setdock .where {
    flex: none; max-width: 50%; overflow: hidden; text-overflow: ellipsis;
    white-space: nowrap; font-size: 11px; color: var(--bai-review-text-dim);
  }
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
  /** A row's remove button: that pin leaves the set. No confirm — it is one pin. */
  onRemove: (id: string) => void;
  /** Its card comes back: the row's eye button, or the row itself. */
  onUnhide: (id: string) => void;
  /** The header switch: every card off, or on again. */
  onToggleCards: () => void;
  /** Open the whole set on that pin's own page — it is not on this one (D2). */
  onGo?: (id: string) => void;
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

/** The same chrome as `button`, as a real link (R7.1). */
const link = (
  className: string,
  name: IconName,
  label: string,
  href: string,
): HTMLAnchorElement => {
  const node = document.createElement('a');
  node.className = `act ${className}`;
  node.href = href;
  node.append(icon(name));
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

const setLabel = (node: HTMLElement, label: string) => {
  node.title = label;
  node.setAttribute('aria-label', label);
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
  const grip = document.createElement('button');
  grip.type = 'button';
  grip.className = 'grip';
  // A dock nobody has revealed yet is not a tab stop; `render` opens it.
  grip.tabIndex = -1;
  grip.append(icon('grip-vertical'));
  setLabel(grip, GRIP_LABEL);
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
  const cards = button('cards', 'eye-off', HIDE_CARDS_LABEL, 'Cards');
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
   * Where the reviewer dragged it, or `null` for the default corner. The paint
   * clamps a COPY of it, so a window too small to hold that spot borrows it
   * for as long as it is small rather than overwriting it.
   */
  let wanted: DockPos | null = null;

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

  /** `right`/`bottom` are the CSS default; a placed dock has to drop them, and
   *  `null` — the corner a cancelled keyboard move goes back to — restores them. */
  function moveTo(next: DockPos | null) {
    wanted = next;
    if (!next) {
      dock.style.left = '';
      dock.style.top = '';
      dock.style.right = '';
      dock.style.bottom = '';
      return;
    }
    const at = clamp(next);
    dock.style.left = `${at.left}px`;
    dock.style.top = `${at.top}px`;
    dock.style.right = 'auto';
    dock.style.bottom = 'auto';
  }

  function savePos() {
    try {
      if (wanted) sessionStorage.setItem(DOCK_POS_KEY, JSON.stringify(wanted));
      else sessionStorage.removeItem(DOCK_POS_KEY);
    } catch {
      // Storage off or full: the dock still sits where it was put.
    }
  }

  /** Where an unmoved dock sits — what an arrow key steps away from. */
  function cornerPos(): DockPos {
    const box = dock.getBoundingClientRect();
    if (box.width || box.height) return { left: box.left, top: box.top };
    // jsdom, and a dock still `display: none`: no layout to read.
    return {
      left: window.innerWidth - (dock.offsetWidth || DOCK_WIDTH) - EDGE_INSET,
      top: window.innerHeight - (dock.offsetHeight || DOCK_HEIGHT) - EDGE_INSET,
    };
  }

  /** Grab offset inside the dock, so it does not jump to the cursor. */
  let grab: { dx: number; dy: number } | null = null;

  /**
   * Where the keyboard move in flight began, so Escape can undo the whole run
   * of presses and not just the last one. `at` is `null` for the default
   * corner, which is a position like any other.
   */
  let keyFrom: { at: DockPos | null } | null = null;

  grip.addEventListener('pointerdown', (evt) => {
    if (evt.button) return;
    const box = dock.getBoundingClientRect();
    grab = { dx: evt.clientX - box.left, dy: evt.clientY - box.top };
    // The pointer takes over: there is no keyboard move left to cancel.
    keyFrom = null;
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

  /** Lifting the pointer commits; so do Enter, and tabbing away. */
  const endKeyMove = () => {
    if (!keyFrom) return;
    keyFrom = null;
    savePos();
  };

  grip.addEventListener('keydown', (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Enter') {
      if (!keyFrom) return;
      // Enter is the button's own activation key; neither may reach the page.
      evt.preventDefault();
      evt.stopPropagation();
      if (evt.key === 'Enter') {
        endKeyMove();
        return;
      }
      const { at } = keyFrom;
      keyFrom = null;
      moveTo(at);
      savePos();
      return;
    }
    const arrow = ARROWS[evt.key];
    if (!arrow || evt.metaKey || evt.ctrlKey || evt.altKey) return;
    // Otherwise the page scrolls under a dock that is moving over it.
    evt.preventDefault();
    evt.stopPropagation();
    keyFrom ??= { at: wanted };
    const step = evt.shiftKey ? KEY_STEP_BIG : KEY_STEP;
    // Stepping from what is on screen, not from an unclamped drag: a dock
    // held against an edge has to come back on the very next press.
    const from = wanted ? clamp(wanted) : cornerPos();
    moveTo(
      clamp({
        left: from.left + arrow.left * step,
        top: from.top + arrow.top * step,
      }),
    );
  });

  grip.addEventListener('blur', endKeyMove);

  /** Hidden or folded the dock is `display: none`; say so in the tab order too. */
  const syncTabStop = () => {
    const list = dock.classList;
    grip.tabIndex = list.contains('shown') && !list.contains('folded') ? 0 : -1;
  };

  /**
   * Folded, the dock is `display: none` and measures the stand-in box, so a
   * clamp made then parks the real one off the bottom. It waits for the unfold.
   */
  const reclamp = () => {
    if (wanted && !dock.classList.contains('folded')) moveTo(wanted);
  };
  window.addEventListener('resize', reclamp);

  const stored = readPos();
  if (stored) moveTo(stored);

  /** Clearing is the one action with no undo, so it is asked twice. */
  const setConfirming = (on: boolean) =>
    dock.classList.toggle('confirming', on);

  /** The set the rows were last built from, as ids: what a re-render compares. */
  let listed = '';

  copyAll.addEventListener('click', () => options.onCopyAll());
  cards.addEventListener('click', () => options.onToggleCards());
  clear.addEventListener('click', () => setConfirming(true));
  no.addEventListener('click', () => setConfirming(false));
  yes.addEventListener('click', () => {
    setConfirming(false);
    options.onClear();
  });

  /**
   * `places` says where each pin is; anything missing is drawn here. Those
   * rows are the ONLY thing a pin the layer cannot draw has on screen, so an
   * `elsewhere` one opens the set on its own page instead of scrolling.
   * `cardsHidden` is the switch's own state; each pin carries its own ✕.
   */
  function render(
    pins: SetPin[],
    places: ReadonlyMap<string, PinPlace> = new Map(),
    cardsHidden = false,
  ) {
    // Ordinary page churn re-renders these rows; only a changed set changes
    // the answer to "clear all N?", so only that takes the question back.
    const ids = pins.map((pin) => pin.id).join(' ');
    if (ids !== listed) setConfirming(false);
    listed = ids;
    dock.classList.toggle('shown', pins.length > 0);
    syncTabStop();
    titleText.textContent = `${pins.length} ${pins.length === 1 ? 'pin' : 'pins'}`;
    setText(clear, `Clear all (${pins.length})`);
    confirmText.textContent = `Clear all ${pins.length}?`;
    // Glyph and name are the ACTION (R8.1), and the name is the whole story:
    // `aria-pressed` on a name that changes with the action reads out as its
    // own contradiction — "Show every card, pressed" while they are hidden.
    setIcon(cards, cardsHidden ? 'eye' : 'eye-off');
    setLabel(cards, cardsHidden ? SHOW_CARDS_LABEL : HIDE_CARDS_LABEL);
    rows.replaceChildren(
      ...pins.map((pin, index) => {
        const row = document.createElement('div');
        row.className = 'row';
        row.dataset.pinId = pin.id;
        const idx = document.createElement('span');
        idx.className = 'idx';
        idx.textContent = String(index + 1);
        const place = places.get(pin.id);
        const off = place?.kind === 'elsewhere' ? place : null;
        // An off-page row IS a link: the platform already has both intents, so
        // ⌘/Ctrl-click and middle-click reach the browser untouched (R7.1).
        const label: HTMLElement = document.createElement(off ? 'a' : 'button');
        label.className = 'rowlabel';
        const note = rowNote(pin);
        label.textContent = note ? note.replace(/\s+/g, ' ') : pin.label;
        label.title = note || pin.label;
        // The row is the control, and what it does is where its pin is: on
        // this page, go to it; on another, open the set there.
        const go = (evt: MouseEvent) => {
          if (!plainClick(evt)) return;
          evt.preventDefault();
          options.onGo?.(pin.id);
        };
        if (off) {
          (label as HTMLAnchorElement).href = off.href;
          label.addEventListener('click', go);
        } else {
          label.addEventListener('click', () => {
            // The card comes back with the pin the reviewer asked to see.
            if (pin.hidden) options.onUnhide(pin.id);
            options.onLocate(pin.id);
          });
        }
        row.append(idx, label);
        if (off) {
          row.classList.add('away');
          const where = document.createElement('span');
          where.className = 'where';
          where.textContent = off.where;
          where.title = off.where;
          const open = link(
            'go',
            'external-link',
            'Open the set on this pin’s page',
            off.href,
          );
          open.addEventListener('click', go);
          row.append(where, open);
        } else if (place?.kind === 'waiting') {
          row.classList.add('waiting');
          const where = document.createElement('span');
          where.className = 'where';
          where.textContent = `waiting — ${whereItWas(pin)}`;
          where.title = pin.label;
          row.append(where);
        } else if (pin.hidden || cardsHidden) {
          // Whatever hid the card — its own ✕ or the switch — the row is what
          // offers it back (R8.2). Only an individual hide dims the row: with
          // the switch thrown the header already says so, for every row.
          if (pin.hidden) row.classList.add('off');
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
     * the same way the cards are — so it folds away with them. Adding a pin
     * re-renders it while it is folded, so the clamp it skipped happens here.
     */
    setCollapsed(next: boolean) {
      dock.classList.toggle('folded', next);
      syncTabStop();
      if (!next) reclamp();
    },
    /** Tests and hot reloads: one dock lives as long as the page. */
    dispose() {
      window.removeEventListener('resize', reclamp);
      dock.remove();
      style.remove();
    },
  };
}

export type SetDock = ReturnType<typeof createSetDock>;
