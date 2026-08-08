// Portal / overlay dark-mode proof against the running app: open an
// app-shim toast AND an app-shim modal on the login screen, then measure the
// surfaces they portal into.
// Usage: node probe-overlays.mjs <tag>
import { chromium } from '@playwright/test';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const outDir = dirname(fileURLToPath(import.meta.url));
const APP = process.env.APP_URL ?? 'http://127.0.0.1:4435/';
const tag = process.argv[2] ?? 'after';

const browser = await chromium.launch();
const report = {};
for (const mode of ['light', 'dark']) {
  const ctx = await browser.newContext({
    colorScheme: mode === 'dark' ? 'light' : 'dark', // OS deliberately OPPOSITE
    viewport: { width: 1440, height: 900 },
  });
  const page = await ctx.newPage();
  await page.goto(APP, { waitUntil: 'domcontentloaded' });
  await page.evaluate(
    (m) =>
      localStorage.setItem(
        'backendaiwebui.settings.themeMode',
        JSON.stringify(m),
      ),
    mode,
  );
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  await page.evaluate(() => {
    const shim = window.__baiAppShim;
    shim?.message?.success('Dark-mode portal probe — toast');
    shim?.modal?.confirm({
      title: 'Dark-mode portal probe',
      content: 'This dialog is rendered by the app-shim modal host.',
    });
  });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: join(outDir, `${tag}-overlays-${mode}.png`) });

  report[mode] = await page.evaluate(() => {
    const lum = (rgb) => {
      const m = rgb.match(/[\d.]+/g);
      if (!m) return null;
      const [r, g, b, a = '1'] = m.map(Number);
      if (Number(a) === 0) return null;
      return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    };
    const pick = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const cs = getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        color: cs.color,
        colorScheme: cs.colorScheme,
        luminance: lum(cs.backgroundColor),
        spacing4: cs.getPropertyValue('--spacing-4').trim(),
        surface: cs.getPropertyValue('--color-background-surface').trim(),
      };
    };
    return {
      htmlDataTheme: document.documentElement.getAttribute('data-theme'),
      toast: pick('[class*="astryx-toast"]') ?? pick('[role="status"]'),
      dialog:
        pick('dialog[open]') ??
        pick('[role="alertdialog"]') ??
        pick('[role="dialog"]'),
      bodyChildren: Array.from(document.body.children).map((el) => ({
        tag: el.tagName.toLowerCase(),
        cls: String(el.className).slice(0, 60),
        colorScheme: getComputedStyle(el).colorScheme,
        spacing4: getComputedStyle(el).getPropertyValue('--spacing-4').trim(),
        surface: getComputedStyle(el)
          .getPropertyValue('--color-background-surface')
          .trim(),
      })),
    };
  });
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify(report, null, 2));
