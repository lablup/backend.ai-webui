import { chromium } from '@playwright/test';
const BASE = process.env.URL ?? 'http://127.0.0.1:5312/phase6.html';
const b = await chromium.launch();
for (const mode of ['light', 'dark']) {
  const p = await b.newPage({ viewport: { width: 1500, height: 1000 }, colorScheme: mode });
  await p.goto(BASE, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1200);
  const anchor = p.locator('.bai-name-action-cell-title-area a').first();
  const read = async () =>
    anchor.evaluate((a) => {
      const walk = (n, depth = 0, out = []) => {
        const cs = getComputedStyle(n);
        out.push({ d: depth, tag: n.tagName, cls: String(n.className).split(' ')[0], color: cs.color, deco: cs.textDecorationLine });
        [...n.children].forEach((c) => walk(c, depth + 1, out));
        return out;
      };
      return walk(a);
    });
  console.log(`--- ${mode} resting`, JSON.stringify(await read(), null, 1));
  await anchor.hover();
  await p.waitForTimeout(300);
  console.log(`--- ${mode} hover`, JSON.stringify(await read(), null, 1));
  await p.close();
}
await b.close();
