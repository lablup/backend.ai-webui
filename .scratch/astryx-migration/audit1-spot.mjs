/** audit-1 — spot measurements for four claims that needed hard numbers. */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const ROOT =
  '/home/ubuntu/Workspace/backend.ai-webui/.claude/worktrees/agent-a5c43b155842c4f7b/.scratch/astryx-migration';
const BASE = process.env.BASE ?? 'http://127.0.0.1:5950/';
const PROJ = process.env.PROJ ?? 'a%ED%95%9C%EA%B5%AD%EC%96%B4%EA%B0%80%EB%8A%A5_cde';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  storageState: `${ROOT}/audit1-state.json`,
  colorScheme: 'light',
});
const page = await ctx.newPage();
page.setDefaultNavigationTimeout(120000);
const settle = async () => {
  const dl = Date.now() + 25000;
  while (Date.now() < dl) {
    const s = await page.evaluate(() => ({
      sk: Array.from(document.querySelectorAll('*')).some(
        (e) =>
          /skeleton/i.test(String(e.className)) &&
          e.getBoundingClientRect().height > 4,
      ),
      len: document.body.innerText.length,
    }));
    if (!s.sk && s.len > 200) return;
    await page.waitForTimeout(1200);
  }
};
const out = {};

// 1. settings checkbox geometry
await page.goto(`${BASE}admin/settings`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3000);
await settle();
out.settingsCheckbox = await page.evaluate(() => {
  const cbs = Array.from(
    document.querySelectorAll(
      'input[type="checkbox"], [role="checkbox"], [class*="checkbox" i]',
    ),
  ).filter((e) => e.getBoundingClientRect().width > 4);
  return cbs.slice(0, 3).map((e) => {
    const c = getComputedStyle(e);
    const r = e.getBoundingClientRect();
    return {
      cls: String(e.className).slice(0, 60),
      size: `${Math.round(r.width)}x${Math.round(r.height)}`,
      border: `${c.borderTopWidth} ${c.borderTopStyle} ${c.borderTopColor}`,
      radius: c.borderRadius,
      bg: c.backgroundColor,
    };
  });
});
out.settingsLabelRow = await page.evaluate(() => {
  const el = Array.from(document.querySelectorAll('*')).find((e) =>
    /Display Only Changes/.test((e.innerText || '').slice(0, 40)),
  );
  if (!el) return null;
  const c = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  return {
    size: `${Math.round(r.width)}x${Math.round(r.height)}`,
    display: c.display,
    align: c.alignItems,
    lines: Math.round(r.height / parseFloat(c.lineHeight || '20')),
  };
});

// 2. dashboard resource gauge
await page.goto(`${BASE}admin/dashboard`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3000);
await settle();
out.gauge = await page.evaluate(() => {
  const cands = Array.from(
    document.querySelectorAll('[class*="progress" i], [role="progressbar"], [class*="meter" i]'),
  ).filter((e) => e.getBoundingClientRect().width > 20);
  return cands.slice(0, 4).map((e) => {
    const c = getComputedStyle(e);
    const r = e.getBoundingClientRect();
    return {
      cls: String(e.className).slice(0, 70),
      size: `${Math.round(r.width)}x${Math.round(r.height)}`,
      bg: c.backgroundColor,
      bgImage: c.backgroundImage.slice(0, 90),
      radius: c.borderRadius,
      kids: e.children.length,
    };
  });
});

// 3. announcement banner position relative to the breadcrumb
await page.goto(`${BASE}project/${PROJ}/start`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3000);
await settle();
out.announcement = await page.evaluate(() => {
  const b = document.querySelector('.astryx-banner.card.info');
  const bc = document.querySelector('[class*="breadcrumb" i]');
  const hdr = document.querySelector('.bai-webui-header');
  const g = (e) => {
    if (!e) return null;
    const r = e.getBoundingClientRect();
    const c = getComputedStyle(e);
    return {
      top: Math.round(r.top),
      h: Math.round(r.height),
      w: Math.round(r.width),
      pad: `${c.paddingTop} ${c.paddingRight} ${c.paddingBottom} ${c.paddingLeft}`,
      bg: c.backgroundColor,
      border: `${c.borderTopWidth} ${c.borderTopColor}`,
      radius: c.borderRadius,
      color: c.color,
      font: `${c.fontSize}/${c.fontWeight}`,
    };
  };
  const t = b?.querySelector('[class*="title" i], strong, b');
  return {
    banner: g(b),
    bannerTitleFont: t
      ? `${getComputedStyle(t).fontSize}/${getComputedStyle(t).fontWeight}/${getComputedStyle(t).color}`
      : null,
    breadcrumbTop: bc ? Math.round(bc.getBoundingClientRect().top) : null,
    headerBottom: hdr ? Math.round(hdr.getBoundingClientRect().bottom) : null,
    wrapperCls: b?.closest('[class*="alert-wrapper" i]')
      ? 'main-layout-alert-wrapper'
      : null,
  };
});

// 4. table header + row chrome on a settled data table
await page.goto(`${BASE}admin/data`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3000);
await settle();
out.table = await page.evaluate(() => {
  const t = document.querySelector('table');
  if (!t) return null;
  const th = t.querySelector('thead th:nth-child(3)') ?? t.querySelector('thead th');
  const td = t.querySelector('tbody td:nth-child(3)') ?? t.querySelector('tbody td');
  const tr = t.querySelector('tbody tr');
  const s = (e) => (e ? getComputedStyle(e) : null);
  const pager = Array.from(document.querySelectorAll('div')).find((e) =>
    /\d+\s*-\s*\d+\s+of\s+\d+/i.test((e.innerText || '').slice(0, 60)),
  );
  return {
    thBg: s(th)?.backgroundColor,
    thPad: th
      ? `${s(th).paddingTop} ${s(th).paddingRight} ${s(th).paddingBottom} ${s(th).paddingLeft}`
      : null,
    thFont: th ? `${s(th).fontSize}/${s(th).fontWeight}/${s(th).color}` : null,
    thBorderBottom: th ? `${s(th).borderBottomWidth} ${s(th).borderBottomColor}` : null,
    tdPad: td
      ? `${s(td).paddingTop} ${s(td).paddingRight} ${s(td).paddingBottom} ${s(td).paddingLeft}`
      : null,
    trBorderBottom: tr ? `${s(tr).borderBottomWidth} ${s(tr).borderBottomColor}` : null,
    tdBorderBottom: td ? `${s(td).borderBottomWidth} ${s(td).borderBottomColor}` : null,
    rowH: tr ? Math.round(tr.getBoundingClientRect().height) : null,
    tableW: Math.round(t.getBoundingClientRect().width),
    wrapW: Math.round((t.parentElement?.getBoundingClientRect().width) ?? 0),
    wrapOverflowX: t.parentElement ? s(t.parentElement).overflowX : null,
    pagerMarginTop: pager ? s(pager).marginTop : null,
    pagerTop: pager ? Math.round(pager.getBoundingClientRect().top) : null,
    lastRowBottom: (() => {
      const rows = t.querySelectorAll('tbody tr');
      const r = rows[rows.length - 1];
      return r ? Math.round(r.getBoundingClientRect().bottom) : null;
    })(),
    tableBottom: Math.round(t.getBoundingClientRect().bottom),
    tableParentBottom: t.parentElement
      ? Math.round(t.parentElement.getBoundingClientRect().bottom)
      : null,
  };
});

fs.writeFileSync(`${ROOT}/audit1-spot.json`, JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
await browser.close();
