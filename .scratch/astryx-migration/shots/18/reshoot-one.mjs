import { chromium } from '@playwright/test';
const [, , query = 'case=revision&theme=light', out = '/tmp/reshoot.png'] =
  process.argv;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 1400 } });
await p.goto(`http://127.0.0.1:5645/theme-probe/deployments.html?${query}`, {
  waitUntil: 'networkidle',
});
await p.waitForTimeout(2500);
await p.screenshot({ path: out, fullPage: true });
console.log('saved', out);
await b.close();
