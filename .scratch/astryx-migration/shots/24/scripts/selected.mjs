import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('http://127.0.0.1:5706/theme-probe/frame24.html?case=sider', {
  waitUntil: 'networkidle',
});
await page.waitForTimeout(800);
const out = await page.evaluate(() => {
  const items = Array.from(
    document.querySelectorAll('.astryx-side-nav-item'),
  ).map((el) => ({
    text: el.textContent,
    selected: el.getAttribute('data-selected'),
    ariaCurrent: el.getAttribute('aria-current'),
    bg: getComputedStyle(el).backgroundColor,
  }));
  return items;
});
console.log(JSON.stringify(out, null, 2));
await browser.close();
