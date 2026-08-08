import fs from 'node:fs';
import { launch, login } from './probe.mjs';

const OUT = '.scratch/astryx-migration/shots/polish-2';
fs.mkdirSync(OUT, { recursive: true });

const { browser, page } = await launch();
await login(page);
console.log('url:', page.url());

// ---------------------------------------------------------------- tokens
const tokens = await page.evaluate(() => {
  const cs = getComputedStyle(document.documentElement);
  const out = {};
  for (const sheet of document.styleSheets) {
    let rules;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    for (const r of rules) {
      const walk = (rr) => {
        if (rr.style) {
          for (const p of rr.style) {
            if (
              p.startsWith('--color-info') ||
              p.startsWith('--color-success') ||
              p.startsWith('--color-error') ||
              p.startsWith('--color-warning') ||
              p.startsWith('--color-border') ||
              p.startsWith('--color-on-')
            )
              out[p] = null;
          }
        }
        if (rr.cssRules) for (const c of rr.cssRules) walk(c);
      };
      walk(r);
    }
  }
  const resolved = {};
  for (const k of Object.keys(out).sort())
    resolved[k] = cs.getPropertyValue(k).trim();
  return resolved;
});
console.log('TOKENS', JSON.stringify(tokens, null, 2));

// ---------------------------------------------------------------- header
const header = await page.evaluate(() => {
  const h = document.querySelector('.bai-webui-header');
  if (!h) return null;
  const snap = (el) => {
    const s = getComputedStyle(el);
    return {
      tag: el.tagName,
      cls: String(el.className).slice(0, 90),
      text: (el.textContent || '').trim().slice(0, 30),
      color: s.color,
      bg: s.backgroundColor,
    };
  };
  const kids = [...h.querySelectorAll('*')]
    .filter((e) => {
      const t = [...e.childNodes].some(
        (n) => n.nodeType === 3 && n.textContent.trim(),
      );
      return t || e.tagName === 'svg';
    })
    .slice(0, 25);
  return { root: snap(h), kids: kids.map(snap) };
});
console.log('HEADER', JSON.stringify(header, null, 2));

// ------------------------------------------------------------ breadcrumb
const bc = await page.evaluate(() => {
  const b = document.querySelector('[data-testid="webui-breadcrumb"]');
  if (!b) return null;
  const s = getComputedStyle(b);
  return {
    borderBottom: `${s.borderBottomWidth} ${s.borderBottomStyle} ${s.borderBottomColor}`,
    varBorder: getComputedStyle(document.documentElement)
      .getPropertyValue('--color-border')
      .trim(),
    varBorderEmph: getComputedStyle(document.documentElement)
      .getPropertyValue('--color-border-emphasized')
      .trim(),
  };
});
console.log('BREADCRUMB', JSON.stringify(bc, null, 2));

// ------------------------------------------------- collapsed sider items
const collapse = async () => {
  await page.locator('.bai-sider-shell').first().hover();
  await page.waitForTimeout(500);
  const btn = page.locator('button.bai-sider-toggle').first();
  await btn.click();
  await page.waitForTimeout(900);
};
await collapse();

const railInfo = await page.evaluate(() => {
  const nav = document.querySelector('.bai-sider');
  const navRect = nav.getBoundingClientRect();
  const items = [...document.querySelectorAll('.astryx-side-nav-item')];
  const rows = items.map((it) => {
    const s = getComputedStyle(it);
    const r = it.getBoundingClientRect();
    const svg = it.querySelector('svg');
    const sr = svg?.getBoundingClientRect();
    const host = svg?.parentElement;
    const hr = host?.getBoundingClientRect();
    const hs = host ? getComputedStyle(host) : null;
    return {
      label: (it.getAttribute('aria-label') || it.textContent || '')
        .trim()
        .slice(0, 22),
      itemX: +r.x.toFixed(2),
      itemW: +r.width.toFixed(2),
      justify: s.justifyContent,
      display: s.display,
      padL: s.paddingLeft,
      padR: s.paddingRight,
      gap: s.columnGap,
      transform: s.transform,
      textAlign: s.textAlign,
      hostTag: host?.tagName,
      hostCls: String(host?.className?.baseVal ?? host?.className ?? '').slice(
        0,
        40,
      ),
      hostW: hr ? +hr.width.toFixed(2) : null,
      hostFlex: hs ? `${hs.flexGrow}/${hs.flexShrink}/${hs.flexBasis}` : null,
      svgCX: sr ? +(sr.x + sr.width / 2).toFixed(2) : null,
      svgW: sr ? +sr.width.toFixed(2) : null,
      // distance of icon center from rail center
      offCenter: sr
        ? +(sr.x + sr.width / 2 - (navRect.x + navRect.width / 2)).toFixed(2)
        : null,
    };
  });
  return {
    navX: +navRect.x.toFixed(2),
    navW: +navRect.width.toFixed(2),
    rows,
  };
});
console.log('RAIL', JSON.stringify(railInfo, null, 2));

// ----------------------------------------------- toggle button collapsed
await page.locator('.bai-sider-shell').first().hover();
await page.waitForTimeout(500);
const toggle = await page.evaluate(() => {
  const b = document.querySelector('button.bai-sider-toggle');
  if (!b) return null;
  const s = getComputedStyle(b);
  const r = b.getBoundingClientRect();
  const parent = b.parentElement;
  const ps = getComputedStyle(parent);
  return {
    w: +r.width.toFixed(2),
    h: +r.height.toFixed(2),
    boxSizing: s.boxSizing,
    width: s.width,
    height: s.height,
    minW: s.minWidth,
    minH: s.minHeight,
    padding: `${s.paddingTop} ${s.paddingRight} ${s.paddingBottom} ${s.paddingLeft}`,
    border: s.borderWidth,
    lineHeight: s.lineHeight,
    alignSelf: s.alignSelf,
    flex: `${s.flexGrow}/${s.flexShrink}/${s.flexBasis}`,
    radius: s.borderRadius,
    parentTag: parent.tagName,
    parentCls: String(parent.className).slice(0, 60),
    parentDisplay: ps.display,
    parentAlignItems: ps.alignItems,
    parentH: +parent.getBoundingClientRect().height.toFixed(2),
  };
});
console.log('TOGGLE', JSON.stringify(toggle, null, 2));

await page.screenshot({
  path: `${OUT}/diag-collapsed-light.png`,
  clip: { x: 0, y: 0, width: 420, height: 1000 },
});

await browser.close();
