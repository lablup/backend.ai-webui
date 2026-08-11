/** final switch — what exactly does `[class*="ant-"]` match on a live page? */
import { chromium } from '@playwright/test';

const ROOT = process.env.ROOT;
const BASE = process.env.BASE ?? 'http://127.0.0.1:6020/';
const PROJ =
  process.env.PROJ ?? 'a%ED%95%9C%EA%B5%AD%EC%96%B4%EA%B0%80%EB%8A%A5_cde';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  storageState: `${ROOT}/final-switch-state.json`,
});
const page = await ctx.newPage();
page.setDefaultNavigationTimeout(120000);
await page.goto(`${BASE}project/${PROJ}/start`, {
  waitUntil: 'domcontentloaded',
});
await page.waitForTimeout(18000);
const out = await page.evaluate(() => {
  const hits = Array.from(document.querySelectorAll('[class*="ant-"]'));
  const classes = new Set();
  hits.forEach((e) =>
    String(e.className)
      .split(/\s+/)
      .filter((c) => c.includes('ant-'))
      .forEach((c) => classes.add(c)),
  );
  return { count: hits.length, classes: [...classes].slice(0, 40) };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
