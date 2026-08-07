// Ticket 08 — GAP COMPONENTS: screenshot each component's key states in
// light + dark, and report every console/page error on the way.
// Serve first:  cd react && pnpm exec vite --config theme-probe/vite.config.mts
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const OUT = new URL('./shots/08/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const BASE = process.env.GAP_URL ?? 'http://127.0.0.1:9198/theme-probe/gap.html';
const browser = await chromium.launch();
const errors = [];

/** Full-page frames of the in-flow components. */
const pages = [
  { key: '', name: 'gap-overview' },
  { key: 'popconfirm', name: 'gap-popconfirm' },
];

for (const mode of ['light', 'dark']) {
  for (const state of pages) {
    const page = await browser.newPage({
      viewport: { width: 1500, height: 1100 },
      colorScheme: mode,
    });
    page.on('pageerror', (e) =>
      errors.push(`[${mode}/${state.name}] pageerror: ${e.message}`),
    );
    page.on('console', (m) => {
      if (m.type() === 'error')
        errors.push(`[${mode}/${state.name}] console: ${m.text()}`);
    });
    await page.goto(state.key ? `${BASE}?state=${state.key}` : BASE, {
      waitUntil: 'networkidle',
    });
    // Let the skeleton shimmer and the popover placement settle.
    await page.waitForTimeout(1200);
    await page.screenshot({
      path: `${OUT}${state.name}-${mode}.png`,
      fullPage: true,
    });
    console.log(`shot: ${state.name}-${mode}.png`);
    await page.close();
  }
}

// Per-component frames: each column clipped, light + dark, so every gap
// component has its own acceptance shot rather than only a page-wide one.
const columns = [
  { head: 'BAISkeleton', name: 'gap-skeleton' },
  { head: 'useBAIBreakpoint', name: 'gap-breakpoint' },
  { head: 'BAIPopconfirm', name: 'gap-popconfirm-closed' },
  { head: 'BAIBadgeCount', name: 'gap-badgecount' },
  { head: 'IconButton conversions', name: 'gap-iconbutton-followup' },
];
for (const mode of ['light', 'dark']) {
  const page = await browser.newPage({
    viewport: { width: 1500, height: 1400 },
    colorScheme: mode,
  });
  page.on('pageerror', (e) =>
    errors.push(`[${mode}/columns] pageerror: ${e.message}`),
  );
  page.on('console', (m) => {
    if (m.type() === 'error')
      errors.push(`[${mode}/columns] console: ${m.text()}`);
  });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  for (const col of columns) {
    await page
      .locator('.col', { hasText: col.head })
      .first()
      .screenshot({ path: `${OUT}${col.name}-${mode}.png` });
    console.log(`shot: ${col.name}-${mode}.png`);
  }
  await page.close();
}

// The notification stack is `position: fixed`, so it is captured viewport-only
// (a fullPage shot would pin it to the document bottom instead of the corner).
for (const mode of ['light', 'dark']) {
  const page = await browser.newPage({
    viewport: { width: 1500, height: 1100 },
    colorScheme: mode,
  });
  page.on('pageerror', (e) =>
    errors.push(`[${mode}/notifications] pageerror: ${e.message}`),
  );
  page.on('console', (m) => {
    if (m.type() === 'error')
      errors.push(`[${mode}/notifications] console: ${m.text()}`);
  });
  await page.goto(`${BASE}?state=notifications`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}gap-notifications-${mode}.png` });
  console.log(`shot: gap-notifications-${mode}.png`);
  await page.close();
}

// Breakpoint proof: the SAME hook at three viewport widths.
for (const width of [480, 900, 1700]) {
  const page = await browser.newPage({
    viewport: { width, height: 900 },
    colorScheme: 'light',
  });
  page.on('pageerror', (e) =>
    errors.push(`[bp-${width}] pageerror: ${e.message}`),
  );
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`[bp-${width}] console: ${m.text()}`);
  });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  const col = page.locator('.col', { hasText: 'useBAIBreakpoint' }).first();
  await col.screenshot({ path: `${OUT}gap-breakpoint-${width}.png` });
  console.log(`shot: gap-breakpoint-${width}.png`);
  await page.close();
}

// A live resize must flip the booleans without a reload — that is the whole
// point of the matchMedia subscription.
{
  const page = await browser.newPage({
    viewport: { width: 1700, height: 900 },
  });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const read = async () =>
    page.locator('.col', { hasText: 'useBAIBreakpoint' }).first().innerText();
  const wide = await read();
  await page.setViewportSize({ width: 500, height: 900 });
  await page.waitForTimeout(300);
  const narrow = await read();
  const wideXxl = /xxl[\s\S]*?true/.test(wide);
  const narrowXs = /xs[\s\S]*?true/.test(narrow);
  console.log(
    `resize check: 1700px -> xxl true? ${wideXxl} | 500px -> xs true? ${narrowXs}`,
  );
  await page.close();
}

// Interaction contract for BAIPopconfirm: click opens it, focus lands on the
// SAFE action (Cancel), Escape closes it, and focus returns to the trigger.
{
  const page = await browser.newPage({
    viewport: { width: 1500, height: 1100 },
  });
  page.on('pageerror', (e) =>
    errors.push(`[popconfirm-a11y] pageerror: ${e.message}`),
  );
  page.on('console', (m) => {
    if (m.type() === 'error')
      errors.push(`[popconfirm-a11y] console: ${m.text()}`);
  });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const trigger = page.getByRole('button', { name: 'Set as main' });
  await trigger.click();
  await page.waitForTimeout(250);
  const focusedOnOpen = await page.evaluate(
    () => document.activeElement?.textContent?.trim() ?? '',
  );
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  const stillOpen = await page
    .getByText('This keypair becomes the main')
    .isVisible();
  const focusedAfterClose = await page.evaluate(
    () => document.activeElement?.textContent?.trim() ?? '',
  );
  console.log(
    `popconfirm a11y: focus on open = "${focusedOnOpen}" | open after Escape = ${stillOpen} | focus after close = "${focusedAfterClose}"`,
  );
  await page.close();
}

// Notification stack exit transition + close button.
{
  const page = await browser.newPage({
    viewport: { width: 1500, height: 1100 },
  });
  page.on('pageerror', (e) =>
    errors.push(`[notif-close] pageerror: ${e.message}`),
  );
  await page.goto(`${BASE}?state=notifications`, { waitUntil: 'networkidle' });
  const before = await page.locator('[data-notification-key]').count();
  await page
    .locator(
      '[data-notification-key="import"] button[aria-label], [data-notification-key="import"] button',
    )
    .last()
    .click();
  await page.waitForTimeout(80);
  const exiting = await page.locator('[data-exiting="true"]').count();
  await page.waitForTimeout(400);
  const after = await page.locator('[data-notification-key]').count();
  console.log(
    `notification close: ${before} -> exiting ${exiting} -> ${after} remaining`,
  );
  await page.close();
}

// Follow-up controls are real buttons now: the ✕ is reachable by role and
// clears the selection; the copy control is reachable by role too.
{
  const page = await browser.newPage({
    viewport: { width: 1500, height: 1400 },
  });
  page.on('pageerror', (e) =>
    errors.push(`[iconbutton-followup] pageerror: ${e.message}`),
  );
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const clear = page.getByRole('button', { name: 'Deselect all' }).first();
  const clearVisible = await clear.isVisible();
  await clear.click();
  await page.waitForTimeout(150);
  const labelGone = !(await page.getByText('3 selected').isVisible());
  const copyVisible = await page
    .getByRole('button', { name: 'Copy endpoint URL' })
    .isVisible();
  console.log(
    `iconbutton follow-up: clear is a button? ${clearVisible} | click clears label? ${labelGone} | copy is a button? ${copyVisible}`,
  );
  await page.close();
}

await browser.close();
console.log('---');
console.log(errors.length ? errors.join('\n') : 'no console/page errors');
