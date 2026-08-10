/**
 * qa8 BATCH-3 Q-37/Q-38 — final confirmation AFTER the `src/index.ts` import
 * reorder (the sorter moved `actionAccent.css` ahead of `backend.ai-ui.css`).
 * Guards the "probing a stale bundle" trap: re-measures the served output.
 */
import { launch, setMode, settle, BASE, ROOT } from './probe-b3-accent-lib.mjs';
import fs from 'node:fs';

const { browser, page, pageErrors } = await launch();
const out = {};

for (const mode of ['light', 'dark']) {
  const rec = (out[mode] = {});
  await page.goto(`${BASE}admin/environment`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(9000);
  await settle(page);
  await setMode(page, mode);
  await page.waitForTimeout(1500);
  await page
    .locator('.bai-action-accent')
    .first()
    .waitFor({ timeout: 30000 })
    .catch((e) => (rec.waitErr = e.message.slice(0, 60)));
  rec.env = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.bai-action-accent'))
      .slice(0, 4)
      .map((b) => ({
        label: b.getAttribute('aria-label'),
        color: getComputedStyle(b).color,
      })),
  );
  await page.screenshot({
    path: `${ROOT}/../shots/q37-accent/after2-env-${mode}.png`,
    clip: { x: 950, y: 240, width: 620, height: 320 },
  });
}

out.pageErrors = pageErrors;
fs.writeFileSync(
  `${ROOT}/b3-accent-confirm.json`,
  JSON.stringify(out, null, 2) + '\n',
);
console.log(JSON.stringify(out, null, 2));
await browser.close();
