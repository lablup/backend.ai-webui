// POLISH-3 measurement probe.
//   item 3 — sider "Admin Settings" row vs the admin-mode back-button row
//   item 4 — sider logo band placement (left-aligned?)
//   item 5 — UserSettings search input fill
//   item 6 — Start page ActionItemContent typography
import fs from 'node:fs';
import { launch, login, BASE } from './probe.mjs';

const OUT = '.scratch/astryx-migration/shots/polish-3';
fs.mkdirSync(OUT, { recursive: true });
const TAG = process.env.TAG ?? 'before';

const { browser, page } = await launch();
page.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 300)));
await login(page);

const result = {};

const modeOf = () =>
  page.evaluate(
    () => getComputedStyle(document.documentElement).colorScheme,
  );

const setMode = async (mode) => {
  if ((await modeOf()) !== mode) {
    await page.locator('[data-testid="button-theme"]').first().click();
    await page.waitForTimeout(1200);
  }
  return modeOf();
};

// ---------------------------------------------------------------- item 3+4
const siderGeom = () =>
  page.evaluate(() => {
    const r = (el) => {
      if (!el) return null;
      const b = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return {
        x: +b.x.toFixed(2),
        y: +b.y.toFixed(2),
        w: +b.width.toFixed(2),
        h: +b.height.toFixed(2),
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        paddingInlineStart: cs.paddingInlineStart,
        gap: cs.gap,
      };
    };
    const out = { rail: r(document.querySelector('.bai-sider')) };
    // logo band
    out.logoBand = r(document.querySelector('.logo-and-text-container'));
    out.logoWrap = r(document.querySelector('.logo-img-wrap'));
    out.logoImg = r(document.querySelector('.logo-and-text-container img'));
    const bandEl = document.querySelector('.logo-and-text-container');
    if (bandEl) {
      const cs = getComputedStyle(bandEl);
      out.logoBandCss = {
        alignItems: cs.alignItems,
        justifyContent: cs.justifyContent,
        paddingInlineStart: cs.paddingInlineStart,
        paddingInlineEnd: cs.paddingInlineEnd,
        margin: cs.margin,
        flexDirection: cs.flexDirection,
      };
    }
    const headerHost = bandEl?.parentElement;
    if (headerHost) {
      const cs = getComputedStyle(headerHost);
      out.logoHeaderHost = {
        cls: headerHost.className,
        ...r(headerHost),
        alignItems: cs.alignItems,
        padding: cs.padding,
      };
    }

    // nav rows
    const rows = [...document.querySelectorAll('.astryx-side-nav-item')].map(
      (el) => {
        const svg = el.querySelector('svg');
        const iconHost = el.firstElementChild;
        // the label text node's box
        const label = [...el.children].find((c) => c !== iconHost);
        return {
          text: (el.textContent || '').trim().slice(0, 24),
          row: r(el),
          icon: r(svg),
          iconHost: r(iconHost),
          label: r(label),
        };
      },
    );
    out.rows = rows;

    // admin back-button row (rendered only in admin mode)
    const backBtn = document.querySelector(
      '.bai-sider button[aria-label], .bai-sider .astryx-icon-button',
    );
    return out;
  });

const adminHeaderGeom = () =>
  page.evaluate(() => {
    const r = (el) => {
      if (!el) return null;
      const b = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return {
        x: +b.x.toFixed(2),
        y: +b.y.toFixed(2),
        w: +b.width.toFixed(2),
        h: +b.height.toFixed(2),
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        paddingInline: `${cs.paddingInlineStart}/${cs.paddingInlineEnd}`,
      };
    };
    // the HStack that holds [IconButton, Text]
    const nav = document.querySelector('.bai-sider');
    if (!nav) return null;
    const btn = nav.querySelector('button');
    if (!btn) return null;
    const rowEl = btn.parentElement;
    const svg = btn.querySelector('svg');
    const textEl = [...rowEl.children].find((c) => c !== btn);
    const cs = getComputedStyle(rowEl);
    return {
      row: { ...r(rowEl), gap: cs.gap, alignItems: cs.alignItems },
      button: r(btn),
      icon: r(svg),
      text: r(textEl),
      textContent: (textEl?.textContent || '').trim(),
    };
  });

// ------------------------------------------------------------------ item 6
const startTypography = () =>
  page.evaluate(() => {
    const pick = (el) => {
      if (!el) return null;
      const cs = getComputedStyle(el);
      const b = el.getBoundingClientRect();
      return {
        text: (el.textContent || '').trim().slice(0, 30),
        tag: el.tagName.toLowerCase(),
        cls: String(el.className).slice(0, 60),
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        lineHeight: cs.lineHeight,
        color: cs.color,
        h: +b.height.toFixed(2),
      };
    };
    // Board item cards: title = first .astryx-text/-heading inside the 50px
    // icon circle's sibling box; description = the supporting text.
    const cards = [...document.querySelectorAll('.astryx-text, .astryx-heading')]
      .filter((el) => el.closest('[data-item-id], .awsui_content_'))
      .map(pick);
    // fallback: every text in the board region
    const board = document.querySelector('[data-testid="bai-board"]') ??
      document.body;
    const all = [...board.querySelectorAll('.astryx-text, .astryx-heading, .astryx-button')]
      .slice(0, 40)
      .map(pick);
    return { cards, all };
  });

// ------------------------------------------------------------------ item 5
const settingsSearch = () =>
  page.evaluate(() => {
    const r = (el) => {
      if (!el) return null;
      const b = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return {
        x: +b.x.toFixed(2),
        w: +b.width.toFixed(2),
        h: +b.height.toFixed(2),
        display: cs.display,
        flex: cs.flex,
        width: cs.width,
      };
    };
    const input = document.querySelector('.astryx-text-input');
    if (!input) return null;
    // the field wrapper Astryx renders (label+control+status)
    let field = input;
    while (field && !field.parentElement?.classList?.contains('astryx-flex') &&
      field.parentElement && field.parentElement !== document.body) {
      field = field.parentElement;
    }
    const row = field?.parentElement;
    return {
      input: r(input),
      field: { cls: String(field?.className).slice(0, 60), ...r(field) },
      row: { cls: String(row?.className).slice(0, 60), ...r(row) },
      siblings: [...(row?.children ?? [])].map((c) => ({
        cls: String(c.className).slice(0, 50),
        ...r(c),
      })),
    };
  });

// ============================================================ run
for (const mode of ['light', 'dark']) {
  await setMode(mode);
  await page.waitForTimeout(600);

  // Start page
  await page.goto(`${BASE}start`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  result[`start-${mode}`] = await startTypography();
  result[`sider-general-${mode}`] = await siderGeom();
  await page.screenshot({ path: `${OUT}/${TAG}-start-${mode}.png` });
  await page
    .locator('.bai-sider')
    .screenshot({ path: `${OUT}/${TAG}-sider-general-${mode}.png` });

  // Admin mode
  const adminItem = page
    .locator('.astryx-side-nav-item', { hasText: /Admin Settings|관리자 설정/ })
    .first();
  if (await adminItem.count()) {
    await adminItem.click();
    await page.waitForTimeout(4000);
    result[`sider-admin-${mode}`] = await adminHeaderGeom();
    result[`sider-admin-rows-${mode}`] = await siderGeom();
    await page
      .locator('.bai-sider')
      .screenshot({ path: `${OUT}/${TAG}-sider-admin-${mode}.png` });
  }

  // Settings page (user settings)
  await page.goto(`${BASE}usersettings`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  result[`settings-${mode}`] = await settingsSearch();
  await page.screenshot({ path: `${OUT}/${TAG}-settings-${mode}.png` });
}

fs.writeFileSync(
  `${OUT}/${TAG}.json`,
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result, null, 2).slice(0, 12000));
await browser.close();
