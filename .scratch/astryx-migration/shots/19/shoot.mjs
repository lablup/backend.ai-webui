// Ticket 19 shot runner. Usage: node shoot.mjs <prefix>
// Captures the Environments-area cases in light+dark from the theme-probe
// harness on port 5655 (ticket-19 port policy 5655-5664).
//
// Page cases map to EnvironmentPage tabs (?tab=) + MyEnvironmentPage; two
// extra modal cases click the create buttons so the Form-conversion surface
// (ResourcePresetSettingModal / ContainerRegistryEditorModal) is captured too.
import { chromium } from '@playwright/test';

const prefix = process.argv[2] ?? 'shot';
const outDir = new URL('.', import.meta.url).pathname;
const base = 'http://127.0.0.1:5655/theme-probe/environments.html';

const CASES = [
  // [name, url params, click-text-to-open-modal]
  ['images', 'case=images&tab=image', null],
  ['presets', 'case=presets&tab=preset', null],
  ['registries', 'case=registries&tab=registry', null],
  ['customized', 'case=customized', null],
  ['preset-modal', 'case=presets&tab=preset', 'Create Preset'],
  ['registry-modal', 'case=registries&tab=registry', 'Add Registry'],
];

const browser = await chromium.launch();
for (const [caseName, query, clickText] of CASES) {
  for (const scheme of ['light', 'dark']) {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 960 },
      colorScheme: scheme,
    });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(`${base}?${query}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    if (clickText) {
      try {
        await page.getByText(clickText, { exact: true }).first().click();
        await page.waitForTimeout(1200);
      } catch (e) {
        errors.push(`modal click failed: ${e}`);
      }
    }
    await page.screenshot({
      path: `${outDir}${prefix}-${caseName}-${scheme}.png`,
      fullPage: !clickText,
    });
    if (errors.length) {
      console.log(`[${prefix} ${caseName} ${scheme}] page errors:`);
      for (const e of errors.slice(0, 5)) console.log('  ' + e.split('\n')[0]);
    }
    await ctx.close();
  }
}
await browser.close();
console.log('done:', prefix);
