/**
 * qa8 batch3 — interaction probe for the launcher's select-like controls.
 *
 *  A. env select: type a search term -> does TextHighlighter still <mark> it?
 *     (BAISelect's showSearch.onSearch is inert on Astryx)
 *  B. Preopen Ports Tokenizer: does `,` / space / Enter commit a token?
 *  C. Session owner card: what selects appear when the switch is on?
 *  D. dark mode (real header click) -> re-measure the env trigger
 *
 * READ-ONLY: types into client-side fields, never submits.
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE =
  process.env.BASE ?? 'https://to-astryx.backend-ai-webui.localhost:1357/';
const ROOT = process.env.ROOT ?? '.scratch/astryx-migration/qa8';
const TAG = process.env.TAG ?? 'b3-interact';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  ignoreHTTPSErrors: true,
  storageState: `${ROOT}/state.json`,
});
const page = await ctx.newPage();
page.setDefaultNavigationTimeout(180000);
page.setDefaultTimeout(30000);
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(e.message));

const result = {};

await page.goto(`${BASE}session/start`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(14000);

// ---- C. session owner card -------------------------------------------
const ownerSwitch = page.locator('input[type="checkbox"][role="switch"], button[role="switch"]').first();
if (await ownerSwitch.count()) {
  await ownerSwitch.click().catch(() => {});
  await page.waitForTimeout(4000);
  result.sessionOwner = await page.evaluate(() =>
    [...document.querySelectorAll('[aria-haspopup="listbox"]')]
      .filter((el) => el.getBoundingClientRect().width > 0)
      .map((el) => ({
        text: el.textContent?.trim().slice(0, 60),
        imgs: el.querySelectorAll('img').length,
      })),
  );
  await page.screenshot({ path: `${ROOT}/${TAG}-owner.png` });
  await ownerSwitch.click().catch(() => {});
  await page.waitForTimeout(2000);
}

// ---- step 2 ------------------------------------------------------------
await page.getByRole('button', { name: /^next/i }).first().click();
await page.waitForTimeout(6000);

// ---- A. env select search --------------------------------------------
const envTrigger = page.locator('[aria-haspopup="listbox"]:visible').nth(1);
await envTrigger.click();
await page.waitForTimeout(1500);
const searchBox = page.locator('input[placeholder*="earch"]:visible').first();
result.envSearch = {};
if (await searchBox.count()) {
  await searchBox.pressSequentially('pyth', { delay: 120 });
  await page.waitForTimeout(1500);
  result.envSearch.afterTyping = await page.evaluate(() => {
    const list = [...document.querySelectorAll('[role="listbox"]')].find(
      (l) => l.getBoundingClientRect().width > 0,
    );
    if (!list) return null;
    const opts = [...list.querySelectorAll('[role="option"]')];
    return {
      optionCount: opts.length,
      markCount: list.querySelectorAll('mark').length,
      imgs: list.querySelectorAll('img').length,
      texts: opts.slice(0, 5).map((o) => o.textContent?.trim().slice(0, 80)),
    };
  });
  await page.screenshot({ path: `${ROOT}/${TAG}-envsearch.png` });
  // does a filterValue-only term still match? ("multiarch" is in filterValue
  // AND now in the label, so try an env-prefix term instead)
  await searchBox.fill('multiarch');
  await page.waitForTimeout(1200);
  result.envSearch.filterValueTerm = await page.evaluate(() => {
    const list = [...document.querySelectorAll('[role="listbox"]')].find(
      (l) => l.getBoundingClientRect().width > 0,
    );
    if (!list) return null;
    return {
      optionCount: list.querySelectorAll('[role="option"]').length,
      text: list.textContent?.trim().slice(0, 120),
    };
  });
}
await page.keyboard.press('Escape');
await page.waitForTimeout(1000);

// ---- D. dark mode ------------------------------------------------------
await page.getByRole('button', { name: /^(dark|light) mode$/i }).first().click();
await page.waitForTimeout(2500);
result.theme = await page.evaluate(
  () => document.documentElement.dataset.theme,
);
if (result.theme !== 'dark') throw new Error('theme toggle did not take');
result.darkEnvTrigger = await page.evaluate(() => {
  const el = [...document.querySelectorAll('[aria-haspopup="listbox"]')].filter(
    (x) => x.getBoundingClientRect().width > 0,
  )[1];
  if (!el) return null;
  const c = getComputedStyle(el);
  return { text: el.textContent, color: c.color, imgs: el.querySelectorAll('img').length };
});
await page.screenshot({ path: `${ROOT}/${TAG}-dark.png` });
await page.getByRole('button', { name: /^(dark|light) mode$/i }).first().click();
await page.waitForTimeout(2000);

// ---- B. Preopen Ports tokenizer ---------------------------------------
for (let i = 0; i < 2; i++) {
  await page.getByRole('button', { name: /^next/i }).first().click();
  await page.waitForTimeout(4500);
}
await page.screenshot({ path: `${ROOT}/${TAG}-network.png` });
const portInput = page
  .locator('input[type="text"]:visible, input:not([type]):visible')
  .first();
result.tokenizer = { found: await portInput.count() };
if (await portInput.count()) {
  result.tokenizer.placeholder = await portInput.getAttribute('placeholder');
  result.tokenizer.ariaLabel = await portInput.getAttribute('aria-label');
  await portInput.click();
  await portInput.pressSequentially('8080,', { delay: 130 });
  await page.waitForTimeout(1200);
  const readTokens = () =>
    page.evaluate(() => {
      const tokens = [
        ...document.querySelectorAll(
          '.astryx-token, [class*="token"]:not(input), [class*="Token"]',
        ),
      ].filter((t) => t.getBoundingClientRect().width > 0);
      const input = document.querySelector('input[type="text"]');
      return {
        tokenTexts: tokens.map((t) => t.textContent?.trim().slice(0, 30)),
        inputValue: input?.value ?? null,
      };
    });
  result.tokenizer.afterComma = await readTokens();
  await portInput.pressSequentially('9090 ', { delay: 130 });
  await page.waitForTimeout(1200);
  result.tokenizer.afterSpace = await readTokens();
  await portInput.pressSequentially('7070', { delay: 130 });
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1200);
  result.tokenizer.afterEnter = await readTokens();
  await page.screenshot({ path: `${ROOT}/${TAG}-tokens.png` });
}

result.pageErrors = pageErrors;
fs.writeFileSync(`${ROOT}/${TAG}.json`, JSON.stringify(result, null, 2));
console.log('done');
await browser.close();
