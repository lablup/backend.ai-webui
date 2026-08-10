/**
 * qa8 — item (E) detail: the "Permanently Delete Users" modal body, both modes.
 * READ-ONLY — the modal is opened and dismissed with Escape, never confirmed.
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE =
  process.env.BASE ?? 'https://to-astryx.backend-ai-webui.localhost:1357/';
const ROOT = process.env.ROOT ?? '.scratch/astryx-migration/qa8';
const TAG = process.env.TAG ?? 'before';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  ignoreHTTPSErrors: true,
  storageState: `${ROOT}/state.json`,
});
const page = await ctx.newPage();
page.setDefaultNavigationTimeout(180000);
page.setDefaultTimeout(20000);
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(e.message));

async function setMode(mode) {
  const want = mode === 'dark';
  const now = await page.evaluate(
    () => document.documentElement.dataset.theme ?? null,
  );
  if ((now === 'dark') !== want) {
    await page
      .getByRole('button', { name: /^(dark|light) mode$/i })
      .first()
      .click();
    await page.waitForTimeout(2000);
  }
  const applied = await page.evaluate(
    () => document.documentElement.dataset.theme ?? null,
  );
  if (applied !== mode) throw new Error(`theme toggle did not take: ${applied}`);
  return applied;
}

const result = {};

for (const mode of ['light', 'dark']) {
  await page.goto(`${BASE}admin/users`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);
  const applied = await setMode(mode);
  const m = (result[mode] = { appliedTheme: applied });

  await page.getByRole('radio', { name: /inactive/i }).first().click();
  await page.waitForTimeout(3500);
  await page
    .locator('tbody tr')
    .first()
    .locator('button[aria-label="More actions"]')
    .first()
    .click();
  await page.waitForTimeout(900);
  await page
    .locator('[role="menuitem"]', { hasText: /Permanently Delete/ })
    .first()
    .click();
  await page.waitForTimeout(2200);

  m.body = await page.evaluate(() => {
    const dlg = [
      ...document.querySelectorAll('dialog[open], [role="dialog"]'),
    ].pop();
    const box = (n) => {
      if (!n) return null;
      const r = n.getBoundingClientRect();
      const cs = getComputedStyle(n);
      return {
        y: +r.y.toFixed(1),
        h: +r.height.toFixed(1),
        w: +r.width.toFixed(1),
        bg: cs.backgroundColor,
        color: cs.color,
        padding: cs.padding,
        borderRadius: cs.borderRadius,
        text: n.textContent?.trim().slice(0, 60),
        cls: (n.getAttribute('class') || '').slice(0, 60),
      };
    };
    const banner = dlg.querySelector('.astryx-banner');
    const bannerContent = dlg.querySelector('.astryx-banner-content');
    const bannerIcon = dlg.querySelector('.astryx-banner-icon');
    const bannerTitle = banner?.querySelector('.astryx-text, .astryx-heading');
    const input = dlg.querySelector('input[name="confirmText"]');
    const code = dlg.querySelector('[data-type="code"]');
    const itemList = dlg.querySelector('[role="list"]');
    return {
      dialogRect: box(dlg),
      itemList: box(itemList),
      input: input
        ? {
            y: +input.getBoundingClientRect().y.toFixed(1),
            h: +input.getBoundingClientRect().height.toFixed(1),
          }
        : null,
      inputLabel: dlg
        .querySelector('label')
        ?.textContent?.trim()
        .slice(0, 60),
      codeEcho: box(code),
      banner: box(banner),
      bannerContent: box(bannerContent),
      bannerIcon: bannerIcon
        ? {
            ...box(bannerIcon),
            svgColor: getComputedStyle(
              bannerIcon.querySelector('svg') ?? bannerIcon,
            ).color,
          }
        : null,
      bannerTitleColor: bannerTitle
        ? getComputedStyle(bannerTitle).color
        : null,
      checkboxes: [...dlg.querySelectorAll('input[type="checkbox"]')].map(
        (c) => ({
          y: +c.getBoundingClientRect().y.toFixed(1),
          label: c.closest('label')?.textContent?.trim().slice(0, 50),
        }),
      ),
      colorError: getComputedStyle(document.documentElement)
        .getPropertyValue('--color-error')
        .trim(),
      // What `<Text color="danger">` would paint (the theme registers
      // STATUS_TEXT_COLORS `color:danger` -> var(--color-error)).
      resolvedError: (() => {
        const probe = document.createElement('span');
        probe.style.color = 'var(--color-error)';
        dlg.appendChild(probe);
        const c = getComputedStyle(probe).color;
        probe.remove();
        return c;
      })(),
    };
  });

  await page.screenshot({ path: `${ROOT}/${TAG}-adminusers-purge-${mode}.png` });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);
}

result.pageErrors = pageErrors;
fs.writeFileSync(
  `${ROOT}/${TAG}-adminusers-purge.json`,
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result, null, 2));
await browser.close();
