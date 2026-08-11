import { chromium } from '@playwright/test';

export const BASE = process.env.BAI_BASE ?? 'http://127.0.0.1:5920/';
const EMAIL = process.env.BAI_EMAIL ?? 'admin@lablup.com';
const PW = process.env.BAI_PW ?? 'wJalrXUt';
const ENDPOINT = process.env.BAI_ENDPOINT ?? 'http://10.82.0.130:8090';

export async function launch({ dark = false, width = 1600, height = 1000 } = {}) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2,
    colorScheme: dark ? 'dark' : 'light',
  });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 200)));
  page.on('console', (m) => {
    if (m.type() === 'error') console.log('[console.error]', m.text().slice(0, 250));
  });
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  return { browser, ctx, page };
}

export async function login(page) {
  await page.waitForTimeout(6000);
  const userInput = page.locator('input[placeholder="Email or Username"]').first();
  if (await userInput.count()) {
    const ep = page.locator('input[placeholder="Endpoint"]').first();
    if (await ep.count()) await ep.fill(ENDPOINT);
    await userInput.fill(EMAIL);
    await page.locator('input[type="password"]').first().fill(PW);
    await page.getByRole('button', { name: /^login$/i }).first().click();
  }
  await page.waitForTimeout(12000);
}

/** Geometry of every .astryx-button-group on the page. */
export async function groupGeom(page) {
  return page.evaluate(() => {
    return [...document.querySelectorAll('.astryx-button-group')].map((g) => {
      const gr = g.getBoundingClientRect();
      const btns = [...g.querySelectorAll('button')].filter(
        (b) => b.getBoundingClientRect().width > 0,
      );
      const kids = btns.map((b) => {
        const r = b.getBoundingClientRect();
        const s = getComputedStyle(b);
        return {
          text: (b.textContent ?? '').trim().slice(0, 24),
          cls: String(b.className).slice(0, 40),
          parentTag: b.parentElement?.tagName,
          parentDisplay: b.parentElement
            ? getComputedStyle(b.parentElement).display
            : null,
          x: +r.x.toFixed(2),
          right: +r.right.toFixed(2),
          w: +r.width.toFixed(2),
          h: +r.height.toFixed(2),
          radius: s.borderRadius,
        };
      });
      const gaps = [];
      for (let i = 1; i < kids.length; i++)
        gaps.push(+(kids[i].x - kids[i - 1].right).toFixed(2));
      return {
        label: g.getAttribute('aria-label'),
        w: +gr.width.toFixed(2),
        h: +gr.height.toFixed(2),
        kids,
        gaps,
      };
    });
  });
}

export async function shotOf(page, locator, path, pad = 12) {
  await locator.scrollIntoViewIfNeeded().catch(() => {});
  await page.waitForTimeout(400);
  const box = await locator.boundingBox();
  if (!box) {
    console.log('no box for', path);
    return;
  }
  await page.screenshot({
    path,
    clip: {
      x: Math.max(0, box.x - pad),
      y: Math.max(0, box.y - pad),
      width: box.width + pad * 2,
      height: box.height + pad * 2,
    },
  });
}
