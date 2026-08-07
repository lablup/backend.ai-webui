// Ticket 02 measurement script — computed-style assertions for the brand
// theme probe harness (react/theme-probe/brand.html on a local Vite dev
// server). Run: node .scratch/astryx-migration/shots/measure-02.mjs
import { chromium } from '@playwright/test';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const shotsDir = dirname(fileURLToPath(import.meta.url));
const URL = process.env.PROBE_URL ?? 'http://127.0.0.1:9198/theme-probe/brand.html';

const hexToRgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
};

const EXPECT = {
  light: {
    brand: hexToRgb('#FF7A00'),
    admin: hexToRgb('#028DF2'),
    secondary: hexToRgb('#00BD9B'),
  },
  dark: {
    brand: hexToRgb('#be5e06'),
    admin: hexToRgb('#0387bf'),
    secondary: hexToRgb('#068e76'),
  },
};

const browser = await chromium.launch();
// OS preference pinned to LIGHT so the no-mode nested theme's `system`
// fallback is distinguishable from parent-mode following in dark mode.
const page = await browser.newPage({ colorScheme: 'light', viewport: { width: 1000, height: 900 } });
page.on('pageerror', (e) => console.error('PAGEERROR', e.message));
await page.goto(URL);
await page.waitForSelector('#brand-swatch', { timeout: 20000 });

const read = () =>
  page.evaluate(() => {
    const bg = (sel) => getComputedStyle(document.querySelector(sel)).backgroundColor;
    const cs = getComputedStyle(document.querySelector('#brand-swatch'));
    return {
      brandBtn: bg('#brand-btn'),
      brand: bg('#brand-swatch'),
      adminBtn: bg('#admin-btn'),
      admin: bg('#admin-swatch'),
      sibling: bg('#sibling-swatch'),
      secondary: bg('#secondary-swatch'),
      nomode: bg('#nomode-swatch'),
      radiusElement: cs.borderRadius,
      fontSizeLg: cs.fontSize,
      durationSlow: cs.transitionDuration,
      boxShadow: cs.boxShadow,
      fontFamily: cs.fontFamily,
    };
  });

const results = {};
results.light = await read();
await page.screenshot({ path: join(shotsDir, '02-brand-light.png'), fullPage: true });
await page.click('#toggle');
await page.waitForTimeout(250);
results.dark = await read();
await page.screenshot({ path: join(shotsDir, '02-brand-dark.png'), fullPage: true });
await browser.close();

let failed = 0;
const check = (name, actual, expected) => {
  const ok = actual === expected;
  if (!ok) failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}: ${actual}${ok ? '' : ` (expected ${expected})`}`);
};

for (const mode of ['light', 'dark']) {
  const r = results[mode];
  const e = EXPECT[mode];
  console.log(`\n=== ${mode} ===`);
  check('brand swatch', r.brand, e.brand);
  check('brand button', r.brandBtn, e.brand);
  check('admin swatch (nested, parent mode)', r.admin, e.admin);
  check('admin button', r.adminBtn, e.admin);
  check('sibling after admin (no leak)', r.sibling, e.brand);
  check('secondary swatch', r.secondary, e.secondary);
  // no-mode nested theme follows the OS (light) regardless of app mode —
  // the hazard the adapters exist to prevent.
  check('no-mode nested (system fallback -> OS light)', r.nomode, EXPECT.light.admin);
  check('--radius-element (antd borderRadiusLG)', r.radiusElement, '8px');
  check('--font-size-lg (antd fontSizeLG)', r.fontSizeLg, '16px');
  check('--duration-slow (antd motionDurationSlow)', r.durationSlow, '0.3s');
  console.log(`INFO shadow-med: ${r.boxShadow.slice(0, 90)}…`);
  console.log(`INFO font-family: ${r.fontFamily}`);
}

console.log(failed === 0 ? '\nALL MEASUREMENTS PASS' : `\n${failed} MEASUREMENTS FAILED`);
process.exit(failed === 0 ? 0 : 1);
