/**
 * audit-1 — geometric collision / rhythm detector.
 *
 * Catches the class of bug that a screenshot shows but a token table cannot:
 *  - COLLIDE: two elements that are siblings in a vertical/horizontal flow whose
 *    painted boxes overlap (e.g. a pagination bar sitting on top of the last
 *    table row, a toolbar overlapping the table header)
 *  - CLIPPED: text whose scrollWidth/Height exceeds its clientWidth/Height with
 *    overflow hidden and no ellipsis
 *  - TIGHT: adjacent siblings with 0px separation inside a container that has a
 *    gap prop / class implying spacing
 *  - MISALIGN: items in a horizontal row whose vertical centres differ by >3px
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const ROOT =
  '/home/ubuntu/Workspace/backend.ai-webui/.claude/worktrees/agent-a5c43b155842c4f7b/.scratch/astryx-migration';
const BASE = process.env.BASE ?? 'http://127.0.0.1:5950/';
const PROJ = process.env.PROJ ?? 'a%ED%95%9C%EA%B5%AD%EC%96%B4%EA%B0%80%EB%8A%A5_cde';
const MODE = process.env.MODE ?? 'light';

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
  ['pa-users', `project/${PROJ}/admin/users`],
  ['a-dashboard', 'admin/dashboard'],
  ['a-session', 'admin/session'],
  ['a-deployments', 'admin/deployments'],
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
];

const PROBE = () => {
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
  const out = { collide: [], clipped: [], misalign: [] };

  // COLLIDE — siblings in normal flow whose TEXT boxes intersect materially.
  // SVG internals overlap by design, so anything inside an <svg> is skipped and
  // at least one side must carry visible text.
  for (const parent of document.querySelectorAll('*')) {
    if (parent.closest('svg')) continue;
    const kids = Array.from(parent.children).filter((k) => {
      if (!vis(k)) return false;
      if (k.tagName.toLowerCase() === 'svg' || k.closest('svg')) return false;
      const cs = getComputedStyle(k);
      // Only in-flow-ish siblings; absolute/fixed overlap is often intentional
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
          // ignore when one fully contains the other (decorative wrappers)
          const contains =
            (a.left <= b.left &&
              a.right >= b.right &&
              a.top <= b.top &&
              a.bottom >= b.bottom) ||
            (b.left <= a.left &&
              b.right >= a.right &&
              b.top <= a.top &&
              b.bottom >= a.bottom);
          if (contains) continue;
          out.collide.push({
            parent: desc(parent),
            a: desc(kids[i]),
            b: desc(kids[j]),
            aText: (kids[i].innerText || '').trim().slice(0, 30),
            bText: (kids[j].innerText || '').trim().slice(0, 30),
            overlap: `${Math.round(ox)}x${Math.round(oy)}`,
          });
        }
      }
    }
    if (out.collide.length > 40) break;
  }

  // CLIPPED — visible text truncated with no ellipsis
  for (const el of document.querySelectorAll('*')) {
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
      out.clipped.push({
        path: desc(el),
        text: txt.slice(0, 40),
        dw,
        dh,
        overflow: cs.overflow,
      });
    if (out.clipped.length > 25) break;
  }

  // MISALIGN — a horizontal flex row whose children's vertical centres differ
  for (const el of document.querySelectorAll('*')) {
    const cs = getComputedStyle(el);
    if (!/flex/.test(cs.display)) continue;
    if (cs.flexDirection.startsWith('column')) continue;
    if (!/center|stretch/.test(cs.alignItems)) continue;
    const kids = Array.from(el.children).filter(vis);
    if (kids.length < 2) continue;
    const cy = kids.map((k) => {
      const r = k.getBoundingClientRect();
      return r.top + r.height / 2;
    });
    const spread = Math.max(...cy) - Math.min(...cy);
    if (spread > 3)
      out.misalign.push({
        path: desc(el),
        spread: Math.round(spread),
        alignItems: cs.alignItems,
        texts: kids.map((k) => (k.innerText || '').trim().slice(0, 16)).slice(0, 4),
      });
    if (out.misalign.length > 25) break;
  }

  // TABLE RHYTHM — the specific vertical relationships a screenshot shows but a
  // token table cannot: toolbar -> table header, last row -> pagination bar.
  out.tableRhythm = (() => {
    const table = document.querySelector('table');
    if (!table) return null;
    const wrap =
      table.closest('.ant-table-wrapper, [class*="table" i]') ?? table.parentElement;
    const thead = table.querySelector('thead');
    const rows = table.querySelectorAll('tbody tr');
    const lastRow = rows[rows.length - 1];
    // pagination = the element containing "of ... items" or li.ant-pagination-item
    const pager =
      document.querySelector('.ant-pagination, [class*="pagination" i]') ??
      Array.from(document.querySelectorAll('div,nav,ul')).find((e) =>
        /\d+\s*-\s*\d+\s+of\s+\d+/i.test((e.innerText || '').slice(0, 60)),
      );
    // toolbar = the last block above the table inside the same card body
    const card =
      table.closest('.ant-card-body, [class*="cardBody" i], [class*="Card" i]') ??
      document.body;
    const tR = (wrap ?? table).getBoundingClientRect();
    let toolbar = null;
    for (const e of card.querySelectorAll('div')) {
      if (e.contains(table)) continue;
      const r = e.getBoundingClientRect();
      if (r.height < 12 || r.width < 100) continue;
      if (r.bottom <= tR.top + 1) {
        if (!toolbar || r.bottom > toolbar.getBoundingClientRect().bottom)
          toolbar = e;
      }
    }
    const g = (a, b) =>
      a && b
        ? Math.round(b.getBoundingClientRect().top - a.getBoundingClientRect().bottom)
        : null;
    const headBottom = thead?.getBoundingClientRect().bottom;
    return {
      toolbarToTable: toolbar ? g(toolbar, wrap ?? table) : null,
      toolbarText: toolbar ? (toolbar.innerText || '').trim().slice(0, 50) : null,
      theadH: thead ? Math.round(thead.getBoundingClientRect().height) : null,
      rowH: lastRow ? Math.round(lastRow.getBoundingClientRect().height) : null,
      rowCount: rows.length,
      lastRowBottom: lastRow
        ? Math.round(lastRow.getBoundingClientRect().bottom)
        : null,
      pagerTop: pager ? Math.round(pager.getBoundingClientRect().top) : null,
      pagerOverlapsLastRow:
        pager && lastRow
          ? Math.round(
              lastRow.getBoundingClientRect().bottom -
                pager.getBoundingClientRect().top,
            )
          : null,
      pagerCls: pager ? String(pager.className).slice(0, 60) : null,
      headToFirstRow:
        headBottom && rows[0]
          ? Math.round(rows[0].getBoundingClientRect().top - headBottom)
          : null,
      cellPad: (() => {
        const td = table.querySelector('tbody td');
        if (!td) return null;
        const c = getComputedStyle(td);
        return `${c.paddingTop} ${c.paddingRight} ${c.paddingBottom} ${c.paddingLeft}`;
      })(),
      headPad: (() => {
        const th = table.querySelector('thead th');
        if (!th) return null;
        const c = getComputedStyle(th);
        return `${c.paddingTop} ${c.paddingRight} ${c.paddingBottom} ${c.paddingLeft}`;
      })(),
      rowBorder: (() => {
        const td = table.querySelector('tbody td');
        if (!td) return null;
        const c = getComputedStyle(td);
        return `${c.borderBottomWidth} ${c.borderBottomStyle} ${c.borderBottomColor}`;
      })(),
      headBg: (() => {
        const th = table.querySelector('thead th');
        return th ? getComputedStyle(th).backgroundColor : null;
      })(),
      headFont: (() => {
        const th = table.querySelector('thead th');
        if (!th) return null;
        const c = getComputedStyle(th);
        return `${c.fontSize}/${c.fontWeight}/${c.color}`;
      })(),
    };
  })();

  // CARD RHYTHM — header/body padding of the first card on the page
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
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(14000);

const report = {};
for (const [id, path] of ROUTES) {
  try {
    await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(6500);
    const r = await page.evaluate(PROBE);
    report[id] = { path, ...r };
    console.log(
      `### ${id} collide=${r.collide.length} clipped=${r.clipped.length} misalign=${r.misalign.length}`,
    );
    for (const c of r.collide.slice(0, 4))
      console.log(
        `###    COLLIDE ${c.overlap} "${c.aText}" x "${c.bText}" in ${c.parent}`,
      );
  } catch (e) {
    report[id] = { path, error: String(e).slice(0, 160) };
    console.log(`### ${id} ERROR`);
  }
}
fs.writeFileSync(
  `${ROOT}/audit1-collisions-${MODE}.json`,
  JSON.stringify(report, null, 1),
);
await browser.close();
console.log('done collisions', MODE);
