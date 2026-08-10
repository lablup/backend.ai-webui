/**
 * qa8 IMPLEMENTATION probe 2 — fixes Q-27 (RBAC detail drawer empty shell on
 * close), Q-28 (folder-explorer upload dropdown self-closing on click) and
 * Q-29 (Create Project registry/project fields stacked).
 *
 * Run with PHASE=before|after; writes ${ROOT}/${PHASE}-impl-pages2.json.
 */
import { BASE, ROOT, launch, setMode, settle } from './probe-pages-lib.mjs';
import fs from 'node:fs';

const PHASE = process.env.PHASE ?? 'before';
const FOLDER = process.env.FOLDER ?? '6055ae8d-ea5c-4d20-ae6c-905ec08fad79';
const { browser, page, pageErrors } = await launch();
const result = { phase: PHASE };

// ===================== Q-27: RBAC detail drawer ==========================
/**
 * There are several `dialog.astryx-drawer` nodes mounted at once (the header's
 * Notifications drawer is always in the tree). The RBAC one is the WIDE one
 * (`size={800}`); when every drawer is collapsed we report `present: false`.
 */
const drawerState = () =>
  page.evaluate(() => {
    const all = [...document.querySelectorAll('dialog.astryx-drawer')];
    const read = (d) => {
      const r = d.getBoundingClientRect();
      const c = getComputedStyle(d);
      const title = d.querySelector('.bai-drawer-title');
      const body = d.querySelector('.bai-drawer-body, .bai-drawer-body-flush');
      return {
        openAttr: d.hasAttribute('open'),
        rect: { x: +r.x.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) },
        transform: c.transform,
        opacity: c.opacity,
        visibility: c.visibility,
        title: title?.textContent?.trim().slice(0, 60) ?? null,
        bodyLen: (body?.textContent ?? '').trim().length,
        bodyHead: (body?.textContent ?? '').trim().slice(0, 70),
      };
    };
    // widest drawer that is actually laid out
    const candidates = all.map(read).filter((s) => s.rect.w >= 400);
    if (!candidates.length) {
      return { present: false, drawerCount: all.length };
    }
    candidates.sort((a, b) => b.rect.w - a.rect.w);
    return { present: true, drawerCount: all.length, ...candidates[0] };
  });

await page.goto(`${BASE}admin/rbac`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(9000);
await settle(page, 8000);
await page.waitForTimeout(1500);

result.D = { url: page.url() };
const rowNames = await page.evaluate(() =>
  [...document.querySelectorAll('table tbody tr')]
    .map((tr) => tr.querySelector('td')?.textContent?.trim().slice(0, 40) ?? '')
    .filter(Boolean),
);
result.D.rowNames = rowNames;

const openRow = async (i) => {
  await page.locator('table tbody tr').nth(i).locator('td').first().click();
  await page.waitForTimeout(2200);
  await settle(page, 5000);
  return drawerState();
};

// --- role A: open, then SAMPLE the whole close sequence -------------------
result.D.openedA = await openRow(0);
if (result.D.openedA.present) {
  const closeBtn = page
    .locator('dialog.astryx-drawer[open] .bai-drawer-header button')
    .first();
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
  // the number the finding is about: is there any frame where the drawer is
  // still fully open (transform none / matrix identity) but the body is empty?
  result.D.emptyWhileOpenFrames = samples.filter(
    (s) => s.present && s.bodyLen === 0 && (s.transform === 'none' || /matrix\(1, 0, 0, 1, 0, 0\)/.test(s.transform ?? '')),
  ).length;
  result.D.firstEmptyBodyAt = samples.find((s) => s.present && s.bodyLen === 0)?.t ?? null;
  result.D.firstFallbackTitleAt =
    samples.find((s) => s.present && /^RBAC Role Info/i.test(s.title ?? ''))?.t ?? null;
  result.D.firstSlideAt =
    samples.find((s) => s.present && s.transform && s.transform !== 'none' && !/matrix\(1, 0, 0, 1, 0, 0\)/.test(s.transform))?.t ?? null;
  await page.waitForTimeout(1400);
  result.D.afterClose = await drawerState();
}

// --- role B: does a DIFFERENT role render its own data immediately? -------
if (rowNames.length > 1) {
  // A is already closed; open a DIFFERENT role and sample early + settled.
  await page.locator('table tbody tr').nth(2).locator('td').first().click();
  await page.waitForTimeout(300);
  result.D.roleBAt300ms = await drawerState();
  await page.waitForTimeout(2500);
  await settle(page, 5000);
  result.D.roleBSettled = await drawerState();
  result.D.roleATitle = result.D.openedA.title;
  result.D.roleBDiffersFromA =
    result.D.roleBSettled.title !== result.D.openedA.title;
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1400);
  result.D.afterCloseB = await drawerState();
}

// ===================== Q-29: Create Project modal ========================
await page.goto(`${BASE}admin/project`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(9000);
await settle(page, 8000);
result.F = {};
const createProjectBtn = page.getByRole('button', { name: /^create project$/i }).first();
await createProjectBtn.waitFor({ state: 'visible', timeout: 60000 }).catch(() => {});
result.F.triggerFound = await createProjectBtn.count();
if (result.F.triggerFound) {
  await createProjectBtn.click();
  await page.waitForTimeout(3500);
  await settle(page, 8000);
  await page.waitForTimeout(1500);
  result.F.registrySection = await page.evaluate(() => {
    const items = [...document.querySelectorAll('[data-bai-form-item]')];
    const target = items.find((i) =>
      /container registry/i.test(
        i.querySelector('[data-bai-form-item-label]')?.textContent ?? '',
      ),
    );
    if (!target) return { found: false };
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
        marginRight: c.marginRight,
        minWidth: c.minWidth,
      };
    };
    const inputs = [...target.querySelectorAll('input')];
    const fields = [...target.querySelectorAll('.astryx-field')];
    return {
      found: true,
      controlCol: box(
        target.querySelector('[data-bai-form-item-control-col]') ??
          target.querySelector('[data-bai-form-item-control]'),
        'control col',
      ),
      fields: fields.map((f, i) => box(f, `field ${i}`)),
      inputs: inputs.map((inp, i) => ({ ...box(inp, `input ${i}`), placeholder: inp.placeholder })),
      fieldDeltaY:
        fields.length === 2
          ? +(fields[1].getBoundingClientRect().y - fields[0].getBoundingClientRect().y).toFixed(1)
          : null,
      sameRow:
        inputs.length === 2
          ? Math.abs(
              inputs[0].getBoundingClientRect().y - inputs[1].getBoundingClientRect().y,
            ) < 4
          : null,
      // right edge of the second field vs the control column right edge —
      // catches the Grid/HStack overflow trap
      overflowPx: (() => {
        const cc =
          target.querySelector('[data-bai-form-item-control-col]') ??
          target.querySelector('[data-bai-form-item-control]');
        if (!cc || fields.length !== 2) return null;
        return +(
          fields[1].getBoundingClientRect().right - cc.getBoundingClientRect().right
        ).toFixed(1);
      })(),
    };
  });
  await page
    .locator('dialog[open]')
    .first()
    .screenshot({ path: `${ROOT}/${PHASE}-q29-createproject-light.png` })
    .catch(() => {});
  await setMode(page, 'dark');
  await page.waitForTimeout(1200);
  await page
    .locator('dialog[open]')
    .first()
    .screenshot({ path: `${ROOT}/${PHASE}-q29-createproject-dark.png` })
    .catch(() => {});
  await setMode(page, 'light');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1200);
}

// ===================== Q-28: upload dropdown =============================
await page.goto(`${BASE}data?folder=${FOLDER}`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(10000);
await settle(page, 10000);
await page.waitForTimeout(2500);

/** The upload menu specifically — identified by its two known rows. */
const menuState = () =>
  page.evaluate(() => {
    const uploadMenu = [...document.querySelectorAll('[role="menu"]')].find((m) =>
      [...m.querySelectorAll('[role="menuitem"]')].some((i) =>
        /upload files/i.test(i.textContent ?? ''),
      ),
    );
    const trigger = [...document.querySelectorAll('button')].find((b) =>
      /^upload$/i.test((b.getAttribute('aria-label') ?? b.textContent ?? '').trim()),
    );
    const r = uploadMenu?.getBoundingClientRect();
    return {
      menuW: r ? +r.width.toFixed(1) : null,
      menuH: r ? +r.height.toFixed(1) : null,
      menuOpen: !!r && r.width > 0 && r.height > 0,
      popoverOpen: !!uploadMenu?.closest('[popover]')?.matches(':popover-open'),
      ariaExpanded: trigger?.getAttribute('aria-expanded') ?? null,
    };
  });

/** Poll the menu for `ms` and return the timeline. */
const sampleMenu = async (ms, every = 40) => {
  const out = [];
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    out.push({ t: Date.now() - t0, ...(await menuState()) });
    await page.waitForTimeout(every);
  }
  return out;
};

const trig = page.locator('button').filter({ hasText: /^Upload$/ }).first();
const trigAlt = page.locator('button[aria-label="Upload" i]').first();
const t = (await trig.count()) ? trig : trigAlt;
result.G = { triggerFound: await t.count() };
if (result.G.triggerFound) {
  result.G.rest = await menuState();
  await t.click();
  result.G.clickTimeline = await sampleMenu(2000);
  result.G.afterClickSettled = await menuState();
  result.G.openedAtAnyPoint = result.G.clickTimeline.some((s) => s.menuOpen);
  result.G.stillOpenAt2s = result.G.afterClickSettled.menuOpen;
  await page.screenshot({ path: `${ROOT}/${PHASE}-q28-upload-click.png` });
  // second click must CLOSE it
  await t.click();
  await page.waitForTimeout(900);
  result.G.afterSecondClick = await menuState();
  // keyboard route must still work
  await t.focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(900);
  result.G.afterEnter = await menuState();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);
  result.G.afterEscape = await menuState();
}

result.pageErrors = pageErrors;
fs.writeFileSync(
  `${ROOT}/${PHASE}-impl-pages2.json`,
  JSON.stringify(result, null, 2),
);
console.log(`written ${PHASE}-impl-pages2.json`);
await browser.close();
