/** Dumps the antd + engine DOM for one matrix case, for spec archaeology. */
import { chromium } from '@playwright/test';

const CASE = process.argv[2] ?? 'vertical-error';
const MODE = process.argv[3] ?? 'light';
const BASE = process.env.PROBE_BASE ?? 'http://127.0.0.1:9198';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
await page.goto(`${BASE}/theme-probe/formmatrix.html?mode=${MODE}&only=${CASE}`, {
  waitUntil: 'networkidle',
});
await page.waitForTimeout(900);
const html = await page.evaluate(() =>
  [...document.querySelectorAll('[data-case][data-impl]')]
    .map((n) => `----- ${n.dataset.impl} -----\n${n.innerHTML}`)
    .join('\n\n'),
);
console.log(html);
await browser.close();
