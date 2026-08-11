// QA2-A pass 4c: DownloadModal — it was a PLAIN antd `Tabs` (line) on `main`,
// so it opts out of the card default `BAITabs` now carries.
import fs from 'node:fs';
import { launch, login, goto, setMode } from './qa2a-probe.mjs';

const OUT = `.scratch/astryx-migration/shots/qa2-a`;
fs.mkdirSync(OUT, { recursive: true });

const { browser, page } = await launch();
await login(page);
await setMode(page, 'light');
await goto(page, 'summary');

await page.getByRole('button', { name: /Admin Lablu/i }).first().click();
await page.waitForTimeout(1500);
await page.getByRole('menuitem', { name: /Downloads/i }).first().click();
await page.waitForTimeout(5000);
await page.screenshot({ path: `${OUT}/final-download-modal-line.png` });
console.log(
  JSON.stringify(
    await page.evaluate(() =>
      [...document.querySelectorAll('nav.astryx-tab-list')].map((nav) => ({
        style: nav.className.includes('bai-tab-list--card') ? 'card' : 'line',
        size: nav.getAttribute('data-size'),
        railSpansBar:
          Math.abs(
            nav.getBoundingClientRect().width -
              nav.parentElement.getBoundingClientRect().width,
          ) <= 1,
        labels: [...nav.querySelectorAll('[data-tab-value]')].map((t) =>
          t.getAttribute('data-tab-value'),
        ),
      })),
    ),
    null,
    2,
  ),
);
await browser.close();
