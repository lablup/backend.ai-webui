// Q-5 blast radius: `.astryx-item` is shared by DropdownMenu rows AND other
// Astryx list-ish surfaces (Selector options, ...). The theme rule is keyed on
// `.astryx-dropdown-menu-item`, so it must hit dropdown rows and NOTHING else.
// This probe opens a Selector and a DropdownMenu on the same page and reports
// which elements actually carry the themed padding.
import { chromium } from '@playwright/test';

const BASE = process.env.BAI_BASE ?? 'http://127.0.0.1:6060/';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
const page = await ctx.newPage();
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(String(e).slice(0, 200)));
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('[data-testid="user-dropdown-button"]', { timeout: 120000 });
await page.waitForTimeout(4000);

const census = async (label) =>
  page.evaluate(
    (l) => {
      const rows = [...document.querySelectorAll('.astryx-item')]
        .filter((e) => e.getBoundingClientRect().width > 0)
        .map((e) => {
          const s = getComputedStyle(e);
          return {
            cls: [...e.classList].filter((c) => c.startsWith('astryx')).join(' '),
            inDropdown: !!e.closest('.astryx-dropdown-menu'),
            pad: s.padding,
            h: +e.getBoundingClientRect().height.toFixed(1),
            lh: s.lineHeight,
            text: (e.textContent ?? '').trim().slice(0, 18),
          };
        });
      return { label: l, count: rows.length, rows: rows.slice(0, 14) };
    },
    label,
  );

// 1. the project Selector in the header (an Astryx Selector, not a DropdownMenu)
const proj = page.locator('button').filter({ hasText: /select project|한국어/i }).first();
if (await proj.count()) {
  await proj.click().catch(() => {});
  await page.waitForTimeout(900);
  console.log(JSON.stringify(await census('selector open'), null, 1));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
}

// 2. the user DropdownMenu
await page.locator('[data-testid="user-dropdown-button"]').first().click();
await page.waitForTimeout(900);
console.log(JSON.stringify(await census('dropdown open'), null, 1));

console.log('pageErrors', pageErrors);
await browser.close();
