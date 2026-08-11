/**
 * qa8 item C — quantify the "bunched toward the centre" complaint on the
 * /data "Create Folder" modal (FolderCreateModalV2): where does each label's
 * TEXT actually start inside its 33.3% label column?
 */
import { BASE, ROOT, launch, setMode, settle } from './probe-pages-lib.mjs';
import fs from 'node:fs';

const { browser, page, pageErrors } = await launch();
const result = {};

await page.goto(`${BASE}data`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(9000);
await settle(page, 8000);
await setMode(page, 'light');
await settle(page, 3000);

await page.getByRole('button', { name: /^create folder$/i }).first().click();
await page.waitForTimeout(3500);
await settle(page, 8000);
await page.waitForTimeout(1200);

result.modal = await page.evaluate(() => {
  const dlg = document.querySelector('dialog[open]') ?? document.querySelector('.astryx-dialog');
  const form = document.querySelector('[data-bai-form]');
  const d = dlg?.getBoundingClientRect();
  const f = form?.getBoundingClientRect();
  const items = [...document.querySelectorAll('[data-bai-form-item]')]
    .map((it) => {
      const col = it.querySelector('[data-bai-form-item-label-col]');
      const lab = it.querySelector('[data-bai-form-item-label]');
      const ctl = it.querySelector('[data-bai-form-item-control]');
      if (!col || !lab) return null;
      const cr = col.getBoundingClientRect();
      const lr = lab.getBoundingClientRect();
      const tr = ctl?.getBoundingClientRect();
      return {
        text: lab.textContent?.trim().slice(0, 24),
        labelColX: +cr.x.toFixed(1),
        labelColW: +cr.width.toFixed(1),
        labelTextX: +lr.x.toFixed(1),
        labelTextW: +lr.width.toFixed(1),
        deadSpaceLeftOfLabel: +(lr.x - cr.x).toFixed(1),
        controlX: tr ? +tr.x.toFixed(1) : null,
        controlW: tr ? +tr.width.toFixed(1) : null,
        textAlign: getComputedStyle(col).textAlign,
        dataAlign: col.getAttribute('data-align'),
        colPadLeft: getComputedStyle(col).paddingLeft,
        ctlPadRight: ctl ? getComputedStyle(ctl).paddingRight : null,
      };
    })
    .filter(Boolean);
  return {
    dialog: d ? { x: +d.x.toFixed(1), w: +d.width.toFixed(1) } : null,
    form: f ? { x: +f.x.toFixed(1), w: +f.width.toFixed(1) } : null,
    formClassName: form?.className ?? '',
    labelColSpanPct: items[0] ? +((items[0].labelColW / (f?.width ?? 1)) * 100).toFixed(1) : null,
    items,
  };
});

result.pageErrors = pageErrors;
fs.writeFileSync(`${ROOT}/before-pages-c.json`, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
await browser.close();
