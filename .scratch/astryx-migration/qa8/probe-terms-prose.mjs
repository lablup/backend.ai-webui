/**
 * qa8 Q-22 — the Terms of Service / Privacy Policy prose.
 *
 * Astryx's `reset.css` zeroes heading/paragraph margins and strips list markers
 * and padding. That is correct for a component library and nothing legacy did
 * (`origin/main` imported no reset; antd's base rules were scoped to
 * `[class^="ant-"]`, so the UA stylesheet was the whole type ramp here).
 * Measure the block rhythm and list semantics of the injected document.
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE =
  process.env.BASE ?? 'https://to-astryx.backend-ai-webui.localhost:1357/';
const ROOT = process.env.ROOT ?? '.scratch/astryx-migration/qa8';
const TAG = process.env.TAG ?? 'after';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  ignoreHTTPSErrors: true,
  storageState: `${ROOT}/state.json`,
});
const page = await ctx.newPage();
page.setDefaultNavigationTimeout(180000);
page.setDefaultTimeout(25000);
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(e.message));

await page.goto(`${BASE}session`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(10000);

const result = {};
for (const name of ['Terms of Service', 'Privacy Policy']) {
  const link = page.getByText(new RegExp(name, 'i')).first();
  if (!(await link.count())) {
    result[name] = { error: 'link not found' };
    continue;
  }
  await link.click().catch(() => {});
  await page.waitForTimeout(4000);
  result[name] = await page.evaluate(() => {
    const host = document.querySelector('dialog[open] .bai-document-prose');
    if (!host) return { error: 'prose host not found' };
    const grab = (sel) => {
      const el = host.querySelector(sel);
      if (!el) return null;
      const c = getComputedStyle(el);
      return {
        fontSize: c.fontSize,
        fontWeight: c.fontWeight,
        marginTop: c.marginTop,
        marginBottom: c.marginBottom,
        listStyleType: c.listStyleType,
        paddingInlineStart: c.paddingInlineStart,
        color: c.color,
        textDecorationLine: c.textDecorationLine,
      };
    };
    return {
      counts: {
        h1: host.querySelectorAll('h1').length,
        h2: host.querySelectorAll('h2').length,
        h3: host.querySelectorAll('h3').length,
        p: host.querySelectorAll('p').length,
        li: host.querySelectorAll('li').length,
        a: host.querySelectorAll('a').length,
      },
      h1: grab('h1'),
      h2: grab('h2'),
      p: grab('p'),
      ol: grab('ol'),
      ul: grab('ul'),
      li: grab('li'),
      a: grab('a'),
    };
  });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1200);
}

result.pageErrors = pageErrors;
fs.writeFileSync(
  `${ROOT}/${TAG}-terms-prose.json`,
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result, null, 2));
await browser.close();
