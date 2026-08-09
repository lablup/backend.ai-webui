// QA2-A pass 4: FolderExplorerModalV2 at `xl`, where the restored
// `type={xl ? 'card' : 'line'}` split shows the CARD half — and where the card
// tabs and the page's own card tabs are on screen together.
// (The `line` half is captured by `qa2a-modals2.mjs`, which opens the modal in
// a viewport that is narrow from first paint; a mid-session resize does not
// flip `useBAIBreakpoint` — see the defect note in `issues/qa2-a.md`.)
import fs from 'node:fs';
import { launch, login, goto, setMode } from './qa2a-probe.mjs';

const OUT = `.scratch/astryx-migration/shots/qa2-a`;
fs.mkdirSync(OUT, { recursive: true });

const { browser, page } = await launch();
await login(page);
await setMode(page, 'light');
await goto(page, 'data');
await page.waitForTimeout(3000);

await page.locator('tbody tr').first().waitFor({ timeout: 30000 });
await page.locator('tbody tr a, tbody tr [role="link"]').first().click();
await page.waitForTimeout(9000);
await page.screenshot({ path: `${OUT}/final-folder-explorer-xl-card.png` });

console.log(
  JSON.stringify(
    await page.evaluate(() =>
      [...document.querySelectorAll('nav.astryx-tab-list')].map((nav) => {
        const r = (n) => +Number(n).toFixed(2);
        const b = nav.getBoundingClientRect();
        const first = nav.querySelector('[data-tab-value]');
        const cs = first ? getComputedStyle(first) : null;
        return {
          style: nav.className.includes('bai-tab-list--card') ? 'card' : 'line',
          navW: r(b.width),
          parentW: r(nav.parentElement.getBoundingClientRect().width),
          tabH: first ? r(first.getBoundingClientRect().height) : null,
          tabPadInline: cs?.paddingInlineStart,
          tabRadius: cs?.borderTopLeftRadius,
          railColor: getComputedStyle(nav).borderBottomColor,
          labels: [...nav.querySelectorAll('[data-tab-value]')].map((t) =>
            t.getAttribute('data-tab-value'),
          ),
        };
      }),
    ),
    null,
    2,
  ),
);
await browser.close();
