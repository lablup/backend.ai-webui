/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { JSDOM, VirtualConsole } from 'jsdom';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const indexHtml = readFileSync(resolve(__dirname, '../../index.html'), 'utf8');
const appJs = readFileSync(resolve(__dirname, '../../manifest/app.js'), 'utf8');
const ACCEPTED_KEY = 'backendaiwebui.unsupportedBrowserAccepted';

type UnsupportedWindow = Window & {
  isUnsupportedBrowser?: boolean;
  isBrowserBelowSupportedRange?: boolean;
  unsupportedBrowserAcceptedKey?: string;
  supportedBrowsersText?: string;
  isElectron?: () => boolean;
};

function bootIndexHtml({
  language = 'en-US',
  failSetItem = false,
}: { language?: string; failSetItem?: boolean } = {}) {
  const served = indexHtml
    .replace('// DEV_JS_INJECTING', '')
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
      const w = window as unknown as UnsupportedWindow;
      w.isElectron = () => false;
      w.isUnsupportedBrowser = true;
      w.isBrowserBelowSupportedRange = true;
      w.unsupportedBrowserAcceptedKey = ACCEPTED_KEY;
      w.supportedBrowsersText = 'Chrome 1+';
      Object.defineProperty(window.navigator, 'language', {
        value: language,
      });
      (
        window.SVGElement.prototype as unknown as {
          getTotalLength: () => number;
        }
      ).getTotalLength = () => 10;
      if (failSetItem) {
        window.Storage.prototype.setItem = () => {
          throw new Error('QuotaExceededError');
        };
      }
    },
  });
  const { window } = dom;
  const { document } = window;
  const useAnyway = () =>
    document.querySelector<HTMLButtonElement>(
      '#splash .splash-center > button',
    )!;
  const dialog = () =>
    document.querySelector<HTMLElement>('[role="alertdialog"]');
  const modalButton = (label: string) =>
    Array.from(
      document.querySelectorAll<HTMLButtonElement>(
        '[role="alertdialog"] button',
      ),
    ).find((button) => button.textContent === label)!;
  const press = (key: string, shiftKey = false) => {
    const event = new window.KeyboardEvent('keydown', {
      key,
      shiftKey,
      bubbles: true,
      cancelable: true,
    });
    (document.activeElement ?? document.body).dispatchEvent(event);
    return event;
  };
  return {
    window,
    document,
    useAnyway,
    dialog,
    modalButton,
    press,
    navigations,
  };
}

describe('index.html unsupported-browser "Use anyway" (ADR 0038)', () => {
  it('appends the Use anyway button under the block message', () => {
    const { useAnyway, document } = bootIndexHtml();
    expect(useAnyway().textContent).toBe('Use anyway');
    expect(useAnyway().previousElementSibling).toBe(
      document.querySelector('#splash .splash-loader'),
    );

    const korean = bootIndexHtml({ language: 'ko-KR' });
    expect(korean.useAnyway().textContent).toBe('그래도 이용하기');
  });

  it('opens a modal alertdialog with focus on Cancel', () => {
    const { useAnyway, dialog, modalButton, document } = bootIndexHtml();
    useAnyway().click();

    expect(dialog()?.getAttribute('aria-modal')).toBe('true');
    expect(document.activeElement).toBe(modalButton('Cancel'));
  });

  it('closes on Escape, Cancel and a scrim click without storing anything', () => {
    const { window, useAnyway, dialog, modalButton, press, navigations } =
      bootIndexHtml();

    useAnyway().click();
    expect(press('Escape').defaultPrevented).toBe(true);
    expect(dialog()).toBeNull();
    expect(window.document.activeElement).toBe(useAnyway());

    useAnyway().click();
    modalButton('Cancel').click();
    expect(dialog()).toBeNull();
    expect(window.document.activeElement).toBe(useAnyway());

    useAnyway().click();
    dialog()!.click();
    expect(dialog()).not.toBeNull();
    (dialog()!.parentElement as HTMLElement).click();
    expect(dialog()).toBeNull();

    expect(window.sessionStorage.getItem(ACCEPTED_KEY)).toBeNull();
    expect(window.name).toBe('');
    expect(navigations).toHaveLength(0);
  });

  it('traps Tab focus between Cancel and Continue', () => {
    const { useAnyway, modalButton, press, document } = bootIndexHtml();
    useAnyway().click();

    modalButton('Continue').focus();
    expect(press('Tab').defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(modalButton('Cancel'));

    expect(press('Tab', true).defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(modalButton('Continue'));
  });

  it('Continue stores the acceptance in sessionStorage and reloads', () => {
    const { window, useAnyway, modalButton, navigations } = bootIndexHtml();
    useAnyway().click();
    modalButton('Continue').click();

    expect(window.sessionStorage.getItem(ACCEPTED_KEY)).toBe('1');
    expect(window.name).toBe('');
    expect(navigations).toHaveLength(1);
  });

  it('Continue falls back to window.name when sessionStorage throws', () => {
    const { window, useAnyway, modalButton, navigations } = bootIndexHtml({
      failSetItem: true,
    });
    useAnyway().click();
    modalButton('Continue').click();

    expect(window.name).toBe(ACCEPTED_KEY);
    expect(navigations).toHaveLength(1);
  });
});

describe('manifest/app.js unsupported-browser acceptance', () => {
  function runAppJs(prepare: (window: UnsupportedWindow) => void) {
    const { window } = new JSDOM('<!doctype html><html></html>', {
      url: 'http://localhost/',
      runScripts: 'dangerously',
    });
    const w = window as unknown as UnsupportedWindow & {
      eval: (code: string) => void;
    };
    prepare(w);
    w.eval(appJs);
    return w;
  }

  it('blocks a browser that lacks the required features', () => {
    const w = runAppJs(() => {});
    expect(w.isBrowserBelowSupportedRange).toBe(true);
    expect(w.isUnsupportedBrowser).toBe(true);
  });

  it('lifts the block once the tab accepted via sessionStorage or window.name', () => {
    const viaStorage = runAppJs((w) =>
      w.sessionStorage.setItem(ACCEPTED_KEY, '1'),
    );
    expect(viaStorage.isBrowserBelowSupportedRange).toBe(true);
    expect(viaStorage.isUnsupportedBrowser).toBe(false);

    const viaName = runAppJs((w) => {
      w.name = ACCEPTED_KEY;
    });
    expect(viaName.isBrowserBelowSupportedRange).toBe(true);
    expect(viaName.isUnsupportedBrowser).toBe(false);
  });
});
