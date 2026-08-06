import { chromium } from '/home/ubuntu/Workspace/backend.ai-webui/node_modules/@playwright/test/index.mjs';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1500, height: 1200 } });
const errs = [];
page.on('pageerror', (e) => errs.push(e.message));
page.on('console', (m) => {
  if (m.type() === 'error') errs.push(m.text());
});
await page.goto('http://127.0.0.1:5287/?variant=both&state=error', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
const out = await page.evaluate(() => ({
  baiAttrNodes: document.querySelectorAll('#bai [data-bai-form-item]').length,
  baiExplain: document.querySelectorAll('#bai [data-bai-form-item-explain-error]').length,
  antExplainInBai: document.querySelectorAll('#bai .ant-form-item-explain-error').length,
  cooldownDupe: [...document.querySelectorAll('#bai [data-bai-form-item]')]
    .filter((n) => n.textContent?.includes('cooldown'))
    .map((n) => n.outerHTML.slice(0, 400)),
}));
console.log(JSON.stringify(out, null, 1));
console.log('ERRORS:', errs.slice(0, 10));
await browser.close();
