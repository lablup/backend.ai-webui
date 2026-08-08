/**
 * Sider-fixes evidence capture. Run with PHASE=before|after.
 *   PHASE=before node .scratch/astryx-migration/sider-shots.mjs
 * Captures light/dark x expanded/collapsed x general/admin, plus the
 * hover-revealed toggle button and its tooltip.
 */
import fs from 'node:fs';
import { launch, login } from './probe.mjs';

const PHASE = process.env.PHASE ?? 'before';
const OUT = `.scratch/astryx-migration/shots/sider-fixes`;
fs.mkdirSync(OUT, { recursive: true });

const { browser, page } = await launch();
await login(page);
const url = new URL(page.url());
const projectSeg = url.pathname.split('/').slice(0, 3).join('/');
console.log('project base:', projectSeg);

const RAIL = { x: 0, y: 0, width: 340, height: 1000 };
const RAIL_COLLAPSED = { x: 0, y: 0, width: 140, height: 1000 };

const shot = (name, clip) =>
  page.screenshot({ path: `${OUT}/${PHASE}-${name}.png`, clip });

const toggleTheme = async () => {
  await page
    .locator('button[aria-label="Dark mode"], button[aria-label="Light mode"]')
    .first()
    .click();
  await page.waitForTimeout(1200);
};

const setCollapsed = async (want) => {
  const shell = page.locator('.bai-sider-shell').first();
  await shell.hover();
  await page.waitForTimeout(400);
  const btn = page.locator('.bai-sider-toggle').first();
  const label = await btn.getAttribute('aria-label');
  const isCollapsed = label === 'Expand';
  if (isCollapsed !== want) {
    await btn.click();
    await page.waitForTimeout(900);
  }
  await page.mouse.move(900, 500);
  await page.waitForTimeout(500);
};

const measure = async (tag) => {
  const m = await page.evaluate(() => {
    const pick = (el) => {
      if (!el) return null;
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
        color: s.color,
        bg: s.backgroundColor,
        border: `${s.borderTopWidth} ${s.borderTopStyle} ${s.borderTopColor}`,
        radius: s.borderRadius,
        shadow: s.boxShadow,
        pad: `${s.paddingTop} ${s.paddingRight} ${s.paddingBottom} ${s.paddingLeft}`,
        box: { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) },
      };
    };
    const sec = document.querySelector('.bai-sider .astryx-side-nav-section');
    const header = sec?.firstElementChild ?? null;
    const title = header?.querySelector('span > span') ?? null;
    const icons = [...document.querySelectorAll('.bai-sider .astryx-side-nav-item svg')].map((sv) => ({
      label: sv.closest('.astryx-side-nav-item')?.textContent?.trim(),
      viewBox: sv.getAttribute('viewBox'),
      w: +sv.getBoundingClientRect().width.toFixed(1),
      h: +sv.getBoundingClientRect().height.toFixed(1),
    }));
    return {
      sectionRoot: pick(sec),
      sectionHeader: pick(header),
      sectionTitle: pick(title),
      titleText: title?.textContent,
      icons,
    };
  });
  console.log(`--- MEASURE ${tag}`, JSON.stringify(m, null, 1));
};

// ---------------------------------------------------------------- general
await setCollapsed(false);
await shot('light-expanded', RAIL);
await measure('light-expanded');

// toggle hover + tooltip
const shell = page.locator('.bai-sider-shell').first();
await shell.hover();
await page.waitForTimeout(600);
await shot('light-toggle-hover', { x: 200, y: 30, width: 160, height: 120 });
const toggleMetrics = await page.evaluate(() => {
  const b = document.querySelector('.bai-sider-toggle');
  if (!b) return null;
  const s = getComputedStyle(b);
  const r = b.getBoundingClientRect();
  const svg = b.querySelector('svg');
  return {
    label: b.getAttribute('aria-label'),
    w: +r.width.toFixed(1), h: +r.height.toFixed(1), x: +r.x.toFixed(1),
    radius: s.borderRadius, bg: s.backgroundColor,
    border: `${s.borderTopWidth} ${s.borderTopStyle} ${s.borderTopColor}`,
    shadow: s.boxShadow, color: s.color, fontSize: s.fontSize,
    svg: svg ? { w: +svg.getBoundingClientRect().width.toFixed(1), h: +svg.getBoundingClientRect().height.toFixed(1) } : null,
  };
});
console.log('--- TOGGLE', JSON.stringify(toggleMetrics, null, 1));

await page.locator('.bai-sider-toggle').first().hover();
await page.waitForTimeout(1200);
await shot('light-toggle-tooltip', { x: 200, y: 20, width: 400, height: 140 });

await page.mouse.move(900, 500);
await page.waitForTimeout(400);

// collapsed
await setCollapsed(true);
await shot('light-collapsed', RAIL_COLLAPSED);
await setCollapsed(false);

// ---------------------------------------------------------------- admin
await page.goto(new URL('/admin/users', page.url()).href, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(6000);
await shot('light-admin', RAIL);
const backMetrics = await page.evaluate(() => {
  const b = document.querySelector('.bai-sider button[aria-label]');
  if (!b) return null;
  const s = getComputedStyle(b);
  const r = b.getBoundingClientRect();
  const svg = b.querySelector('svg');
  const heading = b.parentElement?.querySelector('.astryx-text, span:not(:has(svg))');
  const hs = heading ? getComputedStyle(heading) : null;
  return {
    label: b.getAttribute('aria-label'),
    w: +r.width.toFixed(1), h: +r.height.toFixed(1), x: +r.x.toFixed(1), y: +r.y.toFixed(1),
    radius: s.borderRadius, bg: s.backgroundColor, color: s.color, fontSize: s.fontSize,
    svg: svg ? { w: +svg.getBoundingClientRect().width.toFixed(1) } : null,
    heading: hs ? { text: heading.textContent, fontSize: hs.fontSize, fontWeight: hs.fontWeight, color: hs.color, x: +heading.getBoundingClientRect().x.toFixed(1) } : null,
  };
});
console.log('--- BACKBTN', JSON.stringify(backMetrics, null, 1));

await setCollapsed(true);
await shot('light-admin-collapsed', RAIL_COLLAPSED);
await setCollapsed(false);

// ---------------------------------------------------------------- dark
await toggleTheme();
await shot('dark-admin', RAIL);
await page.goto(new URL(`${projectSeg}/start`, page.url()).href, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(6000);
await shot('dark-expanded', RAIL);
await shell.hover();
await page.waitForTimeout(700);
await shot('dark-toggle-hover', { x: 200, y: 30, width: 160, height: 120 });
await page.locator('.bai-sider-toggle').first().hover();
await page.waitForTimeout(1200);
await shot('dark-toggle-tooltip', { x: 200, y: 20, width: 400, height: 140 });
await page.mouse.move(900, 500);
await page.waitForTimeout(400);
await setCollapsed(true);
await shot('dark-collapsed', RAIL_COLLAPSED);

await browser.close();
console.log('done:', PHASE);
