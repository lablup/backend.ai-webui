/**
 * qa2-c live measurement harness.
 *
 * Logs in once, then for each table page: screenshots light+dark and dumps the
 * vertical rhythm of the page's main column (the y-gaps between consecutive
 * block-level children of the card body: filter row, action row, table,
 * pagination).
 */
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const BASE = process.env.QA_BASE ?? 'http://127.0.0.1:5930/';
const OUT = process.env.QA_OUT ?? '.scratch/astryx-migration/shots/qa2-c';
mkdirSync(OUT, { recursive: true });

const PAGES = (process.env.QA_PAGES ?? '')
  .split(',')
  .filter(Boolean)
  .map((s) => {
    const [name, hash] = s.split('=');
    return { name, hash };
  });

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1100 },
  ignoreHTTPSErrors: true,
});
const page = await ctx.newPage();

// Seed the stored endpoint before first paint: LoginView's `apiEndpoint`
// initializer reads `backendaiwebui.api_endpoint` from localStorage and that
// value wins over the (form-level, unseeded) VITE_DEFAULT_API_ENDPOINT field.
const ENDPOINT = process.env.BAI_ENDPOINT ?? 'http://10.82.0.130:8090';
await ctx.addInitScript((ep) => {
  try {
    localStorage.setItem('backendaiwebui.api_endpoint', ep);
  } catch {
    /* storage unavailable */
  }
}, ENDPOINT);

await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(9000);

const userInput = page.locator('input[placeholder*="mail" i]').first();
if (await userInput.count()) {
  await userInput.fill(process.env.BAI_EMAIL ?? 'admin@lablup.com');
  await page
    .locator('input[type="password"]')
    .first()
    .fill(process.env.BAI_PW ?? 'wJalrXUt');
  await page
    .getByRole('button', { name: /login/i })
    .first()
    .click();
}
await page.waitForTimeout(15000);
console.log('LOGGED IN url=', page.url());

/** Vertical rhythm of a container: child boxes + the gaps between them. */
const RHYTHM = `(sel) => {
  const root = document.querySelector(sel);
  if (!root) return { error: 'no ' + sel };
  const cs = getComputedStyle(root);
  const kids = Array.from(root.children).filter((c) => {
    const r = c.getBoundingClientRect();
    return r.height > 0 && r.width > 0;
  });
  const boxes = kids.map((c) => {
    const r = c.getBoundingClientRect();
    const s = getComputedStyle(c);
    return {
      tag: c.tagName.toLowerCase(),
      cls: (c.className || '').toString().slice(0, 48),
      top: Math.round(r.top),
      bottom: Math.round(r.bottom),
      h: Math.round(r.height),
      mt: s.marginTop,
      mb: s.marginBottom,
    };
  });
  const gaps = [];
  for (let i = 1; i < boxes.length; i++) gaps.push(boxes[i].top - boxes[i - 1].bottom);
  return {
    container: {
      display: cs.display,
      gap: cs.rowGap,
      padding: cs.padding,
      cls: (root.className || '').toString().slice(0, 60),
    },
    boxes,
    gaps,
  };
}`;

// Routes are project-scoped paths (`/project/<name>/<page>`), not hashes.
const PROJECT_PREFIX = new URL(page.url()).pathname.replace(/\/[^/]*$/, '');
console.log('PROJECT_PREFIX=', PROJECT_PREFIX);

for (const { name, hash } of PAGES) {
  const url = hash.startsWith('/')
    ? new URL(hash, BASE).toString()
    : new URL(PROJECT_PREFIX + '/' + hash, BASE).toString();
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(9000);

  // Discover the content root and the card bodies present on this page.
  const sels = await page.evaluate(() => {
    const out = new Set();
    const table = document.querySelector(
      '.ant-table, table, [class*="astryx-table"]',
    );
    if (table) {
      // Walk up from the table collecting container class names so the
      // rhythm probe can be pointed at whatever wrapper the page actually uses.
      let el = table;
      for (let i = 0; i < 8 && el; i++) {
        const c = (el.className || '').toString().trim().split(/\s+/)[0];
        if (c) out.add('.' + CSS.escape(c));
        el = el.parentElement;
      }
    }
    return [...out];
  });
  console.log(`### ${name} ANCESTORS ` + JSON.stringify(sels));

  for (const sel of ['#app-body', '.ant-layout-content', ...sels]) {
    try {
      const r = await page.evaluate(eval('(' + RHYTHM + ')'), sel);
      if (r.error) continue;
      console.log(`### ${name} [${sel}] ` + JSON.stringify(r));
    } catch (e) {
      console.log(`### ${name} [${sel}] ERR ${e.message}`);
    }
  }
  await page.screenshot({ path: `${OUT}/${name}-light.png`, fullPage: false });
}

await browser.close();
