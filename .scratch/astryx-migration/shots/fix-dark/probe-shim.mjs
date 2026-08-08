// Replicate the theme-shim's CSS probe inside the running app, for both modes,
// to check whether `theme.useToken()` would hand out dark values in dark mode.
import { chromium } from '@playwright/test';

const APP = process.env.APP_URL ?? 'http://127.0.0.1:4435/';
const browser = await chromium.launch();
const out = {};
for (const mode of ['light', 'dark']) {
  const ctx = await browser.newContext({ colorScheme: 'light' });
  const page = await ctx.newPage();
  await page.goto(APP, { waitUntil: 'domcontentloaded' });
  await page.evaluate((m) =>
    localStorage.setItem('backendaiwebui.settings.themeMode', JSON.stringify(m)),
    mode,
  );
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  out[mode] = await page.evaluate((m) => {
    const probe = (varName, container) => {
      const host = document.createElement('div');
      host.style.cssText =
        'position:absolute;visibility:hidden;width:0;height:0';
      host.style.colorScheme = m;
      const el = document.createElement('div');
      el.style.setProperty('color', `var(${varName})`);
      host.appendChild(el);
      container.appendChild(host);
      const v = getComputedStyle(el).color;
      container.removeChild(host);
      return v;
    };
    const vars = [
      '--color-background-surface',
      '--color-background-body',
      '--color-background-popover',
      '--color-text-primary',
      '--color-border',
    ];
    const res = {};
    for (const v of vars) {
      res[`body:${v}`] = probe(v, document.body);
      res[`html:${v}`] = probe(v, document.documentElement);
      const themed = document.querySelector('#react-root [data-astryx-theme]');
      if (themed) res[`themed:${v}`] = probe(v, themed);
    }
    res.__htmlDataTheme = document.documentElement.getAttribute('data-theme');
    res.__htmlColorScheme = getComputedStyle(document.documentElement).colorScheme;
    return res;
  }, mode);
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify(out, null, 2));
