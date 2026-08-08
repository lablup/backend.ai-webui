import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('http://127.0.0.1:5707/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(4000);
const out = await page.evaluate(() => {
  const links = Array.from(document.querySelectorAll('a')).map((a) => ({
    text: (a.textContent || '').trim().slice(0, 30),
    display: getComputedStyle(a).display,
    inlineStyle: a.getAttribute('style'),
  }));
  return links;
});
console.log(JSON.stringify(out, null, 2));
await browser.close();
