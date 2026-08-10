/** qa8 recon — what the probed surfaces actually look like in the DOM. */
import { BASE, ROOT, launch, setMode, settle } from './probe-pages-lib.mjs';
import fs from 'node:fs';

const { browser, page, pageErrors } = await launch();
const out = {};

// --- landing / start page ------------------------------------------------
await page.goto(`${BASE}start`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(9000);
await settle(page);
out.url = page.url();
out.theme = await page.evaluate(() => document.documentElement.dataset.theme);
out.banner = await page.evaluate(() => {
  const b = document.querySelector('.astryx-banner, [class*="banner"]');
  if (!b) return null;
  const walk = (el, d = 0) =>
    d > 4
      ? []
      : [
          {
            tag: el.tagName.toLowerCase(),
            cls: el.className?.toString?.().slice(0, 120),
            rect: (() => {
              const r = el.getBoundingClientRect();
              return [
                +r.x.toFixed(1),
                +r.y.toFixed(1),
                +r.width.toFixed(1),
                +r.height.toFixed(1),
              ];
            })(),
            txt: (el.textContent ?? '').trim().slice(0, 40),
          },
          ...[...el.children].flatMap((c) => walk(c, d + 1)),
        ];
  return walk(b);
});
out.headerButtons = await page.evaluate(() =>
  [...document.querySelectorAll('[data-testid="webui-header"] button')].map(
    (b) => ({
      testid: b.getAttribute('data-testid'),
      label: b.getAttribute('aria-label') ?? b.title,
      cls: b.className?.toString?.().slice(0, 90),
    }),
  ),
);
await page.screenshot({ path: `${ROOT}/recon-start-light.png` });

out.pageErrors = pageErrors;
fs.writeFileSync(`${ROOT}/recon.json`, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
await browser.close();
