/**
 * Phase 3 wave 3 · partition B — header-overlay theming probe.
 *
 *   BAI_ENDPOINT=... BAI_EMAIL=... BAI_PW=... \
 *     node .scratch/astryx-migration/p3-w3b-probe.mjs
 *
 * Measures, in BOTH modes:
 *   - the Downloads modal's dialog background + its `data-astryx-media`
 *     ancestors (the suspected cause of "dark modal in light mode")
 *   - the My Account (UserProfileSettingModal) form-label colours against the
 *     dialog background (the "invisible labels" defect)
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE = process.env.W3B_BASE ?? 'http://127.0.0.1:5900/';
const OUT = process.env.W3B_OUT ?? '.scratch/astryx-migration/shots/p3-w3b';
const TAG = process.env.W3B_TAG ?? 'before';
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

const shot = (name) => page.screenshot({ path: `${OUT}/${TAG}-${name}.png` });
const wait = (ms) => page.waitForTimeout(ms);
const esc = async () => {
  await page.keyboard.press('Escape');
  await wait(1200);
};

/* ------------------------------- login -------------------------------- */
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await wait(9000);
const userInput = page.locator('input[placeholder="Email or Username"]').first();
if (await userInput.count()) {
  const ep = page.locator('input[placeholder="Endpoint"]').first();
  if ((await ep.count()) && process.env.BAI_ENDPOINT)
    await ep.fill(process.env.BAI_ENDPOINT);
  if (process.env.BAI_EMAIL) await userInput.fill(process.env.BAI_EMAIL);
  if (process.env.BAI_PW)
    await page
      .locator('input[type="password"]')
      .first()
      .fill(process.env.BAI_PW);
  await page
    .getByRole('button', { name: /^login$/i })
    .first()
    .click();
}
await wait(18000);
log('loggedIn', !(await userInput.count()));

/** Reads the theming context of every open <dialog>. */
const probeDialogs = () =>
  page.evaluate(() => {
    const out = [];
    for (const d of document.querySelectorAll('dialog[open]')) {
      const cs = getComputedStyle(d);
      // walk up recording data-astryx-media declarations
      const media = [];
      let n = d.parentElement;
      while (n) {
        const m = n.getAttribute?.('data-astryx-media');
        if (m) media.push(`${n.tagName.toLowerCase()}=${m}`);
        n = n.parentElement;
      }
      // sample the antd form labels inside
      const labels = [...d.querySelectorAll('.ant-form-item-label label')]
        .slice(0, 4)
        .map((l) => ({
          text: (l.textContent || '').trim().slice(0, 28),
          color: getComputedStyle(l).color,
        }));
      // sample any plain text nodes' inherited colour
      const body = d.querySelector('[class*="astryx-dialog"], div');
      out.push({
        cls: d.className.slice(0, 90),
        bg: cs.backgroundColor,
        color: cs.color,
        colorScheme: cs.colorScheme,
        bodyColor: body ? getComputedStyle(body).color : null,
        mediaAncestors: media,
        labels,
        heading:
          d.querySelector('h1,h2,h3,[class*="heading"]')?.textContent?.trim()?.slice(0, 40) ??
          null,
      });
    }
    return out;
  });

// The trigger carries `data-testid="user-dropdown-button"` only AFTER the
// testId fix; fall back to "last button in the header band" so the same probe
// runs against the before-state.
const openUserMenu = async () => {
  const byId = page.locator('[data-testid="user-dropdown-button"]');
  if (await byId.count()) {
    await byId.first().click();
  } else {
    await page.locator('[data-testid="webui-header"] button').last().click();
  }
  await wait(1500);
};

async function downloads(tag) {
  const out = {};
  try {
    await page.goto(`${BASE}start`, { waitUntil: 'domcontentloaded' });
    await wait(9000);
    await openUserMenu();
    await page
      .getByRole('menuitem', { name: /download/i })
      .first()
      .click()
      .catch(async () => {
        await page.getByText(/^Downloads$/).first().click();
      });
    await wait(3000);
    out.dialogs = await probeDialogs();
    await shot(`downloads-${tag}`);
    await esc();
  } catch (e) {
    out.error = String(e).slice(0, 200);
    await esc().catch(() => {});
  }
  log(`downloads_${tag}`, out);
}

async function myAccount(tag) {
  const out = {};
  try {
    await page.goto(`${BASE}start`, { waitUntil: 'domcontentloaded' });
    await wait(9000);
    await openUserMenu();
    await page
      .getByRole('menuitem', { name: /my account/i })
      .first()
      .click()
      .catch(async () => {
        await page.getByText(/^My Account$/).first().click();
      });
    await wait(6000);
    out.dialogs = await probeDialogs();
    await shot(`my-account-${tag}`);
    await esc();
  } catch (e) {
    out.error = String(e).slice(0, 200);
    await esc().catch(() => {});
  }
  log(`myAccount_${tag}`, out);
}

async function aboutModal(tag) {
  const out = {};
  try {
    await page.goto(`${BASE}start`, { waitUntil: 'domcontentloaded' });
    await wait(9000);
    await openUserMenu();
    await page
      .getByRole('menuitem', { name: /about backend/i })
      .first()
      .click()
      .catch(() => {});
    await wait(3000);
    out.dialogs = await probeDialogs();
    await shot(`about-${tag}`);
    await esc();
  } catch (e) {
    out.error = String(e).slice(0, 200);
    await esc().catch(() => {});
  }
  log(`about_${tag}`, out);
}

/** Header band must STAY on-dark (white text) in both modes. */
async function headerBand(tag) {
  const out = await page.evaluate(() => {
    const h = document.querySelector('[data-testid="webui-header"]');
    if (!h) return { missing: true };
    const cs = getComputedStyle(h);
    const label = h.querySelector('[class*="astryx-text"], span, p');
    const btn = document.querySelector('[data-testid="user-dropdown-button"]');
    return {
      bg: cs.backgroundColor,
      inheritedColor: cs.color,
      labelColor: label ? getComputedStyle(label).color : null,
      triggerColor: btn ? getComputedStyle(btn).color : null,
      mediaWrappers: [...h.querySelectorAll('[data-astryx-media]')].map((n) =>
        n.getAttribute('data-astryx-media'),
      ),
    };
  });
  log(`headerBand_${tag}`, out);
}

const setMode = async (mode) => {
  await page.goto(`${BASE}start`, { waitUntil: 'domcontentloaded' });
  await wait(8000);
  const cur = await page.evaluate(() =>
    document.documentElement.getAttribute('data-theme'),
  );
  if (cur !== mode) {
    await page.locator('[data-testid="button-theme"]').first().click();
    await wait(3000);
  }
  log(
    `mode_${mode}`,
    await page.evaluate(() =>
      document.documentElement.getAttribute('data-theme'),
    ),
  );
};

await setMode('light');
await headerBand('light');
await downloads('light');
await myAccount('light');
await aboutModal('light');

await setMode('dark');
await headerBand('dark');
await downloads('dark');
await myAccount('dark');
await aboutModal('dark');

log('pageErrors', pageErrors.slice(0, 10));
fs.writeFileSync(`${OUT}/measure-${TAG}.json`, JSON.stringify(results, null, 2));
await browser.close();
