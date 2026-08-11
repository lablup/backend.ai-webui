/**
 * Phase 3 wave 3 · partition B — live proof for the pieces the theming probe
 * does not cover:
 *
 *   1. `data-testid="user-dropdown-button"` is back on the trigger (D2)
 *   2. the TOTP modal's QR renders via `qrcode.react` (D4)
 *   3. a FOLDED adapter works in a real form — `SessionOwnerSetterCard`'s
 *      toggle is now the shared `AstryxFormSwitch` (D3)
 *
 *   BAI_ENDPOINT=... BAI_EMAIL=... BAI_PW=... \
 *     node .scratch/astryx-migration/p3-w3b-proof.mjs
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE = process.env.W3B_BASE ?? 'http://127.0.0.1:5900/';
const OUT = '.scratch/astryx-migration/shots/p3-w3b';
fs.mkdirSync(OUT, { recursive: true });

const results = {};
const pageErrors = [];
const log = (k, v) => {
  results[k] = v;
  console.log(`### ${k} = ${JSON.stringify(v)}`);
};

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
});
const page = await ctx.newPage();
page.on('pageerror', (e) => pageErrors.push(String(e).slice(0, 300)));

const shot = (name) => page.screenshot({ path: `${OUT}/proof-${name}.png` });
const wait = (ms) => page.waitForTimeout(ms);
const esc = async () => {
  await page.keyboard.press('Escape');
  await wait(1200);
};

await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await wait(9000);
const userInput = page.locator('input[placeholder="Email or Username"]').first();
if (await userInput.count()) {
  const ep = page.locator('input[placeholder="Endpoint"]').first();
  if (await ep.count()) await ep.fill(process.env.BAI_ENDPOINT);
  await userInput.fill(process.env.BAI_EMAIL);
  await page.locator('input[type="password"]').first().fill(process.env.BAI_PW);
  await page.getByRole('button', { name: /^login$/i }).first().click();
}
await wait(18000);

/* ---- 1. the e2e anchor the whole suite waits on -------------------------- */
log('userDropdownTestId', {
  count: await page.locator('[data-testid="user-dropdown-button"]').count(),
  // the same wait `loginAsAdmin` performs
  visible: await page
    .locator('[data-testid="user-dropdown-button"]')
    .first()
    .isVisible()
    .catch(() => false),
});

/* ---- 2. TOTP QR ---------------------------------------------------------
 * NOTE: this cluster reports no TOTP support, so the switch never renders and
 * the setup modal cannot be opened by hand. The QR is pinned instead by
 * `react/src/components/TOTPActivateForm.render.test.tsx`. Kept here so the
 * check runs by itself on a TOTP-enabled cluster.
 */
async function totp() {
  const out = {};
  try {
    await page.locator('[data-testid="user-dropdown-button"]').first().click();
    await wait(1500);
    await page
      .getByRole('menuitem', { name: /my account/i })
      .first()
      .click()
      .catch(() => {});
    await wait(6000);
    // the TOTP switch lives in the My Account modal
    const sw = page.locator('dialog[open] button[role="switch"], dialog[open] .astryx-switch');
    out.switches = await sw.count();
    if (out.switches) {
      await sw.first().click().catch(() => {});
      await wait(6000);
    }
    if (!out.switches) {
      // No TOTP switch => the cluster does not support TOTP and the setup
      // modal is unreachable. Say so rather than measuring whatever SVG
      // happens to be on screen.
      out.qr = 'unreachable: cluster reports no TOTP support';
    } else {
      out.qr = await page.evaluate(() => {
        // qrcode.react renders a 160x160 inline <svg> sized in MODULES, so its
        // viewBox is a square grid much larger than an icon's 24.
        const qr = [...document.querySelectorAll('dialog[open] svg')].find(
          (s) => {
            const b = (s.getAttribute('viewBox') || '').split(' ');
            return b.length === 4 && b[0] === '0' && Number(b[2]) > 24;
          },
        );
        if (!qr) return null;
        const paths = [...qr.querySelectorAll('path')];
        return {
          viewBox: qr.getAttribute('viewBox'),
          width: qr.getAttribute('width'),
          height: qr.getAttribute('height'),
          quietZoneFill: paths[0]?.getAttribute('fill'),
          moduleFill: paths[1]?.getAttribute('fill'),
        };
      });
    }
    out.antdQr = await page.locator('.ant-qrcode').count();
    await shot('totp-qr');
    await esc();
    await esc();
  } catch (e) {
    out.error = String(e).slice(0, 200);
    await esc().catch(() => {});
  }
  log('totp', out);
}
await totp();

/* ---- 3. a folded adapter in a real form --------------------------------- */
/**
 * The session list is empty on this cluster and TOTP is unsupported, so the
 * two inline-rename surfaces are unreachable. The session launcher is not:
 * `SessionOwnerSetterCard`'s on/off toggle is now the shared
 * `AstryxFormSwitch` (folded from `OwnerEnabledSwitch`), and the storage step's
 * per-folder path field is the shared `AstryxFormTextInput` at `size="sm"`
 * (folded from `MountPathInput`).
 */
async function launcher() {
  const out = {};
  try {
    await page.goto(`${BASE}session/start`, { waitUntil: 'domcontentloaded' });
    await wait(22000);
    await shot('launcher-step1');

    // SessionOwnerSetterCard — admin only. Astryx `Switch` renders a real
    // `<input type="checkbox">` (not `role="switch"`), and the shared adapter
    // passes the card title as a visually-hidden accessible name.
    const ownerSwitch = page.getByLabel(/session owner/i);
    out.ownerSwitchCount = await ownerSwitch.count();
    if (out.ownerSwitchCount) {
      out.ownerCheckedBefore = await ownerSwitch.first().isChecked();
      await ownerSwitch.first().click({ force: true });
      await wait(2500);
      out.ownerCheckedAfter = await ownerSwitch.first().isChecked();
      // the folded adapter must write through to Form.Item, which is what
      // reveals the owner fields
      out.ownerFieldsRevealed = await page
        .getByRole('textbox', { name: /owner|email/i })
        .count();
      await shot('launcher-owner-switch-on');
      await ownerSwitch.first().click({ force: true });
      await wait(1500);
      out.ownerCheckedReverted = await ownerSwitch.first().isChecked();
    }
    out.antdSwitches = await page.locator('.ant-switch').count();
  } catch (e) {
    out.error = String(e).slice(0, 200);
  }
  log('launcher', out);
}
await launcher();

log('pageErrors', pageErrors.slice(0, 10));
fs.writeFileSync(`${OUT}/measure-proof.json`, JSON.stringify(results, null, 2));
await browser.close();
