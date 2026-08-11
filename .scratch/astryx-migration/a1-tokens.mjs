/**
 * approved-1 — P1 verification: every pinned token measured ON THE PAGE, in
 * both modes, plus the rendered surfaces the pins are supposed to move
 * (heading sites, dialog gutters/surface/radius, line rhythm).
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const ROOT = process.env.ROOT;
const BASE = process.env.BASE ?? 'http://127.0.0.1:5960/';
const PROJ =
  process.env.PROJ ?? 'a%ED%95%9C%EA%B5%AD%EC%96%B4%EA%B0%80%EB%8A%A5_cde';

const VARS = [
  '--color-text-primary',
  '--color-text-secondary',
  '--color-text-disabled',
  '--color-icon-primary',
  '--color-icon-secondary',
  '--color-icon-disabled',
  '--color-overlay-hover',
  '--color-overlay-pressed',
  '--color-background-popover',
  '--radius-container',
  '--radius-element',
  '--text-heading-1-size',
  '--text-heading-2-size',
  '--text-heading-3-size',
  '--text-heading-4-size',
  '--text-heading-5-size',
  '--text-body-leading',
  '--text-label-leading',
  '--text-code-leading',
  '--font-size-3xl',
  '--size-element-sm',
  '--size-element-md',
  '--shadow-med',
  '--shadow-high',
];

const READ = (vars) => {
  const cs = getComputedStyle(document.documentElement);
  const out = {
    theme: document.documentElement.dataset.theme ?? null,
    vars: {},
  };
  for (const v of vars) out.vars[v] = cs.getPropertyValue(v).trim();

  // Off-screen render of the five heading levels + body, so the SIZE ladder is
  // read off real Astryx components rather than off the variables alone.
  const probe = document.createElement('div');
  probe.style.cssText = 'position:fixed;left:-9999px;top:0;';
  probe.innerHTML = `
    <p class="astryx-text body">body</p>
    <h1 class="astryx-heading level-1">h1</h1>
    <h2 class="astryx-heading level-2">h2</h2>
    <h3 class="astryx-heading level-3">h3</h3>
    <h4 class="astryx-heading level-4">h4</h4>
    <h5 class="astryx-heading level-5">h5</h5>`;
  document.body.appendChild(probe);
  const m = (sel) => {
    const e = probe.querySelector(sel);
    if (!e) return null;
    const c = getComputedStyle(e);
    return `${c.fontSize} / lh ${c.lineHeight} / w ${c.fontWeight}`;
  };
  out.rendered = {
    'text.body': m('.astryx-text.body'),
    'heading.1': m('.level-1'),
    'heading.2': m('.level-2'),
    'heading.3': m('.level-3'),
    'heading.4': m('.level-4'),
    'heading.5': m('.level-5'),
  };
  probe.remove();

  // Heading sites that actually exist on the loaded page.
  out.headingSites = Array.from(document.querySelectorAll('.astryx-heading'))
    .slice(0, 12)
    .map((e) => {
      const c = getComputedStyle(e);
      return `${e.tagName} "${(e.innerText || '').trim().slice(0, 26)}" ${c.fontSize}/${c.lineHeight}/${c.fontWeight} ${c.color}`;
    });

  const samp = (sel, label) => {
    const e = document.querySelector(sel);
    if (!e) return null;
    const c = getComputedStyle(e);
    return `${label}: ${c.fontSize}/${c.lineHeight}/${c.fontWeight} color=${c.color} bg=${c.backgroundColor} radius=${c.borderRadius}`;
  };
  out.page = [
    samp('.astryx-side-nav-item', 'siderItem'),
    samp('.astryx-card', 'card'),
    samp('[data-testid="webui-breadcrumb"]', 'breadcrumb(antd)'),
    samp('body', 'body'),
    samp('.astryx-button.sm', 'button.sm'),
  ].filter(Boolean);

  // The two engines' line rhythm on one screen (catalog G-2).
  const bc = document.querySelector('[data-testid="webui-breadcrumb"]');
  const anyText = document.querySelector('.astryx-text.body, .astryx-text');
  out.lineRhythm = {
    breadcrumbAntd: bc ? getComputedStyle(bc).lineHeight : null,
    astryxText: anyText ? getComputedStyle(anyText).lineHeight : null,
    bodyLineHeight: getComputedStyle(document.body).lineHeight,
  };
  return out;
};

const DIALOG = () => {
  const dlg = Array.from(
    document.querySelectorAll('.astryx-dialog, dialog[open], [role="dialog"]'),
  )
    .filter((e) => {
      const r = e.getBoundingClientRect();
      return r.width > 120 && r.height > 60;
    })
    .pop();
  if (!dlg) return null;
  const c = getComputedStyle(dlg);
  // The gutter actually applied to the slots (LayoutContent reads the derived
  // --astryx-dialog-padding-* vars set by the theme).
  const inner = dlg.querySelector('[class*="astryx-layout"], div');
  const title = dlg.querySelector('.astryx-heading, h1, h2, h3');
  const slots = Array.from(dlg.children).map((e) => {
    const cc = getComputedStyle(e);
    return `${cc.paddingTop} ${cc.paddingRight} ${cc.paddingBottom} ${cc.paddingLeft}`;
  });
  return {
    cls: dlg.className.split(' ').slice(0, 3).join(' '),
    bg: c.backgroundColor,
    radius: c.borderRadius,
    shadow: c.boxShadow.slice(0, 90),
    dialogPaddingInline: c.getPropertyValue('--astryx-dialog-padding-inline'),
    dialogPaddingBlockStart: c.getPropertyValue(
      '--astryx-dialog-padding-block-start',
    ),
    slotPaddings: slots,
    innerPadding: inner ? getComputedStyle(inner).padding : null,
    titleFont: title
      ? `${getComputedStyle(title).fontSize}/${getComputedStyle(title).fontWeight}`
      : null,
  };
};

const MODALS = [
  ['create-user', 'admin/users', /create user|add user|^create$/i],
  ['create-project', 'admin/project', /create|add/i],
  ['create-folder', `project/${PROJ}/data`, /create folder/i],
  ['create-policy', 'admin/resource-policy', /create|add/i],
];

const browser = await chromium.launch();
const results = {};
for (const mode of ['light', 'dark']) {
  const ctx = await browser.newContext({
    viewport: { width: 1600, height: 1000 },
    storageState: `${ROOT}/a1-state.json`,
    colorScheme: mode,
  });
  const page = await ctx.newPage();
  page.setDefaultNavigationTimeout(120000);
  await page.goto(`${BASE}project/${PROJ}/start`, {
    waitUntil: 'domcontentloaded',
  });
  await page.waitForTimeout(16000);
  if (mode === 'dark') {
    const b = page.getByRole('button', { name: /^dark mode$/i }).first();
    if (await b.count()) {
      await b.click();
      await page.waitForTimeout(2500);
    }
  }
  const r = await page.evaluate(READ, VARS);
  r.dialogs = {};
  for (const [id, path, re] of MODALS) {
    try {
      await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(9000);
      const btn = page.getByRole('button', { name: re }).first();
      if (!(await btn.count())) {
        r.dialogs[id] = 'no trigger';
        continue;
      }
      await btn.click();
      await page.waitForTimeout(3000);
      r.dialogs[id] = await page.evaluate(DIALOG);
      await page.screenshot({
        path: `${ROOT}/shots/approved-1/dialog-${id}-${mode}.png`,
      });
      await page.keyboard.press('Escape');
      await page.waitForTimeout(800);
    } catch (e) {
      r.dialogs[id] = `ERR ${String(e).slice(0, 90)}`;
    }
  }
  // A page with plenty of headings, for the heading-site census.
  await page.goto(`${BASE}project/${PROJ}/start`, {
    waitUntil: 'domcontentloaded',
  });
  await page.waitForTimeout(9000);
  r.headingSitesStart = await page.evaluate(
    () =>
      Array.from(document.querySelectorAll('.astryx-heading'))
        .slice(0, 12)
        .map((e) => {
          const c = getComputedStyle(e);
          return `${e.tagName} "${(e.innerText || '').trim().slice(0, 26)}" ${c.fontSize}/${c.lineHeight}/${c.fontWeight}`;
        }),
  );
  await page.screenshot({
    path: `${ROOT}/shots/approved-1/p-start-${mode}.png`,
  });
  results[mode] = r;
  console.log(`### ${mode} theme=${r.theme}`);
  await ctx.close();
}
fs.writeFileSync(
  `${ROOT}/a1-tokens.json`,
  JSON.stringify(results, null, 1),
);

console.log('\n--- CSS custom properties (light | dark) ---');
for (const v of VARS)
  console.log(
    `${v.padEnd(28)} ${String(results.light.vars[v]).slice(0, 42).padEnd(44)} | ${String(results.dark.vars[v]).slice(0, 42)}`,
  );
for (const mode of ['light', 'dark']) {
  console.log(`\n--- rendered headings (${mode}) ---`);
  for (const [k, v] of Object.entries(results[mode].rendered))
    console.log(`  ${k.padEnd(12)} ${v}`);
  console.log(`--- line rhythm (${mode}) ---`);
  console.log('  ', JSON.stringify(results[mode].lineRhythm));
  console.log(`--- page samples (${mode}) ---`);
  results[mode].page.forEach((p) => console.log('  ', p));
  console.log(`--- heading sites on p-start (${mode}) ---`);
  (results[mode].headingSitesStart ?? []).forEach((p) => console.log('  ', p));
  console.log(`--- dialogs (${mode}) ---`);
  for (const [k, v] of Object.entries(results[mode].dialogs))
    console.log(`  ${k}:`, JSON.stringify(v));
}
await browser.close();
