import fs from 'node:fs';
import { launch, login, groupGeom, BASE } from './qa2b-lib.mjs';

const OUT = '.scratch/astryx-migration/shots/qa2-b';
fs.mkdirSync(OUT, { recursive: true });
const TAG = process.env.TAG ?? 'before';

const { browser, page } = await launch();
await login(page);
console.log('url after login', page.url());

const routes = process.env.ROUTES?.split(',') ?? [
  'summary',
  'serving',
  'admin/users',
  'data',
];

for (const r of routes) {
  await page.goto(new URL(r, BASE).href, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(8000);
  const geom = await groupGeom(page);
  console.log(`\n=== ${r} :: ${page.url()}`);
  console.log(JSON.stringify(geom, null, 1));
  await page.screenshot({ path: `${OUT}/${TAG}-${r.replace(/\//g, '_')}.png` });
}

await browser.close();
