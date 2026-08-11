/**
 * qa8 group (2) items A + E.
 *
 *  A. Start page announcement Banner — where does the action slot (Edit /
 *     Dismiss) sit vertically relative to the banner box? Legacy antd rendered
 *     `ant-alert-with-description`, i.e. `align-items: flex-start`.
 *  E. Header band — every control's colour + background, both modes, against
 *     `token.Layout.headerBg` from resources/theme.json
 *     (light #FF9729 / dark #E88A28).
 */
import { BASE, ROOT, launch, measure, setMode, settle } from './probe-pages-lib.mjs';
import fs from 'node:fs';

const { browser, page, pageErrors } = await launch();
const result = {};

await page.goto(`${BASE}start`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(9000);
await settle(page);

for (const mode of ['light', 'dark']) {
  const applied = await setMode(page, mode);
  await settle(page, 4000);
  const m = (result[mode] = { appliedTheme: applied });

  // ---- A. announcement banner -------------------------------------------
  m.banner = await page.evaluate(() => {
    const root = document.querySelector('.astryx-banner');
    if (!root) return null;
    const header = root; // themeProps('banner') is applied to the header div
    const box = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        x: +r.x.toFixed(1),
        y: +r.y.toFixed(1),
        w: +r.width.toFixed(1),
        h: +r.height.toFixed(1),
        cy: +(r.y + r.height / 2).toFixed(1),
      };
    };
    const icon = root.querySelector('.astryx-banner-icon');
    // the end area is the last direct child of the header
    const kids = [...header.children];
    const end = kids[kids.length - 1];
    const content = kids[1];
    const cs = getComputedStyle(header);
    return {
      headerAlignItems: cs.alignItems,
      headerPaddingBlock: `${cs.paddingBlockStart}/${cs.paddingBlockEnd}`,
      headerBg: cs.backgroundColor,
      root: box(root),
      icon: box(icon),
      content: box(content),
      contentColor: content ? getComputedStyle(content).color : null,
      end: box(end),
      endLabels: end
        ? [...end.querySelectorAll('button')].map(
            (b) => b.getAttribute('aria-label') || b.textContent?.trim(),
          )
        : [],
      // title vs description slots actually used
      titleText: header.querySelector('div > div:first-child')?.textContent?.slice(0, 30),
    };
  });

  // ---- E. header band ----------------------------------------------------
  m.header = await measure(page, '[data-testid="webui-header"]', [
    'background-color',
    'color',
    'height',
  ]);
  m.headerControls = await page.evaluate(() => {
    const band = document.querySelector('[data-testid="webui-header"]');
    if (!band) return null;
    const desc = (el, name) => {
      const c = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        name,
        tag: el.tagName.toLowerCase(),
        cls: (el.className?.toString?.() ?? '').split(' ').slice(0, 3).join(' '),
        color: c.color,
        bg: c.backgroundColor,
        rect: { x: +r.x.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) },
      };
    };
    const out = [];
    for (const el of band.querySelectorAll('button')) {
      out.push(
        desc(el, el.getAttribute('data-testid') || el.getAttribute('aria-label') || '(button)'),
      );
    }
    // the project label text + the ProjectSelect value
    const label = [...band.querySelectorAll('span,div')].find(
      (e) => e.children.length === 0 && /project/i.test(e.textContent ?? ''),
    );
    if (label) out.push(desc(label, '(project label text)'));
    const sel = band.querySelector('[data-testid="selector-project"]');
    if (sel) {
      out.push(desc(sel, '(project select root)'));
      for (const inner of sel.querySelectorAll('input,span,div')) {
        if (inner.children.length === 0 && (inner.textContent ?? '').trim())
          out.push(desc(inner, `(select inner "${inner.textContent.trim().slice(0, 16)}")`));
      }
    }
    // svg glyph colours
    for (const s of band.querySelectorAll('svg')) {
      const c = getComputedStyle(s);
      const host = s.closest('button');
      out.push({
        name: `svg@${host?.getAttribute('data-testid') || host?.getAttribute('aria-label') || '?'}`,
        tag: 'svg',
        cls: '',
        color: c.color,
        stroke: c.stroke,
        fill: c.fill,
        bg: c.backgroundColor,
      });
    }
    return out;
  });
  // the CSS custom props the on-dark MediaTheme is supposed to publish
  m.headerVars = await page.evaluate(() => {
    const band = document.querySelector('[data-testid="webui-header"]');
    const probe = band?.querySelector('[data-testid="button-theme"]');
    const read = (el, names) => {
      if (!el) return null;
      const c = getComputedStyle(el);
      return Object.fromEntries(names.map((n) => [n, c.getPropertyValue(n).trim()]));
    };
    const names = [
      '--color-text-primary',
      '--color-icon-primary',
      '--color-on-dark',
      '--color-accent',
      '--color-background-body',
      '--color-background-card',
      '--color-overlay-hover',
    ];
    return {
      band: read(band, names),
      themeButton: read(probe, names),
      root: read(document.documentElement, names),
    };
  });

  await page.screenshot({ path: `${ROOT}/before-pages-ae-${mode}.png` });
  await page
    .locator('[data-testid="webui-header"]')
    .screenshot({ path: `${ROOT}/before-header-${mode}.png` })
    .catch(() => {});
  const banner = page.locator('.astryx-banner').first();
  if (await banner.count())
    await banner.screenshot({ path: `${ROOT}/before-banner-${mode}.png` }).catch(() => {});
}

result.pageErrors = pageErrors;
fs.writeFileSync(`${ROOT}/before-pages-ae.json`, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
await browser.close();
