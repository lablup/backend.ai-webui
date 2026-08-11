import { launch, login } from './probe.mjs';

const { browser, page } = await launch();
const errs = [];
page.on('pageerror', (e) => errs.push(String(e.stack || e).slice(0, 900)));
await login(page);
const url = new URL(page.url());
const projectSeg = url.pathname.split('/').slice(0, 3).join('/');
await page.goto(`http://127.0.0.1:4500${projectSeg}/data`, {
  waitUntil: 'domcontentloaded',
});
await page.waitForTimeout(7000);
console.log('ERRORS:\n', errs.join('\n---\n') || '(none)');
await page.screenshot({ path: '.scratch/astryx-migration/shots/diag-data.png' });
await browser.close();
