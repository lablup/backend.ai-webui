/**
 * qa8 (1)C — the admin-users LINE tab loses its label entirely on hover in dark.
 *
 * The label's computed `color` stays white, so this is not a contrast problem:
 * something is painting OVER the text. Dump every layer of the hovered tab with
 * its stacking inputs (z-index, position, isolation, transform) plus what the
 * hit test returns at the label's centre, and read the label's own paint order.
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE =
  process.env.BASE ?? 'https://to-astryx.backend-ai-webui.localhost:1357/';
const ROOT = process.env.ROOT ?? '.scratch/astryx-migration/qa8';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  ignoreHTTPSErrors: true,
  storageState: `${ROOT}/state.json`,
});
const page = await ctx.newPage();
page.setDefaultNavigationTimeout(180000);
page.setDefaultTimeout(30000);

await page.goto(`${BASE}admin/users`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(10000);
await page.evaluate(() => {
  if (document.documentElement.dataset.theme !== 'dark') {
    const b = Array.from(document.querySelectorAll('button')).find((x) =>
      /dark|theme|mode/i.test(x.getAttribute('aria-label') || x.title || ''),
    );
    if (b) b.click();
  }
});
await page.waitForTimeout(2500);

const tab = page.locator('.astryx-tab, [role="tab"]').first();
await tab.hover();
await page.waitForTimeout(700);

const dump = await tab.evaluate((el) => {
  const walk = (node, path, acc) => {
    const cs = getComputedStyle(node);
    const r = node.getBoundingClientRect();
    acc.push({
      path,
      tag: node.tagName.toLowerCase(),
      cls: (node.getAttribute('class') || '').slice(0, 60),
      text: (node.textContent || '').trim().slice(0, 18),
      bg: cs.backgroundColor,
      bgImage: cs.backgroundImage,
      color: cs.color,
      position: cs.position,
      zIndex: cs.zIndex,
      isolation: cs.isolation,
      mixBlendMode: cs.mixBlendMode,
      opacity: cs.opacity,
      transform: cs.transform,
      inset: `${cs.top} ${cs.right} ${cs.bottom} ${cs.left}`,
      rect: {
        x: +r.x.toFixed(1),
        y: +r.y.toFixed(1),
        w: +r.width.toFixed(1),
        h: +r.height.toFixed(1),
      },
    });
    for (const p of ['::before', '::after']) {
      const ps = getComputedStyle(node, p);
      if (ps.content && ps.content !== 'none') {
        acc.push({
          path: path + p,
          tag: p,
          cls: '',
          text: '',
          bg: ps.backgroundColor,
          bgImage: ps.backgroundImage,
          color: ps.color,
          position: ps.position,
          zIndex: ps.zIndex,
          isolation: ps.isolation,
          mixBlendMode: ps.mixBlendMode,
          opacity: ps.opacity,
          transform: ps.transform,
          inset: `${ps.top} ${ps.right} ${ps.bottom} ${ps.left}`,
          rect: null,
        });
      }
    }
    [...node.children].forEach((c, i) => walk(c, `${path}>${i}`, acc));
    return acc;
  };
  const acc = walk(el, 'tab', []);
  const r = el.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  const stack = document.elementsFromPoint(cx, cy).slice(0, 6).map((n) => ({
    tag: n.tagName.toLowerCase(),
    cls: (n.getAttribute('class') || '').slice(0, 50),
    bg: getComputedStyle(n).backgroundColor,
    bgImage: getComputedStyle(n).backgroundImage,
  }));
  return { layers: acc, hitStack: stack, tabRect: { w: r.width, h: r.height } };
});

fs.writeFileSync(
  `${ROOT}/before-tab-overlay.json`,
  JSON.stringify(dump, null, 2),
);
console.log(JSON.stringify(dump, null, 2));
await browser.close();
