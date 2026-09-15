// PROTOTYPE — FR-3943. Throwaway: mints walkthrough stops headless with the overlay's own modules, then checks how they resolve.
import { chromium } from '/home/ubuntu/backend.ai-webui/node_modules/@playwright/test/index.mjs';
import { readFileSync } from 'node:fs';
const env = Object.fromEntries(readFileSync('/home/ubuntu/backend.ai-webui/e2e/envs/.env.playwright','utf8').split('\n').filter(l=>/^[A-Z0-9_]+=/.test(l)).map(l=>{const i=l.indexOf('=');return [l.slice(0,i), l.slice(i+1).replace(/^"|"$/g,'')]}));
const BASE = 'https://fr-3930-pr9658-edit-pin-s.localhost:1336'; const ENDPOINT = 'http://10.82.0.130:8090'; const PR = 9658; const SHA = 'c61efbf21a4d9e0b7f3c2d8e5a6b1c0d9e8f7a6b';
const AT = new Date().toISOString();
const STOPS = [
  { key: 'S1 visible',        route: '/data',          steps: [],                                                find: { text: 'Create Folder' },   ch: '폴더 생성 버튼이 카드 헤더의 extra 슬롯으로 옮겨졌습니다.', ck: '목록 위 오른쪽 상단에 "Create Folder" 버튼이 보여야 합니다.', code: [{ path: 'react/src/pages/VFolderListPage.tsx', line: 120 }] },
  { key: 'S2 behind modal',   route: '/data',          steps: [{ click: { text: 'Create Folder' } }],            find: { tid: 'model-usage-mode' }, ch: '폴더 생성 모달에 Models 사용 모드 라디오가 추가됐습니다.', ck: '모달 안 usage mode에 "Models" 선택지가 보여야 합니다.', code: [{ path: 'react/src/components/FolderCreateModal.tsx', line: 88, to: 104 }] },
  { key: 'S3 other page',     route: '/session/start', steps: [],                                                find: { text: 'Skip to review' },  ch: '세션 시작 화면에 리뷰로 건너뛰기 버튼이 생겼습니다.', ck: '1단계 하단에 "Skip to review" 버튼이 보여야 합니다.', code: [{ path: 'react/src/pages/SessionLauncherPage.tsx', line: 310 }] },
  { key: 'S4 behind a step',  route: '/session/start', steps: [{ click: { text: '2\nEnvironments & Resource Allocation' } }], find: { newTid: true }, ch: '2단계에 새 리소스 입력이 추가됐습니다.', ck: '2단계에서 새 입력이 보여야 합니다.', code: [{ path: 'react/src/components/SessionLauncher/ResourceStep.tsx', line: 42 }] },
];
const findJs = `(f) => { const vis = e => e && e.getBoundingClientRect().width > 0; if (f.tid) return document.querySelector('[data-testid="'+f.tid+'"]'); if (f.text) return [...document.querySelectorAll('button')].find(b => vis(b) && b.innerText.trim() === f.text) || null; return null; }`;
const tids = (page) => page.evaluate(() => [...document.querySelectorAll('[data-testid]')].filter(e=>e.getBoundingClientRect().width>0).map(e=>e.getAttribute('data-testid')));
const waitOverlay = (page) => page.waitForFunction(() => window.__baiReviewOverlay, null, { timeout: 30000 });
const browser = await chromium.launch(); const ctx = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1400, height: 900 } }); const page = await ctx.newPage();
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.getByLabel('Email or Username').fill(env.E2E_ADMIN_EMAIL); await page.getByLabel('Password').fill(env.E2E_ADMIN_PASSWORD);
const ep = page.getByRole('textbox', { name: 'Endpoint', exact: true }); if (!(await ep.isVisible({timeout:500}).catch(()=>false))) await page.getByText('Advanced').click(); await ep.fill(ENDPOINT);
await page.getByRole('button', { name: 'Login', exact: true }).click(); await page.waitForSelector('[data-testid="user-dropdown-button"]', { timeout: 60000 });
const projectBase = page.url().replace(/\/start$/, ''); console.log('project base', projectBase);

// ---- mint
const stops = [];
for (const s of STOPS) {
  const t0 = Date.now();
  await page.goto(projectBase + s.route, { waitUntil: 'domcontentloaded' }); await waitOverlay(page); await page.waitForTimeout(4000);
  if (s.route === '/session/start') { await page.getByText('Confirm and Launch').first().waitFor({ timeout: 20000 }).catch(async () => console.log('  session/start buttons:', await page.evaluate(() => [...document.querySelectorAll('button')].map(b => b.innerText.trim()).filter(Boolean).slice(0, 30)))); await page.waitForTimeout(1500); }
  const before = await tids(page);
  for (const st of s.steps) { if (st.click) { await page.getByText(st.click.text.split('\n').pop(), { exact: true }).first().click({ timeout: 15000 }); await page.waitForTimeout(2500); } }
  let find = s.find; if (find.newTid) { const after = await tids(page); const fresh = after.filter(t => !before.includes(t) && t !== 'react-grab-overlay'); find = { tid: fresh[0] }; s.pickedTid = fresh[0]; }
  const r = await page.evaluate(async ([find, findJs, fields]) => {
    const [anchorMod, codecMod, idMod] = await Promise.all(['/__review/anchor.js','/__review/codec.js','/__review/id.js'].map(u => import(/* @vite-ignore */ u)));
    const el = (0, eval)(findJs)(find); if (!el) return { error: 'not found' };
    const anchor = { ...anchorMod.captureAnchorSignals(el), ...fields };
    const b64 = await codecMod.encodeAnchor(anchor);
    return { b64, id: idMod.pinId(fields.pr, b64, fields.at), p: anchor.p, q: anchor.q ?? '', tid: anchor.tid, txt: anchor.txt, s: anchor.s };
  }, [find, findJs, { ch: s.ch, ck: s.ck, code: s.code, sha: SHA, pr: PR, at: AT }]);
  stops.push({ ...s, ...r, mintMs: Date.now() - t0 });
  console.log(s.key, r.error ?? `minted id=${r.id} b64=${r.b64.length} tid=${r.tid} txt=${JSON.stringify(r.txt)} in ${Date.now()-t0}ms`);
}
const minted = stops.filter(s => s.b64);
const setLink = `${projectBase}${STOPS[0].route}#` + minted.map(s => `bai=v3.${s.id}.${s.b64}`).join('&');
console.log('set link length', setLink.length);

// ---- verify: a reviewer (already logged in) opens the set link
const state = (page) => page.evaluate((ids) => Object.fromEntries(ids.map(id => { const host = document.querySelector('[data-bai-review-overlay]'); const root = host?.shadowRoot ?? host; const pin = root?.querySelector(`.pin[data-pin-id="${id}"]`); const row = root?.querySelector(`.row[data-pin-id="${id}"]`); return [id, { pin: !!pin && pin.getBoundingClientRect().width > 0, row: row ? row.className.replace('row','').trim() || 'located' : 'no-row' }]; })), minted.map(s => s.id));
const toast = (page) => page.evaluate(() => { const host = document.querySelector('[data-bai-review-overlay]'); const root = host?.shadowRoot ?? host; return [...(root?.querySelectorAll('.toast') ?? [])].map(t => t.textContent.trim()).join(' | '); });
const v = await ctx.newPage(); const results = [];
const snap = async (label) => { const st = await state(v); results.push({ label, url: v.url().replace(projectBase,'').slice(0,28), ...Object.fromEntries(minted.map(s => [s.key, `${st[s.id].pin ? 'PIN' : '—'}/${st[s.id].row}`])) }); };
const S = Object.fromEntries(minted.map(s => [s.key.split(' ')[0], s]));
const under = async (id) => v.evaluate((id) => { const host = document.querySelector('[data-bai-review-overlay]'); const root = host?.shadowRoot ?? host; const pin = root?.querySelector(`.pin[data-pin-id="${id}"]`); if (!pin) return 'no pin'; const r = pin.getBoundingClientRect(); const prev = host.style.pointerEvents; host.style.pointerEvents = 'none'; const el = document.elementFromPoint(r.left + r.width/2, r.top + r.height/2); host.style.pointerEvents = prev; const t = el?.closest('[data-testid]'); return `${el?.tagName} "${(el?.innerText||'').trim().slice(0,20)}" testid=${t?.getAttribute('data-testid')} inDialog=${!!el?.closest('[role=dialog]')}`; }, id);
await v.goto(setLink, { waitUntil: 'domcontentloaded' }); await waitOverlay(v); await v.waitForTimeout(12000); await snap('landing +12s');
console.log('S2 pin sits on:', await under(S.S2.id), '| modal radio in DOM:', await v.evaluate(() => !!document.querySelector('[data-testid="model-usage-mode"]')));
try { await v.getByRole('button', { name: 'Create Folder', exact: true }).first().click({ timeout: 15000 }); } catch (e) { console.log('create-folder click failed'); } await v.waitForTimeout(5000); await snap('modal opened +5s');
console.log('S2 pin sits on (modal open):', await under(S.S2.id));
// cross-page: use the dock row's go action for S3
const acts = await v.evaluate((id) => { const host = document.querySelector('[data-bai-review-overlay]'); const root = host?.shadowRoot ?? host; return [...(root?.querySelectorAll(`.row[data-pin-id="${id}"] button`) ?? [])].map(b => b.title || b.getAttribute('aria-label') || b.textContent.trim()); }, S.S3.id);
console.log('S3 row actions:', acts);
await v.evaluate((id) => { const host = document.querySelector('[data-bai-review-overlay]'); const root = host?.shadowRoot ?? host; root.querySelector(`.row[data-pin-id="${id}"] .rowlabel`).click(); }, S.S3.id);
await v.waitForURL(/session\/start/, { timeout: 20000 }).then(() => console.log('row label click navigated to', v.url().replace(projectBase,'').slice(0,40))).catch(() => console.log('row label click: no navigation'));
await waitOverlay(v); await v.waitForTimeout(12000); await snap('after S3 row click +12s'); console.log('S3 pin sits on:', await under(S.S3.id));
try { await v.getByText('Environments & Resource Allocation', { exact: true }).first().click({ timeout: 15000 }); } catch (e) { console.log('step2 click failed'); } await v.waitForTimeout(6000); await snap('step 2 opened +6s'); console.log('S4 pin sits on:', await under(S.S4.id));
console.table(results);
await browser.close();
