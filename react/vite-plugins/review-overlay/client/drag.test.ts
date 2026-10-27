/**
 * Dragging guided mode's navigator and popover off the page's own controls:
 * a sticky save bar at the bottom sat under both with no way to reach it.
 */
import {
  createNavigator,
  NAV_POS_KEY,
  type NavigatorModel,
} from './navigator.js';
import {
  createPopover,
  POPOVER_POS_KEY,
  type PopoverModel,
} from './popover.js';
import { beforeEach, describe, expect, it } from 'vitest';

let root: ShadowRoot;

beforeEach(() => {
  sessionStorage.clear();
  document.body.innerHTML = '';
  Object.defineProperty(window, 'innerWidth', {
    value: 1280,
    configurable: true,
  });
  Object.defineProperty(window, 'innerHeight', {
    value: 900,
    configurable: true,
  });
  const host = document.createElement('div');
  document.body.append(host);
  root = host.attachShadow({ mode: 'open' });
});

const fire = (target: Element, type: string, x = 0, y = 0) => {
  const evt = new MouseEvent(type, {
    clientX: x,
    clientY: y,
    bubbles: true,
    cancelable: true,
  });
  target.dispatchEvent(evt);
  return evt;
};
/** jsdom's boxes sit at 0,0, so the cursor IS the new top-left. */
const dragTo = (from: Element, x: number, y: number) => {
  fire(from, 'pointerdown');
  fire(from, 'pointermove', x, y);
  fire(from, 'pointerup', x, y);
};
const q = (selector: string) =>
  root.querySelector<HTMLElement>(selector) as HTMLElement;

const navModel = (over: Partial<NavigatorModel> = {}): NavigatorModel => ({
  dodge: false,
  truncated: '',
  pages: 1,
  total: 4,
  index: 0,
  viewed: 0,
  comments: 0,
  waiting: false,
  panelOpen: false,
  pr: 1,
  groups: [],
  ...over,
});

const noop = () => {};
const makeNav = () => {
  const nav = createNavigator(
    root,
    {
      onNext: noop,
      onPrev: noop,
      onTogglePanel: noop,
      onCopyComments: noop,
      onCopySummary: noop,
      onGo: noop,
      onExit: noop,
    },
    { pageChords: true },
  );
  nav.render(navModel());
  return nav;
};

const popModel = (): PopoverModel => ({
  id: 'c_aaaaaaa',
  index: 0,
  total: 2,
  page: '/a',
  label: 'x',
  type: 'added',
  kind: 'alert',
  changed: 'changed',
  check: 'check',
  old: '',
  next: '',
  code: [],
  comment: '',
  viewed: false,
  place: { kind: 'located', rect: { left: 40, top: 600, bottom: 640 } },
  lang: 'en',
  langs: [],
});
const makePop = () =>
  createPopover(
    root,
    {
      onToggleViewed: noop,
      onComment: noop,
      onCopyRef: noop,
      onLanguage: noop,
      onClose: noop,
    },
    { pageChords: true },
  );

describe('dragging the navigator', () => {
  it('moves the pill from its body and keeps the spot for the tab', () => {
    makeNav();
    dragTo(q('.bai-nav .n'), 300, 200);

    const pill = q('.bai-nav');
    expect(pill.style.left).toBe('300px');
    expect(pill.style.top).toBe('200px');
    expect(pill.style.right).toBe('auto');
    expect(JSON.parse(sessionStorage.getItem(NAV_POS_KEY) ?? '')).toEqual({
      left: 300,
      top: 200,
    });
  });

  it('never starts a drag from one of its buttons', () => {
    makeNav();
    const down = fire(q('.bai-nav [data-act="next"]'), 'pointerdown');
    fire(q('.bai-nav [data-act="next"]'), 'pointermove', 300, 200);

    expect(down.defaultPrevented).toBe(false);
    expect(q('.bai-nav').style.left).toBe('');
  });

  it('keeps the grip through a re-render and reopens where it was left', () => {
    const nav = makeNav();
    dragTo(q('.bai-nav [data-drag-grip]'), 300, 200);
    nav.render(navModel({ index: 2 }));
    expect(q('.bai-nav [data-drag-grip]')).not.toBeNull();
    nav.destroy();

    makeNav();
    expect(q('.bai-nav').style.left).toBe('300px');
  });

  it('goes back to its corner on a double-click', () => {
    makeNav();
    dragTo(q('.bai-nav .n'), 300, 200);
    fire(q('.bai-nav .n'), 'dblclick');

    expect(q('.bai-nav').style.left).toBe('');
    expect(sessionStorage.getItem(NAV_POS_KEY)).toBeNull();
  });

  it('moves one step per arrow key on the grip', () => {
    makeNav();
    dragTo(q('.bai-nav .n'), 300, 200);
    const key = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
      cancelable: true,
    });
    q('.bai-nav [data-drag-grip]').dispatchEvent(key);

    expect(key.defaultPrevented).toBe(true);
    expect(q('.bai-nav').style.left).toBe('308px');
  });

  it('opens the stop list next to a moved pill', () => {
    const nav = makeNav();
    dragTo(q('.bai-nav .n'), 600, 500);
    nav.render(navModel({ panelOpen: true }));

    const panel = q('.bai-panel');
    // jsdom's pill box is empty, so "above" misses and the list drops below.
    expect(panel.style.top).not.toBe('');
    expect(panel.style.right).toBe('auto');
  });
});

describe('dragging the popover', () => {
  it('keeps a drop to its own stop; another stop opens by its element', () => {
    const pop = makePop();
    pop.render(popModel());
    const anchored = q('.bai-popover').style.top;
    dragTo(q('.bai-popover .head'), 200, 100);

    pop.render({ ...popModel(), id: 'c_bbbbbbb' });
    expect(q('.bai-popover').style.left).not.toBe('200px');
    expect(q('.bai-popover').style.top).toBe(anchored);
    expect(q('.bai-popover').style.right).toBe('');

    pop.render(popModel());
    expect(q('.bai-popover').style.left).toBe('200px');
    expect(q('.bai-popover').style.top).toBe('100px');
    expect(
      sessionStorage.getItem(`${POPOVER_POS_KEY}:c_aaaaaaa`),
    ).not.toBeNull();
    expect(sessionStorage.getItem(`${POPOVER_POS_KEY}:c_bbbbbbb`)).toBeNull();
  });

  it('keeps its header buttons clickable', () => {
    const pop = makePop();
    pop.render(popModel());
    const down = fire(q('.bai-popover [data-pact="close"]'), 'pointerdown');

    expect(down.defaultPrevented).toBe(false);
  });

  it('goes back under the stop on a double-click of its header', () => {
    const pop = makePop();
    pop.render(popModel());
    const anchored = q('.bai-popover').style.top;
    dragTo(q('.bai-popover .head'), 200, 100);
    fire(q('.bai-popover .head'), 'dblclick');

    expect(q('.bai-popover').style.top).toBe(anchored);
    expect(q('.bai-popover').style.right).toBe('');
  });
});
