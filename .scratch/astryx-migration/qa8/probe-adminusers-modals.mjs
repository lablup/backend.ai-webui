/**
 * qa8 — Admin > Users overlays. READ-ONLY: modals are opened, measured and
 * dismissed with Escape. No OK / Delete / Save is ever clicked.
 *
 *   (A) Edit user  -> Supplementary GID Tokenizer: does typing "10,20 30"
 *       split into tokens WITHOUT Enter? (antd tokenSeparators split on input)
 *   (C) Bulk Create Users -> gap between the E-Mail prefix and suffix fields
 *   (D) Bulk Create Users -> the space under "Number of users"
 *   (E) Permanently Delete Users -> what renders below the confirm input
 *
 * Usage: node .scratch/astryx-migration/qa8/probe-adminusers-modals.mjs
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

/**
 * Dark mode is entered through the HEADER BUTTON. NOTE: an in-page
 * `element.click()` from `page.evaluate` does NOT flip the Astryx button —
 * only a real Playwright click does. Verified with probe-adminusers-darkcheck.mjs.
 */
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
  for (let i = 0; i < 3; i++) {
    if ((await page.locator('dialog[open], [role="dialog"]').count()) === 0)
      return;
    await page.keyboard.press('Escape');
    await page.waitForTimeout(700);
  }
}

/** Geometry of every `[data-bai-form-item]` in the open dialog, in DOM order. */
const formItemGeometry = () =>
  page.evaluate(() => {
    const dlg = [...document.querySelectorAll('dialog[open], [role="dialog"]')]
      .pop();
    if (!dlg) return null;
    const items = [...dlg.querySelectorAll('[data-bai-form-item]')];
    return items.map((el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const label = el.querySelector('[data-bai-form-item-label]');
      const extra = el.querySelector('[data-bai-form-item-extra]');
      const control = el.querySelector('[data-bai-form-item-control-input]');
      const additional = el.querySelector('[data-bai-form-item-additional]');
      const offset = el.querySelector('[data-bai-form-item-margin-offset]');
      const g = (n) => {
        if (!n) return null;
        const rr = n.getBoundingClientRect();
        return {
          x: +rr.x.toFixed(1),
          y: +rr.y.toFixed(1),
          w: +rr.width.toFixed(1),
          h: +rr.height.toFixed(1),
        };
      };
      return {
        name: el.getAttribute('data-name') ?? null,
        label: label?.textContent?.trim().slice(0, 40) ?? null,
        rect: g(el),
        marginBottom: cs.marginBottom,
        control: g(control),
        additional: g(additional),
        extra: g(extra),
        extraMinHeight: extra ? getComputedStyle(extra).minHeight : null,
        extraText: extra?.textContent?.trim().slice(0, 60) ?? null,
        marginOffset: offset ? getComputedStyle(offset).marginBottom : null,
      };
    });
  });

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
      // The E-Mail cell's action strip collapsed to [Detail] [More actions];
      // Edit lives in the overflow menu.
      await page
        .locator('tbody tr')
        .first()
        .locator('button[aria-label*="More" i], button[title*="More" i]')
        .first()
        .click();
      await page.waitForTimeout(800);
      await page.getByRole('menuitem', { name: /^edit$/i }).first().click();
      await page.waitForTimeout(2500);

      const tok = dialog().locator('.astryx-tokenizer').last();
      await tok.scrollIntoViewIfNeeded();
      const input = tok.locator('input').first();
      await input.click();
      const readTokens = () =>
        tok.evaluate((el) => ({
          tokenTexts: [...el.querySelectorAll('.astryx-token')].map((t) =>
            t.textContent?.trim(),
          ),
          inputValue: el.querySelector('input')?.value ?? null,
        }));

      m.gidBefore = await readTokens();
      await input.pressSequentially('10,20 30', { delay: 120 });
      await page.waitForTimeout(900);
      m.gidAfterTypingNoEnter = await readTokens();
      await page.keyboard.press('Enter');
      await page.waitForTimeout(900);
      m.gidAfterEnter = await readTokens();
      // Second shape: type a single value then a comma, antd committed on ','
      await input.pressSequentially('41,', { delay: 120 });
      await page.waitForTimeout(800);
      m.gidAfterCommaOnly = await readTokens();
      m.gidLabel = await dialog()
        .locator('[data-bai-form-item]')
        .filter({ hasText: /Supplementary/i })
        .first()
        .evaluate((el) => el.textContent?.trim().slice(0, 160))
        .catch(() => null);
      await page.screenshot({ path: `${ROOT}/${TAG}-adminusers-gid-${mode}.png` });
    } catch (e) {
      m.gidError = String(e).slice(0, 300);
    }
    await closeDialog();
    await page.waitForTimeout(800);
  }

  /* ---------- (C)(D) Bulk Create Users ---------------------------------- */
  if (!ONLY || ONLY.includes('C')) {
    try {
      // The ButtonGroup overflow trigger is aria-label="More" EXACTLY; every
      // table row also has an aria-label="More actions" button.
      await page.locator('button[aria-label="More"]').last().click();
      await page.waitForTimeout(900);
      await page
        .locator('[role="menuitem"]', { hasText: /^Bulk Create Users$/ })
        .first()
        .click();
      await page.waitForTimeout(2500);

      m.bulkItems = await formItemGeometry();
      m.bulkRow = await page.evaluate(() => {
        const dlg = [
          ...document.querySelectorAll('dialog[open], [role="dialog"]'),
        ].pop();
        if (!dlg) return null;
        const items = [...dlg.querySelectorAll('[data-bai-form-item]')];
        const pre = items.find((i) =>
          /prefix/i.test(i.textContent ?? ''),
        );
        const suf = items.find((i) =>
          /suffix/i.test(i.textContent ?? ''),
        );
        if (!pre || !suf) return null;
        const pr = pre.getBoundingClientRect();
        const sr = suf.getBoundingClientRect();
        const parent = pre.parentElement;
        const pcs = getComputedStyle(parent);
        const preIn = pre.querySelector('input');
        const sufIn = suf.querySelector('input');
        const pir = preIn?.getBoundingClientRect();
        const sir = sufIn?.getBoundingClientRect();
        return {
          parentTag: parent.tagName,
          parentClass: parent.getAttribute('class'),
          parentGap: pcs.gap,
          parentDisplay: pcs.display,
          itemGapPx: +(sr.x - (pr.x + pr.width)).toFixed(1),
          inputGapPx:
            pir && sir ? +(sir.x - (pir.x + pir.width)).toFixed(1) : null,
          prefixInput: pir
            ? {
                x: +pir.x.toFixed(1),
                w: +pir.width.toFixed(1),
                radius: getComputedStyle(preIn.parentElement).borderRadius,
              }
            : null,
          suffixInput: sir
            ? {
                x: +sir.x.toFixed(1),
                w: +sir.width.toFixed(1),
                radius: getComputedStyle(sufIn.parentElement).borderRadius,
              }
            : null,
        };
      });

      // (D) the space under Number of users, expressed as the vertical gap
      // between the control box bottom and the NEXT item's top.
      m.bulkVerticalGaps = await page.evaluate(() => {
        const dlg = [
          ...document.querySelectorAll('dialog[open], [role="dialog"]'),
        ].pop();
        const items = [...dlg.querySelectorAll('[data-bai-form-item]')];
        const out = [];
        for (let i = 0; i < items.length; i++) {
          const el = items[i];
          const ctrl = el.querySelector('[data-bai-form-item-control-input]');
          const next = items[i + 1];
          if (!ctrl) continue;
          const cb = ctrl.getBoundingClientRect().bottom;
          out.push({
            label:
              el.querySelector('[data-bai-form-item-label]')?.textContent?.trim() ??
              null,
            controlBottomToItemBottom: +(
              el.getBoundingClientRect().bottom - cb
            ).toFixed(1),
            controlBottomToNextLabelTop: next
              ? +(next.getBoundingClientRect().top - cb).toFixed(1)
              : null,
          });
        }
        return out;
      });
      await page.screenshot({
        path: `${ROOT}/${TAG}-adminusers-bulk-${mode}.png`,
      });
    } catch (e) {
      m.bulkError = String(e).slice(0, 300);
    }
    await closeDialog();
    await page.waitForTimeout(800);
  }

  /* ---------- (E) Permanently Delete Users ------------------------------ */
  if (!ONLY || ONLY.includes('E')) {
    try {
      // Purge is offered only for INACTIVE users; flip the status segmented
      // control first (read-only: it is a URL query filter).
      await page
        .getByRole('radio', { name: /inactive/i })
        .first()
        .click()
        .catch(async () => {
          await page.getByText(/^Inactive$/).first().click();
        });
      await page.waitForTimeout(3000);
      await page
        .locator('tbody tr')
        .first()
        .locator('button[aria-label*="More" i], button[title*="More" i]')
        .first()
        .click();
      await page.waitForTimeout(800);
      await page
        .getByRole('menuitem', { name: /permanently delete/i })
        .first()
        .click();
      await page.waitForTimeout(2000);

      m.purge = await page.evaluate(() => {
        const dlg = [
          ...document.querySelectorAll('dialog[open], [role="dialog"]'),
        ].pop();
        if (!dlg) return null;
        const rect = (n) => {
          if (!n) return null;
          const r = n.getBoundingClientRect();
          return {
            x: +r.x.toFixed(1),
            y: +r.y.toFixed(1),
            w: +r.width.toFixed(1),
            h: +r.height.toFixed(1),
          };
        };
        const input = dlg.querySelector('input[name="confirmText"], input');
        const banner = dlg.querySelector(
          '.astryx-banner, [class*="banner" i], [role="alert"]',
        );
        const code = dlg.querySelector(
          '.astryx-text[data-type="code"], [data-type="code"]',
        );
        // DOM order of the dialog body's direct children
        const body = input?.closest('dialog, [role="dialog"]');
        const order = [...dlg.querySelectorAll('*')]
          .filter(
            (n) =>
              n === input ||
              n === banner ||
              n === code ||
              n.matches?.('.astryx-checkbox-input, [class*="checkbox" i]'),
          )
          .map((n) => ({
            what:
              n === input
                ? 'confirm-input'
                : n === banner
                  ? 'banner'
                  : n === code
                    ? 'code-echo'
                    : 'checkbox',
            y: +n.getBoundingClientRect().y.toFixed(1),
          }));
        return {
          title: dlg.querySelector('h1,h2,h3,[class*="title" i]')?.textContent
            ?.trim()
            .slice(0, 80),
          text: dlg.textContent?.replace(/\s+/g, ' ').trim().slice(0, 400),
          input: rect(input),
          banner: banner
            ? {
                ...rect(banner),
                text: banner.textContent?.trim().slice(0, 80),
                bg: getComputedStyle(banner).backgroundColor,
                color: getComputedStyle(banner).color,
                border: getComputedStyle(banner).border,
                cls: banner.getAttribute('class'),
              }
            : null,
          codeEcho: code
            ? {
                ...rect(code),
                text: code.textContent?.trim().slice(0, 60),
                color: getComputedStyle(code).color,
                fontFamily: getComputedStyle(code).fontFamily,
              }
            : null,
          domOrder: order,
          colorErrorVar: getComputedStyle(document.documentElement)
            .getPropertyValue('--color-error')
            .trim(),
          colorErrorTextVar: getComputedStyle(document.documentElement)
            .getPropertyValue('--color-text-error')
            .trim(),
        };
      });
      await page.screenshot({
        path: `${ROOT}/${TAG}-adminusers-purge-${mode}.png`,
      });
    } catch (e) {
      m.purgeError = String(e).slice(0, 300);
    }
    await closeDialog();
  }
}

for (const mode of ['light', 'dark']) {
  await run(mode);
}

result.pageErrors = pageErrors;
fs.writeFileSync(
  `${ROOT}/${TAG}-adminusers-modals.json`,
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result, null, 2));
await browser.close();
