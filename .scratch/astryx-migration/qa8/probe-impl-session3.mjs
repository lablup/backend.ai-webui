/**
 * qa8 IMPL — FIX 4: is the Session Type badge vertically centred against the
 * info IconButton that sits beside it?
 *
 * The info button only renders for a BATCH session that carries a
 * `startup_command`, and this shared cluster has none. So the DOM shape is
 * reproduced CLIENT-SIDE ONLY: the Status row's ghost/sm IconButton is cloned
 * into the Session Type `<dd>`, measured, and removed again. Nothing is ever
 * mutated on the cluster.
 *
 * Reports, for both the Status row (the control) and the Session Type row:
 *   badgeCenterY, buttonCenterY, delta  (0.00 == centred)
 *
 * Usage: TAG=before node .scratch/astryx-migration/qa8/probe-impl-session3.mjs
 */
import fs from 'node:fs';
import { BASE, ROOT, launch, setMode, settle } from './probe-impl-session-lib.mjs';

const TAG = process.env.TAG ?? 'before';
const out = { tag: TAG, base: BASE, at: new Date().toISOString(), modes: {} };

const { browser, page, pageErrors } = await launch();

// `/session` redirects to a project route and is occasionally slow enough to
// blow a single wait; `/admin-session` renders the same drawer, so fall back.
async function openList() {
  let landed = false;
  for (const route of ['/session', '/session', '/admin-session']) {
    await page.goto(new URL(route, BASE).toString(), {
      waitUntil: 'domcontentloaded',
    });
    landed = await page
      .waitForSelector('table tbody tr', { timeout: 90000 })
      .then(() => true)
      .catch(() => false);
    if (landed) break;
  }
  if (!landed) throw new Error('no session table');
  await settle(page);
  await page.waitForTimeout(1500);
}

async function openDrawer() {
  // The session name is an Astryx `Link`-styled <button> inside
  // BAINameActionCell, not an <a>.
  await page
    .locator('table tbody tr td .bai-nac-title-area button')
    .first()
    .click();
  await page.waitForSelector('dt', { timeout: 60000 });
  await settle(page);
  await page.waitForTimeout(1500);
}

const measure = () =>
  page.evaluate(() => {
    const rowFor = (label) => {
      const dt = Array.from(document.querySelectorAll('dt')).find(
        (el) => (el.textContent || '').trim() === label,
      );
      if (!dt) return null;
      let dd = dt.nextElementSibling;
      while (dd && dd.tagName !== 'DD') dd = dd.nextElementSibling;
      return dd ? { dt, dd } : null;
    };
    const cy = (el) => {
      const r = el.getBoundingClientRect();
      return +(r.top + r.height / 2).toFixed(2);
    };
    const status = rowFor('Status');
    const stype = rowFor('Session Type');
    if (!status || !stype)
      return { error: `rows: status=${!!status} sessionType=${!!stype}` };

    const statusBtn = status.dd.querySelector('button');
    const statusBadge = status.dd.querySelector(
      '[class*="badge" i],[data-testid*="tag" i],span',
    );
    const control =
      statusBtn && statusBadge
        ? {
            display: getComputedStyle(status.dd).display,
            badgeCenterY: cy(statusBadge),
            buttonCenterY: cy(statusBtn),
            delta: +(cy(statusBadge) - cy(statusBtn)).toFixed(2),
          }
        : { note: 'status row has no icon button in this session state' };

    // --- client-side-only reproduction of the batch/startup_command shape ---
    const typeBadge = stype.dd.querySelector('span,[class*="badge" i]');
    if (!typeBadge) return { control, error: 'no session-type badge' };
    let clone = null;
    if (statusBtn) {
      clone = statusBtn.cloneNode(true);
      clone.setAttribute('data-probe-clone', '1');
      // Append exactly where the real info button renders: as the <dd>'s
      // second child, sibling of the badge.
      (typeBadge.parentElement ?? stype.dd).appendChild(clone);
    }
    const subject = clone
      ? {
          ddDisplay: getComputedStyle(stype.dd).display,
          wrapperTag: typeBadge.parentElement?.tagName,
          wrapperDisplay: getComputedStyle(
            typeBadge.parentElement ?? stype.dd,
          ).display,
          wrapperAlign: getComputedStyle(typeBadge.parentElement ?? stype.dd)
            .alignItems,
          badgeCenterY: cy(typeBadge),
          buttonCenterY: cy(clone),
          delta: +(cy(typeBadge) - cy(clone)).toFixed(2),
        }
      : { error: 'no status IconButton to clone' };
    if (clone) clone.remove();
    return { control, subject };
  });

// The drawer's own header intercepts pointer events on the app header, so the
// theme toggle has to be clicked from the LIST page, before the drawer opens.
for (const mode of ['light', 'dark']) {
  await openList();
  await setMode(page, mode);
  await page.waitForTimeout(1200);
  await openDrawer();
  out.modes[mode] = await measure();
}

out.pageErrors = pageErrors;
fs.writeFileSync(
  `${ROOT}/${TAG}-impl-session3.json`,
  JSON.stringify(out, null, 2),
);
console.log(JSON.stringify(out, null, 2));
await browser.close();
