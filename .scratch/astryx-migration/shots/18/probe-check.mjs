import { chromium } from '@playwright/test';
const target = process.argv[2] ?? 'case=revision&theme=light';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
p.on('console', (m) => console.log('[console]', m.type(), m.text().slice(0, 300)));
p.on('pageerror', (e) => console.log('[pageerror]', e.message.slice(0, 500)));
await p.goto(`http://127.0.0.1:5645/theme-probe/deployments.html?${target}`, {
  waitUntil: 'networkidle',
});
await p.waitForTimeout(2000);
console.log(
  'body text head:',
  await p.evaluate(() => document.body.innerText.slice(0, 200)),
);
console.log(
  'root html len:',
  await p.evaluate(() => document.getElementById('root').innerHTML.length),
);
await b.close();
