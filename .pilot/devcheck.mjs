// PILOT PHASE 2 — load the LIVE dev server and report console/page errors.
import { chromium } from '@playwright/test';

const BASE = process.env.PILOT_URL ?? 'http://127.0.0.1:4319/';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } });

const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`console.error: ${m.text()}`);
});

await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(6000);

// Force the converted modules through Vite's transform pipeline even if the
// route is behind auth — a compile/import failure surfaces as a fetch error.
const modules = [
  '/src/pages/AdminVFolderNodeListPage.tsx',
  '/src/components/VFolderNodes.tsx',
  '/src/components/astryx-bui/BAITableAstryx.tsx',
  '/src/components/astryx-bui/BAIModalAstryx.tsx',
  '/src/components/astryx-bui/BAICardAstryx.tsx',
  '/src/components/astryx-bui/BAIFlexAstryx.tsx',
  '/src/components/astryx-bui/BAIButtonAstryx.tsx',
  '/src/components/astryx-bui/smallPrimitives.tsx',
  '/src/components/FolderCreateModalV2.tsx',
  '/src/components/BAITabs.tsx',
  '/src/components/BAIRadioGroup.tsx',
  // PHASE 6
  '/src/components/astryx-bui/BAIPropertyFilterAstryx.tsx',
  '/src/components/astryx-bui/BAIDeleteConfirmModalAstryx.tsx',
  '/src/components/astryx-bui/BAINameActionCellAstryx.tsx',
  '/src/components/astryx-bui/BAICountdownBorderAstryx.tsx',
  '/src/components/astryx-bui/BAIQuestionIconWithTooltipAstryx.tsx',
  '/src/components/astryx-bui/BAIVFolderDeleteButtonAstryx.tsx',
  '/src/components/astryx-bui/BAIFetchKeyButtonAstryx.tsx',
  '/src/components/StorageSelectAstryx.tsx',
  '/src/components/VFolderPermissionCell.tsx',
  '/src/components/VFolderNodeIdenticon.tsx',
];
for (const m of modules) {
  const res = await page.request.get(BASE.replace(/\/$/, '') + m);
  const body = await res.text();
  const ok = res.status() === 200 && !body.includes('Internal server error');
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${m} (${res.status()})`);
  if (!ok) console.log(body.slice(0, 600));
}

await page.screenshot({ path: '.pilot/shots/pilot6-devserver.png', fullPage: false });
await browser.close();

console.log('---');
console.log(errors.length ? errors.slice(0, 20).join('\n') : 'no console/page errors');
