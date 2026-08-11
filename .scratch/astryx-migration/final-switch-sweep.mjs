/**
 * final switch — the sweep that has to hold for this commit.
 *
 * The commit removes the app's ENTIRE theming layer (antd `ConfigProvider` +
 * `App`, the three nested theme producers, the static-method holder), so a
 * regression would be global rather than local. This walks every top-level
 * route in both modes, opens the overlay surfaces (which are the ones that
 * used to render OUTSIDE the themed subtree and needed the holder), and
 * records three things per route:
 *
 *   - `pageErrors` — must be 0 everywhere. A missing provider surfaces as a
 *     thrown context read, not as a visual difference.
 *   - `astryxTheme` / `dataTheme` — the two attributes a root Astryx `<Theme>`
 *     syncs onto <html>. If the brand theme did not mount, `data-astryx-theme`
 *     is absent and everything paints theme-neutral.
 *   - a token probe — the resolved value of the accent and the surface, so an
 *     admin/secondary region can be told apart from the brand one by measured
 *     colour rather than by eye.
 *
 * Dark mode is entered through the HEADER BUTTON, not `colorScheme`, because
 * the header button is what drives `useThemeMode` — the single source of truth
 * the removed `ConfigProvider` used to be driven from in parallel.
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const ROOT = process.env.ROOT;
const BASE = process.env.BASE ?? 'http://127.0.0.1:6020/';
const PROJ =
  process.env.PROJ ?? 'a%ED%95%9C%EA%B5%AD%EC%96%B4%EA%B0%80%EB%8A%A5_cde';
const MODE = process.env.MODE ?? 'light';

const ROUTES = [
  ['p-start', `project/${PROJ}/start`],
  ['p-dashboard', `project/${PROJ}/dashboard`],
  ['p-data', `project/${PROJ}/data`],
  ['p-session', `project/${PROJ}/session`],
  ['p-session-start', `project/${PROJ}/session/start`],
  ['p-deployments', `project/${PROJ}/deployments`],
  ['p-chat', `project/${PROJ}/chat`],
  ['p-serving', `project/${PROJ}/model-store`],
  ['p-statistics', `project/${PROJ}/statistics`],
  ['p-environment', `project/${PROJ}/my-environment`],
  ['a-users', 'admin/users'],
  ['a-settings', 'admin/settings'],
  ['a-information', 'admin/information'],
  ['a-environment', 'admin/environment'],
  ['a-resources', 'admin/agent'],
  ['a-storage', 'admin/storage-settings'],
  ['m-usersettings', 'usersettings'],
];

/** Resolved theme state + a few token reads, straight off the cascade. */
const PROBE = () => {
  const root = document.documentElement;
  const cs = getComputedStyle(root);
  const read = (n) => cs.getPropertyValue(n).trim();
  // The header band is the one surface whose colour is deployment-authored
  // (theme.json `Layout.headerBg`) and reaches the DOM through the theme-shim.
  const header = document.querySelector('[data-testid="webui-header"]');
  const headerBg = header ? getComputedStyle(header).backgroundColor : null;
  // Any element painting the accent tells us which nested theme won.
  const accent = read('--color-accent') || read('--color-primary');
  return {
    dataTheme: root.getAttribute('data-theme'),
    astryxTheme: root.getAttribute('data-astryx-theme'),
    accent,
    surface: read('--color-background-surface'),
    body: read('--color-background-body'),
    text: read('--color-text-primary'),
    headerBg,
    // A page that rendered nothing is not a pass.
    textLen: document.body.innerText.length,
    // No antd DOM may exist anywhere. Matched on a CLASS-TOKEN boundary, not
    // `[class*="ant-"]`: the substring form counts Cloudscape's board classes
    // (`awsui_variant-default_…` contains "ant-") and reported 55-99 phantom
    // antd nodes per page.
    antdNodes: Array.from(document.querySelectorAll('[class]')).filter((e) =>
      String(e.className)
        .split(/\s+/)
        .some((c) => c.startsWith('ant-') || c === 'anticon'),
    ).length,
  };
};

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  storageState: `${ROOT}/final-switch-state.json`,
});
const page = await ctx.newPage();
page.setDefaultNavigationTimeout(120000);
const errs = [];
page.on('pageerror', (e) => errs.push(String(e).slice(0, 200)));

await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(14000);

if (MODE === 'dark') {
  const b = page.getByRole('button', { name: /^dark mode$/i }).first();
  if (await b.count()) {
    await b.click();
    await page.waitForTimeout(2500);
  } else {
    console.log('!!! dark-mode toggle NOT FOUND');
  }
}
console.log(
  '### initial theme attrs =',
  JSON.stringify(
    await page.evaluate(() => ({
      dataTheme: document.documentElement.getAttribute('data-theme'),
      astryxTheme: document.documentElement.getAttribute('data-astryx-theme'),
    })),
  ),
);

const settle = async () => {
  const deadline = Date.now() + 25000;
  while (Date.now() < deadline) {
    const s = await page.evaluate(() => {
      const sk = Array.from(document.querySelectorAll('*')).some((e) => {
        if (!/skeleton/i.test(String(e.className))) return false;
        const r = e.getBoundingClientRect();
        return r.width > 20 && r.height > 4;
      });
      return { sk, len: document.body.innerText.length };
    });
    if (!s.sk && s.len > 200) return true;
    await page.waitForTimeout(1200);
  }
  return false;
};

const report = { mode: MODE, routes: {}, overlays: {} };

for (const [id, path] of ROUTES) {
  try {
    await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    await settle();
    await page.waitForTimeout(1000);
    const p = await page.evaluate(PROBE);
    const e = errs.splice(0);
    report.routes[id] = { path, ...p, errs: e };
    await page.screenshot({
      path: `${ROOT}/shots/final-switch/${id}-${MODE}.png`,
    });
    console.log(
      `### ${id} theme=${p.dataTheme}/${p.astryxTheme} accent=${p.accent} headerBg=${p.headerBg} antdNodes=${p.antdNodes} len=${p.textLen} errs=${e.length}`,
    );
    e.forEach((x) => console.log(`      ERR ${x}`));
  } catch (err) {
    report.routes[id] = { path, error: String(err).slice(0, 200) };
    console.log(`### ${id} NAV-ERROR ${String(err).slice(0, 120)}`);
  }
}

/* ------------------------------------------------------------------ overlays
 * The four overlay families that used to render outside the app's themed
 * subtree, i.e. exactly the ones the removed `ConfigProvider.config({
 * holderRender })` existed to re-theme.
 */
const openOverlay = async (id, path, open) => {
  try {
    await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    await settle();
    await open();
    await page.waitForTimeout(2000);
    const p = await page.evaluate(() => {
      const dlg = document.querySelector('dialog[open]');
      const pop = document.querySelector('[popover]:popover-open');
      const el = dlg || pop;
      const cs = el ? getComputedStyle(el) : null;
      return {
        hasDialog: !!dlg,
        hasPopover: !!pop,
        bg: cs ? cs.backgroundColor : null,
        color: cs ? cs.color : null,
        text: el ? (el.innerText || '').trim().slice(0, 80) : null,
        antdNodes: Array.from(document.querySelectorAll('[class]')).filter(
          (e) =>
            String(e.className)
              .split(/\s+/)
              .some((c) => c.startsWith('ant-') || c === 'anticon'),
        ).length,
      };
    });
    const e = errs.splice(0);
    report.overlays[id] = { path, ...p, errs: e };
    await page.screenshot({
      path: `${ROOT}/shots/final-switch/ov-${id}-${MODE}.png`,
    });
    console.log(
      `### ov-${id} dialog=${p.hasDialog} popover=${p.hasPopover} bg=${p.bg} color=${p.color} antdNodes=${p.antdNodes} errs=${e.length} "${(p.text || '').replace(/\n/g, ' ')}"`,
    );
    e.forEach((x) => console.log(`      ERR ${x}`));
  } catch (err) {
    report.overlays[id] = { path, error: String(err).slice(0, 200) };
    console.log(`### ov-${id} ERROR ${String(err).slice(0, 140)}`);
  }
};

// 1. Modal — the folder-create dialog, opened from the Start page's action
//    card (a plain button with a stable label).
await openOverlay('modal-folder-create', `project/${PROJ}/start`, async () => {
  await page
    .getByRole('button', { name: /^create folder$/i })
    .first()
    .click();
});

// 2. Drawer — the notification drawer, opened from the header bell.
await openOverlay('drawer-notification', `project/${PROJ}/start`, async () => {
  const b = page.getByTestId('button-notification').first();
  if (await b.count()) await b.click();
});

// 3. Popover panel — the user dropdown, which declares its OWN MediaTheme
//    (it must stay on-dark for the trigger and its panel, without leaking that
//    context into the three modals it also mounts).
await openOverlay('menu-user', `project/${PROJ}/start`, async () => {
  await page.getByTestId('user-dropdown-button').first().click();
});

// 4. Toast — driven through the app-shim's dev handle, which is the surface
//    that replaced antd's static `message.*` and its detached holder.
await openOverlay('toast-appshim', `project/${PROJ}/start`, async () => {
  await page.evaluate(() => {
    window.__baiAppShim?.message?.success('final-switch toast probe');
  });
});

// 5. Select popup — the project selector, which sits ON the accent band and
//    is the `ghost` BAISelect variant.
await openOverlay('select-project', `project/${PROJ}/start`, async () => {
  await page
    .locator('[data-testid="webui-header"] button')
    .first()
    .click();
});

fs.writeFileSync(
  `${ROOT}/final-switch-sweep-${MODE}.json`,
  JSON.stringify(report, null, 1),
);
console.log('### total pageErrors seen:', errs.length);
await browser.close();
