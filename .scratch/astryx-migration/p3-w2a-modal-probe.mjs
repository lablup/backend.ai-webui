/**
 * Probe: is the dark dialog surface in LIGHT mode specific to `DownloadModal`
 * (partition A) or global to every `BAIModal` (BUI, wave 1)?
 * Opens an untouched BAIModal (Data -> Create Folder) and reads the computed
 * background of the dialog surface, then the same for the Downloads modal.
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE = process.env.W2A_BASE ?? 'http://127.0.0.1:5850/';
const OUT = '.scratch/astryx-migration/shots/p3-w2a';
fs.mkdirSync(OUT, { recursive: true });
const results = {};
const log = (k, v) => {
  results[k] = v;
  console.log(`### ${k} = ${JSON.stringify(v)}`);
};

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  colorScheme: 'light',
});
const page = await ctx.newPage();

await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(8000);
const userInput = page.locator('input[placeholder="Email or Username"]').first();
if (await userInput.count()) {
  const ep = page.locator('input[placeholder="Endpoint"]').first();
  if ((await ep.count()) && process.env.BAI_ENDPOINT)
    await ep.fill(process.env.BAI_ENDPOINT);
  await userInput.fill(process.env.BAI_EMAIL ?? '');
  await page
    .locator('input[type="password"]')
    .first()
    .fill(process.env.BAI_PW ?? '');
  await page
    .getByRole('button', { name: /^login$/i })
    .first()
    .click();
}
await page.waitForTimeout(18000);

await page.evaluate(() =>
  localStorage.setItem('backendaiwebui.settings.themeMode', '"light"'),
);
await page.reload({ waitUntil: 'domcontentloaded' });
await page.waitForTimeout(9000);

const readSurface = async () =>
  page.evaluate(() => {
    const el = document.querySelector('dialog[open], [role="dialog"]');
    if (!el) return null;
    const cs = getComputedStyle(el);
    const root = document.documentElement;
    return {
      background: cs.backgroundColor,
      color: cs.color,
      dialogThemeAttr: el.closest('[data-astryx-theme]')?.getAttribute(
        'data-astryx-theme',
      ),
      rootThemeAttr: root.getAttribute('data-astryx-theme'),
      bodyThemeAttr: document.body.getAttribute('data-astryx-theme'),
    };
  });

/* untouched BAIModal — Data > Create Folder */
await page.goto(`${BASE.replace(/\/$/, '')}/data`, {
  waitUntil: 'domcontentloaded',
});
await page.waitForTimeout(12000);
try {
  await page
    .getByRole('button', { name: /create folder|new folder|add folder/i })
    .first()
    .click();
  await page.waitForTimeout(4000);
  log('createFolderModal', await readSurface());
  await page.screenshot({ path: `${OUT}/probe-createfolder-light.png` });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1500);
} catch (e) {
  log('createFolderModal', String(e).slice(0, 160));
}

/* partition A's DownloadModal */
try {
  await page.locator('[data-testid="user-dropdown-button"]').first().click();
  await page.waitForTimeout(2000);
  await page
    .getByRole('menuitem', { name: /download/i })
    .first()
    .click();
  await page.waitForTimeout(4000);
  log('downloadModal', await readSurface());
  await page.screenshot({ path: `${OUT}/probe-download-light.png` });
} catch (e) {
  log('downloadModal', String(e).slice(0, 160));
}

fs.writeFileSync(
  `${OUT}/measure-p3-w2a-modal-probe.json`,
  JSON.stringify(results, null, 2),
);
await browser.close();
