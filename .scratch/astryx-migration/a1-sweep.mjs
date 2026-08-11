/**
 * approved-1 — post-pin sweep: heading-site census, small-control census and
 * route screenshots in both modes, to catch NEW breakage from the heading
 * ladder (#3) and the `--size-element-sm` (#8) pins.
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const ROOT = process.env.ROOT;
const BASE = process.env.BASE ?? 'http://127.0.0.1:5960/';
const PROJ =
  process.env.PROJ ?? 'a%ED%95%9C%EA%B5%AD%EC%96%B4%EA%B0%80%EB%8A%A5_cde';
const MODE = process.env.MODE ?? 'light';

const ROUTES = [
  ['p-start', `project/${PROJ}/start`],
  ['p-dashboard', `project/${PROJ}/dashboard`],
  ['p-data', `project/${PROJ}/data`],
  ['p-session', `project/${PROJ}/session`],
  ['p-deployments', `project/${PROJ}/deployments`],
  ['a-users', 'admin/users'],
  ['a-settings', 'admin/settings'],
  ['a-information', 'admin/information'],
  ['a-environment', 'admin/environment'],
  ['a-resources', 'admin/agent'],
  ['m-usersettings', 'usersettings'],
];

const PROBE = () => {
  const headings = Array.from(document.querySelectorAll('.astryx-heading')).map(
    (e) => {
      const c = getComputedStyle(e);
      const r = e.getBoundingClientRect();
      return {
        lvl: e.className.match(/level-(\d)/)?.[1] ?? '?',
        text: (e.innerText || '').trim().slice(0, 28),
        size: c.fontSize,
        lh: c.lineHeight,
        w: Math.round(r.width),
        h: Math.round(r.height),
        // does the heading overflow its own box horizontally?
        overflowX: e.scrollWidth - e.clientWidth,
      };
    },
  );
  const smalls = Array.from(
    document.querySelectorAll(
      '.astryx-button.sm, .astryx-icon-button.sm, .astryx-selector.sm, .astryx-text-input.sm',
    ),
  )
    .slice(0, 10)
    .map((e) => {
      const r = e.getBoundingClientRect();
      const c = getComputedStyle(e);
      return {
        cls: e.className.split(' ').slice(0, 2).join(' '),
        h: Math.round(r.height),
        fontSize: c.fontSize,
        // is the label clipped inside the shorter control?
        clipY: e.scrollHeight - e.clientHeight,
        clipX: e.scrollWidth - e.clientWidth,
      };
    });
  // any element whose text overflows its box (a proxy for "now too big")
  const clipped = Array.from(document.querySelectorAll('*'))
    .filter((e) => {
      if (!e.childElementCount && (e.innerText || '').trim().length > 2) {
        const cs = getComputedStyle(e);
        if (cs.overflow === 'visible') return false;
        return e.scrollHeight - e.clientHeight > 3;
      }
      return false;
    })
    .slice(0, 8)
    .map((e) => ({
      tag: e.tagName,
      text: (e.innerText || '').trim().slice(0, 24),
      over: e.scrollHeight - e.clientHeight,
    }));
  return { headings, smalls, clipped, textLen: document.body.innerText.length };
};

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  storageState: `${ROOT}/a1-state.json`,
  colorScheme: MODE === 'dark' ? 'dark' : 'light',
});
const page = await ctx.newPage();
page.setDefaultNavigationTimeout(120000);
const errs = [];
page.on('pageerror', (e) => errs.push(String(e).slice(0, 160)));
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(14000);
if (MODE === 'dark') {
  const b = page.getByRole('button', { name: /^dark mode$/i }).first();
  if (await b.count()) {
    await b.click();
    await page.waitForTimeout(2500);
  }
  console.log(
    '### themeAttr =',
    await page.evaluate(() => document.documentElement.dataset.theme),
  );
}

const settle = async () => {
  const deadline = Date.now() + 25000;
  while (Date.now() < deadline) {
    const s = await page.evaluate(() => {
      const sk = Array.from(document.querySelectorAll('*')).some((e) => {
        if (!/skeleton/i.test(String(e.className))) return false;
        const r = e.getBoundingClientRect();
        return r.width > 20 && r.height > 4;
      });
      return { sk, len: document.body.innerText.length };
    });
    if (!s.sk && s.len > 200) return true;
    await page.waitForTimeout(1200);
  }
  return false;
};

const report = {};
for (const [id, path] of ROUTES) {
  try {
    await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    await settle();
    await page.waitForTimeout(1200);
    const p = await page.evaluate(PROBE);
    report[id] = { path, ...p, errs: errs.splice(0) };
    await page.screenshot({
      path: `${ROOT}/shots/approved-1/${id}-${MODE}.png`,
    });
    console.log(
      `### ${id} headings=${p.headings.length} smalls=${p.smalls.length} clipped=${p.clipped.length}`,
    );
    p.headings.forEach((h) =>
      console.log(`      H${h.lvl} ${h.size}/${h.lh} "${h.text}" overX=${h.overflowX}`),
    );
    p.smalls
      .slice(0, 3)
      .forEach((s) =>
        console.log(
          `      SM ${s.cls} h=${s.h} fs=${s.fontSize} clipY=${s.clipY} clipX=${s.clipX}`,
        ),
      );
    p.clipped.forEach((c) =>
      console.log(`      CLIP ${c.tag} +${c.over}px "${c.text}"`),
    );
  } catch (e) {
    report[id] = { path, error: String(e).slice(0, 160) };
    console.log(`### ${id} ERROR`);
  }
}
fs.writeFileSync(
  `${ROOT}/a1-sweep-${MODE}.json`,
  JSON.stringify(report, null, 1),
);
await browser.close();
