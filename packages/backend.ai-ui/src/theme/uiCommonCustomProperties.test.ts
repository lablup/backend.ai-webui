/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 ui-common names its custom properties the way Astryx does, with no prefix:
 theme tokens (`--color-info`) and component knobs, `--<component>-<property>`
 (`--modal-z`). These guard the WebUI side of that contract.
*/
import { buildBaiCustomTokens } from './baiCustomTokens';
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const UI_COMMON_DIST = resolve(
  __dirname,
  '../../node_modules/@lablup/ui-common/dist',
);
const SOURCE_DIRS = [
  resolve(__dirname, '..'),
  resolve(__dirname, '../../../../react/src'),
];

const kebab = (name: string) =>
  name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

function files(dir: string, test: (name: string) => boolean): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '__generated__') {
      continue;
    }
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...files(path, test));
    else if (test(entry.name)) out.push(path);
  }
  return out;
}

const NAME = /(?<![\w-])(--[a-z][a-z0-9-]*[a-z0-9])(?![\w-])/g;

/** ui-common's component knobs: every `--<component>-*` name its dist uses. */
const componentPrefixes = new Set<string>();
const knobs = new Set<string>();
for (const root of ['components', 'assets/components']) {
  for (const entry of readdirSync(join(UI_COMMON_DIST, root), {
    withFileTypes: true,
  })) {
    if (!entry.isDirectory()) continue;
    const prefix = `--${kebab(entry.name)}-`;
    componentPrefixes.add(prefix);
    for (const file of files(join(UI_COMMON_DIST, root, entry.name), (n) =>
      /\.(css|js)$/.test(n),
    )) {
      for (const m of readFileSync(file, 'utf8').matchAll(NAME)) {
        if (m[1]?.startsWith(prefix)) knobs.add(m[1]);
      }
    }
  }
}

/** Every custom property the WebUI theme declares. */
const WEBUI_THEME_TOKENS = Object.keys(
  buildBaiCustomTokens({
    accent: { light: '#000', dark: '#000' },
    info: { light: '#000', dark: '#000' },
    link: { light: '#000', dark: '#000' },
    headerBg: { light: '#000', dark: '#000' },
    error: { light: '#000', dark: '#000' },
    success: { light: '#000', dark: '#000' },
    warning: { light: '#000', dark: '#000' },
  }),
);

/** Custom properties the WebUI declares: `--x:` in CSS, `'--x':` in TSX. */
const declared = SOURCE_DIRS.flatMap((dir) =>
  files(dir, (n) => /\.(css|tsx?)$/.test(n) && !/\.test\.tsx?$/.test(n)),
).flatMap((file) =>
  [
    ...readFileSync(file, 'utf8').matchAll(
      /(?<![\w-])['"]?(--[a-z][a-z0-9-]*[a-z0-9])['"]?\s*:/g,
    ),
  ].map((m) => ({ file, name: m[1] ?? '' })),
);

describe('ui-common custom properties', () => {
  it('finds the knobs in the installed package', () => {
    expect([...knobs]).toEqual(
      expect.arrayContaining([
        '--modal-z',
        '--data-grid-max-height',
        '--unit-grid-group-1',
        '--notification-stack-z',
      ]),
    );
  });

  it('no knob collides with a WebUI theme token or a WebUI prefix', () => {
    const theme = new Set(WEBUI_THEME_TOKENS);
    expect([...knobs].filter((n) => theme.has(n))).toEqual([]);
    expect(
      [...knobs].filter((n) => /^--(bai|token|webui|uic)-/.test(n)),
    ).toEqual([]);
  });

  it('every ui-common knob the WebUI sets exists in ui-common', () => {
    const stale = declared.filter(
      ({ name }) =>
        [...componentPrefixes].some((p) => name.startsWith(p)) &&
        !knobs.has(name),
    );
    expect(stale).toEqual([]);
  });

  it('the WebUI sets no --uic- property', () => {
    expect(declared.filter(({ name }) => name.startsWith('--uic-'))).toEqual(
      [],
    );
  });
});
