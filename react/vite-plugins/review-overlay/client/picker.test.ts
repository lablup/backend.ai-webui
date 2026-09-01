/**
 * ⌘⌃C must always be the review pick. react-grab 0.1.50 deactivates on the
 * modifier's keyup whenever the session was not started by its toggle
 * (`S()&&!p.wasActivatedByToggle?Z():…`), and it calls `onElementSelect`
 * asynchronously — so a state-gated hook loses the race and the element
 * reaches react-grab's own clipboard instead.
 */
import { createPicker, type PickerCallbacks } from './picker.js';
import type { Plugin, PluginHooks, ReactGrabAPI } from 'react-grab';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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
    onReactGrabUnavailable: () => undefined,
  };
});

const el = (id: string) => document.getElementById(id) as Element;

describe('the react-grab pick is unconditional', () => {
  it('intercepts a pick made while the session is active', async () => {
    const picker = createPicker(callbacks);
    picker.watchForReactGrab();
    grab.activate();

    expect(selectAll(hooks, [el('a')])).toEqual([]);
    await flush();
    expect(picks).toEqual([el('a')]);
  });

  it('still intercepts after the keyup deactivate has already fired', async () => {
    const picker = createPicker(callbacks);
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
    const picker = createPicker(callbacks);
    picker.watchForReactGrab();

    expect(selectAll(hooks, [el('a')])).toEqual([]);
    await flush();
    expect(picks).toEqual([el('a')]);
  });

  it('takes a multi-element selection whole and opens one composer', async () => {
    const picker = createPicker(callbacks);
    picker.watchForReactGrab();
    grab.activate();

    expect(selectAll(hooks, [el('a'), el('b')])).toEqual([]);
    await flush();
    expect(picks).toEqual([el('a')]);
  });

  it('never lets react-grab build copy content', () => {
    const picker = createPicker(callbacks);
    picker.watchForReactGrab();

    expect(hooks.transformCopyContent?.('<button>A</button>', [el('a')])).toBe(
      '',
    );
  });
});

describe('the picker still tracks react-grab s activation', () => {
  it('reports active while the session is on, and stops it', () => {
    const modes: boolean[] = [];
    const picker = createPicker({
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
    const unavailable = vi.fn();
    grab.activate = () => undefined;
    const picker = createPicker({
      ...callbacks,
      onReactGrabUnavailable: unavailable,
    });
    picker.watchForReactGrab();

    picker.start();
    expect(unavailable).toHaveBeenCalled();
    expect(picker.isActive()).toBe(true);

    el('a').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(picks).toEqual([el('a')]);
    expect(picker.isActive()).toBe(false);
  });
});
