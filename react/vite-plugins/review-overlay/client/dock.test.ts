/**
 * The set dock (FR-3858): the list that reaches every pin of the draft set,
 * whatever the layer managed to draw, plus the two set-wide actions.
 */
import {
  CARDS_CHORD,
  createSetDock,
  DOCK_POS_KEY,
  type SetDock,
} from './dock.js';
import { ICON_NODES } from './icons.js';
import type { SetPin } from './types.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

let dock: SetDock;
let root: ShadowRoot;
let copied: number;
let cleared: number;
let toggled: number;
let located: string[];
let removed: string[];
let unhidden: string[];
let went: string[];

const pin = (id: string, label: string): SetPin => ({
  id,
  origin: 'pick',
  anchor: { v: 3, s: `[data-testid="${id}"]`, p: '/session/start' },
  anchorB64: `PAYLOAD_${id}`,
  label,
  appHash: '',
  stack: [],
  at: '2026-08-31T09:00:00Z',
  pr: 9330,
});

const node = <T extends HTMLElement>(selector: string) =>
  root.querySelector<T>(selector) as T;
const rows = () => Array.from(root.querySelectorAll<HTMLElement>('.row'));
const labelNode = () => node<HTMLElement>('.row .rowlabel');
const label = () => labelNode().textContent;
const shown = () => node('.setdock').classList.contains('shown');

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

/**
 * jsdom lays nothing out, so every `offsetHeight` is 0 — including the one a
 * real browser reports for a shown dock. A folded one is `display: none` and
 * really does measure 0. Returns its own undo.
 */
const measureShownDockAs = (height: number) => {
  const proto = HTMLElement.prototype;
  const own = Object.getOwnPropertyDescriptor(proto, 'offsetHeight');
  Object.defineProperty(proto, 'offsetHeight', {
    configurable: true,
    get(this: HTMLElement) {
      const list = this.classList;
      return list.contains('shown') && !list.contains('folded') ? height : 0;
    },
  });
  return () => {
    if (own) Object.defineProperty(proto, 'offsetHeight', own);
  };
};

beforeEach(() => {
  document.body.innerHTML = '';
  sessionStorage.clear();
  viewport(1024, 768);
  copied = 0;
  cleared = 0;
  toggled = 0;
  located = [];
  removed = [];
  unhidden = [];
  went = [];
  const host = document.createElement('div');
  document.body.append(host);
  root = host.attachShadow({ mode: 'open' });
  dock = createSetDock({
    root,
    onCopyAll: () => copied++,
    onClear: () => cleared++,
    onLocate: (id) => located.push(id),
    onRemove: (id) => removed.push(id),
    onUnhide: (id) => unhidden.push(id),
    onToggleCards: () => toggled++,
    onGo: (id) => went.push(id),
  });
});

afterEach(() => {
  dock.dispose();
});

describe('createSetDock', () => {
  it('stays out of the way while there is no set', () => {
    dock.render([]);

    expect(shown()).toBe(false);
    expect(rows()).toHaveLength(0);
  });

  it('lists the set in order, numbered, with each pin its own label', () => {
    dock.render([pin('c_a', 'Sessions › start'), pin('c_b', 'Sessions › end')]);

    expect(shown()).toBe(true);
    expect(node('.title').textContent).toBe('2 pins');
    expect(rows().map((row) => row.dataset.pinId)).toEqual(['c_a', 'c_b']);
    expect(rows().map((row) => row.querySelector('.idx')?.textContent)).toEqual(
      ['1', '2'],
    );
    expect(rows()[1].querySelector('.rowlabel')?.textContent).toBe(
      'Sessions › end',
    );
  });

  it('counts one pin as a pin', () => {
    dock.render([pin('c_a', 'Sessions › start')]);

    expect(node('.title').textContent).toBe('1 pin');
  });

  // The row IS the control: one click goes to the pin it names.
  it('hands back the id of the row that was clicked', () => {
    dock.render([pin('c_a', 'a'), pin('c_b', 'b')]);

    rows()[1].querySelector<HTMLButtonElement>('.rowlabel')?.click();

    expect(located).toEqual(['c_b']);
  });

  it('hands back the id of the row whose 🗑 was pressed', () => {
    dock.render([pin('c_a', 'a'), pin('c_b', 'b')]);

    rows()[0].querySelector<HTMLButtonElement>('.remove')?.click();

    expect(removed).toEqual(['c_a']);
    expect(located).toEqual([]);
  });

  /**
   * R6.1: the reviewer wrote a sentence about the element; that sentence is
   * what tells one row from another, not the route › landmark › tag path.
   */
  describe('what a row is called', () => {
    const noted = (note?: string, n?: string): SetPin => ({
      ...pin('c_a', 'Sessions › list › button "Start"'),
      note,
      anchor: { ...pin('c_a', 'x').anchor, n },
    });

    it('leads with the reviewer’s note', () => {
      dock.render([noted('The label is cut off.')]);

      expect(label()).toBe('The label is cut off.');
      expect(labelNode().title).toBe('The label is cut off.');
    });

    // The row is one line high; the whole note is in the tooltip and the block.
    it('collapses a multi-line note to one line, whole in the title', () => {
      dock.render([noted('First line\n\n  second line')]);

      expect(label()).toBe('First line second line');
      expect(labelNode().title).toBe('First line\n\n  second line');
    });

    // A link's pin has only the capped note the anchor carries.
    it('falls back to the note the link carried', () => {
      dock.render([noted(undefined, 'From the link…')]);

      expect(label()).toBe('From the link…');
    });

    it('keeps the landmark label when there is no note', () => {
      dock.render([noted()]);

      expect(label()).toBe('Sessions › list › button "Start"');
    });

    it('counts a whitespace-only note as none', () => {
      dock.render([noted('   \n  ')]);

      expect(label()).toBe('Sessions › list › button "Start"');
    });
  });

  /**
   * R7.3: the page matches but the element is not in the DOM right now — a
   * closed modal, a collapsed section. That is not "not on this page", and the
   * row is the only thing that can say so.
   */
  describe('a pin waiting for its element', () => {
    const waiting = (over: Partial<SetPin> = {}) =>
      dock.render(
        [{ ...pin('c_a', 'Data › rw-permission › span'), ...over } as SetPin],
        new Map([['c_a', { kind: 'waiting' }]]),
      );

    it('dims the row and says where the element was', () => {
      waiting({ anchor: { v: 3, s: '#x', p: '/', tid: 'rw-permission' } });

      expect(rows()[0].classList.contains('waiting')).toBe(true);
      expect(rows()[0].querySelector('.where')?.textContent).toBe(
        'waiting — rw-permission',
      );
      expect(rows()[0].querySelector<HTMLElement>('.where')?.title).toBe(
        'Data › rw-permission › span',
      );
    });

    it('names the dialog frame of the ⚛️ stack when there is no landmark', () => {
      waiting({
        anchor: { v: 3, s: '#x', p: '/', c: { name: 'RadioList' } },
        stack: [
          '  in RadioListItem (at /src/a.tsx:1:1)',
          '  in FolderCreateModalV2 (at /src/b.tsx:2:2)',
        ],
      });

      expect(rows()[0].querySelector('.where')?.textContent).toBe(
        'waiting — FolderCreateModalV2',
      );
    });

    // Every frame carries its source path, so a component that merely LIVES
    // in a `*Modal.tsx` is not the thing the pin was inside.
    it('reads the frame name, not the file path it was declared in', () => {
      waiting({
        stack: [
          '  in RadioListItem (at /src/components/VFolderCreateModal.tsx:31:7)',
          '  in FolderDrawer (at /src/components/panels.tsx:8:3)',
        ],
      });

      expect(rows()[0].querySelector('.where')?.textContent).toBe(
        'waiting — FolderDrawer',
      );
    });

    // react-grab emits frames that name only a file; the row must not read
    // `waiting — in /src/components/FolderCreateModalV2.tsx`.
    it('names a file-only frame by its basename', () => {
      waiting({
        stack: [
          '  in RadioListItem (@astryxdesign/core)',
          '  in /src/components/FolderCreateModalV2.tsx',
        ],
      });

      expect(rows()[0].querySelector('.where')?.textContent).toBe(
        'waiting — FolderCreateModalV2',
      );
    });

    it('falls back to the component, then to the element itself', () => {
      waiting({ anchor: { v: 3, s: '#x', p: '/', c: { name: 'RadioList' } } });
      expect(rows()[0].querySelector('.where')?.textContent).toBe(
        'waiting — RadioList',
      );

      waiting({
        anchor: { v: 3, s: '#x', p: '/', tag: 'button', txt: 'Save' },
      });
      expect(rows()[0].querySelector('.where')?.textContent).toBe(
        'waiting — button "Save"',
      );
    });

    // It is still in the set, and it is still the reviewer's to drop.
    it('keeps the row a control', () => {
      waiting();

      rows()[0].querySelector<HTMLButtonElement>('.rowlabel')?.click();
      rows()[0].querySelector<HTMLButtonElement>('.remove')?.click();

      expect(located).toEqual(['c_a']);
      expect(removed).toEqual(['c_a']);
    });
  });

  // ✕ on a card is not ✕ on the pin: the row is what still reaches it.
  describe('a pin whose card is hidden', () => {
    const withHidden = () =>
      dock.render([
        pin('c_a', 'a'),
        { ...pin('c_b', 'b'), hidden: true } as SetPin,
      ]);

    it('dims the row and offers to show the card again', () => {
      withHidden();

      expect(rows()[0].classList.contains('off')).toBe(false);
      expect(rows()[1].classList.contains('off')).toBe(true);
      expect(rows()[1].querySelector('.unhide')).not.toBeNull();
      expect(rows()[0].querySelector('.unhide')).toBeNull();
      // The header's own icon says "hidden"; the row's button is what reveals.
      expect(
        rows()[1].querySelector('.unhide')?.getAttribute('aria-label'),
      ).toBe('Show this pin’s card again');
    });

    it('shows it again from the row’s own button', () => {
      withHidden();

      rows()[1].querySelector<HTMLButtonElement>('.unhide')?.click();

      expect(unhidden).toEqual(['c_b']);
    });

    // Asking to go to a pin means wanting to see it.
    it('brings the card back when the row itself is clicked', () => {
      withHidden();

      rows()[1].querySelector<HTMLButtonElement>('.rowlabel')?.click();

      expect(unhidden).toEqual(['c_b']);
      expect(located).toEqual(['c_b']);
    });
  });

  describe('the cards switch', () => {
    it('asks the owner to flip it, and shows the chord that does too', () => {
      dock.render([pin('c_a', 'a')]);

      expect(node('.cards').textContent).toBe('Cards');
      expect(node('.chord').textContent).toBe(CARDS_CHORD);
      expect(node('.cards').getAttribute('aria-label')).toContain(CARDS_CHORD);

      node<HTMLButtonElement>('.cards').click();

      expect(toggled).toBe(1);
    });

    // A name that changes with the action carries the state already, and
    // `aria-pressed` on top of it announces the opposite of what it does:
    // "Show every card, pressed" is what a screen reader said with the cards
    // hidden. The name is the whole story, so nothing states it twice.
    it('leaves the state to the name it just changed', () => {
      dock.render([pin('c_a', 'a')], new Map(), true);

      expect(node('.cards').textContent).toBe('Cards');
      expect(node('.cards').getAttribute('aria-label')).toBe(
        `Show every card (${CARDS_CHORD})`,
      );
      expect(node('.cards').hasAttribute('aria-pressed')).toBe(false);

      dock.render([pin('c_a', 'a')], new Map(), false);

      expect(node('.cards').getAttribute('aria-label')).toBe(
        `Hide every card (${CARDS_CHORD})`,
      );
      expect(node('.cards').hasAttribute('aria-pressed')).toBe(false);
    });

    // R8.1: the glyph and the name are what pressing it DOES.
    it('names and draws the action, not the state', () => {
      dock.render([pin('c_a', 'a')]);

      const hide = node('.cards').getAttribute('aria-label');
      expect(hide).toContain('Hide');
      expect(node('.cards').title).toBe(hide);
      expect(node('.cards svg path')?.getAttribute('d')).toBe(
        ICON_NODES['eye-off'][0][1].d,
      );

      dock.render([pin('c_a', 'a')], new Map(), true);

      const show = node('.cards').getAttribute('aria-label');
      expect(show).toContain('Show');
      expect(node('.cards').title).toBe(show);
      expect(node('.cards svg path')?.getAttribute('d')).toBe(
        ICON_NODES.eye[0][1].d,
      );
    });

    // R8.2: with the switch thrown, a row that offered nothing was a dead end.
    it('offers every row a reveal while it is hiding the cards', () => {
      dock.render([pin('c_a', 'a'), pin('c_b', 'b')], new Map(), true);

      expect(rows().every((row) => row.querySelector('.unhide'))).toBe(true);
      // The header already says the switch is thrown; dimming is for a card
      // hidden on its own.
      expect(rows().some((row) => row.classList.contains('off'))).toBe(false);

      rows()[1].querySelector<HTMLButtonElement>('.unhide')?.click();

      expect(unhidden).toEqual(['c_b']);
    });

    // A 260px header wraps; a hint stranded on the title's line reads as part
    // of it, so it travels with the button it names.
    it('puts the chord after the button it names', () => {
      dock.render([pin('c_a', 'a')]);

      const head = Array.from(node('.head').children).map(
        (child) => child.className,
      );
      expect(head.indexOf('chord')).toBe(head.indexOf('act cards') + 1);
    });
  });

  // The copy runs inside this click — `execCommand` is the only clipboard on
  // the gateway origin, and it needs the activation still to be live.
  it('asks for the whole set on one click, with nothing awaited', () => {
    dock.render([pin('c_a', 'a')]);

    node<HTMLButtonElement>('.copyall').click();

    expect(copied).toBe(1);
  });

  describe('clearing the set', () => {
    beforeEach(() => {
      dock.render([pin('c_a', 'a'), pin('c_b', 'b'), pin('c_c', 'c')]);
    });

    // Clear is the one action with no undo, so one click only asks.
    it('asks before it clears, naming how many it would take', () => {
      expect(node('.clear').textContent).toBe('Clear all (3)');

      node<HTMLButtonElement>('.clear').click();

      expect(cleared).toBe(0);
      expect(node('.setdock').classList.contains('confirming')).toBe(true);
      expect(node('.confirm').textContent).toContain('Clear all 3?');
    });

    it('clears once the ✓ confirms it', () => {
      node<HTMLButtonElement>('.clear').click();

      node<HTMLButtonElement>('.yes').click();

      expect(cleared).toBe(1);
      expect(node('.setdock').classList.contains('confirming')).toBe(false);
    });

    it('keeps the set when the ✕ takes the question back', () => {
      node<HTMLButtonElement>('.clear').click();

      node<HTMLButtonElement>('.no').click();

      expect(cleared).toBe(0);
      expect(node('.setdock').classList.contains('confirming')).toBe(false);
    });

    // The rows re-render whenever a pin lands or loses its element; the ✓/✕
    // must not vanish from under the cursor because the app re-rendered.
    it('keeps the question through a re-render of the same set', () => {
      node<HTMLButtonElement>('.clear').click();

      dock.render(
        [pin('c_a', 'a'), pin('c_b', 'b'), pin('c_c', 'c')],
        new Map([['c_b', { kind: 'waiting' }]]),
      );

      expect(node('.setdock').classList.contains('confirming')).toBe(true);
    });

    // A pin added or dismissed while the question is up changes the answer.
    it('takes the question back when the set changes under it', () => {
      node<HTMLButtonElement>('.clear').click();

      dock.render([pin('c_a', 'a')]);

      expect(node('.setdock').classList.contains('confirming')).toBe(false);
      expect(node('.clear').textContent).toBe('Clear all (1)');
    });
  });

  // R5.2. The dock's row of emoji drew at whatever size each OS font chose,
  // so the buttons were different heights.
  describe('the chrome', () => {
    const EMOJI = /\p{Extended_Pictographic}/u;

    it('is lucide svgs, with no emoji left in it', () => {
      dock.render([
        { ...pin('c_a', 'Sessions › start'), hidden: true },
        pin('c_b', 'Sessions › end'),
      ]);

      const buttons = Array.from(
        node('.setdock').querySelectorAll('button.act'),
      );
      expect(buttons.length).toBeGreaterThan(0);
      for (const button of buttons) {
        expect(button.querySelector('svg')).not.toBeNull();
        expect(button.getAttribute('aria-label')).toBeTruthy();
      }
      // The chord (⌘⇧H) is a key name, not an icon, so it stays.
      expect(node('.setdock').textContent).not.toMatch(EMOJI);
    });
  });

  // R5.1. A dock nailed to the bottom-right corner sits on whatever the
  // reviewer wants to look at there.
  describe('dragging the dock', () => {
    const grip = () => node('.grip');
    const point = (type: string, x: number, y: number) =>
      grip().dispatchEvent(
        new MouseEvent(type, {
          clientX: x,
          clientY: y,
          bubbles: true,
          cancelable: true,
        }),
      );
    /** Grab at the dock's own origin, so the cursor IS the new top-left. */
    const dragTo = (x: number, y: number) => {
      point('pointerdown', 0, 0);
      point('pointermove', x, y);
      point('pointerup', x, y);
    };

    it('moves the dock and drops the default corner', () => {
      dock.render([pin('c_a', 'a')]);

      dragTo(300, 200);

      expect(node('.setdock').style.left).toBe('300px');
      expect(node('.setdock').style.top).toBe('200px');
      expect(node('.setdock').style.right).toBe('auto');
      expect(node('.setdock').style.bottom).toBe('auto');
    });

    // A pick starts on a mousedown the page can see, and a drag across the
    // header would otherwise select the labels it passes over.
    it('takes the gesture, so it is neither a selection nor a pick', () => {
      const down = new MouseEvent('pointerdown', {
        clientX: 0,
        clientY: 0,
        bubbles: true,
        cancelable: true,
      });
      grip().dispatchEvent(down);

      expect(down.defaultPrevented).toBe(true);
    });

    // Pointer capture keeps every move on the grip; no row ever sees one.
    it('runs no row action while the dock is being dragged', () => {
      dock.render([pin('c_a', 'a'), pin('c_b', 'b')]);

      dragTo(300, 200);

      expect(located).toEqual([]);
      expect(removed).toEqual([]);
      expect(unhidden).toEqual([]);
    });

    it('keeps the position for the tab', () => {
      dock.render([pin('c_a', 'a')]);

      dragTo(300, 200);

      expect(sessionStorage.getItem(DOCK_POS_KEY)).toBe(
        JSON.stringify({ left: 300, top: 200 }),
      );
    });

    // The dock is 260px wide; 1024 - 260 - 8 is the rightmost `left` that
    // still leaves it a margin.
    it('clamps a drag past the edge back into the viewport', () => {
      dock.render([pin('c_a', 'a')]);

      dragTo(4000, 4000);

      expect(node('.setdock').style.left).toBe('756px');
      // 768 - 160 stand-in height - 8: jsdom measures every box as 0.
      expect(node('.setdock').style.top).toBe('600px');
    });

    it('restores a stored position, clamped into a smaller window', () => {
      dock.dispose();
      sessionStorage.setItem(
        DOCK_POS_KEY,
        JSON.stringify({ left: 900, top: 700 }),
      );
      viewport(600, 400);
      dock = createSetDock({
        root,
        onCopyAll: () => copied++,
        onClear: () => cleared++,
        onLocate: (id) => located.push(id),
        onRemove: (id) => removed.push(id),
        onUnhide: (id) => unhidden.push(id),
        onToggleCards: () => toggled++,
      });

      expect(node('.setdock').style.left).toBe('332px');
      expect(node('.setdock').style.top).toBe('232px');
    });

    // Restore runs before the first `render`, while the dock is still
    // `display: none` and measures 0 — clamping against that parks a dock
    // stored low in a tall window below the fold of a short one, where its
    // rows, its actions and the set they reach cannot be got at.
    it('re-clamps against its real height once it is shown', () => {
      const measured = measureShownDockAs(300);
      try {
        dock.dispose();
        sessionStorage.setItem(
          DOCK_POS_KEY,
          JSON.stringify({ left: 900, top: 740 }),
        );
        viewport(1280, 480);
        dock = createSetDock({
          root,
          onCopyAll: () => copied++,
          onClear: () => cleared++,
          onLocate: (id) => located.push(id),
          onRemove: (id) => removed.push(id),
          onUnhide: (id) => unhidden.push(id),
          onToggleCards: () => toggled++,
        });
        dock.render([pin('c_a', 'a')]);

        // 480 - 300 - 8: the whole dock, not the eight pixels of its top
        // border that the stand-in height alone would have left on screen.
        expect(node('.setdock').style.top).toBe('172px');
      } finally {
        measured();
      }
    });

    // Committing a pin re-renders the dock while the composer still has it
    // folded, where it is `display: none` and measures the stand-in box. The
    // clamp that follows would let a 300px dock sit at 312px of a 480px window.
    it('waits for the unfold to clamp a dock the composer folded', () => {
      const measured = measureShownDockAs(300);
      try {
        dock.render([pin('c_a', 'a')]);
        dragTo(400, 400);
        expect(node('.setdock').style.top).toBe('400px');

        dock.setCollapsed(true);
        viewport(1280, 480);
        dock.render([pin('c_a', 'a'), pin('c_b', 'b')]);

        // 480 - 160 stand-in - 8 is what a measurement of the folded dock buys.
        expect(node('.setdock').style.top).not.toBe('312px');

        dock.setCollapsed(false);

        // 480 - 300 - 8: the whole dock, clamped against the box it really has.
        expect(node('.setdock').style.top).toBe('172px');
      } finally {
        measured();
      }
    });

    it('pulls a parked dock back in when the window shrinks', () => {
      dock.render([pin('c_a', 'a')]);
      dragTo(700, 500);

      viewport(400, 300);
      window.dispatchEvent(new Event('resize'));

      expect(node('.setdock').style.left).toBe('132px');
      expect(node('.setdock').style.top).toBe('132px');
    });

    // Shrinking used to overwrite the dragged position with the clamped one,
    // so the reviewer's spot was gone the moment the window came back.
    it('puts the dock back where it was dragged when the window grows again', () => {
      dock.render([pin('c_a', 'a')]);
      dragTo(700, 500);

      viewport(400, 300);
      window.dispatchEvent(new Event('resize'));
      viewport(1024, 768);
      window.dispatchEvent(new Event('resize'));

      expect(node('.setdock').style.left).toBe('700px');
      expect(node('.setdock').style.top).toBe('500px');
    });

    it('leaves the default corner alone until something moves it', () => {
      dock.render([pin('c_a', 'a')]);

      viewport(400, 300);
      window.dispatchEvent(new Event('resize'));

      expect(node('.setdock').style.left).toBe('');
      expect(node('.setdock').style.top).toBe('');
    });
  });

  // A set spans pages, and an off-page pin has no card — the row is the only
  // thing it has on screen.
  describe('a pin on another page', () => {
    const spread = () => {
      dock.render(
        [pin('c_a', 'Sessions › start'), pin('c_b', 'Start › create')],
        new Map([
          [
            'c_b',
            {
              kind: 'elsewhere',
              where: 'Start',
              href: 'http://dev.test/start#bai=v3.c_b.PAYLOAD',
            },
          ],
        ]),
      );
    };

    it('says what differs and offers to go there instead of scrolling', () => {
      spread();

      const away = rows()[1];
      expect(away.classList.contains('away')).toBe(true);
      expect(away.querySelector('.where')?.textContent).toBe('Start');
      expect(away.querySelector('.go')).not.toBeNull();
    });

    it('leaves the rows on this page scrolling to their own pin', () => {
      spread();

      expect(rows()[0].classList.contains('away')).toBe(false);
      expect(rows()[0].querySelector('.go')).toBeNull();

      rows()[0].querySelector<HTMLButtonElement>('.rowlabel')?.click();

      expect(located).toEqual(['c_a']);
      expect(went).toEqual([]);
    });

    /**
     * R7.1: the platform already has "here" and "in a new tab"; we take only
     * the plain click and leave every other one to the browser.
     */
    it('is a real link, so the browser owns the other intents', () => {
      spread();

      const link = rows()[1].querySelector<HTMLAnchorElement>('a.rowlabel');
      expect(link?.getAttribute('href')).toBe(
        'http://dev.test/start#bai=v3.c_b.PAYLOAD',
      );
      expect(rows()[1].querySelector<HTMLAnchorElement>('a.go')?.href).toBe(
        link?.href,
      );
      // A row on this page stays a button: it scrolls, it does not navigate.
      expect(rows()[0].querySelector('a.rowlabel')).toBeNull();
    });

    it('leaves a modifier or middle click to the browser', () => {
      spread();
      const link = rows()[1].querySelector<HTMLAnchorElement>(
        'a.rowlabel',
      ) as HTMLAnchorElement;

      for (const init of [
        { metaKey: true },
        { ctrlKey: true },
        { shiftKey: true },
        { altKey: true },
        { button: 1 },
      ]) {
        const evt = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          ...init,
        });
        link.dispatchEvent(evt);
        expect(evt.defaultPrevented).toBe(false);
      }
      expect(went).toEqual([]);
    });

    it('hands back the id of the row whose go was pressed', () => {
      spread();

      rows()[1].querySelector<HTMLButtonElement>('.go')?.click();

      expect(went).toEqual(['c_b']);
      expect(located).toEqual([]);
    });

    // Scrolling to a pin that is not on this page is not a thing to do.
    it('goes there when the off-page row itself is clicked', () => {
      spread();

      rows()[1].querySelector<HTMLButtonElement>('.rowlabel')?.click();

      expect(went).toEqual(['c_b']);
      expect(located).toEqual([]);
    });
  });

  // Labels come off links a stranger may have written.
  it('writes a label as text, never as markup', () => {
    dock.render([pin('c_a', '<img src=x onerror=alert(1)>')]);

    expect(rows()[0].querySelector('img')).toBeNull();
    expect(rows()[0].querySelector('.rowlabel')?.textContent).toBe(
      '<img src=x onerror=alert(1)>',
    );
  });
});
