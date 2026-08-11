// QA2-A pass 5: the tab-rail -> body-content gap, i.e. the card header/body
// boundary sibling C measured as "16px" on the four hand-inlined pages.
//
// antd's tabbed `Card` had `body.paddingTop = token.padding` = 16px (legacy
// `BAICard` set it explicitly, and `use-bai-card.md` codifies it: "Cards with
// tabList keep their default body paddingTop"). So 16px IS the legacy value —
// this probe confirms our rail->content distance lands on it.
import fs from 'node:fs';
import { launch, login, goto, setMode } from './qa2a-probe.mjs';

const OUT = `.scratch/astryx-migration/shots/qa2-a`;
fs.mkdirSync(OUT, { recursive: true });

const ROUTES = [
  ['environment', 'admin/environment'],
  ['resources', 'admin/agent'],
  ['my-environment', 'my-environment'],
  ['agent-summary', 'agent-summary'],
  ['users', 'admin/users'],
  ['resource-policy', 'admin/resource-policy'],
];

const { browser, page } = await launch();
await login(page);
await setMode(page, 'light');

const report = {};
for (const [name, path] of ROUTES) {
  await goto(page, path);
  const m = await page.evaluate(() => {
    const r = (n) => +Number(n).toFixed(2);
    const nav = document.querySelector('nav.bai-card__tabs');
    if (!nav) return null;
    const card = nav.closest('.bai-card');
    const cardCs = getComputedStyle(card);
    const next = nav.nextElementSibling;
    const nb = next?.getBoundingClientRect();
    return {
      cardPadding: cardCs.padding,
      railBottom: r(nav.getBoundingClientRect().bottom),
      contentTop: nb ? r(nb.top) : null,
      // antd: head border -> body content = body paddingTop = token.padding.
      railToContent: nb ? r(nb.top - nav.getBoundingClientRect().bottom) : null,
      headerBand: r(nav.getBoundingClientRect().bottom - card.getBoundingClientRect().y),
    };
  });
  report[name] = m;
  console.log(name, JSON.stringify(m));
}
fs.writeFileSync(`${OUT}/final-gap.json`, JSON.stringify(report, null, 2));
await browser.close();
