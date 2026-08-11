/**
 * qa8 SESSION (F) v2 — Astryx Selector option panel positioned OVER its trigger.
 *
 * Goes to launcher step 2 (Environments & Resource Allocation), which holds the
 * Cluster Mode block, then opens every VISIBLE `.astryx-selector` and measures
 * trigger rect vs the listbox popover rect. Also does the folder-explorer
 * mount-permission selector on /data.
 */
import { launch, setMode, settle, BASE, ROOT } from './probe-session-lib.mjs';
import fs from 'node:fs';

const { browser, page, pageErrors } = await launch();
const result = {};

const rrOf = (page, fn) => page.evaluate(fn);

async function openAndMeasure(tag) {
  const list = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.astryx-selector'))
      .map((root, i) => {
        const btn = root.querySelector('button');
        const r = (btn ?? root).getBoundingClientRect();
        return { i, w: r.width, h: r.height };
      })
      .filter((x) => x.w > 0 && x.h > 0)
      .map((x) => x.i);
  });
  const out = [];
  for (const idx of list) {
    const opened = await page.evaluate((i) => {
      const root = document.querySelectorAll('.astryx-selector')[i];
      if (!root) return { error: 'gone' };
      const btn = root.querySelector('button');
      if (!btn) return { error: 'no trigger' };
      btn.scrollIntoView({ block: 'center' });
      const label = root.querySelector('label');
      const rr = (el) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {
          x: +r.x.toFixed(1),
          y: +r.y.toFixed(1),
          w: +r.width.toFixed(1),
          h: +r.height.toFixed(1),
          top: +r.top.toFixed(1),
          bottom: +r.bottom.toFixed(1),
        };
      };
      const info = {
        label: label?.textContent?.trim() ?? null,
        triggerText: btn.textContent?.trim().slice(0, 50),
        trigger: rr(btn),
        labelRect: rr(label),
        fieldRect: rr(root),
      };
      btn.click();
      return info;
    }, idx);
    if (opened.error) {
      out.push({ idx, ...opened });
      continue;
    }
    await page.waitForTimeout(700);
    const panel = await page.evaluate(() => {
      const pops = Array.from(document.querySelectorAll('[popover]')).filter(
        (p) => p.querySelector('[role="listbox"]'),
      );
      const p = pops[pops.length - 1];
      if (!p) return { error: 'no listbox popover open' };
      const r = p.getBoundingClientRect();
      const cs = getComputedStyle(p);
      const items = Array.from(p.querySelectorAll('[role="option"]'));
      const sel =
        items.find((o) => o.getAttribute('aria-selected') === 'true') ??
        items[0];
      const search = p.querySelector('input');
      const sr = sel?.getBoundingClientRect();
      return {
        rect: {
          x: +r.x.toFixed(1),
          y: +r.y.toFixed(1),
          w: +r.width.toFixed(1),
          h: +r.height.toFixed(1),
          top: +r.top.toFixed(1),
          bottom: +r.bottom.toFixed(1),
        },
        marginBlockStart: cs.marginBlockStart,
        inlineStyle: p.getAttribute('style'),
        hasSearchInput: !!search,
        optionCount: items.length,
        selectedText: sel?.textContent?.trim().slice(0, 40) ?? null,
        selectedRect: sr
          ? {
              y: +sr.y.toFixed(1),
              h: +sr.height.toFixed(1),
              cy: +(sr.y + sr.height / 2).toFixed(1),
            }
          : null,
        zIndexAndPos: `${cs.position} / ${cs.zIndex}`,
      };
    });
    const v =
      panel.rect && opened.trigger
        ? {
            panelCoversTrigger:
              panel.rect.top <= opened.trigger.top + 1 &&
              panel.rect.bottom >= opened.trigger.bottom - 1,
            panelCoversLabel:
              opened.labelRect != null &&
              panel.rect.top <= opened.labelRect.top + 1 &&
              panel.rect.bottom >= opened.labelRect.bottom - 1,
            panelTopMinusTriggerBottom: +(
              panel.rect.top - opened.trigger.bottom
            ).toFixed(1),
            selectedCyMinusTriggerCy: panel.selectedRect
              ? +(
                  panel.selectedRect.cy -
                  (opened.trigger.y + opened.trigger.h / 2)
                ).toFixed(1)
              : null,
          }
        : null;
    out.push({ idx, ...opened, panel, verdict: v });
    if (v?.panelCoversTrigger) {
      await page.screenshot({
        path: `${ROOT}/before-selector-over-${tag}-${idx}.png`,
      });
    }
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
  }
  return out;
}

// ---------------------------------------------------------------- launcher
await page.goto(`${BASE}session/start`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(12000);
await settle(page, 30000);
await setMode(page, 'light');
await page.waitForTimeout(1200);

// step 2 — Environments & Resource Allocation (holds Cluster Mode)
await page.evaluate(() => {
  const n = Array.from(document.querySelectorAll('button,[role="button"],li,a')).find(
    (e) => /Environments\s*&\s*Resource Allocation/i.test(e.textContent ?? ''),
  );
  n?.click();
});
await page.waitForTimeout(6000);
await settle(page, 30000);
await page.screenshot({ path: `${ROOT}/before-launcher-step2.png`, fullPage: true });

result.clusterModeBlock = await page.evaluate(() => {
  const l = Array.from(document.querySelectorAll('*')).find(
    (e) => e.children.length === 0 && /^\s*Cluster Mode\s*$/i.test(e.textContent ?? ''),
  );
  if (!l) return { error: 'no Cluster Mode label' };
  let holder = l;
  for (let i = 0; i < 4 && holder.parentElement; i++) holder = holder.parentElement;
  const r = l.getBoundingClientRect();
  return {
    labelTag: l.tagName,
    labelCls: String(l.className).slice(0, 80),
    labelRect: { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) },
    holderTag: holder.tagName,
    holderHTML: holder.outerHTML.slice(0, 1600),
  };
});

result.launcherSelectors = await openAndMeasure('launcher');

// ---------------------------------------------------------------- /data
await page.goto(`${BASE}data`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(9000);
await settle(page, 25000);
result.dataSelectors = await openAndMeasure('data');

result.pageErrors = pageErrors;
fs.writeFileSync(
  `${ROOT}/before-session-f2.json`,
  JSON.stringify(result, null, 2),
);
const brief = (arr) =>
  (arr ?? []).map((o) => ({
    idx: o.idx,
    label: o.label,
    trig: o.trigger && `${o.trigger.y}..${o.trigger.bottom}`,
    panel: o.panel?.rect && `${o.panel.rect.top}..${o.panel.rect.bottom}`,
    mbs: o.panel?.marginBlockStart,
    search: o.panel?.hasSearchInput,
    over: o.verdict?.panelCoversTrigger,
    overLabel: o.verdict?.panelCoversLabel,
    dTop: o.verdict?.panelTopMinusTriggerBottom,
    err: o.error ?? o.panel?.error,
  }));
console.log('CLUSTER', JSON.stringify(result.clusterModeBlock, null, 1).slice(0, 2200));
console.log('LAUNCHER', JSON.stringify(brief(result.launcherSelectors), null, 1));
console.log('DATA', JSON.stringify(brief(result.dataSelectors), null, 1));
await browser.close();
