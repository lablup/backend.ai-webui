/** SPIKE 14 — dev-server HMR check for a stylex.create() edit. */
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const URL = 'http://127.0.0.1:5317/';
const FILE = resolve('App.tsx');
const original = readFileSync(FILE, 'utf8');

const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`console: ${m.text()}`);
});
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
let reloaded = false;
page.on('load', () => {
  reloaded = true;
});

await page.goto(URL, { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
reloaded = false; // ignore the initial load

const read = () =>
  page.evaluate(() => {
    const cs = getComputedStyle(document.getElementById('astryx-btn-override'));
    const box = getComputedStyle(document.getElementById('plain-box'));
    return { pt: cs.paddingTop, boxPad: box.paddingTop };
  });

const before = await read();

// Edit a stylex.create() value and wait for the style to change in place.
writeFileSync(
  FILE,
  original.replace('paddingTop: \'32px\'', 'paddingTop: \'77px\''),
  'utf8',
);

let after = before;
const deadline = Date.now() + 15000;
while (Date.now() < deadline) {
  await page.waitForTimeout(300);
  after = await read();
  if (after.pt !== before.pt) break;
}

writeFileSync(FILE, original, 'utf8');
// wait for the revert to land too
const deadline2 = Date.now() + 15000;
let reverted = after;
while (Date.now() < deadline2) {
  await page.waitForTimeout(300);
  reverted = await read();
  if (reverted.pt === before.pt) break;
}

await browser.close();
console.log(
  JSON.stringify(
    { before, after, reverted, fullPageReloadHappened: reloaded, errors },
    null,
    2,
  ),
);
