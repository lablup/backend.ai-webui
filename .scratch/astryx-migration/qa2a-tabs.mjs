// QA2-A: measure every tab strip on the surfaces that carry tabs, in both
// colour schemes, and screenshot them.  TAG=before / TAG=after.
import fs from 'node:fs';
import { launch, login, goto, setMode, measureTabs } from './qa2a-probe.mjs';

const TAG = process.env.TAG ?? 'before';
const OUT = `.scratch/astryx-migration/shots/qa2-a`;
fs.mkdirSync(OUT, { recursive: true });

const ROUTES = [
  ['environment', 'admin/environment'],
  ['resources', 'admin/agent'],
  ['resource-policy', 'admin/resource-policy'],
  ['statistics', 'statistics'],
  ['users', 'admin/users'],
  ['project', 'admin/project'],
  ['maintenance', 'admin/maintenance'],
  ['settings', 'admin/settings'],
  ['scheduler', 'admin/scheduler'],
  ['my-environment', 'my-environment'],
  ['session', 'session'],
];

const { browser, page } = await launch();
await login(page);

const report = {};
for (const mode of ['light', 'dark']) {
  await setMode(page, mode);
  for (const [name, path] of ROUTES) {
    await goto(page, path);
    await setMode(page, mode);
    const tabs = await measureTabs(page);
    report[`${mode}/${name}`] = tabs;
    await page.screenshot({ path: `${OUT}/${TAG}-${mode}-${name}.png` });
    console.log(`--- ${mode} ${path}`);
    for (const t of tabs) console.log('   ', JSON.stringify(t));
  }
}
fs.writeFileSync(
  `${OUT}/${TAG}-measurements.json`,
  JSON.stringify(report, null, 2),
);
await browser.close();
