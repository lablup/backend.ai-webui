// Ticket 05 verification: BAIFormItem (own visual layer over `Form.Item
// noStyle` engine) vs antd Form.Item baseline, on the representative
// AutoScalingRule form (react/theme-probe/form.html).
//
// Run from repo root:
//   node .scratch/astryx-migration/shots/measure-05-form-item.mjs
//
// Auto-starts the theme-probe Vite server on 127.0.0.1:9198 when it is not
// already up (and stops it again if it started it).
//
// Checks (probe set = answers/08 + spike .spike/shoot.mjs):
//   A. 7 behaviour probes, antd vs BAI records must be deep-equal:
//      1 validateFields reject shape   2 dependencies re-validation
//      3 Form.List nested path get/set 4 preserve:false unmount
//      5 async validator               6 setFields server-error injection
//      7 isFieldsTouched / resetFields
//   B. DOM: BAI column renders zero Form.Item-originated .ant-form-* DOM;
//      rendered error texts identical to antd's.
//   C. Screenshot equivalence: per-form-item label/error geometry within
//      tolerance + pixel diff of the two <form> regions.
//   D. antd-CSS-removed render: with every .ant-* style stripped, the BAI
//      column keeps label color, red required markers, red error texts and
//      vertical rhythm (the antd column collapses — that is the point).
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const BASE = 'http://127.0.0.1:9198/theme-probe/form.html';
const OUT = process.env.SHOT_DIR ?? '.scratch/astryx-migration/shots/05';
fs.mkdirSync(OUT, { recursive: true });

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

// ---------------------------------------------------------------- server
const isUp = async () => {
  try {
    const r = await fetch(BASE, { signal: AbortSignal.timeout(1500) });
    return r.ok;
  } catch {
    return false;
  }
};
let server = null;
if (!(await isUp())) {
  server = spawn(
    'pnpm',
    ['exec', 'vite', '--config', 'theme-probe/vite.config.mts'],
    { cwd: path.resolve('react'), stdio: 'ignore', detached: true },
  );
  const deadline = Date.now() + 60000;
  while (!(await isUp())) {
    if (Date.now() > deadline) throw new Error('theme-probe server timeout');
    await new Promise((r) => setTimeout(r, 500));
  }
  console.log('started theme-probe vite server (pid', server.pid + ')');
}

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1500, height: 1500 },
  colorScheme: 'light',
});
const logs = [];
page.on('console', (m) => logs.push(`[${m.type()}] ${m.text()}`));
page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));

// ------------------------------------------------- A. 7 behaviour probes
await page.goto(BASE + '?variant=both', { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);

const behaviour = await page.evaluate(async () => {
  const out = {};
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  for (const id of ['antd', 'bai']) {
    const form = window['form_' + id];
    const rec = {};
    // 1. reject shape
    form.setFieldsValue({ minThreshold: 10, maxThreshold: 5 });
    try {
      await form.validateFields();
      rec.rejectShape = 'RESOLVED (unexpected)';
    } catch (info) {
      rec.rejectShape = {
        keys: Object.keys(info).sort(),
        errorFields: info.errorFields?.map((f) => ({
          name: f.name,
          errors: f.errors,
        })),
        hasValues: 'values' in info,
        outOfDate: info.outOfDate,
        isError: info instanceof Error,
      };
    }
    // 2. cross-field revalidation via dependencies
    form.setFieldsValue({ minThreshold: 1, maxThreshold: 5 });
    await wait(60);
    rec.maxErrorsAfterFix = form.getFieldError('maxThreshold');
    // 3. nested Form.List path get/set
    rec.listBefore = form.getFieldValue('tags');
    form.setFieldValue(['tags', 0, 'value'], 'staging');
    rec.listAfter = form.getFieldValue(['tags', 0, 'value']);
    // 4. preserve:false — unmount a conditional field
    form.setFieldsValue({ enabled: false });
    await wait(120);
    rec.cooldownAfterUnmount = form.getFieldValue('cooldown');
    rec.valuesKeysAfterUnmount = Object.keys(form.getFieldsValue()).sort();
    // 5. async validator
    form.setFieldValue('ruleName', 'reserved-x');
    try {
      await form.validateFields(['ruleName']);
      rec.asyncValidator = 'RESOLVED (unexpected)';
    } catch (info) {
      rec.asyncValidator = info.errorFields?.map((f) => f.errors);
    }
    // 6. setFields injects server-side error
    form.setFields([{ name: 'metricName', errors: ['taken on server'] }]);
    rec.setFieldsError = form.getFieldError('metricName');
    // 7. isFieldsTouched / resetFields
    rec.touchedBeforeReset = form.isFieldsTouched();
    form.resetFields();
    await wait(60);
    rec.touchedAfterReset = form.isFieldsTouched();
    rec.valuesAfterReset = form.getFieldsValue();
    rec.errorsAfterReset = form.getFieldError('metricName');
    out[id] = rec;
  }
  return out;
});

const PROBES = [
  ['rejectShape', '1. validateFields reject shape'],
  ['maxErrorsAfterFix', '2. dependencies cross-field revalidation'],
  ['listAfter', '3. Form.List nested path get/set'],
  ['valuesKeysAfterUnmount', '4. preserve:false unmount drops values'],
  ['asyncValidator', '5. async validator rejection'],
  ['setFieldsError', '6. setFields server-error injection'],
  ['valuesAfterReset', '7. isFieldsTouched / resetFields'],
];
// companion keys folded into their numbered probe for the equality check
const COMPANIONS = {
  listAfter: ['listBefore'],
  valuesKeysAfterUnmount: ['cooldownAfterUnmount'],
  valuesAfterReset: ['touchedBeforeReset', 'touchedAfterReset', 'errorsAfterReset'],
};
for (const [key, label] of PROBES) {
  const keys = [key, ...(COMPANIONS[key] ?? [])];
  const a = JSON.stringify(keys.map((k) => behaviour.antd[k]));
  const b = JSON.stringify(keys.map((k) => behaviour.bai[k]));
  check(`behaviour ${label} equivalent`, a === b, a === b ? '' : `antd=${a} bai=${b}`);
}

// ----------------------------------------------------- B. DOM inventory
await page.goto(BASE + '?variant=both&state=error', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
const dom = await page.evaluate(() => {
  const inv = (sel) => {
    const root = document.querySelector(sel);
    const classes = new Set();
    root.querySelectorAll('*').forEach((el) => {
      el.classList.forEach((c) => {
        if (c.startsWith('ant-form')) classes.add(c);
      });
    });
    return {
      antFormClasses: [...classes].sort(),
      errorTexts: [
        ...root.querySelectorAll(
          '[data-bai-form-item-explain-error], .ant-form-item-explain-error',
        ),
      ].map((e) => e.textContent),
    };
  };
  return { antd: inv('#antd'), bai: inv('#bai') };
});
check(
  'BAI column renders no Form.Item-originated .ant-form-* DOM',
  dom.bai.antFormClasses.every((c) =>
    ['ant-form', 'ant-form-css-var', 'ant-form-vertical'].includes(c),
  ),
  `bai classes=${JSON.stringify(dom.bai.antFormClasses)}`,
);
check(
  'rendered error texts identical (antd vs BAI)',
  dom.antd.errorTexts.length > 0 &&
    JSON.stringify(dom.antd.errorTexts) === JSON.stringify(dom.bai.errorTexts),
  `${dom.antd.errorTexts.length} errors`,
);

// -------------------------------------- C. screenshot equivalence (both states)
const freeze = () =>
  page.addStyleTag({
    content:
      '*, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; }',
  });

const geometry = () =>
  page.evaluate(() => {
    const grab = (colSel, labelSel, errSel, isBai) => {
      const col = document.querySelector(colSel);
      const base = col.getBoundingClientRect();
      const rel = (el) => {
        const r = el.getBoundingClientRect();
        // BAI renders the required marker/tooltip as real DOM (antd uses a
        // ::before pseudo, invisible to textContent) — read the plain label
        // span so texts compare like-for-like.
        const labelSpan = isBai
          ? el.querySelector(
              ':scope > span:not([data-bai-form-item-required]):not([data-bai-form-item-tooltip])',
            )
          : null;
        return {
          y: Math.round(r.y - base.y),
          h: Math.round(r.height),
          text: (labelSpan ?? el).textContent?.trim(),
        };
      };
      return {
        labels: [...col.querySelectorAll(labelSel)].map(rel),
        errors: [...col.querySelectorAll(errSel)].map((el) => ({
          ...rel(el),
          color: getComputedStyle(el).color,
        })),
        formHeight: Math.round(
          col.querySelector('form').getBoundingClientRect().height,
        ),
      };
    };
    return {
      antd: grab(
        '#antd',
        '.ant-form-item-label label',
        '.ant-form-item-explain-error',
      ),
      bai: grab(
        '#bai',
        '[data-bai-form-item-label]',
        '[data-bai-form-item-explain-error]',
        true,
      ),
    };
  });

const diffForms = async (name) => {
  const rects = await page.evaluate(() => {
    const r = (sel) => {
      const b = document.querySelector(sel).getBoundingClientRect();
      return { x: b.x, y: b.y, width: b.width, height: b.height };
    };
    return { antd: r('#antd form'), bai: r('#bai form') };
  });
  const h = Math.max(rects.antd.height, rects.bai.height);
  const w = Math.min(rects.antd.width, rects.bai.width);
  const shot = (r, f) =>
    page.screenshot({
      path: f,
      clip: { x: r.x, y: r.y, width: w, height: h },
    });
  await shot(rects.antd, `${OUT}/${name}-antd.png`);
  await shot(rects.bai, `${OUT}/${name}-bai.png`);
  const toUrl = (f) =>
    'data:image/png;base64,' + fs.readFileSync(f).toString('base64');
  const res = await page.evaluate(
    async ([ua, ub]) => {
      const load = (u) =>
        new Promise((res, rej) => {
          const img = new Image();
          img.onload = () => res(img);
          img.onerror = rej;
          img.src = u;
        });
      const [ia, ib] = await Promise.all([load(ua), load(ub)]);
      const w = Math.min(ia.width, ib.width);
      const h = Math.min(ia.height, ib.height);
      const cv = (img) => {
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        const x = c.getContext('2d', { willReadFrequently: true });
        x.drawImage(img, 0, 0);
        return x.getImageData(0, 0, w, h).data;
      };
      const A = cv(ia);
      const B = cv(ib);
      const dc = document.createElement('canvas');
      dc.width = w;
      dc.height = h;
      const dctx = dc.getContext('2d');
      const D = dctx.createImageData(w, h);
      let n = 0;
      for (let i = 0; i < A.length; i += 4) {
        // tolerate sub-pixel antialiasing: channel delta > 24 counts
        const diff =
          Math.abs(A[i] - B[i]) > 24 ||
          Math.abs(A[i + 1] - B[i + 1]) > 24 ||
          Math.abs(A[i + 2] - B[i + 2]) > 24;
        if (diff) {
          n++;
          D.data[i] = 255;
          D.data[i + 3] = 255;
        } else {
          const g = (A[i] + A[i + 1] + A[i + 2]) / 3;
          D.data[i] = D.data[i + 1] = D.data[i + 2] = g;
          D.data[i + 3] = 40;
        }
      }
      dctx.putImageData(D, 0, 0);
      return { n, w, h, png: dc.toDataURL('image/png') };
    },
    [toUrl(`${OUT}/${name}-antd.png`), toUrl(`${OUT}/${name}-bai.png`)],
  );
  fs.writeFileSync(
    `${OUT}/${name}-diff.png`,
    Buffer.from(res.png.split(',')[1], 'base64'),
  );
  return { pct: (res.n / (res.w * res.h)) * 100, n: res.n };
};

const geoCheck = (state, g) => {
  const labelsOk =
    g.antd.labels.length === g.bai.labels.length &&
    g.antd.labels.every(
      (l, i) =>
        l.text === g.bai.labels[i].text &&
        Math.abs(l.y - g.bai.labels[i].y) <= 4 &&
        Math.abs(l.h - g.bai.labels[i].h) <= 3,
    );
  const errorsOk =
    g.antd.errors.length === g.bai.errors.length &&
    g.antd.errors.every(
      (e, i) =>
        e.text === g.bai.errors[i].text &&
        Math.abs(e.y - g.bai.errors[i].y) <= 4 &&
        e.color === g.bai.errors[i].color,
    );
  const heightOk = Math.abs(g.antd.formHeight - g.bai.formHeight) <= 6;
  check(
    `[${state}] label geometry equivalent (${g.antd.labels.length} labels, ±4px)`,
    labelsOk,
    labelsOk
      ? ''
      : JSON.stringify({ antd: g.antd.labels, bai: g.bai.labels }),
  );
  check(
    `[${state}] error geometry+color equivalent (${g.antd.errors.length} errors)`,
    errorsOk,
    errorsOk
      ? ''
      : JSON.stringify({ antd: g.antd.errors, bai: g.bai.errors }),
  );
  check(
    `[${state}] form height equivalent (±6px)`,
    heightOk,
    `antd=${g.antd.formHeight} bai=${g.bai.formHeight}`,
  );
};

// baseline
await page.goto(BASE + '?variant=both', { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
await freeze();
await page.screenshot({ path: `${OUT}/01-baseline-both.png`, fullPage: true });
geoCheck('baseline', await geometry());
let d = await diffForms('01-baseline');
check(
  'baseline pixel diff below 2%',
  d.pct < 2,
  `${d.pct.toFixed(3)}% (${d.n}px)`,
);

// error state
await page.goto(BASE + '?variant=both&state=error', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
await freeze();
await page.screenshot({ path: `${OUT}/02-error-both.png`, fullPage: true });
geoCheck('error', await geometry());
d = await diffForms('02-error');
check('error pixel diff below 2%', d.pct < 2, `${d.pct.toFixed(3)}% (${d.n}px)`);

// ------------------------------- D. antd CSS stripped (the post-antd world)
await page.goto(BASE + '?variant=both&state=error&strip=all', {
  waitUntil: 'networkidle',
});
await page.waitForTimeout(2000);
await freeze();
await page.screenshot({ path: `${OUT}/03-stripall-both.png`, fullPage: true });
const strip = await page.evaluate(() => {
  const stripped = window.__stripped ?? 0;
  const remaining = [...document.querySelectorAll('style')].filter((s) =>
    (s.textContent ?? '').includes('.ant-'),
  ).length;
  const col = document.querySelector('#bai');
  const base = col.getBoundingClientRect();
  const errs = [...col.querySelectorAll('[data-bai-form-item-explain-error]')];
  const markers = [...col.querySelectorAll('[data-bai-form-item-required]')];
  const labels = [...col.querySelectorAll('[data-bai-form-item-label]')];
  const items = [...col.querySelectorAll('[data-bai-form-item]')];
  const overlaps = (a, b) =>
    !(a.bottom <= b.top + 1 || b.bottom <= a.top + 1);
  // labels must not overlap error texts (the antd column DOES collapse here)
  let labelErrorOverlap = false;
  for (const l of labels) {
    for (const e of errs) {
      if (
        l.parentElement?.parentElement === e.closest('[data-bai-form-item]') &&
        overlaps(l.getBoundingClientRect(), e.getBoundingClientRect())
      ) {
        labelErrorOverlap = true;
      }
    }
  }
  return {
    stripped,
    remaining,
    errCount: errs.length,
    errColors: [...new Set(errs.map((e) => getComputedStyle(e).color))],
    markerCount: markers.length,
    markerColors: [...new Set(markers.map((m) => getComputedStyle(m).color))],
    labelColor: labels.length ? getComputedStyle(labels[0]).color : null,
    itemMarginBottom: items.length
      ? getComputedStyle(items[0]).marginBottom
      : null,
    labelErrorOverlap,
    colHeight: Math.round(base.height),
  };
});
check(
  'strip removed antd style tags and none remain',
  strip.stripped > 0 && strip.remaining === 0,
  `stripped=${strip.stripped} remaining=${strip.remaining}`,
);
check(
  'BAI errors survive antd CSS removal (red, present)',
  strip.errCount > 0 &&
    strip.errColors.length === 1 &&
    strip.errColors[0] === 'rgb(255, 77, 79)',
  `count=${strip.errCount} colors=${JSON.stringify(strip.errColors)}`,
);
check(
  'BAI required markers survive (red)',
  strip.markerCount > 0 && strip.markerColors[0] === 'rgb(255, 77, 79)',
  `count=${strip.markerCount} colors=${JSON.stringify(strip.markerColors)}`,
);
check(
  'BAI vertical rhythm survives (24px item margin, labels clear of errors)',
  strip.itemMarginBottom === '24px' && !strip.labelErrorOverlap,
  `marginBottom=${strip.itemMarginBottom} overlap=${strip.labelErrorOverlap}`,
);

// ---------------------------------------------------------------- summary
fs.writeFileSync(
  `${OUT}/results.json`,
  JSON.stringify({ results, behaviour, dom, strip, logs: logs.slice(0, 120) }, null, 2),
);
await browser.close();
if (server) {
  process.kill(-server.pid, 'SIGTERM');
  console.log('stopped theme-probe vite server');
}
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
