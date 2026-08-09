/**
 * One-shot extractor: lift `Form.optional` out of antd's own locale bundles
 * (MIT, https://github.com/ant-design/ant-design) into BUI's locale JSONs as
 * `form.Optional`.
 *
 * `requiredMark="optional"` has 5 call sites in this repo, and the suffix it
 * appends came from antd's `locale.Form.optional` — a string the engine had
 * hard-coded in English. Same provenance and same key shape as
 * `extract-validate-messages.mjs`; run once, the JSONs own it afterwards.
 */
import * as fs from 'node:fs';
import { createRequire } from 'node:module';
import * as path from 'node:path';

const require = createRequire(import.meta.url);
const ANTD =
  '/home/ubuntu/.local/share/pnpm/store/v11/links/@/antd/6.5.0/619eae994ae048e0dbeaff97b3a451cb23632d904bca7891792c8528ba591a29/node_modules/antd/lib/locale';

const LANGS = {
  de: 'de_DE',
  el: 'el_GR',
  en: 'en_US',
  es: 'es_ES',
  fi: 'fi_FI',
  fr: 'fr_FR',
  id: 'id_ID',
  it: 'it_IT',
  ja: 'ja_JP',
  ko: 'ko_KR',
  mn: 'mn_MN',
  ms: 'ms_MY',
  pl: 'pl_PL',
  'pt-BR': 'pt_BR',
  pt: 'pt_PT',
  ru: 'ru_RU',
  th: 'th_TH',
  tr: 'tr_TR',
  vi: 'vi_VN',
  'zh-CN': 'zh_CN',
  'zh-TW': 'zh_TW',
};

const LOCALE_DIR = path.resolve(
  process.cwd(),
  'packages/backend.ai-ui/src/locale',
);

for (const [bui, antd] of Object.entries(LANGS)) {
  const mod = require(path.join(ANTD, `${antd}.js`));
  const optional = (mod.default ?? mod)?.Form?.optional;
  const file = path.join(LOCALE_DIR, `${bui}.json`);
  const json = JSON.parse(fs.readFileSync(file, 'utf8'));
  json.form ??= {};
  json.form.Optional = optional ?? '(optional)';
  // Keep `form`'s keys sorted the way the rest of the catalog is.
  json.form = Object.fromEntries(
    Object.entries(json.form).sort(([a], [b]) => a.localeCompare(b)),
  );
  fs.writeFileSync(file, `${JSON.stringify(json, null, 2)}\n`);
  console.log(`${bui}: ${json.form.Optional}`);
}
