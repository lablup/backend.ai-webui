import fs from 'node:fs';
import { launch, login } from './probe.mjs';

const OUT = '.scratch/astryx-migration/shots/sweep-1';
fs.mkdirSync(OUT, { recursive: true });

const { browser, page } = await launch();
await login(page);
const url = new URL(page.url());
const projectSeg = url.pathname.split('/').slice(0, 3).join('/'); // /project/<name>
console.log('project base:', projectSeg);

const ROUTES = [
  ['start', `${projectSeg}/start`],
  ['dashboard', `${projectSeg}/dashboard`],
  ['sessions', `${projectSeg}/session`],
  ['session-launcher', `${projectSeg}/session/start`],
  ['data', `${projectSeg}/data`],
  ['deployments', `${projectSeg}/deployments`],
  ['my-environment', `${projectSeg}/my-environment`],
  ['model-store', `${projectSeg}/model-store`],
  ['chat', `${projectSeg}/chat`],
  ['statistics', `${projectSeg}/statistics`],
  ['admin-users', '/admin/users'],
  ['admin-agent', '/admin/agent'],
  ['admin-environment', '/admin/environment'],
  ['admin-resource-policy', '/admin/resource-policy'],
  ['admin-settings', '/admin/settings'],
  ['admin-dashboard', '/admin/dashboard'],
];

const errors = [];
page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));

const toggleTheme = async () => {
  await page
    .locator('button[aria-label="Dark mode"], button[aria-label="Light mode"]')
    .first()
    .click();
  await page.waitForTimeout(1000);
};

const modeOf = () =>
  page.evaluate(() => ({
    dataTheme: document.documentElement.getAttribute('data-theme'),
    bodyBg: getComputedStyle(document.body).backgroundColor,
  }));

for (const [name, path] of ROUTES) {
  await page.goto(`http://127.0.0.1:4500${path}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(8000);
  const light = await modeOf();
  await page.screenshot({ path: `${OUT}/${name}-light.png`, fullPage: false });
  // toggle via the HEADER BUTTON (proves defect 1 across routes)
  try {
    await toggleTheme();
    const dark = await modeOf();
    await page.screenshot({ path: `${OUT}/${name}-dark.png`, fullPage: false });
    console.log(`${name}: light=${JSON.stringify(light)} dark=${JSON.stringify(dark)}`);
    await toggleTheme(); // back to light for the next route
  } catch (e) {
    console.log(`${name}: TOGGLE FAILED ${e.message.slice(0, 120)}`);
  }
}
console.log('PAGE ERRORS:', errors.slice(0, 20));
await browser.close();
