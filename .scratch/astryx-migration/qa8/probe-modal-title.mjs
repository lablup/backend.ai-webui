/**
 * qa8 modal group — items (A) dialog title vs footer button type scale, and
 * (B) dialog widths on /admin/settings.
 *
 * Opens a set of dialogs read-only (never clicks OK / Apply / Delete) and
 * records, per dialog and per mode:
 *   - the <dialog> rect + computed width/max-width + the width the call site
 *     asked for (via the inline stylex class -> computed value)
 *   - the DialogHeader <h2> font-size / line-height / font-weight
 *   - every footer button's label font-size / weight / control height
 *   - the resolved --text-heading-2-size / --text-label-size on the dialog
 *
 * Usage: node .scratch/astryx-migration/qa8/probe-modal-title.mjs
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
  await page.evaluate((m) => {
    const want = m === 'dark';
    if ((document.documentElement.dataset.theme === 'dark') === want) return;
    const b = Array.from(document.querySelectorAll('button')).find((x) =>
      /dark|theme|mode/i.test(x.getAttribute('aria-label') || x.title || ''),
    );
    if (b) b.click();
  }, mode);
  await page.waitForTimeout(2000);
  const applied = await page.evaluate(
    () => document.documentElement.dataset.theme ?? null,
  );
  if (applied !== mode) throw new Error(`theme toggle did not take: ${applied}`);
  return applied;
}

/** Everything measurable about the currently open <dialog>. */
const measureDialog = () =>
  page.evaluate(() => {
    const dlg = document.querySelector('dialog[open]');
    if (!dlg) return { error: 'no open dialog' };
    const r = dlg.getBoundingClientRect();
    const dc = getComputedStyle(dlg);
    const px = (s) => (s ? +parseFloat(s).toFixed(2) : null);

    const h2 = dlg.querySelector('h2');
    const hs = h2 ? getComputedStyle(h2) : null;

    // The footer is Astryx `LayoutFooter`; grab the last flex row of buttons.
    const footer =
      dlg.querySelector('[class*="layout-footer"], footer') ??
      // fall back: the last direct descendant holding >=1 button after content
      [...dlg.querySelectorAll('div')]
        .filter((d) => d.querySelector(':scope > * > button, :scope > button'))
        .at(-1);
    const footerButtons = footer
      ? [...footer.querySelectorAll('button')].map((b) => {
          const c = getComputedStyle(b);
          const br = b.getBoundingClientRect();
          return {
            label: b.textContent?.trim().slice(0, 30),
            fontSize: px(c.fontSize),
            lineHeight: c.lineHeight,
            fontWeight: c.fontWeight,
            height: +br.height.toFixed(1),
            bg: c.backgroundColor,
          };
        })
      : null;

    return {
      dialog: {
        w: +r.width.toFixed(1),
        h: +r.height.toFixed(1),
        left: +r.left.toFixed(1),
        computedWidth: dc.width,
        maxWidth: dc.maxWidth,
        insetInlineStart: dc.insetInlineStart,
        insetInlineEnd: dc.insetInlineEnd,
        marginInline: `${dc.marginLeft} / ${dc.marginRight}`,
        headingSizeVar: dc.getPropertyValue('--text-heading-2-size').trim(),
        headingLeadVar: dc.getPropertyValue('--text-heading-2-leading').trim(),
        labelSizeVar: dc.getPropertyValue('--text-label-size').trim(),
        fontSizeBaseVar: dc.getPropertyValue('--font-size-base').trim(),
      },
      title: h2
        ? {
            text: h2.textContent?.trim().slice(0, 40),
            fontSize: px(hs.fontSize),
            lineHeight: hs.lineHeight,
            fontWeight: hs.fontWeight,
            color: hs.color,
            rectH: +h2.getBoundingClientRect().height.toFixed(1),
          }
        : null,
      footerButtons,
    };
  });

async function closeDialog() {
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);
  // some dialogs are `purpose="form"`; Escape works there too. If still open,
  // click the header close button (never a footer action).
  if (await page.locator('dialog[open]').count()) {
    await page
      .locator('dialog[open] button[aria-label*="lose" i]')
      .first()
      .click()
      .catch(() => {});
    await page.waitForTimeout(600);
  }
}

/** name -> { route, open(page) } */
const CASES = [
  {
    name: 'table-settings',
    route: 'agent',
    open: async () => {
      await page
        .locator('button[aria-label*="etting" i], button[aria-label*="설정"]')
        .first()
        .click();
    },
  },
  {
    name: 'overlay-network',
    route: 'admin/settings',
    open: async () => {
      await page
        .getByRole('button', { name: /overlay network/i })
        .first()
        .click();
    },
  },
  {
    name: 'scheduler',
    route: 'admin/settings',
    open: async () => {
      await page
        .getByRole('button', { name: /scheduler|config per job/i })
        .first()
        .click();
    },
  },
  {
    name: 'terminate-session',
    route: 'session',
    open: async () => {
      await page
        .locator(
          'button[aria-label*="Terminate" i], button[title*="Terminate" i]',
        )
        .first()
        .click();
    },
  },
  {
    name: 'terms-of-service',
    route: 'session',
    open: async () => {
      await page.locator('[data-testid="button-terms-of-service"]').click();
    },
  },
  {
    name: 'privacy-policy',
    route: 'session',
    open: async () => {
      await page.locator('[data-testid="button-privacy-policy"]').click();
    },
  },
  {
    name: 'about-backend-ai',
    route: 'session',
    open: async () => {
      await page.locator('[data-testid="button-about-backend-ai"]').click();
    },
  },
];

const result = { viewport: { w: 1600, h: 1000 } };

for (const mode of ['light', 'dark']) {
  const bucket = (result[mode] = {});
  let lastRoute = null;
  for (const c of CASES) {
    try {
      if (c.route !== lastRoute) {
        await page.goto(`${BASE}${c.route}`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(11000);
        lastRoute = c.route;
      }
      bucket.appliedTheme = await setMode(mode);
      await c.open();
      await page.waitForTimeout(1800);
      bucket[c.name] = await measureDialog();
      await page
        .locator('dialog[open]')
        .first()
        .screenshot({ path: `${ROOT}/${TAG}-dlg-${c.name}-${mode}.png` })
        .catch(() => {});
      await closeDialog();
    } catch (e) {
      bucket[c.name] = { error: String(e).split('\n')[0] };
      await closeDialog().catch(() => {});
      lastRoute = null;
    }
  }
}

result.pageErrors = pageErrors;
fs.writeFileSync(
  `${ROOT}/${TAG}-modal-title.json`,
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result, null, 2));
await browser.close();
