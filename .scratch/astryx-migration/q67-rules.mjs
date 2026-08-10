/**
 * Q-6/Q-7 — enumerate every CSS rule that matches the selected sider nav item
 * and the card tab, with its layer, so the winning declaration is identified.
 */
import { chromium } from '@playwright/test';

const BASE = process.env.BASE ?? 'http://127.0.0.1:6090/';
const ROOT = process.env.ROOT;
const STATE = process.env.STATE ?? 'q67-prod-state.json';
const PATH_ = process.env.PATH_ ?? 'session';
const PROPS = (process.env.PROPS ?? 'border-radius,border-top-left-radius').split(',');
const SEL = process.env.SEL ?? '.astryx-side-nav-item';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  storageState: `${ROOT}/${STATE}`,
});
const page = await ctx.newPage();
page.setDefaultNavigationTimeout(180000);
await page.goto(`${BASE}${PATH_}`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(16000);

const out = await page.evaluate(
  ({ SEL, PROPS }) => {
    const el = document.querySelector(SEL);
    if (!el) return { error: 'no element for ' + SEL };
    const hits = [];
    const walk = (rules, layer, sheetHref) => {
      for (const r of rules) {
        if (r.type === CSSRule.STYLE_RULE) {
          let matches = false;
          try {
            matches = el.matches(r.selectorText);
          } catch {
            matches = false;
          }
          if (!matches) continue;
          for (const p of PROPS) {
            const v = r.style.getPropertyValue(p);
            if (v)
              hits.push({
                layer,
                sheet: (sheetHref || '').split('/').pop(),
                selector: r.selectorText,
                prop: p,
                value: v,
                priority: r.style.getPropertyPriority(p),
              });
          }
        } else if (r.cssRules) {
          const nextLayer =
            r.type === CSSRule.LAYER_BLOCK_RULE || r.constructor.name === 'CSSLayerBlockRule'
              ? (layer ? layer + '>' : '') + (r.name || '(anon)')
              : layer;
          walk(r.cssRules, nextLayer, sheetHref);
        }
      }
    };
    for (const s of document.styleSheets) {
      let rules;
      try {
        rules = s.cssRules;
      } catch {
        continue;
      }
      walk(rules, '(unlayered)', s.href || 'inline');
    }
    return {
      selector: SEL,
      cls: el.className,
      computed: Object.fromEntries(
        PROPS.map((p) => [p, getComputedStyle(el).getPropertyValue(p)]),
      ),
      hits,
    };
  },
  { SEL, PROPS },
);

console.log(JSON.stringify(out, null, 2));
await browser.close();
