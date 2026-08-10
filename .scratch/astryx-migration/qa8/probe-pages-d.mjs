/**
 * qa8 item D — the RBAC detail drawer's content resets to an empty
 * "Role Detail Info" shell while it animates closed.
 * Samples title + body length every ~45ms across the exit.
 */
import { BASE, ROOT, launch, setMode, settle } from './probe-pages-lib.mjs';
import fs from 'node:fs';

const { browser, page, pageErrors } = await launch();
const result = {};

await page.goto(`${BASE}admin/rbac`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(9000);
await settle(page, 8000);
await page.waitForTimeout(1500);

/** The RBAC drawer is the ONE `.astryx-drawer` that has a bai-drawer header. */
const drawerState = () =>
  page.evaluate(() => {
    const all = [...document.querySelectorAll('.astryx-drawer')];
    const d =
      all.find((x) => x.querySelector('.bai-drawer-title') && x.getBoundingClientRect().width > 0) ??
      all.find((x) => x.querySelector('.bai-drawer-title'));
    if (!d) return { present: false, drawerCount: all.length };
    const r = d.getBoundingClientRect();
    const c = getComputedStyle(d);
    const title = d.querySelector('.bai-drawer-title');
    const body = d.querySelector('.bai-drawer-body, .bai-drawer-body-flush');
    const extra = d.querySelector('.bai-drawer-extra');
    return {
      present: true,
      rect: { x: +r.x.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) },
      transform: c.transform,
      opacity: c.opacity,
      visibility: c.visibility,
      display: c.display,
      title: title?.textContent?.trim().slice(0, 60) ?? null,
      extraButtons: extra
        ? [...extra.querySelectorAll('button')].map(
            (b) => b.getAttribute('aria-label') ?? b.textContent?.trim().slice(0, 20),
          )
        : [],
      bodyLen: (body?.textContent ?? '').trim().length,
      bodyHead: (body?.textContent ?? '').trim().slice(0, 60),
      hasSkeleton: !!body?.querySelector('[class*="skeleton"]'),
    };
  });

result.beforeOpen = await drawerState();
// open the drawer: click the first role's NAME cell
await page.locator('table tbody tr td').first().click();
await page.waitForTimeout(2500);
await settle(page, 6000);
result.urlAfterOpen = page.url();
result.opened = await drawerState();
await page.screenshot({ path: `${ROOT}/before-d-open.png` });

// close and sample the exit
const samples = [];
const t0 = Date.now();
const sampler = (async () => {
  while (Date.now() - t0 < 1500) {
    samples.push({ t: Date.now() - t0, ...(await drawerState()) });
  }
})();
await page.waitForTimeout(60);
await page
  .locator('.bai-drawer-header button')
  .first()
  .click()
  .catch(() => page.keyboard.press('Escape'));
// grab a mid-animation screenshot
await page.waitForTimeout(140);
await page.screenshot({ path: `${ROOT}/before-d-closing-140ms.png` });
await page.waitForTimeout(120);
await page.screenshot({ path: `${ROOT}/before-d-closing-260ms.png` });
await sampler;
result.exitSamples = samples;
await page.waitForTimeout(1500);
result.afterClose = await drawerState();
result.urlAfterClose = page.url();

result.pageErrors = pageErrors;
fs.writeFileSync(`${ROOT}/before-pages-d.json`, JSON.stringify(result, null, 2));
console.log('written');
await browser.close();
