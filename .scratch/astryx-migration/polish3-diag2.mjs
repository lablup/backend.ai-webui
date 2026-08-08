// POLISH-3 probe 2 — DOM shape discovery for the settings search row, the
// Start-page card typography, and the sider scroll-column geometry.
import fs from 'node:fs';
import { launch, login, BASE } from './probe.mjs';

const OUT = '.scratch/astryx-migration/shots/polish-3';
fs.mkdirSync(OUT, { recursive: true });
const TAG = process.env.TAG ?? 'before';

const { browser, page } = await launch();
page.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 300)));
await login(page);
const out = {};

// -------- settings ---------------------------------------------------------
await page.goto(`${BASE}usersettings`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(9000);
out.settings = await page.evaluate(() => {
  const r = (el) => {
    if (!el) return null;
    const b = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return {
      tag: el.tagName.toLowerCase(),
      cls: String(el.className).slice(0, 90),
      x: +b.x.toFixed(2),
      w: +b.width.toFixed(2),
      h: +b.height.toFixed(2),
      display: cs.display,
      flexGrow: cs.flexGrow,
      flexShrink: cs.flexShrink,
      flexBasis: cs.flexBasis,
      width: cs.width,
      minWidth: cs.minWidth,
    };
  };
  const inp = document.querySelector('input[placeholder]');
  const chain = [];
  let el = inp;
  for (let i = 0; el && i < 7; i++) {
    chain.push(r(el));
    el = el.parentElement;
  }
  const row = chain.find((c) => c && /astryx-flex|bai-flex/.test(c.cls));
  return {
    inputPlaceholder: inp?.getAttribute('placeholder'),
    chain,
    rowChildren: (() => {
      let e = inp;
      while (e && !/x78zum5/.test(String(e.className)) === false) break;
      return null;
    })(),
  };
});
await page.screenshot({ path: `${OUT}/${TAG}-settings-full.png`, fullPage: false });

// -------- start page cards -------------------------------------------------
await page.goto(`${BASE}start`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(7000);
out.start = await page.evaluate(() => {
  const pick = (el) => {
    const cs = getComputedStyle(el);
    const b = el.getBoundingClientRect();
    return {
      text: (el.textContent || '').trim().slice(0, 34),
      tag: el.tagName.toLowerCase(),
      cls: String(el.className).slice(0, 70),
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      lineHeight: cs.lineHeight,
      color: cs.color,
      h: +b.height.toFixed(2),
    };
  };
  // The board lives in the main content column; exclude the sider entirely.
  const main = document.querySelector('main') ??
    document.querySelector('.bai-webui-content') ??
    document.body;
  const nodes = [...main.querySelectorAll('.astryx-text,.astryx-heading,.astryx-button,button')]
    .filter((el) => !el.closest('.bai-sider-shell'))
    .slice(0, 45)
    .map(pick);
  return { mainCls: String(main.className).slice(0, 60), nodes };
});
await page.screenshot({ path: `${OUT}/${TAG}-start-full.png` });

fs.writeFileSync(`${OUT}/${TAG}-diag2.json`, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2).slice(0, 14000));
await browser.close();
