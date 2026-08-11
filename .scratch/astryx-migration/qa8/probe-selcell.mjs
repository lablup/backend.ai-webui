/**
 * qa8 — why the selection checkbox sits 8px left of every other first-column
 * content edge (280 vs 288, card content edge 287).
 *
 * Walk the selection cell's subtree with each node's box, margins and padding,
 * so the missing 8px is attributed to a specific declaration.
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
await page.goto(`${BASE}session`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(11000);

const dump = await page.evaluate(() => {
  const cell = document.querySelector('tbody td');
  if (!cell) return { error: 'no cell' };
  const out = [];
  const walk = (n, path) => {
    const cs = getComputedStyle(n);
    const r = n.getBoundingClientRect();
    out.push({
      path,
      tag: n.tagName.toLowerCase(),
      cls: (n.getAttribute('class') || '').slice(0, 40),
      left: +r.left.toFixed(1),
      width: +r.width.toFixed(1),
      padding: cs.padding,
      margin: cs.margin,
      justifyContent: cs.justifyContent,
      display: cs.display,
      position: cs.position,
      inset: `${cs.left} / ${cs.right}`,
      transform: cs.transform,
    });
    [...n.children].forEach((c, i) => walk(c, `${path}>${i}`));
  };
  walk(cell, 'td');
  return { layers: out };
});

fs.writeFileSync(
  `${ROOT}/before-selcell.json`,
  JSON.stringify(dump, null, 2),
);
console.log(JSON.stringify(dump, null, 2));
await browser.close();
