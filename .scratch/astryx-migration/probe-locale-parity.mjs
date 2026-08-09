/**
 * Ticket 35 — do the ported BUI catalogs produce the SAME message-less
 * validation text antd's locale bundle did, in every language?
 *
 * The probe's `{ required: true }` rules carry no `message`, so the antd
 * column's text comes from `antd/es/locale/<lang>.Form.defaultValidateMessages`
 * and the engine column's from `form.validateMessages` in BUI's own catalogs.
 * Identical output means the port did not change a single user-visible string.
 */
import { chromium } from '@playwright/test';
import * as fs from 'node:fs';

const BASE = 'http://127.0.0.1:5981/theme-probe/form.html';
const OUT = '.scratch/astryx-migration/form-parity';
fs.mkdirSync(OUT, { recursive: true });

const LANGS = ['en', 'ko', 'ja', 'de', 'zh-CN', 'ru', 'th'];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1400 } });
const errs = [];
page.on('pageerror', (e) => errs.push(String(e)));

let allMatch = true;
const table = {};
for (const lang of LANGS) {
  await page.goto(`${BASE}?state=error&lang=${lang}`, {
    waitUntil: 'networkidle',
  });
  await page.waitForTimeout(1500);
  const d = await page.evaluate(() => {
    const txt = (sel) =>
      [...document.querySelectorAll(sel)].map((n) => n.textContent.trim());
    return {
      antd: txt('#antd .ant-form-item-explain-error'),
      bai: txt('#bai [data-bai-form-item-explain-error]'),
    };
  });
  // Only the message-less `required` rules are comparable; the rest carry an
  // explicit English `message` in the probe source and are identical by
  // construction. Filter to the ones the tables produce.
  const generated = (list) =>
    list.filter((t) => !/ is required$|^Only positive integers|^Min must be/.test(t));
  const a = generated(d.antd);
  const b = generated(d.bai);
  const ok = JSON.stringify(a) === JSON.stringify(b) && a.length > 0;
  allMatch &&= ok;
  table[lang] = { antd: a, bai: b, match: ok };
  await page.screenshot({ path: `${OUT}/locale-${lang}.png`, fullPage: true });
  console.log(`${lang}: ${ok ? 'MATCH' : 'DIFF'}  ${JSON.stringify(a)}`);
  if (!ok) console.log(`        engine: ${JSON.stringify(b)}`);
}
fs.writeFileSync(`${OUT}/locale-report.json`, JSON.stringify(table, null, 2));
console.log(
  `\nALL LANGUAGES ${allMatch ? 'MATCH' : 'DIFFER'} — pageErrors: ${errs.length ? errs : 'none'}`,
);
await browser.close();
