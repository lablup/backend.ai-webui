// Ticket 29 — NOTIFICATION REWIRE: drive a real background-task notification
// through the real hook (upsertNotification -> jotai -> adapter -> Astryx
// stack) and record what each stage looks like and does.
//
// Serve first (ports 5745-5754 are this agent's range):
//   cd react && pnpm exec vite --config theme-probe/vite.config.mts --port 5745
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';

const OUT = new URL('./shots/29/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const BASE =
  process.env.NOTIF_URL ??
  'http://127.0.0.1:5745/theme-probe/notification29.html';
const browser = await chromium.launch();
const errors = [];
const results = {};

const newPage = async (label, mode = 'light') => {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 860 },
    colorScheme: mode,
  });
  page.on('pageerror', (e) => errors.push(`[${label}] pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`[${label}] console: ${m.text()}`);
  });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  // The harness handle is installed in an effect, i.e. after the first commit.
  await page.waitForFunction(() => window.__notification29 !== undefined);
  return page;
};

const drive = (page, fn, ...args) =>
  page.evaluate(
    ([name, rest]) => window.__notification29[name](...rest),
    [fn, args],
  );

const notice = (page, key) => page.locator(`[data-notification-key="${key}"]`);
const TASK = 'bgtask:clone-my-training-data';

// ---------------------------------------------------------------------------
// 1. The full background-task lifecycle, with a frame at every stage.
// ---------------------------------------------------------------------------
for (const mode of ['light', 'dark']) {
  const page = await newPage(`lifecycle-${mode}`, mode);
  const stages = [];

  await drive(page, 'start');
  await page.waitForTimeout(400);
  stages.push({
    stage: 'pending-indeterminate',
    status: await notice(page, TASK).getAttribute('data-status'),
    progressValue: await page
      .locator(`[data-notification-key="${TASK}"] [role="progressbar"]`)
      .first()
      .getAttribute('aria-valuenow'),
  });
  await page.screenshot({ path: `${OUT}29-1-pending-${mode}.png` });

  await drive(page, 'progress', 25);
  await page.waitForTimeout(300);
  await drive(page, 'progress', 70);
  await page.waitForTimeout(400);
  stages.push({
    stage: 'progress-70',
    status: await notice(page, TASK).getAttribute('data-status'),
    progressValue: await page
      .locator(`[data-notification-key="${TASK}"] [role="progressbar"]`)
      .first()
      .getAttribute('aria-valuenow'),
  });
  await page.screenshot({ path: `${OUT}29-2-progress-${mode}.png` });

  // The promise settles -> the hook flips status to resolved and sets
  // duration = CLOSING_DURATION (4s).
  await drive(page, 'resolve');
  await page.waitForTimeout(600);
  stages.push({
    stage: 'resolved',
    status: await notice(page, TASK).getAttribute('data-status'),
    progressValue: await page
      .locator(`[data-notification-key="${TASK}"] [role="progressbar"]`)
      .first()
      .getAttribute('aria-valuenow'),
    visible: await notice(page, TASK).isVisible(),
  });
  await page.screenshot({ path: `${OUT}29-3-resolved-${mode}.png` });

  // Auto-close: 4s budget, plus the 200ms exit animation.
  await page.waitForTimeout(4600);
  stages.push({
    stage: 'auto-closed',
    remaining: await page.locator('[data-notification-key]').count(),
  });
  await page.screenshot({ path: `${OUT}29-4-autoclosed-${mode}.png` });

  results[`lifecycle-${mode}`] = stages;
  console.log(`lifecycle-${mode}:`, JSON.stringify(stages));
  await page.close();
}

// ---------------------------------------------------------------------------
// 2. Several notices at once — the stack, its action button and its
//    collapsible detail (extraDescription), light + dark.
// ---------------------------------------------------------------------------
for (const mode of ['light', 'dark']) {
  const page = await newPage(`stack-${mode}`, mode);
  await drive(page, 'start');
  await drive(page, 'progress', 40);
  await drive(page, 'openActionNotice');
  await drive(page, 'openExtraNotice');
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}29-5-stack-${mode}.png` });

  // The Banner disclosure holds `extraDescription` — ticket 08 deferred it.
  await page
    .locator('[data-notification-key="extra-notice"] button[aria-expanded]')
    .first()
    .click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}29-6-extradetail-${mode}.png` });
  results[`extraDescription-visible-${mode}`] = await page
    .getByText('ETIMEDOUT after 30000ms')
    .isVisible();
  await page.close();
}

// ---------------------------------------------------------------------------
// 3. The action button ("View folder") navigates and closes the notice.
// ---------------------------------------------------------------------------
{
  const page = await newPage('action');
  await drive(page, 'openActionNotice');
  await page.waitForTimeout(300);
  const before = await notice(page, 'action-notice').count();
  await page
    .locator('[data-notification-key="action-notice"]')
    .getByRole('button', { name: 'View folder' })
    .click();
  await page.waitForTimeout(500);
  results.action = {
    before,
    afterClick: await notice(page, 'action-notice').count(),
  };
  console.log('action button:', JSON.stringify(results.action));
  await page.close();
}

// ---------------------------------------------------------------------------
// 4. Open decision #3 — hover pauses the auto-close countdown.
// ---------------------------------------------------------------------------
{
  const page = await newPage('hover-pause');
  await drive(page, 'start');
  await drive(page, 'resolve'); // duration becomes 4s
  await page.waitForTimeout(400);
  await notice(page, TASK).hover();
  await page.waitForTimeout(200);
  const pausedAttr = await notice(page, TASK).getAttribute('data-paused');
  // Twice the 4s budget, held under the pointer the whole time.
  await page.waitForTimeout(8000);
  const survivedHover = (await notice(page, TASK).count()) === 1;
  // Move the pointer away; the banked remainder resumes.
  await page.mouse.move(10, 10);
  await page.waitForTimeout(4800);
  const closedAfterLeave = (await notice(page, TASK).count()) === 0;
  results.hoverPause = { pausedAttr, survivedHover, closedAfterLeave };
  console.log('hover pause:', JSON.stringify(results.hoverPause));
  await page.close();
}

// ---------------------------------------------------------------------------
// 5. `duration: 0` is "stay open", not "close immediately" — the value the
//    hook puts on every pending background task.
// ---------------------------------------------------------------------------
{
  const page = await newPage('duration-zero');
  await drive(page, 'start');
  await page.waitForTimeout(6000);
  results.durationZeroStaysOpen = (await notice(page, TASK).count()) === 1;
  console.log('duration 0 stays open:', results.durationZeroStaysOpen);
  await page.close();
}

// ---------------------------------------------------------------------------
// 6. Manual dismiss still plays the exit transition.
// ---------------------------------------------------------------------------
{
  const page = await newPage('dismiss');
  await drive(page, 'openActionNotice');
  await drive(page, 'openExtraNotice');
  await page.waitForTimeout(400);
  const before = await page.locator('[data-notification-key]').count();
  await page
    .locator('[data-notification-key="extra-notice"] button')
    .last()
    .click();
  await page.waitForTimeout(80);
  const exiting = await page.locator('[data-exiting="true"]').count();
  await page.waitForTimeout(500);
  const after = await page.locator('[data-notification-key]').count();
  results.dismiss = { before, exiting, after };
  console.log('dismiss:', JSON.stringify(results.dismiss));
  await page.close();
}

results.errors = errors;
writeFileSync(`${OUT}measure-29.json`, JSON.stringify(results, null, 2));
console.log(
  errors.length ? `ERRORS (${errors.length}):\n${errors.join('\n')}` : 'errors: 0',
);
await browser.close();
