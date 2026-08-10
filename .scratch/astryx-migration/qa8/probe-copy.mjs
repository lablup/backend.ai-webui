/**
 * qa8 (1)D — "복사 아이콘 크기 짱 크네요".
 *
 * Legacy antd `Typography.Text copyable` rendered a BARE anticon at the text's
 * own `fontSize` (14px) with no control box. `BAICopyableText` now renders an
 * Astryx `IconButton size="sm"`, whose glyph and box are both larger. Measure
 * the glyph, its control box, and the adjacent value text so the delta against
 * antd's 14px is a number rather than an impression.
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE =
  process.env.BASE ?? 'https://to-astryx.backend-ai-webui.localhost:1357/';
const ROOT = process.env.ROOT ?? '.scratch/astryx-migration/qa8';
const TAG = process.env.TAG ?? 'before';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  ignoreHTTPSErrors: true,
  storageState: `${ROOT}/state.json`,
});
const page = await ctx.newPage();
page.setDefaultNavigationTimeout(180000);
page.setDefaultTimeout(30000);

await page.goto(`${BASE}environment`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(11000);

const out = await page.evaluate(() => {
  const rows = [];
  for (const host of document.querySelectorAll('.bai-copyable-text')) {
    const btn = host.querySelector('button');
    const svg = btn?.querySelector('svg');
    const txt = host.querySelector('.astryx-text, span');
    if (!btn || !svg) continue;
    const bs = btn.getBoundingClientRect();
    const ss = svg.getBoundingClientRect();
    const cs = getComputedStyle(btn);
    rows.push({
      value: (txt?.textContent || '').trim().slice(0, 24),
      button: {
        w: +bs.width.toFixed(1),
        h: +bs.height.toFixed(1),
        fontSize: cs.fontSize,
        padding: cs.padding,
      },
      glyph: { w: +ss.width.toFixed(1), h: +ss.height.toFixed(1) },
      textFontSize: txt ? getComputedStyle(txt).fontSize : null,
    });
    if (rows.length >= 4) break;
  }
  // Any other icon buttons on the page, for a same-page size comparison.
  const others = [];
  for (const b of document.querySelectorAll('button.astryx-icon-button')) {
    if (b.closest('.bai-copyable-text')) continue;
    const svg = b.querySelector('svg');
    if (!svg) continue;
    const bs = b.getBoundingClientRect();
    const ss = svg.getBoundingClientRect();
    others.push({
      label: b.getAttribute('aria-label')?.slice(0, 20),
      size: b.getAttribute('data-size'),
      button: { w: +bs.width.toFixed(1), h: +bs.height.toFixed(1) },
      glyph: { w: +ss.width.toFixed(1), h: +ss.height.toFixed(1) },
    });
    if (others.length >= 6) break;
  }
  return { copyables: rows, otherIconButtons: others };
});

fs.writeFileSync(`${ROOT}/${TAG}-copy.json`, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
await browser.close();
