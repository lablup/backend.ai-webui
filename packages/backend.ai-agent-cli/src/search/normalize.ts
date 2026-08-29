import type { RepoContext } from '../repo-context.js';
import type { TermEntry } from './terminology.js';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export interface Normalisation {
  /** `terminology` or `i18n`. */
  source: string;
  /** The canonical English term the query expands to. */
  canonical: string;
  /** Concept id, or `<lang> <i18n key>`. */
  ref: string;
}

/** How many canonical terms one query may pull in. Exact matches only. */
const MAX_NORMALISATIONS = 5;

const I18N_INDEX_LANG = 'en';

const fold = (value: string): string => value.trim().toLowerCase();

const isAscii = (value: string): boolean => {
  for (const char of value) {
    if (char.codePointAt(0)! > 127) return false;
  }
  return true;
};

function i18nLeaves(file: string): Array<[string, string]> {
  const leaves: Array<[string, string]> = [];
  const walk = (node: unknown, prefix: string): void => {
    if (typeof node === 'string') {
      leaves.push([prefix, node]);
      return;
    }
    if (!node || typeof node !== 'object' || Array.isArray(node)) return;
    for (const [key, value] of Object.entries(node)) {
      walk(value, prefix ? `${prefix}.${key}` : key);
    }
  };
  try {
    walk(JSON.parse(readFileSync(file, 'utf8')), '');
  } catch {
    return [];
  }
  return leaves;
}

function matchI18nStore(
  i18nDir: string,
  lang: string,
  query: string,
): Array<{ key: string; value: string }> {
  const file = join(i18nDir, `${lang}.json`);
  if (!existsSync(file)) return [];
  return i18nLeaves(file)
    .filter(([, value]) => fold(value) === query)
    .map(([key, value]) => ({ key, value }));
}

/**
 * Exact, case-insensitive matches of the query against terminology terms and
 * i18n label values. Non-English stores are consulted only for a query that
 * carries non-ASCII characters — the same work for every `--lang`, so recall
 * never depends on the display language.
 */
export function normaliseQuery(
  context: RepoContext,
  terms: TermEntry[],
  rawQuery: string,
): Normalisation[] {
  const query = fold(rawQuery);
  if (!query) return [];
  const found: Normalisation[] = [];
  const seen = new Set<string>();
  // One line per canonical term: several i18n keys carrying the same label are
  // one normalisation, not three.
  const push = (entry: Normalisation): void => {
    const key = `${entry.source}:${fold(entry.canonical)}`;
    if (seen.has(key)) return;
    seen.add(key);
    found.push(entry);
  };

  for (const term of terms) {
    if (term.aliases.some((alias) => fold(alias) === query)) {
      push({ source: 'terminology', canonical: term.title, ref: term.id });
    }
  }

  const english = matchI18nStore(context.i18nDir, I18N_INDEX_LANG, query);
  for (const match of english) {
    push({
      source: 'i18n',
      canonical: match.value,
      ref: `${I18N_INDEX_LANG} ${match.key}`,
    });
  }

  if (english.length === 0 && !isAscii(query)) {
    const englishByKey = new Map(
      i18nLeaves(join(context.i18nDir, `${I18N_INDEX_LANG}.json`)),
    );
    const others = readdirSync(context.i18nDir)
      .filter((name) => name.endsWith('.json') && name !== 'en.json')
      .sort();
    for (const name of others) {
      const lang = name.slice(0, -'.json'.length);
      for (const match of matchI18nStore(context.i18nDir, lang, query)) {
        const canonical = englishByKey.get(match.key);
        if (!canonical) continue;
        push({ source: 'i18n', canonical, ref: `${lang} ${match.key}` });
      }
    }
  }

  return found.slice(0, MAX_NORMALISATIONS);
}

/** The query plus every canonical term it normalised to, deduped. */
export function expandQuery(
  rawQuery: string,
  normalisations: Normalisation[],
): string[] {
  const variants = [rawQuery, ...normalisations.map((one) => one.canonical)];
  const seen = new Set<string>();
  return variants.filter((variant) => {
    const key = fold(variant);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
