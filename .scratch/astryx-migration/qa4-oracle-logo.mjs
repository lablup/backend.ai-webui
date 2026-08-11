// Q-4: measure the LEGACY (antd 6.5.0 oracle) login header logo alignment.
// The oracle mirrors `origin/main`'s LoginFormPanel title markup + BAIModal's
// styles.header, so the question "was the logo centred or left-aligned?" is
// settled by rendering it rather than by reading `textAlign: center`.
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const DARK = process.env.DARK === '1';
const PORT = process.env.PORT ?? '6061';
const BASE = `http://127.0.0.1:${PORT}/${DARK ? '?dark=1' : ''}`;
const OUT = process.env.OUT ?? '/tmp/qa4-oracle-light.json';
const SHOT = process.env.SHOT;

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  colorScheme: DARK ? 'dark' : 'light',
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(String(e)));
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);

const data = await page.evaluate(() => {
  const r = (el) => {
    if (!el) return null;
    const b = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return {
      x: +b.x.toFixed(1),
      y: +b.y.toFixed(1),
      w: +b.width.toFixed(1),
      h: +b.height.toFixed(1),
      display: s.display,
      pad: s.padding,
      textAlign: s.textAlign,
      justifyContent: s.justifyContent,
      flex: s.flex,
      width: s.width,
    };
  };
  const q = (sel) => document.querySelector(sel);
  const dialog = q('.ant-modal-content') ?? q('.ant-modal');
  const header = q('.ant-modal-header');
  const title = q('.ant-modal-title');
  const titleInner = title?.firstElementChild ?? null;
  const logo = q('.ant-modal img');
  const form = q('.ant-modal form');
  const d = r(dialog);
  const l = r(logo);
  return {
    dialog: d,
    header: r(header),
    title: r(title),
    titleInner: r(titleInner),
    logo: l,
    form: r(form),
    // the numbers that answer the report
    logoXFromDialogLeft: d && l ? +(l.x - d.x).toFixed(1) : null,
    logoRightGap: d && l ? +(d.x + d.w - (l.x + l.w)).toFixed(1) : null,
    logoYFromDialogTop: d && l ? +(l.y - d.y).toFixed(1) : null,
    centred: d && l ? Math.abs(l.x - d.x - (d.x + d.w - (l.x + l.w))) < 2 : null,
  };
});

data.pageErrors = pageErrors;
fs.writeFileSync(OUT, JSON.stringify(data, null, 1));
console.log(JSON.stringify(data, null, 1));
if (SHOT) await page.screenshot({ path: SHOT });
await browser.close();
