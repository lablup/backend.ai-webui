/**
 * audit-1 — modal / drawer sweep.
 *
 * For each route it enumerates SAFE overlay openers (accessible-name allowlist,
 * hard denylist for anything mutating) plus the first table row's name link
 * (detail drawers), clicks them one at a time, screenshots whatever dialog
 * appears, measures it, and presses Escape.
 *
 * NOTHING is ever submitted: only Escape / the Cancel path is used, and any
 * button whose name matches DENY is never clicked.
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const ROOT =
  '/home/ubuntu/Workspace/backend.ai-webui/.claude/worktrees/agent-a5c43b155842c4f7b/.scratch/astryx-migration';
const OUT = `${ROOT}/shots/audit-1`;
const BASE = process.env.BASE ?? 'http://127.0.0.1:5950/';
const PROJ = process.env.PROJ ?? 'a%ED%95%9C%EA%B5%AD%EC%96%B4%EA%B0%80%EB%8A%A5_cde';
const MODE = process.env.MODE ?? 'light';
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;

fs.mkdirSync(OUT, { recursive: true });

const DENY =
  /delete|remove|terminate|restart|destroy|purge|clear|log\s*out|sign\s*out|kill|stop|shut|reset|save|submit|^ok$|apply|confirm|launch|deactivate|activate|revoke|leave|unassign|detach|force|rescan|sync|recalculat|upgrade|downgrade|install|uninstall|run\b|execut/i;
const ALLOW =
  /create|add|new|edit|info|detail|import|upload|manage|assign|invite|change|generate|config|setting|filter|column|export|download|explor|share|permission|policy|key|token|about|help|preset|modif|rename|copy|clone|view/i;

const MEASURE = () => {
  const dlg = Array.from(
    document.querySelectorAll('[role="dialog"], .ant-modal, .ant-drawer'),
  ).filter((e) => e.getBoundingClientRect().width > 40);
  if (!dlg.length) return null;
  const el = dlg[dlg.length - 1];
  const cs = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  const q = (sel) => {
    const n = el.querySelector(sel);
    if (!n) return null;
    const c = getComputedStyle(n);
    const rr = n.getBoundingClientRect();
    return {
      pad: `${c.paddingTop} ${c.paddingRight} ${c.paddingBottom} ${c.paddingLeft}`,
      gap: c.gap,
      bg: c.backgroundColor,
      color: c.color,
      font: `${c.fontSize}/${c.fontWeight}`,
      borderBottom: c.borderBottomWidth + ' ' + c.borderBottomColor,
      borderTop: c.borderTopWidth + ' ' + c.borderTopColor,
      h: Math.round(rr.height),
    };
  };
  const lum = (rgb) => {
    const m = String(rgb).match(/[\d.]+/g);
    if (!m) return null;
    const [r2, g, b, a = '1'] = m.map(Number);
    if (a === 0) return null;
    return (0.2126 * r2 + 0.7152 * g + 0.0722 * b) / 255;
  };
  const isDark = document.documentElement.dataset.theme === 'dark';
  const lightSurfaces = [];
  if (isDark) {
    for (const n of el.querySelectorAll('*')) {
      const l = lum(getComputedStyle(n).backgroundColor);
      if (l === null || l < 0.6) continue;
      const rr = n.getBoundingClientRect();
      if (rr.width * rr.height < 900) continue;
      lightSurfaces.push({
        cls: String(n.className).slice(0, 70),
        bg: getComputedStyle(n).backgroundColor,
        size: `${Math.round(rr.width)}x${Math.round(rr.height)}`,
      });
      if (lightSurfaces.length > 6) break;
    }
  }
  return {
    kind: el.className.includes('drawer')
      ? 'drawer'
      : el.className.includes('modal')
        ? 'modal'
        : 'dialog',
    cls: String(el.className).slice(0, 100),
    size: `${Math.round(r.width)}x${Math.round(r.height)}`,
    bg: cs.backgroundColor,
    radius: cs.borderRadius,
    shadow: cs.boxShadow.slice(0, 80),
    header: q(
      '.ant-modal-header, .ant-drawer-header, [class*="Header" i], header',
    ),
    body: q('.ant-modal-body, .ant-drawer-body, [class*="Body" i]'),
    footer: q('.ant-modal-footer, .ant-drawer-footer, [class*="Footer" i], footer'),
    title: (
      el.querySelector(
        '.ant-modal-title, .ant-drawer-title, [class*="Title" i], h1,h2,h3',
      )?.textContent ?? ''
    ).slice(0, 60),
    lightSurfaces,
    formItemGap: (() => {
      const its = el.querySelectorAll(
        '.ant-form-item, [class*="FormItem" i], [class*="formItem" i]',
      );
      if (its.length < 2) return null;
      const a = its[0].getBoundingClientRect();
      const b = its[1].getBoundingClientRect();
      return Math.round(b.top - a.bottom);
    })(),
  };
};

const ROUTES = [
  ['p-start', `project/${PROJ}/start`],
  ['p-session', `project/${PROJ}/session`],
  ['p-data', `project/${PROJ}/data`],
  ['p-deployments', `project/${PROJ}/deployments`],
  ['p-my-environment', `project/${PROJ}/my-environment`],
  ['p-model-store', `project/${PROJ}/model-store`],
  ['p-ai-agent', `project/${PROJ}/ai-agent`],
  ['pa-users', `project/${PROJ}/admin/users`],
  ['a-users', 'admin/users'],
  ['a-environment', 'admin/environment'],
  ['a-resource-policy', 'admin/resource-policy'],
  ['a-project', 'admin/project'],
  ['a-agent', 'admin/agent'],
  ['a-data', 'admin/data'],
  ['a-reservoir', 'admin/reservoir'],
  ['a-scheduler', 'admin/scheduler'],
  ['a-settings', 'admin/settings'],
  ['a-maintenance', 'admin/maintenance'],
  ['a-information', 'admin/information'],
  ['a-rbac', 'admin/rbac'],
  ['a-branding', 'admin/branding'],
  ['m-usersettings', 'usersettings'],
];

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  storageState: `${ROOT}/audit1-state.json`,
  colorScheme: MODE === 'dark' ? 'dark' : 'light',
});
const page = await ctx.newPage();
page.setDefaultNavigationTimeout(120000);
page.setDefaultTimeout(15000);

await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(14000);
if (MODE === 'dark') {
  const btn = page.getByRole('button', { name: /^dark mode$/i }).first();
  if (await btn.count()) {
    await btn.click();
    await page.waitForTimeout(2000);
  }
  console.log(
    '### themeAttr =',
    await page.evaluate(() => document.documentElement.dataset.theme),
  );
}

const report = {};
for (const [id, path] of ROUTES) {
  if (ONLY && !ONLY.includes(id)) continue;
  const found = [];
  try {
    await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(6500);

    const names = await page.evaluate(() => {
      const out = [];
      for (const b of document.querySelectorAll(
        'button, [role="button"], a[role="button"]',
      )) {
        const r = b.getBoundingClientRect();
        if (r.width < 4 || r.height < 4) continue;
        if (b.closest('[role="dialog"]')) continue;
        const n = (
          b.getAttribute('aria-label') ||
          b.textContent ||
          b.getAttribute('title') ||
          ''
        )
          .trim()
          .slice(0, 50);
        if (n) out.push(n);
      }
      return [...new Set(out)];
    });
    const targets = names
      .filter((n) => ALLOW.test(n) && !DENY.test(n))
      .slice(0, 6);
    console.log(`### ${id} candidates=${JSON.stringify(targets)}`);

    for (const name of targets) {
      try {
        const btn = page
          .locator('button, [role="button"]')
          .filter({ hasText: new RegExp(`^\\s*${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`) })
          .first();
        const alt = page.getByRole('button', { name, exact: true }).first();
        const target = (await btn.count()) ? btn : alt;
        if (!(await target.count())) continue;
        await target.click({ timeout: 8000 });
        await page.waitForTimeout(2600);
        const m = await page.evaluate(MEASURE);
        if (m) {
          const slug = `${id}--${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 28)}`;
          await page.screenshot({ path: `${OUT}/ov-${slug}-${MODE}.png` });
          found.push({ opener: name, slug, ...m });
          console.log(
            `###   overlay ${slug} kind=${m.kind} size=${m.size} hdrPad=${m.header?.pad} bodyPad=${m.body?.pad} ftrPad=${m.footer?.pad} lightSurf=${m.lightSurfaces?.length ?? 0}`,
          );
        }
        await page.keyboard.press('Escape');
        await page.waitForTimeout(900);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(600);
      } catch (e) {
        console.log(`###   ${id}/${name} SKIP ${String(e).slice(0, 80)}`);
        await page.keyboard.press('Escape').catch(() => {});
      }
    }

    // detail drawer: first row's first link in the table
    try {
      const link = page.locator('tbody tr a, tbody tr [role="link"]').first();
      if (await link.count()) {
        await link.click({ timeout: 6000 });
        await page.waitForTimeout(3200);
        const m = await page.evaluate(MEASURE);
        if (m) {
          const slug = `${id}--row-detail`;
          await page.screenshot({ path: `${OUT}/ov-${slug}-${MODE}.png` });
          found.push({ opener: '(first row link)', slug, ...m });
          console.log(
            `###   overlay ${slug} kind=${m.kind} size=${m.size} hdrPad=${m.header?.pad} bodyPad=${m.body?.pad}`,
          );
        }
        await page.keyboard.press('Escape');
        await page.waitForTimeout(800);
      }
    } catch {
      /* row link not clickable on this page */
    }
  } catch (e) {
    console.log(`### ${id} ERROR ${String(e).slice(0, 120)}`);
  }
  report[id] = { path, overlays: found };
}

fs.writeFileSync(
  `${ROOT}/audit1-overlays-${MODE}.json`,
  JSON.stringify(report, null, 1),
);
await browser.close();
console.log('done overlays', MODE);
