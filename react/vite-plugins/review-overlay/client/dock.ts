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
import { isMac } from './picker.js';
import type { SetPin } from './types.js';

/** ⌘⇧H / Ctrl⇧H — plain ⌘H hides the app and Ctrl+H opens history. */
export const CARDS_CHORD = isMac() ? '⌘⇧H' : 'Ctrl⇧H';

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
  .setdock .title { font-weight: 600; margin-right: auto; }
  .setdock .act {
    cursor: pointer; border: 0; background: none; padding: 2px 4px;
    font: inherit; color: var(--bai-review-text-dim); border-radius: 4px;
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

const button = (
  className: string,
  text: string,
  label: string,
): HTMLButtonElement => {
  const node = document.createElement('button');
  node.className = `act ${className}`;
  node.textContent = text;
  // The glyph is the accessible name unless one is given, and "⧉" is not it.
  node.title = label;
  node.setAttribute('aria-label', label);
  return node;
};

export function createSetDock(options: SetDockOptions) {
  const style = document.createElement('style');
  style.textContent = STYLE;
  const dock = document.createElement('div');
  dock.className = 'setdock';
  const head = document.createElement('div');
  head.className = 'head';
  const title = document.createElement('span');
  title.className = 'title';
  const copyAll = button(
    'copyall',
    '⧉ Copy all',
    'Copy every pin as one comment',
  );
  const clear = button('clear', '🗑 Clear all', 'Clear the whole set');
  const cards = button('cards', '👁 Cards', 'Hide every pin card');
  const chord = document.createElement('span');
  chord.className = 'chord';
  chord.textContent = CARDS_CHORD;
  const confirm = document.createElement('span');
  confirm.className = 'confirm';
  const confirmText = document.createElement('span');
  const yes = button('yes', '✓', 'Yes, clear the whole set');
  const no = button('no', '✕', 'Keep the set');
  confirm.append(confirmText, yes, no);
  head.append(title, chord, cards, copyAll, clear, confirm);
  const rows = document.createElement('div');
  rows.className = 'rows';
  dock.append(head, rows);
  options.root.append(style, dock);

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
    title.textContent = `📍 ${pins.length} ${pins.length === 1 ? 'pin' : 'pins'}`;
    clear.textContent = `🗑 Clear all (${pins.length})`;
    confirmText.textContent = `Clear all ${pins.length}?`;
    cards.textContent = cardsHidden ? '🙈 Cards' : '👁 Cards';
    cards.setAttribute('aria-pressed', String(cardsHidden));
    const cardsLabel = cardsHidden
      ? `Show every pin card (${CARDS_CHORD})`
      : `Hide every pin card (${CARDS_CHORD})`;
    cards.title = cardsLabel;
    cards.setAttribute('aria-label', cardsLabel);
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
          const unhide = button('unhide', '🙈', 'Show this pin’s card again');
          unhide.addEventListener('click', () => options.onUnhide(pin.id));
          row.append(unhide);
        }
        const remove = button('remove', '🗑', 'Remove this pin from the set');
        remove.addEventListener('click', () => options.onRemove(pin.id));
        row.append(remove);
        return row;
      }),
    );
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
      dock.remove();
      style.remove();
    },
  };
}

export type SetDock = ReturnType<typeof createSetDock>;
