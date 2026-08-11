/**
 * audit-1 — SETTLE-AWARE full sweep. Supersedes audit1-routes.mjs /
 * audit1-collisions.mjs, which captured many pages mid-skeleton.
 *
 * Per route: navigate, wait until the loading skeletons are gone (or 30s),
 * screenshot, then run BOTH the token/colour probes and the geometry probes
 * in one page.evaluate.
 *
 * Usage: MODE=light|dark node audit1-sweep.mjs
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
    while (n && n !== document.body && p.length < 5) {
      p.unshift(
        n.tagName.toLowerCase() +
          (n.className
            ? '.' + String(n.className).trim().split(/\s+/).slice(0, 3).join('.')
            : ''),
      );
      n = n.parentElement;
    }
    return p.join('>');
  };
  const vis = (el) => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0')
      return false;
    const r = el.getBoundingClientRect();
    return r.width > 2 && r.height > 2;
  };
  const isDark = document.documentElement.dataset.theme === 'dark';
  const all = Array.from(document.querySelectorAll('*'));
  const out = { collide: [], clipped: [], misalign: [], lightSurfaces: [] };

  // --- light surfaces painted in dark mode -------------------------------
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
      out.lightSurfaces.push({
        path: desc(el),
        bg: cs.backgroundColor,
        inline: el.style.backgroundColor || null,
        size: `${Math.round(r.width)}x${Math.round(r.height)}`,
      });
      if (out.lightSurfaces.length > 10) break;
    }
  }

  // --- collisions --------------------------------------------------------
  for (const parent of all) {
    if (parent.closest('svg')) continue;
    const kids = Array.from(parent.children).filter((k) => {
      if (!vis(k)) return false;
      if (k.tagName.toLowerCase() === 'svg' || k.closest('svg')) return false;
      const cs = getComputedStyle(k);
      return cs.position === 'static' || cs.position === 'relative';
    });
    if (kids.length < 2) continue;
    for (let i = 0; i < kids.length - 1; i++) {
      for (let j = i + 1; j < kids.length; j++) {
        const a = kids[i].getBoundingClientRect();
        const b = kids[j].getBoundingClientRect();
        const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left);
        const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        const ta = (kids[i].innerText || '').trim();
        const tb = (kids[j].innerText || '').trim();
        if (!ta && !tb) continue;
        if (ox > 12 && oy > 4) {
          const contains =
            (a.left <= b.left && a.right >= b.right && a.top <= b.top && a.bottom >= b.bottom) ||
            (b.left <= a.left && b.right >= a.right && b.top <= a.top && b.bottom >= a.bottom);
          if (contains) continue;
          out.collide.push({
            parent: desc(parent),
            a: desc(kids[i]),
            b: desc(kids[j]),
            aText: ta.slice(0, 30),
            bText: tb.slice(0, 30),
            overlap: `${Math.round(ox)}x${Math.round(oy)}`,
          });
        }
      }
    }
    if (out.collide.length > 30) break;
  }

  // --- clipped text ------------------------------------------------------
  for (const el of all) {
    if (!vis(el)) continue;
    const cs = getComputedStyle(el);
    if (!/hidden|clip/.test(cs.overflowX + cs.overflowY)) continue;
    if (cs.textOverflow === 'ellipsis') continue;
    const txt = (el.innerText || '').trim();
    if (txt.length < 3) continue;
    if (el.children.length > 2) continue;
    const dw = el.scrollWidth - el.clientWidth;
    const dh = el.scrollHeight - el.clientHeight;
    if (dw > 3 || dh > 3)
      out.clipped.push({ path: desc(el), text: txt.slice(0, 40), dw, dh });
    if (out.clipped.length > 20) break;
  }

  // --- vertical misalignment in horizontal rows --------------------------
  for (const el of all) {
    const cs = getComputedStyle(el);
    if (!/flex/.test(cs.display)) continue;
    if (cs.flexDirection.startsWith('column')) continue;
    if (cs.alignItems !== 'center') continue;
    const kids = Array.from(el.children).filter(vis);
    if (kids.length < 2) continue;
    const cy = kids.map((k) => {
      const r = k.getBoundingClientRect();
      return r.top + r.height / 2;
    });
    const spread = Math.max(...cy) - Math.min(...cy);
    if (spread > 4)
      out.misalign.push({
        path: desc(el),
        spread: Math.round(spread),
        texts: kids.map((k) => (k.innerText || '').trim().slice(0, 14)).slice(0, 4),
      });
    if (out.misalign.length > 20) break;
  }

  // --- table rhythm ------------------------------------------------------
  out.tableRhythm = (() => {
    const table = document.querySelector('table');
    if (!table) return null;
    const wrap =
      table.closest('.ant-table-wrapper, [class*="table" i]') ?? table.parentElement;
    const thead = table.querySelector('thead');
    const rows = table.querySelectorAll('tbody tr');
    const lastRow = rows[rows.length - 1];
    const pager =
      Array.from(document.querySelectorAll('div,nav,ul')).find((e) =>
        /\d+\s*-\s*\d+\s+of\s+\d+/i.test((e.innerText || '').slice(0, 80)),
      ) ?? document.querySelector('.ant-pagination, [class*="pagination" i]');
    const card =
      table.closest('.ant-card-body, [class*="cardBody" i], [class*="card" i]') ??
      document.body;
    const tR = (wrap ?? table).getBoundingClientRect();
    let toolbar = null;
    for (const e of card.querySelectorAll('div')) {
      if (e.contains(table)) continue;
      const r = e.getBoundingClientRect();
      if (r.height < 12 || r.width < 150) continue;
      if (r.bottom <= tR.top + 1) {
        if (!toolbar || r.bottom > toolbar.getBoundingClientRect().bottom) toolbar = e;
      }
    }
    const st = (n) => (n ? getComputedStyle(n) : null);
    const td = table.querySelector('tbody td');
    const th = table.querySelector('thead th');
    return {
      toolbarToTable: toolbar
        ? Math.round(tR.top - toolbar.getBoundingClientRect().bottom)
        : null,
      toolbarText: toolbar ? (toolbar.innerText || '').trim().slice(0, 60) : null,
      rowCount: rows.length,
      pagerOverlapsLastRow:
        pager && lastRow
          ? Math.round(
              lastRow.getBoundingClientRect().bottom - pager.getBoundingClientRect().top,
            )
          : null,
      pagerCls: pager ? String(pager.className).slice(0, 60) : null,
      pagerPos: pager ? getComputedStyle(pager).position : null,
      cellPad: td
        ? `${st(td).paddingTop} ${st(td).paddingRight} ${st(td).paddingBottom} ${st(td).paddingLeft}`
        : null,
      headPad: th
        ? `${st(th).paddingTop} ${st(th).paddingRight} ${st(th).paddingBottom} ${st(th).paddingLeft}`
        : null,
      rowBorder: td
        ? `${st(td).borderBottomWidth} ${st(td).borderBottomStyle} ${st(td).borderBottomColor}`
        : null,
      headBg: th ? st(th).backgroundColor : null,
      headFont: th ? `${st(th).fontSize}/${st(th).fontWeight}/${st(th).color}` : null,
      rowH: lastRow ? Math.round(lastRow.getBoundingClientRect().height) : null,
    };
  })();

  // --- card rhythm -------------------------------------------------------
  out.cardRhythm = (() => {
    const card = document.querySelector(
      '.ant-card, [class*="astryx-card" i], [class*="Card" i]',
    );
    if (!card) return null;
    const head = card.querySelector('.ant-card-head, [class*="cardHead" i], header');
    const body = card.querySelector('.ant-card-body, [class*="cardBody" i]');
    const p = (n) => {
      if (!n) return null;
      const c = getComputedStyle(n);
      return {
        pad: `${c.paddingTop} ${c.paddingRight} ${c.paddingBottom} ${c.paddingLeft}`,
        h: Math.round(n.getBoundingClientRect().height),
        borderBottom: `${c.borderBottomWidth} ${c.borderBottomColor}`,
        font: `${c.fontSize}/${c.fontWeight}`,
      };
    };
    const cs = getComputedStyle(card);
    return {
      cls: String(card.className).slice(0, 70),
      radius: cs.borderRadius,
      border: `${cs.borderTopWidth} ${cs.borderTopColor}`,
      shadow: cs.boxShadow.slice(0, 60),
      bg: cs.backgroundColor,
      head: p(head),
      body: p(body),
    };
  })();

  // --- shell metrics -----------------------------------------------------
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
  out.metrics = {
    theme: document.documentElement.dataset.theme ?? null,
    bodyBg: getComputedStyle(document.body).backgroundColor,
    textColor: getComputedStyle(document.body).color,
    content: pick('main') ?? pick('[class*="content" i]'),
    breadcrumb: pick('[class*="breadcrumb" i]'),
    header: pick('.bai-webui-header'),
    sider: pick('.astryx-side-nav'),
  };
  // sider footer clipping — is the last nav item hidden behind the footer?
  out.siderClip = (() => {
    const nav = document.querySelector('.astryx-side-nav');
    if (!nav) return null;
    const items = nav.querySelectorAll('.astryx-side-nav-item');
    const last = items[items.length - 1];
    const footer = Array.from(document.querySelectorAll('div,footer')).find((e) =>
      /Terms of Service/i.test((e.innerText || '').slice(0, 60)),
    );
    if (!last || !footer) return null;
    const l = last.getBoundingClientRect();
    const f = footer.getBoundingClientRect();
    return {
      lastItem: (last.innerText || '').trim().slice(0, 24),
      lastBottom: Math.round(l.bottom),
      footerTop: Math.round(f.top),
      overlap: Math.round(l.bottom - f.top),
      navOverflowY: getComputedStyle(nav).overflowY,
    };
  })();

  out.textLen = document.body.innerText.length;
  out.stillSkeleton = !!document.querySelector(
    '[class*="skeleton" i]:not([class*="Skeleton_"])',
  );
  return out;
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
await page.waitForTimeout(14000);
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

const settle = async () => {
  // wait until no skeleton is painted, or 30s
  const deadline = Date.now() + 30000;
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

const report = {};
for (const [id, path] of ROUTES) {
  if (ONLY && !ONLY.includes(id)) continue;
  try {
    await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const settled = await settle();
    await page.waitForTimeout(1500);
    const probe = await page.evaluate(PROBE);
    report[id] = { path, settled, ...probe, pageErrors: pageErrors.splice(0) };
    await page.screenshot({ path: `${OUT}/${id}-${MODE}.png` });
    console.log(
      `### ${id} settled=${settled} text=${probe.textLen} collide=${probe.collide.length} clip=${probe.clipped.length} misalign=${probe.misalign.length} lightSurf=${probe.lightSurfaces.length} pagerOverlap=${probe.tableRhythm?.pagerOverlapsLastRow} toolbarGap=${probe.tableRhythm?.toolbarToTable} siderOverlap=${probe.siderClip?.overlap}`,
    );
    for (const c of probe.collide.slice(0, 3))
      console.log(`###    COLLIDE ${c.overlap} "${c.aText}" x "${c.bText}"`);
  } catch (e) {
    report[id] = { path, error: String(e).slice(0, 200) };
    console.log(`### ${id} ERROR ${String(e).slice(0, 120)}`);
  }
}
fs.writeFileSync(`${ROOT}/audit1-sweep-${MODE}.json`, JSON.stringify(report, null, 1));
await browser.close();
console.log('done sweep', MODE);
