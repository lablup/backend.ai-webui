// Q-4: measure the LIVE login header logo alignment, same shape as
// `qa4-oracle-logo.mjs` so the two can be diffed row by row.
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const DARK = process.env.DARK === '1';
const BASE = process.env.BAI_BASE ?? 'http://127.0.0.1:6060/';
const OUT = process.env.OUT ?? `/tmp/qa4-live-login-${DARK ? 'dark' : 'light'}.json`;
const SHOT = process.env.SHOT;

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  colorScheme: DARK ? 'dark' : 'light',
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(String(e).slice(0, 300)));
// The shared test cluster keeps a live manager session, so the app skips the
// login screen entirely and lands on the dashboard. Cutting the manager off
// makes the connection check fail and the login modal render — its header
// geometry is what this probe measures and it does not depend on the backend.
await ctx.route('**://10.82.0.130:8090/**', (route) => route.abort());
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('input[placeholder="Email or Username"]', { timeout: 60000 });
await page.waitForTimeout(1500);

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
  const dialog = document.querySelector('dialog') ?? document.querySelector('.astryx-dialog');
  const logo = dialog?.querySelector('img') ?? document.querySelector('img[alt="backend.ai"]');
  const header =
    dialog?.querySelector('.astryx-dialog-header') ??
    logo?.closest('header') ??
    logo?.parentElement?.parentElement ??
    null;
  const titleWrap = logo?.parentElement ?? null;
  const form = dialog?.querySelector('form') ?? document.querySelector('form');
  const d = r(dialog);
  const l = r(logo);
  return {
    dialog: d,
    header: r(header),
    title: r(titleWrap?.parentElement ?? null),
    titleInner: r(titleWrap),
    logo: l,
    form: r(form),
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
