/**
 * Ticket 27 measurement driver — proves 2 representative converted wrappers
 * live: scroll -> `endReached` -> Relay `loadNext` -> rows appended, and the
 * `labelInValue` value contract round-trips through `onChange`. One
 * name-valued wrapper (`BAIKeypairSelectAstryx`, class A) and one id-valued
 * wrapper (`BAIAdminProjectSelectAstryx`, class B), per CONVERSION-BRIEF.md
 * §2. Mirrors shoot26.mjs's approach.
 *
 * Usage (server must already be up on the probe port):
 *   node react/theme-probe/shoot27.mjs [port] [outDir]
 */
import { chromium } from '@playwright/test';

const port = process.argv[2] ?? '5755';
const outDir = process.argv[3] ?? '/tmp';
const base = `http://127.0.0.1:${port}/theme-probe/select27.html`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const consoleErrors = [];
const pageErrors = [];
page.on('console', (m) => {
  if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 300));
});
page.on('pageerror', (e) => pageErrors.push(String(e).slice(0, 300)));

const results = {};

const scrollToBottom = async (listbox) => {
  await listbox.evaluate((el) => {
    el.scrollTop = el.scrollHeight;
    el.dispatchEvent(new Event('scroll', { bubbles: true }));
  });
  await page.waitForTimeout(700);
  await listbox.evaluate((el) => {
    el.scrollTop = 0;
    el.dispatchEvent(new Event('scroll', { bubbles: true }));
  });
  await page.waitForTimeout(200);
};

const runCase = async (which, mode) => {
  const testId = `${which}-select`;
  const prefix = mode === 'dark' ? `${which}Dark` : which;

  await page.goto(`${base}?case=${which}${mode === 'dark' ? '&mode=dark' : ''}`, {
    waitUntil: 'networkidle',
  });
  await page.waitForTimeout(1000);

  await page.getByTestId(testId).click();
  await page.waitForTimeout(1000);

  const listbox = page.locator(`[data-testid="${testId}-listbox"]`);
  await listbox.waitFor({ state: 'visible', timeout: 10000 });

  const countOptions = () => listbox.getByRole('option').count();

  results[`${prefix}_initialRows`] = await countOptions();
  if (mode !== 'dark') {
    await page.screenshot({
      path: `${outDir}/ticket27-${which}-open-light.png`,
    });
  } else {
    await page.screenshot({
      path: `${outDir}/ticket27-${which}-open-dark.png`,
    });
  }

  results[`${prefix}_rowsAfterScroll`] = [];
  for (let i = 0; i < 4; i += 1) {
    await scrollToBottom(listbox);
    results[`${prefix}_rowsAfterScroll`].push(await countOptions());
  }

  results[`${prefix}_pageFetches`] = await page.evaluate(
    (c) =>
      window.__probe
        .pageFetches()
        .filter((f) => f.case === c)
        .map((f) => `${f.offset}/${f.limit}`),
    which,
  );

  // Keyboard: ArrowDown x2 then Enter must commit the 3rd row -> labelInValue.
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);
  results[`${prefix}_valueAfterKeyboardEnter`] = await page
    .getByTestId(`${which}-value`)
    .textContent();

  if (mode !== 'dark') {
    await page.screenshot({ path: `${outDir}/ticket27-${which}-light.png` });
  } else {
    await page.screenshot({ path: `${outDir}/ticket27-${which}-dark.png` });
  }
};

await runCase('keypair', 'light');
await runCase('keypair', 'dark');
await runCase('project', 'light');
await runCase('project', 'dark');

results.consoleErrors = consoleErrors;
results.pageErrors = pageErrors;

console.log(JSON.stringify(results, null, 2));
await browser.close();
