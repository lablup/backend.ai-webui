/**
 * qa8 item E (follow-up) — the header band itself measured clean in both
 * modes, so this probe opens every surface the header ANCHORS (notification
 * popover / drawer, user dropdown, help, theme-toggle tooltip, the project
 * selector's popup) and measures each one's surface + text in both modes.
 */
import { BASE, ROOT, launch, setMode, settle } from './probe-pages-lib.mjs';
import fs from 'node:fs';

const { browser, page, pageErrors } = await launch();
const result = {};

const openSurfaces = () =>
  page.evaluate(() => {
    const seen = [];
    const push = (el, name) => {
      const r = el.getBoundingClientRect();
      if (r.width < 40 || r.height < 20) return;
      const c = getComputedStyle(el);
      seen.push({
        name,
        cls: (el.className?.toString?.() ?? '').split(' ').slice(0, 3).join(' '),
        rect: { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) },
        bg: c.backgroundColor,
        color: c.color,
        colorScheme: c.colorScheme,
        border: c.borderColor,
        boxShadow: c.boxShadow.slice(0, 50),
      });
    };
    for (const sel of [
      '[role="menu"]',
      '.astryx-popover',
      '.astryx-tooltip',
      '.astryx-drawer',
      '.astryx-dialog',
      '[role="listbox"]',
      '.astryx-selector-popup',
      '[popover]:popover-open',
    ]) {
      for (const el of document.querySelectorAll(sel)) push(el, sel);
    }
    return seen;
  });

await page.goto(`${BASE}start`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(9000);
await settle(page);

for (const mode of ['light', 'dark']) {
  const m = (result[mode] = { appliedTheme: await setMode(page, mode) });
  await settle(page, 3000);

  const targets = [
    ['notification', '[data-testid="button-notification"]'],
    ['theme-toggle', '[data-testid="button-theme"]'],
    ['help', '[data-testid="button-help"]'],
    ['user-dropdown', '[data-testid="user-dropdown-button"]'],
    ['project-select', '[data-testid="selector-project"]'],
  ];
  m.surfaces = {};
  for (const [name, sel] of targets) {
    const el = page.locator(sel).first();
    if (!(await el.count())) {
      m.surfaces[name] = 'not found';
      continue;
    }
    if (name === 'theme-toggle' || name === 'help') {
      await el.hover();
      await page.waitForTimeout(900);
      m.surfaces[name] = { via: 'hover', open: await openSurfaces() };
      await page.mouse.move(800, 600);
      await page.waitForTimeout(500);
    } else {
      await el.click();
      await page.waitForTimeout(1400);
      m.surfaces[name] = { via: 'click', open: await openSurfaces() };
      await page.screenshot({ path: `${ROOT}/before-e2-${name}-${mode}.png` });
      await page.keyboard.press('Escape');
      await page.waitForTimeout(800);
    }
  }
  // hover states of the header buttons (a "wrong background" candidate)
  m.hoverBg = {};
  for (const [name, sel] of targets.slice(0, 4)) {
    const el = page.locator(sel).first();
    if (!(await el.count())) continue;
    await el.hover();
    await page.waitForTimeout(500);
    m.hoverBg[name] = await el.evaluate((e) => {
      const c = getComputedStyle(e);
      return { bg: c.backgroundColor, color: c.color };
    });
    await page.mouse.move(800, 600);
    await page.waitForTimeout(300);
  }
}

result.pageErrors = pageErrors;
fs.writeFileSync(`${ROOT}/before-pages-e2.json`, JSON.stringify(result, null, 2));
console.log('written');
await browser.close();
