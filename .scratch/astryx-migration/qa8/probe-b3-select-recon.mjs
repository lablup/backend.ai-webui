/**
 * qa8 batch3 — reconnaissance of every select-like control in the session
 * launcher (/session/start), step by step.
 *
 * READ-ONLY: navigates, opens dropdowns, presses Escape. Never submits.
 *
 * Usage: node .scratch/astryx-migration/qa8/probe-b3-select-recon.mjs
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE =
  process.env.BASE ?? 'https://to-astryx.backend-ai-webui.localhost:1357/';
const ROOT = process.env.ROOT ?? '.scratch/astryx-migration/qa8';
const TAG = process.env.TAG ?? 'b3-recon';

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
const consoleErrors = [];
page.on('pageerror', (e) => pageErrors.push(e.message));
page.on('console', (m) => {
  if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 300));
});

await page.goto(`${BASE}session/start`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(15000);

const result = { url: page.url() };

// ---- 1. enumerate every control class present on the page ----------------
result.controlCensus = await page.evaluate(() => {
  const out = {};
  const count = (sel) => document.querySelectorAll(sel).length;
  out['.astryx-selector'] = count('.astryx-selector');
  out['[class*="selector"]'] = count('[class*="selector"]');
  out['.bai-select'] = count('.bai-select');
  out['[role=combobox]'] = count('[role=combobox]');
  out['[aria-haspopup=listbox]'] = count('[aria-haspopup="listbox"]');
  out['input[type=number]'] = count('input[type=number]');
  out['[role=spinbutton]'] = count('[role=spinbutton]');
  out['[role=slider]'] = count('[role=slider]');
  out['[data-astryx-component]'] = count('[data-astryx-component]');
  return out;
});

// Every element that looks like a select trigger, with its accessible name,
// visible text and DOM signature.
const dumpTriggers = () =>
  page.evaluate(() => {
    const nodes = [
      ...document.querySelectorAll(
        '[aria-haspopup="listbox"], [role="combobox"]',
      ),
    ];
    return nodes.map((el, i) => {
      const r = el.getBoundingClientRect();
      // walk up to the field wrapper to get the visible label
      const field = el.closest(
        '[class*="field"], .bai-select, [data-astryx-component]',
      );
      const labelEl =
        field?.querySelector('label') ??
        el.closest('div')?.parentElement?.querySelector('label');
      const container = el.closest('div[data-variant], div');
      return {
        i,
        tag: el.tagName,
        role: el.getAttribute('role'),
        ariaLabel: el.getAttribute('aria-label'),
        labelText: labelEl?.textContent?.trim().slice(0, 60) ?? null,
        triggerText: el.textContent?.trim().slice(0, 160),
        triggerHTMLLen: el.innerHTML.length,
        hasImg: !!el.querySelector('img'),
        hasSvg: !!el.querySelector('svg'),
        classes: (container?.className ?? '').toString().slice(0, 120),
        dataVariant: container?.getAttribute?.('data-variant') ?? null,
        rect: {
          x: Math.round(r.x),
          y: Math.round(r.y),
          w: Math.round(r.width),
          h: Math.round(r.height),
        },
        disabled: el.hasAttribute('disabled'),
      };
    });
  });

result.step0Triggers = await dumpTriggers();

// numeric controls
const dumpNumeric = () =>
  page.evaluate(() => {
    const nodes = [
      ...document.querySelectorAll(
        'input[type="number"], [role="spinbutton"], input[inputmode="numeric"], [role="slider"]',
      ),
    ];
    return nodes.map((el, i) => {
      const r = el.getBoundingClientRect();
      const c = getComputedStyle(el);
      const wrap = el.closest('div');
      const label =
        wrap?.parentElement?.querySelector('label')?.textContent?.trim() ??
        el.getAttribute('aria-label');
      return {
        i,
        tag: el.tagName,
        role: el.getAttribute('role'),
        type: el.getAttribute('type'),
        label: label?.slice(0, 60) ?? null,
        value: el.value ?? el.getAttribute('aria-valuenow'),
        min: el.getAttribute('min') ?? el.getAttribute('aria-valuemin'),
        max: el.getAttribute('max') ?? el.getAttribute('aria-valuemax'),
        step: el.getAttribute('step'),
        rect: {
          w: +r.width.toFixed(1),
          h: +r.height.toFixed(1),
          x: Math.round(r.x),
        },
        textAlign: c.textAlign,
        // are there stepper buttons next to it?
        siblingButtons:
          wrap?.parentElement?.querySelectorAll('button').length ?? 0,
      };
    });
  });
result.step0Numeric = await dumpNumeric();

await page.screenshot({ path: `${ROOT}/${TAG}-step0.png`, fullPage: true });

// ---- 2. walk through the stepper, capturing each step -------------------
const steps = [];
for (let s = 0; s < 5; s++) {
  const nextBtn = page
    .getByRole('button', { name: /^(next|다음)/i })
    .first();
  const has = await nextBtn.count();
  if (!has) break;
  const enabled = await nextBtn.isEnabled().catch(() => false);
  if (!enabled) {
    steps.push({ step: s + 1, blocked: true });
    break;
  }
  await nextBtn.click();
  await page.waitForTimeout(3500);
  steps.push({
    step: s + 1,
    heading: await page
      .locator('h1, h2, h3')
      .first()
      .textContent()
      .catch(() => null),
    triggers: await dumpTriggers(),
    numeric: await dumpNumeric(),
  });
  await page.screenshot({
    path: `${ROOT}/${TAG}-step${s + 1}.png`,
    fullPage: true,
  });
}
result.steps = steps;

result.pageErrors = pageErrors;
result.consoleErrors = consoleErrors.slice(0, 20);
fs.writeFileSync(`${ROOT}/${TAG}.json`, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
await browser.close();
