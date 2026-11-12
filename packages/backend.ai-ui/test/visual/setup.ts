import { afterEach, beforeAll, expect, vi } from 'vitest';
import { page } from 'vitest/browser';

// relay-test-utils reads `global`, which Storybook's iframe.html sets.
Object.assign(globalThis, { global: globalThis });

// Only Date is faked: timers keep running so components can settle.
vi.useFakeTimers({ now: new Date('2026-01-15T12:00:00Z'), toFake: ['Date'] });

beforeAll(() => {
  // The tester page pins body to the viewport, which cuts off tall stories.
  document.body.style.height = 'auto';
  document.body.style.minHeight = '100vh';

  const still = document.createElement('style');
  still.textContent = `*, *::before, *::after {
    transition: none !important;
    animation-duration: 0s !important;
    animation-delay: 0s !important;
    caret-color: transparent !important;
  }`;
  document.head.append(still);
});

// A story that never settles is captured at `maxMs` and fails; tag it `no-vrt`.
function domSettled(quietMs = 600, maxMs = 5000) {
  return new Promise<void>((resolve) => {
    let quiet: ReturnType<typeof setTimeout>;
    const done = () => {
      observer.disconnect();
      clearTimeout(quiet);
      clearTimeout(limit);
      resolve();
    };
    const observer = new MutationObserver(() => {
      clearTimeout(quiet);
      quiet = setTimeout(done, quietMs);
    });
    observer.observe(document.body, {
      attributes: true,
      characterData: true,
      childList: true,
      subtree: true,
    });
    quiet = setTimeout(done, quietMs);
    const limit = setTimeout(done, maxMs);
  });
}

const PAINTED_TAGS = new Set([
  'svg',
  'img',
  'canvas',
  'video',
  'input',
  'textarea',
  'select',
  'hr',
]);

function isVisibleColor(color: string) {
  if (color === 'transparent') return false;
  const alpha = /(?:\/|,[^,]*,[^,]*,)\s*([\d.]+)(%?)\s*\)$/.exec(color);
  return !alpha || parseFloat(alpha[1] ?? '1') > 0;
}

function drawsLine(lineStyle: string, width: string, color: string) {
  return (
    lineStyle !== 'none' &&
    lineStyle !== 'hidden' &&
    parseFloat(width) > 0 &&
    isVisibleColor(color)
  );
}

function paintsItself(element: Element, style: CSSStyleDeclaration) {
  if (PAINTED_TAGS.has(element.localName)) return true;
  if (
    isVisibleColor(style.backgroundColor) ||
    style.backgroundImage !== 'none'
  ) {
    return true;
  }
  if (style.boxShadow !== 'none') return true;
  if (drawsLine(style.outlineStyle, style.outlineWidth, style.outlineColor))
    return true;
  return ['top', 'right', 'bottom', 'left'].some((side) =>
    drawsLine(
      style.getPropertyValue(`border-${side}-style`),
      style.getPropertyValue(`border-${side}-width`),
      style.getPropertyValue(`border-${side}-color`),
    ),
  );
}

// Screen-reader-only text still measures full width and would stretch the area.
function isVisuallyHidden(element: Element) {
  const style = getComputedStyle(element);
  if (style.clip !== 'auto' && style.clip !== '') return true;
  if (style.overflow === 'visible') return false;
  const rect = element.getBoundingClientRect();
  return rect.width <= 1 || rect.height <= 1;
}

const MARGIN = 8;

function paintedBounds() {
  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;
  const { scrollX, scrollY } = window;
  const add = (rect: DOMRect) => {
    if (rect.width === 0 || rect.height === 0) return;
    left = Math.min(left, rect.left + scrollX);
    top = Math.min(top, rect.top + scrollY);
    right = Math.max(right, rect.right + scrollX);
    bottom = Math.max(bottom, rect.bottom + scrollY);
  };

  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        if (node instanceof Element) {
          if (node.closest('.sb-wrapper, script, style'))
            return NodeFilter.FILTER_REJECT;
          if (node.parentElement?.closest('svg'))
            return NodeFilter.FILTER_REJECT;
          if (isVisuallyHidden(node)) return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    },
  );
  const range = document.createRange();
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node instanceof Text) {
      if (!node.data.trim()) continue;
      range.selectNodeContents(node);
      add(range.getBoundingClientRect());
    } else if (node instanceof Element) {
      const style = getComputedStyle(node);
      if (style.visibility === 'hidden' || style.opacity === '0') continue;
      if (paintsItself(node, style)) add(node.getBoundingClientRect());
    }
  }

  const root = document.documentElement;
  if (left === Infinity) return { left: 0, top: 0, width: 1, height: 1 };
  left = Math.max(0, Math.floor(left - MARGIN));
  top = Math.max(0, Math.floor(top - MARGIN));
  right = Math.min(root.scrollWidth, Math.ceil(right + MARGIN));
  bottom = Math.min(root.scrollHeight, Math.ceil(bottom + MARGIN));
  return { left, top, width: right - left, height: bottom - top };
}

afterEach(async (context) => {
  if (context.task.result?.state === 'fail') return;
  await domSettled();
  await document.fonts.ready;

  // An element screenshot is the page inside its box, so an invisible box over
  // the painted area captures exactly that area.
  const { left, top, width, height } = paintedBounds();
  const frame = document.createElement('div');
  frame.setAttribute('aria-hidden', 'true');
  Object.assign(frame.style, {
    position: 'absolute',
    left: `${left}px`,
    top: `${top}px`,
    width: `${width}px`,
    height: `${height}px`,
    pointerEvents: 'none',
  });
  document.body.append(frame);
  try {
    await expect(page.elementLocator(frame)).toMatchScreenshot();
  } finally {
    frame.remove();
  }
});
