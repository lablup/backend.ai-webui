// Sweep: every anchor rendered anywhere in the pilot page graph — does its
// VISIBLE leaf carry the accent token, or has a nested Text overridden it?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const state of ['', 'delete', 'create']) {
  const p = await b.newPage({ viewport: { width: 1500, height: 1000 } });
  await p.goto(`http://127.0.0.1:5312/phase6.html${state ? `?state=${state}` : ''}`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1200);
  const rows = await p.locator('a.astryx-link').evaluateAll((as) => {
    const probe = document.createElement('div');
    probe.style.color = 'var(--color-text-accent)';
    document.body.appendChild(probe);
    const token = getComputedStyle(probe).color;
    probe.remove();
    return as.slice(0, 6).map((a) => {
      const leaves = [...a.querySelectorAll('*')];
      const leaf = leaves.length ? leaves[leaves.length - 1] : a;
      return { text: a.innerText.trim().slice(0, 24), leafColor: getComputedStyle(leaf).color, token };
    });
  });
  console.log(`state=${state || 'page'} anchors=${rows.length}`);
  rows.forEach((r) => console.log('  ', r.leafColor === r.token ? 'OK  ' : 'BAD ', JSON.stringify(r)));
  await p.close();
}
await b.close();
