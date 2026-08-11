import { chromium } from '@playwright/test';
import fs from 'node:fs';

const OUT = process.argv[2];
const TAG = process.argv[3];

const measureFn = () => {
  const dialogs = [...document.querySelectorAll('.astryx-dialog')];
  const dialog = dialogs[dialogs.length - 1];
  if (!dialog) return { error: 'no dialog' };
  const r = (el) => {
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return {
      x: Math.round(b.x),
      y: Math.round(b.y),
      w: Math.round(b.width),
      h: Math.round(b.height),
      b: Math.round(b.bottom),
    };
  };
  const header = dialog.querySelector('.astryx-layout-header');
  const content = dialog.querySelector('.astryx-layout-content');
  const footer = dialog.querySelector('.astryx-layout-footer');
  return {
    dialog: r(dialog),
    headerHasDivider: header ? header.hasAttribute('data-divider') : null,
    headerPadding: header ? getComputedStyle(header.firstElementChild ?? header).padding : null,
    contentPadding: content ? getComputedStyle(content).padding : null,
    footerHasDivider: footer ? footer.hasAttribute('data-divider') : null,
    footerPadding: footer ? getComputedStyle(footer).padding : null,
    content: r(content),
    header: r(header),
  };
};

const errors = [];
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1400, height: 1000 },
  ignoreHTTPSErrors: true,
});
const page = await ctx.newPage();
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));

await page.goto('http://localhost:6030/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3000);
const loginBtn = page.getByLabel('Login', { exact: true });
if (await loginBtn.isVisible().catch(() => false)) await loginBtn.click();
await page.waitForSelector('[data-testid="user-dropdown-button"]', {
  timeout: 60000,
});
await page.waitForTimeout(2000);

const results = {};

async function shot(name) {
  await page.waitForTimeout(1500);
  results[name] = await page.evaluate(measureFn);
  await page.screenshot({ path: `${OUT}/${TAG}-${name}.png` });
}

async function esc() {
  await page.keyboard.press('Escape');
  await page.waitForTimeout(800);
}

for (const theme of ['light', 'dark']) {
  await page.emulateMedia({ colorScheme: theme });
  await page.goto('http://localhost:6030/data', {
    waitUntil: 'domcontentloaded',
  });
  await page.waitForTimeout(4500);

  // 1. Create Folder modal (FolderCreateModalV2)
  await page
    .getByRole('button', { name: /create folder/i })
    .first()
    .click()
    .catch(() => {});
  await shot(`create-${theme}`);
  await esc();

  // 2. Folder explorer -> Create Folder (CreateDirectoryModal, BUI)
  await page.waitForTimeout(1000);
  const cand = page
    .locator('table tbody tr td')
    .nth(1)
    .locator('a, button, span[role="button"]')
    .first();
  await cand.click({ timeout: 20000 }).catch(() => {});
  await page
    .waitForSelector('[data-testid="folder-explorer-header"]', {
      timeout: 30000,
    })
    .catch(() => {});
  await page.waitForTimeout(2500);
  await page
    .getByRole('button', { name: /create folder/i })
    .first()
    .click()
    .catch(() => {});
  await shot(`explorer-mkdir-${theme}`);
  await esc();
  await esc();
}

await ctx.close();
await browser.close();
fs.writeFileSync(
  `${OUT}/${TAG}-siblings.json`,
  JSON.stringify({ results, pageErrors: errors }, null, 2),
);
console.log('pageErrors:', errors.length);
console.log(JSON.stringify(results, null, 2));
