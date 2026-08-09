/**
 * audit-1 — targeted overlay pass. Explicit, deterministic openers with a
 * settle wait, replacing the name-guessing first pass.
 *
 * SAFETY: nothing is ever submitted. Destructive dialogs are opened only to be
 * measured and are always dismissed with Escape; no confirm/OK is ever clicked.
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const ROOT =
  '/home/ubuntu/Workspace/backend.ai-webui/.claude/worktrees/agent-a5c43b155842c4f7b/.scratch/astryx-migration';
const OUT = `${ROOT}/shots/audit-1`;
const BASE = process.env.BASE ?? 'http://127.0.0.1:5950/';
const PROJ = process.env.PROJ ?? 'a%ED%95%9C%EA%B5%AD%EC%96%B4%EA%B0%80%EB%8A%A5_cde';
const MODE = process.env.MODE ?? 'light';
fs.mkdirSync(OUT, { recursive: true });

/** [id, route, [ [slug, how] ... ] ] — `how` runs against the page. */
const PLAN = [
  [
    'header',
    `project/${PROJ}/start`,
    [
      ['notification-drawer', (p) => p.getByRole('button', { name: /notification/i }).first()],
      ['help-drawer', (p) => p.getByRole('button', { name: /^help$/i }).first()],
      ['user-menu', (p) => p.getByRole('button', { name: /admin lablu/i }).first()],
      ['project-select', (p) => p.locator('.bai-webui-header .astryx-selector button').first()],
    ],
  ],
  [
    'p-data',
    `project/${PROJ}/data`,
    [
      ['create-folder', (p) => p.getByRole('button', { name: /create folder/i }).first()],
      ['table-settings', (p) => p.locator('table').locator('xpath=../..').getByRole('button').last()],
      ['row-delete-confirm', (p) => p.locator('tbody tr').first().getByRole('button').nth(1)],
    ],
  ],
  [
    'p-deployments',
    `project/${PROJ}/deployments`,
    [
      ['create-deployment', (p) => p.getByRole('button', { name: /create deployment/i }).first()],
      ['table-settings', (p) => p.getByRole('button', { name: /table setting/i }).first()],
    ],
  ],
  [
    'a-users',
    'admin/users',
    [['create-user', (p) => p.getByRole('button', { name: /create user|add user|^create$/i }).first()]],
  ],
  [
    'a-environment',
    'admin/environment',
    [['install-image', (p) => p.getByRole('button', { name: /install image/i }).first()]],
  ],
  [
    'a-resource-policy',
    'admin/resource-policy',
    [['create-policy', (p) => p.getByRole('button', { name: /create|add/i }).first()]],
  ],
  [
    'a-project',
    'admin/project',
    [['create-project', (p) => p.getByRole('button', { name: /create|add/i }).first()]],
  ],
  [
    'a-agent',
    'admin/agent',
    [['agent-detail-drawer', (p) => p.locator('tbody tr').first().getByRole('button').first()]],
  ],
  [
    'a-scheduler',
    'admin/scheduler',
    [['scheduler-config', (p) => p.getByRole('button', { name: /config|setting/i }).first()]],
  ],
  [
    'a-settings',
    'admin/settings',
    [['overlay-network-config', (p) => p.getByRole('button', { name: /^config$/i }).first()]],
  ],
  [
    'a-branding',
    'admin/branding',
    [['color-picker', (p) => p.locator('.ant-color-picker-trigger').first()]],
  ],
  [
    'a-maintenance',
    'admin/maintenance',
    [['maintenance-action', (p) => p.getByRole('button').nth(1)]],
  ],
  [
    'm-usersettings',
    'usersettings',
    [['user-pref', (p) => p.getByRole('button', { name: /config|change|setting|edit/i }).first()]],
  ],
];

const MEASURE = () => {
  const cands = Array.from(
    document.querySelectorAll(
      '[role="dialog"], dialog[open], .ant-modal, .ant-drawer, [class*="astryx-dialog"], [class*="astryx-drawer"], [class*="dropdown-menu" i], [role="menu"], [role="listbox"], [class*="popover" i]',
    ),
  ).filter((e) => {
    const r = e.getBoundingClientRect();
    return r.width > 60 && r.height > 30;
  });
  if (!cands.length) return null;
  const el = cands[cands.length - 1];
  const cs = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  const q = (sel) => {
    const n = el.querySelector(sel);
    if (!n) return null;
    const c = getComputedStyle(n);
    return {
      pad: `${c.paddingTop} ${c.paddingRight} ${c.paddingBottom} ${c.paddingLeft}`,
      gap: c.gap,
      bg: c.backgroundColor,
      color: c.color,
      font: `${c.fontSize}/${c.fontWeight}/${c.lineHeight}`,
      borderBottom: `${c.borderBottomWidth} ${c.borderBottomColor}`,
      borderTop: `${c.borderTopWidth} ${c.borderTopColor}`,
      h: Math.round(n.getBoundingClientRect().height),
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
        cls: String(n.className).slice(0, 60),
        bg: getComputedStyle(n).backgroundColor,
        size: `${Math.round(rr.width)}x${Math.round(rr.height)}`,
      });
      if (lightSurfaces.length > 5) break;
    }
  }
  const bd = (() => {
    // native <dialog> backdrop is not queryable; read the rule from stylesheets
    for (const ss of Array.from(document.styleSheets)) {
      let rules;
      try {
        rules = ss.cssRules;
      } catch {
        continue;
      }
      for (const rule of Array.from(rules)) {
        if (rule.selectorText && /::backdrop/.test(rule.selectorText))
          return `${rule.selectorText} { ${rule.style.cssText.slice(0, 120)} }`;
      }
    }
    return null;
  })();
  return {
    tag: el.tagName.toLowerCase(),
    cls: String(el.className).slice(0, 90),
    size: `${Math.round(r.width)}x${Math.round(r.height)}`,
    pos: `${Math.round(r.left)},${Math.round(r.top)}`,
    bg: cs.backgroundColor,
    radius: cs.borderRadius,
    shadow: cs.boxShadow.slice(0, 110),
    pad: `${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`,
    backdropRule: bd,
    header: q(
      '.ant-modal-header, .ant-drawer-header, [class*="dialog-header" i], [class*="layout-header" i], header',
    ),
    body: q(
      '.ant-modal-body, .ant-drawer-body, [class*="layout-content" i], [class*="dialog-body" i]',
    ),
    footer: q(
      '.ant-modal-footer, .ant-drawer-footer, [class*="layout-footer" i], [class*="dialog-footer" i], footer',
    ),
    title: (() => {
      const t = el.querySelector(
        '.ant-modal-title, .ant-drawer-title, [class*="heading" i], h1,h2,h3,h4,h5',
      );
      if (!t) return null;
      const c = getComputedStyle(t);
      return `"${t.textContent.trim().slice(0, 40)}" ${c.fontSize}/${c.fontWeight}/${c.color}`;
    })(),
    formItemGap: (() => {
      const its = el.querySelectorAll(
        '.ant-form-item, [class*="form-item" i], [class*="FormItem" i]',
      );
      if (its.length < 2) return null;
      return Math.round(
        its[1].getBoundingClientRect().top - its[0].getBoundingClientRect().bottom,
      );
    })(),
    requiredMarks: el.querySelectorAll('[class*="required" i], .ant-form-item-required')
      .length,
    lightSurfaces,
  };
};

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  storageState: `${ROOT}/audit1-state.json`,
  colorScheme: MODE === 'dark' ? 'dark' : 'light',
});
const page = await ctx.newPage();
page.setDefaultNavigationTimeout(120000);
page.setDefaultTimeout(12000);

const settle = async () => {
  const deadline = Date.now() + 25000;
  while (Date.now() < deadline) {
    const s = await page.evaluate(() => ({
      sk: Array.from(document.querySelectorAll('*')).some((e) => {
        if (!/skeleton/i.test(String(e.className))) return false;
        const r = e.getBoundingClientRect();
        return r.width > 20 && r.height > 4;
      }),
      len: document.body.innerText.length,
    }));
    if (!s.sk && s.len > 200) return true;
    await page.waitForTimeout(1200);
  }
  return false;
};

await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(14000);
if (MODE === 'dark') {
  const b = page.getByRole('button', { name: /^dark mode$/i }).first();
  if (await b.count()) {
    await b.click();
    await page.waitForTimeout(2200);
  }
  console.log(
    '### themeAttr =',
    await page.evaluate(() => document.documentElement.dataset.theme),
  );
}

const report = {};
for (const [id, route, openers] of PLAN) {
  report[id] = { route, overlays: [] };
  try {
    await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    await settle();
    await page.waitForTimeout(1200);
  } catch (e) {
    console.log(`### ${id} NAV ERROR ${String(e).slice(0, 90)}`);
    continue;
  }
  for (const [slug, how] of openers) {
    try {
      const loc = how(page);
      if (!(await loc.count())) {
        console.log(`### ${id}/${slug} NOT FOUND`);
        continue;
      }
      await loc.click({ timeout: 9000 });
      await page.waitForTimeout(3000);
      const m = await page.evaluate(MEASURE);
      if (!m) {
        console.log(`### ${id}/${slug} NO OVERLAY`);
      } else {
        await page.screenshot({ path: `${OUT}/ov2-${id}--${slug}-${MODE}.png` });
        report[id].overlays.push({ slug, ...m });
        console.log(
          `### ${id}/${slug} ${m.tag} ${m.size} radius=${m.radius} bg=${m.bg} pad=${m.pad} hdr=${m.header?.pad} body=${m.body?.pad} ftr=${m.footer?.pad} title=${m.title} lightSurf=${m.lightSurfaces.length}`,
        );
      }
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(700);
    } catch (e) {
      console.log(`### ${id}/${slug} SKIP ${String(e).slice(0, 90)}`);
      await page.keyboard.press('Escape').catch(() => {});
      await page.waitForTimeout(600);
    }
  }
}
fs.writeFileSync(`${ROOT}/audit1-overlays2-${MODE}.json`, JSON.stringify(report, null, 1));
await browser.close();
console.log('done overlays2', MODE);
