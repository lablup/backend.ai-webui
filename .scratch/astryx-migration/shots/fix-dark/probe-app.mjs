// Dark-mode / token-propagation diagnostic against the running app dev server.
// Run: node .scratch/astryx-migration/shots/fix-dark/probe-app.mjs
import { chromium } from '@playwright/test';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const outDir = dirname(fileURLToPath(import.meta.url));
const APP = process.env.APP_URL ?? 'http://127.0.0.1:4435/';
const TAG = process.argv[2] ?? 'before';

const collect = () => {
  const de = document.documentElement;
  const pick = (el) => {
    if (!el) return null;
    const cs = getComputedStyle(el);
    return {
      tag: el.tagName.toLowerCase(),
      cls: (el.getAttribute('class') || '').slice(0, 80),
      colorScheme: cs.colorScheme,
      backgroundColor: cs.backgroundColor,
      color: cs.color,
      'var(--color-background)': cs.getPropertyValue('--color-background').trim(),
      'var(--color-background-surface)': cs
        .getPropertyValue('--color-background-surface')
        .trim(),
      'var(--color-text-primary)': cs.getPropertyValue('--color-text-primary').trim(),
      'var(--color-accent)': cs.getPropertyValue('--color-accent').trim(),
      'var(--spacing-4)': cs.getPropertyValue('--spacing-4').trim(),
      'data-astryx-theme': el.getAttribute?.('data-astryx-theme') ?? null,
      'data-theme': el.getAttribute?.('data-theme') ?? null,
    };
  };
  const themedWrapper = document.querySelector('[data-astryx-theme]');
  const deepThemed = document.querySelector(
    '#react-root [data-astryx-theme] *',
  );
  // any element portalled directly under body (astryx layer roots, antd holders)
  const bodyKids = Array.from(document.body.children).map((el) => ({
    tag: el.tagName.toLowerCase(),
    id: el.id,
    cls: (el.getAttribute('class') || '').slice(0, 100),
    astryx: el.getAttribute('data-astryx-theme'),
    dataTheme: el.getAttribute('data-theme'),
    cs: getComputedStyle(el).colorScheme,
    bg: getComputedStyle(el).getPropertyValue('--color-background').trim(),
    sp4: getComputedStyle(el).getPropertyValue('--spacing-4').trim(),
  }));
  return {
    htmlAttrs: Array.from(de.attributes).map((a) => `${a.name}=${a.value}`),
    bodyClass: document.body.className,
    html: pick(de),
    body: pick(document.body),
    reactRoot: pick(document.getElementById('react-root')),
    themedWrapper: pick(themedWrapper),
    deepThemed: pick(deepThemed),
    bodyKids,
    themeStyleTags: Array.from(
      document.querySelectorAll('style[data-astryx-theme],style[data-astryx-theme-prose]'),
    ).length,
    stylesheetCount: document.styleSheets.length,
    layerOrder: (() => {
      const out = [];
      for (const ss of Array.from(document.styleSheets)) {
        try {
          for (const rule of Array.from(ss.cssRules)) {
            if (rule.constructor.name === 'CSSLayerStatementRule') {
              out.push(rule.cssText);
            }
          }
        } catch {
          /* cross-origin */
        }
      }
      return out;
    })(),
  };
};

const run = async () => {
  const browser = await chromium.launch();
  const results = {};
  for (const mode of ['light', 'dark']) {
    for (const os of ['light', 'dark']) {
      const ctx = await browser.newContext({
        colorScheme: os,
        viewport: { width: 1440, height: 900 },
      });
      const page = await ctx.newPage();
      await page.goto(APP, { waitUntil: 'domcontentloaded' });
      await page.evaluate(
        (m) =>
          localStorage.setItem(
            'backendaiwebui.settings.themeMode',
            JSON.stringify(m),
          ),
        mode,
      );
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(2500);
      const key = `app-${mode}-os${os}`;
      results[key] = await page.evaluate(collect);
      await page.screenshot({ path: join(outDir, `${TAG}-${key}.png`) });
      await ctx.close();
    }
  }
  await browser.close();
  console.log(JSON.stringify(results, null, 2));
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
