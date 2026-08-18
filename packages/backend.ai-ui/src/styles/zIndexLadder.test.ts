/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Static assertions over the ladder: the ordering invariant, and the two
 mirrors (`zIndexLadder.css`, `index.html`) that cannot import it.
*/
import {
  BAI_Z_INDEX,
  BAI_Z_INDEX_MODAL_LEVEL_STEP,
  BAI_Z_INDEX_ORDER,
} from './zIndexLadder';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const read = (relative: string) =>
  readFileSync(fileURLToPath(new URL(relative, import.meta.url)), 'utf8');

/** `appHeader` -> `--bai-z-app-header`. */
const cssName = (key: string) =>
  `--bai-z-${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;

function declaredCustomProperties(css: string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [, name, value] of css.matchAll(
    /(--bai-z-[a-z-]+)\s*:\s*(\d+)\s*;/g,
  )) {
    out[name] = Number(value);
  }
  return out;
}

describe('the z-index ladder', () => {
  it('is strictly increasing in declared order', () => {
    const values = BAI_Z_INDEX_ORDER.map((key) => BAI_Z_INDEX[key]);
    expect(values).toStrictEqual([...values].sort((a, b) => a - b));
    expect(new Set(values).size).toBe(values.length);
  });

  it('lists every layer exactly once', () => {
    expect([...BAI_Z_INDEX_ORDER].sort()).toStrictEqual(
      Object.keys(BAI_Z_INDEX).sort(),
    );
  });

  // The bug T10 exists to prevent: login-screen modals are `document.body`
  // portals, so nothing can lift them over a splash that outranks the band.
  it('puts the modal band above the splash and the login hosts', () => {
    expect(BAI_Z_INDEX.modalBase).toBeGreaterThan(BAI_Z_INDEX.splash);
    expect(BAI_Z_INDEX.modalBase).toBeGreaterThan(BAI_Z_INDEX.loginHost);
    expect(BAI_Z_INDEX.modalBase).toBeGreaterThan(BAI_Z_INDEX.loginSideHelp);
  });

  // `BAIDialogPortal` caps nesting at MAX_DIALOG_LEVEL; even the ceiling must
  // stay under the notice stack.
  it('keeps the whole modal band under the notification stack', () => {
    const MAX_DIALOG_LEVEL = 80;
    expect(
      BAI_Z_INDEX.modalBase + MAX_DIALOG_LEVEL * BAI_Z_INDEX_MODAL_LEVEL_STEP,
    ).toBeLessThan(BAI_Z_INDEX.notification);
  });

  it('matches the custom properties in zIndexLadder.css', () => {
    const declared = declaredCustomProperties(read('./zIndexLadder.css'));
    for (const [key, value] of Object.entries(BAI_Z_INDEX)) {
      expect(declared[cssName(key)], cssName(key)).toBe(value);
    }
    expect(declared['--bai-z-modal-level-step']).toBe(
      BAI_Z_INDEX_MODAL_LEVEL_STEP,
    );
    expect(Object.keys(declared)).toHaveLength(
      Object.keys(BAI_Z_INDEX).length + 1,
    );
  });

  // index.html is parsed before any JS, so it re-declares the one property the
  // splash needs. A silent drift here is the login screen going dark again.
  it('matches the --bai-z-splash mirror in index.html', () => {
    const html = read('../../../../index.html');
    expect(declaredCustomProperties(html)['--bai-z-splash']).toBe(
      BAI_Z_INDEX.splash,
    );
    expect(html).toContain('z-index: var(--bai-z-splash)');
  });

  it('leaves no splash z-index literal in resources/webui.css', () => {
    expect(read('../../../../resources/webui.css')).toContain(
      'z-index: var(--bai-z-splash);',
    );
  });
});
