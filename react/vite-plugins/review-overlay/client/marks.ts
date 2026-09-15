/**
 * Guided mode's MARKS (FR-3950): the docs PR-preview grammar — a tint, a
 * dashed orange outline, an ordinal badge and a state badge — drawn over each
 * located stop's element.
 *
 * The overlay lives in a Shadow root, so its CSS cannot reach the app's
 * elements and injecting a global sheet to reach them would leak styling into
 * the page under review. A tracking box inside the shadow layer draws the same
 * thing from outside, the way the pin layer already does. Only the semantic
 * attributes go on the element itself, and they come off on exit.
 */

/** Below the pin layer: a reviewer's own pins stay on top of a walkthrough. */
const STYLE = `
  .wt-marklayer {
    position: fixed; inset: 0; z-index: 2147482997; pointer-events: none;
  }
  .wt-mark {
    position: absolute; border-radius: 3px;
    background: var(--bai-mod-bg); box-shadow: 0 0 0 4px var(--bai-mod-bg);
    outline: 1.5px dashed var(--bai-accent); outline-offset: 5px;
  }
  .wt-mark.added {
    background: var(--bai-add-bg); box-shadow: 0 0 0 4px var(--bai-add-bg);
  }
  .wt-mark.viewed {
    background: transparent; box-shadow: none;
    outline-color: var(--bai-viewed-badge); outline-style: dotted;
  }
  .wt-mark.current { outline-width: 2.5px; }
  .wt-badge {
    position: absolute; z-index: 1; font-size: 10px; font-weight: 700;
    text-transform: uppercase; letter-spacing: .04em; padding: 1px 6px;
    border-radius: 999px; background: var(--bai-viewed-badge); color: #fff;
    white-space: nowrap; pointer-events: none;
  }
  .wt-badge.comment { background: var(--bai-focus); }
  .wt-badge.num {
    background: var(--bai-accent); min-width: 18px; text-align: center;
    font-variant-numeric: tabular-nums; cursor: pointer; pointer-events: auto;
    border: 0; font-family: inherit;
  }
`;

export interface MarkSpec {
  id: string;
  /** Zero-based position in the walkthrough set. */
  index: number;
  total: number;
  label: string;
  type: 'added' | 'modified';
  element: Element;
  viewed: boolean;
  commented: boolean;
  current: boolean;
}

interface Mark {
  spec: MarkSpec;
  box: HTMLElement;
  num: HTMLButtonElement;
  badge: HTMLElement;
}

export interface MarkLayerOptions {
  root: ShadowRoot;
  /** The ordinal badge is the mark's one control: it selects that stop. */
  onSelect: (id: string) => void;
}

const stateText = (spec: MarkSpec): string =>
  spec.commented
    ? spec.viewed
      ? '✓ viewed · ✎ comment'
      : '✎ comment'
    : spec.viewed
      ? '✓ viewed'
      : '';

export function createMarkLayer({ root, onSelect }: MarkLayerOptions) {
  const style = document.createElement('style');
  style.textContent = STYLE;
  const layer = document.createElement('div');
  layer.className = 'wt-marklayer';
  root.append(style, layer);

  const marks = new Map<string, Mark>();
  /** Every element we stamped, so exit takes the attributes back off. */
  const stamped = new Set<Element>();

  /** What we added to THIS element, so exit gives back what the app had. */
  const OWNED = 'data-bai-mark-owned';

  function stamp(spec: MarkSpec) {
    const element = spec.element;
    element.setAttribute('data-bai-change', spec.id);
    element.setAttribute('data-bai-type', spec.type);
    // Re-stamping is a refresh: what the FIRST stamp claimed stays claimed,
    // or the second one would read back its own role as the app's.
    const already = element.getAttribute(OWNED);
    if (already !== null) return void stamped.add(element);
    const owned = ['data-bai-change', 'data-bai-type'];
    // The app's own role and label outrank ours: a walkthrough must not turn
    // a real control into a button for a screen reader.
    if (!element.hasAttribute('role')) {
      element.setAttribute('role', 'button');
      owned.push('role');
    }
    if (!element.hasAttribute('aria-label')) {
      element.setAttribute(
        'aria-label',
        `Change ${spec.index + 1} of ${spec.total}: ${spec.label}`,
      );
      owned.push('aria-label');
    }
    element.setAttribute(OWNED, owned.join(' '));
    stamped.add(element);
  }

  function unstamp(element: Element) {
    for (const name of (element.getAttribute(OWNED) ?? '').split(' '))
      if (name) element.removeAttribute(name);
    element.removeAttribute(OWNED);
    stamped.delete(element);
  }

  function create(spec: MarkSpec): Mark {
    const box = document.createElement('div');
    box.className = 'wt-mark';
    const num = document.createElement('button');
    num.className = 'wt-badge num';
    num.type = 'button';
    num.addEventListener('click', () => onSelect(spec.id));
    const badge = document.createElement('span');
    badge.className = 'wt-badge';
    layer.append(box, num, badge);
    return { spec, box, num, badge };
  }

  /** The element's own box, in viewport coordinates — the layer is fixed. */
  function place(mark: Mark) {
    const box = mark.spec.element.getBoundingClientRect();
    Object.assign(mark.box.style, {
      left: `${box.left}px`,
      top: `${box.top}px`,
      width: `${box.width}px`,
      height: `${box.height}px`,
    });
    Object.assign(mark.num.style, {
      left: `${box.left - 8}px`,
      top: `${box.top - 10}px`,
    });
    Object.assign(mark.badge.style, {
      left: `${box.right - mark.badge.offsetWidth - 6}px`,
      top: `${box.top - 12}px`,
    });
  }

  function apply(mark: Mark, spec: MarkSpec) {
    mark.spec = spec;
    mark.box.className = `wt-mark${spec.type === 'added' ? ' added' : ''}${
      spec.viewed ? ' viewed' : ''
    }${spec.current ? ' current' : ''}`;
    mark.num.textContent = String(spec.index + 1);
    mark.num.title = spec.label;
    const text = stateText(spec);
    mark.badge.textContent = text;
    mark.badge.className = `wt-badge${spec.commented ? ' comment' : ''}`;
    mark.badge.style.display = text ? 'block' : 'none';
    place(mark);
  }

  function drop(id: string) {
    const mark = marks.get(id);
    if (!mark) return;
    mark.box.remove();
    mark.num.remove();
    mark.badge.remove();
    unstamp(mark.spec.element);
    marks.delete(id);
  }

  return {
    /** Exactly these marks, in set order; anything else is taken down. */
    render(specs: MarkSpec[]) {
      const wanted = new Set(specs.map((spec) => spec.id));
      for (const id of [...marks.keys()]) if (!wanted.has(id)) drop(id);
      for (const spec of specs) {
        const held = marks.get(spec.id);
        // A re-render can hand the same stop a different element.
        if (held && held.spec.element !== spec.element)
          unstamp(held.spec.element);
        const mark = held ?? create(spec);
        if (!held) marks.set(spec.id, mark);
        stamp(spec);
        apply(mark, spec);
      }
    },
    /** A scroll or a resize moves the elements, not what they mean. */
    reposition() {
      for (const mark of marks.values()) place(mark);
    },
    destroy() {
      for (const id of [...marks.keys()]) drop(id);
      // A stamped element the last render dropped its mark for still carries
      // the attributes; exit owes the page a clean DOM.
      for (const element of [...stamped]) unstamp(element);
      layer.remove();
      style.remove();
    },
  };
}

export type MarkLayer = ReturnType<typeof createMarkLayer>;
