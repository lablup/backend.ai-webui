// POLISH-3 item 1 — the notification stack's actions now live in the Banner's
// `endContent`. Drives the same harness ticket 29 used.
//   cd react && pnpm exec vite --config theme-probe/vite.config.mts --port 5745
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';

const OUT = new URL('./shots/polish-3/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const TAG = process.env.TAG ?? 'after';
const BASE =
  process.env.NOTIF_URL ??
  'http://127.0.0.1:5745/theme-probe/notification29.html';

const browser = await chromium.launch();
const errors = [];
const result = {};
const TASK = 'bgtask:clone-my-training-data';

const drive = (page, fn, ...args) =>
  page.evaluate(
    ([name, rest]) => window.__notification29[name](...rest),
    [fn, args],
  );

for (const mode of ['light', 'dark']) {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 860 },
    colorScheme: mode,
  });
  page.on('pageerror', (e) => errors.push(`[${mode}] ${e.message}`));
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__notification29 !== undefined);

  await drive(page, 'start');
  await page.waitForTimeout(500);
  await drive(page, 'progress', 70);
  await page.waitForTimeout(500);

  result[mode] = await page.evaluate((task) => {
    const r = (el) => {
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return {
        x: +b.x.toFixed(2),
        y: +b.y.toFixed(2),
        w: +b.width.toFixed(2),
        h: +b.height.toFixed(2),
      };
    };
    const item = document.querySelector(`[data-notification-key="${task}"]`);
    if (!item) return null;
    const banner = item.querySelector('.astryx-banner');
    const buttons = [...item.querySelectorAll('button')].map((b) => ({
      label: (b.textContent || b.getAttribute('aria-label') || '').trim(),
      ...r(b),
    }));
    const title = item.querySelector('[data-testid="notification-title"]');
    const progress = item.querySelector('[role="progressbar"]');
    return {
      notice: r(item),
      banner: r(banner),
      title: { text: (title?.textContent || '').trim(), ...r(title) },
      titleLines: title
        ? Math.round(
            title.getBoundingClientRect().height /
              parseFloat(getComputedStyle(title).lineHeight || '20'),
          )
        : null,
      progress: r(progress),
      buttons,
    };
  }, TASK);

  await page.screenshot({ path: `${OUT}${TAG}-notification-${mode}.png` });
  await page.close();
}

result.pageerrors = errors;
writeFileSync(
  `${OUT}${TAG}-notification.json`,
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result, null, 2));
await browser.close();
