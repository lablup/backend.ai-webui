/**
 * qa8 modal group — item (C) "약관, 개인정보 보호 모달 쪽 텍스트 스타일이 다
 * 깨지네요".
 *
 * `TermsOfServiceModal.tsx` / `PrivacyPolicyModal.tsx` inject
 * `resources/documents/{terms-of-service,privacy-policy}.{en,ko}.html` with
 * `dangerouslySetInnerHTML` — raw <h1>/<h2>/<h3>/<p>/<ol>/<ul>/<li>/<a>, no
 * class names, no component wrapper. Under `origin/main` NOTHING styled them:
 * `git grep reset.css origin/main` is empty and antd's cssinjs base rules are
 * scoped to `[class^="ant-"]`, so the browser's UA stylesheet was the whole
 * type ramp. `to-astryx` adds `@astryxdesign/core/reset.css`
 * (`react/src/index.css:15`), whose `@layer reset` zeroes exactly those
 * elements.
 *
 * This probe measures the LIVE modal's prose, then the SAME markup rendered in
 * a bare document (= the UA defaults = the legacy oracle), and diffs them.
 *
 * Usage: node .scratch/astryx-migration/qa8/probe-modal-terms.mjs
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE =
  process.env.BASE ?? 'https://to-astryx.backend-ai-webui.localhost:1357/';
const ROOT = process.env.ROOT ?? '.scratch/astryx-migration/qa8';
const TAG = process.env.TAG ?? 'before';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  ignoreHTTPSErrors: true,
  storageState: `${ROOT}/state.json`,
});
const page = await ctx.newPage();
page.setDefaultNavigationTimeout(180000);
page.setDefaultTimeout(20000);
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(e.message));

async function setMode(mode) {
  await page.evaluate((m) => {
    const want = m === 'dark';
    if ((document.documentElement.dataset.theme === 'dark') === want) return;
    const b = Array.from(document.querySelectorAll('button')).find((x) =>
      /dark|theme|mode/i.test(x.getAttribute('aria-label') || x.title || ''),
    );
    if (b) b.click();
  }, mode);
  await page.waitForTimeout(2000);
  const applied = await page.evaluate(
    () => document.documentElement.dataset.theme ?? null,
  );
  if (applied !== mode) throw new Error(`theme toggle did not take: ${applied}`);
  return applied;
}

/** The properties that decide whether legal prose reads as prose. */
const PROBE_FN = (scopeSel) => {
  const scope = scopeSel ? document.querySelector(scopeSel) : document.body;
  if (!scope) return { error: 'scope not found' };
  const px = (s) => (s ? +parseFloat(s).toFixed(1) : null);
  const read = (sel) => {
    const el = scope.querySelector(sel);
    if (!el) return null;
    const c = getComputedStyle(el);
    return {
      fontSize: px(c.fontSize),
      fontWeight: c.fontWeight,
      lineHeight: c.lineHeight,
      marginTop: px(c.marginTop),
      marginBottom: px(c.marginBottom),
      paddingInlineStart: px(c.paddingInlineStart),
      listStyleType: c.listStyleType,
      display: c.display,
      color: c.color,
      textDecorationLine: c.textDecorationLine,
    };
  };
  return {
    h1: read('h1'),
    h2: read('h2'),
    h3: read('h3'),
    p: read('p'),
    ol: read('ol'),
    ul: read('ul'),
    li: read('li'),
    a: read('a'),
    counts: {
      h1: scope.querySelectorAll('h1').length,
      h2: scope.querySelectorAll('h2').length,
      h3: scope.querySelectorAll('h3').length,
      p: scope.querySelectorAll('p').length,
      li: scope.querySelectorAll('li').length,
      a: scope.querySelectorAll('a').length,
    },
  };
};

const result = { viewport: { w: 1600, h: 1000 } };

for (const mode of ['light', 'dark']) {
  const bucket = (result[mode] = {});
  await page.goto(`${BASE}session`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(11000);
  bucket.appliedTheme = await setMode(mode);

  for (const [name, testid] of [
    ['terms', 'button-terms-of-service'],
    ['privacy', 'button-privacy-policy'],
  ]) {
    try {
      await page.locator(`[data-testid="${testid}"]`).click();
      await page.waitForTimeout(3000);
      // The prose lives in the div the modal body's dangerouslySetInnerHTML
      // produced; scope to the open dialog and skip the DialogHeader <h2>.
      bucket[name] = await page.evaluate((fnBody) => {
        // eslint-disable-next-line no-new-func
        const fn = new Function('scopeSel', `return (${fnBody})(scopeSel)`);
        const dlg = document.querySelector('dialog[open]');
        if (!dlg) return { error: 'no dialog' };
        // give the prose container a temporary id so the shared reader can
        // scope to it (the header's h2 must not be sampled)
        // The injected HTML's own container: the <h1>'s parent. Using "first
        // div holding an h1 and a p" would pick Dialog's inner wrapper, which
        // ALSO contains the DialogHeader's <h2> and would sample that instead
        // of the document's section headings.
        const prose = dlg.querySelector('h1')?.parentElement ?? dlg;
        prose.id = prose.id || 'qa8-prose-scope';
        return fn('#' + prose.id);
      }, PROBE_FN.toString());

      await page
        .locator('dialog[open]')
        .first()
        .screenshot({ path: `${ROOT}/${TAG}-terms-${name}-${mode}.png` })
        .catch(() => {});
      await page.keyboard.press('Escape');
      await page.waitForTimeout(700);
    } catch (e) {
      bucket[name] = { error: String(e).split('\n')[0] };
      await page.keyboard.press('Escape').catch(() => {});
      await page.waitForTimeout(500);
    }
  }
}

// ------------------------------------------------------------ legacy oracle
// The SAME document, rendered with no stylesheet at all. `origin/main` shipped
// no CSS reset (`git grep reset.css origin/main` -> empty) and antd's base
// rules are scoped to `[class^="ant-"]`, so this IS what the legacy modal
// rendered.
const oraclePage = await ctx.newPage();
const html = await page.evaluate(async () => {
  const r = await fetch('/resources/documents/terms-of-service.en.html');
  return r.text();
});
await oraclePage.setContent(
  `<!doctype html><html><body><div id="prose">${html}</div></body></html>`,
);
await oraclePage.waitForTimeout(300);
result.legacyUaOracle = await oraclePage.evaluate((fnBody) => {
  // eslint-disable-next-line no-new-func
  const fn = new Function('scopeSel', `return (${fnBody})(scopeSel)`);
  return fn('#prose');
}, PROBE_FN.toString());

result.pageErrors = pageErrors;
fs.writeFileSync(
  `${ROOT}/${TAG}-modal-terms.json`,
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result, null, 2));
await browser.close();
