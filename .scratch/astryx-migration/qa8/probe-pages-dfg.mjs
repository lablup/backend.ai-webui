/**
 * qa8 group (2) items D + F + G.
 *
 *  D. RBAC detail drawer resets to an empty "Role Detail Info" shell while it
 *     animates closed.
 *  F. Admin > Projects > Create Project: "Container Registry for Image Commit"
 *     — the Registry and Project inputs should share one row.
 *  G. Folder-explorer upload dropdown: does a CLICK on the trigger open it?
 */
import { BASE, ROOT, launch, setMode, settle } from './probe-pages-lib.mjs';
import fs from 'node:fs';

const FOLDER = process.env.FOLDER ?? '6055ae8d-ea5c-4d20-ae6c-905ec08fad79';
const { browser, page, pageErrors } = await launch();
const result = {};

// ===================== D: RBAC detail drawer ==============================
await page.goto(`${BASE}admin/rbac`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(9000);
await settle(page, 8000);
await page.waitForTimeout(1500);

const drawerState = () =>
  page.evaluate(() => {
    const d =
      document.querySelector('.astryx-drawer, [class*="drawer"][class*="astryx"]') ??
      document.querySelector('[role="dialog"]');
    if (!d) return { present: false };
    const r = d.getBoundingClientRect();
    const c = getComputedStyle(d);
    const title = d.querySelector('.bai-drawer-title');
    const body = d.querySelector('.bai-drawer-body, .bai-drawer-body-flush');
    return {
      present: true,
      cls: (d.className?.toString?.() ?? '').slice(0, 60),
      rect: {
        x: +r.x.toFixed(1),
        w: +r.width.toFixed(1),
        h: +r.height.toFixed(1),
      },
      transform: c.transform,
      opacity: c.opacity,
      visibility: c.visibility,
      title: title?.textContent?.trim().slice(0, 60) ?? null,
      bodyLen: (body?.textContent ?? '').trim().length,
      bodyHead: (body?.textContent ?? '').trim().slice(0, 70),
    };
  });

const openLink = page.locator('table tbody tr a, table tbody tr button').first();
result.D = { rbacUrl: page.url() };
// click the first role name cell (opens the detail drawer via ?roleDetail=)
const nameCell = page.locator('table tbody tr td').first();
await nameCell.click();
await page.waitForTimeout(2500);
await settle(page, 5000);
result.D.opened = await drawerState();
result.D.urlAfterOpen = page.url();

if (result.D.opened.present) {
  await page.screenshot({ path: `${ROOT}/before-d-drawer-open.png` });
  // close via the drawer's own close button and SAMPLE the exit
  const closeBtn = page.locator('.bai-drawer-header button[aria-label="Close" i]').first();
  const samples = [];
  const t0 = Date.now();
  const sampler = (async () => {
    while (Date.now() - t0 < 1400) {
      samples.push({ t: Date.now() - t0, ...(await drawerState()) });
      await page.waitForTimeout(45);
    }
  })();
  await closeBtn.click().catch(async () => {
    await page.keyboard.press('Escape');
  });
  await sampler;
  result.D.exitSamples = samples;
  await page.waitForTimeout(1200);
  result.D.afterClose = await drawerState();
  result.D.urlAfterClose = page.url();
}

// ===================== F: Create Project modal ============================
await page.goto(`${BASE}admin/project`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(9000);
await settle(page, 8000);
result.F = {};
for (const mode of ['light']) {
  await setMode(page, mode);
  const btn = page.getByRole('button', { name: /^create project$/i }).first();
  if (!(await btn.count())) {
    result.F.error = 'Create Project button not found';
    break;
  }
  await btn.click();
  await page.waitForTimeout(3500);
  await settle(page, 8000);
  await page.waitForTimeout(1500);
  result.F.registrySection = await page.evaluate(() => {
    // find the form item whose label mentions "Container Registry"
    const items = [...document.querySelectorAll('[data-bai-form-item]')];
    const target = items.find((i) =>
      /container registry/i.test(i.querySelector('[data-bai-form-item-label]')?.textContent ?? ''),
    );
    if (!target) return { found: false, labels: items.map((i) => i.querySelector('[data-bai-form-item-label]')?.textContent?.trim().slice(0, 40)) };
    const box = (el, role) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const c = getComputedStyle(el);
      return {
        role,
        tag: el.tagName.toLowerCase(),
        cls: (el.className?.toString?.() ?? '').slice(0, 60),
        rect: {
          x: +r.x.toFixed(1),
          y: +r.y.toFixed(1),
          w: +r.width.toFixed(1),
          h: +r.height.toFixed(1),
        },
        display: c.display,
        width: c.width,
        flex: `${c.flexGrow}/${c.flexShrink}/${c.flexBasis}`,
        marginRight: c.marginRight,
      };
    };
    const control = target.querySelector('[data-bai-form-item-control]');
    const nested = [...target.querySelectorAll('[data-bai-form-item]')];
    const inputs = [...target.querySelectorAll('input')];
    return {
      found: true,
      item: box(target, 'container_registry item'),
      controlCol: box(control, 'control col'),
      controlInput: box(
        target.querySelector('[data-bai-form-item-control-input]'),
        'control-input',
      ),
      nested: nested.map((n, i) => box(n, `nested item ${i}`)),
      fields: [...target.querySelectorAll('.astryx-field, .astryx-text-input')].map((f, i) =>
        box(f, `field ${i}`),
      ),
      inputs: inputs.map((inp, i) => ({
        ...box(inp, `input ${i}`),
        placeholder: inp.placeholder,
      })),
      sameRow:
        inputs.length === 2
          ? Math.abs(
              inputs[0].getBoundingClientRect().y - inputs[1].getBoundingClientRect().y,
            ) < 4
          : null,
    };
  });
  await page
    .locator('dialog[open]')
    .first()
    .screenshot({ path: `${ROOT}/before-f-createproject-${mode}.png` })
    .catch(() => {});
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);
}

// ===================== G: upload dropdown =================================
await page.goto(`${BASE}data?folder=${FOLDER}`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(10000);
await settle(page, 10000);
await page.waitForTimeout(2500);

const menuState = () =>
  page.evaluate(() => {
    const menus = [...document.querySelectorAll('[role="menu"]')].map((m) => {
      const r = m.getBoundingClientRect();
      const c = getComputedStyle(m);
      return {
        w: +r.width.toFixed(1),
        h: +r.height.toFixed(1),
        display: c.display,
        visibility: c.visibility,
        items: [...m.querySelectorAll('[role="menuitem"]')]
          .map((i) => i.textContent?.trim().slice(0, 22))
          .filter(Boolean),
      };
    });
    const trigger = [...document.querySelectorAll('button')].find(
      (b) => /^upload$/i.test((b.getAttribute('aria-label') ?? b.textContent ?? '').trim()),
    );
    return {
      menus,
      openMenus: menus.filter((m) => m.w > 0 && m.h > 0).length,
      triggerAriaExpanded: trigger?.getAttribute('aria-expanded') ?? null,
      popoversOpen: [...document.querySelectorAll('[popover]')].filter((p) =>
        p.matches(':popover-open'),
      ).length,
    };
  });

const trig = page
  .locator('button')
  .filter({ hasText: /^Upload$/ })
  .first();
const trigAlt = page.locator('button[aria-label="Upload" i]').first();
const t = (await trig.count()) ? trig : trigAlt;
result.G = { triggerFound: await t.count() };
if (result.G.triggerFound) {
  result.G.rest = await menuState();
  await t.hover();
  await page.waitForTimeout(900);
  result.G.afterHover = await menuState();
  await t.click();
  await page.waitForTimeout(150);
  result.G.afterClick_150ms = await menuState();
  await page.waitForTimeout(900);
  result.G.afterClick_1s = await menuState();
  await page.screenshot({ path: `${ROOT}/before-g-upload-click.png` });
  await t.click();
  await page.waitForTimeout(900);
  result.G.afterSecondClick = await menuState();
  // keyboard route (Enter on the focused trigger)
  await t.focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(900);
  result.G.afterEnter = await menuState();
}

result.pageErrors = pageErrors;
fs.writeFileSync(`${ROOT}/before-pages-dfg.json`, JSON.stringify(result, null, 2));
console.log('written');
await browser.close();
