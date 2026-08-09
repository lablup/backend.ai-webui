/**
 * audit-1 — live verification of the theme-token gap claims.
 * Reads the computed custom properties off :root in both modes, plus a few
 * rendered elements (heading sizes, body line-height, tooltip surface).
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const ROOT =
  '/home/ubuntu/Workspace/backend.ai-webui/.claude/worktrees/agent-a5c43b155842c4f7b/.scratch/astryx-migration';
const BASE = process.env.BASE ?? 'http://127.0.0.1:5950/';
const PROJ = process.env.PROJ ?? 'a%ED%95%9C%EA%B5%AD%EC%96%B4%EA%B0%80%EB%8A%A5_cde';

const VARS = [
  '--color-text-primary',
  '--color-text-secondary',
  '--color-text-disabled',
  '--color-icon-primary',
  '--color-icon-secondary',
  '--color-icon-disabled',
  '--color-border',
  '--color-border-emphasized',
  '--color-background-body',
  '--color-background-surface',
  '--color-background-card',
  '--color-background-popover',
  '--color-background-muted',
  '--color-background-inverted',
  '--color-neutral',
  '--color-overlay-hover',
  '--color-overlay-pressed',
  '--color-accent',
  '--color-text-accent',
  '--color-skeleton',
  '--text-body-leading',
  '--text-large-leading',
  '--text-supporting-leading',
  '--text-heading-1-size',
  '--text-heading-2-size',
  '--text-heading-3-size',
  '--text-heading-4-size',
  '--text-heading-5-size',
  '--font-size-xs',
  '--font-size-sm',
  '--font-size-base',
  '--font-size-lg',
  '--font-size-xl',
  '--font-size-2xl',
  '--font-size-3xl',
  '--font-size-4xl',
  '--radius-none',
  '--radius-inner',
  '--radius-element',
  '--spacing-1',
  '--spacing-2',
  '--spacing-3',
  '--spacing-4',
  '--spacing-6',
  '--size-element-sm',
  '--size-element-md',
  '--size-element-lg',
  '--shadow-med',
  '--duration-slow',
];

const READ = (vars) => {
  const cs = getComputedStyle(document.documentElement);
  const out = { theme: document.documentElement.dataset.theme ?? null, vars: {} };
  for (const v of vars) out.vars[v] = cs.getPropertyValue(v).trim();
  // rendered probes
  const probe = document.createElement('div');
  probe.style.cssText = 'position:fixed;left:-9999px;top:0;';
  probe.innerHTML = `
    <p class="astryx-text body">body</p>
    <h1 class="astryx-heading level-1">h1</h1>
    <h2 class="astryx-heading level-2">h2</h2>
    <h3 class="astryx-heading level-3">h3</h3>
    <h4 class="astryx-heading level-4">h4</h4>
    <h5 class="astryx-heading level-5">h5</h5>
    <span class="astryx-text supporting">sup</span>`;
  document.body.appendChild(probe);
  const m = (sel) => {
    const e = probe.querySelector(sel);
    if (!e) return null;
    const c = getComputedStyle(e);
    return `${c.fontSize} / lh ${c.lineHeight} / w ${c.fontWeight} / ${c.color}`;
  };
  out.rendered = {
    'text.body': m('.astryx-text.body'),
    'heading.1': m('.level-1'),
    'heading.2': m('.level-2'),
    'heading.3': m('.level-3'),
    'heading.4': m('.level-4'),
    'heading.5': m('.level-5'),
    'text.supporting': m('.astryx-text.supporting'),
  };
  probe.remove();
  // real page samples
  const samp = (sel, label) => {
    const e = document.querySelector(sel);
    if (!e) return null;
    const c = getComputedStyle(e);
    return `${label}: ${c.fontSize}/${c.lineHeight}/${c.fontWeight} color=${c.color} bg=${c.backgroundColor}`;
  };
  out.page = [
    samp('.astryx-side-nav-item', 'siderItem'),
    samp('.astryx-card', 'card'),
    samp('[class*="breadcrumb" i]', 'breadcrumb'),
    samp('.bai-webui-header', 'header'),
  ].filter(Boolean);
  return out;
};

const browser = await chromium.launch();
const results = {};
for (const mode of ['light', 'dark']) {
  const ctx = await browser.newContext({
    viewport: { width: 1600, height: 1000 },
    storageState: `${ROOT}/audit1-state.json`,
    colorScheme: mode,
  });
  const page = await ctx.newPage();
  page.setDefaultNavigationTimeout(120000);
  await page.goto(`${BASE}project/${PROJ}/start`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(16000);
  if (mode === 'dark') {
    const b = page.getByRole('button', { name: /^dark mode$/i }).first();
    if (await b.count()) {
      await b.click();
      await page.waitForTimeout(2500);
    }
  }
  results[mode] = await page.evaluate(READ, VARS);
  console.log(`### ${mode} theme=${results[mode].theme}`);
  await ctx.close();
}
fs.writeFileSync(`${ROOT}/audit1-tokens.json`, JSON.stringify(results, null, 1));

// print the comparison
console.log('\n--- CSS custom properties (light | dark) ---');
for (const v of VARS)
  console.log(
    `${v.padEnd(30)} ${String(results.light.vars[v]).padEnd(30)} | ${results.dark.vars[v]}`,
  );
console.log('\n--- rendered (light) ---');
for (const [k, v] of Object.entries(results.light.rendered))
  console.log(`${k.padEnd(18)} ${v}`);
console.log('\n--- rendered (dark) ---');
for (const [k, v] of Object.entries(results.dark.rendered))
  console.log(`${k.padEnd(18)} ${v}`);
console.log('\n--- page samples light ---');
results.light.page.forEach((p) => console.log(' ', p));
console.log('--- page samples dark ---');
results.dark.page.forEach((p) => console.log(' ', p));
await browser.close();
