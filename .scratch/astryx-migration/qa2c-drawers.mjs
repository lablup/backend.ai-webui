/**
 * qa2-c drawer-header verification.
 *
 * Opens each drawer and reports its header geometry: is there exactly one
 * close affordance, is it at the START of the header (antd's default
 * `closable.placement`), does the title follow it, and do the `extra` actions
 * sit at the trailing edge without overlapping anything.
 */
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const BASE = process.env.QA_BASE ?? 'http://127.0.0.1:5930/';
const ENDPOINT = process.env.BAI_ENDPOINT ?? 'http://10.82.0.130:8090';
const OUT = process.env.QA_OUT ?? '.scratch/astryx-migration/shots/qa2-c';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1100 },
  ignoreHTTPSErrors: true,
});
await ctx.addInitScript((ep) => {
  try {
    localStorage.setItem('backendaiwebui.api_endpoint', ep);
  } catch {
    /* storage unavailable */
  }
}, ENDPOINT);
const page = await ctx.newPage();
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(9000);
const u = page.locator('input[placeholder*="mail" i]').first();
if (await u.count()) {
  await u.fill(process.env.BAI_EMAIL ?? 'admin@lablup.com');
  await page
    .locator('input[type="password"]')
    .first()
    .fill(process.env.BAI_PW ?? 'wJalrXUt');
  await page
    .getByRole('button', { name: /login/i })
    .first()
    .click();
}
await page.waitForTimeout(15000);
const PREFIX = new URL(page.url()).pathname.replace(/\/[^/]*$/, '');

const HEADER = () => {
  const dlg = document.querySelector('dialog[open]');
  if (!dlg) return { error: 'no open drawer' };
  const h = dlg.querySelector('.bai-drawer-header');
  const box = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      x: Math.round(r.x),
      y: Math.round(r.y),
      w: Math.round(r.width),
      h: Math.round(r.height),
    };
  };
  if (!h) {
    return {
      shape: 'NO bai-drawer-header (legacy hand-rolled row)',
      drawer: box(dlg),
      // Any floating close button lab paints over the content
      floatingButtons: [...dlg.querySelectorAll('button[aria-label="Close"]')].map(
        (b) => ({ ...box(b), position: getComputedStyle(b.parentElement).position }),
      ),
    };
  }
  const cs = getComputedStyle(h);
  const titleWrap = h.querySelector('.bai-drawer-header-title');
  const closeBtn = titleWrap?.querySelector('button');
  const title = h.querySelector('.bai-drawer-title');
  const extra = h.querySelector('.bai-drawer-extra');
  return {
    header: { ...box(h), padding: cs.padding, borderBottom: cs.borderBottomWidth },
    close: box(closeBtn),
    title: box(title),
    extra: box(extra),
    closeCount: dlg.querySelectorAll('button[aria-label="Close"]').length,
    // antd order check: close starts before the title, extra ends at the edge
    closeBeforeTitle:
      closeBtn && title
        ? closeBtn.getBoundingClientRect().right <=
          title.getBoundingClientRect().left
        : null,
    extraAtTrailingEdge:
      extra && h
        ? Math.round(
            h.getBoundingClientRect().right -
              extra.getBoundingClientRect().right,
          )
        : null,
    body: box(dlg.querySelector('.bai-drawer-body, .bai-drawer-body-flush')),
  };
};

async function shot(name) {
  await page.waitForTimeout(2500);
  console.log(`### ${name} ` + JSON.stringify(await page.evaluate(HEADER)));
  await page.screenshot({ path: `${OUT}/drawer-${name}.png` });
}

// 1) Notification drawer — the bell in the header.
await page.goto(new URL(PREFIX + '/start', BASE).toString(), {
  waitUntil: 'domcontentloaded',
});
await page.waitForTimeout(8000);
await page
  .locator('header button, [class*="header"] button')
  .filter({ has: page.locator('svg') })
  .nth(0)
  .click()
  .catch(() => {});
await shot('notification');
await page.keyboard.press('Escape');

// 2) Agent detail drawer (ResourcesPage, "agents" tab).
await page.goto(new URL('admin/agent', BASE).toString(), {
  waitUntil: 'domcontentloaded',
});
await page.waitForTimeout(12000);
await page
  .locator('.astryx-table-scroll-wrapper tbody .astryx-link')
  .first()
  .click()
  .catch(() => {});
await shot('agent-detail');
await page.keyboard.press('Escape');

// 3) Storage host detail drawer (same page, "storages" tab).
await page.goto(new URL('admin/agent?tab=storages', BASE).toString(), {
  waitUntil: 'domcontentloaded',
});
await page.waitForTimeout(12000);
await page
  .getByRole('tab', { name: /storage/i })
  .first()
  .click()
  .catch(() => {});
await page.waitForTimeout(6000);
await page
  .locator('.astryx-table-scroll-wrapper tbody .astryx-link')
  .first()
  .click()
  .catch(() => {});
await shot('storage-host');
await page.keyboard.press('Escape');

// 4) Role detail drawer (RBAC management).
await page.goto(new URL('admin/rbac', BASE).toString(), {
  waitUntil: 'domcontentloaded',
});
await page.waitForTimeout(12000);
await page
  .locator('.astryx-table-scroll-wrapper tbody .astryx-link')
  .first()
  .click()
  .catch(() => {});
await shot('role-detail');

await browser.close();
