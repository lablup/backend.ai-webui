import { launch, login } from './probe.mjs';

const OUT = '.scratch/astryx-migration/shots/sweep-1';
const { browser, page } = await launch();
await login(page);
const url = new URL(page.url());
const projectSeg = url.pathname.split('/').slice(0, 3).join('/');

const toggle = async () => {
  await page
    .locator('button[aria-label="Dark mode"], button[aria-label="Light mode"]')
    .first()
    .click();
  await page.waitForTimeout(1000);
};

for (const [name, path] of [
  ['data', `${projectSeg}/data`],
  ['admin-users', '/admin/users'],
]) {
  await page.goto(`http://127.0.0.1:4500${path}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(7000);
  await page.screenshot({ path: `${OUT}/${name}-light.png` });
  await toggle();
  await page.screenshot({ path: `${OUT}/${name}-dark.png` });
  await toggle();
}
await browser.close();
