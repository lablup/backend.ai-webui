/**
 * qa8 modal group — closes out items (A) and (E) on `/admin/settings`.
 *
 * The two dialogs there are the only ones in the app whose `title` is JSX
 * carrying a tooltip trigger (`OverlayNetworkSettingModal.tsx:54-61`,
 * `SchedulerSettingModal.tsx:44-52`), and they use BUI's
 * `BAIQuestionIconWithTooltip` — the `<Text>`-span variant, NOT the
 * `<button>`-based `…Astryx` one the folder-create dialog uses. If the
 * "tooltip anchored at the viewport corner" symptom belongs to a wrapper
 * shape, this is where it shows.
 *
 * Measures per dialog and mode: the header <h2> type metrics, every footer
 * button's label metrics, and each in-dialog tooltip's layer position vs its
 * trigger.
 *
 * Usage: node .scratch/astryx-migration/qa8/probe-modal-settings-dialogs.mjs
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE =
  process.env.BASE ?? 'https://to-astryx.backend-ai-webui.localhost:1357/';
const ROOT = process.env.ROOT ?? '.scratch/astryx-migration/qa8';
const TAG = process.env.TAG ?? 'before';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  ignoreHTTPSErrors: true,
  storageState: `${ROOT}/state.json`,
});
const page = await ctx.newPage();
page.setDefaultNavigationTimeout(180000);
page.setDefaultTimeout(20000);
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(e.message));

async function setMode(mode) {
  await page.evaluate((m) => {
    const want = m === 'dark';
    if ((document.documentElement.dataset.theme === 'dark') === want) return;
    const b = Array.from(document.querySelectorAll('button')).find((x) =>
      /dark|theme|mode/i.test(x.getAttribute('aria-label') || x.title || ''),
    );
    if (b) b.click();
  }, mode);
  await page.waitForTimeout(2000);
  const applied = await page.evaluate(
    () => document.documentElement.dataset.theme ?? null,
  );
  if (applied !== mode) throw new Error(`theme toggle did not take: ${applied}`);
  return applied;
}

const measureType = () =>
  page.evaluate(() => {
    const dlg = document.querySelector('dialog[open]');
    if (!dlg) return { error: 'no open dialog' };
    const px = (s) => (s ? +parseFloat(s).toFixed(2) : null);
    const h2 = dlg.querySelector('h2');
    const hs = h2 ? getComputedStyle(h2) : null;
    // The <h2> may wrap a whole JSX row; measure the first TEXT node's own
    // computed style too, since that is what the eye reads as "the title".
    const firstTextEl =
      h2 && h2.firstElementChild ? h2.firstElementChild : h2;
    const fs2 = firstTextEl ? getComputedStyle(firstTextEl) : null;
    const buttons = [...dlg.querySelectorAll('button')]
      .filter((b) => (b.textContent ?? '').trim().length > 0)
      .map((b) => {
        const c = getComputedStyle(b);
        return {
          label: b.textContent.trim().slice(0, 24),
          fontSize: px(c.fontSize),
          fontWeight: c.fontWeight,
          height: +b.getBoundingClientRect().height.toFixed(1),
        };
      });
    return {
      dialogWidth: +dlg.getBoundingClientRect().width.toFixed(1),
      h2: hs
        ? {
            fontSize: px(hs.fontSize),
            lineHeight: hs.lineHeight,
            fontWeight: hs.fontWeight,
          }
        : null,
      h2FirstChild: fs2
        ? {
            tag: firstTextEl.tagName.toLowerCase(),
            fontSize: px(fs2.fontSize),
            fontWeight: fs2.fontWeight,
          }
        : null,
      buttons,
    };
  });

const openTooltipInfo = () =>
  page.evaluate(() => {
    const tip = [...document.querySelectorAll('[role="tooltip"]')].find((t) => {
      try {
        return t.matches(':popover-open');
      } catch {
        return false;
      }
    });
    if (!tip) return null;
    const r = tip.getBoundingClientRect();
    const c = getComputedStyle(tip);
    return {
      text: tip.textContent?.trim().slice(0, 40),
      rect: { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) },
      positionAnchor: c.getPropertyValue('position-anchor').trim(),
      positionArea: c.getPropertyValue('position-area').trim(),
      insideDialog: !!tip.closest('dialog'),
      atViewportOrigin: r.x < 4 && r.y < 4,
    };
  });

async function sweepTooltips() {
  const triggers = page.locator(
    'dialog[open] [style*="anchor-name"], dialog[open] svg.lucide-circle-question-mark, dialog[open] svg.lucide-circle-alert',
  );
  const n = await triggers.count();
  const rows = [];
  for (let i = 0; i < Math.min(n, 10); i++) {
    try {
      const box = await triggers.nth(i).boundingBox();
      await triggers.nth(i).hover({ timeout: 4000 });
      await page.waitForTimeout(800);
      const tip = await openTooltipInfo();
      rows.push({
        i,
        anchorRect: box
          ? { x: +box.x.toFixed(1), y: +box.y.toFixed(1), w: +box.width.toFixed(1), h: +box.height.toFixed(1) }
          : null,
        tip,
        centreDeltaX:
          tip && box
            ? +(tip.rect.x + tip.rect.w / 2 - (box.x + box.width / 2)).toFixed(1)
            : null,
      });
      await page.mouse.move(2, 2);
      await page.waitForTimeout(250);
    } catch (e) {
      rows.push({ i, error: String(e).split('\n')[0] });
    }
  }
  return { triggerCount: n, rows };
}

const result = { viewport: { w: 1600, h: 1000 } };

for (const mode of ['light', 'dark']) {
  const bucket = (result[mode] = {});
  await page.goto(`${BASE}admin/settings`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(12000);
  bucket.appliedTheme = await setMode(mode);

  const configButtons = page.getByRole('button', { name: /^config$/i });
  const count = await configButtons.count();
  for (let i = 0; i < count; i++) {
    const name = i === 0 ? 'overlay-network' : 'scheduler';
    try {
      await configButtons.nth(i).click();
      await page.waitForTimeout(1800);
      bucket[name] = await measureType();
      bucket[`${name}-tooltips`] = await sweepTooltips();
      await page.keyboard.press('Escape');
      await page.waitForTimeout(800);
    } catch (e) {
      bucket[name] = { error: String(e).split('\n')[0] };
      await page.keyboard.press('Escape').catch(() => {});
      await page.waitForTimeout(600);
    }
  }
}

result.pageErrors = pageErrors;
fs.writeFileSync(
  `${ROOT}/${TAG}-modal-settings-dialogs.json`,
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result, null, 2));
await browser.close();
