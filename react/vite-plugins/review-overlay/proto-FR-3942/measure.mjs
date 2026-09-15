// PROTOTYPE — FR-3942. Throwaway: measures how walkthrough fields inflate a #bai=v3 link.
import { encodeAnchor, decodeAnchor, PIN_BODY_SRC } from '/home/ubuntu/backend.ai-webui/react/vite-plugins/review-overlay/client/codec.ts';
import { readFileSync } from 'node:fs';

const md = readFileSync('/home/ubuntu/backend.ai-webui/react/vite-plugins/review-overlay/testdata/pin-block-noted-sample.md', 'utf8');
const samples = [...md.matchAll(/bai=v3\.(c_[a-z2-7]{7})\.([A-Za-z0-9_-]+)/g)].map(m => m[2]);
const bases = [];
for (const s of samples) { const a = await decodeAnchor(s); if (a) bases.push(a); }
console.log('base anchors:', bases.length, 'b64 lengths:', samples.map(s => s.length).join(','));
console.log('base keys:', Object.keys(bases[0]).join(','), '\n');

// --- text generators (varied, so deflate cannot collapse repeats across stops)
const KO = '업로드 폴더 중복 항목 덮어쓰기 여부를 항목마다 선택할 수 있도록 모달을 바꿨습니다 확인 버튼 목록 상태 표시 세션 시작 페이지 리소스 그룹 필터 정렬 열 추가 라벨 변경 경고 문구 이전에는 한 번에 전체를 덮어썼지만 이제는 각 행의 스위치로 결정합니다 스크롤 위치 유지 값 검증 오류 메시지 폼 초기화 저장 취소'.split(' ');
const EN = 'the upload folder duplicate item overwrite choice is now made per row in the modal instead of once for the whole batch confirm button list state column label warning text session start page resource group filter sort added changed removed each switch decides scroll position kept validation error message form reset save cancel expected result visible'.split(' ');
let seed = 7; const rnd = () => (seed = (seed * 48271) % 2147483647) / 2147483647;
const text = (pool, chars) => { let s = ''; while (s.length < chars) s += pool[Math.floor(rnd() * pool.length)] + ' '; return s.slice(0, chars).trim(); };
const PATHS = ['react/src/components/FolderExplorer/UploadConflictModal.tsx','react/src/components/FolderExplorer/FolderExplorer.tsx','react/src/hooks/useFolderUpload.tsx','packages/backend.ai-ui/src/components/BAIDeleteConfirmModal.tsx','react/src/pages/VFolderListPage.tsx','resources/i18n/ko.json'];
const codeRefs = (n) => Array.from({ length: n }, (_, i) => ({ path: PATHS[(i * 2 + Math.floor(rnd() * 3)) % PATHS.length], line: 40 + Math.floor(rnd() * 400) }));
const SHA40 = 'c61efbf21a4d9e0b7f3c2d8e5a6b1c0d9e8f7a6b';

const OVERHEAD = 'bai=v3.c_obk74wj.'.length + 1; // part prefix + '&'
const variants = {
  'baseline (note 280 ko)':            (b, i) => ({ ...b, n: text(KO, 280) }),
  'wt: ch+ck 280 ko, code×1, sha40, pr': (b, i) => ({ ...b, n: undefined, ch: text(KO, 280), ck: text(KO, 280), code: codeRefs(1), sha: SHA40, pr: 9605 }),
  'wt: ch+ck 280 ko, code×3, sha40, pr': (b, i) => ({ ...b, n: undefined, ch: text(KO, 280), ck: text(KO, 280), code: codeRefs(3), sha: SHA40, pr: 9605 }),
  'wt: ch+ck 280 en, code×3, sha40, pr': (b, i) => ({ ...b, n: undefined, ch: text(EN, 280), ck: text(EN, 280), code: codeRefs(3), sha: SHA40, pr: 9605 }),
  'wt: ch+ck 140 ko, code×3, sha7, pr':  (b, i) => ({ ...b, n: undefined, ch: text(KO, 140), ck: text(KO, 140), code: codeRefs(3), sha: SHA40.slice(0,7), pr: 9605 }),
  'wt: ch+ck 140 ko, code×1, sha7, pr':  (b, i) => ({ ...b, n: undefined, ch: text(KO, 140), ck: text(KO, 140), code: codeRefs(1), sha: SHA40.slice(0,7), pr: 9605 }),
  'wt: ch+ck 280 ko, NO code, no sha':   (b, i) => ({ ...b, n: undefined, ch: text(KO, 280), ck: text(KO, 280) }),
};
const RE = new RegExp('^' + PIN_BODY_SRC.replace(/^\(c_\[a-z2-7\]\{7\}\)\\\./, '') + '$');
const rows = [];
for (const [name, make] of Object.entries(variants)) {
  const lens = [];
  for (let i = 0; i < 30; i++) {
    const b = bases[i % bases.length];
    const a = make(b, i); for (const k of Object.keys(a)) if (a[k] === undefined) delete a[k];
    lens.push((await encodeAnchor(a)).length);
  }
  const per = Math.round(lens.reduce((x, y) => x + y) / lens.length);
  const max = Math.max(...lens);
  const set10 = lens.slice(0, 10).reduce((x, y) => x + y + OVERHEAD, 0);
  const set30 = lens.reduce((x, y) => x + y + OVERHEAD, 0);
  rows.push({ variant: name, 'b64/stop avg': per, 'max': max, 'fits 2048': max <= 2048 ? 'yes' : 'NO', 'set×10': set10, 'set×30': set30 });
}
console.table(rows);

// v4 envelope comparison: whole set in one deflate
const { b64urlFromBytes } = await import('/home/ubuntu/backend.ai-webui/react/vite-plugins/review-overlay/client/codec.ts');
async function deflateAll(objs) {
  const raw = new TextEncoder().encode(JSON.stringify(objs));
  const cs = new CompressionStream('deflate-raw'); const w = cs.writable.getWriter(); w.write(raw); w.close();
  const out = new Uint8Array(await new Response(cs.readable).arrayBuffer()); return b64urlFromBytes(out).length;
}
for (const n of [10, 30]) {
  const stops = []; for (let i = 0; i < n; i++) { const b = bases[i % bases.length]; stops.push({ ...b, n: undefined, ch: text(KO, 280), ck: text(KO, 280), code: codeRefs(3) }); for (const k of Object.keys(stops.at(-1))) if (stops.at(-1)[k] === undefined) delete stops.at(-1)[k]; }
  console.log(`v4 envelope ×${n} (ch+ck 280 ko, code×3, set-level sha+pr once):`, await deflateAll({ v: 4, sha: SHA40, pr: 9605, stops }), 'chars');
}
// how much of a stop is the text? encode text-only
console.log('text-only ko 280×2 deflated b64:', await deflateAll({ ch: text(KO, 280), ck: text(KO, 280) }), '| en 280×2:', await deflateAll({ ch: text(EN, 280), ck: text(EN, 280) }));
