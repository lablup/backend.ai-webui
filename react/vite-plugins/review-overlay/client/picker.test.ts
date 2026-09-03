/**
 * ⌘⌃C must always be the review pick. react-grab 0.1.50 deactivates on the
 * modifier's keyup whenever the session was not started by its toggle
 * (`S()&&!p.wasActivatedByToggle?Z():…`), and it calls `onElementSelect`
 * asynchronously — so a state-gated hook loses the race and the element
 * reaches react-grab's own clipboard instead.
 */
import {
  createPicker,
  isReactGrabChord,
  type Picker,
  type PickerCallbacks,
} from './picker.js';
import type { Plugin, PluginHooks, ReactGrabAPI } from 'react-grab';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * `Tn` in react-grab's core: every element whose hook returned a FALSY value
 * goes on to `wn(...)` and the clipboard. This mirrors that decision.
 */
const selectAll = (hooks: PluginHooks, elements: Element[]): Element[] =>
  elements.filter((element) => !hooks.onElementSelect?.(element));

let hooks: PluginHooks;
let grab: ReactGrabAPI;
let active: boolean;
let picks: Array<Element>;
let callbacks: PickerCallbacks;

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(() => {
  document.body.innerHTML =
    '<button id="a">A</button><button id="b">B</button>';
  active = false;
  picks = [];
  hooks = {};
  grab = {
    activate: () => {
      if (active) return;
      active = true;
      void hooks.onActivate?.();
    },
    deactivate: () => {
      if (!active) return;
      active = false;
      void hooks.onDeactivate?.();
    },
    isActive: () => active,
    registerPlugin: (plugin: Plugin) => {
      hooks = plugin.hooks ?? {};
    },
    getStackContext: () => Promise.resolve(''),
    getSource: () => Promise.resolve(null),
  } as unknown as ReactGrabAPI;
  window.__REACT_GRAB__ = grab;
  callbacks = {
    onPick: (element) => picks.push(element),
    onModeChange: () => undefined,
    onHover: () => undefined,
    isOwnEvent: () => false,
    showHint: () => undefined,
    sourceRoot: () => null,
  };
});

/** Both modifiers, so the chord matches whichever one the platform wants. */
const chord = (over: KeyboardEventInit = {}) =>
  new KeyboardEvent('keydown', {
    key: 'c',
    code: 'KeyC',
    metaKey: true,
    ctrlKey: true,
    bubbles: true,
    ...over,
  });

const el = (id: string) => document.getElementById(id) as Element;

/**
 * A picker's fallback hotkey outlives `stop()` by design, and the callbacks
 * close over the CURRENT `picks`, so a leaked picker would answer the next
 * test's chord.
 */
let live: Picker[] = [];
const make = (over: PickerCallbacks) => {
  const picker = createPicker(over);
  live.push(picker);
  return picker;
};

afterEach(() => {
  live.forEach((picker) => picker.dispose());
  live = [];
});

describe('the react-grab pick is unconditional', () => {
  it('intercepts a pick made while the session is active', async () => {
    const picker = make(callbacks);
    picker.watchForReactGrab();
    grab.activate();

    expect(selectAll(hooks, [el('a')])).toEqual([]);
    await flush();
    expect(picks).toEqual([el('a')]);
  });

  it('still intercepts after the keyup deactivate has already fired', async () => {
    const picker = make(callbacks);
    picker.watchForReactGrab();
    grab.activate();
    // react-grab's hold path: releasing ⌘/⌃ runs `Z()` before the deferred
    // `onElementSelect`, so the hook sees an already-deactivated session.
    grab.deactivate();
    expect(picker.isActive()).toBe(false);

    expect(selectAll(hooks, [el('a')])).toEqual([]);
    await flush();
    expect(picks).toEqual([el('a')]);
  });

  it('intercepts a pick that arrives with no activation at all', async () => {
    const picker = make(callbacks);
    picker.watchForReactGrab();

    expect(selectAll(hooks, [el('a')])).toEqual([]);
    await flush();
    expect(picks).toEqual([el('a')]);
  });

  it('takes a multi-element selection whole and opens one composer', async () => {
    const picker = make(callbacks);
    picker.watchForReactGrab();
    grab.activate();

    expect(selectAll(hooks, [el('a'), el('b')])).toEqual([]);
    await flush();
    expect(picks).toEqual([el('a')]);
  });
});

/**
 * react-grab labels a box select with the DRAG RECTANGLE (`Dn`:
 * `f = l && u ? nr(l) : N(t)`), and the overlay used to keep only the first
 * element of it — two different regions for one gesture.
 */
describe('a box select becomes one frame plus its region', () => {
  /** jsdom has no layout, so the fixture declares every box. */
  const sized = (element: Element, box: Partial<DOMRect>) => {
    const full = { left: 0, top: 0, width: 0, height: 0, ...box };
    element.getBoundingClientRect = () =>
      ({
        ...full,
        right: full.left + full.width,
        bottom: full.top + full.height,
      }) as DOMRect;
  };

  const drag = (elements: Element[]) => {
    hooks.onDragEnd?.(elements, { x: 0, y: 0, width: 0, height: 0 });
    return selectAll(hooks, elements);
  };

  beforeEach(() => {
    document.body.innerHTML =
      '<div id="row"><button id="a">A</button><button id="b">B</button></div>';
    sized(el('row'), { left: 0, top: 0, width: 400, height: 100 });
    sized(el('a'), { left: 20, top: 20, width: 100, height: 40 });
    sized(el('b'), { left: 200, top: 20, width: 100, height: 40 });
  });

  it('anchors to the frame and hands over the region it covered', async () => {
    const seen: Array<[Element, unknown]> = [];
    const picker = make({
      ...callbacks,
      onPick: (element, _x, _y, region) => seen.push([element, region]),
    });
    picker.watchForReactGrab();
    grab.activate();

    expect(drag([el('a'), el('b')])).toEqual([]);
    await flush();
    expect(seen).toEqual([
      [el('row'), { left: 20, top: 20, width: 280, height: 40 }],
    ]);
  });

  it('leaves a one-element drag exactly as a click pick', async () => {
    const picker = make(callbacks);
    picker.watchForReactGrab();
    grab.activate();

    expect(drag([el('a')])).toEqual([]);
    await flush();
    expect(picks).toEqual([el('a')]);
  });

  it('does not let a stale drag give a later click pick a region', async () => {
    const seen: Array<[Element, unknown]> = [];
    const picker = make({
      ...callbacks,
      onPick: (element, _x, _y, region) => seen.push([element, region]),
    });
    picker.watchForReactGrab();
    grab.activate();

    hooks.onDragEnd?.([el('a'), el('b')], { x: 0, y: 0, width: 0, height: 0 });
    // The reviewer let go outside everything, then clicked one element.
    document.body.insertAdjacentHTML('beforeend', '<button id="c">C</button>');
    sized(el('c'), { left: 0, top: 200, width: 50, height: 20 });
    expect(selectAll(hooks, [el('c')])).toEqual([]);
    await flush();
    expect(seen).toEqual([[el('c'), null]]);
  });

  it('never lets react-grab build copy content', () => {
    const picker = make(callbacks);
    picker.watchForReactGrab();

    expect(hooks.transformCopyContent?.('<button>A</button>', [el('a')])).toBe(
      '',
    );
  });
});

describe('the picker still tracks react-grab s activation', () => {
  it('reports active while the session is on, and stops it', () => {
    const modes: boolean[] = [];
    const picker = make({
      ...callbacks,
      onModeChange: (value) => modes.push(value),
    });
    picker.watchForReactGrab();

    picker.start();
    expect(picker.isActive()).toBe(true);
    picker.stop();
    expect(picker.isActive()).toBe(false);
    expect(active).toBe(false);
    expect(modes).toContain(true);
    expect(modes).toContain(false);
  });

  it('falls back to its own picker when react-grab will not activate', () => {
    grab.activate = () => undefined;
    const picker = make(callbacks);
    picker.watchForReactGrab();

    picker.start();
    expect(picker.isHotkeyArmed()).toBe(true);
    expect(picker.isActive()).toBe(true);

    el('a').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(picks).toEqual([el('a')]);
    expect(picker.isActive()).toBe(false);
  });
});

// The overlay has no button any more, so this chord IS the entry point on a
// page where react-grab never loaded.
describe('the fallback hotkey', () => {
  it('matches react-grab s own chord and nothing else', () => {
    expect(isReactGrabChord(chord())).toBe(true);
    expect(isReactGrabChord(chord({ code: '', key: 'C' }))).toBe(true);
    expect(isReactGrabChord(chord({ shiftKey: true }))).toBe(false);
    expect(isReactGrabChord(chord({ altKey: true }))).toBe(false);
    expect(isReactGrabChord(chord({ key: 'v', code: 'KeyV' }))).toBe(false);
    expect(isReactGrabChord(chord({ metaKey: false, ctrlKey: false }))).toBe(
      false,
    );
  });

  it('arms once the react-grab poll gives up, and starts a pick', () => {
    vi.useFakeTimers();
    window.__REACT_GRAB__ = undefined;
    const picker = make(callbacks);
    picker.watchForReactGrab();
    expect(picker.isHotkeyArmed()).toBe(false);
    vi.advanceTimersByTime(500 * 41);
    vi.useRealTimers();
    expect(picker.isHotkeyArmed()).toBe(true);

    window.dispatchEvent(chord());
    expect(picker.isActive()).toBe(true);
    el('a').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(picks).toEqual([el('a')]);
    picker.stop();
  });

  it('stays out of the way inside a text field', () => {
    grab.activate = () => undefined;
    const picker = make(callbacks);
    picker.watchForReactGrab();
    picker.start();
    picker.stop();

    document.body.insertAdjacentHTML('beforeend', '<input id="f" />');
    const field = document.getElementById('f') as HTMLInputElement;
    field.dispatchEvent(chord());
    expect(picker.isActive()).toBe(false);
  });

  it('hands the chord back when react-grab finally shows up', () => {
    vi.useFakeTimers();
    window.__REACT_GRAB__ = undefined;
    const picker = make(callbacks);
    picker.watchForReactGrab();
    vi.advanceTimersByTime(500 * 41);
    vi.useRealTimers();
    expect(picker.isHotkeyArmed()).toBe(true);

    window.__REACT_GRAB__ = grab;
    picker.start();
    expect(picker.isHotkeyArmed()).toBe(false);
    picker.stop();
  });
});

/**
 * react-grab hands back the driver's absolute path for anything outside the
 * Vite root — every workspace package — and the block it lands in is a public
 * PR comment. See `source-path.ts`.
 */
describe('source paths are repository-relative', () => {
  const ROOT = '/home/u/ws/webui';
  const withRoot = () => make({ ...callbacks, sourceRoot: () => ROOT });

  it('strips the root from a stack frame and leaves an app frame alone', async () => {
    grab.getStackContext = () =>
      Promise.resolve(
        `\n  in BAIFlex (at ${ROOT}/packages/backend.ai-ui/src/components/BAIFlex.tsx)` +
          `\n  in WebUIHeader (at /src/components/MainLayout/WebUIHeader.tsx)`,
      );
    const picker = withRoot();

    expect(await picker.getStack(document.body)).toEqual([
      '  in BAIFlex (at packages/backend.ai-ui/src/components/BAIFlex.tsx)',
      '  in WebUIHeader (at /src/components/MainLayout/WebUIHeader.tsx)',
    ]);
  });

  it("strips the root from the component's own source too", async () => {
    grab.getSource = () =>
      Promise.resolve({
        componentName: 'BAIFlex',
        filePath: `${ROOT}/packages/backend.ai-ui/src/components/BAIFlex.tsx`,
        lineNumber: 79,
        columnNumber: 26,
      });
    const picker = withRoot();

    expect((await picker.getComponent(document.body))?.src).toBe(
      'packages/backend.ai-ui/src/components/BAIFlex.tsx:79:26',
    );
  });

  it('leaves everything verbatim until the server names a root', async () => {
    const line = `  in BAIFlex (at ${ROOT}/packages/backend.ai-ui/src/x.tsx)`;
    grab.getStackContext = () => Promise.resolve(line);
    const picker = make(callbacks);

    expect(await picker.getStack(document.body)).toEqual([line]);
  });
});
