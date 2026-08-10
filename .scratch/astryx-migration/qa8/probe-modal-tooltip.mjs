/**
 * qa8 modal group — item (E) "Create a new storage folder 의 auto mount
 * tooltip 의 anchor 가 화면 좌상단에 있음".
 *
 * The tooltip is `BAIQuestionIconWithTooltip`
 * (`packages/backend.ai-ui/src/components/BAIQuestionIconWithTooltip.tsx`)
 * mounted in the AutoMount radio row's `endContent`
 * (`react/src/components/FolderCreateModalV2.tsx:465-471`).
 *
 * Astryx positions every layer with CSS ANCHOR POSITIONING + the Popover API
 * (`Layer/useLayer.tsx`): `anchor-name` is written on the trigger as an inline
 * style, the panel gets `position-anchor` + `position-area`. `useLayer`'s own
 * comment records the failure mode — "an invalid position-area computes to
 * `none`, which pins the popover to the viewport corner because styles.base
 * zeroes the UA margins" (`Layer/useLayer.tsx:290-300`).
 *
 * This probe measures, for a tooltip OUTSIDE a dialog (control) and the same
 * component INSIDE one:
 *   - the anchor element's rect and its inline `anchor-name`
 *   - the popover's rect, `position-anchor`, `position-area`, `inset`, `margin`
 *   - the delta between the popover and its anchor
 *
 * Usage: node .scratch/astryx-migration/qa8/probe-modal-tooltip.mjs
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

/** Reads the open tooltip layer and the element it claims to be anchored to. */
const measureTooltip = () =>
  page.evaluate(() => {
    const tip = [...document.querySelectorAll('[role="tooltip"]')].find((t) =>
      t.matches(':popover-open'),
    );
    if (!tip) return { error: 'no open [role=tooltip]' };
    const tr = tip.getBoundingClientRect();
    const tc = getComputedStyle(tip);
    const anchorName =
      tc.getPropertyValue('position-anchor').trim() ||
      tc.getPropertyValue('anchor-name').trim();

    // Find the element carrying that anchor-name in its inline style.
    let anchorEl = null;
    if (anchorName) {
      anchorEl =
        [...document.querySelectorAll('[style*="anchor-name"]')].find((el) =>
          (el.style.anchorName ?? '').includes(anchorName),
        ) ?? null;
    }
    const ar = anchorEl?.getBoundingClientRect();
    const ac = anchorEl ? getComputedStyle(anchorEl) : null;

    return {
      tooltip: {
        text: tip.textContent?.trim().slice(0, 50),
        rect: {
          x: +tr.x.toFixed(1),
          y: +tr.y.toFixed(1),
          w: +tr.width.toFixed(1),
          h: +tr.height.toFixed(1),
        },
        position: tc.position,
        positionAnchor: tc.getPropertyValue('position-anchor').trim(),
        positionArea: tc.getPropertyValue('position-area').trim(),
        positionTryFallbacks: tc
          .getPropertyValue('position-try-fallbacks')
          .trim(),
        inset: `${tc.top} ${tc.right} ${tc.bottom} ${tc.left}`,
        margin: `${tc.marginTop} ${tc.marginRight} ${tc.marginBottom} ${tc.marginLeft}`,
        insideDialog: !!tip.closest('dialog'),
        popoverOpen: tip.matches(':popover-open'),
      },
      anchor: anchorEl
        ? {
            tag: anchorEl.tagName.toLowerCase(),
            anchorNameInline: anchorEl.style.anchorName,
            display: ac.display,
            rect: {
              x: +ar.x.toFixed(1),
              y: +ar.y.toFixed(1),
              w: +ar.width.toFixed(1),
              h: +ar.height.toFixed(1),
            },
            insideDialog: !!anchorEl.closest('dialog'),
          }
        : { error: 'anchor element with that anchor-name not found' },
      delta: anchorEl
        ? {
            dx: +(tr.x - ar.x).toFixed(1),
            dy: +(tr.y - ar.y).toFixed(1),
          }
        : null,
      // "pinned to the viewport corner" test
      atViewportOrigin: tr.x < 4 && tr.y < 4,
    };
  });

const result = { viewport: { w: 1600, h: 1000 } };

for (const mode of ['light', 'dark']) {
  const bucket = (result[mode] = {});

  // ---------------------------------------------------- control: NOT in a dialog
  await page.goto(`${BASE}data`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(12000);
  bucket.appliedTheme = await setMode(mode);

  try {
    // Any question-mark tooltip that lives on the page itself.
    const pageTip = page
      .locator('button:has(svg.lucide-circle-question-mark)')
      .first();
    if (await pageTip.count()) {
      await pageTip.hover();
      await page.waitForTimeout(900);
      bucket.controlPageTooltip = await measureTooltip();
      await page.mouse.move(5, 5);
      await page.waitForTimeout(400);
    } else {
      // fall back: the sider collapse toggle carries a Tooltip
      await page
        .locator('button[aria-label*="ollapse" i], button[aria-label*="ider" i]')
        .first()
        .hover();
      await page.waitForTimeout(900);
      bucket.controlPageTooltip = await measureTooltip();
      await page.mouse.move(5, 5);
      await page.waitForTimeout(400);
    }
  } catch (e) {
    bucket.controlPageTooltip = { error: String(e).split('\n')[0] };
  }

  // ---------------------------------------------------- in-dialog tooltip
  try {
    await page.getByRole('button', { name: /create folder/i }).first().click();
    await page.waitForTimeout(2500);
    bucket.dialogOpen = await page.locator('dialog[open]').count();

    const icon = page
      .locator('dialog[open] button:has(svg.lucide-circle-question-mark)')
      .first();
    bucket.iconCount = await icon.count();
    await icon.hover();
    await page.waitForTimeout(1200);
    bucket.inDialogTooltip = await measureTooltip();
    await page.screenshot({
      path: `${ROOT}/${TAG}-tooltip-in-dialog-${mode}.png`,
    });
  } catch (e) {
    bucket.inDialogTooltip = { error: String(e).split('\n')[0] };
    await page.screenshot({
      path: `${ROOT}/${TAG}-tooltip-in-dialog-${mode}-ERR.png`,
    });
  }

  await page.keyboard.press('Escape');
  await page.waitForTimeout(800);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
}

result.pageErrors = pageErrors;
fs.writeFileSync(
  `${ROOT}/${TAG}-modal-tooltip.json`,
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result, null, 2));
await browser.close();
