// QA2-A pass 4b: FolderExplorerModalV2 opened in a BORN-narrow viewport, so
// `useBAIBreakpoint().xl` is false from first paint — the `type="line"` half of
// the restored `type={xl ? 'card' : 'line'}` split.
import fs from 'node:fs';
import { launch, login, goto, setMode } from './qa2a-probe.mjs';

const OUT = `.scratch/astryx-migration/shots/qa2-a`;
fs.mkdirSync(OUT, { recursive: true });

const { browser, page } = await launch({ width: 1100, height: 900 });
await login(page);
await setMode(page, 'light');
await goto(page, 'data');
await page.waitForTimeout(3000);

await page.locator('tbody tr').first().waitFor({ timeout: 30000 });
const folder = page.locator('tbody tr a, tbody tr [role="link"]').first();
await folder.click();
await page.waitForTimeout(9000);
await page.screenshot({ path: `${OUT}/final-folder-explorer-narrow-line.png` });

const m = await page.evaluate(() =>
  [...document.querySelectorAll('nav.astryx-tab-list')].map((nav) => ({
    style: nav.className.includes('bai-tab-list--card') ? 'card' : 'line',
    size: nav.getAttribute('data-size'),
    labels: [...nav.querySelectorAll('[data-tab-value]')].map((t) =>
      t.getAttribute('data-tab-value'),
    ),
  })),
);
console.log(JSON.stringify(m, null, 2));
await browser.close();
