/**
 * qa8 modal group — item (B) "/admin/settings 페이지의 모든 모달 크기가 지나치게 크네요".
 *
 * The page has exactly two dialogs, both opened by a `Config` button:
 * Overlay Network Settings and Scheduler Settings. Both call sites pass
 * `width={'auto'}` (see `OverlayNetworkSettingModal.tsx:65`,
 * `SchedulerSettingModal.tsx:55`). This probe measures the resulting box and
 * — the point of the probe — the CONTENT's own intrinsic width, so the gap
 * between "what the dialog is" and "what the dialog needs" is a number.
 *
 * Usage: node .scratch/astryx-migration/qa8/probe-modal-width.mjs
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

const measure = () =>
  page.evaluate(() => {
    const dlg = document.querySelector('dialog[open]');
    if (!dlg) return { error: 'no open dialog' };
    const r = dlg.getBoundingClientRect();
    const c = getComputedStyle(dlg);

    // What the box WOULD be at fit-content — measured by temporarily
    // swapping the width, reading, then restoring. Read-only w.r.t. the app.
    const before = dlg.style.width;
    dlg.style.setProperty('width', 'fit-content', 'important');
    const fit = dlg.getBoundingClientRect().width;
    dlg.style.setProperty('width', 'max-content', 'important');
    const maxc = dlg.getBoundingClientRect().width;
    if (before) dlg.style.width = before;
    else dlg.style.removeProperty('width');

    const h2 = dlg.querySelector('h2');
    return {
      w: +r.width.toFixed(1),
      h: +r.height.toFixed(1),
      left: +r.left.toFixed(1),
      computedWidth: c.width,
      maxWidth: c.maxWidth,
      insetInlineStart: c.insetInlineStart,
      insetInlineEnd: c.insetInlineEnd,
      margin: `${c.marginLeft} / ${c.marginRight}`,
      // The declared value the stylex class carries (what `Dialog.width` emitted)
      declaredWidth: [...document.styleSheets]
        .flatMap((s) => {
          try {
            return [...s.cssRules];
          } catch {
            return [];
          }
        })
        .filter(
          (rule) =>
            rule.selectorText &&
            [...dlg.classList].some((cl) =>
              rule.selectorText.includes(`.${cl}`),
            ) &&
            rule.style?.width,
        )
        .map((rule) => `${rule.selectorText} { width: ${rule.style.width} }`)
        .slice(0, 4),
      fitContentWidth: +fit.toFixed(1),
      maxContentWidth: +maxc.toFixed(1),
      title: h2?.textContent?.trim().slice(0, 40) ?? null,
    };
  });

const result = { viewport: { w: 1600, h: 1000 } };

for (const mode of ['light', 'dark']) {
  const bucket = (result[mode] = {});
  await page.goto(`${BASE}admin/settings`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(12000);
  bucket.appliedTheme = await setMode(mode);

  const configButtons = page.getByRole('button', { name: /^config$/i });
  bucket.configButtonCount = await configButtons.count();

  for (let i = 0; i < (await configButtons.count()); i++) {
    try {
      await configButtons.nth(i).click();
      await page.waitForTimeout(1500);
      const m = await measure();
      bucket[`dialog${i}`] = m;
      await page
        .locator('dialog[open]')
        .first()
        .screenshot({ path: `${ROOT}/${TAG}-settings-dlg${i}-${mode}.png` })
        .catch(() => {});
      await page.keyboard.press('Escape');
      await page.waitForTimeout(700);
      if (await page.locator('dialog[open]').count()) {
        await page
          .locator('dialog[open] button[aria-label*="lose" i]')
          .first()
          .click()
          .catch(() => {});
        await page.waitForTimeout(600);
      }
    } catch (e) {
      bucket[`dialog${i}`] = { error: String(e).split('\n')[0] };
    }
  }
  await page.screenshot({ path: `${ROOT}/${TAG}-settings-page-${mode}.png` });
}

result.pageErrors = pageErrors;
fs.writeFileSync(
  `${ROOT}/${TAG}-modal-width.json`,
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result, null, 2));
await browser.close();
