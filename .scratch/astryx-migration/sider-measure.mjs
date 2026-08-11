import fs from 'node:fs';
import { launch, login } from './probe.mjs';

const OUT = '.scratch/astryx-migration/shots/sider-fixes';
fs.mkdirSync(OUT, { recursive: true });

const { browser, page } = await launch();
await login(page);
console.log('url:', page.url());

const shell = page.locator('.bai-sider-shell').first();

// --- measure section title metrics
const sectionInfo = await page.evaluate(() => {
  const sec = document.querySelector('.astryx-side-nav-section');
  if (!sec) return null;
  const header = sec.firstElementChild;
  const title = header?.querySelector('span span') ?? header?.querySelector('span');
  const cs = (el) => {
    const s = getComputedStyle(el);
    return {
      fontSize: s.fontSize,
      fontWeight: s.fontWeight,
      color: s.color,
      padding: `${s.paddingTop} ${s.paddingRight} ${s.paddingBottom} ${s.paddingLeft}`,
      rect: el.getBoundingClientRect().toJSON(),
    };
  };
  return {
    section: cs(sec),
    header: cs(header),
    title: cs(title),
    titleText: title?.textContent,
    tokens: {
      supportingSize: getComputedStyle(sec).getPropertyValue('--text-supporting-size'),
      spacing2: getComputedStyle(sec).getPropertyValue('--spacing-2'),
    },
  };
});
console.log('SECTION', JSON.stringify(sectionInfo, null, 2));

// --- measure a side nav item + its icon
const itemInfo = await page.evaluate(() => {
  const items = [...document.querySelectorAll('.astryx-side-nav-item')];
  const out = [];
  for (const it of items.slice(0, 30)) {
    const label = it.textContent?.trim();
    const icon = it.querySelector('svg');
    const iconHost = icon?.parentElement;
    if (!icon) continue;
    const r = icon.getBoundingClientRect();
    const hr = iconHost.getBoundingClientRect();
    out.push({
      label,
      host: iconHost.className?.baseVal ?? iconHost.className,
      hostRect: { w: +hr.width.toFixed(2), h: +hr.height.toFixed(2) },
      svgRect: { w: +r.width.toFixed(2), h: +r.height.toFixed(2) },
      viewBox: icon.getAttribute('viewBox'),
      svgW: getComputedStyle(icon).width,
      svgH: getComputedStyle(icon).height,
      itemRect: { x: +it.getBoundingClientRect().x.toFixed(1), h: +it.getBoundingClientRect().height.toFixed(1) },
      itemFontSize: getComputedStyle(it).fontSize,
    });
  }
  return out;
});
console.log('ITEMS', JSON.stringify(itemInfo, null, 2));

// --- toggle button
await shell.hover();
await page.waitForTimeout(600);
const toggleInfo = await page.evaluate(() => {
  const btns = [...document.querySelectorAll('.bai-sider-shell .astryx-button')];
  return btns.map((b) => {
    const s = getComputedStyle(b);
    const r = b.getBoundingClientRect();
    return {
      label: b.getAttribute('aria-label'),
      cls: b.className,
      w: +r.width.toFixed(1),
      h: +r.height.toFixed(1),
      x: +r.x.toFixed(1),
      borderRadius: s.borderRadius,
      background: s.backgroundColor,
      border: `${s.borderWidth} ${s.borderStyle} ${s.borderColor}`,
      boxShadow: s.boxShadow,
      color: s.color,
      fontSize: s.fontSize,
    };
  });
});
console.log('TOGGLE', JSON.stringify(toggleInfo, null, 2));

await page.screenshot({ path: `${OUT}/before-light-expanded.png`, clip: { x: 0, y: 0, width: 340, height: 1000 } });

// tooltip
const tb = page.locator('.bai-sider-shell button[aria-label]').first();
await tb.hover();
await page.waitForTimeout(900);
await page.screenshot({ path: `${OUT}/before-light-toggle-tooltip.png`, clip: { x: 0, y: 0, width: 560, height: 400 } });

await browser.close();
