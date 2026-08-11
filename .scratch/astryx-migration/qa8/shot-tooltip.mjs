/**
 * qa8 (1) Q-10 — before/after crops of the tooltip bubble in DARK mode.
 *
 * The "before" is rendered by injecting the exact paint the component had prior
 * to the theme pin (Astryx's inversion: the bubble takes `--color-text-primary`
 * and the copy takes `--color-background-surface`), which is what
 * `before-tokens.json` measured — `rgb(255,255,255)` on `rgb(20,20,20)`. That
 * keeps both crops from one run, at one viewport, with one tooltip.
 */
import { chromium } from '@playwright/test';

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

await page.goto(`${BASE}session`, { waitUntil: 'domcontentloaded' });
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

const shoot = async (tag) => {
  // `.first()` lands on the sider's collapse control, which is deliberately
  // `visibility: hidden` until the rail is hovered — pick a visible trigger.
  const trigger = page.locator('button[aria-label]:visible').first();
  await trigger.hover();
  await page.waitForTimeout(900);
  // Every `Tooltip` renders its panel eagerly, so most `.astryx-tooltip` nodes
  // on the page are closed popovers — take the one actually shown.
  const tip = page.locator('.astryx-tooltip:visible').first();
  await tip.screenshot({ path: `${ROOT}/${tag}-tooltip-dark.png` });
  const paint = await tip.evaluate((el) => {
    const c = getComputedStyle(el);
    return { bg: c.backgroundColor, color: c.color };
  });
  console.log(tag, paint);
  await page.mouse.move(3, 3);
  await page.waitForTimeout(400);
};

// BEFORE — restore Astryx's inversion over the theme pin. Injected through
// `evaluate` rather than `addStyleTag`, which takes no `id` option, so the
// element can be found again and removed for the "after" pass.
await page.evaluate(() => {
  const s = document.createElement('style');
  s.id = 'qa8-before';
  s.textContent = `.astryx-tooltip {
    background-color: var(--color-text-primary) !important;
    color: var(--color-background-surface) !important;
  }`;
  document.head.appendChild(s);
});
await page.waitForTimeout(300);
await shoot('before');

await page.evaluate(() => document.getElementById('qa8-before')?.remove());
await page.waitForTimeout(300);
await shoot('after');

await browser.close();
