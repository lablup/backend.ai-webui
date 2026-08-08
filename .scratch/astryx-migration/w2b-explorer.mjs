/**
 * phase-3 wave 2 / partition B — folder-explorer pass.
 *
 * Opens a vfolder so `FolderExplorerModal` renders: `Splitter` ->
 * `useResizable` + `ResizeHandle`, `Alert` -> `Banner`, `Skeleton` ->
 * `BAISkeletonAstryx`, plus `FolderExplorerHeader` (FileBrowserButton's
 * ButtonGroup + DropdownMenu).
 */
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BAI_WEBUI ?? 'http://127.0.0.1:5860/';
const STATE = process.env.BAI_STATE ?? '/tmp/w2b-state.json';
const OUT = '.scratch/astryx-migration/shots/p3-w2b';
mkdirSync(OUT, { recursive: true });
const P = process.env.BAI_PROJECT_PATH ?? '';

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

async function run(mode) {
  await page.goto(new URL(`${P}/data`, BASE).toString(), {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  await page.waitForTimeout(16000);
  await shot(`${mode}-18-data`);

  // First folder name cell opens the explorer modal.
  const cell = page.locator('table tbody tr').first().locator('td').nth(1);
  if (await cell.count()) {
    const link = cell.locator('a, button, [role="button"], span').first();
    await ((await link.count()) ? link : cell).click().catch(() => {});
    await page.waitForTimeout(16000);
    await shot(`${mode}-19-folder-explorer-modal`);
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
