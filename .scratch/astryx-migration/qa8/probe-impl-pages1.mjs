/**
 * qa8 IMPLEMENTATION probe 1 — fixes Q-25 (start-page announcement Banner
 * alignment) and Q-26 (FolderCreateModalV2 label alignment).
 *
 * Run with PHASE=before|after; writes ${ROOT}/${PHASE}-impl-pages1.json.
 */
import { BASE, ROOT, launch, setMode, settle } from './probe-pages-lib.mjs';
import fs from 'node:fs';

const PHASE = process.env.PHASE ?? 'before';
const { browser, page, pageErrors } = await launch();
const result = { phase: PHASE };

/** Q-25 — the Banner header row: is the end area top-aligned with content? */
const bannerGeometry = () =>
  page.evaluate(() => {
    const root = document.querySelector('.astryx-banner');
    if (!root) return null;
    const box = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        x: +r.x.toFixed(1),
        y: +r.y.toFixed(1),
        w: +r.width.toFixed(1),
        h: +r.height.toFixed(1),
        cy: +(r.y + r.height / 2).toFixed(1),
      };
    };
    const header = root;
    const kids = [...header.children];
    const icon = root.querySelector('.astryx-banner-icon');
    const content = root.querySelector('.astryx-banner-content') ?? kids[1];
    const end = kids[kids.length - 1];
    const cs = getComputedStyle(header);
    const contentKids = content ? [...content.children] : [];
    return {
      headerAlignItems: cs.alignItems,
      root: box(root),
      icon: box(icon),
      content: box(content),
      end: box(end),
      endLabels: end
        ? [...end.querySelectorAll('button')].map(
            (b) => b.getAttribute('aria-label') || b.textContent?.trim(),
          )
        : [],
      // slot occupancy: which of title / description carries the markdown
      contentSlots: contentKids.map((k) => ({
        ...box(k),
        fontSize: getComputedStyle(k).fontSize,
        color: getComputedStyle(k).color,
        len: (k.textContent ?? '').trim().length,
        head: (k.textContent ?? '').trim().slice(0, 40),
      })),
      // the number the finding is about
      endOffsetBelowContentTop: end && content ? +(end.y ?? 0) : null,
    };
  });

/** Q-26 — label column geometry + the dead space its text leaves behind. */
const labelGeometry = () =>
  page.evaluate(() => {
    const form = document.querySelector('[data-bai-form]');
    if (!form) return null;
    const fr = form.getBoundingClientRect();
    const items = [];
    for (const it of form.querySelectorAll('[data-bai-form-item]')) {
      const lab = it.querySelector('[data-bai-form-item-label-col]');
      const inner = it.querySelector('[data-bai-form-item-label]');
      const ctl =
        it.querySelector('[data-bai-form-item-control-col]') ??
        it.querySelector('[data-bai-form-item-control]');
      if (!lab || !ctl) continue;
      const lr = lab.getBoundingClientRect();
      const cr = ctl.getBoundingClientRect();
      // the INK box of the label text, not the block box
      let textRect = null;
      if (inner) {
        const range = document.createRange();
        range.selectNodeContents(inner);
        const rr = range.getBoundingClientRect();
        if (rr.width > 0) textRect = rr;
      }
      items.push({
        label: (inner?.textContent ?? '').trim().slice(0, 32),
        labelColPct: +((lr.width / fr.width) * 100).toFixed(1),
        labelColX: +lr.x.toFixed(1),
        labelColW: +lr.width.toFixed(1),
        dataAlign: lab.getAttribute('data-align'),
        textAlign: getComputedStyle(lab).textAlign,
        controlColX: +cr.x.toFixed(1),
        textX: textRect ? +textRect.x.toFixed(1) : null,
        textRight: textRect ? +textRect.right.toFixed(1) : null,
        // dead space LEFT of the text (what `text-align: end` creates)
        gapBeforeText: textRect ? +(textRect.x - lr.x).toFixed(1) : null,
        // dead space between the text and the control column
        gapAfterText: textRect ? +(cr.x - textRect.right).toFixed(1) : null,
      });
    }
    return {
      formW: +fr.width.toFixed(1),
      items,
    };
  });

// ================= Q-25: /start announcement banner ======================
await page.goto(`${BASE}start`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(9000);
await settle(page);

result.banner = {};
for (const mode of ['light', 'dark']) {
  result.banner[mode] = { appliedTheme: await setMode(page, mode) };
  await settle(page, 3000);
  result.banner[mode].geometry = await bannerGeometry();
  await page
    .locator('.astryx-banner')
    .first()
    .screenshot({ path: `${ROOT}/${PHASE}-q25-banner-${mode}.png` })
    .catch(() => {});
}
await setMode(page, 'light');

// ================= Q-26: /data create-folder modal =======================
await page.goto(`${BASE}data`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(9000);
await settle(page, 8000);

result.createFolder = {};
const createFolderBtn = page
  .getByRole('button', { name: /^create folder$/i })
  .first();
await createFolderBtn.waitFor({ state: 'visible', timeout: 60000 }).catch(() => {});
result.createFolder.triggerFound = await createFolderBtn.count();
result.createFolder.url = page.url();
if (result.createFolder.triggerFound) {
  await createFolderBtn.click();
  await page.waitForTimeout(3500);
  await settle(page, 6000);
  await page.waitForTimeout(1000);
  result.createFolder.light = await labelGeometry();
  await page
    .locator('dialog[open]')
    .first()
    .screenshot({ path: `${ROOT}/${PHASE}-q26-createfolder-light.png` })
    .catch(() => {});
  await setMode(page, 'dark');
  await page.waitForTimeout(1200);
  result.createFolder.dark = await labelGeometry();
  await page
    .locator('dialog[open]')
    .first()
    .screenshot({ path: `${ROOT}/${PHASE}-q26-createfolder-dark.png` })
    .catch(() => {});
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);
}

result.pageErrors = pageErrors;
fs.writeFileSync(
  `${ROOT}/${PHASE}-impl-pages1.json`,
  JSON.stringify(result, null, 2),
);
console.log(`written ${PHASE}-impl-pages1.json`);
await browser.close();
