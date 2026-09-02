import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// Every key of en.json must exist in every other catalog with a non-empty value
// (FR-3839): a missing key falls back to English at runtime without any signal.
const PLACEHOLDER = '__NOT_TRANSLATED__';

type Catalog = { [key: string]: string | Catalog };

function flatten(obj: Catalog, prefix = '', out: Record<string, string> = {}) {
  for (const [key, value] of Object.entries(obj)) {
    if (key === '$schema') continue;
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object') flatten(value, path, out);
    else out[path] = value;
  }
  return out;
}

// jsdom gives this file a non-file import.meta.url; testPath is the real one.
const localeDir = resolve(dirname(expect.getState().testPath ?? ''), '..');

function readCatalog(file: string) {
  return flatten(JSON.parse(readFileSync(join(localeDir, file), 'utf8')));
}

const en = readCatalog('en.json');
const languages = readdirSync(localeDir)
  .filter((file) => file.endsWith('.json') && file !== 'en.json')
  .sort();

describe('BUI locale key parity with en.json', () => {
  it('has the 20 non-English catalogs', () => {
    expect(languages).toHaveLength(20);
  });

  it.each(languages)('%s carries every en key with a real value', (file) => {
    const catalog = readCatalog(file);
    const missing = Object.keys(en).filter((key) => !(key in catalog));
    // A blank is legitimate where the language drops the token, so only an
    // empty string standing in for wordful English counts.
    const empty = Object.keys(en).filter(
      (key) =>
        key in catalog && catalog[key] === '' && /[\p{L}\p{N}]/u.test(en[key]),
    );
    const placeholder = Object.entries(catalog)
      .filter(([, value]) => value.includes(PLACEHOLDER))
      .map(([key]) => key);

    expect(missing, 'keys present in en.json but absent here').toEqual([]);
    expect(empty, 'keys whose value is empty').toEqual([]);
    expect(placeholder, `keys still holding ${PLACEHOLDER}`).toEqual([]);
  });
});
