// In dark mode, list every element painting a LIGHT background — with the
// CSS rules that set it, so the root cause is identifiable (not guessed).
// Usage: node scan-light-surfaces.mjs <url> [selectorHint]
import { chromium } from '@playwright/test';

const url = process.argv[2];
const browser = await chromium.launch();
const ctx = await browser.newContext({
  colorScheme: 'dark',
  viewport: { width: 1440, height: 1000 },
});
const page = await ctx.newPage();
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

const out = await page.evaluate(() => {
  const lum = (rgb) => {
    const m = rgb.match(/[\d.]+/g);
    if (!m) return null;
    const [r, g, b, a = '1'] = m.map(Number);
    if (a === 0) return null;
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  };
  const hits = [];
  const seen = new Set();
  for (const el of Array.from(document.querySelectorAll('*'))) {
    const cs = getComputedStyle(el);
    const l = lum(cs.backgroundColor);
    if (l === null || l < 0.6) continue;
    const r = el.getBoundingClientRect();
    if (r.width * r.height < 400) continue;
    // Which rules set background-color on this element?
    const rules = [];
    for (const ss of Array.from(document.styleSheets)) {
      let list;
      try {
        list = ss.cssRules;
      } catch {
        continue;
      }
      const walk = (rl) => {
        for (const rule of Array.from(rl)) {
          if (rule.cssRules) {
            walk(rule.cssRules);
            continue;
          }
          if (!rule.selectorText) continue;
          if (!/background(-color)?\s*:/.test(rule.style?.cssText ?? ''))
            continue;
          try {
            if (el.matches(rule.selectorText)) {
              rules.push(
                `${rule.selectorText} { ${rule.style.getPropertyValue('background-color') || rule.style.getPropertyValue('background')} }`,
              );
            }
          } catch {
            /* :scope-relative or unsupported selector */
          }
        }
      };
      walk(list);
    }
    const key = `${el.tagName}|${el.className}|${cs.backgroundColor}`;
    if (seen.has(key)) continue;
    seen.add(key);
    hits.push({
      tag: el.tagName.toLowerCase(),
      cls: String(el.className).slice(0, 120),
      inlineBg: el.style.backgroundColor || null,
      bg: cs.backgroundColor,
      size: `${Math.round(r.width)}x${Math.round(r.height)}`,
      data: Array.from(el.attributes)
        .filter((a) => a.name.startsWith('data-'))
        .map((a) => `${a.name}=${a.value}`)
        .slice(0, 6),
      rules: rules.slice(-4),
      path: (() => {
        const p = [];
        let n = el;
        while (n && n !== document.body && p.length < 6) {
          p.unshift(
            n.tagName.toLowerCase() +
              (n.className
                ? '.' + String(n.className).split(/\s+/).slice(0, 2).join('.')
                : ''),
          );
          n = n.parentElement;
        }
        return p.join(' > ');
      })(),
    });
  }
  return hits;
});
console.log(JSON.stringify(out, null, 2));
await browser.close();
