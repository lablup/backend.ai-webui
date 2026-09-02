import type { RepoContext } from '../repo-context.js';
import type { SchemaIndex } from './schema-sdl.js';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

/** The language the labels are indexed in. `--lang` only changes display. */
export const LABEL_INDEX_LANG = 'en';

/** Host components live here; BUI components carry their own locale files. */
export const HOST_COMPONENT_DIR = 'react/src';

/** How far a `title: t(...)` may sit from the `dataIndex` it labels. */
const PAIR_WINDOW = 320;

export interface UiLabel {
  /** The i18n key, e.g. `session.Status`. */
  key: string;
  /** The label in the requested language, English when it has no counterpart. */
  label: string;
  /** The language the label was actually read from. */
  lang: string;
}

export interface I18nIndexStats {
  filesScanned: number;
  /** Files that spread at least one `fragment … on <Type>`. */
  filesWithFragments: number;
  /** Distinct `Type.field` entries that got at least one i18n key. */
  labelledFields: number;
  /** Distinct i18n keys that resolved to at least one `Type.field`. */
  labelledKeys: number;
}

export interface I18nReverseIndex {
  /** `Type.field` -> i18n keys, in the order they were found. */
  byField: Map<string, string[]>;
  /** i18n key -> `Type.field` entries. */
  byKey: Map<string, string[]>;
  /** i18n key -> English label value. */
  labels: Map<string, string>;
  stats: I18nIndexStats;
}

const GRAPHQL_TAG = /graphql`([\s\S]*?)`/g;
const FRAGMENT_ON = /\bfragment\s+\w+\s+on\s+([A-Za-z_][A-Za-z0-9_]*)/g;
const COLUMN_TOKEN =
  /\b(dataIndex|key)\s*:\s*['"]([A-Za-z0-9_]+)['"]|\btitle\s*:\s*t\(\s*['"]([A-Za-z0-9_.-]+)['"]/g;

interface ColumnToken {
  kind: 'dataIndex' | 'key' | 'title';
  value: string;
  index: number;
}

function jsonLeaves(file: string): Array<[string, string]> {
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

/** One i18n store as a flat key -> value map, memoised per process. */
const STORES = new Map<string, Map<string, string>>();

export function i18nStore(
  context: RepoContext,
  lang: string,
): Map<string, string> {
  const file = join(context.i18nDir, `${lang}.json`);
  const cached = STORES.get(file);
  if (cached) return cached;
  const store = new Map(existsSync(file) ? jsonLeaves(file) : []);
  STORES.set(file, store);
  return store;
}

function tsxFiles(root: string): string[] {
  const found: string[] = [];
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (entry.name !== '__generated__' && entry.name !== 'node_modules') {
          walk(join(dir, entry.name));
        }
      } else if (entry.name.endsWith('.tsx')) {
        found.push(join(dir, entry.name));
      }
    }
  };
  if (!existsSync(root)) return [];
  walk(root);
  return found.sort();
}

function fragmentTypes(source: string): string[] {
  const types = new Set<string>();
  for (const tag of source.matchAll(GRAPHQL_TAG)) {
    for (const fragment of tag[1].matchAll(FRAGMENT_ON)) {
      types.add(fragment[1]);
    }
  }
  return [...types];
}

/** `dataIndex`/`key` paired with the nearest `title: t('…')` around it. */
function columnPairs(source: string): Array<{ field: string; key: string }> {
  const tokens: ColumnToken[] = [];
  for (const match of source.matchAll(COLUMN_TOKEN)) {
    tokens.push(
      match[3] !== undefined
        ? { kind: 'title', value: match[3], index: match.index }
        : {
            kind: match[1] as 'dataIndex' | 'key',
            value: match[2],
            index: match.index,
          },
    );
  }

  const pairs: Array<{ field: string; key: string }> = [];
  for (const [position, token] of tokens.entries()) {
    if (token.kind !== 'title') continue;
    let best: { token: ColumnToken; distance: number } | undefined;
    for (const offset of [-1, 1, -2, 2]) {
      const neighbour = tokens[position + offset];
      if (!neighbour || neighbour.kind === 'title') continue;
      const distance = Math.abs(neighbour.index - token.index);
      if (distance > PAIR_WINDOW) continue;
      // A `dataIndex` names the field; a `key` only usually does.
      const better =
        !best ||
        (neighbour.kind === 'dataIndex' && best.token.kind === 'key') ||
        (neighbour.kind === best.token.kind && distance < best.distance);
      if (better) best = { token: neighbour, distance };
    }
    if (best) pairs.push({ field: best.token.value, key: token.value });
  }
  return pairs;
}

const CACHE = new Map<string, I18nReverseIndex>();

/**
 * Map i18n labels to the GraphQL fields the WebUI renders them for. One
 * regex pass per host component file: a file's `fragment … on <Type>` tags say
 * which types it renders, and its table columns say which field each label
 * belongs to. Only pairs whose field exists on one of those types are kept.
 */
export function buildI18nReverseIndex(
  context: RepoContext,
  schema: SchemaIndex,
): I18nReverseIndex {
  const cached = CACHE.get(context.repoRoot);
  if (cached) return cached;

  const byField = new Map<string, string[]>();
  const byKey = new Map<string, string[]>();
  const labels = i18nStore(context, LABEL_INDEX_LANG);
  let filesWithFragments = 0;

  const files = tsxFiles(join(context.repoRoot, HOST_COMPONENT_DIR));
  for (const file of files) {
    const source = readFileSync(file, 'utf8');
    if (!source.includes('graphql`')) continue;
    const types = fragmentTypes(source);
    if (types.length === 0) continue;
    filesWithFragments += 1;

    for (const pair of columnPairs(source)) {
      if (!labels.has(pair.key)) continue;
      for (const typeName of types) {
        const type = schema.byName.get(typeName);
        if (!type?.fields.some((field) => field.name === pair.field)) continue;
        const id = `${typeName}.${pair.field}`;
        const keys = byField.get(id) ?? [];
        if (!keys.includes(pair.key)) keys.push(pair.key);
        byField.set(id, keys);
        const fields = byKey.get(pair.key) ?? [];
        if (!fields.includes(id)) fields.push(id);
        byKey.set(pair.key, fields);
      }
    }
  }

  const index: I18nReverseIndex = {
    byField,
    byKey,
    labels,
    stats: {
      filesScanned: files.length,
      filesWithFragments,
      labelledFields: byField.size,
      labelledKeys: byKey.size,
    },
  };
  CACHE.set(context.repoRoot, index);
  return index;
}

export function clearI18nIndexCache(): void {
  CACHE.clear();
  STORES.clear();
}

/** The label to print under a schema hit, in the requested language. */
export function uiLabelFor(
  context: RepoContext,
  index: I18nReverseIndex,
  fieldId: string,
  lang: string,
): UiLabel | undefined {
  const key = index.byField.get(fieldId)?.[0];
  if (!key) return undefined;
  const localized =
    lang === LABEL_INDEX_LANG ? undefined : i18nStore(context, lang).get(key);
  const label = localized ?? index.labels.get(key);
  if (!label) return undefined;
  return { key, label, lang: localized ? lang : LABEL_INDEX_LANG };
}

/** Every English label a field answers to; used for exact display-name hits. */
export function displayNamesFor(
  index: I18nReverseIndex,
  fieldId: string,
): string[] {
  const keys = index.byField.get(fieldId);
  if (!keys) return [];
  return keys
    .map((key) => index.labels.get(key))
    .filter((label): label is string => Boolean(label));
}

export function relativeSchemaPath(context: RepoContext): string {
  return relative(context.repoRoot, context.schemaPath).split(sep).join('/');
}
