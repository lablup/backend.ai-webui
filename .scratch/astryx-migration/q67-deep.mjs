/** Q-6/Q-7 deep probe: nav-item paint layers + tab strip geometry. */
import { chromium } from '@playwright/test';

const BASE = process.env.BASE ?? 'http://127.0.0.1:6070/';
const ROOT = process.env.ROOT;
const MODE = process.env.MODE ?? 'light';
const PATH_ = process.env.PATH_ ?? 'session';
const TAG = process.env.TAG ?? 'deep';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  storageState: `${ROOT}/q67-state.json`,
  colorScheme: MODE === 'dark' ? 'dark' : 'light',
});
const page = await ctx.newPage();
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(String(e)));
page.setDefaultNavigationTimeout(180000);
await page.goto(`${BASE}${PATH_}`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(16000);

const out = await page.evaluate(() => {
  const r = (el) => {
    const b = el.getBoundingClientRect();
    return { x: +b.x.toFixed(1), y: +b.y.toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1) };
  };
  const desc = (el, label) => {
    const cs = getComputedStyle(el);
    return {
      label,
      tag: el.tagName,
      cls: el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className,
      rect: r(el),
      bg: cs.backgroundColor,
      radius: cs.borderRadius,
      position: cs.position,
      inset: `${cs.top} ${cs.right} ${cs.bottom} ${cs.left}`,
      zIndex: cs.zIndex,
    };
  };
  const pseudo = (el, which) => {
    const cs = getComputedStyle(el, which);
    return {
      which,
      content: cs.content,
      bg: cs.backgroundColor,
      radius: cs.borderRadius,
      position: cs.position,
      inset: `${cs.top} ${cs.right} ${cs.bottom} ${cs.left}`,
      display: cs.display,
      opacity: cs.opacity,
    };
  };

  const navItems = Array.from(document.querySelectorAll('.astryx-side-nav-item'));
  const sel = navItems.find((n) => n.getAttribute('data-selected') === 'selected') ?? navItems[0];
  const navReport = sel
    ? {
        self: desc(sel, 'selected-item'),
        before: pseudo(sel, '::before'),
        after: pseudo(sel, '::after'),
        children: Array.from(sel.children).map((c, i) => desc(c, `child${i}`)),
        parentChain: (() => {
          const chain = [];
          let p = sel.parentElement;
          for (let i = 0; i < 3 && p; i++, p = p.parentElement) chain.push(desc(p, `parent${i}`));
          return chain;
        })(),
      }
    : null;

  const strip = document.querySelector('.bai-tab-list--card');
  const stripReport = strip
    ? {
        self: desc(strip, 'strip'),
        cs: (() => {
          const cs = getComputedStyle(strip);
          return {
            display: cs.display,
            width: cs.width,
            maxWidth: cs.maxWidth,
            borderBottom: `${cs.borderBottomWidth} ${cs.borderBottomStyle} ${cs.borderBottomColor}`,
            alignItems: cs.alignItems,
            gap: cs.gap,
          };
        })(),
        parent: strip.parentElement ? desc(strip.parentElement, 'strip-parent') : null,
        grandparent: strip.parentElement?.parentElement
          ? desc(strip.parentElement.parentElement, 'strip-grandparent')
          : null,
        tabs: Array.from(strip.querySelectorAll('.astryx-tab')).map((t, i) => ({
          i,
          label: (t.innerText || '').trim().slice(0, 16),
          selected: t.getAttribute('data-selected'),
          rect: r(t),
          before: pseudo(t, '::before'),
          after: pseudo(t, '::after'),
        })),
      }
    : null;

  return { navReport, stripReport };
});

console.log(JSON.stringify({ MODE, PATH_, pageErrors, ...out }, null, 2));

// Cropped shots
const sider = await page.$('.bai-sider');
if (sider) await sider.screenshot({ path: `${ROOT}/shots/tab-sider-restore/${TAG}-sider-${MODE}.png` });
const strip = await page.$('.bai-tab-list--card');
if (strip) {
  const b = await strip.boundingBox();
  if (b)
    await page.screenshot({
      path: `${ROOT}/shots/tab-sider-restore/${TAG}-tabs-${MODE}.png`,
      clip: { x: b.x - 8, y: b.y - 8, width: Math.min(b.width + 16, 1580), height: b.height + 40 },
    });
}
await browser.close();
