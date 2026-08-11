/**
 * qa8 IMPL — FIX 2: does a search-less Astryx `Selector` draw its option panel
 * OVER its own trigger?
 *
 * For each target: open the Selector, then report
 *   triggerBottom, panelTop, delta = panelTop - triggerBottom
 *   (delta >= 0 == panel is BELOW the trigger; a large negative delta is the
 *    `shouldOverlaySelectedItem` `margin-block-start` centring the selected
 *    option over the trigger and hiding the label + current value)
 * plus the panel's own `margin-block-start`.
 *
 * Targets:
 *   memUnit   — session launcher memory-unit Selector (BAIDynamicUnitInputNumber)
 *   pageSize  — /data table page-size Selector  (Astryx `Pagination`, NOT ours)
 *   mountPerm — folder Mount Permission Selector (VFolderNodeDescriptionV2)
 *
 * Usage: TAG=before node .scratch/astryx-migration/qa8/probe-impl-session2.mjs
 */
import fs from 'node:fs';
import { BASE, ROOT, launch, settle } from './probe-impl-session-lib.mjs';

const TAG = process.env.TAG ?? 'before';
const out = { tag: TAG, base: BASE, at: new Date().toISOString(), targets: {} };

const { browser, page, pageErrors } = await launch();

async function goto(path, waitFor) {
  await page.goto(new URL(path, BASE).toString(), {
    waitUntil: 'domcontentloaded',
  });
  if (waitFor) await page.waitForSelector(waitFor, { timeout: 90000 }).catch(() => {});
  await settle(page);
  await page.waitForTimeout(1500);
}

/**
 * Measure the currently-open listbox against the combobox that owns it.
 * The project selector in the header keeps a listbox in the DOM at all times,
 * so anchor on the trigger that is actually `aria-expanded="true"` and follow
 * its `aria-controls` — never `querySelector('[role="listbox"]')`.
 */
const measureOpen = () =>
  page.evaluate(() => {
    const trigger = Array.from(
      document.querySelectorAll('[role="combobox"][aria-expanded="true"]'),
    ).find((el) => el.getBoundingClientRect().width > 0);
    if (!trigger) return { error: 'no expanded combobox' };
    const id = trigger.getAttribute('aria-controls');
    const lb = id ? document.getElementById(id) : null;
    if (!lb) return { error: `no listbox for aria-controls=${id}` };
    const tr = trigger.getBoundingClientRect();
    const pr = lb.getBoundingClientRect();
    // Walk up from the listbox and record every margin-block-start on the way:
    // the overlay offset lives on the popover wrapper, not the listbox itself.
    const chain = [];
    let el = lb;
    for (let i = 0; i < 5 && el; i++) {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      chain.push({
        tag: el.tagName,
        mbs: cs.marginBlockStart,
        top: +r.top.toFixed(2),
      });
      el = el.parentElement;
    }
    const offender = chain.find((c) => c.mbs !== '0px' && c.mbs !== 'auto');
    return {
      triggerText: (trigger.textContent || '').trim().slice(0, 30),
      triggerTop: +tr.top.toFixed(2),
      triggerBottom: +tr.bottom.toFixed(2),
      panelTop: +pr.top.toFixed(2),
      delta: +(pr.top - tr.bottom).toFixed(2),
      marginBlockStart: offender?.mbs ?? '0px',
      chain,
    };
  });

async function probe(name, openFn) {
  try {
    await openFn();
    await page.waitForTimeout(900);
    out.targets[name] = await measureOpen();
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(400);
  } catch (e) {
    out.targets[name] = { error: String(e).slice(0, 200) };
  }
}

/** Pick the first VISIBLE combobox whose trimmed text matches `re`. */
async function visibleCombo(re) {
  const combos = page.locator('[role="combobox"]');
  const n = await combos.count();
  for (let i = 0; i < n; i++) {
    const c = combos.nth(i);
    const bb = await c.boundingBox();
    if (!bb || bb.width === 0) continue;
    const t = ((await c.textContent()) ?? '').trim();
    if (re.test(t)) return c;
  }
  throw new Error(`no visible combobox matching ${re} among ${n}`);
}

/* ---- pageSize (/data table pagination — Astryx Pagination's own Selector) - */
await goto('/data', 'table tbody tr');
await probe('pageSize', async () => {
  (await visibleCombo(/^(10|20|50)$/)).click();
});

/* ---- mountPerm (folder explorer modal) — fresh load, the pagination probe
       above leaves the page in a state where the row link no longer opens it */
await goto('/data', 'table tbody tr');
await probe('mountPerm', async () => {
  await page.locator('table tbody tr a').first().click();
  await page.waitForTimeout(8000);
  const combo = await visibleCombo(/^Read/i);
  await combo.scrollIntoViewIfNeeded();
  await combo.click();
});
await page.keyboard.press('Escape').catch(() => {});
await page.waitForTimeout(600);

/* ---- memUnit (session launcher, step 1 = Environments & Resource) -------- */
await goto('/session/start?step=1');
await page.waitForTimeout(12000);
await settle(page);
await page.waitForTimeout(2500);
await probe('memUnit', async () => {
  const combo = await visibleCombo(/^(GiB|MiB|TiB|KiB)$/);
  await combo.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await combo.click();
});

out.pageErrors = pageErrors;
fs.writeFileSync(
  `${ROOT}/${TAG}-impl-session2.json`,
  JSON.stringify(out, null, 2),
);
console.log(JSON.stringify(out, null, 2));
await browser.close();
