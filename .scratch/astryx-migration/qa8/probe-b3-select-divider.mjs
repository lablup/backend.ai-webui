/**
 * qa8 batch3 — measure the version-select option row internals:
 *   the `<Divider orientation="vertical" />` separators between
 *   version / architecture / tags, which read as jammed-together text.
 *
 * READ-ONLY.
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE =
  process.env.BASE ?? 'https://to-astryx.backend-ai-webui.localhost:1357/';
const ROOT = process.env.ROOT ?? '.scratch/astryx-migration/qa8';
const TAG = process.env.TAG ?? 'b3-divider';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  ignoreHTTPSErrors: true,
  storageState: `${ROOT}/state.json`,
});
const page = await ctx.newPage();
page.setDefaultNavigationTimeout(180000);
page.setDefaultTimeout(30000);
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(e.message));

await page.goto(`${BASE}session/start`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(25000);
await page
  .getByRole('button', { name: /^next/i })
  .first()
  .click({ timeout: 90000 });
await page.waitForTimeout(6000);

// version select is the 3rd visible listbox trigger (0 = header project)
await page.locator('[aria-haspopup="listbox"]:visible').nth(2).click();
await page.waitForTimeout(2000);

const result = await page.evaluate(() => {
  const list = [...document.querySelectorAll('[role="listbox"]')].find(
    (l) => l.getBoundingClientRect().width > 0,
  );
  if (!list) return { found: false };
  const first = list.querySelector('[role="option"]');
  const kids = [...(first?.querySelectorAll('*') ?? [])];
  const dividers = kids.filter(
    (k) =>
      (k.className?.toString?.() ?? '').includes('divider') ||
      k.getAttribute?.('role') === 'separator' ||
      (k.tagName === 'HR'),
  );
  return {
    found: true,
    optionHTML: first?.innerHTML.slice(0, 1200),
    dividerCount: dividers.length,
    dividers: dividers.map((d) => {
      const r = d.getBoundingClientRect();
      const c = getComputedStyle(d);
      return {
        tag: d.tagName,
        cls: (d.className?.toString?.() ?? '').slice(0, 60),
        w: +r.width.toFixed(2),
        h: +r.height.toFixed(2),
        marginInline: `${c.marginLeft}/${c.marginRight}`,
        borderLeft: c.borderLeftWidth,
        alignSelf: c.alignSelf,
        display: c.display,
      };
    }),
    // the flex row that holds version | arch | tags
    rowGap: (() => {
      const flex = first?.querySelector('div');
      if (!flex) return null;
      const c = getComputedStyle(flex);
      return { display: c.display, gap: c.gap, alignItems: c.alignItems };
    })(),
  };
});

result.pageErrors = pageErrors;
await page.screenshot({ path: `${ROOT}/${TAG}.png` });
fs.writeFileSync(`${ROOT}/${TAG}.json`, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2).slice(0, 4000));
await browser.close();
