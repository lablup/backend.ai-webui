/**
 * phase-3 wave 2 / partition B — fair-share drill-down.
 *
 * Reaches `UserFairShareTable` (Divider/BAIText conversion) and opens
 * `UsageBucketModal` — the batch's most structurally-changed surface
 * (`DatePicker.RangePicker` -> `DateRangeInput`, `Descriptions` ->
 * `MetadataList`, `Tabs` -> `TabList` inside `UsageBucketChartContent`).
 */
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BAI_WEBUI ?? 'http://127.0.0.1:5860/';
const STATE = process.env.BAI_STATE ?? '/tmp/w2b-state.json';
const OUT = '.scratch/astryx-migration/shots/p3-w2b';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({
  storageState: STATE,
  viewport: { width: 1600, height: 1100 },
});
const page = await ctx.newPage();

const errors = [];
page.on('console', (m) => {
  const t = m.text();
  if (m.type() !== 'error') return;
  if (/fonts\.googleapis\.com|RelayResponseNormalizer|Failed to load resource/.test(t))
    return;
  errors.push(`[${page.url()}] ${t}`);
});
page.on('pageerror', (e) => errors.push(`[pageerror ${page.url()}] ${e.message}`));

const shot = (n) =>
  page.screenshot({ path: `${OUT}/${n}.png` }).then(() => console.log('  shot', n));

async function toggleTheme() {
  const named = page.getByRole('button', { name: /dark|light|theme|테마/i });
  if (await named.count()) await named.first().click();
  await page.waitForTimeout(2500);
}

/** Click the first cell in the table's Name column (the drill-down link). */
async function drill() {
  const cell = page.locator('table tbody tr').first().locator('td').first();
  if (!(await cell.count())) return false;
  const clickable = cell.locator('a, button, [role="button"], span').first();
  const target = (await clickable.count()) ? clickable : cell;
  await target.click().catch(() => {});
  await page.waitForTimeout(10000);
  return true;
}

async function run(mode) {
  await page.goto(new URL('/admin/scheduler', BASE).toString(), {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  await page.waitForTimeout(16000);

  for (const step of ['domain', 'project', 'user']) {
    if (!(await drill())) break;
    await shot(`${mode}-16-fairshare-${step}`);
  }

  // Usage-history action opens UsageBucketModal.
  for (const re of [/usage/i, /history/i, /사용/i, /chart/i]) {
    const b = page.getByRole('button', { name: re }).first();
    if ((await b.count()) && (await b.isVisible().catch(() => false))) {
      await b.click().catch(() => {});
      await page.waitForTimeout(14000);
      await shot(`${mode}-17-usage-bucket-modal`);
      break;
    }
  }
}

console.log('--- light ---');
await run('light');
console.log('--- dark ---');
await toggleTheme();
await run('dark');

console.log('\n=== app console errors (%d) ===', errors.length);
for (const e of [...new Set(errors)]) console.log(' -', e);
await browser.close();
