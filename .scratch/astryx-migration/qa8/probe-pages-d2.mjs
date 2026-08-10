/**
 * qa8 item D — in-page rAF recorder around the RBAC drawer's close.
 * Everything (the close click and the sampling) runs inside ONE evaluate so
 * the frame timeline is not distorted by CDP round-trips.
 */
import { BASE, ROOT, launch, settle } from './probe-pages-lib.mjs';
import fs from 'node:fs';

const { browser, page, pageErrors } = await launch();
const result = {};

await page.goto(`${BASE}admin/rbac`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(9000);
await settle(page, 8000);
await page.waitForTimeout(1500);

await page.locator('table tbody tr td').first().click();
await page.waitForTimeout(2500);
await settle(page, 6000);
result.urlAfterOpen = page.url();

result.timeline = await page.evaluate(
  () =>
    new Promise((resolve) => {
      // Hold a reference to the RBAC drawer: the ONE that is actually laid
      // out (the notification drawer is also a `.astryx-drawer` with a
      // `.bai-drawer-title`, but it is `display:none` / 0-width when closed).
      const target = [...document.querySelectorAll('.astryx-drawer')].find(
        (x) => x.querySelector('.bai-drawer-title') && x.getBoundingClientRect().width > 0,
      );
      if (!target) return resolve([{ error: 'RBAC drawer not found' }]);
      const snap = () => {
        const d = target;
        if (!d.isConnected) return { gone: true };
        const r = d.getBoundingClientRect();
        const c = getComputedStyle(d);
        const body = d.querySelector('.bai-drawer-body, .bai-drawer-body-flush');
        const extra = d.querySelector('.bai-drawer-extra');
        return {
          title: d.querySelector('.bai-drawer-title')?.textContent?.trim().slice(0, 48) ?? null,
          bodyLen: (body?.textContent ?? '').trim().length,
          bodyHead: (body?.textContent ?? '').trim().slice(0, 44),
          extraCount: extra ? extra.querySelectorAll('button').length : 0,
          x: +r.x.toFixed(1),
          w: +r.width.toFixed(1),
          opacity: c.opacity,
          display: c.display,
          transform: c.transform,
        };
      };
      const frames = [];
      const t0 = performance.now();
      const btn = target.querySelector('.bai-drawer-header button');
      frames.push({ t: 0, phase: 'pre-click', ...snap() });
      btn?.click();
      const tick = () => {
        const t = performance.now() - t0;
        frames.push({ t: +t.toFixed(1), ...snap() });
        if (t < 1200) requestAnimationFrame(tick);
        else resolve(frames);
      };
      requestAnimationFrame(tick);
    }),
);

await page.waitForTimeout(1500);
result.urlAfterClose = page.url();
result.pageErrors = pageErrors;
fs.writeFileSync(`${ROOT}/before-pages-d2.json`, JSON.stringify(result, null, 2));

// distinct-state digest
const seen = [];
let prev = '';
for (const f of result.timeline) {
  const k = JSON.stringify([f.gone, f.title, f.bodyLen, f.extraCount, f.x, f.opacity, f.display]);
  if (k !== prev) {
    seen.push(f);
    prev = k;
  }
}
console.log(JSON.stringify(seen, null, 1));
await browser.close();
