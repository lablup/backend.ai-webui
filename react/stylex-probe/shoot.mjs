/** SPIKE 14 — render the built probe and audit computed styles + cascade. */
import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

const root = resolve(process.argv[2] ?? 'dist');
const out = process.argv[3] ?? 'probe.png';
const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.map': 'application/json',
};

const server = createServer((req, res) => {
  let p = join(root, decodeURIComponent(req.url.split('?')[0]));
  if (!existsSync(p) || p.endsWith('/')) p = join(root, 'index.html');
  res.setHeader('Content-Type', TYPES[extname(p)] ?? 'application/octet-stream');
  res.end(readFileSync(p));
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
const errors = [];
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`console: ${m.text()}`);
});
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);

const audit = await page.evaluate(() => {
  const get = (id, props) => {
    const el = document.getElementById(id);
    if (!el) return { missing: true };
    const cs = getComputedStyle(el);
    const o = { classes: el.className };
    for (const p of props) o[p] = cs.getPropertyValue(p);
    return o;
  };
  const layers = [...document.styleSheets].map((s) => {
    let names = [];
    try {
      names = [...s.cssRules]
        .filter((r) => r.constructor.name === 'CSSLayerBlockRule')
        .map((r) => r.name);
    } catch {}
    return { href: s.href ? s.href.split('/').pop() : '(inline)', layers: names };
  });
  return {
    plainBox: get('plain-box', ['padding-top', 'color', 'border-color', 'font-weight']),
    astryxCard: get('astryx-card', ['outline', 'border-radius', 'background-color']),
    astryxCardToken: get('astryx-card-token', ['outline', 'margin-top']),
    btnOverride: get('astryx-btn-override', [
      'padding-top',
      'padding-bottom',
      'padding-inline-start',
      'background-color',
    ]),
    btnBaseline: get('astryx-btn-baseline', [
      'padding-top',
      'padding-bottom',
      'padding-inline-start',
      'background-color',
    ]),
    antdBtn: get('antd-btn', ['background-color', 'color', 'border-radius']),
    layers,
  };
});

// hover checks
const hoverBtn = await (async () => {
  const el = page.locator('#astryx-btn-override');
  await el.hover();
  await page.waitForTimeout(200);
  return el.evaluate((n) => getComputedStyle(n).backgroundColor);
})();
const hoverBox = await (async () => {
  const el = page.locator('#plain-box');
  await el.hover();
  await page.waitForTimeout(200);
  return el.evaluate((n) => getComputedStyle(n).color);
})();

await page.mouse.move(0, 0);
await page.waitForTimeout(150);
await page.screenshot({ path: out, fullPage: true });
await browser.close();
server.close();

console.log(
  JSON.stringify({ ...audit, hoverBtnBg: hoverBtn, hoverBoxColor: hoverBox, errors }, null, 2),
);
