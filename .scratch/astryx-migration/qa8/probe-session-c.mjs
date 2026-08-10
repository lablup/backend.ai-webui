/**
 * qa8 SESSION (C) — SessionActionButtons control geometry + paint, both modes.
 * Call site: SessionDetailContent.tsx:371 `<SessionActionButtons size="large" compact/>`.
 */
import { launch, setMode, settle, BASE, ROOT } from './probe-session-lib.mjs';
import fs from 'node:fs';

const { browser, page, pageErrors } = await launch();
const result = {};

for (const mode of ['light', 'dark']) {
  await page.goto(`${BASE}session`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(7000);
  await settle(page);
  const applied = await setMode(page, mode);
  await page.waitForTimeout(1200);
  await settle(page);
  const m = (result[mode] = { appliedTheme: applied });

  await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tbody tr'));
    const row = rows.find((r) => /RUNNING/.test(r.textContent ?? '')) ?? rows[0];
    row?.querySelector('a, [role="link"], button')?.click();
  });
  await page.waitForTimeout(4500);
  await settle(page);

  m.group = await page.evaluate(() => {
    const groups = Array.from(document.querySelectorAll('.astryx-button-group'));
    const g =
      groups.find((x) =>
        Array.from(x.querySelectorAll('button')).some((b) =>
          /App Dialog|Terminate Session/i.test(b.getAttribute('aria-label') ?? ''),
        ),
      ) ?? groups[0];
    if (!g) return { error: 'no button group' };
    const gr = g.getBoundingClientRect();
    return {
      cls: String(g.className).slice(0, 80),
      w: +gr.width.toFixed(1),
      h: +gr.height.toFixed(1),
      x: +gr.x.toFixed(1),
      gap: getComputedStyle(g).gap,
      buttons: Array.from(g.querySelectorAll('button')).map((b) => {
        const r = b.getBoundingClientRect();
        const c = getComputedStyle(b);
        const iconSpan = b.querySelector('span[class]');
        const svg = b.querySelector('svg');
        const ir = iconSpan?.getBoundingClientRect();
        const sr = svg?.getBoundingClientRect();
        return {
          label: b.getAttribute('aria-label'),
          w: +r.width.toFixed(1),
          h: +r.height.toFixed(1),
          bg: c.backgroundColor,
          color: c.color,
          border: `${c.borderWidth} ${c.borderStyle} ${c.borderColor}`,
          boxShadow: c.boxShadow.slice(0, 60),
          fontSize: c.fontSize,
          cls: String(b.className).slice(0, 60),
          iconSlot: ir
            ? {
                w: +ir.width.toFixed(1),
                h: +ir.height.toFixed(1),
                fontSize: iconSpan ? getComputedStyle(iconSpan).fontSize : null,
              }
            : null,
          svg: sr ? { w: +sr.width.toFixed(1), h: +sr.height.toFixed(1) } : null,
        };
      }),
    };
  });

  await page.screenshot({
    path: `${ROOT}/before-actionbuttons-${mode}.png`,
    clip: { x: 1380, y: 80, width: 220, height: 60 },
  });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);
}

result.pageErrors = pageErrors;
fs.writeFileSync(`${ROOT}/before-session-c.json`, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 1));
await browser.close();
