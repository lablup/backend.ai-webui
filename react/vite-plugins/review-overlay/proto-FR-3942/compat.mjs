import { encodeAnchor, decodeAnchor } from '/home/ubuntu/backend.ai-webui/react/vite-plugins/review-overlay/client/codec.ts';
import { createHash } from 'node:crypto';
const a = { v: 3, s: '#root > div > button', p: '/data', q: 'tab=general', tag: 'button', txt: 'Upload', tid: 'folder-upload', ch: '변경', ck: '확인', code: [{ path: 'react/src/components/FolderExplorer/UploadConflictModal.tsx', line: 142 }], sha: 'c61efbf21a4d9e0b7f3c2d8e5a6b1c0d9e8f7a6b', pr: 9605 };
const b = await encodeAnchor(a); const d = await decodeAnchor(b);
console.log('current decodeAnchor accepts stop:', d !== null, '| unknown keys preserved:', d && 'ch' in d && 'code' in d);
const h = createHash('sha256').update(a.code[0].path).digest('hex');
console.log(`code link: https://github.com/lablup/backend.ai-webui/pull/${a.pr}/files#diff-${h}R${a.code[0].line}`);
