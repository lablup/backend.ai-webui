// Liveness control: same-browser diff of login/light before vs after a
// deliberate marginSM mis-map (12px -> 36px). Nonzero diff proves the shim
// is driving the render.
import { chromium } from '@playwright/test';
import { existsSync, readFileSync, writeFileSync, rmSync } from 'node:fs';

// Run from repo root: node .scratch/astryx-migration/shots/measure-03-<name>.mjs
const OUT = process.env.SHOT_DIR ?? '/tmp/shim-shots';
const BASE = 'http://127.0.0.1:5299';
const b = await chromium.launch();

const capture = async (file) => {
  const ctx = await b.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: 'light',
  });
  const p = await ctx.newPage();
  await p.addInitScript(() => {
    localStorage.setItem(
      'backendaiwebui.settings.themeMode',
      JSON.stringify('light'),
    );
  });
  await p.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(3500);
  await p.addStyleTag({
    content:
      '*, *::before, *::after { animation: none !important; transition: none !important; }',
  });
  await p.waitForTimeout(500);
  await p.screenshot({ path: file });
  await ctx.close();
};

rmSync(`${OUT}/.live-ready`, { force: true });
rmSync(`${OUT}/.perturbed`, { force: true });
await capture(`${OUT}/live-base.png`);
writeFileSync(`${OUT}/.live-ready`, '1');
console.log('LIVE BASE CAPTURED — waiting for .perturbed');
const deadline = Date.now() + 5 * 60 * 1000;
while (!existsSync(`${OUT}/.perturbed`)) {
  if (Date.now() > deadline) throw new Error('timeout');
  await new Promise((r) => setTimeout(r, 1000));
}
await capture(`${OUT}/live-perturbed.png`);

const p = await (await b.newContext()).newPage();
const toUrl = (f) =>
  'data:image/png;base64,' + readFileSync(f).toString('base64');
const n = await p.evaluate(
  async ([ua, ub]) => {
    const load = (u) =>
      new Promise((res, rej) => {
        const img = new Image();
        img.onload = () => res(img);
        img.onerror = rej;
        img.src = u;
      });
    const [ia, ib] = await Promise.all([load(ua), load(ub)]);
    const w = ia.width, h = ia.height;
    const cv = (img) => {
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      const x = c.getContext('2d', { willReadFrequently: true });
      x.drawImage(img, 0, 0);
      return x.getImageData(0, 0, w, h).data;
    };
    const A = cv(ia), B = cv(ib);
    let n = 0;
    for (let i = 0; i < A.length; i += 4)
      if (A[i] !== B[i] || A[i + 1] !== B[i + 1] || A[i + 2] !== B[i + 2]) n++;
    return n;
  },
  [toUrl(`${OUT}/live-base.png`), toUrl(`${OUT}/live-perturbed.png`)],
);
console.log(`LIVENESS: ${n} px moved (${((n / (1440 * 900)) * 100).toFixed(3)}%)`);
await b.close();
console.log('LIVE DONE');
