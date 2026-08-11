/**
 * qa8 SESSION (F) v4 — the real measurement.
 *
 * Launcher step 2: screenshot the Cluster Mode block, then open the
 * Resource Group / Resource Presets / Memory-unit Selectors with REAL clicks
 * and measure panel-vs-trigger geometry. Then the same on the folder-explorer
 * mount-permission Selector (/data -> folder row -> info drawer).
 */
import { launch, setMode, settle, BASE, ROOT } from './probe-session-lib.mjs';
import fs from 'node:fs';

const { browser, page, pageErrors } = await launch();
const result = {};

const measurePanel = () =>
  page.evaluate(() => {
    const pops = Array.from(document.querySelectorAll('[popover]')).filter(
      (p) => {
        const r = p.getBoundingClientRect();
        return r.height > 0 && p.querySelector('[role="listbox"]');
      },
    );
    const p = pops[pops.length - 1];
    if (!p) return { error: 'no open listbox popover' };
    const r = p.getBoundingClientRect();
    const cs = getComputedStyle(p);
    const items = Array.from(p.querySelectorAll('[role="option"]'));
    const sel =
      items.find((o) => o.getAttribute('aria-selected') === 'true') ?? items[0];
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
      hasSearchInput: !!p.querySelector('input'),
      optionCount: items.length,
      selectedText: sel?.textContent?.trim().slice(0, 40) ?? null,
      selectedCy: sr ? +(sr.y + sr.height / 2).toFixed(1) : null,
    };
  });

const measureTrigger = (idx) =>
  page.evaluate((i) => {
    const root = document.querySelectorAll('.astryx-selector')[i];
    if (!root) return { error: 'gone' };
    const btn = root.querySelector('button');
    const field = root.closest('.astryx-field') ?? root.parentElement;
    const fieldLabel =
      field?.querySelector('.astryx-field-label') ?? field?.querySelector('label');
    const formLabel = root
      .closest('[data-bai-form-item]')
      ?.querySelector('[data-bai-form-item-label]');
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
        text: el.textContent?.trim().slice(0, 34),
      };
    };
    return {
      trigger: rr(btn),
      triggerText: btn?.textContent?.trim().slice(0, 46),
      fieldLabel: rr(fieldLabel),
      formItemLabel: rr(formLabel),
    };
  }, idx);

async function probeSelector(idx, tag) {
  const loc = page.locator('.astryx-selector button').nth(idx);
  if (!(await loc.count())) return { idx, error: 'no such selector' };
  await loc.scrollIntoViewIfNeeded().catch(() => {});
  await page.waitForTimeout(400);
  const before = await measureTrigger(idx);
  if (before.error || !before.trigger?.h) return { idx, ...before };
  await loc.click({ force: true }).catch((e) => ({ e }));
  await page.waitForTimeout(900);
  const panel = await measurePanel();
  const verdict =
    panel.rect && before.trigger
      ? {
          panelCoversTrigger:
            panel.rect.top <= before.trigger.top + 1 &&
            panel.rect.bottom >= before.trigger.bottom - 1,
          panelCoversFieldLabel:
            before.fieldLabel != null &&
            before.fieldLabel.h > 2 &&
            panel.rect.top <= before.fieldLabel.top + 1 &&
            panel.rect.bottom >= before.fieldLabel.bottom - 1,
          panelCoversFormItemLabel:
            before.formItemLabel != null &&
            panel.rect.top <= before.formItemLabel.top + 1 &&
            panel.rect.bottom >= before.formItemLabel.bottom - 1,
          panelTopMinusTriggerBottom: +(
            panel.rect.top - before.trigger.bottom
          ).toFixed(1),
          selectedCyMinusTriggerCy:
            panel.selectedCy != null
              ? +(
                  panel.selectedCy -
                  (before.trigger.y + before.trigger.h / 2)
                ).toFixed(1)
              : null,
        }
      : null;
  if (verdict?.panelCoversTrigger) {
    await page.screenshot({ path: `${ROOT}/before-selector-over-${tag}-${idx}.png` });
  }
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  return { idx, ...before, panel, verdict };
}

// ------------------------------------------------------------- launcher
await page.goto(`${BASE}session/start`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(12000);
await settle(page, 30000);
await setMode(page, 'light');
await page.waitForTimeout(1000);
await page.getByRole('button', { name: /^Next/i }).first().click();
await page.waitForTimeout(8000);
await settle(page, 30000);

// Cluster Mode region shot
await page.evaluate(() => {
  const l = Array.from(document.querySelectorAll('label')).find((e) =>
    /^\s*Cluster Mode\s*$/i.test(e.textContent ?? ''),
  );
  l?.scrollIntoView({ block: 'center' });
});
await page.waitForTimeout(800);
await page.screenshot({ path: `${ROOT}/before-clustermode-light.png` });
result.clusterModeRegion = await page.evaluate(() => {
  const l = Array.from(document.querySelectorAll('label')).find((e) =>
    /^\s*Cluster Mode\s*$/i.test(e.textContent ?? ''),
  );
  if (!l) return { error: 'label gone' };
  const item = l.closest('[data-bai-form-item]');
  const rr = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      tag: el.tagName,
      cls: String(el.className).slice(0, 60),
      x: +r.x.toFixed(1),
      y: +r.y.toFixed(1),
      w: +r.width.toFixed(1),
      h: +r.height.toFixed(1),
      text: el.textContent?.trim().slice(0, 40),
    };
  };
  const seg = item?.querySelector('[class*="segmented" i]');
  return {
    label: rr(l),
    formItem: rr(item),
    segmented: rr(seg),
    segItems: seg
      ? Array.from(seg.querySelectorAll('button')).map((b) => ({
          ...rr(b),
          ariaChecked: b.getAttribute('aria-checked'),
          selected: /selected/.test(String(b.className)),
        }))
      : null,
    html: item ? item.outerHTML.slice(0, 2000) : null,
  };
});

const idxs = await page.evaluate(() =>
  Array.from(document.querySelectorAll('.astryx-selector'))
    .map((r, i) => ({ i, h: (r.querySelector('button') ?? r).getBoundingClientRect().height }))
    .filter((x) => x.h > 0)
    .map((x) => x.i),
);
result.launcher = [];
for (const i of idxs) result.launcher.push(await probeSelector(i, 'launcher'));

// ------------------------------------------------------------- /data folder
await page.goto(`${BASE}data`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(9000);
await settle(page, 25000);
result.dataTop = [];
{
  const ii = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.astryx-selector'))
      .map((r, i) => ({ i, h: (r.querySelector('button') ?? r).getBoundingClientRect().height }))
      .filter((x) => x.h > 0)
      .map((x) => x.i),
  );
  for (const i of ii) result.dataTop.push(await probeSelector(i, 'data'));
}

result.pageErrors = pageErrors;
fs.writeFileSync(`${ROOT}/before-session-f4.json`, JSON.stringify(result, null, 2));
const brief = (arr) =>
  (arr ?? []).map((o) => ({
    idx: o.idx,
    fieldLabel: o.fieldLabel?.text,
    formLabel: o.formItemLabel?.text,
    trig: o.trigger && `${o.trigger.top}..${o.trigger.bottom}`,
    trigText: o.triggerText,
    panel: o.panel?.rect && `${o.panel.rect.top}..${o.panel.rect.bottom}`,
    mbs: o.panel?.marginBlockStart,
    search: o.panel?.hasSearchInput,
    over: o.verdict?.panelCoversTrigger,
    overFormLabel: o.verdict?.panelCoversFormItemLabel,
    dTop: o.verdict?.panelTopMinusTriggerBottom,
    dSel: o.verdict?.selectedCyMinusTriggerCy,
    err: o.error ?? o.panel?.error,
  }));
console.log('CLUSTER', JSON.stringify({ ...result.clusterModeRegion, html: undefined }, null, 1));
console.log('LAUNCHER', JSON.stringify(brief(result.launcher), null, 1));
console.log('DATA', JSON.stringify(brief(result.dataTop), null, 1));
await browser.close();
