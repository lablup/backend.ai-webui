// Single-browser before/after capture: eliminates per-launch rendering
// variance. Handshake: writes .ready-for-swap after the before capture, then
// waits for .swapped (bash swaps the dev server state in between).
import { chromium } from '@playwright/test';
import { existsSync, readFileSync, writeFileSync, rmSync } from 'node:fs';

// Run from repo root: node .scratch/astryx-migration/shots/measure-03-<name>.mjs
const OUT = process.env.SHOT_DIR ?? '/tmp/shim-shots';
const BASE = 'http://127.0.0.1:5299';
const VIEWS = [
  ['login', '/'],
  ['routeerror', '/no-such-route'],
];
const b = await chromium.launch();

const capture = async (label) => {
  for (const mode of ['light', 'dark']) {
    const ctx = await b.newContext({
      viewport: { width: 1440, height: 900 },
      colorScheme: mode,
    });
    const p = await ctx.newPage();
    const errs = [];
    p.on('pageerror', (e) => errs.push('[pageerror] ' + e.message));
    p.on('console', (m) => {
      if (m.type() === 'error') errs.push('[console] ' + m.text().slice(0, 160));
    });
    await p.addInitScript((m) => {
      localStorage.setItem(
        'backendaiwebui.settings.themeMode',
        JSON.stringify(m),
      );
    }, mode);
    for (const [view, path] of VIEWS) {
      await p.goto(BASE + path, { waitUntil: 'networkidle', timeout: 60000 });
      await p.waitForTimeout(3500);
      // Freeze CSS animations (the Diagonal Weave backdrop drifts
      // continuously); applied identically to both frames.
      await p.addStyleTag({
        content:
          '*, *::before, *::after { animation: none !important; transition: none !important; }',
      });
      await p.waitForTimeout(500);
      await p.screenshot({ path: `${OUT}/${label}-${view}-${mode}.png` });
    }
    console.log(label, mode, 'unique errors:', [...new Set(errs)].length);
    for (const e of [...new Set(errs)]) console.log('   ', e);
    await ctx.close();
  }
};

const diffPair = async (view, mode) => {
  const p = await (await b.newContext()).newPage();
  const toUrl = (f) =>
    'data:image/png;base64,' + readFileSync(f).toString('base64');
  const res = await p.evaluate(
    async ([ua, ub]) => {
      const load = (u) =>
        new Promise((res, rej) => {
          const img = new Image();
          img.onload = () => res(img);
          img.onerror = rej;
          img.src = u;
        });
      const [ia, ib] = await Promise.all([load(ua), load(ub)]);
      if (ia.width !== ib.width || ia.height !== ib.height)
        return { error: 'size mismatch' };
      const w = ia.width, h = ia.height;
      const cv = (img) => {
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        const x = c.getContext('2d', { willReadFrequently: true });
        x.drawImage(img, 0, 0);
        return x.getImageData(0, 0, w, h).data;
      };
      const A = cv(ia), B = cv(ib);
      const dc = document.createElement('canvas');
      dc.width = w; dc.height = h;
      const dctx = dc.getContext('2d');
      const D = dctx.createImageData(w, h);
      let n = 0;
      for (let i = 0; i < A.length; i += 4) {
        const diff =
          A[i] !== B[i] || A[i + 1] !== B[i + 1] || A[i + 2] !== B[i + 2] ||
          A[i + 3] !== B[i + 3];
        if (diff) {
          n++;
          D.data[i] = 255; D.data[i + 3] = 255;
        } else {
          const g = (A[i] + A[i + 1] + A[i + 2]) / 3;
          D.data[i] = D.data[i + 1] = D.data[i + 2] = g;
          D.data[i + 3] = 40;
        }
      }
      dctx.putImageData(D, 0, 0);
      return { n, w, h, png: dc.toDataURL('image/png') };
    },
    [toUrl(`${OUT}/before-${view}-${mode}.png`), toUrl(`${OUT}/after-${view}-${mode}.png`)],
  );
  if (!res.error)
    writeFileSync(
      `${OUT}/diff-${view}-${mode}.png`,
      Buffer.from(res.png.split(',')[1], 'base64'),
    );
  await p.close();
  return res;
};

rmSync(`${OUT}/.ready-for-swap`, { force: true });
rmSync(`${OUT}/.swapped`, { force: true });

await capture('before');
writeFileSync(`${OUT}/.ready-for-swap`, '1');
console.log('READY FOR SWAP — waiting for .swapped');
const deadline = Date.now() + 10 * 60 * 1000;
while (!existsSync(`${OUT}/.swapped`)) {
  if (Date.now() > deadline) throw new Error('swap timeout');
  await new Promise((r) => setTimeout(r, 1000));
}
console.log('SWAPPED — capturing after');
await capture('after');

for (const [view] of VIEWS) {
  for (const mode of ['light', 'dark']) {
    const r = await diffPair(view, mode);
    if (r.error) console.log(`${view}/${mode}: ${r.error}`);
    else
      console.log(
        `${view}/${mode}: ${r.n} px differ (${((r.n / (r.w * r.h)) * 100).toFixed(3)}% of frame)`,
      );
  }
}
await b.close();
console.log('ORCHESTRATE DONE');
