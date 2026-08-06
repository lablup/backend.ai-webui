import { chromium } from '/home/ubuntu/Workspace/backend.ai-webui/node_modules/@playwright/test/index.mjs';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1500, height: 1200 } });
await page.goto('http://127.0.0.1:5287/?variant=both&state=error', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
const out = await page.evaluate(() => {
  const nodes = [...document.querySelectorAll('[data-bai-form-item-explain-error]')];
  return nodes.map((n) => {
    const item = n.closest('[data-bai-form-item]');
    const label = item?.querySelector('[data-bai-form-item-label]')?.textContent;
    return { text: n.textContent, label, path: item ? item.outerHTML.slice(0, 90) : null };
  });
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
