/**
 * Ticket 35 — antd-stack vs engine-stack parity on `/theme-probe/form.html`.
 *
 * Screenshots both columns in light/dark × pristine/error × vertical/horizontal
 * and diffs what actually has to match: the rendered label/required/error/extra
 * TEXT, the item count, and the item geometry (height + control top offset).
 * Class names and DOM shape deliberately differ — that is the migration.
 */
import { chromium } from '@playwright/test';
import * as fs from 'node:fs';

const BASE = 'http://127.0.0.1:5981/theme-probe/form.html';
const OUT = '.scratch/astryx-migration/form-parity';
fs.mkdirSync(OUT, { recursive: true });

const extract = () => {
  const read = (root, sel) =>
    [...root.querySelectorAll(sel)].map((n) => n.textContent.trim());
  const col = (id) => {
    const root = document.getElementById(id);
    if (!root) return null;
    const antd = id === 'antd';
    const itemSel = antd ? '.ant-form-item' : '[data-bai-form-item]';
    const labelSel = antd ? '.ant-form-item-label label' : '[data-bai-form-item-label]';
    const errSel = antd
      ? '.ant-form-item-explain-error'
      : '[data-bai-form-item-explain-error]';
    const extraSel = antd ? '.ant-form-item-extra' : '[data-bai-form-item-extra]';
    // PAINTED asterisks, not class hooks. antd keeps `.ant-form-item-required`
    // on the label even under a function `requiredMark` and hides the glyph
    // with `::before { display: none }`; the engine simply renders nothing.
    // Counting the class would report a difference the user cannot see.
    const paintedAsterisks = () =>
      antd
        ? [...root.querySelectorAll('.ant-form-item-label label')].filter((l) => {
            const b = getComputedStyle(l, '::before');
            return b.content === '"*"' && b.display !== 'none';
          }).length
        : root.querySelectorAll('[data-bai-form-item-required]').length;
    const items = [...root.querySelectorAll(itemSel)].map((n) => {
      const r = n.getBoundingClientRect();
      const ctrl = n.querySelector(
        antd ? '.ant-form-item-control-input' : '[data-bai-form-item-control-input]',
      );
      return {
        h: Math.round(r.height),
        ctrlTop: ctrl ? Math.round(ctrl.getBoundingClientRect().top - r.top) : null,
      };
    });
    return {
      items: items.length,
      labels: read(root, labelSel),
      errors: read(root, errSel),
      extras: read(root, extraSel),
      required: paintedAsterisks(),
      result: root.querySelector('pre')?.textContent?.trim() ?? '',
      geometry: items,
      // Validation status as the user sees it on the CONTROL, not just in the
      // message text: antd colours the border from its own FormItemInputContext,
      // and the engine reproduces it from `data-status` via FormItemVisual.css.
      controlBorders: [
        ...root.querySelectorAll(
          antd
            ? '.ant-form-item-control-input-content > :is(.ant-input, .ant-input-number, .ant-select)'
            : '[data-bai-form-item-control-input-content] > :is(.ant-input, .ant-input-number, .ant-select)',
        ),
      ].map(
        (n) =>
          getComputedStyle(
            n.classList.contains('ant-select')
              ? (n.querySelector('.ant-select-selector') ?? n)
              : n,
          ).borderColor,
      ),
    };
  };
  return { antd: col('antd'), bai: col('bai') };
};

const cases = [];
for (const mode of ['light', 'dark'])
  for (const state of ['pristine', 'error'])
    for (const layout of ['vertical', 'horizontal'])
      cases.push({ mode, state, layout });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1400 } });
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(String(e)));
page.on('console', (m) => {
  if (m.type() === 'error') pageErrors.push('console: ' + m.text());
});

const report = [];
for (const c of cases) {
  const url = `${BASE}?mode=${c.mode}&state=${c.state}&layout=${c.layout}`;
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(c.state === 'error' ? 1200 : 500);
  const name = `${c.mode}-${c.state}-${c.layout}`;
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
  const data = await page.evaluate(extract);
  const norm = (s) => s.replace(/\s+/g, ' ').trim();
  const diffs = [];
  const a = data.antd;
  const b = data.bai;
  if (!a || !b) diffs.push('missing column');
  else {
    if (a.items !== b.items) diffs.push(`items ${a.items} vs ${b.items}`);
    const la = a.labels.map(norm).sort();
    const lb = b.labels.map(norm).sort();
    if (JSON.stringify(la) !== JSON.stringify(lb))
      diffs.push(`labels\n  antd=${JSON.stringify(la)}\n  bai =${JSON.stringify(lb)}`);
    const ea = a.errors.map(norm).sort();
    const eb = b.errors.map(norm).sort();
    if (JSON.stringify(ea) !== JSON.stringify(eb))
      diffs.push(`errors\n  antd=${JSON.stringify(ea)}\n  bai =${JSON.stringify(eb)}`);
    const xa = a.extras.map(norm).sort();
    const xb = b.extras.map(norm).sort();
    if (JSON.stringify(xa) !== JSON.stringify(xb))
      diffs.push(`extras antd=${JSON.stringify(xa)} bai=${JSON.stringify(xb)}`);
    if (a.required !== b.required)
      diffs.push(`required-markers ${a.required} vs ${b.required}`);
    if (JSON.stringify(a.controlBorders) !== JSON.stringify(b.controlBorders))
      diffs.push(
        `control borders\n  antd=${JSON.stringify(a.controlBorders)}\n  bai =${JSON.stringify(b.controlBorders)}`,
      );
    const geo = (g) => g.map((x) => `${x.h}/${x.ctrlTop}`).join(' ');
    if (geo(a.geometry) !== geo(b.geometry))
      diffs.push(
        `item geometry (height/controlTop)\n  antd=${geo(a.geometry)}\n  bai =${geo(b.geometry)}`,
      );
    const stripPre = (s) => s.replace(/\s+/g, ' ');
    if (stripPre(a.result) !== stripPre(b.result))
      diffs.push(`validate result\n  antd=${a.result}\n  bai =${b.result}`);
  }
  report.push({ case: name, diffs, antd: a, bai: b });
  console.log(
    `${name}: ${diffs.length ? 'DIFF' : 'MATCH'}  (items ${a?.items}/${b?.items}, errors ${a?.errors.length}/${b?.errors.length}, required ${a?.required}/${b?.required})`,
  );
  diffs.forEach((d) => console.log('   - ' + d));
}
fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
console.log('\npageErrors:', pageErrors.length ? pageErrors : 'none');
await browser.close();
