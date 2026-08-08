// Measure the toast's *text* element (inside MediaTheme), not the shell.
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
    colorScheme: mode === 'dark' ? 'light' : 'dark',
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
  await page.evaluate(() =>
    window.__baiAppShim?.message?.success('Toast dark probe'),
  );
  await page.waitForTimeout(900);
  report[mode] = await page.evaluate(() => {
    const toast = document.querySelector('[class*="astryx-toast"]');
    if (!toast) return null;
    const media = toast.querySelector('[data-astryx-media]');
    const walk = [];
    const push = (label, el) => {
      if (!el) return;
      const cs = getComputedStyle(el);
      walk.push({
        label,
        tag: el.tagName.toLowerCase(),
        bg: cs.backgroundColor,
        color: cs.color,
        colorScheme: cs.colorScheme,
        mediaAttr: el.getAttribute?.('data-astryx-media') ?? null,
        textPrimary: cs.getPropertyValue('--color-text-primary').trim(),
      });
    };
    push('toastShell', toast);
    push('mediaTheme', media);
    // deepest text-bearing node
    const textNode = toast.querySelector(
      '[data-astryx-media] div div, [data-astryx-media] span',
    );
    push('text', textNode);
    return walk;
  });
  await page.screenshot({
    path: join(outDir, `${tag}-toast-${mode}.png`),
    clip: { x: 990, y: 790, width: 440, height: 90 },
  });
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify(report, null, 2));
