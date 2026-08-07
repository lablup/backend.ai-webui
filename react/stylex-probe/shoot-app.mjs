/** SPIKE 14 — load the REAL built app and audit the entry stylesheet. */
import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

const root = resolve(process.argv[2]);
const out = process.argv[3];
const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.toml': 'text/plain',
};
const server = createServer((req, res) => {
  let p = join(root, decodeURIComponent(req.url.split('?')[0]));
  if (!existsSync(p) || statSync(p).isDirectory()) p = join(root, 'index.html');
  res.setHeader('Content-Type', TYPES[extname(p)] ?? 'application/octet-stream');
  res.end(readFileSync(p));
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text().slice(0, 160));
});
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message.slice(0, 160)}`));

await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);

const audit = await page.evaluate(() => {
  const sheets = [...document.styleSheets].map((s) => {
    let layers = [];
    let hasStylex = false;
    try {
      layers = [...s.cssRules]
        .filter((r) => r.constructor.name === 'CSSLayerBlockRule')
        .map((r) => r.name);
      hasStylex = [...s.cssRules].some(
        (r) => r.selectorText && r.selectorText.includes(':not(##)'),
      );
    } catch {}
    return {
      href: s.href ? s.href.split('/').pop() : '(inline)',
      layers,
      rules: (() => {
        try {
          return s.cssRules.length;
        } catch {
          return -1;
        }
      })(),
      hasStylexAtomicRules: hasStylex,
    };
  });
  return { sheets, title: document.title, bodyText: document.body.innerText.slice(0, 300) };
});

await page.screenshot({ path: out, fullPage: false });
await browser.close();
server.close();
console.log(JSON.stringify({ ...audit, errors }, null, 2));
