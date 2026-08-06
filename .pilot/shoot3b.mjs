// PILOT PHASE 3b / ticket 13 — nested (admin) Theme measurement.
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const OUT = new URL('./shots/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const errors = [];

for (const mode of ['light', 'dark']) {
  const page = await browser.newPage({
    viewport: { width: 1300, height: 900 },
    colorScheme: mode,
  });
  page.on('pageerror', (e) => errors.push(`[${mode}] pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`[${mode}] console: ${m.text()}`);
  });

  await page.goto('http://127.0.0.1:5311/phase3b.html' + (process.env.FORCE ? `?force=${process.env.FORCE}` : '?x=1') + (process.env.INHERIT ? '&inherit=1' : '') + '', {
    waitUntil: 'networkidle',
  });
  await page.waitForTimeout(1200);

  const measured = await page.evaluate(() => {
    const read = (tag) => {
      const el = document.querySelector(`[data-probe="${tag}"]`);
      if (!el) return { tag, missing: true };
      const btn = el.querySelector('button');
      const sw = el.querySelector('.astryx-switch');
      const ind = el.querySelector('[class*="tab-indicator"]');
      return {
        tag,
        accent: getComputedStyle(el).getPropertyValue('--color-accent').trim(),
        btnBg: btn ? getComputedStyle(btn).backgroundColor : null,
        swBg: sw ? getComputedStyle(sw).backgroundColor : null,
        indBg: ind ? getComputedStyle(ind).backgroundColor : null,
        // What did the nested Theme actually resolve color-scheme to?
        colorScheme: getComputedStyle(el).colorScheme,
      };
    };
    // Question 3/4: what got injected, and where is it scoped?
    const styles = Array.from(document.querySelectorAll('style'));
    const astryxStyles = styles
      .map((s) => ({
        id: s.id || null,
        dataAttrs: Object.fromEntries(
          Array.from(s.attributes)
            .filter((a) => a.name.startsWith('data-'))
            .map((a) => [a.name, a.value]),
        ),
        bytes: (s.textContent ?? '').length,
        head: (s.textContent ?? '').slice(0, 220),
      }))
      .filter((s) => /--color-accent|astryx/.test(s.head) || s.id?.includes('astryx'));

    const htmlAttrs = {
      dataTheme: document.documentElement.getAttribute('data-theme'),
      dataAstryxTheme: document.documentElement.getAttribute('data-astryx-theme'),
      rootColorScheme: getComputedStyle(document.documentElement).colorScheme,
    };

    // Which element carries the nested theme attribute?
    const nestedHost = document.querySelector('[data-probe="nested-admin"]');
    let ancestorWithTheme = null;
    for (let el = nestedHost; el; el = el.parentElement) {
      if (el.hasAttribute?.('data-astryx-theme')) {
        ancestorWithTheme = {
          tag: el.tagName,
          value: el.getAttribute('data-astryx-theme'),
          isRootHtml: el === document.documentElement,
        };
        break;
      }
    }

    return {
      outerBefore: read('outer-before'),
      nestedAdmin: read('nested-admin'),
      outerAfter: read('outer-after'),
      htmlAttrs,
      ancestorWithTheme,
      styleCount: astryxStyles.length,
      totalStyleTags: styles.length,
      astryxStyles: astryxStyles.map((s) => ({
        id: s.id,
        dataAttrs: s.dataAttrs,
        bytes: s.bytes,
      })),
    };
  });

  console.log(`\n=== ${mode} ===`);
  console.log(JSON.stringify(measured, null, 2));

  await page.screenshot({ path: `${OUT}pilot3b-${mode}.png`, fullPage: true });
  await page.close();
}

await browser.close();
console.log('\n---');
console.log(errors.length ? errors.slice(0, 10).join('\n') : 'no console/page errors');
