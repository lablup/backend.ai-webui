/**
 * Full-surface antd-vs-engine parity matrix (to-astryx ticket 34 hardening).
 *
 * Drives `/theme-probe/formmatrix.html`, which renders every census-backed
 * case twice from one props table. For each case this script measures BOTH
 * cells — geometry, colours, typography, DOM-role presence — and reports the
 * deltas. Runs in light and dark; a token that follows the theme must produce
 * matching deltas in both modes.
 *
 *   cd react && pnpm exec vite --config theme-probe/vite.config.mts &
 *   node .scratch/astryx-migration/probe-form-matrix.mjs
 */
import { chromium } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';

const BASE = process.env.PROBE_BASE ?? 'http://127.0.0.1:9198';
const URL_ = `${BASE}/theme-probe/formmatrix.html`;
const OUT = process.env.OUT_DIR ?? '.scratch/astryx-migration/shots/form-parity';
fs.mkdirSync(OUT, { recursive: true });

const round = (n) => (n === null || n === undefined ? null : Math.round(n * 10) / 10);

/** Runs in the page. Returns one record per case per impl. */
const extract = () => {
  const R = (n) => (n == null ? null : Math.round(n * 10) / 10);
  const cells = [...document.querySelectorAll('[data-case][data-impl]')];
  const out = {};

  const sel = (impl) =>
    impl === 'antd'
      ? {
          item: '.ant-form-item',
          row: '.ant-form-item-row',
          label: '.ant-form-item-label',
          labelEl: '.ant-form-item-label > label',
          control: '.ant-form-item-control',
          controlInput: '.ant-form-item-control-input',
          content: '.ant-form-item-control-input-content',
          explain: '.ant-form-item-explain',
          explainError: '.ant-form-item-explain-error',
          explainWarning: '.ant-form-item-explain-warning',
          extra: '.ant-form-item-extra',
          feedback: '.ant-form-item-feedback-icon',
        }
      : {
          item: '[data-bai-form-item]',
          row: '[data-bai-form-item-row]',
          label: '[data-bai-form-item-label-col]',
          labelEl: '[data-bai-form-item-label]',
          control: '[data-bai-form-item-control]',
          controlInput: '[data-bai-form-item-control-input]',
          content: '[data-bai-form-item-control-input-content]',
          explain: '[data-bai-form-item-explain]',
          explainError: '[data-bai-form-item-explain-error]',
          explainWarning: '[data-bai-form-item-explain-warning]',
          extra: '[data-bai-form-item-extra]',
          feedback: '[data-bai-form-item-feedback-icon]',
        };

  const box = (el, origin) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      w: R(r.width),
      h: R(r.height),
      x: origin ? R(r.left - origin.left) : R(r.left),
      y: origin ? R(r.top - origin.top) : R(r.top),
    };
  };

  const pseudoText = (el, which) => {
    if (!el) return null;
    const s = getComputedStyle(el, which);
    if (!s.content || s.content === 'none' || s.display === 'none') return null;
    if (s.visibility === 'hidden') return null;
    return { content: s.content, color: s.color, fontSize: s.fontSize };
  };

  for (const cell of cells) {
    const id = cell.dataset.case;
    const impl = cell.dataset.impl;
    const S = sel(impl);
    const cellRect = cell.getBoundingClientRect();
    const items = [...cell.querySelectorAll(S.item)]
      // A noStyle child renders no item in the engine and no `.ant-form-item`
      // in antd either, so this stays symmetric.
      .map((item) => {
        const origin = item.getBoundingClientRect();
        const labelEl = item.querySelector(S.labelEl);
        const labelCol = item.querySelector(S.label);
        const controlInput = item.querySelector(S.controlInput);
        const explain = item.querySelector(S.explain);
        const extra = item.querySelector(S.extra);
        const feedback = item.querySelector(S.feedback);
        const is = getComputedStyle(item);
        const ls = labelEl ? getComputedStyle(labelEl) : null;
        const errors = [...item.querySelectorAll(S.explainError)].map((n) => ({
          text: n.textContent.trim(),
          color: getComputedStyle(n).color,
          fontSize: getComputedStyle(n).fontSize,
          lineHeight: getComputedStyle(n).lineHeight,
        }));
        const warnings = [...item.querySelectorAll(S.explainWarning)].map((n) => ({
          text: n.textContent.trim(),
          color: getComputedStyle(n).color,
        }));
        const controls = [
          ...item.querySelectorAll(
            ':is(.ant-input, .ant-input-number, .ant-select, .ant-input-affix-wrapper)',
          ),
        ]
          .filter((n) => !n.closest('.ant-select') || n.classList.contains('ant-select'))
          .map((n) => {
            const target = n.classList.contains('ant-select')
              ? (n.querySelector('.ant-select-selector') ?? n)
              : n;
            const cs = getComputedStyle(target);
            return {
              tag: n.className.split(' ')[0],
              w: R(n.getBoundingClientRect().width),
              h: R(n.getBoundingClientRect().height),
              borderColor: cs.borderTopColor,
              disabled: !!n.querySelector('input:disabled, input[disabled]') ||
                n.matches('input:disabled') ||
                n.classList.contains('ant-select-disabled') ||
                n.classList.contains('ant-input-disabled') ||
                n.classList.contains('ant-input-number-disabled'),
            };
          });
        const itemRect = box(item, cellRect);
        return {
          // A `display:none` item has no box; its x/y is wherever the layout
          // engine parked the zero-size rect and means nothing. Compare the
          // fact that it is collapsed, not where.
          rect:
            itemRect && itemRect.w === 0 && itemRect.h === 0
              ? { w: 0, h: 0, x: null, y: null }
              : itemRect,
          display: is.display,
          marginBottom: is.marginBottom,
          label: {
            text: labelEl ? labelEl.textContent.trim() : null,
            box: box(labelEl, origin),
            colBox: box(labelCol, origin),
            color: ls?.color ?? null,
            fontSize: ls?.fontSize ?? null,
            fontWeight: ls?.fontWeight ?? null,
            height: ls?.height ?? null,
            textAlign: labelCol ? getComputedStyle(labelCol).textAlign : null,
            whiteSpace: labelCol ? getComputedStyle(labelCol).whiteSpace : null,
            before: pseudoText(labelEl, '::before'),
            after: pseudoText(labelEl, '::after'),
            title: labelEl?.getAttribute('title') ?? null,
          },
          controlInput: {
            box: box(controlInput, origin),
            minHeight: controlInput ? getComputedStyle(controlInput).minHeight : null,
          },
          explain: explain
            ? {
                box: box(explain, origin),
                color: getComputedStyle(explain).color,
                fontSize: getComputedStyle(explain).fontSize,
                text: explain.textContent.trim(),
                role: explain.getAttribute('role'),
              }
            : null,
          errors,
          warnings,
          extra: extra
            ? {
                box: box(extra, origin),
                color: getComputedStyle(extra).color,
                fontSize: getComputedStyle(extra).fontSize,
                minHeight: getComputedStyle(extra).minHeight,
                text: extra.textContent.trim(),
              }
            : null,
          feedback: feedback
            ? { color: getComputedStyle(feedback).color, box: box(feedback, origin) }
            : null,
          controls,
        };
      });
    out[`${id}::${impl}`] = {
      cellHeight: R(cellRect.height),
      itemCount: items.length,
      items,
    };
  }
  return out;
};

/** Structural diff of the two per-case records. */
const diffCase = (a, b, prefix = '') => {
  const deltas = [];
  const keys = new Set([...Object.keys(a ?? {}), ...Object.keys(b ?? {})]);
  for (const k of keys) {
    const av = a?.[k];
    const bv = b?.[k];
    const p = prefix ? `${prefix}.${k}` : k;
    if (av && bv && typeof av === 'object' && typeof bv === 'object') {
      deltas.push(...diffCase(av, bv, p));
    } else if (typeof av === 'number' && typeof bv === 'number') {
      if (Math.abs(av - bv) > 0.6) deltas.push({ path: p, antd: av, engine: bv });
    } else if (av !== bv) {
      deltas.push({ path: p, antd: av ?? null, engine: bv ?? null });
    }
  }
  return deltas;
};

const run = async () => {
  const browser = await chromium.launch();
  const report = { generatedAt: new Date().toISOString(), modes: {} };
  const pageErrors = [];
  for (const mode of ['light', 'dark']) {
    const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
    page.on('pageerror', (e) => pageErrors.push(`${mode}: ${e.message}`));
    await page.goto(`${URL_}?mode=${mode}`, { waitUntil: 'networkidle' });
    // antd renders the explain block through a CSSMotion; give both stacks
    // time to settle before measuring, or the antd column under-reports.
    await page.waitForTimeout(2500);
    const data = await page.evaluate(extract);
    const ids = await page.evaluate(() => window.__caseIds);
    const cases = {};
    for (const id of ids) {
      const antd = data[`${id}::antd`];
      const engine = data[`${id}::engine`];
      const deltas = diffCase(antd, engine);
      cases[id] = { deltas, antd, engine };
      const el = page.locator(`section:has([data-case="${id}"])`).first();
      if (mode === 'light' || deltas.length) {
        await el
          .screenshot({ path: path.join(OUT, `${mode}-${id}.png`) })
          .catch(() => {});
      }
    }
    report.modes[mode] = cases;
    await page.screenshot({
      path: path.join(OUT, `matrix-${mode}.png`),
      fullPage: true,
    });
    await page.close();
  }
  report.pageErrors = pageErrors;
  await browser.close();

  const outFile = path.join(OUT, 'matrix.json');
  fs.writeFileSync(outFile, JSON.stringify(report, null, 1));

  let total = 0;
  for (const mode of ['light', 'dark']) {
    console.log(`\n===== ${mode} =====`);
    for (const [id, c] of Object.entries(report.modes[mode])) {
      if (!c.deltas.length) {
        console.log(`  OK    ${id}`);
        continue;
      }
      total += c.deltas.length;
      console.log(`  DIFF  ${id}  (${c.deltas.length})`);
      for (const d of c.deltas.slice(0, 14)) {
        console.log(
          `          ${d.path}: antd=${JSON.stringify(d.antd)} engine=${JSON.stringify(d.engine)}`,
        );
      }
      if (c.deltas.length > 14) console.log(`          … ${c.deltas.length - 14} more`);
    }
  }
  console.log(`\npageErrors: ${pageErrors.length}`);
  console.log(`total deltas: ${total}`);
  console.log(`report: ${outFile}`);
};

run();
