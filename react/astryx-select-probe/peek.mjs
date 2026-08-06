import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await b.newPage();
await p.goto('http://localhost:5199/', { waitUntil: 'networkidle' });
await p.waitForTimeout(800);
console.log(
  await p.evaluate(() => {
    const el = document.querySelector('[data-testid="antd-500"]');
    return el ? el.innerHTML.slice(0, 900) : 'MISSING';
  }),
);
await b.close();
