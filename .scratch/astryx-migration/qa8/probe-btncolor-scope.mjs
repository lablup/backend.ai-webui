/**
 * qa8 group — which theme SCOPE each admin-route control resolves against.
 * `--color-accent` measured on the page root is the brand orange, but the
 * admin-scope primary button paints info-blue; this finds the nested
 * `[data-astryx-theme]` that owns it.
 *
 * Usage: node .scratch/astryx-migration/qa8/probe-btncolor-scope.mjs
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE =
  process.env.BASE ?? 'https://to-astryx.backend-ai-webui.localhost:1357/';
const ROOT = process.env.ROOT ?? '.scratch/astryx-migration/qa8';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  ignoreHTTPSErrors: true,
  storageState: `${ROOT}/state.json`,
});
const page = await ctx.newPage();
page.setDefaultNavigationTimeout(180000);

const out = {};
for (const route of ['admin/environment', 'admin/users', 'session']) {
  await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(10000);
  out[route] = await page.evaluate(() => {
    const pick = (sel) => {
      const b = document.querySelector(sel);
      if (!b) return null;
      const cs = getComputedStyle(b);
      const scope = b.closest('[data-astryx-theme]');
      return {
        label: (b.getAttribute('aria-label') || b.textContent || '').trim().slice(0, 40),
        color: cs.color,
        bg: cs.backgroundColor,
        accent: cs.getPropertyValue('--color-accent').trim(),
        textBlue: cs.getPropertyValue('--color-text-blue').trim(),
        textRed: cs.getPropertyValue('--color-text-red').trim(),
        scopeTheme: scope?.dataset.astryxTheme ?? null,
        scopeTag: scope ? scope.tagName + '.' + String(scope.className).slice(0, 40) : null,
      };
    };
    return {
      primary: pick('main button[data-variant="primary"]'),
      nacDefault: pick('.bai-nac-action-button-default'),
      nacDanger: pick('.bai-nac-action-button-danger'),
      themeScopes: [...document.querySelectorAll('[data-astryx-theme]')].map(
        (e) => e.tagName + '#' + (e.id || '') + '.' + String(e.className).slice(0, 30) + ' => ' + e.dataset.astryxTheme,
      ),
    };
  });
}
fs.writeFileSync(`${ROOT}/before-btncolor-scope.json`, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
await browser.close();
