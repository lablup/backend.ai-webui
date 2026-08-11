/**
 * One-shot extractor: lift `Form.defaultValidateMessages` out of antd's own
 * locale bundles (MIT, https://github.com/ant-design/ant-design) and merge the
 * subset this repository's rule engine can emit into BUI's locale JSONs under
 * `form.validateMessages`.
 *
 * Run once; the JSONs are the source of truth afterwards. Kept in .scratch so
 * the provenance of the strings is reproducible.
 */
import { createRequire } from 'node:module';
import * as fs from 'node:fs';
import * as path from 'node:path';

const require = createRequire(import.meta.url);
const ANTD =
  '/home/ubuntu/.local/share/pnpm/store/v11/links/@/antd/6.5.0/619eae994ae048e0dbeaff97b3a451cb23632d904bca7891792c8528ba591a29/node_modules/antd/lib/locale';

// BUI locale JSON basename -> antd locale module.
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

/**
 * BUI's i18n JSON schema (`packages/backend.ai-ui/i18n.schema.json`) reads a
 * lowercase key as a nested object and an uppercase/digit key as a string
 * leaf, so every LEAF is capitalised and every GROUP stays lowercase.
 */
function shape(m) {
  if (!m) return null;
  const out = {};
  if (m.default) out.Default = m.default;
  if (m.required) out.Required = m.required;
  if (m.whitespace) out.Whitespace = m.whitespace;
  const types = {};
  for (const k of ['string', 'number', 'object', 'email', 'url']) {
    if (m.types?.[k]) types[k[0].toUpperCase() + k.slice(1)] = m.types[k];
  }
  if (Object.keys(types).length) out.types = types;
  for (const group of ['string', 'number', 'array']) {
    const g = {};
    for (const k of ['len', 'min', 'max', 'range']) {
      if (m[group]?.[k]) g[k[0].toUpperCase() + k.slice(1)] = m[group][k];
    }
    if (Object.keys(g).length) out[group] = g;
  }
  if (m.pattern?.mismatch) out.pattern = { Mismatch: m.pattern.mismatch };
  return out;
}

/** Insert `form` after `error` / before `general` so keys stay sorted-ish. */
function withForm(json, form) {
  const out = {};
  let inserted = false;
  for (const [k, v] of Object.entries(json)) {
    if (!inserted && k !== '$schema' && k.localeCompare('form') > 0) {
      out.form = form;
      inserted = true;
    }
    if (k === 'form') continue;
    out[k] = v;
  }
  if (!inserted) out.form = form;
  return out;
}

const report = [];
for (const [lang, antdName] of Object.entries(LANGS)) {
  const mod = require(path.join(ANTD, `${antdName}.js`));
  const locale = mod.default ?? mod;
  const msgs = locale.Form?.defaultValidateMessages;
  const shaped = shape(msgs);
  if (!shaped) {
    report.push(`${lang}: NO Form.defaultValidateMessages in ${antdName}`);
    continue;
  }
  const file = path.join(LOCALE_DIR, `${lang}.json`);
  const json = JSON.parse(fs.readFileSync(file, 'utf8'));
  const next = withForm(json, { validateMessages: shaped });
  fs.writeFileSync(file, JSON.stringify(next, null, 2) + '\n');
  const leaves = JSON.stringify(shaped).match(/":"/g)?.length ?? 0;
  report.push(`${lang} <- antd/${antdName}: ${leaves} templates`);
}
console.log(report.join('\n'));
