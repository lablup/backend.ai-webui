/** qa8 — one-shot DOM discovery for the folder-create dialog's tooltip trigger. */
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
page.setDefaultTimeout(20000);

await page.goto(`${BASE}data`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(12000);
await page.getByRole('button', { name: /create folder/i }).first().click();
await page.waitForTimeout(2500);

const out = await page.evaluate(() => {
  const dlg = document.querySelector('dialog[open]');
  const svgs = [...(dlg?.querySelectorAll('svg') ?? [])].map((s) => ({
    cls: s.getAttribute('class'),
    parentTag: s.parentElement?.tagName.toLowerCase(),
    parentCls: (s.parentElement?.getAttribute('class') ?? '').slice(0, 60),
    rect: (() => {
      const r = s.getBoundingClientRect();
      return { x: +r.x.toFixed(0), y: +r.y.toFixed(0), w: +r.width.toFixed(0) };
    })(),
  }));
  const anchored = [...document.querySelectorAll('[style*="anchor-name"]')].map(
    (el) => ({
      tag: el.tagName.toLowerCase(),
      cls: (el.getAttribute('class') ?? '').slice(0, 60),
      anchorName: el.style.anchorName,
      insideDialog: !!el.closest('dialog'),
    }),
  );
  return {
    dialogPresent: !!dlg,
    dialogText: dlg?.textContent?.slice(0, 300),
    svgs,
    anchored,
    tooltips: [...document.querySelectorAll('[role="tooltip"]')].length,
  };
});
fs.writeFileSync(
  `${ROOT}/discover-tooltip.json`,
  JSON.stringify(out, null, 2),
);
console.log(JSON.stringify(out, null, 2));
await page.screenshot({ path: `${ROOT}/discover-folder-dialog.png` });
await browser.close();
