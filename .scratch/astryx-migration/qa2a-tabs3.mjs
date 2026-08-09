// QA2-A pass 3: the remaining `tabList` call sites from the census, so every
// one of them is eyeballed at least once.
import fs from 'node:fs';
import { launch, login, goto, setMode } from './qa2a-probe.mjs';

const TAG = process.env.TAG ?? 'after3';
const OUT = `.scratch/astryx-migration/shots/qa2-a`;
fs.mkdirSync(OUT, { recursive: true });

const ROUTES = [
  ['admin-deployments', 'admin/deployments'],
  ['rbac', 'admin/rbac'],
  ['usersettings', 'usersettings'],
  ['agent-summary', 'agent-summary'],
  ['admin-session', 'admin/session'],
  ['dashboard', 'dashboard'],
  ['deployments', 'deployments'],
];

const { browser, page } = await launch();
await login(page);

const measure = () =>
  page.evaluate(() =>
    [...document.querySelectorAll('nav.astryx-tab-list')].map((nav) => {
      const r = (n) => +Number(n).toFixed(2);
      const b = nav.getBoundingClientRect();
      const card = nav.closest('.bai-card');
      const cb = card?.getBoundingClientRect();
      return {
        style: nav.className.includes('bai-tab-list--card') ? 'card' : 'line',
        chrome: nav.className.includes('bai-card__tabs'),
        top: nav.className.includes('bai-card__tabs--top'),
        navX: r(b.x),
        navRight: r(b.right),
        cardX: cb ? r(cb.x) : null,
        cardRight: cb ? r(cb.right) : null,
        // The whole point: does the rail run border-to-border on the card?
        edgeToEdge: cb
          ? Math.abs(b.x - (cb.x + 1)) <= 1 &&
            Math.abs(b.right - (cb.right - 1)) <= 1
          : null,
        labels: [...nav.querySelectorAll('[data-tab-value]')].map((t) =>
          t.getAttribute('data-tab-value'),
        ),
      };
    }),
  );

const report = {};
for (const mode of ['light', 'dark']) {
  await setMode(page, mode);
  for (const [name, path] of ROUTES) {
    await goto(page, path);
    await setMode(page, mode);
    const m = await measure();
    report[`${mode}/${name}`] = m;
    console.log(`--- ${mode} ${path}`);
    for (const t of m) console.log('   ', JSON.stringify(t));
    await page.screenshot({ path: `${OUT}/${TAG}-${mode}-${name}.png` });
  }
}
fs.writeFileSync(
  `${OUT}/${TAG}-measurements.json`,
  JSON.stringify(report, null, 2),
);
await browser.close();
