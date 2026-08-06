import { chromium } from '/home/ubuntu/Workspace/backend.ai-webui/node_modules/@playwright/test/index.mjs';
import fs from 'node:fs';
import path from 'node:path';

const OUT = process.env.SPIKE_OUT;
fs.mkdirSync(OUT, { recursive: true });
const BASE = 'http://127.0.0.1:5287/';

const shots = [
  { name: '01-baseline-both', q: '?variant=both' },
  { name: '02-error-both', q: '?variant=both&state=error' },
  { name: '03-stripform-both', q: '?variant=both&state=error&strip=form' },
  { name: '04-stripall-both', q: '?variant=both&state=error&strip=all' },
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1500, height: 1400 }, deviceScaleFactor: 2 });
const logs = [];
page.on('console', (m) => logs.push(`[${m.type()}] ${m.text()}`));
page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));

const results = {};

for (const s of shots) {
  await page.goto(BASE + s.q, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1600);
  await page.screenshot({ path: path.join(OUT, s.name + '.png'), fullPage: true });
  results[s.name] = {
    stripped: await page.evaluate(() => window.__stripped ?? null),
    antdResult: await page.evaluate(
      () => document.querySelector('[data-result="antd"]')?.textContent ?? null,
    ),
    baiResult: await page.evaluate(
      () => document.querySelector('[data-result="bai"]')?.textContent ?? null,
    ),
    antdStyleTags: await page.evaluate(
      () => [...document.querySelectorAll('style')].filter((s) => (s.textContent ?? '').includes('.ant-')).length,
    ),
    baiDomHasAntFormClass: await page.evaluate(
      () => document.querySelectorAll('#bai [class*="ant-form"]').length,
    ),
    antdDomHasAntFormClass: await page.evaluate(
      () => document.querySelectorAll('#antd [class*="ant-form"]').length,
    ),
  };
}

// --- behavioural equivalence probe: same interactions, both engines ---
await page.goto(BASE + '?variant=both', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);

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
        errorFields: info.errorFields?.map((f) => ({ name: f.name, errors: f.errors })),
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
    rec.valuesKeysAfterUnmount = Object.keys(form.getFieldsValue());
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

// --- DOM inventory: what antd renders under noStyle vs full ---
await page.goto(BASE + '?variant=both&state=error', { waitUntil: 'networkidle' });
await page.waitForTimeout(1400);
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
      totalElements: root.querySelectorAll('*').length,
      antFormClasses: [...classes].sort(),
      errorTexts: [...root.querySelectorAll('[data-bai-form-item-explain-error], .ant-form-item-explain-error')].map(
        (e) => e.textContent,
      ),
    };
  };
  return { antd: inv('#antd'), bai: inv('#bai') };
});

await browser.close();
fs.writeFileSync(
  path.join(OUT, 'results.json'),
  JSON.stringify({ results, behaviour, dom, logs: logs.slice(0, 120) }, null, 2),
);
console.log(JSON.stringify({ results, dom }, null, 2));
console.log('--- behaviour ---');
console.log(JSON.stringify(behaviour, null, 2));
console.log('--- console (first 40) ---');
console.log(logs.slice(0, 40).join('\n'));
