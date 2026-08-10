/**
 * qa8 item E (follow-up 2) — the header buttons' HOVER paint.
 * Astryx composites hover as `background-image: linear-gradient(
 * var(--color-overlay-hover), …)`, so `background-color` alone reads clean.
 */
import { BASE, ROOT, launch, setMode, settle } from './probe-pages-lib.mjs';
import fs from 'node:fs';

const { browser, page, pageErrors } = await launch();
const result = {};

await page.goto(`${BASE}start`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(9000);
await settle(page);

const readBtn = (sel) =>
  page.evaluate((s) => {
    const el = document.querySelector(s);
    if (!el) return null;
    const c = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      rect: { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) },
      bgColor: c.backgroundColor,
      bgImage: c.backgroundImage.slice(0, 120),
      color: c.color,
      colorScheme: c.colorScheme,
      mediaAttr: el.closest('[data-astryx-media]')?.getAttribute('data-astryx-media') ?? null,
      overlayHover: c.getPropertyValue('--color-overlay-hover').trim(),
      overlayPressed: c.getPropertyValue('--color-overlay-pressed').trim(),
    };
  }, sel);

const TARGETS = [
  ['notification', '[data-testid="button-notification"]'],
  ['theme', '[data-testid="button-theme"]'],
  ['help', '[data-testid="button-help"]'],
  ['user', '[data-testid="user-dropdown-button"]'],
];

for (const mode of ['light', 'dark']) {
  const m = (result[mode] = { appliedTheme: await setMode(page, mode) });
  await settle(page, 3000);
  m.headerBg = await page.evaluate(
    () => getComputedStyle(document.querySelector('[data-testid="webui-header"]')).backgroundColor,
  );
  m.buttons = {};
  for (const [name, sel] of TARGETS) {
    const rest = await readBtn(sel);
    await page.locator(sel).first().hover();
    await page.waitForTimeout(700);
    const hover = await readBtn(sel);
    m.buttons[name] = { rest, hover };
    await page.screenshot({
      path: `${ROOT}/before-e3-${name}-hover-${mode}.png`,
      clip: { x: 1250, y: 0, width: 350, height: 60 },
    });
    await page.mouse.move(800, 600);
    await page.waitForTimeout(400);
  }
  // the project selector (an Astryx Selector, ghost, on the band)
  m.projectSelect = await readBtn('[data-testid="selector-project"]');
}

result.pageErrors = pageErrors;
fs.writeFileSync(`${ROOT}/before-pages-e3.json`, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
await browser.close();
