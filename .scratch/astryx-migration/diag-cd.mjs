/**
 * Diagnostic for sweep defects C (session-launcher footer buttons) and
 * D (admin → Configurations boolean rows). Dumps DOM shape + computed styles.
 */
import { chromium } from '@playwright/test';
import { BASE, login } from './probe.mjs';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
});
const page = await ctx.newPage();
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await login(page);
const projectSeg = new URL(page.url()).pathname
  .split('/')
  .slice(0, 3)
  .join('/');
const go = async (r, sel) => {
  await page.goto(`${BASE.replace(/\/$/, '')}${projectSeg}/${r}`, {
    waitUntil: 'domcontentloaded',
  });
  await page
    .locator(sel)
    .first()
    .waitFor({ state: 'visible', timeout: 60000 })
    .catch(() => console.log('timeout', sel));
  await page.waitForTimeout(4000);
};

/* ---- C ---- */
await go('session/start', '[data-test-id="neo-session-launcher-tour-step-navigation"]');
console.log(
  '\n=== C: launcher footer ===\n',
  JSON.stringify(
    await page.evaluate(() => {
      const nav = document.querySelector(
        '[data-test-id="neo-session-launcher-tour-step-navigation"]',
      );
      if (!nav) return 'nav not found';
      return [...nav.querySelectorAll('button')].map((b) => {
        const cs = getComputedStyle(b);
        const r = b.getBoundingClientRect();
        return {
          text: b.textContent.trim(),
          cls: b.className,
          html: b.innerHTML.slice(0, 300),
          box: `${Math.round(r.width)}x${Math.round(r.height)}`,
          bg: cs.backgroundColor,
          bgImage: cs.backgroundImage.slice(0, 80),
          color: cs.color,
          flexWrap: cs.flexWrap,
          whiteSpace: cs.whiteSpace,
        };
      });
    }),
    null,
    2,
  ),
);

/* ---- D ---- */
await go('settings', 'input[type="checkbox"]');
console.log(
  '\n=== D: configurations boolean rows ===\n',
  JSON.stringify(
    await page.evaluate(() => {
      const inputs = [...document.querySelectorAll('input[type="checkbox"]')];
      return inputs.slice(0, 4).map((el) => {
        const label = el.closest('label') ?? el.parentElement;
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        // the visual box is usually a sibling span
        const sib = label
          ? [...label.querySelectorAll('*')].map((n) => ({
              tag: n.tagName,
              cls: (n.className || '').toString().slice(0, 70),
              box: (() => {
                const b = n.getBoundingClientRect();
                return `${Math.round(b.width)}x${Math.round(b.height)}`;
              })(),
              bg: getComputedStyle(n).backgroundColor,
              border: getComputedStyle(n).border,
              radius: getComputedStyle(n).borderRadius,
            }))
          : null;
        return {
          checked: el.checked,
          disabled: el.disabled,
          inputBox: `${Math.round(r.width)}x${Math.round(r.height)}`,
          inputOpacity: cs.opacity,
          inputAppearance: cs.appearance,
          labelCls: (label?.className || '').toString().slice(0, 80),
          labelHtml: (label?.outerHTML || '').slice(0, 500),
          descendants: sib,
        };
      });
    }),
    null,
    2,
  ),
);

await page.screenshot({
  path: '.scratch/astryx-migration/shots/sweep-fixes/diag-config-checkbox.png',
});
await browser.close();
