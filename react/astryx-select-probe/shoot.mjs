/**
 * SPIKE driver — measures the two DOM-level questions.
 * Methodology is deliberately crude and stated in the answer doc:
 *  - DOM node counts are exact.
 *  - Timings are single-run wall clock in a headless Chromium on a shared
 *    dev box; treat them as order-of-magnitude only.
 */
import { chromium } from '@playwright/test';

const TARGET = 'http://localhost:5199/';
const out = {};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push('console: ' + m.text());
});

const countOptions = () =>
  page.evaluate(() => document.querySelectorAll('[role="option"]').length);
const countNodes = () =>
  page.evaluate(() => document.querySelectorAll('*').length);

try {
  await page.goto(TARGET, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  /* ---- 0. cold page, nothing opened yet ---- */
  out.Z_optionNodesOnLoad = await countOptions();
  out.Z_domNodesOnLoad = await countNodes();

  /* ---- A. scroll-driven loadNext inside ComplexSelector ---- */
  await page.getByTestId('complex-wrap').getByRole('button').first().click();
  await page.waitForSelector('[data-testid="listbox"]');
  out.A_initialRows = await page.locator('[data-testid="listbox"] > *').count();
  out.A_loadedBefore = await page.getByTestId('loaded-count').textContent();

  // Scroll up then back to the bottom each round: BAISelect's real predicate
  // only fires on an at-bottom *transition*, so the probe must reproduce a
  // genuine leave-and-return, not just repeated "stay at bottom".
  for (let i = 0; i < 6; i++) {
    await page.evaluate(() => {
      const el = document.querySelector('[data-testid="listbox"]');
      el.scrollTop = 0;
    });
    await page.waitForTimeout(80);
    await page.evaluate(() => {
      const el = document.querySelector('[data-testid="listbox"]');
      el.scrollTop = el.scrollHeight;
    });
    await page.waitForTimeout(200);
  }
  out.A_rowsAfterScroll = await page
    .locator('[data-testid="listbox"] > *')
    .count();
  out.A_loadedAfter = await page.getByTestId('loaded-count').textContent();
  out.A_loadNextCalls = await page.getByTestId('loadnext-calls').textContent();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  /* ---- B. Typeahead: does the menu grow on scroll? ---- */
  const beforeTA = await countOptions();
  await page.getByTestId('typeahead-wrap').getByRole('combobox').click();
  await page.waitForTimeout(400);
  out.B_typeaheadInitialOptions = (await countOptions()) - beforeTA;
  await page.mouse.wheel(0, 2000);
  await page.waitForTimeout(400);
  out.B_typeaheadOptionsAfterScroll = (await countOptions()) - beforeTA;
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  /* ---- C. 500 options: Astryx (no virtualisation) ---- */
  out.C_baselineOptionNodes = await countOptions();
  out.C_baselineDomNodes = await countNodes();
  const t0 = Date.now();
  await page.getByTestId('astryx-500').getByRole('button').first().click();
  await page.waitForFunction(
    () =>
      [...document.querySelectorAll('[role="option"]')].some(
        (n) => n.getBoundingClientRect().height > 0,
      ),
    null,
    { timeout: 20000 },
  );
  out.C_astryxOpenMs = Date.now() - t0;
  out.C_astryxOptionNodesTotal = await countOptions();
  out.C_astryxVisibleOptionNodes = await page.evaluate(
    () =>
      [...document.querySelectorAll('[role="option"]')].filter(
        (n) => n.getBoundingClientRect().height > 0,
      ).length,
  );
  out.C_astryxTotalDomNodes = await countNodes();
  out.C_astryxScroll20Ms = await page.evaluate(() => {
    const box = [...document.querySelectorAll('*')].find(
      (n) => n.scrollHeight > n.clientHeight + 50 && n.clientHeight > 100,
    );
    if (!box) return -1;
    const t = performance.now();
    for (let i = 0; i < 20; i++) {
      box.scrollTop += 120;
      void box.getBoundingClientRect().height;
    }
    return Math.round(performance.now() - t);
  });
  await page.screenshot({
    path: new URL('./astryx-500-open.png', import.meta.url).pathname,
  });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  out.C_domNodesAfterClose = await countNodes();

  /* ---- D. 500 options: antd (rc-virtual-list) ---- */
  const t1 = Date.now();
  await page
    .getByTestId('antd-500')
    .locator('.ant-select-content')
    .click({ force: true });
  await page.waitForFunction(
    () => document.querySelectorAll('.ant-select-item-option').length > 0,
    null,
    { timeout: 20000 },
  );
  out.D_antdOpenMs = Date.now() - t1;
  out.D_antdRenderedOptions = await page.evaluate(
    () => document.querySelectorAll('.ant-select-item-option').length,
  );
  out.D_antdTotalDomNodes = await countNodes();
  out.D_antdScroll20Ms = await page.evaluate(() => {
    const box = document.querySelector('.rc-virtual-list-holder');
    if (!box) return -1;
    const t = performance.now();
    for (let i = 0; i < 20; i++) {
      box.scrollTop += 120;
      void box.getBoundingClientRect().height;
    }
    return Math.round(performance.now() - t);
  });
  /* ---- E. isolated mount benchmark, 3 runs each ---- */
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  out.E_bench = [];
  for (const n of [100, 500, 2000]) {
    for (const which of ['astryx', 'antd']) {
      const runs = [];
      for (let i = 0; i < 3; i++) {
        runs.push(
          await page.evaluate(
            ([w, count]) => window.__bench(w, count),
            [which, n],
          ),
        );
      }
      out.E_bench.push({
        which,
        n,
        mountMs: runs.map((r) => r.mountMs),
        domNodes: runs[0].domNodes,
        optionNodes: runs[0].optionNodes,
      });
    }
  }
} catch (e) {
  out.FAILED_AT = String(e).split('\n')[0];
} finally {
  out.errors = errors;
  await page.screenshot({
    path: new URL('./probe.png', import.meta.url).pathname,
    fullPage: true,
  });
  console.log(JSON.stringify(out, null, 2));
  await browser.close();
}
