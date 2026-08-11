/** qa8 recon 2 — data page (folder explorer entry), admin project, rbac. */
import { BASE, ROOT, launch, settle } from './probe-pages-lib.mjs';
import fs from 'node:fs';

const { browser, page, pageErrors } = await launch();
const out = {};

async function go(path) {
  await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(7000);
  await settle(page);
  return page.url();
}

// ---- /data : find a folder row link to open the explorer -----------------
out.dataUrl = await go('data');
out.dataLinks = await page.evaluate(() =>
  [...document.querySelectorAll('a')]
    .map((a) => ({ href: a.getAttribute('href'), txt: a.textContent?.trim().slice(0, 30) }))
    .filter((x) => x.href && /folder=/.test(x.href))
    .slice(0, 5),
);
out.dataButtons = await page.evaluate(() =>
  [...document.querySelectorAll('button')]
    .map((b) => (b.getAttribute('aria-label') || b.textContent || '').trim().slice(0, 30))
    .filter(Boolean)
    .slice(0, 30),
);
await page.screenshot({ path: `${ROOT}/recon2-data.png` });

// ---- /admin/project ------------------------------------------------------
out.projectUrl = await go('admin/project');
out.projectButtons = await page.evaluate(() =>
  [...document.querySelectorAll('button')]
    .map((b) => (b.getAttribute('aria-label') || b.textContent || '').trim().slice(0, 30))
    .filter(Boolean)
    .slice(0, 30),
);
await page.screenshot({ path: `${ROOT}/recon2-project.png` });

// ---- /admin/rbac ---------------------------------------------------------
out.rbacUrl = await go('admin/rbac');
out.rbacRows = await page.evaluate(() =>
  [...document.querySelectorAll('table tbody tr')].slice(0, 3).map((tr) =>
    [...tr.querySelectorAll('td')].map((td) => td.textContent?.trim().slice(0, 24)),
  ),
);
out.rbacLinks = await page.evaluate(() =>
  [...document.querySelectorAll('a, button')]
    .map((a) => ({
      tag: a.tagName,
      href: a.getAttribute?.('href'),
      txt: a.textContent?.trim().slice(0, 24),
    }))
    .filter((x) => x.txt)
    .slice(0, 30),
);
await page.screenshot({ path: `${ROOT}/recon2-rbac.png` });

out.pageErrors = pageErrors;
fs.writeFileSync(`${ROOT}/recon2.json`, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
await browser.close();
