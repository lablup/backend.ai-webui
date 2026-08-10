/**
 * qa8 — Admin > Users, item (B): E-Mail column default width vs the width its
 * content (email text + BAINameActionCell action buttons) actually needs.
 *
 * Measures, in BOTH modes at 1600x1000:
 *   - every <th> key + rendered width (the table's default distribution)
 *   - the first body row's E-Mail cell: wrapper clientWidth vs scrollWidth,
 *     the title area's clientWidth vs scrollWidth, and the action-button strip
 *     width, so "how much wider does it need to be" is a number, not a feel.
 *
 * Usage: node .scratch/astryx-migration/qa8/probe-adminusers-table.mjs
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
page.setDefaultTimeout(30000);
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(e.message));

/**
 * Dark mode is entered through the HEADER BUTTON. An in-page `element.click()`
 * from `page.evaluate` does NOT flip the Astryx button — only a real Playwright
 * click does (probe-adminusers-darkcheck.mjs).
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
    await page.waitForTimeout(2200);
  }
  const applied = await page.evaluate(
    () => document.documentElement.dataset.theme ?? null,
  );
  if (applied !== mode) throw new Error(`theme toggle did not take: ${applied}`);
  return applied;
}

async function settle() {
  for (let i = 0; i < 40; i++) {
    const ready = await page.evaluate(() => {
      const rows = document.querySelectorAll('table tbody tr');
      const skel = document.querySelectorAll(
        '[class*="skeleton" i], [class*="Skeleton"]',
      );
      return rows.length > 0 && skel.length === 0;
    });
    if (ready) return true;
    await page.waitForTimeout(500);
  }
  return false;
}

const result = {};

for (const mode of ['light', 'dark']) {
  await page.goto(`${BASE}admin/users`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  const applied = await setMode(mode);
  const settled = await settle();
  await page.waitForTimeout(1500);
  const m = (result[mode] = { appliedTheme: applied, settled });

  m.table = await page.evaluate(() => {
    const table = document.querySelector('table');
    if (!table) return null;
    const ths = [...table.querySelectorAll('thead th')];
    const cols = ths.map((th) => {
      const r = th.getBoundingClientRect();
      return {
        key: th.getAttribute('data-column-key') ?? th.getAttribute('data-key'),
        label: th.textContent?.trim().slice(0, 28),
        w: +r.width.toFixed(1),
      };
    });
    const tr = table.querySelector('tbody tr');
    const td = tr?.querySelectorAll('td');
    const tableRect = table.getBoundingClientRect();
    const wrapper = table.closest('[class*="table"], div');
    return {
      tableWidth: +tableRect.width.toFixed(1),
      containerWidth: wrapper
        ? +wrapper.getBoundingClientRect().width.toFixed(1)
        : null,
      colgroupWidths: [...table.querySelectorAll('colgroup col')].map(
        (c) => c.style.width || null,
      ),
      columns: cols,
      firstRowCellWidths: td
        ? [...td].map((c) => +c.getBoundingClientRect().width.toFixed(1))
        : null,
    };
  });

  // The E-Mail cell is the BAINameActionCell wrapper. Measure the space the
  // email text wants (scrollWidth of the ellipsised title) and the fixed cost
  // of the always-on action strip.
  m.emailCell = await page.evaluate(() => {
    const wrap = document.querySelector('tbody tr .bai-nac-wrapper');
    if (!wrap) return null;
    const title = wrap.querySelector('.bai-nac-title-area');
    const actionEls = [...wrap.children].filter((c) => c !== title);
    const cs = getComputedStyle(wrap);
    const buttons = [...wrap.querySelectorAll('button')].map((b) => ({
      label: b.getAttribute('aria-label') || b.title || b.textContent?.trim(),
      w: +b.getBoundingClientRect().width.toFixed(1),
      visible: b.getBoundingClientRect().width > 0,
    }));
    const td = wrap.closest('td');
    // Widest email string currently rendered, measured with the cell's font.
    const canvas = document.createElement('canvas');
    const cctx = canvas.getContext('2d');
    cctx.font = `${cs.fontSize} ${cs.fontFamily}`;
    const emails = [...document.querySelectorAll('tbody tr .bai-nac-title-area')]
      .map((t) => t.textContent?.trim() ?? '')
      .filter(Boolean);
    const widest = emails.reduce(
      (acc, e) => {
        const w = cctx.measureText(e).width;
        return w > acc.w ? { text: e, w } : acc;
      },
      { text: '', w: 0 },
    );
    return {
      tdWidth: td ? +td.getBoundingClientRect().width.toFixed(1) : null,
      tdPaddingInline: td
        ? getComputedStyle(td).paddingLeft +
          ' / ' +
          getComputedStyle(td).paddingRight
        : null,
      wrapperClientWidth: wrap.clientWidth,
      wrapperScrollWidth: wrap.scrollWidth,
      titleClientWidth: title?.clientWidth ?? null,
      titleScrollWidth: title?.scrollWidth ?? null,
      actionStripWidth: actionEls.reduce(
        (a, e) => a + e.getBoundingClientRect().width,
        0,
      ),
      actionStripCount: actionEls.length,
      buttons,
      gap: cs.gap,
      fontSize: cs.fontSize,
      widestEmailPx: +widest.w.toFixed(1),
      widestEmail: widest.text,
      renderedEmails: emails.length,
    };
  });

  // How much does the whole cell need? title(scroll) + actions + gap + td pad.
  if (m.emailCell) {
    const c = m.emailCell;
    m.emailCell.neededContentPx = +(
      c.widestEmailPx +
      c.actionStripWidth +
      (parseFloat(c.gap) || 0)
    ).toFixed(1);
    m.emailCell.shortfallPx = +(
      m.emailCell.neededContentPx - c.wrapperClientWidth
    ).toFixed(1);
  }

  await page.screenshot({
    path: `${ROOT}/${TAG}-adminusers-table-${mode}.png`,
    fullPage: false,
  });
}

result.pageErrors = pageErrors;
fs.writeFileSync(
  `${ROOT}/${TAG}-adminusers-table.json`,
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result, null, 2));
await browser.close();
