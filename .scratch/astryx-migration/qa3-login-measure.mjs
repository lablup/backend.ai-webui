// Bug 1: measure every box on the login screen.
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE = process.env.BAI_BASE ?? 'http://127.0.0.1:6052/';
const DARK = process.env.DARK === '1';
const OUT = process.env.OUT ?? '/tmp/login-measure.json';
const SHOT = process.env.SHOT;

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  colorScheme: DARK ? 'dark' : 'light',
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(8000);

// The login screen carries no theme toggle; `themeMode` defaults to 'system',
// so the context's colorScheme IS the shipped path into dark mode here.
{
  const t = await page.evaluate(() => document.documentElement.dataset.theme);
  if (t !== (DARK ? 'dark' : 'light'))
    throw new Error(`unexpected theme: ${t} (wanted ${DARK ? 'dark' : 'light'})`);
}

// Make sure the endpoint row is visible.
if (!(await page.locator('input[placeholder="Endpoint"]').count())) {
  const adv = page.getByRole('link', { name: /advanced/i }).first();
  if (await adv.count()) {
    await adv.click();
    await page.waitForTimeout(500);
  }
}

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
      pad: s.padding,
      margin: s.margin,
      radius: s.borderRadius,
      font: `${s.fontSize}/${s.lineHeight}`,
      color: s.color,
      bg: s.backgroundColor,
      border: s.border,
      shadow: s.boxShadow.slice(0, 80),
    };
  };
  const q = (sel) => document.querySelector(sel);
  const dialog = q('dialog.astryx-dialog') ?? q('.ant-modal');
  const logo = dialog?.querySelector('img');
  const form = dialog?.querySelector('form');
  const inputs = [...(dialog?.querySelectorAll('input') ?? [])];
  const loginBtn = [...(dialog?.querySelectorAll('button') ?? [])].find((b) =>
    /login/i.test(b.textContent ?? ''),
  );
  const advLink = [...(dialog?.querySelectorAll('a') ?? [])].find((a) =>
    /advanced/i.test(a.textContent ?? ''),
  );
  const out = {
    dialog: r(dialog),
    dialogChildren: [...(dialog?.children ?? [])].map((c) => ({
      cls: String(c.className).slice(0, 50),
      ...r(c),
    })),
    logo: r(logo),
    form: r(form),
    inputs: inputs.map((i) => ({ ph: i.placeholder, ...r(i) })),
    // The visible bordered box around each input
    inputBoxes: inputs.map((i) => ({
      ph: i.placeholder,
      ...r(i.closest('.astryx-text-input') ?? i.closest('.ant-input-affix-wrapper') ?? i.parentElement),
    })),
    // Form item wrappers
    formItems: [...(form?.children ?? [])].map((c) => ({
      cls: String(c.className).slice(0, 40),
      ...r(c),
    })),
    loginBtn: r(loginBtn),
    advLink: r(advLink),
  };
  // Vertical gaps between successive form rows
  const rows = out.formItems.filter((f) => f.h > 0);
  out.rowGaps = rows.slice(1).map((f, i) => +(f.y - (rows[i].y + rows[i].h)).toFixed(1));
  return out;
});

data.pageErrors = errors;
fs.writeFileSync(OUT, JSON.stringify(data, null, 1));
console.log(JSON.stringify(data, null, 1));
if (SHOT) {
  fs.mkdirSync(SHOT.replace(/\/[^/]+$/, ''), { recursive: true });
  await page.screenshot({ path: SHOT });
}
await browser.close();
