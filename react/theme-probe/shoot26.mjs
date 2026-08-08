/**
 * Ticket 26 measurement driver — the two acceptance criteria, measured in a
 * real headless Chromium against the REAL components.
 *
 *   1. `case=relay`  scroll the popup listbox -> `endReached` -> Relay
 *      `loadNext` -> rows appended. Reports rows after each scroll and the
 *      exact offset/limit of every paginated fetch the component issued.
 *   2. `case=form`   the `labelInValue` value contract through antd
 *      `Form` + `BAIFormItem`: initialValues render in the trigger, a click
 *      writes `{label, value}` back into the form store, multiple mode
 *      writes an array of them.
 *
 * Usage (server must already be up on the probe port):
 *   node react/theme-probe/shoot26.mjs [port] [outDir]
 */
import { chromium } from '@playwright/test';

const port = process.argv[2] ?? '5725';
const outDir = process.argv[3] ?? '/tmp';
const base = `http://127.0.0.1:${port}/theme-probe/select26.html`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const consoleErrors = [];
const pageErrors = [];
page.on('console', (m) => {
  if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 300));
});
page.on('pageerror', (e) => pageErrors.push(String(e).slice(0, 300)));

const results = {};

/* ---------------------------------------------------------------- relay --- */

await page.goto(`${base}?case=relay`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);

// Open the popup via the ComplexSelector trigger.
await page.getByTestId('relay-select').click();
await page.waitForTimeout(1200);

const listbox = page.locator('[data-testid="relay-select-listbox"]');
await listbox.waitFor({ state: 'visible', timeout: 10000 });

const countOptions = () => listbox.getByRole('option').count();

results.A_initialRows = await countOptions();
await page.screenshot({ path: `${outDir}/ticket26-relay-open.png` });

const scrollToBottom = async () => {
  await listbox.evaluate((el) => {
    el.scrollTop = el.scrollHeight;
    el.dispatchEvent(new Event('scroll', { bubbles: true }));
  });
  await page.waitForTimeout(700);
  // Bounce back up so the next scroll re-crosses the at-bottom edge, exactly
  // as a real user's wheel does (BAISelect fires on the edge, not per event).
  await listbox.evaluate((el) => {
    el.scrollTop = 0;
    el.dispatchEvent(new Event('scroll', { bubbles: true }));
  });
  await page.waitForTimeout(200);
};

results.A_rowsAfterScroll = [];
for (let i = 0; i < 6; i += 1) {
  await scrollToBottom();
  results.A_rowsAfterScroll.push(await countOptions());
}

results.A_pageFetches = await page.evaluate(() =>
  window.__probe.pageFetches().map((f) => `${f.offset}/${f.limit}`),
);
results.A_distinctOffsets = [
  ...new Set(
    (
      await page.evaluate(() =>
        window.__probe.pageFetches().map((f) => f.offset),
      )
    ).map(Number),
  ),
].sort((a, b) => a - b);

// Keyboard: ArrowDown x2 then Enter must commit the 3rd row.
await page.keyboard.press('ArrowDown');
await page.keyboard.press('ArrowDown');
const activeDescendant = await page
  .locator('input[role="combobox"]')
  .getAttribute('aria-activedescendant');
results.A_hasActiveDescendant = Boolean(activeDescendant);
await page.keyboard.press('Enter');
await page.waitForTimeout(500);
results.A_valueAfterKeyboardEnter = await page
  .getByTestId('relay-value')
  .textContent();

await page.screenshot({ path: `${outDir}/ticket26-relay.png` });

/* ----------------------------------------------------------------- form --- */

await page.goto(`${base}?case=form`, { waitUntil: 'networkidle' });
await page.waitForTimeout(800);

results.B_initialFormValue = await page.evaluate(() =>
  JSON.stringify(window.__probe.formValue()),
);
results.B_triggerShowsInitialLabel = await page
  .getByTestId('form-select')
  .innerText();

// Both popups stay mounted (native `popover` hides them), so option lookups
// MUST be scoped to the listbox under test.
const singleList = page.locator('[data-testid="form-select-listbox"]');
const multiList = page.locator('[data-testid="form-multi-select-listbox"]');

await page.getByTestId('form-select').click();
await page.waitForTimeout(400);
await singleList.getByRole('option').nth(5).click();
await page.waitForTimeout(400);
results.B_formValueAfterSingleSelect = await page.evaluate(() =>
  JSON.stringify(window.__probe.formValue()),
);

await page.getByTestId('form-multi-select').click();
await page.waitForTimeout(400);
await multiList.getByRole('option').nth(1).click();
await multiList.getByRole('option').nth(2).click();
await page.waitForTimeout(300);
await page.keyboard.press('Escape');
await page.waitForTimeout(300);
results.B_formValueAfterMultiSelect = await page.evaluate(() =>
  JSON.stringify(window.__probe.formValue()),
);

await page.getByText('submit').click();
await page.waitForTimeout(400);
results.B_submittedPayload = await page
  .getByTestId('form-submitted')
  .textContent();

await page.screenshot({ path: `${outDir}/ticket26-form.png` });

results.consoleErrors = consoleErrors;
results.pageErrors = pageErrors;

console.log(JSON.stringify(results, null, 2));
await browser.close();
