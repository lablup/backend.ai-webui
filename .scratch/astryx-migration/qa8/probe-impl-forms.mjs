/**
 * qa8 IMPL — Q-31 (Tokenizer separator split) + Q-32 (welded compact group).
 *
 * READ-ONLY: every dialog is opened, measured and dismissed with Escape. No
 * OK / Save / Create is ever clicked — this runs against a shared cluster.
 *
 *   (A) Admin > Users -> row Edit -> "Supplementary GID" Tokenizer.
 *       Type "10,20 30" at 120ms/key WITHOUT pressing Enter and count tokens.
 *       antd's `tokenSeparators={[',', ' ']}` committed on the keystroke.
 *   (B) Admin > Users -> Bulk Create Users -> the E-Mail prefix / suffix pair.
 *       Measure the two BORDERED field boxes (not the inner <input>): their
 *       rects, the gap/overlap between them, every corner radius, and the
 *       border widths at the joint. antd `Space.Compact` welded them:
 *       -1px margin, squared inner corners, one shared border line.
 *
 * Usage: TAG=before node .scratch/astryx-migration/qa8/probe-impl-forms.mjs
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE =
  process.env.BASE ?? 'https://to-astryx.backend-ai-webui.localhost:1357/';
const ROOT = process.env.ROOT ?? '.scratch/astryx-migration/qa8';
const TAG = process.env.TAG ?? 'before';
const ONLY = process.env.ONLY ?? '';

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

/** Dark mode ONLY via a real Playwright click on the header button. */
async function setMode(mode) {
  const want = mode === 'dark';
  const now = await page.evaluate(
    () => document.documentElement.dataset.theme ?? null,
  );
  if ((now === 'dark') !== want) {
    await page
      .getByRole('button', { name: /^(dark|light) mode$/i })
      .first()
      .click();
    await page.waitForTimeout(2000);
  }
  const applied = await page.evaluate(
    () => document.documentElement.dataset.theme ?? null,
  );
  if (applied !== mode) throw new Error(`theme toggle did not take: ${applied}`);
  return applied;
}

async function settle() {
  for (let i = 0; i < 40; i++) {
    const ok = await page.evaluate(
      () => document.querySelectorAll('table tbody tr').length > 0,
    );
    if (ok) return true;
    await page.waitForTimeout(500);
  }
  return false;
}

const dialog = () => page.locator('dialog[open], [role="dialog"]').last();

async function closeDialog() {
  for (let i = 0; i < 4; i++) {
    if ((await page.locator('dialog[open], [role="dialog"]').count()) === 0)
      return;
    await page.keyboard.press('Escape');
    await page.waitForTimeout(700);
  }
}

const result = { pageErrors };

async function run(mode) {
  const m = (result[mode] = {});
  await page.goto(`${BASE}admin/users`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  m.appliedTheme = await setMode(mode);
  m.settled = await settle();
  await page.waitForTimeout(1200);

  /* ---------- (A) Edit user -> Supplementary GID tokenizer -------------- */
  if (!ONLY || ONLY.includes('A')) {
    try {
      // The row action strip renders Edit as a direct icon button.
      await page
        .locator('tbody tr')
        .first()
        .locator('button[aria-label="Edit"]')
        .first()
        .click();
      await page.waitForTimeout(2500);

      const tok = dialog().locator('.astryx-tokenizer').last();
      await tok.scrollIntoViewIfNeeded();
      const input = tok.locator('input:not([type=hidden])').first();
      await input.click();
      const readTokens = () =>
        tok.evaluate((el) => ({
          tokenTexts: [...el.querySelectorAll('.astryx-token')].map((t) =>
            t.textContent?.trim(),
          ),
          inputValue:
            el.querySelector('input:not([type=hidden])')?.value ?? null,
        }));

      m.gidBefore = await readTokens();
      await input.pressSequentially('10,20 30', { delay: 120 });
      await page.waitForTimeout(1200);
      m.gidAfterTypingNoEnter = await readTokens();
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
      m.gidAfterEnter = await readTokens();
      // Second shape: a single value then a comma — antd committed on the ','.
      await input.pressSequentially('41,', { delay: 120 });
      await page.waitForTimeout(1000);
      m.gidAfterCommaOnly = await readTokens();
      // Third shape: trailing SPACE separator only.
      await input.pressSequentially('52 ', { delay: 120 });
      await page.waitForTimeout(1000);
      m.gidAfterSpaceOnly = await readTokens();
      await page.screenshot({
        path: `${ROOT}/${TAG}-q31-gid-${mode}.png`,
      });
    } catch (e) {
      m.gidError = String(e).slice(0, 400);
    }
    await closeDialog();
    await page.waitForTimeout(800);
  }

  /* ---------- (B) Bulk Create Users -> welded prefix/suffix -------------- */
  if (!ONLY || ONLY.includes('B')) {
    try {
      // Two aria-label="More" buttons exist; the notification-drawer one is
      // disabled, the table toolbar's overflow trigger is not.
      await page
        .locator('button[aria-label="More"]:not([disabled])')
        .last()
        .click();
      await page.waitForTimeout(900);
      await page
        .locator('[role="menuitem"]', { hasText: /^Bulk Create Users$/ })
        .first()
        .click();
      await page.waitForTimeout(2500);

      m.compact = await page.evaluate(() => {
        const dlg = [
          ...document.querySelectorAll('dialog[open], [role="dialog"]'),
        ].pop();
        if (!dlg) return null;
        const items = [...dlg.querySelectorAll('[data-bai-form-item]')];
        const pre = items.find((i) => /prefix/i.test(i.textContent ?? ''));
        const suf = items.find((i) => /suffix/i.test(i.textContent ?? ''));
        if (!pre || !suf) return null;
        /** Walk up from the <input> to the first ancestor that paints a border. */
        const borderBox = (item) => {
          let n = item.querySelector('input:not([type=hidden])');
          while (n && n !== item) {
            const cs = getComputedStyle(n);
            if (parseFloat(cs.borderTopWidth) > 0) return n;
            n = n.parentElement;
          }
          return null;
        };
        const describe = (n) => {
          if (!n) return null;
          const r = n.getBoundingClientRect();
          const cs = getComputedStyle(n);
          return {
            cls: n.getAttribute('class'),
            x: +r.x.toFixed(1),
            right: +r.right.toFixed(1),
            y: +r.y.toFixed(1),
            w: +r.width.toFixed(1),
            h: +r.height.toFixed(1),
            radiusTL: cs.borderTopLeftRadius,
            radiusTR: cs.borderTopRightRadius,
            radiusBR: cs.borderBottomRightRadius,
            radiusBL: cs.borderBottomLeftRadius,
            borderLeft: cs.borderLeftWidth,
            borderRight: cs.borderRightWidth,
            borderColor: cs.borderTopColor,
            marginLeft: cs.marginLeft,
            marginRight: cs.marginRight,
            zIndex: cs.zIndex,
          };
        };
        const a = borderBox(pre);
        const b = borderBox(suf);
        const parent = pre.parentElement;
        const pcs = getComputedStyle(parent);
        return {
          parentTag: parent.tagName,
          parentClass: parent.getAttribute('class'),
          parentGap: pcs.gap,
          parentDisplay: pcs.display,
          itemGapPx: +(
            suf.getBoundingClientRect().x -
            pre.getBoundingClientRect().right
          ).toFixed(1),
          prefixBox: describe(a),
          suffixBox: describe(b),
          /** >0 = a visible gap, 0 = touching (double border), <0 = welded overlap */
          boxGapPx:
            a && b
              ? +(
                  b.getBoundingClientRect().x - a.getBoundingClientRect().right
                ).toFixed(1)
              : null,
          borderWidthVar: getComputedStyle(document.documentElement)
            .getPropertyValue('--border-width')
            .trim(),
          radiusElementVar: getComputedStyle(document.documentElement)
            .getPropertyValue('--radius-element')
            .trim(),
        };
      });

      // Focus the prefix field and re-read z-index / border colour so the
      // focused-neighbour rule is measured too.
      try {
        const preInput = dialog()
          .locator('[data-bai-form-item]')
          .filter({ hasText: /prefix/i })
          .locator('input:not([type=hidden])')
          .first();
        await preInput.click();
        await page.waitForTimeout(400);
        m.compactFocused = await page.evaluate(() => {
          const dlg = [
            ...document.querySelectorAll('dialog[open], [role="dialog"]'),
          ].pop();
          const items = [...dlg.querySelectorAll('[data-bai-form-item]')];
          const pick = (re) => items.find((i) => re.test(i.textContent ?? ''));
          const borderBox = (item) => {
            let n = item?.querySelector('input:not([type=hidden])');
            while (n && n !== item) {
              const cs = getComputedStyle(n);
              if (parseFloat(cs.borderTopWidth) > 0) return n;
              n = n.parentElement;
            }
            return null;
          };
          const read = (n) =>
            n
              ? {
                  zIndex: getComputedStyle(n).zIndex,
                  borderColor: getComputedStyle(n).borderTopColor,
                  position: getComputedStyle(n).position,
                }
              : null;
          return {
            prefix: read(borderBox(pick(/prefix/i))),
            suffix: read(borderBox(pick(/suffix/i))),
          };
        });
      } catch (e) {
        m.compactFocusedError = String(e).slice(0, 200);
      }

      await dialog()
        .locator('[data-bai-form-item]')
        .filter({ hasText: /prefix/i })
        .first()
        .screenshot({ path: `${ROOT}/${TAG}-q32-prefix-${mode}.png` })
        .catch(() => {});
      await page.screenshot({
        path: `${ROOT}/${TAG}-q32-bulk-${mode}.png`,
      });
    } catch (e) {
      m.compactError = String(e).slice(0, 400);
    }
    await closeDialog();
    await page.waitForTimeout(800);
  }
}

for (const mode of ['light', 'dark']) {
  await run(mode);
}

result.pageErrors = pageErrors;
fs.writeFileSync(
  `${ROOT}/${TAG}-impl-forms.json`,
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result, null, 2));
await browser.close();
