/** qa8 IMPL — recon: WHY the app-launcher <img> is still 16 wide at 36 tall. */
import { BASE, launch, settle } from './probe-impl-session-lib.mjs';

const { browser, page } = await launch();
let landed = false;
for (const route of ['/session', '/admin-session']) {
  await page.goto(new URL(route, BASE).toString(), { waitUntil: 'domcontentloaded' });
  landed = await page
    .waitForSelector('table tbody tr', { timeout: 90000 })
    .then(() => true)
    .catch(() => false);
  if (landed) break;
}
await settle(page);
await page.waitForTimeout(1500);

const btns = page.getByRole('button', { name: /see app dialog/i });
const n = await btns.count();
for (let i = 0; i < n; i++) {
  const b = btns.nth(i);
  if (await b.isDisabled().catch(() => true)) continue;
  await b.click();
  break;
}
await page.waitForTimeout(4000);

console.log(
  JSON.stringify(
    await page.evaluate(() => {
      const dlg =
        document.querySelector('dialog[open]') ??
        document.querySelector('[role="dialog"]');
      const img = dlg?.querySelector('img');
      if (!img) return { error: 'no img' };
      const chain = [];
      let el = img;
      for (let i = 0; i < 5 && el; i++) {
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        chain.push({
          tag: el.tagName,
          cls: String(el.className).slice(0, 60),
          rect: [+r.width.toFixed(2), +r.height.toFixed(2)],
          display: cs.display,
          width: cs.width,
          height: cs.height,
          maxWidth: cs.maxWidth,
          maxHeight: cs.maxHeight,
          minWidth: cs.minWidth,
          flex: cs.flex,
          flexShrink: cs.flexShrink,
          aspectRatio: cs.aspectRatio,
          overflow: cs.overflow,
          alignItems: cs.alignItems,
          justifyContent: cs.justifyContent,
          padding: cs.padding,
          boxSizing: cs.boxSizing,
        });
        el = el.parentElement;
      }
      // which rule wins for width on the <img>?
      const rules = [];
      for (const sheet of Array.from(document.styleSheets)) {
        let cssRules;
        try {
          cssRules = sheet.cssRules;
        } catch {
          continue;
        }
        for (const rule of Array.from(cssRules ?? [])) {
          if (!rule.selectorText || !rule.style) continue;
          if (
            !/(^|,|\s)(img|svg|\*)\b/.test(rule.selectorText) &&
            !/img/.test(rule.selectorText)
          )
            continue;
          const w = rule.style.getPropertyValue('max-width');
          const w2 = rule.style.getPropertyValue('width');
          if (w || w2)
            rules.push({
              sel: rule.selectorText.slice(0, 90),
              maxWidth: w,
              width: w2,
            });
        }
      }
      return { chain, imgRules: rules.slice(0, 20) };
    }),
    null,
    1,
  ),
);
await browser.close();
