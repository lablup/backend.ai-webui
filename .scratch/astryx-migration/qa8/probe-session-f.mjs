/**
 * qa8 SESSION (F) — Astryx Selector option panel positioned OVER its trigger.
 *
 * Walks the session launcher, opens every `.astryx-selector` trigger in turn,
 * and records: trigger rect, panel rect, whether the panel covers the trigger,
 * whether the field LABEL is covered, and whether the selector has a search box.
 * Read-only — Escape closes each panel, nothing is submitted.
 */
import { launch, setMode, settle, BASE, ROOT } from './probe-session-lib.mjs';
import fs from 'node:fs';

const { browser, page, pageErrors } = await launch();
const result = { route: 'session/start' };

await page.goto(`${BASE}session/start`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(12000);
await settle(page, 30000);
await setMode(page, 'light');
await page.waitForTimeout(1500);
await settle(page, 20000);
await page.screenshot({ path: `${ROOT}/before-launcher-light.png`, fullPage: true });

// inventory of selectors on the page
result.inventory = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('.astryx-selector')).map(
    (root, i) => {
      const btn = root.querySelector('button');
      const r = (btn ?? root).getBoundingClientRect();
      const label = root.querySelector('label');
      return {
        i,
        label: label?.textContent?.trim() ?? null,
        triggerText: btn?.textContent?.trim().slice(0, 40),
        y: +r.y.toFixed(1),
        h: +r.h?.toFixed?.(1) ?? +r.height.toFixed(1),
      };
    },
  );
});

// the cluster-mode block, whatever control it is
result.clusterMode = await page.evaluate(() => {
  const labels = Array.from(document.querySelectorAll('*')).filter(
    (e) =>
      e.children.length === 0 && /cluster\s*mode/i.test(e.textContent ?? ''),
  );
  return labels.slice(0, 4).map((l) => {
    const r = l.getBoundingClientRect();
    let holder = l;
    for (let i = 0; i < 5 && holder.parentElement; i++)
      holder = holder.parentElement;
    return {
      text: l.textContent?.trim(),
      tag: l.tagName,
      cls: String(l.className).slice(0, 80),
      rect: { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1) },
      holderHTML: holder.outerHTML.slice(0, 900),
    };
  });
});

// open each selector and measure
result.opens = [];
const n = result.inventory.length;
for (let i = 0; i < n; i++) {
  const info = await page.evaluate((idx) => {
    const root = document.querySelectorAll('.astryx-selector')[idx];
    if (!root) return { error: 'gone' };
    const btn = root.querySelector('button');
    if (!btn) return { error: 'no trigger' };
    btn.scrollIntoView({ block: 'center' });
    return { ok: true };
  }, i);
  if (info.error) {
    result.opens.push({ i, ...info });
    continue;
  }
  await page.waitForTimeout(400);
  const measured = await page.evaluate((idx) => {
    const root = document.querySelectorAll('.astryx-selector')[idx];
    const btn = root.querySelector('button');
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
    btn.click();
    return {
      label: label?.textContent?.trim() ?? null,
      trigger: rr(btn),
      labelRect: rr(label),
      triggerText: btn.textContent?.trim().slice(0, 40),
    };
  }, i);
  await page.waitForTimeout(700);
  const panel = await page.evaluate(() => {
    const pops = Array.from(document.querySelectorAll('[popover]')).filter(
      (p) => {
        const r = p.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      },
    );
    const p = pops[pops.length - 1];
    if (!p) return { error: 'no open popover' };
    const r = p.getBoundingClientRect();
    const cs = getComputedStyle(p);
    const search = p.querySelector('input[type="text"], input[type="search"], input');
    const listbox = p.querySelector('[role="listbox"]');
    const items = Array.from(p.querySelectorAll('[role="option"]'));
    const sel = items.find(
      (o) => o.getAttribute('aria-selected') === 'true',
    );
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
      positionArea: cs.getPropertyValue('position-area'),
      inlineStyle: p.getAttribute('style'),
      hasSearchInput: !!search,
      optionCount: items.length,
      selectedText: sel?.textContent?.trim().slice(0, 40) ?? null,
      selectedRect: sel
        ? (() => {
            const sr = sel.getBoundingClientRect();
            return {
              y: +sr.y.toFixed(1),
              h: +sr.height.toFixed(1),
              cy: +(sr.y + sr.height / 2).toFixed(1),
            };
          })()
        : null,
      listboxCls: String(listbox?.className).slice(0, 70),
    };
  });
  const verdict =
    panel.rect && measured.trigger
      ? {
          coversTrigger:
            panel.rect.top <= measured.trigger.top &&
            panel.rect.bottom >= measured.trigger.bottom,
          coversLabel:
            measured.labelRect != null &&
            panel.rect.top <= measured.labelRect.top &&
            panel.rect.bottom >= measured.labelRect.bottom,
          panelTopMinusTriggerBottom: +(
            panel.rect.top - measured.trigger.bottom
          ).toFixed(1),
          selectedCyMinusTriggerCy: panel.selectedRect
            ? +(
                panel.selectedRect.cy -
                (measured.trigger.y + measured.trigger.h / 2)
              ).toFixed(1)
            : null,
        }
      : null;
  result.opens.push({ i, ...measured, panel, verdict });
  if (i === 0 || (verdict && verdict.coversTrigger)) {
    await page.screenshot({
      path: `${ROOT}/before-selector-open-${i}.png`,
    });
  }
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
}

result.pageErrors = pageErrors;
fs.writeFileSync(
  `${ROOT}/before-session-f.json`,
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify({ inventory: result.inventory, clusterMode: result.clusterMode.map((c) => c.text) }, null, 2));
console.log(
  JSON.stringify(
    result.opens.map((o) => ({
      i: o.i,
      label: o.label,
      trig: o.trigger,
      panel: o.panel?.rect,
      hasSearch: o.panel?.hasSearchInput,
      v: o.verdict,
    })),
    null,
    1,
  ),
);
await browser.close();
