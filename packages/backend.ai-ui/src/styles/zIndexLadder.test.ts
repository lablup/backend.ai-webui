/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Static assertions over the ladder and its in-package CSS mirror; the mirror
 outside this package (`index.html`) is checked by
 `scripts/migration-gates/z-index-ladder-gate.mjs`.
*/
import { MAX_DIALOG_LEVEL } from '../components/dialogLevelStack';
import { BAI_Z_INDEX, BAI_Z_INDEX_MODAL_LEVEL_STEP } from './zIndexLadder';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// Via a variable: a LITERAL `new URL('./x.css', import.meta.url)` is rewritten
// by Vite into an asset URL, which `fileURLToPath` then rejects.
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
    const values = Object.values(BAI_Z_INDEX);
    expect(values).toStrictEqual([...values].sort((a, b) => a - b));
    expect(new Set(values).size).toBe(values.length);
  });

  // The bug T10 exists to prevent: login-screen modals are `document.body`
  // portals, so nothing can lift them over a splash that outranks the band.
  it('puts the modal band above the splash and the login hosts', () => {
    expect(BAI_Z_INDEX.modalBase).toBeGreaterThan(BAI_Z_INDEX.splash);
    expect(BAI_Z_INDEX.modalBase).toBeGreaterThan(BAI_Z_INDEX.loginHost);
  });

  // The panel is a fixed sibling anchored to the base modal's edge, so it has to
  // clear that modal's full-viewport mask — but not a modal opened on top of it.
  it('puts the login side help between the base modal and the next level', () => {
    expect(BAI_Z_INDEX.loginSideHelp).toBeGreaterThan(BAI_Z_INDEX.modalBase);
    expect(BAI_Z_INDEX.loginSideHelp).toBeLessThan(
      BAI_Z_INDEX.modalBase + BAI_Z_INDEX_MODAL_LEVEL_STEP,
    );
  });

  it('keeps the whole modal band under the notification stack', () => {
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
});
