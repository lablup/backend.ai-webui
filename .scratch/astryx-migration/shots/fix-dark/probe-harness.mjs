// Screenshot every theme-probe harness page in light + dark (OS emulation).
// Run: node .scratch/astryx-migration/shots/fix-dark/probe-harness.mjs [tag]
import { chromium } from '@playwright/test';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const outDir = dirname(fileURLToPath(import.meta.url));
const BASE = process.env.PROBE_URL ?? 'http://127.0.0.1:5795/theme-probe/';
const tag = process.argv[2] ?? 'before';

const PAGES = (
  process.env.PAGES ??
  'gap,dashboard,form,notification29,sessions,frame24,resources,environments,deployments,settings,select26,table25,users21,responsive,chatai,brand'
).split(',');

const browser = await chromium.launch();
const report = {};
for (const name of PAGES) {
  for (const mode of ['light', 'dark']) {
    const ctx = await browser.newContext({
      colorScheme: mode,
      viewport: { width: 1440, height: 1000 },
    });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', (e) => errs.push(String(e).slice(0, 200)));
    try {
      await page.goto(`${BASE}${name}.html`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1500);
      await page.screenshot({
        path: join(outDir, `${tag}-h-${name}-${mode}.png`),
        fullPage: true,
      });
      report[`${name}-${mode}`] = {
        errs,
        probe: await page.evaluate(() => {
          const cs = getComputedStyle(document.documentElement);
          const bodyCs = getComputedStyle(document.body);
          const themed = document.querySelector('[data-astryx-theme]');
          return {
            htmlDataTheme: document.documentElement.getAttribute('data-theme'),
            htmlAstryx:
              document.documentElement.getAttribute('data-astryx-theme'),
            htmlColorScheme: cs.colorScheme,
            bodyBg: bodyCs.backgroundColor,
            spacing4: cs.getPropertyValue('--spacing-4').trim(),
            surface: themed
              ? getComputedStyle(themed)
                  .getPropertyValue('--color-background-surface')
                  .trim()
              : null,
          };
        }),
      };
    } catch (e) {
      report[`${name}-${mode}`] = { error: String(e).slice(0, 300) };
    }
    await ctx.close();
  }
}
await browser.close();
console.log(JSON.stringify(report, null, 2));
