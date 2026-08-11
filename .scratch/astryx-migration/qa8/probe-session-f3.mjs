/**
 * qa8 SESSION (F) v3 — launcher step 2, Cluster Mode block + every visible
 * Selector's panel-vs-trigger geometry.
 */
import { launch, setMode, settle, BASE, ROOT } from './probe-session-lib.mjs';
import fs from 'node:fs';

const { browser, page, pageErrors } = await launch();
const result = {};

await page.goto(`${BASE}session/start`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(12000);
await settle(page, 30000);
await setMode(page, 'light');
await page.waitForTimeout(1200);

// Next -> step 2
await page.getByRole('button', { name: /^Next/i }).first().click();
await page.waitForTimeout(8000);
await settle(page, 30000);
await page.screenshot({ path: `${ROOT}/before-launcher-step2.png`, fullPage: true });

result.clusterMode = await page.evaluate(() => {
  const l = Array.from(document.querySelectorAll('*')).find(
    (e) =>
      e.children.length === 0 && /^\s*Cluster Mode\s*$/i.test(e.textContent ?? ''),
  );
  if (!l) return { error: 'no Cluster Mode text node' };
  const rr = (el) => {
    const r = el.getBoundingClientRect();
    const c = getComputedStyle(el);
    return {
      tag: el.tagName,
      cls: String(el.className).slice(0, 70),
      x: +r.x.toFixed(1),
      y: +r.y.toFixed(1),
      w: +r.width.toFixed(1),
      h: +r.height.toFixed(1),
      display: c.display,
      visibility: c.visibility,
      position: c.position,
      clip: c.clipPath || c.clip,
      overflow: c.overflow,
      fontSize: c.fontSize,
      color: c.color,
    };
  };
  // all "Cluster Mode" occurrences
  const all = Array.from(document.querySelectorAll('*'))
    .filter((e) => e.children.length === 0 && /Cluster Mode/i.test(e.textContent ?? ''))
    .map(rr);
  // the segmented control
  const seg = document.querySelector('.astryx-segmented-control, [class*="segmented" i]');
  const segItems = seg
    ? Array.from(seg.querySelectorAll('button,[role="radio"],[role="tab"]')).map(
        (b) => ({
          text: b.textContent?.trim().slice(0, 30),
          ariaChecked: b.getAttribute('aria-checked'),
          ariaSelected: b.getAttribute('aria-selected'),
          dataState: b.getAttribute('data-state'),
          ...rr(b),
        }),
      )
    : null;
  return {
    occurrences: all,
    segmented: seg ? rr(seg) : null,
    segmentedItems: segItems,
    segmentedHTML: seg ? seg.outerHTML.slice(0, 1400) : null,
  };
});

// every VISIBLE selector on step 2
async function openAndMeasure(tag) {
  const idxs = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.astryx-selector'))
      .map((root, i) => {
        const btn = root.querySelector('button');
        const r = (btn ?? root).getBoundingClientRect();
        return { i, ok: r.width > 0 && r.height > 0 };
      })
      .filter((x) => x.ok)
      .map((x) => x.i),
  );
  const out = [];
  for (const idx of idxs) {
    const opened = await page.evaluate((i) => {
      const root = document.querySelectorAll('.astryx-selector')[i];
      const btn = root?.querySelector('button');
      if (!btn) return { error: 'no trigger' };
      btn.scrollIntoView({ block: 'center' });
      return { scrolled: true };
    }, idx);
    if (opened.error) {
      out.push({ idx, ...opened });
      continue;
    }
    await page.waitForTimeout(500);
    const meta = await page.evaluate((i) => {
      const root = document.querySelectorAll('.astryx-selector')[i];
      const btn = root.querySelector('button');
      // the visible field label lives OUTSIDE .astryx-selector, in .astryx-field
      const field = root.closest('.astryx-field') ?? root.parentElement;
      const label =
        field?.querySelector('.astryx-field-label') ??
        field?.querySelector('label');
      const formLabel = root
        .closest('[data-bai-form-item]')
        ?.querySelector('[data-bai-form-item-label]');
      const rr = (el) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {
          y: +r.y.toFixed(1),
          h: +r.height.toFixed(1),
          top: +r.top.toFixed(1),
          bottom: +r.bottom.toFixed(1),
          x: +r.x.toFixed(1),
          w: +r.width.toFixed(1),
          text: el.textContent?.trim().slice(0, 30),
        };
      };
      const info = {
        fieldLabel: rr(label),
        formItemLabel: rr(formLabel),
        trigger: rr(btn),
        triggerText: btn.textContent?.trim().slice(0, 50),
      };
      btn.click();
      return info;
    }, idx);
    await page.waitForTimeout(800);
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
    const v =
      panel.rect && meta.trigger
        ? {
            panelCoversTrigger:
              panel.rect.top <= meta.trigger.top + 1 &&
              panel.rect.bottom >= meta.trigger.bottom - 1,
            panelCoversFieldLabel:
              meta.fieldLabel != null &&
              panel.rect.top <= meta.fieldLabel.top + 1 &&
              panel.rect.bottom >= meta.fieldLabel.bottom - 1,
            panelCoversFormLabel:
              meta.formItemLabel != null &&
              panel.rect.top <= meta.formItemLabel.top + 1 &&
              panel.rect.bottom >= meta.formItemLabel.bottom - 1,
            panelTopMinusTriggerBottom: +(
              panel.rect.top - meta.trigger.bottom
            ).toFixed(1),
            selectedCyMinusTriggerCy:
              panel.selectedCy != null
                ? +(
                    panel.selectedCy -
                    (meta.trigger.y + meta.trigger.h / 2)
                  ).toFixed(1)
                : null,
          }
        : null;
    out.push({ idx, ...meta, panel, verdict: v });
    if (v?.panelCoversTrigger) {
      await page.screenshot({ path: `${ROOT}/before-selector-over-${tag}-${idx}.png` });
    }
    await page.keyboard.press('Escape');
    await page.waitForTimeout(350);
  }
  return out;
}

result.step2Selectors = await openAndMeasure('step2');

result.pageErrors = pageErrors;
fs.writeFileSync(`${ROOT}/before-session-f3.json`, JSON.stringify(result, null, 2));
console.log('CLUSTER', JSON.stringify(result.clusterMode.occurrences, null, 1));
console.log('SEGITEMS', JSON.stringify(result.clusterMode.segmentedItems, null, 1));
console.log(
  'SELECTORS',
  JSON.stringify(
    result.step2Selectors.map((o) => ({
      idx: o.idx,
      fieldLabel: o.fieldLabel?.text,
      fieldLabelBox: o.fieldLabel && `${o.fieldLabel.top}..${o.fieldLabel.bottom} h${o.fieldLabel.h}`,
      formLabel: o.formItemLabel?.text,
      trigText: o.triggerText,
      trig: o.trigger && `${o.trigger.top}..${o.trigger.bottom}`,
      panel: o.panel?.rect && `${o.panel.rect.top}..${o.panel.rect.bottom}`,
      mbs: o.panel?.marginBlockStart,
      search: o.panel?.hasSearchInput,
      over: o.verdict?.panelCoversTrigger,
      overField: o.verdict?.panelCoversFieldLabel,
      overForm: o.verdict?.panelCoversFormLabel,
      dTop: o.verdict?.panelTopMinusTriggerBottom,
      err: o.error ?? o.panel?.error,
    })),
    null,
    1,
  ),
);
await browser.close();
