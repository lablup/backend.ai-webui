/**
 * QA3 — measure hover-underline on table name-cell links across the app.
 *
 *   node .scratch/astryx-migration/shots/qa3-link-hover.mjs <outDir> <tag> [theme]
 *
 * For every route it hover-tests each distinct link cell it can find inside a
 * table body, and reports `text-decoration-line` on the link AND on its
 * deepest text-bearing descendant, with and without :hover.
 *
 * The descendant check is the point: `text-decoration` propagates to in-flow
 * *inline* descendants only, so an underlined <a> wrapping a `display: block`
 * <span> (which is what Astryx `Text` renders when it truncates — i.e. every
 * name cell) paints nothing at all.
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const OUT = process.argv[2] || path.join(import.meta.dirname, 'qa3');
const TAG = process.argv[3] || 'before';
const THEME = process.argv[4] || 'light';
const BASE = 'http://127.0.0.1:4735';
fs.mkdirSync(OUT, { recursive: true });

const env = Object.fromEntries(
  fs
    .readFileSync(
      path.join(import.meta.dirname, '../../../react/.env.development.local'),
      'utf8',
    )
    .split('\n')
    .filter(Boolean)
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i), l.slice(i + 1)];
    }),
);

const ROUTES = [
  ['data-vfolders', '/data'],
  ['admin-data', '/admin/data'],
  ['project-data', '/project-data'],
  ['agents', '/agent'],
  ['sessions', '/session'],
  ['admin-sessions', '/admin/session'],
  ['deployments', '/serving'],
  ['reservoir', '/reservoir'],
  ['users', '/admin/users'],
  ['projects', '/admin/project'],
  ['environment', '/environment'],
  ['resource-policy', '/resource-policy'],
  ['rbac', '/rbac'],
  ['storage-proxy', '/storage-settings/local:volume1'],
];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1600, height: 950 } });
const page = await ctx.newPage();

await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(5000);
const email = page.getByPlaceholder(/Email or Username/i).first();
if (await email.isVisible().catch(() => false)) {
  await email.fill(env.VITE_DEFAULT_EMAIL);
  await page
    .getByPlaceholder(/^Password$/i)
    .first()
    .fill(env.VITE_DEFAULT_PASSWORD);
  const ep = page.getByPlaceholder(/^Endpoint$/i).first();
  if (await ep.isVisible().catch(() => false))
    await ep.fill(env.VITE_DEFAULT_API_ENDPOINT);
  await page.locator('button:has-text("Login")').first().click();
}
await page.waitForTimeout(10000);

if (THEME === 'dark') {
  await page
    .getByRole('button', { name: /^dark mode$/i })
    .first()
    .click({ timeout: 15000 });
  await page.waitForTimeout(2500);
  const resolved = await page.evaluate(() =>
    document.documentElement.getAttribute('data-theme'),
  );
  if (resolved !== 'dark') throw new Error(`theme not dark: ${resolved}`);
}

const LINK_SEL = 'tbody tr a, tbody tr button.astryx-link, tbody tr .bai-link-hover';

const readDecoration = (el) => {
  const deepest = (n) => {
    let cur = n;
    for (let i = 0; i < 6; i++) {
      const child = Array.from(cur.children).find((c) => c.textContent?.trim());
      if (!child) break;
      cur = child;
    }
    return cur;
  };
  const d = deepest(el);
  const cs = getComputedStyle(el);
  const ds = getComputedStyle(d);
  return {
    tag: el.tagName.toLowerCase(),
    hasBaiHover: el.classList.contains('bai-link-hover'),
    linkDecoration: cs.textDecorationLine,
    linkColor: cs.color,
    innerTag: d === el ? '(self)' : d.tagName.toLowerCase(),
    innerDisplay: d === el ? '(self)' : ds.display,
    innerDecoration: d === el ? cs.textDecorationLine : ds.textDecorationLine,
  };
};

const results = [];

for (const [name, route] of ROUTES) {
  await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(7000);

  const count = await page.locator(LINK_SEL).count();
  if (!count) {
    const rows = await page.locator('tbody tr').count();
    results.push({ route: name, theme: THEME, status: 'no-link-cell', rows });
    console.log(`${THEME} ${name}: no link cell (rows=${rows})`);
    continue;
  }

  const seen = new Set();
  const routeRows = [];
  for (let i = 0; i < Math.min(count, 8); i++) {
    const loc = page.locator(LINK_SEL).nth(i);
    if (!(await loc.isVisible().catch(() => false))) continue;
    const text = (await loc.textContent().catch(() => ''))?.trim() ?? '';
    if (!text) continue;
    const before = await loc.evaluate(readDecoration);
    const sig = `${before.tag}|${before.hasBaiHover}|${before.innerTag}|${before.innerDisplay}`;
    if (seen.has(sig)) continue;
    seen.add(sig);

    await loc.hover();
    await page.waitForTimeout(350);
    const after = await loc.evaluate(readDecoration);
    // Visible underline = the link declares it AND the box that actually
    // paints the glyphs declares it too.
    const underlines =
      after.linkDecoration.includes('underline') &&
      after.innerDecoration.includes('underline');
    routeRows.push({ text: text.slice(0, 28), before, after, underlines });
    console.log(
      `${THEME} ${name}: "${text.slice(0, 24)}" ${after.tag}` +
        `${after.hasBaiHover ? '.bai-link-hover' : ''} ` +
        `link=${before.linkDecoration}->${after.linkDecoration} ` +
        `inner(${after.innerTag}/${after.innerDisplay})=${before.innerDecoration}->${after.innerDecoration} ` +
        `color=${after.linkColor} => ${underlines ? 'UNDERLINE OK' : 'NO UNDERLINE'}`,
    );
    await page.screenshot({
      path: path.join(OUT, `hover-${TAG}-${THEME}-${name}-${routeRows.length}.png`),
    });
  }
  results.push({ route: name, theme: THEME, links: routeRows });
}

fs.writeFileSync(
  path.join(OUT, `links-${TAG}-${THEME}.json`),
  JSON.stringify(results, null, 2),
);

const all = results.flatMap((r) => r.links ?? []);
console.log(
  `\n${THEME} SUMMARY: ${all.filter((l) => l.underlines).length}/${all.length} link cells underline on hover`,
);
await browser.close();
