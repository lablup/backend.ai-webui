// Guard p3-w3b: the modals the user menu launches must stay page-mode surfaces.
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const DARK = process.env.DARK === '1';
const SHOTDIR = '.scratch/astryx-migration/shots/login-header';
fs.mkdirSync(SHOTDIR, { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  colorScheme: DARK ? 'dark' : 'light',
});
const page = await ctx.newPage();
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(String(e).slice(0, 200)));
await page.goto(process.env.BAI_BASE ?? 'http://127.0.0.1:6050/', {
  waitUntil: 'domcontentloaded',
});
await page.waitForTimeout(15000);

const want = DARK ? 'dark' : 'light';
if ((await page.evaluate(() => document.documentElement.dataset.theme)) !== want) {
  await page.locator('[data-testid="button-theme"]').first().click();
  await page.waitForTimeout(1500);
}
const got = await page.evaluate(() => document.documentElement.dataset.theme);
if (got !== want) throw new Error('theme toggle did not take: ' + got);

const dialogInfo = () =>
  page.evaluate(() =>
    [...document.querySelectorAll('dialog[open]')].map((d) => {
      const s = getComputedStyle(d);
      const surface = d.querySelector('div');
      const text = [...d.querySelectorAll('*')].find(
        (c) => c.children.length === 0 && (c.textContent ?? '').trim(),
      );
      return {
        cls: String(d.className).split(' ')[0],
        bg: surface ? getComputedStyle(surface).backgroundColor : s.backgroundColor,
        dialogBg: s.backgroundColor,
        colorScheme: s.colorScheme,
        firstText: text ? (text.textContent ?? '').trim().slice(0, 20) : null,
        firstTextColor: text ? getComputedStyle(text).color : null,
      };
    }),
  );

const out = { mode: want, modals: {} };
for (const label of ['Downloads', 'About Backend.AI', 'My Account']) {
  try {
    await page.locator('[data-testid="user-dropdown-button"]').click();
    await page.waitForTimeout(800);
    const item = page.getByText(label, { exact: false }).last();
    await item.click();
    await page.waitForTimeout(2500);
    out.modals[label] = await dialogInfo();
    await page.screenshot({
      path: `${SHOTDIR}/after-usermenu-${label.replace(/\W+/g, '-').toLowerCase()}-${want}.png`,
    });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1200);
  } catch (e) {
    out.modals[label] = { error: String(e).slice(0, 160) };
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(800);
  }
}
out.pageErrors = pageErrors;
console.log(JSON.stringify(out, null, 1));
await browser.close();
