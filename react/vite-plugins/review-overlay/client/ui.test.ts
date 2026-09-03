/**
 * The composer used to be placed with a hardcoded 180px height guess, so a
 * pick near the bottom of the viewport pushed its Cancel / Copy row off-screen
 * — the label and the ⚛️ stack are appended AFTER the box opens.
 */
import { createOverlayUI, type OverlayUI } from './ui.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

let ui: OverlayUI;

const compose = () => ui.root.querySelector('.compose') as HTMLElement;

/** jsdom has no layout: the box reads the target's rect and its own height. */
const mountSized = (box: Partial<DOMRect>, height: number) => {
  document.body.insertAdjacentHTML(
    'beforeend',
    '<button id="target">Create</button>',
  );
  const element = document.getElementById('target') as HTMLElement;
  element.getBoundingClientRect = () =>
    ({ left: 20, right: 420, width: 400, height: 0, ...box }) as DOMRect;
  setHeight(height);
  return element;
};

const setHeight = (height: number) =>
  Object.defineProperty(compose(), 'offsetHeight', {
    value: height,
    configurable: true,
  });

beforeEach(() => {
  document.body.innerHTML = '';
  Object.defineProperty(window, 'innerHeight', {
    value: 800,
    configurable: true,
  });
  Object.defineProperty(window, 'innerWidth', {
    value: 1024,
    configurable: true,
  });
  ui = createOverlayUI({
    onBuildBlock: () => null,
    onComposeClosed: () => undefined,
    onEscape: () => undefined,
  });
});

afterEach(() => {
  ui.host.remove();
});

describe('the dock is gone', () => {
  it('renders no dock, toggle button or always-show checkbox', () => {
    expect(ui.root.querySelector('.dock')).toBeNull();
    expect(ui.root.querySelector('.toggle')).toBeNull();
    expect(ui.root.querySelector('.alwayschk')).toBeNull();
    expect(ui.root.querySelector('input[type="checkbox"]')).toBeNull();
  });

  it('renders none of them in pick mode or with the composer open', () => {
    ui.setPickActive(true);
    const target = mountSized({ top: 100, bottom: 300 }, 160);
    ui.openCompose(target, 40, 306);
    expect(ui.root.querySelector('.dock')).toBeNull();
    expect(ui.root.querySelector('button.toggle')).toBeNull();
  });
});

describe('placing the composer', () => {
  it('hangs it under an element that leaves room', () => {
    const target = mountSized({ top: 100, bottom: 300 }, 160);
    ui.openCompose(target, 40, 306);
    expect(compose().style.top).toBe('310px');
    expect(compose().style.left).toBe('40px');
  });

  it('flips it above an element too near the bottom', () => {
    const target = mountSized({ top: 700, bottom: 780 }, 220);
    ui.openCompose(target, 40, 786);
    // 780 + 10 + 220 = 1010 > 800 - 8, so it goes above: 700 - 10 - 220.
    expect(compose().style.top).toBe('470px');
  });

  it('clamps to the bottom edge for an element below the fold', () => {
    const target = mountSized({ top: 900, bottom: 1000 }, 260);
    ui.openCompose(target, 40, 1006);
    // Above would be 630, which still hangs off the bottom: 800 - 260 - 8.
    expect(compose().style.top).toBe('532px');
  });

  it('pins it to the top when it is taller than the viewport', () => {
    const target = mountSized({ top: 600, bottom: 700 }, 900);
    ui.openCompose(target, 40, 706);
    expect(compose().style.top).toBe('8px');
  });

  it('clamps horizontally against the right edge', () => {
    const target = mountSized({ top: 100, bottom: 300 }, 160);
    ui.openCompose(target, 1000, 306);
    expect(compose().style.left).toBe('712px');
  });

  // The path label and the ⚛️ stack land after react-grab's fiber walk
  // resolves, which is exactly what the 180px guess could not see.
  it('re-places itself when the label grows the box', () => {
    const target = mountSized({ top: 520, bottom: 600 }, 160);
    ui.openCompose(target, 40, 606);
    expect(compose().style.top).toBe('610px');

    setHeight(200);
    ui.setComposeLabel('Start › page-start › button "Create"');
    expect(compose().style.top).toBe('310px');

    setHeight(300);
    ui.appendComposeLabel('\n⚛️ in Button\n  in Card\n  in Page');
    expect(compose().style.top).toBe('210px');
  });

  it('does nothing once the composer is closed', () => {
    const target = mountSized({ top: 100, bottom: 300 }, 160);
    ui.openCompose(target, 40, 306);
    ui.closeCompose();
    setHeight(600);
    ui.placeCompose();
    expect(compose().style.top).toBe('310px');
  });
});
