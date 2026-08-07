// Proof that the link colour is TOKEN-driven, not a literal: compare the
// visible folder name's computed colour to --color-text-accent resolved in
// the same subtree, in both schemes, under the nested admin theme.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const mode of ['light', 'dark']) {
  const p = await b.newPage({ viewport: { width: 1400, height: 900 }, colorScheme: mode });
  await p.goto('http://127.0.0.1:5312/phase6.html', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1000);
  const r = await p.locator('.bai-name-action-cell-title-area a').first().evaluate((a) => {
    const leaf = a.querySelector('span span') ?? a;
    const probe = document.createElement('div');
    probe.style.color = 'var(--color-text-accent)';
    a.appendChild(probe);
    const token = getComputedStyle(probe).color;
    probe.remove();
    return { name: getComputedStyle(leaf).color, token, theme: document.documentElement.getAttribute('data-astryx-theme') };
  });
  console.log(mode, JSON.stringify(r), r.name === r.token ? 'MATCH' : 'MISMATCH');
  await p.close();
}
await b.close();
