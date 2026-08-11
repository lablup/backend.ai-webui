/**
 * Settings-sidebar evidence capture (Astryx `settings-sidebar` template
 * adoption in SettingList).
 *   PHASE=after BAI_EMAIL=... BAI_PW=... BAI_ENDPOINT=... \
 *     node .scratch/astryx-migration/settings-sidebar-shots.mjs
 * Captures usersettings / settings / maintenance / branding, light+dark,
 * wide+narrow, plus the active-item highlight and a ?tab= URL round-trip.
 */
import fs from 'node:fs';
import { launch, login } from './probe.mjs';

const PHASE = process.env.PHASE ?? 'after';
const OUT = `.scratch/astryx-migration/shots/settings-sidebar`;
fs.mkdirSync(OUT, { recursive: true });

const { browser, page } = await launch();
await login(page);
console.log('after login:', page.url());

const base = new URL(page.url()).origin;

const shot = (name, opts = {}) =>
  page.screenshot({ path: `${OUT}/${PHASE}-${name}.png`, ...opts });

const goto = async (path, { settled = true } = {}) => {
  await page.goto(base + path, { waitUntil: 'domcontentloaded' });
  if (settled) {
    // The settings nav column is the last thing to paint on these pages.
    // PHASE=before renders the pre-change horizontal TabList, which has no
    // list items — wait on the group heading row instead.
    await page
      .locator(PHASE === 'before' ? '[role="tab"]' : '.astryx-list-item')
      .first()
      .waitFor({ state: 'visible', timeout: 90000 });
    await page.waitForTimeout(2500);
  }
  await page.waitForTimeout(1500);
};

const toggleTheme = async () => {
  await page
    .locator('button[aria-label="Dark mode"], button[aria-label="Light mode"]')
    .first()
    .click();
  await page.waitForTimeout(1200);
};

// --- geometry probe: is there a real left nav column? -----------------------
const probeFrame = async (tag) => {
  const m = await page.evaluate(() => {
    const panel = document.querySelector('.astryx-layout-panel');
    const list = document.querySelector('.astryx-list');
    const items = [...document.querySelectorAll('.astryx-list-item')].map((el) => ({
      text: el.textContent?.trim().slice(0, 40),
      selected: el.getAttribute('aria-selected'),
      rect: (({ x, y, width }) => ({ x: Math.round(x), y: Math.round(y), width: Math.round(width) }))(
        el.getBoundingClientRect(),
      ),
    }));
    const content = document.querySelector('.astryx-layout-content');
    const r = (el) =>
      el
        ? (({ x, y, width, height }) => ({
            x: Math.round(x),
            y: Math.round(y),
            width: Math.round(width),
            height: Math.round(height),
          }))(el.getBoundingClientRect())
        : null;
    return { panel: r(panel), list: !!list, content: r(content), items };
  });
  console.log(`\n[${tag}]`, JSON.stringify(m, null, 2));
  return m;
};

const PAGES = [
  ['usersettings', '/usersettings'],
  ['configurations', '/settings'],
  ['maintenance', '/maintenance'],
  ['branding', '/branding'],
];

// --- wide, light ------------------------------------------------------------
for (const [name, path] of PAGES) {
  await goto(path);
  await shot(`${name}-light-wide`);
  await probeFrame(`${name} light wide`);
}

// --- active-item highlight + content switch --------------------------------
await goto('/usersettings');
const navItems = page.locator('.astryx-list-item');
const n = await navItems.count();
console.log('\nnav item count:', n);
if (n > 1) {
  await navItems.nth(2).click();
  await page.waitForTimeout(800);
  await shot('usersettings-light-wide-group-selected');
  await probeFrame('usersettings group selected');
}

// --- dark ------------------------------------------------------------------
await toggleTheme();
for (const [name, path] of PAGES) {
  await goto(path);
  await shot(`${name}-dark-wide`);
}
await toggleTheme();

// --- narrow (drill-down) ---------------------------------------------------
await page.setViewportSize({ width: 600, height: 900 });
await goto('/usersettings');
await shot('usersettings-light-narrow-nav');
await probeFrame('usersettings narrow nav');
const narrowItems = page.locator('.astryx-list-item');
if (await narrowItems.count()) {
  await narrowItems.nth(1).click();
  await page.waitForTimeout(800);
  await shot('usersettings-light-narrow-detail');
  await probeFrame('usersettings narrow detail');
}
await toggleTheme();
await goto('/usersettings');
await shot('usersettings-dark-narrow-nav');
const narrowItemsDark = page.locator('.astryx-list-item');
if (await narrowItemsDark.count()) {
  await narrowItemsDark.nth(1).click();
  await page.waitForTimeout(800);
  await shot('usersettings-dark-narrow-detail');
}
await toggleTheme();
await page.setViewportSize({ width: 1600, height: 1000 });

// --- URL state round-trip (page-level ?tab=) -------------------------------
await goto('/usersettings');
const beforeTabUrl = page.url();
await page.getByRole('tab', { name: /logs/i }).first().click();
await page.waitForTimeout(1500);
const afterClickUrl = page.url();
await page.reload({ waitUntil: 'domcontentloaded' });
await page.waitForTimeout(6000);
const afterReloadUrl = page.url();
const activeTab = await page
  .locator('[role="tab"][aria-selected="true"]')
  .first()
  .textContent();
console.log('\n=== URL STATE ROUND-TRIP ===');
console.log('initial       :', beforeTabUrl);
console.log('after click   :', afterClickUrl);
console.log('after reload  :', afterReloadUrl);
console.log('active tab    :', activeTab?.trim());
await shot('usersettings-tab-url-roundtrip');

await browser.close();
