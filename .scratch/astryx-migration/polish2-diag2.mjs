import fs from 'node:fs';
import { launch, login } from './probe.mjs';

const OUT = '.scratch/astryx-migration/shots/polish-2';
fs.mkdirSync(OUT, { recursive: true });

const { browser, page } = await launch();
await login(page);

const result = {};

result.tokens = await page.evaluate(() => {
  const cs = getComputedStyle(document.documentElement);
  const names = new Set();
  for (const sheet of document.styleSheets) {
    let rules;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    const walk = (rr) => {
      if (rr.style)
        for (const p of rr.style)
          if (/^--color-(info|success|error|warning|border|on-)/.test(p))
            names.add(p);
      if (rr.cssRules) for (const c of rr.cssRules) walk(c);
    };
    for (const r of rules) walk(r);
  }
  const out = {};
  for (const k of [...names].sort()) out[k] = cs.getPropertyValue(k).trim();
  return out;
});

result.header = await page.evaluate(() => {
  const h = document.querySelector('.bai-webui-header');
  if (!h) return null;
  const snap = (el) => {
    const s = getComputedStyle(el);
    return {
      tag: el.tagName,
      cls: String(el.className?.baseVal ?? el.className).slice(0, 70),
      text: (el.textContent || '').trim().slice(0, 24),
      color: s.color,
      bg: s.backgroundColor,
      themeAttr: el.closest('[data-astryx-theme]')?.getAttribute('data-astryx-theme'),
      scheme: getComputedStyle(el).colorScheme,
    };
  };
  const kids = [...h.querySelectorAll('*')].filter(
    (e) =>
      e.tagName === 'svg' ||
      [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()),
  );
  return { root: snap(h), kids: kids.slice(0, 20).map(snap) };
});

result.breadcrumb = await page.evaluate(() => {
  const b = document.querySelector('[data-testid="webui-breadcrumb"]');
  const s = getComputedStyle(b);
  const root = getComputedStyle(document.documentElement);
  return {
    borderBottomColor: s.borderBottomColor,
    borderBottomWidth: s.borderBottomWidth,
    varBorder: root.getPropertyValue('--color-border').trim(),
    varBorderEmphasized: root.getPropertyValue('--color-border-emphasized').trim(),
  };
});

// -------- structure of the rail, EXPANDED then COLLAPSED
const railSnapshot = () =>
  page.evaluate(() => {
    const nav = document.querySelector('.bai-sider');
    const navRect = nav.getBoundingClientRect();
    const path = (el) => {
      const parts = [];
      let cur = el.parentElement;
      for (let i = 0; i < 4 && cur; i++) {
        const c = String(cur.className?.baseVal ?? cur.className ?? '');
        const s = getComputedStyle(cur);
        parts.push({
          tag: cur.tagName,
          cls: c.slice(0, 60),
          display: s.display,
          alignItems: s.alignItems,
          w: +cur.getBoundingClientRect().width.toFixed(1),
          padL: s.paddingLeft,
        });
        cur = cur.parentElement;
      }
      return parts;
    };
    const items = [...document.querySelectorAll('.astryx-side-nav-item')];
    return {
      navX: +navRect.x.toFixed(1),
      navW: +navRect.width.toFixed(1),
      rows: items.map((it) => {
        const s = getComputedStyle(it);
        const r = it.getBoundingClientRect();
        return {
          label: (it.getAttribute('aria-label') || it.textContent || '')
            .trim()
            .slice(0, 20),
          x: +r.x.toFixed(1),
          w: +r.width.toFixed(1),
          alignSelf: s.alignSelf,
          marginInline: `${s.marginLeft}/${s.marginRight}`,
          width: s.width,
          parents: path(it),
        };
      }),
    };
  });

result.railExpanded = await railSnapshot();

await page.locator('.bai-sider-shell').first().hover();
await page.waitForTimeout(400);
await page.locator('button.bai-sider-toggle').first().click();
await page.waitForTimeout(900);
result.railCollapsed = await railSnapshot();

const toggleSnap = () =>
  page.evaluate(() => {
    const b = document.querySelector('button.bai-sider-toggle');
    const s = getComputedStyle(b);
    const r = b.getBoundingClientRect();
    return {
      rect: { w: +r.width.toFixed(2), h: +r.height.toFixed(2) },
      width: s.width,
      height: s.height,
      minH: s.minHeight,
      maxH: s.maxHeight,
      radius: s.borderRadius,
      padding: s.padding,
      alignSelf: s.alignSelf,
      overflow: s.overflow,
      inset: `${s.top}/${s.left}`,
      position: s.position,
    };
  });

await page.locator('.bai-sider-shell').first().hover();
await page.waitForTimeout(500);
result.toggleCollapsed = await toggleSnap();
await page.screenshot({
  path: `${OUT}/diag-toggle-collapsed.png`,
  clip: { x: 40, y: 55, width: 80, height: 60 },
});

// expand again and measure toggle
await page.locator('button.bai-sider-toggle').first().click();
await page.waitForTimeout(900);
await page.locator('.bai-sider-shell').first().hover();
await page.waitForTimeout(500);
result.toggleExpanded = await toggleSnap();
await page.screenshot({
  path: `${OUT}/diag-toggle-expanded.png`,
  clip: { x: 205, y: 55, width: 80, height: 60 },
});

fs.writeFileSync(`${OUT}/diag2.json`, JSON.stringify(result, null, 2));
console.log('written');
console.log(JSON.stringify(result.tokens, null, 2));
console.log('BREADCRUMB', JSON.stringify(result.breadcrumb));
console.log('TOGGLE-C', JSON.stringify(result.toggleCollapsed));
console.log('TOGGLE-E', JSON.stringify(result.toggleExpanded));

await browser.close();
