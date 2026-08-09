/** final switch — find stable triggers for the overlay probes. */
import { chromium } from '@playwright/test';

const ROOT = process.env.ROOT;
const BASE = process.env.BASE ?? 'http://127.0.0.1:6020/';
const PROJ =
  process.env.PROJ ?? 'a%ED%95%9C%EA%B5%AD%EC%96%B4%EA%B0%80%EB%8A%A5_cde';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  storageState: `${ROOT}/final-switch-state.json`,
});
const page = await ctx.newPage();
page.setDefaultNavigationTimeout(120000);

await page.goto(`${BASE}project/${PROJ}/start`, {
  waitUntil: 'domcontentloaded',
});
await page.waitForTimeout(18000);
console.log(
  'HEADER:',
  JSON.stringify(
    await page.evaluate(() => {
      const h = document.querySelector('[data-testid="webui-header"]');
      if (!h) return null;
      return Array.from(h.querySelectorAll('button,[role="combobox"]')).map(
        (e) => ({
          tag: e.tagName,
          role: e.getAttribute('role'),
          testid: e.getAttribute('data-testid'),
          label: e.getAttribute('aria-label'),
          text: (e.innerText || '').trim().slice(0, 30),
        }),
      );
    }),
    null,
    1,
  ),
);

await page.goto(`${BASE}project/${PROJ}/data`, {
  waitUntil: 'domcontentloaded',
});
await page.waitForTimeout(18000);
console.log(
  'DATA BUTTONS:',
  JSON.stringify(
    await page.evaluate(() =>
      Array.from(document.querySelectorAll('button'))
        .map((e) => ({
          testid: e.getAttribute('data-testid'),
          label: e.getAttribute('aria-label'),
          text: (e.innerText || '').trim().slice(0, 30),
        }))
        .filter((x) => x.text || x.label)
        .slice(0, 25),
    ),
    null,
    1,
  ),
);
await browser.close();
