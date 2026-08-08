/**
 * Sweep-fixes evidence capture (defects A–E). Run with PHASE=before|after.
 *
 *   PHASE=before node .scratch/astryx-migration/sweep-fixes-shots.mjs
 *
 * Credentials/endpoint come from BAI_ENDPOINT / BAI_EMAIL / BAI_PW in the
 * environment — never from this file.
 */
import fs from 'node:fs';
import { chromium } from '@playwright/test';
import { BASE, login } from './probe.mjs';

const PHASE = process.env.PHASE ?? 'before';
const OUT = '.scratch/astryx-migration/shots/sweep-fixes';
fs.mkdirSync(OUT, { recursive: true });

const results = {};
const log = (k, v) => {
  results[k] = v;
  console.log(`\n### ${k}\n` + JSON.stringify(v, null, 2));
};

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
});
const page = await ctx.newPage();
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(String(e).slice(0, 200)));

const shot = (name, clip) =>
  page.screenshot({ path: `${OUT}/${PHASE}-${name}.png`, clip });

/* ---------------- Defect A: boot curtain (earliest frame) -------------- */
// Throttle the network so the boot backdrop is on screen long enough to
// sample it before the login modal paints.
const cdp = await ctx.newCDPSession(page);
await cdp.send('Network.emulateNetworkConditions', {
  offline: false,
  latency: 300,
  downloadThroughput: (200 * 1024) / 8,
  uploadThroughput: (200 * 1024) / 8,
});
await page.goto(BASE, { waitUntil: 'commit' });
await page.waitForTimeout(900);
await shot('curtain-light');
log('curtain-light', await sampleColors());
await cdp.send('Network.emulateNetworkConditions', {
  offline: false,
  latency: 0,
  downloadThroughput: -1,
  uploadThroughput: -1,
});

async function sampleColors() {
  return page.evaluate(() => {
    const rgb = (el, prop = 'backgroundColor') =>
      el ? getComputedStyle(el)[prop] : null;
    const cs = getComputedStyle(document.documentElement);
    return {
      dataTheme: document.documentElement.getAttribute('data-theme'),
      colorScheme: cs.colorScheme,
      body: rgb(document.body),
      html: rgb(document.documentElement),
      tokenBody: cs.getPropertyValue('--color-background-body').trim(),
      tokenSurface: cs.getPropertyValue('--color-background-surface').trim(),
      tokenCard: cs.getPropertyValue('--color-background-card').trim(),
      tokenPopover: cs.getPropertyValue('--color-background-popover').trim(),
      tokenMuted: cs.getPropertyValue('--color-background-muted').trim(),
      tokenNeutral: cs.getPropertyValue('--color-neutral').trim(),
      sider: rgb(document.querySelector('.bai-sider')),
      card: rgb(document.querySelector('.astryx-card')),
    };
  });
}

/* ---------------- login ------------------------------------------------ */
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3500);
await shot('login-light');
log('login-light', await sampleColors());

await login(page);
const url = new URL(page.url());
const projectSeg = url.pathname.split('/').slice(0, 3).join('/');
console.log('project base:', projectSeg);

const goto = async (route, settleSelector) => {
  await page.goto(`${BASE.replace(/\/$/, '')}${projectSeg}/${route}`, {
    waitUntil: 'domcontentloaded',
  });
  if (settleSelector) {
    await page
      .locator(settleSelector)
      .first()
      .waitFor({ state: 'visible', timeout: 60000 })
      .catch(() => console.log('settle timeout:', settleSelector));
  }
  await page.waitForTimeout(6000);
};

const LAUNCHER_NAV = '[data-test-id="neo-session-launcher-tour-step-navigation"]';
const CONFIG_ROW = '[data-testid^="setting-item"], input[type="checkbox"]';

const toggleTheme = async () => {
  await page
    .locator('button[aria-label="Dark mode"], button[aria-label="Light mode"]')
    .first()
    .click();
  await page.waitForTimeout(1400);
};

/* ---------------- Defect B: sider rail widths -------------------------- */
const measureRail = async () =>
  page.evaluate(() => {
    const nav = document.querySelector('.bai-sider');
    const shell = document.querySelector('.bai-sider-shell');
    const r = nav?.getBoundingClientRect();
    const sr = shell?.getBoundingClientRect();
    return {
      navWidth: r ? Math.round(r.width) : null,
      shellWidth: sr ? Math.round(sr.width) : null,
      collapsedClass: !!document.querySelector('.bai-sider--collapsed'),
    };
  });

const setCollapsed = async (want) => {
  const shell = page.locator('.bai-sider-shell').first();
  await shell.hover();
  await page.waitForTimeout(400);
  const btn = page.locator('.bai-sider-toggle').first();
  const label = await btn.getAttribute('aria-label');
  if ((label === 'Expand') !== want) {
    await btn.click();
    await page.waitForTimeout(900);
  }
  await page.mouse.move(900, 500);
  await page.waitForTimeout(500);
};

await goto('dashboard');
log('dashboard-light', await sampleColors());
await shot('dashboard-light');
await setCollapsed(false);
log('rail-expanded', await measureRail());
await shot('rail-expanded-light', { x: 0, y: 0, width: 340, height: 1000 });
await setCollapsed(true);
log('rail-collapsed', await measureRail());
await shot('rail-collapsed-light', { x: 0, y: 0, width: 160, height: 1000 });
await setCollapsed(false);

/* ---------------- Defect C: session launcher footer -------------------- */
await goto('session/start', LAUNCHER_NAV);
await shot('session-launcher-light');
log('session-launcher-light', await sampleColors());

const measureButtons = async () =>
  page.evaluate(() => {
    const out = [];
    for (const b of document.querySelectorAll(
      '[data-test-id="neo-session-launcher-tour-step-navigation"] button',
    )) {
      const r = b.getBoundingClientRect();
      const cs = getComputedStyle(b);
      out.push({
        text: b.textContent.trim(),
        w: Math.round(r.width),
        h: Math.round(r.height),
        bg: cs.backgroundColor,
        bgImage: cs.backgroundImage.slice(0, 60),
        color: cs.color,
        lines: Math.round(r.height / parseFloat(cs.lineHeight || '20')),
      });
    }
    return out;
  });
log('launcher-buttons', await measureButtons());
const nav = page
  .locator('[data-test-id="neo-session-launcher-tour-step-navigation"]')
  .first();
if (await nav.count()) {
  await nav.screenshot({ path: `${OUT}/${PHASE}-launcher-footer-light.png` });
}

// Prove the footer buttons still WORK: step forward with Next, then jump to
// the last step with "Skip to review".
const stepTitle = () =>
  page.evaluate(
    () =>
      document
        .querySelector('.ant-steps-item-process .ant-steps-item-title')
        ?.textContent?.trim() ?? null,
  );
const walk = { start: await stepTitle() };
await page.getByRole('button', { name: /^Next$/ }).first().click();
await page.waitForTimeout(2500);
walk.afterNext = await stepTitle();
await page
  .getByRole('button', { name: /Skip to review/i })
  .first()
  .click();
await page.waitForTimeout(3500);
walk.afterSkip = await stepTitle();
walk.launchVisible = await page
  .getByRole('button', { name: /^Launch$/ })
  .first()
  .isVisible()
  .catch(() => false);
log('launcher-walkthrough', walk);
await shot('launcher-last-step-light');

/* ---------------- Defect D: admin configurations ----------------------- */
await page.goto(`${BASE.replace(/\/$/, '')}/admin/settings`, {
  waitUntil: 'domcontentloaded',
});
await page
  .locator('input[type="checkbox"]')
  .first()
  .waitFor({ state: 'attached', timeout: 60000 })
  .catch(() => console.log('settle timeout: config checkbox'));
await page.waitForTimeout(5000);
await shot('admin-settings-light');
log('admin-settings-light', await sampleColors());

const measureCheckboxes = async () =>
  page.evaluate(() =>
    [...document.querySelectorAll('.astryx-checkbox-input')]
      .slice(0, 4)
      .map((r) => {
        const input = r.querySelector('input[type=checkbox]');
        const boxEl = r.querySelector('.astryx-checkbox');
        const cs = boxEl ? getComputedStyle(boxEl) : null;
        const rowEl = r.parentElement;
        const rowCs = rowEl ? getComputedStyle(rowEl) : null;
        const bb = boxEl?.getBoundingClientRect();
        // Is the description on the SAME line as the box? (the defect)
        const text = rowEl?.querySelector('.astryx-text');
        const tb = text?.getBoundingClientRect();
        return {
          label: r.textContent.trim().slice(0, 36),
          checked: input?.checked,
          disabled: input?.disabled,
          box: bb ? `${Math.round(bb.width)}x${Math.round(bb.height)}` : null,
          bg: cs?.backgroundColor,
          border: cs
            ? `${cs.borderTopWidth} ${cs.borderTopStyle} ${cs.borderTopColor}`
            : null,
          radius: cs?.borderRadius,
          rowFlexDirection: rowCs?.flexDirection,
          sameLineAsDescription:
            bb && tb ? Math.abs(bb.top - tb.top) < 12 : null,
        };
      }),
  );
log('config-checkboxes', await measureCheckboxes());

// Toggle a SAFE, purely client-side filter checkbox ("Display Only Changes")
// to prove the checked binding round-trips — no config mutation is persisted.
const filterBox = page.locator('input[type="checkbox"]').first();
const before = await filterBox.isChecked();
await filterBox.click({ force: true });
await page.waitForTimeout(900);
const mid = await filterBox.isChecked();
await shot('config-checkbox-checked-light');
await filterBox.click({ force: true });
await page.waitForTimeout(900);
const after = await filterBox.isChecked();
log('config-checkbox-binding', { before, mid, after, flips: before !== mid && mid !== after });

/* ---------------- dark pass -------------------------------------------- */
await toggleTheme();
await page.waitForTimeout(800);
await shot('admin-settings-dark');
log('admin-settings-dark', await sampleColors());

await goto('session/start', LAUNCHER_NAV);
await shot('session-launcher-dark');
log('session-launcher-dark', await sampleColors());
if (await nav.count()) {
  await nav.screenshot({ path: `${OUT}/${PHASE}-launcher-footer-dark.png` });
}

await goto('dashboard');
await shot('dashboard-dark');
log('dashboard-dark', await sampleColors());
await setCollapsed(false);
await shot('rail-expanded-dark', { x: 0, y: 0, width: 340, height: 1000 });

await goto('session');
await shot('sessions-dark');
log('sessions-dark', await sampleColors());

log('pageErrors', pageErrors);
fs.writeFileSync(
  `${OUT}/${PHASE}-measurements.json`,
  JSON.stringify(results, null, 2),
);
await browser.close();
