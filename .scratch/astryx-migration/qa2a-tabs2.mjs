// QA2-A pass 2: the card-type surfaces (BAITabs) + the BAICard chrome measured
// AGAINST THE CARD, and cropped card screenshots for the report.
import fs from 'node:fs';
import { launch, login, goto, setMode } from './qa2a-probe.mjs';

const TAG = process.env.TAG ?? 'after2';
const OUT = `.scratch/astryx-migration/shots/qa2-a`;
fs.mkdirSync(OUT, { recursive: true });

const ROUTES = [
  ['data', 'data'],
  ['admin-data', 'admin/data'],
  ['admin-session', 'admin/session'],
  ['scheduler', 'admin/scheduler'],
  ['users', 'admin/users'],
  ['reservoir', 'admin/reservoir'],
  ['diagnostics', 'admin/diagnostics'],
  ['branding', 'admin/branding'],
];

const { browser, page } = await launch();
await login(page);

/**
 * For each tab strip: its rect, the enclosing `.bai-card`'s rect, and whether
 * the rail runs from one card border to the other (antd's `.ant-card-head`
 * bottom border did exactly that).
 */
const measure = () =>
  page.evaluate(() => {
    const r = (n) => +Number(n).toFixed(2);
    return [...document.querySelectorAll('nav.astryx-tab-list')].map((nav) => {
      const b = nav.getBoundingClientRect();
      const cs = getComputedStyle(nav);
      const card = nav.closest('.bai-card, .astryx-card');
      const cb = card?.getBoundingClientRect();
      const tabs = [...nav.querySelectorAll('[data-tab-value]')];
      const first = tabs[0]?.getBoundingClientRect();
      const firstCs = tabs[0] ? getComputedStyle(tabs[0]) : null;
      // Where does the first tab's LABEL start? antd put it at the card's
      // content inset, i.e. flush with the body below.
      const label = tabs[0]?.querySelector('span > span')?.getBoundingClientRect();
      return {
        style: nav.className.includes('bai-tab-list--card') ? 'card' : 'line',
        inCard: !!card,
        tabs: tabs.length,
        navX: r(b.x),
        navRight: r(b.right),
        navH: r(b.height),
        cardX: cb ? r(cb.x) : null,
        cardRight: cb ? r(cb.right) : null,
        cardY: cb ? r(cb.y) : null,
        railY: r(b.bottom),
        headerBand: cb ? r(b.bottom - cb.y) : null,
        labelX: label ? r(label.x) : null,
        tabH: first ? r(first.height) : null,
        tabPadInline: firstCs?.paddingInline ?? firstCs?.paddingLeft,
        tabBg: firstCs?.backgroundColor,
        tabBorder: firstCs
          ? `${firstCs.borderTopWidth} ${firstCs.borderTopStyle} ${firstCs.borderTopColor}`
          : null,
        tabRadius: firstCs?.borderTopLeftRadius,
        railColor: cs.borderBottomColor,
      };
    });
  });

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
    const card = page.locator('.bai-card, .astryx-card').last();
    if (await card.count()) {
      await card
        .screenshot({ path: `${OUT}/${TAG}-${mode}-${name}-card.png` })
        .catch(() => {});
    }
    await page.screenshot({ path: `${OUT}/${TAG}-${mode}-${name}.png` });
  }
}
fs.writeFileSync(
  `${OUT}/${TAG}-measurements.json`,
  JSON.stringify(report, null, 2),
);
await browser.close();
