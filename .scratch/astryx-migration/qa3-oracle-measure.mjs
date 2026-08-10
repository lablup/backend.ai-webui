// Measure the antd 6.5.0 legacy login oracle with the same probe shape.
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const DARK = process.env.DARK === '1';
const BASE = `http://127.0.0.1:6055/${DARK ? '?dark=1' : ''}`;
const OUT = process.env.OUT ?? '/tmp/oracle-light.json';
const SHOT = process.env.SHOT;

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  colorScheme: DARK ? 'dark' : 'light',
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();
await page.goto(BASE, { waitUntil: 'networkidle' });
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
  const content = q('.ant-modal-content') ?? q('.ant-modal-container');
  const modal = q('.ant-modal');
  const header = q('.ant-modal-header');
  const body = q('.ant-modal-body');
  const logo = q('.ant-modal img');
  const form = q('.ant-modal form');
  const inputs = [...document.querySelectorAll('.ant-modal input')];
  const loginBtn = [...document.querySelectorAll('.ant-modal button')].find((b) =>
    /login/i.test(b.textContent ?? ''),
  );
  const advLink = q('.ant-typography');
  const out = {
    modal: r(modal),
    content: r(content),
    header: r(header),
    body: r(body),
    logo: r(logo),
    form: r(form),
    inputs: inputs.map((i) => ({ ph: i.placeholder, ...r(i) })),
    inputBoxes: inputs.map((i) => ({
      ph: i.placeholder,
      ...r(i.closest('.ant-input-affix-wrapper') ?? i.closest('.ant-input') ?? i),
    })),
    formItems: [...(form?.children ?? [])].map((c) => ({
      cls: String(c.className).slice(0, 40),
      ...r(c),
    })),
    loginBtn: r(loginBtn),
    advLink: r(advLink),
    token: window.__antdToken,
  };
  const rows = out.formItems.filter((f) => f.h > 0);
  out.rowGaps = rows.slice(1).map((f, i) => +(f.y - (rows[i].y + rows[i].h)).toFixed(1));
  return out;
});

fs.writeFileSync(OUT, JSON.stringify(data, null, 1));
console.log(JSON.stringify({ ...data, token: undefined }, null, 1));
if (SHOT) await page.screenshot({ path: SHOT });
await browser.close();
