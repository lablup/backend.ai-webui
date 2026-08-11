/**
 * audit-1 — full route sweep, light + dark, with per-route measurement probes.
 *
 * Probes run in-page and are deliberately cheap so the whole sweep finishes:
 *  - lightSurfaces: elements painting a light bg while in dark mode
 *  - zeroGap:       elements whose class hints at a flex gap but computed gap is 0
 *  - antLeftovers:  `.ant-*` classnames still present in the DOM
 *  - hardcoded:     inline style="...#rrggbb..." actually rendered
 *  - overflow:      body horizontal scroll / elements wider than viewport
 *  - metrics:       key layout paddings/gaps for the page shell + cards
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

/** id -> path. id is used for the screenshot filename. */
const ROUTES = [
  ['p-start', `project/${PROJ}/start`],
  ['p-dashboard', `project/${PROJ}/dashboard`],
  ['p-session', `project/${PROJ}/session`],
  ['p-session-start', `project/${PROJ}/session/start`],
  ['p-deployments', `project/${PROJ}/deployments`],
  ['p-model-store', `project/${PROJ}/model-store`],
  ['p-chat', `project/${PROJ}/chat`],
  ['p-data', `project/${PROJ}/data`],
  ['p-my-environment', `project/${PROJ}/my-environment`],
  ['p-agent-summary', `project/${PROJ}/agent-summary`],
  ['p-statistics', `project/${PROJ}/statistics`],
  ['p-ai-agent', `project/${PROJ}/ai-agent`],
  ['pa-session', `project/${PROJ}/admin/session`],
  ['pa-deployments', `project/${PROJ}/admin/deployments`],
  ['pa-data', `project/${PROJ}/admin/data`],
  ['pa-users', `project/${PROJ}/admin/users`],
  ['a-dashboard', 'admin/dashboard'],
  ['a-session', 'admin/session'],
  ['a-deployments', 'admin/deployments'],
  ['a-deployment-preset-new', 'admin/deployments/deployment-presets/new'],
  ['a-data', 'admin/data'],
  ['a-users', 'admin/users'],
  ['a-environment', 'admin/environment'],
  ['a-resource-policy', 'admin/resource-policy'],
  ['a-reservoir', 'admin/reservoir'],
  ['a-scheduler', 'admin/scheduler'],
  ['a-agent', 'admin/agent'],
  ['a-project', 'admin/project'],
  ['a-settings', 'admin/settings'],
  ['a-maintenance', 'admin/maintenance'],
  ['a-diagnostics', 'admin/diagnostics'],
  ['a-rbac', 'admin/rbac'],
  ['a-branding', 'admin/branding'],
  ['a-information', 'admin/information'],
  ['m-usersettings', 'usersettings'],
  ['m-logs', 'logs'],
  ['m-import', 'import'],
  ['m-unknown', 'definitely-not-a-route'],
];

const PROBE = () => {
  const lum = (rgb) => {
    const m = String(rgb).match(/[\d.]+/g);
    if (!m) return null;
    const [r, g, b, a = '1'] = m.map(Number);
    if (a === 0) return null;
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  };
  const desc = (el) => {
    const p = [];
    let n = el;
    while (n && n !== document.body && p.length < 4) {
      p.unshift(
        n.tagName.toLowerCase() +
          (n.className
            ? '.' + String(n.className).split(/\s+/).slice(0, 2).join('.')
            : ''),
      );
      n = n.parentElement;
    }
    return p.join('>');
  };
  const isDark = document.documentElement.dataset.theme === 'dark';
  const all = Array.from(document.querySelectorAll('*'));

  // 1. light surfaces in dark mode
  const lightSurfaces = [];
  if (isDark) {
    const seen = new Set();
    for (const el of all) {
      const cs = getComputedStyle(el);
      const l = lum(cs.backgroundColor);
      if (l === null || l < 0.6) continue;
      const r = el.getBoundingClientRect();
      if (r.width * r.height < 900) continue;
      const key = `${el.tagName}|${String(el.className).slice(0, 60)}|${cs.backgroundColor}`;
      if (seen.has(key)) continue;
      seen.add(key);
      lightSurfaces.push({
        path: desc(el),
        bg: cs.backgroundColor,
        inline: el.style.backgroundColor || null,
        size: `${Math.round(r.width)}x${Math.round(r.height)}`,
      });
    }
  }

  // 2. dark text on light surface / light text on light surface (contrast)
  const lowContrast = [];
  {
    const seen = new Set();
    for (const el of all) {
      if (!el.childNodes.length) continue;
      const hasText = Array.from(el.childNodes).some(
        (n) => n.nodeType === 3 && n.textContent.trim().length > 1,
      );
      if (!hasText) continue;
      const cs = getComputedStyle(el);
      const fg = lum(cs.color);
      if (fg === null) continue;
      // walk up for the painted background
      let bgl = null;
      let n = el;
      while (n) {
        const b = getComputedStyle(n).backgroundColor;
        const m = String(b).match(/[\d.]+/g);
        if (m && Number(m[3] ?? 1) > 0.5) {
          bgl = lum(b);
          break;
        }
        n = n.parentElement;
      }
      if (bgl === null) continue;
      const ratio =
        (Math.max(fg, bgl) + 0.05) / (Math.min(fg, bgl) + 0.05);
      if (ratio > 2.2) continue;
      const r = el.getBoundingClientRect();
      if (r.width * r.height < 100) continue;
      const key = desc(el) + '|' + cs.color;
      if (seen.has(key)) continue;
      seen.add(key);
      lowContrast.push({
        path: desc(el),
        text: el.textContent.trim().slice(0, 40),
        color: cs.color,
        ratio: Number(ratio.toFixed(2)),
      });
    }
  }

  // 3. ant-* leftovers
  const antCls = {};
  for (const el of all) {
    for (const c of String(el.className).split(/\s+/)) {
      if (/^ant-/.test(c)) antCls[c] = (antCls[c] ?? 0) + 1;
    }
  }

  // 4. inline hardcoded hex colours actually rendered
  const hardcoded = [];
  {
    const seen = new Set();
    for (const el of all) {
      const s = el.getAttribute('style');
      if (!s || !/#[0-9A-Fa-f]{3,8}\b/.test(s)) continue;
      const hex = s.match(/#[0-9A-Fa-f]{3,8}\b/g).join(',');
      const key = desc(el) + '|' + hex;
      if (seen.has(key)) continue;
      seen.add(key);
      hardcoded.push({ path: desc(el), hex, style: s.slice(0, 140) });
    }
  }

  // 5. zero-gap flex containers that clearly intend a gap (>=2 element children,
  //    display flex, gap 0, and children touching)
  const zeroGap = [];
  {
    const seen = new Set();
    for (const el of all) {
      const cs = getComputedStyle(el);
      if (!/flex|grid/.test(cs.display)) continue;
      if (parseFloat(cs.gap || '0') > 0) continue;
      const kids = Array.from(el.children);
      if (kids.length < 2) continue;
      const cls = String(el.className);
      if (!/bai-?flex|BAIFlex|astryx|Stack|Row|Group|Toolbar/i.test(cls)) continue;
      const r0 = kids[0].getBoundingClientRect();
      const r1 = kids[1].getBoundingClientRect();
      if (r0.width === 0 || r1.width === 0) continue;
      const dx =
        cs.flexDirection?.startsWith('column')
          ? r1.top - r0.bottom
          : r1.left - r0.right;
      if (dx > 1) continue;
      const key = desc(el);
      if (seen.has(key)) continue;
      seen.add(key);
      zeroGap.push({ path: desc(el), dir: cs.flexDirection, dx: Math.round(dx) });
    }
  }

  // 6. overflow
  const vw = document.documentElement.clientWidth;
  const overflow = {
    bodyScrollW: document.body.scrollWidth,
    viewportW: vw,
    horizontalScroll: document.body.scrollWidth > vw + 1,
    wide: Array.from(all)
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > vw + 4 && r.height > 20;
      })
      .slice(0, 6)
      .map((el) => ({
        path: desc(el),
        w: Math.round(el.getBoundingClientRect().width),
      })),
  };

  // 7. shell metrics — the page container padding + card paddings
  const pick = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      pad: `${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`,
      gap: cs.gap,
      bg: cs.backgroundColor,
      size: `${Math.round(r.width)}x${Math.round(r.height)}`,
    };
  };
  const metrics = {
    theme: document.documentElement.dataset.theme ?? null,
    bodyBg: getComputedStyle(document.body).backgroundColor,
    main: pick('main') ?? pick('[class*="content" i]'),
    firstCard: pick('.ant-card, [class*="Card" i]'),
    cardBody: pick('.ant-card-body, [class*="cardBody" i]'),
    table: pick('.ant-table, table'),
    tabs: pick('.ant-tabs-nav, [role="tablist"]'),
  };

  return {
    lightSurfaces: lightSurfaces.slice(0, 12),
    lowContrast: lowContrast.slice(0, 12),
    antCls,
    hardcoded: hardcoded.slice(0, 12),
    zeroGap: zeroGap.slice(0, 12),
    overflow,
    metrics,
    title: document.title,
    textLen: document.body.innerText.length,
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
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(String(e).slice(0, 200)));

await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(15000);

// flip theme via the real header toggle
if (MODE === 'dark') {
  const btn = page.getByRole('button', { name: /^dark mode$/i }).first();
  if (await btn.count()) {
    await btn.click();
    await page.waitForTimeout(2500);
  }
  const t = await page.evaluate(() => document.documentElement.dataset.theme);
  console.log('### themeAttr =', t);
  if (t !== 'dark') console.log('!!! THEME TOGGLE DID NOT TAKE');
}

const report = {};
for (const [id, path] of ROUTES) {
  if (ONLY && !ONLY.includes(id)) continue;
  try {
    await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(7000);
    const probe = await page.evaluate(PROBE);
    report[id] = { path, ...probe, pageErrors: pageErrors.splice(0) };
    await page.screenshot({ path: `${OUT}/${id}-${MODE}.png`, fullPage: false });
    console.log(
      `### ${id} theme=${probe.metrics.theme} bodyBg=${probe.metrics.bodyBg} lightSurf=${probe.lightSurfaces.length} lowContrast=${probe.lowContrast.length} zeroGap=${probe.zeroGap.length} hard=${probe.hardcoded.length} hscroll=${probe.overflow.horizontalScroll} text=${probe.textLen}`,
    );
  } catch (e) {
    report[id] = { path, error: String(e).slice(0, 200) };
    console.log(`### ${id} ERROR ${String(e).slice(0, 120)}`);
  }
}

fs.writeFileSync(
  `${ROOT}/audit1-routes-${MODE}.json`,
  JSON.stringify(report, null, 1),
);
await browser.close();
console.log('done', MODE);
