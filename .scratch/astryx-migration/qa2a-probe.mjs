// QA2-A shared probe helpers — tab underline / card-type tabs / BAICard tabList.
// Runs against the agent's own vite server on 5910 (see AGENTS note in qa2-a.md).
import { chromium } from '@playwright/test';

export const BASE = process.env.QA2A_BASE ?? 'http://127.0.0.1:5910/';

export async function launch({ width = 1600, height = 1000 } = {}) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width, height } });
  const page = await ctx.newPage();
  page.on('console', (m) => {
    if (m.type() === 'error')
      console.log('[console.error]', m.text().slice(0, 240));
  });
  page.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 240)));
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  return { browser, ctx, page };
}

export async function login(page) {
  await page.waitForTimeout(6000);
  const userInput = page
    .locator('input[placeholder="Email or Username"]')
    .first();
  if (await userInput.count()) {
    await page
      .getByRole('button', { name: /^login$/i })
      .first()
      .click();
  }
  await page.waitForTimeout(12000);
}

export async function goto(page, hash) {
  await page.goto(BASE + hash, { waitUntil: 'domcontentloaded' });
  await page
    .locator('.astryx-tab-list')
    .first()
    .waitFor({ state: 'attached', timeout: 30000 })
    .catch(() => {});
  await page.waitForTimeout(4000);
}

/** Toggle to a given color scheme via the header theme button. */
export async function setMode(page, mode) {
  const cur = () =>
    page.evaluate(() => getComputedStyle(document.documentElement).colorScheme);
  if ((await cur()) !== mode) {
    await page.locator('[data-testid="button-theme"]').first().click();
    await page.waitForTimeout(1500);
  }
  return cur();
}

/**
 * Measure every tab strip on the page: the nav rect, its parent rect, and the
 * rendered bottom border. `spans` is the whole point — does the rail reach the
 * full width of the bar it sits in?
 */
export const measureTabs = (page) =>
  page.evaluate(() => {
    const round = (n) => +Number(n).toFixed(2);
    return [...document.querySelectorAll('.astryx-tab-list')].map((nav) => {
      const b = nav.getBoundingClientRect();
      const cs = getComputedStyle(nav);
      const parent = nav.parentElement;
      const pb = parent.getBoundingClientRect();
      const tabs = [...nav.querySelectorAll('[data-tab-value]')];
      const last = tabs.at(-1)?.getBoundingClientRect();
      return {
        labels: tabs.map((t) => t.textContent.trim().slice(0, 24)),
        navX: round(b.x),
        navW: round(b.width),
        navH: round(b.height),
        parentX: round(pb.x),
        parentW: round(pb.width),
        lastTabRight: last ? round(last.right) : null,
        borderBottom: `${cs.borderBottomWidth} ${cs.borderBottomStyle} ${cs.borderBottomColor}`,
        paddingBlockEnd: cs.paddingBlockEnd,
        // Does the rail span the bar? (within 1px)
        spansParent: Math.abs(b.width - pb.width) <= 1,
      };
    });
  });
