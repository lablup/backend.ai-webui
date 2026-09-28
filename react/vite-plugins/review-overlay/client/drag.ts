/**
 * Moving guided mode's chrome out of the page's way: the navigator and the
 * popover sit where the page often keeps its own controls (a sticky save bar,
 * a row at the bottom of a table), so the reader drags them elsewhere.
 *
 * A drop is kept per tab and outlives stop changes and reloads; a double-click
 * on the drag area sends the box back to where it places itself.
 */
import { icon } from './icons.js';

export interface DragPos {
  left: number;
  top: number;
}

/** Margin a placed box keeps to every viewport edge. */
const EDGE_PAD = 8;
const KEY_STEP = EDGE_PAD;
const KEY_STEP_BIG = EDGE_PAD * 8;
const ARROWS: Readonly<Record<string, DragPos | undefined>> = {
  ArrowLeft: { left: -1, top: 0 },
  ArrowRight: { left: 1, top: 0 },
  ArrowUp: { left: 0, top: -1 },
  ArrowDown: { left: 0, top: 1 },
};

const GRIP = '[data-drag-grip]';
const AREA = '[data-drag-area]';
/** What inside a drag area still answers a click instead of starting a drag. */
const INTERACTIVE = 'button, input, textarea, select, label, a';

export const DRAG_LABEL =
  'Drag to move (or arrow keys) · double-click to put it back';

export const DRAG_STYLE = `
  [data-drag-area] {
    cursor: grab; touch-action: none; -webkit-user-select: none;
    user-select: none;
  }
  .dragging, .dragging [data-drag-area] { cursor: grabbing; }
  button[data-drag-grip] {
    flex: none; display: flex; align-items: center; cursor: grab;
    color: var(--bai-review-text-dim); touch-action: none;
    border: 0; background: none; padding: 0; font: inherit; border-radius: 4px;
  }
  button[data-drag-grip]:focus-visible {
    outline: 2px solid var(--bai-review-accent); outline-offset: 1px;
  }
`;

export function createGrip(): HTMLButtonElement {
  const grip = document.createElement('button');
  grip.type = 'button';
  grip.dataset.dragGrip = '';
  grip.title = DRAG_LABEL;
  grip.setAttribute('aria-label', DRAG_LABEL);
  grip.append(icon('grip-vertical'));
  return grip;
}

/** A tab that refuses storage still drags; it just forgets on reload. */
function readPos(key: string): DragPos | null {
  try {
    const raw = sessionStorage.getItem(key);
    const value = raw ? (JSON.parse(raw) as unknown) : null;
    if (!value || typeof value !== 'object') return null;
    const { left, top } = value as Record<string, unknown>;
    if (typeof left !== 'number' || typeof top !== 'number') return null;
    if (!Number.isFinite(left) || !Number.isFinite(top)) return null;
    return { left, top };
  } catch {
    return null;
  }
}

export interface DraggableOptions {
  /** The fixed box that moves; drags start on its grip or drag area. */
  box: HTMLElement;
  storageKey: string;
  /** Stand-in size while the box has no layout (jsdom, `display: none`). */
  fallback: { width: number; height: number };
  /** Moved or sent back (`null`): the owner re-places what hangs off it. */
  onMove: (pos: DragPos | null) => void;
}

export function makeDraggable(options: DraggableOptions) {
  const { box, storageKey, fallback } = options;
  /**
   * Where the reader dropped it. The paint clamps a COPY, so a window too
   * small for that spot borrows it only while it is small.
   */
  let wanted: DragPos | null = readPos(storageKey);
  let grab: { dx: number; dy: number } | null = null;

  function clamp({ left, top }: DragPos): DragPos {
    const width = box.offsetWidth || fallback.width;
    const height = box.offsetHeight || fallback.height;
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

  /** Paints `wanted`; a box never moved keeps whatever its owner set. */
  function apply() {
    if (!wanted) return;
    const at = clamp(wanted);
    Object.assign(box.style, {
      left: `${at.left}px`,
      top: `${at.top}px`,
      right: 'auto',
      bottom: 'auto',
      transform: 'none',
    });
  }

  function save() {
    try {
      if (wanted) sessionStorage.setItem(storageKey, JSON.stringify(wanted));
      else sessionStorage.removeItem(storageKey);
    } catch {
      // Storage off or full: the box still sits where it was put.
    }
  }

  function moveTo(next: DragPos | null) {
    wanted = next;
    if (next) apply();
    else
      Object.assign(box.style, {
        left: '',
        top: '',
        right: '',
        bottom: '',
        transform: '',
      });
    options.onMove(next);
  }

  const handleOf = (evt: Event): Element | null => {
    const target = evt.target instanceof Element ? evt.target : null;
    if (!target) return null;
    const grip = target.closest(GRIP);
    if (grip) return grip;
    if (target.closest(INTERACTIVE)) return null;
    return target.closest(AREA);
  };

  function onPointerDown(evt: PointerEvent) {
    if (evt.button || !handleOf(evt)) return;
    const rect = box.getBoundingClientRect();
    grab = { dx: evt.clientX - rect.left, dy: evt.clientY - rect.top };
    // Otherwise the gesture becomes a text selection, and react-grab's select
    // mode reads it as a pick.
    evt.preventDefault();
    evt.stopPropagation();
    box.classList.add('dragging');
    // Capture keeps a release over a button from firing that button.
    try {
      box.setPointerCapture(evt.pointerId);
    } catch {
      // jsdom, and any browser that refuses a capture it has no pointer for.
    }
  }

  function onPointerMove(evt: PointerEvent) {
    if (!grab) return;
    evt.preventDefault();
    moveTo({ left: evt.clientX - grab.dx, top: evt.clientY - grab.dy });
  }

  function onPointerUp(evt: PointerEvent) {
    if (!grab) return;
    grab = null;
    box.classList.remove('dragging');
    try {
      box.releasePointerCapture(evt.pointerId);
    } catch {
      // Never captured; nothing to release.
    }
    save();
  }

  function onDoubleClick(evt: MouseEvent) {
    if (!handleOf(evt) || !wanted) return;
    evt.preventDefault();
    moveTo(null);
    save();
  }

  function onKeydown(evt: KeyboardEvent) {
    const target = evt.target instanceof Element ? evt.target : null;
    if (!target?.closest(GRIP)) return;
    const arrow = ARROWS[evt.key];
    if (!arrow || evt.metaKey || evt.ctrlKey || evt.altKey) return;
    // Neither the page nor guided mode's own keys may see it.
    evt.preventDefault();
    evt.stopPropagation();
    const rect = box.getBoundingClientRect();
    const from = wanted ? clamp(wanted) : { left: rect.left, top: rect.top };
    const step = evt.shiftKey ? KEY_STEP_BIG : KEY_STEP;
    moveTo(
      clamp({
        left: from.left + arrow.left * step,
        top: from.top + arrow.top * step,
      }),
    );
    save();
  }

  function onResize() {
    if (!wanted) return;
    apply();
    options.onMove(wanted);
  }

  box.addEventListener('pointerdown', onPointerDown);
  box.addEventListener('pointermove', onPointerMove);
  box.addEventListener('pointerup', onPointerUp);
  box.addEventListener('pointercancel', onPointerUp);
  box.addEventListener('dblclick', onDoubleClick);
  box.addEventListener('keydown', onKeydown);
  window.addEventListener('resize', onResize);

  return {
    /** Where the reader parked the box, or `null` while it places itself. */
    placed: (): DragPos | null => wanted,
    /** Re-paints the parked spot, e.g. after the box changed size. */
    apply,
    destroy() {
      window.removeEventListener('resize', onResize);
    },
  };
}

export type Draggable = ReturnType<typeof makeDraggable>;
