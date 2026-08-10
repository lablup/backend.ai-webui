/**
 * qa8 batch3 — open each launcher dropdown, scoped to the VISIBLE listbox.
 * (probe-b3-select-open.mjs picked the header project selector's still-mounted
 * hidden listbox every time; this one filters by layout box.)
 *
 * READ-ONLY.
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE =
  process.env.BASE ?? 'https://to-astryx.backend-ai-webui.localhost:1357/';
const ROOT = process.env.ROOT ?? '.scratch/astryx-migration/qa8';
const TAG = process.env.TAG ?? 'b3-open2';

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
await page.waitForTimeout(14000);
await page.getByRole('button', { name: /^next/i }).first().click();
await page.waitForTimeout(6000);

const result = { url: page.url(), triggers: [], popups: {} };

// The closed trigger's own DOM — this is where the image icon / tags used to be.
result.triggers = await page.evaluate(() => {
  return [...document.querySelectorAll('[aria-haspopup="listbox"]')]
    .filter((el) => el.getBoundingClientRect().width > 0)
    .map((el, i) => {
      const r = el.getBoundingClientRect();
      return {
        i,
        text: el.textContent,
        imgCount: el.querySelectorAll('img').length,
        badgeCount: el.querySelectorAll('[class*="badge"], .astryx-badge')
          .length,
        html: el.innerHTML.slice(0, 300),
        rect: {
          x: Math.round(r.x),
          y: Math.round(r.y),
          w: Math.round(r.width),
          h: Math.round(r.height),
        },
      };
    });
});

const dumpVisiblePopup = () =>
  page.evaluate(() => {
    const list = [...document.querySelectorAll('[role="listbox"]')].find(
      (l) => l.getBoundingClientRect().width > 0,
    );
    if (!list) return { found: false };
    const r = list.getBoundingClientRect();
    const opts = [...list.querySelectorAll('[role="option"]')];
    const groups = [...list.querySelectorAll('[role="group"]')];
    // the whole popup panel, to see whether a header row survived
    const panel = list.parentElement;
    return {
      found: true,
      rect: {
        x: Math.round(r.x),
        y: Math.round(r.y),
        w: Math.round(r.width),
        h: Math.round(r.height),
      },
      panelText: panel?.textContent?.trim().slice(0, 200),
      optionCount: opts.length,
      groupCount: groups.length,
      groupLabels: groups.map((g) => g.getAttribute('aria-label')).slice(0, 8),
      totalImgs: list.querySelectorAll('img').length,
      totalBadges: list.querySelectorAll('[class*="badge"], .astryx-badge')
        .length,
      hasSearchBox: !!document.querySelector(
        'input[type="search"], input[placeholder*="earch"]',
      ),
      options: opts.slice(0, 6).map((o) => {
        const or = o.getBoundingClientRect();
        const img = o.querySelector('img');
        return {
          text: o.textContent?.trim().slice(0, 140),
          imgCount: o.querySelectorAll('img').length,
          imgSrc: img?.getAttribute('src')?.slice(0, 100) ?? null,
          imgNatural: img ? { w: img.naturalWidth, h: img.naturalHeight } : null,
          imgRect: img
            ? {
                w: +img.getBoundingClientRect().width.toFixed(1),
                h: +img.getBoundingClientRect().height.toFixed(1),
              }
            : null,
          badgeCount: o.querySelectorAll('[class*="badge"], .astryx-badge')
            .length,
          rect: { w: +or.width.toFixed(1), h: +or.height.toFixed(1) },
        };
      }),
    };
  });

const triggers = page.locator('[aria-haspopup="listbox"]:visible');
const n = await triggers.count();
for (let i = 0; i < n; i++) {
  const text = (await triggers.nth(i).textContent())?.trim().slice(0, 40);
  try {
    await triggers.nth(i).click({ timeout: 8000 });
    await page.waitForTimeout(2000);
    result.popups[`t${i}:${text}`] = await dumpVisiblePopup();
    await page.screenshot({ path: `${ROOT}/${TAG}-t${i}.png` });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
  } catch (e) {
    result.popups[`t${i}:${text}`] = { error: String(e).slice(0, 160) };
  }
}

// ---- numeric controls, with their wrapper geometry --------------------
result.numeric = await page.evaluate(() => {
  return [...document.querySelectorAll('input[type="number"]')]
    .filter((el) => el.getBoundingClientRect().width > 0)
    .map((el, i) => {
      const r = el.getBoundingClientRect();
      const field = el.closest('div')?.parentElement;
      const buttons = [...(field?.querySelectorAll('button') ?? [])];
      return {
        i,
        value: el.value,
        min: el.getAttribute('min'),
        max: el.getAttribute('max'),
        step: el.getAttribute('step'),
        ariaLabel: el.getAttribute('aria-label'),
        rect: {
          x: Math.round(r.x),
          y: Math.round(r.y),
          w: +r.width.toFixed(1),
          h: +r.height.toFixed(1),
        },
        fieldText: field?.textContent?.trim().slice(0, 60),
        buttons: buttons.map((b) => ({
          label: b.getAttribute('aria-label') ?? b.textContent?.trim(),
          w: +b.getBoundingClientRect().width.toFixed(1),
          h: +b.getBoundingClientRect().height.toFixed(1),
        })),
      };
    });
});

result.pageErrors = pageErrors;
fs.writeFileSync(`${ROOT}/${TAG}.json`, JSON.stringify(result, null, 2));
console.log('done');
await browser.close();
