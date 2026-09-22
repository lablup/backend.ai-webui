/**
 * Guided mode's popover PLACEMENT (FR-3950): wherever the stop's element is —
 * or is not — the panel stays inside the window. A stop with long prose used
 * to be centred with no clamp at all and hung off both edges.
 */
import {
  createPopover,
  type PopoverModel,
  type PopoverPlace,
} from './popover.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

/** jsdom lays nothing out, so a shown panel measures 0 without this. */
const measurePanelAs = (height: number) => {
  const proto = HTMLElement.prototype;
  const own = Object.getOwnPropertyDescriptor(proto, 'offsetHeight');
  Object.defineProperty(proto, 'offsetHeight', {
    configurable: true,
    get(this: HTMLElement) {
      return this.classList.contains('bai-popover') ? height : 0;
    },
  });
  return () => {
    if (own) Object.defineProperty(proto, 'offsetHeight', own);
  };
};

const viewport = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    value: width,
    configurable: true,
  });
  Object.defineProperty(window, 'innerHeight', {
    value: height,
    configurable: true,
  });
};

const model = (
  place: PopoverPlace,
  over: Partial<PopoverModel> = {},
): PopoverModel => ({
  id: 'c_aaaaaaa',
  index: 0,
  total: 3,
  page: '/project/default/session',
  label: 'alert',
  type: 'added',
  kind: 'alert',
  changed: 'A red error banner now sits above the log view.',
  check: 'The banner names the failure the server returned.',
  old: '',
  next: '',
  code: [],
  comment: '',
  viewed: false,
  place,
  lang: 'en',
  langs: [],
  ...over,
});

let host: HTMLElement;
let root: ShadowRoot;
let undoMeasure: (() => void) | null = null;

const panel = () =>
  root.querySelector<HTMLElement>('.bai-popover') as HTMLElement;
const box = () => {
  const style = panel().style;
  const top = Number.parseFloat(style.top);
  return { top, left: style.left, transform: style.transform };
};

const picked: string[] = [];

const make = () =>
  createPopover(
    root,
    {
      onToggleViewed: () => {},
      onComment: () => {},
      onCopyRef: () => {},
      onLanguage: (lang) => picked.push(lang),
      onClose: () => {},
    },
    { pageChords: true },
  );

beforeEach(() => {
  picked.length = 0;
  document.body.innerHTML = '';
  viewport(1280, 900);
  host = document.createElement('div');
  document.body.append(host);
  root = host.attachShadow({ mode: 'open' });
});

afterEach(() => {
  undoMeasure?.();
  undoMeasure = null;
});

describe('popover placement', () => {
  it('keeps a tall waiting panel inside a short window', () => {
    undoMeasure = measurePanelAs(600);
    viewport(1280, 460);
    const pop = make();

    pop.render(model({ kind: 'waiting', via: 'Click “Logs”' }));

    // The cap (max(200, 460 - 130) = 330) is what a browser would hand back;
    // the top must leave room for it rather than centring the full 600.
    const { top, transform } = box();
    expect(transform).toBe('translateX(-50%)');
    expect(top).toBeGreaterThanOrEqual(0);
    expect(top + 330).toBeLessThanOrEqual(460);
  });

  it('centres a waiting panel that fits', () => {
    undoMeasure = measurePanelAs(400);
    const pop = make();

    pop.render(model({ kind: 'waiting', via: 'Click “Logs”' }));

    expect(box().top).toBe((900 - 400) / 2);
  });

  it('flips above the mark and stays off the top edge', () => {
    undoMeasure = measurePanelAs(400);
    const pop = make();

    pop.render(
      model({ kind: 'located', rect: { left: 300, top: 700, bottom: 740 } }),
    );

    // Below (754) would end at 1154, past the pill's reserve — so above, and
    // 700 - 400 - 14 = 286 clears the banner.
    expect(box().top).toBe(286);
  });

  it('never lets a flipped panel taller than the room go off the top', () => {
    undoMeasure = measurePanelAs(700);
    const pop = make();

    pop.render(
      model({ kind: 'located', rect: { left: 300, top: 400, bottom: 440 } }),
    );

    const { top } = box();
    expect(top).toBeGreaterThanOrEqual(0);
    // Capped at max(200, 900 - 130) = 770, so 700 stands; it ends above the pill.
    expect(top + 700).toBeLessThanOrEqual(900);
  });

  it('hangs under the mark when there is room', () => {
    undoMeasure = measurePanelAs(300);
    const pop = make();

    pop.render(
      model({ kind: 'located', rect: { left: 300, top: 100, bottom: 140 } }),
    );

    expect(box()).toMatchObject({ top: 154, left: '300px', transform: '' });
  });

  it('keeps the full panel width on screen at the right edge', () => {
    undoMeasure = measurePanelAs(300);
    const pop = make();

    pop.render(
      model({ kind: 'located', rect: { left: 1200, top: 100, bottom: 140 } }),
    );

    // 1280 - 720 - 12: the clamp uses the same width the CSS gives the panel.
    expect(box().left).toBe('548px');
  });

  it('clamps the left edge to the window', () => {
    undoMeasure = measurePanelAs(300);
    viewport(600, 900);
    const pop = make();

    pop.render(
      model({ kind: 'located', rect: { left: 580, top: 100, bottom: 140 } }),
    );

    // width = min(560, 552) = 552, so the furthest right edge is 600-552-12.
    expect(box().left).toBe('36px');
  });
});

/**
 * The KO/EN toggle (FR-4057). A stop minted with a translation offers it; one
 * minted without carries no toggle at all, which is every stop older than the
 * feature.
 */
describe('language toggle', () => {
  const bilingual = (over: Partial<PopoverModel> = {}) =>
    model(
      { kind: 'away', page: 'Data' },
      {
        lang: 'ko',
        langs: ['ko', 'en'],
        changed: '업로드 버튼이 카드 헤더로 옮겨졌습니다.',
        check: '목록 위에 버튼이 보여야 합니다.',
        ...over,
      },
    );

  it('offers every language the stop carries, marking the current one', () => {
    make().render(bilingual());
    const buttons = [
      ...panel().querySelectorAll<HTMLElement>('[data-pact="lang"]'),
    ];
    expect(buttons.map((b) => b.textContent)).toEqual(['ko', 'en']);
    expect(buttons.map((b) => b.getAttribute('aria-pressed'))).toEqual([
      'true',
      'false',
    ]);
  });

  it('draws no toggle for a stop minted in one language', () => {
    make().render(model({ kind: 'away', page: 'Data' }));
    expect(panel().querySelector('[data-pact="lang"]')).toBeNull();
  });

  it('reports the language the reader clicked', () => {
    make().render(bilingual());
    panel()
      .querySelector<HTMLElement>('[data-lang="en"]')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(picked).toEqual(['en']);
  });

  it('rewrites the same stop when only the language changed', () => {
    const pop = make();
    pop.render(bilingual());
    expect(panel().textContent).toContain('무엇이 바뀌었나');
    pop.render(
      bilingual({
        lang: 'en',
        changed: 'The upload button moved into the card header.',
        check: 'The button shows above the list.',
      }),
    );
    expect(panel().textContent).toContain('What changed');
    expect(panel().textContent).toContain('moved into the card header');
  });
});
