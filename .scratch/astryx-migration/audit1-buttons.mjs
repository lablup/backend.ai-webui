/** audit-1 — measure the button variant palette in both modes. */
import { chromium } from '@playwright/test';

const BASE = process.env.BASE ?? 'http://127.0.0.1:5950/';
const b = await chromium.launch();
for (const mode of ['light', 'dark']) {
  const c = await b.newContext({
    viewport: { width: 1600, height: 1000 },
    colorScheme: mode,
  });
  const p = await c.newPage();
  p.setDefaultNavigationTimeout(120000);
  await p.goto(BASE, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(16000);
  if (mode === 'dark') {
    const t = p.getByRole('button', { name: /^dark mode$/i }).first();
    if (await t.count()) {
      await t.click();
      await p.waitForTimeout(2500);
    }
  }
  const r = await p.evaluate(() => {
    const probe = document.createElement('div');
    probe.style.cssText = 'position:fixed;left:-9999px;top:0';
    probe.innerHTML =
      '<button class="astryx-button destructive md">X</button>' +
      '<button class="astryx-button primary md">Y</button>' +
      '<button class="astryx-button secondary md">Z</button>';
    document.body.appendChild(probe);
    const m = (s) => {
      const e = probe.querySelector(s);
      const cs = getComputedStyle(e);
      return `bg ${cs.backgroundColor} / text ${cs.color} / border ${cs.borderTopWidth} ${cs.borderTopColor} / h ${Math.round(e.getBoundingClientRect().height)}`;
    };
    const out = {
      theme: document.documentElement.dataset.theme,
      destructive: m('.destructive'),
      primary: m('.primary'),
      secondary: m('.secondary'),
      errorToken: getComputedStyle(document.documentElement)
        .getPropertyValue('--color-error')
        .trim(),
      errorMuted: getComputedStyle(document.documentElement)
        .getPropertyValue('--color-error-muted')
        .trim(),
    };
    probe.remove();
    return out;
  });
  console.log(mode, JSON.stringify(r, null, 1));
  await c.close();
}
await b.close();
