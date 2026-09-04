/**
 * The set dock (FR-3858): the list that reaches every pin of the draft set,
 * whatever the layer managed to draw, plus the two set-wide actions.
 */
import { createSetDock, type SetDock } from './dock.js';
import type { SetPin } from './types.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

let dock: SetDock;
let root: ShadowRoot;
let copied: number;
let cleared: number;
let located: string[];

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
const shown = () => node('.setdock').classList.contains('shown');

beforeEach(() => {
  document.body.innerHTML = '';
  copied = 0;
  cleared = 0;
  located = [];
  const host = document.createElement('div');
  document.body.append(host);
  root = host.attachShadow({ mode: 'open' });
  dock = createSetDock({
    root,
    onCopyAll: () => copied++,
    onClear: () => cleared++,
    onLocate: (id) => located.push(id),
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
    expect(node('.title').textContent).toBe('📍 2 pins');
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

    expect(node('.title').textContent).toBe('📍 1 pin');
  });

  it('hands back the id of the row whose 📍 was pressed', () => {
    dock.render([pin('c_a', 'a'), pin('c_b', 'b')]);

    rows()[1].querySelector<HTMLButtonElement>('.locate')?.click();

    expect(located).toEqual(['c_b']);
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
      expect(node('.clear').textContent).toBe('🗑 Clear all (3)');

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

    // A pin added or dismissed while the question is up changes the answer.
    it('takes the question back when the set changes under it', () => {
      node<HTMLButtonElement>('.clear').click();

      dock.render([pin('c_a', 'a')]);

      expect(node('.setdock').classList.contains('confirming')).toBe(false);
      expect(node('.clear').textContent).toBe('🗑 Clear all (1)');
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
