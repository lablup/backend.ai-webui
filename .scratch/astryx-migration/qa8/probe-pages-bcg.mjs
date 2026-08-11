/**
 * qa8 group (2) items B + C + G — the folder-explorer surfaces.
 *
 *  B. card-type tab strip in the explorer's info panel: a stray VERTICAL
 *     border segment to its LEFT, above the rail.
 *  C. "create folder" modal — label column vs field column widths.
 *  G. upload dropdown — does its trigger still open on CLICK?
 *     (legacy antd `Dropdown trigger={['click']}`)
 */
import { BASE, ROOT, launch, measure, setMode, settle } from './probe-pages-lib.mjs';
import fs from 'node:fs';

const FOLDER = process.env.FOLDER ?? '6055ae8d-ea5c-4d20-ae6c-905ec08fad79';
const { browser, page, pageErrors } = await launch();
const result = {};

const hairlines = (page, clipSel) =>
  page.evaluate((sel) => {
    const scope = document.querySelector(sel) ?? document.body;
    const out = [];
    for (const el of scope.querySelectorAll('*')) {
      const r = el.getBoundingClientRect();
      const c = getComputedStyle(el);
      const bw = {
        l: parseFloat(c.borderLeftWidth) || 0,
        r: parseFloat(c.borderRightWidth) || 0,
        t: parseFloat(c.borderTopWidth) || 0,
        b: parseFloat(c.borderBottomWidth) || 0,
      };
      const isHairline = r.width > 0 && r.width <= 4 && r.height >= 8;
      const hasSideBorder = (bw.l > 0 || bw.r > 0) && r.height >= 8;
      if (!isHairline && !hasSideBorder) continue;
      out.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className?.toString?.() ?? '').slice(0, 90),
        rect: {
          x: +r.x.toFixed(1),
          y: +r.y.toFixed(1),
          w: +r.width.toFixed(1),
          h: +r.height.toFixed(1),
        },
        borderWidths: bw,
        borderLeftColor: c.borderLeftColor,
        borderRightColor: c.borderRightColor,
        bg: c.backgroundColor,
        txt: (el.textContent ?? '').trim().slice(0, 20),
      });
    }
    return out;
  }, clipSel);

const formColumns = (page) =>
  page.evaluate(() => {
    const form = document.querySelector('[data-bai-form]');
    if (!form) return null;
    const fr = form.getBoundingClientRect();
    const items = [];
    for (const it of form.querySelectorAll('[data-bai-form-item]')) {
      const lab = it.querySelector('[data-bai-form-item-label-col]');
      const ctl = it.querySelector('[data-bai-form-item-control-col]') ??
        it.querySelector('[data-bai-form-item-control]');
      const box = (el) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        const c = getComputedStyle(el);
        return {
          x: +r.x.toFixed(1),
          w: +r.width.toFixed(1),
          pct: +((r.width / fr.width) * 100).toFixed(1),
          flexBasis: c.flexBasis,
          maxWidth: c.maxWidth,
          padL: c.paddingLeft,
          padR: c.paddingRight,
          textAlign: c.textAlign,
        };
      };
      // the actual control element inside the control column
      const field = ctl?.querySelector(
        'input, .astryx-text-input, .astryx-selector, [class*="astryx-"]',
      );
      items.push({
        label: (lab?.textContent ?? '').trim().slice(0, 30),
        layout: it.getAttribute('data-layout'),
        labelCol: box(lab),
        controlCol: box(ctl),
        fieldEl: field
          ? (() => {
              const r = field.getBoundingClientRect();
              return {
                cls: (field.className?.toString?.() ?? '').slice(0, 50),
                x: +r.x.toFixed(1),
                w: +r.width.toFixed(1),
              };
            })()
          : null,
      });
    }
    return {
      formRect: { x: +fr.x.toFixed(1), w: +fr.width.toFixed(1) },
      dialog: (() => {
        const d = document.querySelector('dialog[open], .astryx-dialog');
        if (!d) return null;
        const r = d.getBoundingClientRect();
        const c = getComputedStyle(d);
        return {
          x: +r.x.toFixed(1),
          w: +r.width.toFixed(1),
          padL: c.paddingLeft,
          padR: c.paddingRight,
        };
      })(),
      items,
    };
  });

for (const mode of ['light', 'dark']) {
  const m = (result[mode] = {});

  // ============ /data page ================================================
  await page.goto(`${BASE}data`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(8000);
  await settle(page);
  m.appliedTheme = await setMode(page, mode);
  await settle(page, 4000);

  // ---- C(1): the /data page "Create Folder" modal ------------------------
  const createFolderBtn = page.getByRole('button', { name: /^create folder$/i }).first();
  if (await createFolderBtn.count()) {
    await createFolderBtn.click();
    await page.waitForTimeout(3500);
    await settle(page, 6000);
    m.createFolderModal = await formColumns(page);
    m.createFolderModalTitle = await page.evaluate(
      () =>
        document.querySelector('.astryx-dialog-header, [class*="dialog"] h2, dialog h2')
          ?.textContent ?? null,
    );
    await page
      .locator('dialog[open]')
      .first()
      .screenshot({ path: `${ROOT}/before-createfolder-${mode}.png` })
      .catch(() => {});
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1200);
  }

  // ============ folder explorer modal =====================================
  await page.goto(`${BASE}data?folder=${FOLDER}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(9000);
  await settle(page, 10000);
  await page.waitForTimeout(2500);

  // ---- B: the card tab strip --------------------------------------------
  m.tabStrip = await measure(page, '.bai-tab-list--card', [
    'border-left-width',
    'border-left-color',
    'border-bottom-width',
    'border-bottom-color',
    'align-items',
    'padding-inline-start',
    'gap',
  ]);
  m.tabStripSiblings = await page.evaluate(() => {
    const nav = document.querySelector('.bai-tab-list--card');
    if (!nav) return null;
    const nr = nav.getBoundingClientRect();
    const info = (el, tag) => {
      const r = el.getBoundingClientRect();
      const c = getComputedStyle(el);
      return {
        role: tag,
        tag: el.tagName.toLowerCase(),
        cls: (el.className?.toString?.() ?? '').slice(0, 80),
        rect: {
          x: +r.x.toFixed(1),
          y: +r.y.toFixed(1),
          w: +r.width.toFixed(1),
          h: +r.height.toFixed(1),
        },
        borders: `${c.borderTopWidth} ${c.borderRightWidth} ${c.borderBottomWidth} ${c.borderLeftWidth}`,
        borderLeftColor: c.borderLeftColor,
        bg: c.backgroundColor,
      };
    };
    const out = { nav: info(nav, 'nav') };
    out.firstTab = nav.querySelector('.astryx-tab')
      ? info(nav.querySelector('.astryx-tab'), 'first tab')
      : null;
    out.parent = nav.parentElement ? info(nav.parentElement, 'parent') : null;
    out.prevSibling = nav.previousElementSibling
      ? info(nav.previousElementSibling, 'prev sibling')
      : null;
    // everything painting in the 60px strip immediately LEFT of the nav
    out.leftOfNav = [];
    for (const el of document.querySelectorAll('*')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.right < nr.left - 60 || r.left > nr.left + 8) continue;
      if (r.bottom < nr.top - 12 || r.top > nr.bottom + 12) continue;
      if (r.width > 80) continue;
      const c = getComputedStyle(el);
      out.leftOfNav.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className?.toString?.() ?? '').slice(0, 80),
        rect: {
          x: +r.x.toFixed(1),
          y: +r.y.toFixed(1),
          w: +r.width.toFixed(1),
          h: +r.height.toFixed(1),
        },
        borders: `${c.borderTopWidth} ${c.borderRightWidth} ${c.borderBottomWidth} ${c.borderLeftWidth}`,
        colors: `${c.borderTopColor}|${c.borderRightColor}|${c.borderBottomColor}|${c.borderLeftColor}`,
        bg: c.backgroundColor,
      });
    }
    return out;
  });
  m.explorerHairlines = await hairlines(page, 'dialog[open]');
  const navBox = m.tabStrip?.rect;
  if (navBox) {
    await page.screenshot({
      path: `${ROOT}/before-tabstrip-${mode}.png`,
      clip: {
        x: Math.max(0, navBox.x - 90),
        y: Math.max(0, navBox.y - 40),
        width: 400,
        height: navBox.h + 90,
      },
    });
  }
  await page.screenshot({ path: `${ROOT}/before-explorer-${mode}.png` });

  // ---- G: upload dropdown ------------------------------------------------
  const uploadBtn = page
    .locator('dialog[open] button')
    .filter({ hasText: /^upload$/i })
    .first();
  const uploadFallback = page.locator('dialog[open] button[aria-label="Upload" i]').first();
  const trigger = (await uploadBtn.count()) ? uploadBtn : uploadFallback;
  m.upload = { found: await trigger.count() };
  if (m.upload.found) {
    const menuCount = () =>
      page.evaluate(
        () =>
          document.querySelectorAll(
            '[role="menu"], .astryx-dropdown-menu, .astryx-menu, [class*="dropdown-menu"]',
          ).length,
      );
    const menuVisible = () =>
      page.evaluate(() => {
        const els = [
          ...document.querySelectorAll(
            '[role="menu"], .astryx-dropdown-menu, .astryx-menu, [class*="dropdown-menu"]',
          ),
        ];
        return els
          .map((e) => {
            const r = e.getBoundingClientRect();
            const c = getComputedStyle(e);
            return {
              cls: (e.className?.toString?.() ?? '').slice(0, 60),
              w: +r.width.toFixed(1),
              h: +r.height.toFixed(1),
              display: c.display,
              visibility: c.visibility,
              items: [...e.querySelectorAll('[role="menuitem"], button, li')]
                .map((i) => i.textContent?.trim().slice(0, 24))
                .filter(Boolean),
            };
          })
          .filter((e) => e.w > 0 && e.h > 0);
      });
    m.upload.beforeHover = { menus: await menuCount(), visible: await menuVisible() };
    // hover only
    await trigger.hover();
    await page.waitForTimeout(1200);
    m.upload.afterHover = { menus: await menuCount(), visible: await menuVisible() };
    // click 1
    await trigger.click();
    await page.waitForTimeout(1200);
    m.upload.afterClick1 = { menus: await menuCount(), visible: await menuVisible() };
    await page.screenshot({ path: `${ROOT}/before-upload-click1-${mode}.png` });
    // click 2 (should close)
    await trigger.click();
    await page.waitForTimeout(1200);
    m.upload.afterClick2 = { menus: await menuCount(), visible: await menuVisible() };
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(600);
  }

  // ---- C(2): the explorer's own "Create Folder" (CreateDirectoryModal) ----
  const mkdirBtn = page
    .locator('dialog[open] button')
    .filter({ hasText: /^create folder$/i })
    .first();
  if (await mkdirBtn.count()) {
    await mkdirBtn.click();
    await page.waitForTimeout(2500);
    await settle(page, 4000);
    m.mkdirModal = await formColumns(page);
    await page.screenshot({ path: `${ROOT}/before-mkdir-${mode}.png` });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
  }
}

result.pageErrors = pageErrors;
fs.writeFileSync(`${ROOT}/before-pages-bcg.json`, JSON.stringify(result, null, 2));
console.log('written');
await browser.close();
