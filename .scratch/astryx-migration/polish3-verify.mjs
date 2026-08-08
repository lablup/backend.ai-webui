// POLISH-3 verification probe — all six items, light + dark, with screenshots.
import fs from 'node:fs';
import { launch, login, BASE } from './probe.mjs';

const OUT = '.scratch/astryx-migration/shots/polish-3';
fs.mkdirSync(OUT, { recursive: true });
const TAG = process.env.TAG ?? 'after';

const { browser, page } = await launch();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
await login(page);

const modeOf = () =>
  page.evaluate(() => getComputedStyle(document.documentElement).colorScheme);
const setMode = async (mode) => {
  if ((await modeOf()) !== mode) {
    await page.locator('[data-testid="button-theme"]').first().click();
    await page.waitForTimeout(1500);
  }
  return modeOf();
};

const R = `(el) => {
  if (!el) return null;
  const b = el.getBoundingClientRect();
  const cs = getComputedStyle(el);
  return {
    x: +b.x.toFixed(2), y: +b.y.toFixed(2),
    w: +b.width.toFixed(2), h: +b.height.toFixed(2),
    fontSize: cs.fontSize, fontWeight: cs.fontWeight,
    lineHeight: cs.lineHeight, alignItems: cs.alignItems,
    paddingInlineStart: cs.paddingInlineStart, margin: cs.margin,
  };
}`;

const siderLogo = () =>
  page.evaluate(
    (r) => {
      const R = eval(r);
      const band = document.querySelector('.logo-and-text-container');
      const wide = document.querySelector('img.logo-wide');
      const mark = document.querySelector('img.logo-collapsed');
      const visible = (el) => !!(el && el.getBoundingClientRect().width);
      return {
        band: R(band),
        wide: visible(wide) ? R(wide) : null,
        collapsedMark: visible(mark) ? R(mark) : null,
        rail: R(document.querySelector('.bai-sider')),
      };
    },
    R,
  );

const adminHeaderText = () =>
  page.evaluate(
    (r) => {
      const R = eval(r);
      const sider = document.querySelector('.bai-sider');
      const txt = sider?.querySelector('.astryx-text.large');
      const btn = sider?.querySelector('button');
      return {
        text: R(txt),
        textContent: (txt?.textContent || '').trim(),
        row: R(btn?.parentElement),
        button: R(btn),
        icon: R(btn?.querySelector('svg')),
      };
    },
    R,
  );

const cardType = () =>
  page.evaluate(
    (r) => {
      const R = eval(r);
      const out = [];
      for (const el of document.querySelectorAll(
        '.astryx-text, .astryx-button',
      )) {
        if (el.closest('.bai-sider-shell') || el.closest('header')) continue;
        const t = (el.textContent || '').trim();
        if (!t) continue;
        out.push({ t: t.slice(0, 30), cls: String(el.className).slice(0, 38), ...R(el) });
      }
      return out.slice(0, 30);
    },
    R,
  );

const searchRow = () =>
  page.evaluate(
    (r) => {
      const R = eval(r);
      const inp = document.querySelector('input[placeholder]');
      if (!inp) return null;
      const field = inp.closest('.astryx-field');
      const row = field?.parentElement;
      return {
        field: R(field),
        row: R(row),
        siblings: [...(row?.children ?? [])].map((c) => ({
          cls: String(c.className).slice(0, 34),
          t: (c.textContent || '').trim().slice(0, 18),
          ...R(c),
        })),
      };
    },
    R,
  );

const result = {};
for (const mode of ['light', 'dark']) {
  await setMode(mode);

  // Start page — logo band, card typography
  await page.goto(`${BASE}start`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);
  result[`logo-expanded-${mode}`] = await siderLogo();
  result[`cards-${mode}`] = await cardType();
  await page.screenshot({ path: `${OUT}/${TAG}-start-${mode}.png` });
  await page
    .locator('.bai-sider-shell')
    .screenshot({ path: `${OUT}/${TAG}-sider-general-${mode}.png` });

  // Collapsed rail (the `[` shortcut toggles it)
  await page.keyboard.press('[');
  await page.waitForTimeout(1200);
  result[`logo-collapsed-${mode}`] = await siderLogo();
  await page
    .locator('.bai-sider-shell')
    .screenshot({ path: `${OUT}/${TAG}-sider-collapsed-${mode}.png` });
  await page.keyboard.press('[');
  await page.waitForTimeout(1200);

  // Admin menu — back-row geometry
  await page
    .locator('.astryx-side-nav-item', { hasText: 'Admin Settings' })
    .first()
    .click();
  await page.waitForTimeout(6000);
  result[`admin-header-${mode}`] = await adminHeaderText();
  await page
    .locator('.bai-sider-shell')
    .screenshot({ path: `${OUT}/${TAG}-sider-admin-${mode}.png` });

  // Settings — search fill
  await page.goto(`${BASE}usersettings`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(9000);
  result[`settings-${mode}`] = await searchRow();
  await page.screenshot({ path: `${OUT}/${TAG}-settings-${mode}.png` });
}

result.pageerrors = errors;
fs.writeFileSync(`${OUT}/${TAG}-verify.json`, JSON.stringify(result, null, 2));
console.log('pageerrors:', errors.length);
await browser.close();
