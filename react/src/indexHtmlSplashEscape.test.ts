/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * The dev-only Esc handler on the loading splash lives in the inline splash
 * script of the project-root index.html, so it must work before any module of
 * the app has loaded. These tests boot that document alone, with the dev shim
 * react/vite.config.ts injects, and press Esc.
 */
import { INTENTIONAL_LOGOUT_FLAG } from './hooks/useLogout';
import { JSDOM, VirtualConsole } from 'jsdom';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const indexHtml = readFileSync(resolve(__dirname, '../../index.html'), 'utf8');

function bootIndexHtml({ dev }: { dev: boolean }) {
  // Mirrors projectRootStaticPlugin's dev transform (react/vite.config.ts).
  const served = indexHtml
    .replace(
      '// DEV_JS_INJECTING',
      dev ? 'globalThis.process = {env: {NODE_ENV: "development"}};' : '',
    )
    .replace(/\{\{nonce\}\}/g, '');
  const navigations: string[] = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', (error) => {
    if (/navigation/.test(error.message)) navigations.push(error.message);
  });
  const dom = new JSDOM(served, {
    url: 'http://localhost/',
    runScripts: 'dangerously',
    virtualConsole,
    beforeParse(window) {
      // manifest/app.js is not loaded here; the splash script measures SVG edges.
      (window as unknown as { isElectron: () => boolean }).isElectron = () =>
        false;
      (
        window.SVGElement.prototype as unknown as {
          getTotalLength: () => number;
        }
      ).getTotalLength = () => 10;
    },
  });
  const { window } = dom;
  const pressEscape = () => {
    const event = new window.KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    });
    window.document.body.dispatchEvent(event);
    return event;
  };
  return { window, pressEscape, navigations };
}

describe('index.html loading-splash Esc (dev only)', () => {
  it('reloads to the login form while the splash is loading', () => {
    const { window, pressEscape, navigations } = bootIndexHtml({ dev: true });
    expect(window.document.getElementById('splash')?.className).toBe('splash');

    const event = pressEscape();

    expect(event.defaultPrevented).toBe(true);
    expect(window.sessionStorage.getItem(INTENTIONAL_LOGOUT_FLAG)).toBe('1');
    expect(navigations).toHaveLength(1);
  });

  it('leaves Esc alone once the splash is the login backdrop', () => {
    const { window, pressEscape, navigations } = bootIndexHtml({ dev: true });
    (
      window as unknown as { __enterLoginBackdrop: () => void }
    ).__enterLoginBackdrop();

    const event = pressEscape();

    expect(event.defaultPrevented).toBe(false);
    expect(window.sessionStorage.getItem(INTENTIONAL_LOGOUT_FLAG)).toBeNull();
    expect(navigations).toHaveLength(0);
  });

  it('leaves Esc alone once the splash is dismissed', () => {
    const { window, pressEscape, navigations } = bootIndexHtml({ dev: true });
    (window as unknown as { __dismissSplash: () => void }).__dismissSplash();

    const event = pressEscape();

    expect(event.defaultPrevented).toBe(false);
    expect(window.sessionStorage.getItem(INTENTIONAL_LOGOUT_FLAG)).toBeNull();
    expect(navigations).toHaveLength(0);
  });

  it('is not installed in a production document', () => {
    const { window, pressEscape, navigations } = bootIndexHtml({ dev: false });

    const event = pressEscape();

    expect(event.defaultPrevented).toBe(false);
    expect(window.sessionStorage.getItem(INTENTIONAL_LOGOUT_FLAG)).toBeNull();
    expect(navigations).toHaveLength(0);
  });
});
