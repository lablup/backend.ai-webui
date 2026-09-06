import { CliError } from '../errors.js';
import type { RepoContext } from '../repo-context.js';
import { latestDocsVersion } from './docs-config.js';
import type { DocsPage, DocsSection } from './docs-corpus.js';
import {
  INDEX_LANG,
  loadDocsPage,
  loadDocsPages,
  loadDocsSections,
  localizeHeading,
} from './docs-corpus.js';
import type { UiLabel } from './i18n-index.js';
import { pageBody, sliceSection } from './markdown.js';
import type { Normalisation } from './normalize.js';
import { expandQuery, normaliseQuery } from './normalize.js';
import type { Candidate, Ranked, Reason } from './rank.js';
import {
  compareRanked,
  scoreCandidate,
  scoreSchemaCandidate,
  selectWithReservedSlots,
} from './rank.js';
import {
  collapseKey,
  schemaContext,
  schemaHitLabel,
  schemaLocation,
} from './schema-search.js';
import type { TermEntry } from './terminology.js';
import { loadTerminology, terminologyPath } from './terminology.js';
import {
  DOCS_VERSION_FALLBACK,
  docsSectionUrl,
  docsVersionFor,
} from './urls.js';
import { relative, sep } from 'node:path';

/** Every domain one query is ranked across. */
export const DOMAINS = ['docs', 'schema', 'terminology'] as const;

export type Domain = (typeof DOMAINS)[number];

export const DEFAULT_LIMIT = 10;

/** The manual's own glossary section — where a terminology hit points. */
const GLOSSARY_PAGE = 'overview';
const GLOSSARY_HEADING_LEVEL = 2;

/** The published shape of one hit. Ranking metadata stays internal. */
export interface SearchHit {
  id: string;
  domain: string;
  score: number;
  reason: Reason;
  title: string;
  /** The language the docs section resolved in; English when parity failed. */
  lang?: string;
  path?: string;
  url: string;
  /** The i18n label the WebUI renders a schema field under, when it has one. */
  uiLabel?: UiLabel;
  command: string;
}

interface ScoredHit extends Ranked {
  hit: SearchHit;
}

export interface SearchData {
  kind: 'search';
  query: string;
  lang: string;
  docsVersion: string;
  domains: string[];
  limit: number;
  /** Hits before `limit` and the reserved-slot selection were applied. */
  matched: number;
  total: number;
  normalised: Normalisation[];
  expansions: string[];
  hits: SearchHit[];
}

export interface SearchOptions {
  query: string;
  lang: string;
  domains: Domain[];
  limit: number;
  docsVersion?: string;
}

export function resolveDocsVersion(
  context: RepoContext,
  override?: string,
): string {
  if (override?.trim()) return override.trim();
  let fallback: string = DOCS_VERSION_FALLBACK;
  try {
    fallback = latestDocsVersion(context) ?? DOCS_VERSION_FALLBACK;
  } catch {
    // No docs config: keep the literal channel rather than fail the search.
  }
  return docsVersionFor(context.repoVersion, fallback);
}

function docsCandidate(section: DocsSection): Candidate {
  return {
    title: section.heading.text,
    // An exact page-title query hits every section of that page at field
    // strength; the title also rides along in the body for token recall.
    fields: [section.page.title],
    fieldReason: 'page-title',
    body: `${section.page.title} ${section.haystack}`,
  };
}

function termCandidate(term: TermEntry): Candidate {
  return {
    title: term.title,
    fields: term.aliases,
    fieldReason: 'alias',
    body: `${term.aliases.join(' ')} ${term.description}`,
  };
}

/** The glossary anchor in the requested language, or the overview page. */
function glossaryUrl(
  pages: DocsPage[],
  context: RepoContext,
  lang: string,
  version: string,
  cache: Map<string, DocsPage | null>,
): string {
  const overview = pages.find((page) => page.slug === GLOSSARY_PAGE);
  if (!overview) return docsSectionUrl(version, lang, GLOSSARY_PAGE);
  const index = overview.parsed.headings.findIndex(
    (heading) => heading.level === GLOSSARY_HEADING_LEVEL,
  );
  if (index < 0) return docsSectionUrl(version, lang, GLOSSARY_PAGE);
  const section: DocsSection = {
    page: overview,
    heading: overview.parsed.headings[index],
    index,
    body: '',
    haystack: '',
  };
  const localized = localizeHeading(context, section, lang, cache);
  return docsSectionUrl(version, lang, GLOSSARY_PAGE, localized.anchor);
}

/** A type is a coarser unit than its members, so it wins an equal score. */
const SCHEMA_DEPTH = { type: 1, field: 2, 'enum-value': 3 } as const;

export function docsSectionId(slug: string, anchor: string): string {
  return `docs:${slug}#${anchor}`;
}

export function runSearch(
  context: RepoContext,
  options: SearchOptions,
): SearchData {
  const version = resolveDocsVersion(context, options.docsVersion);
  const terms = loadTerminology(context);
  const owners = options.domains.includes('schema')
    ? schemaContext(context).i18n.byKey
    : undefined;
  const normalised = normaliseQuery(
    context,
    terms,
    options.query,
    (key) => owners?.get(key)?.[0],
  );
  const variants = expandQuery(options.query, normalised);
  const pages = loadDocsPages(context, INDEX_LANG);
  const cache = new Map<string, DocsPage | null>();

  const ranked: ScoredHit[] = [];

  if (options.domains.includes('docs')) {
    for (const section of loadDocsSections(pages)) {
      const evidence = scoreCandidate(docsCandidate(section), variants);
      if (!evidence) continue;
      const localized = localizeHeading(context, section, options.lang, cache);
      const id = docsSectionId(section.page.slug, section.heading.anchor);
      ranked.push({
        id,
        domain: 'docs',
        score: evidence.score,
        reason: evidence.reason,
        bodyCoverage: evidence.bodyCoverage,
        titleLength: section.heading.text.length,
        depth: section.heading.level,
        hit: {
          id,
          domain: 'docs',
          score: evidence.score,
          reason: evidence.reason,
          title: localized.title,
          lang: localized.lang,
          path: localized.repoPath,
          url: docsSectionUrl(
            version,
            localized.lang,
            section.page.slug,
            localized.anchor,
          ),
          command: `bai-agent docs show ${id}`,
        },
      });
    }
  }

  if (options.domains.includes('terminology')) {
    const path = relative(context.repoRoot, terminologyPath(context))
      .split(sep)
      .join('/');
    const url = glossaryUrl(pages, context, options.lang, version, cache);
    for (const term of terms) {
      const evidence = scoreCandidate(termCandidate(term), variants);
      if (!evidence) continue;
      const id = `term:${term.id}`;
      ranked.push({
        id,
        domain: 'terminology',
        score: evidence.score,
        reason: evidence.reason,
        bodyCoverage: evidence.bodyCoverage,
        titleLength: term.title.length,
        // Terms are a more precise unit than an h2, so they win equal scores.
        depth: 1,
        hit: {
          id,
          domain: 'terminology',
          score: evidence.score,
          reason: evidence.reason,
          title: term.concept.preferred[options.lang] ?? term.title,
          path,
          url,
          command: `bai-agent search "${term.title}" --domain docs`,
        },
      });
    }
  }

  if (options.domains.includes('schema')) {
    const { i18n, entries } = schemaContext(context);
    const groups = new Map<string, ScoredHit[]>();
    for (const entry of entries) {
      const evidence = scoreSchemaCandidate(entry.candidate, variants);
      if (!evidence) continue;
      const id = `schema:${entry.id}`;
      const label = schemaHitLabel(context, i18n, entry, options.lang);
      const scored: ScoredHit = {
        id,
        domain: 'schema',
        score: evidence.score,
        reason: evidence.reason,
        linked: entry.linked,
        // Only a description match may break a tie on description coverage.
        bodyCoverage:
          evidence.reason === 'desc-tokens' ? evidence.bodyCoverage : 0,
        titleLength: entry.id.length,
        depth: SCHEMA_DEPTH[entry.entryKind],
        hit: {
          id,
          domain: 'schema',
          score: evidence.score,
          reason: evidence.reason,
          title: entry.id,
          ...schemaLocation(context, entry.line),
          ...(label ? { uiLabel: label } : {}),
          command: `bai-agent schema show ${entry.id}`,
        },
      };
      const key = collapseKey(entry);
      groups.set(key, [...(groups.get(key) ?? []), scored]);
    }
    const collapsed = [...groups.values()].map((group) => {
      const best = Math.max(...group.map((one) => one.score));
      return group.filter((one) => one.score === best).sort(compareRanked)[0];
    });
    // An enum value that only matched through its enum's name repeats what the
    // enum hit already says.
    const typeScores = new Map(
      collapsed
        .filter((one) => !one.id.includes('.'))
        .map((one) => [one.id.slice('schema:'.length), one.score]),
    );
    ranked.push(
      ...collapsed.filter(
        (one) =>
          one.depth !== SCHEMA_DEPTH['enum-value'] ||
          (typeScores.get(one.id.slice('schema:'.length).split('.')[0]) ?? -1) <
            one.score,
      ),
    );
  }

  const selected = selectWithReservedSlots(
    ranked,
    options.domains,
    options.limit,
  );
  const hits = selected.map((entry) => entry.hit);
  return {
    kind: 'search',
    query: options.query,
    lang: options.lang,
    docsVersion: version,
    domains: options.domains,
    limit: options.limit,
    matched: ranked.length,
    total: hits.length,
    normalised,
    expansions: variants,
    hits,
  };
}

export interface ShowData {
  kind: 'show';
  id: string;
  slug: string;
  anchor?: string;
  lang: string;
  level: number;
  title: string;
  path: string;
  url: string;
  full: boolean;
  content: string;
}

/** `docs:<slug>#<anchor>`, `<slug>#<anchor>`, `docs:<slug>` and `<slug>`. */
function parseDocId(raw: string): { slug: string; anchor?: string } {
  const withoutDomain = raw.startsWith('docs:') ? raw.slice(5) : raw;
  const hash = withoutDomain.indexOf('#');
  if (hash < 0) return { slug: withoutDomain };
  return {
    slug: withoutDomain.slice(0, hash),
    anchor: withoutDomain.slice(hash + 1),
  };
}

function editDistance(a: string, b: string): number {
  const previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    let diagonal = previous[0];
    previous[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const next = Math.min(
        previous[j] + 1,
        previous[j - 1] + 1,
        diagonal + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      diagonal = previous[j];
      previous[j] = next;
    }
  }
  return previous[b.length];
}

function closestIds(known: string[], raw: string, count: number): string[] {
  return [...known]
    .sort((a, b) => {
      const delta = editDistance(a, raw) - editDistance(b, raw);
      return delta !== 0 ? delta : a.localeCompare(b);
    })
    .slice(0, count);
}

export interface ShowOptions {
  id: string;
  lang: string;
  full: boolean;
  docsVersion?: string;
}

/** The same page in `lang`, or the English one when parity does not hold. */
function localizedPage(
  context: RepoContext,
  page: DocsPage,
  lang: string,
  cache: Map<string, DocsPage | null>,
): { lang: string; page: DocsPage } {
  if (lang === INDEX_LANG) return { lang: INDEX_LANG, page };
  const translated = loadDocsPage(context, lang, page.relativePath, cache);
  const parity =
    translated?.parsed.headings.length === page.parsed.headings.length;
  return parity && translated
    ? { lang, page: translated }
    : { lang: INDEX_LANG, page };
}

export function showDocsSection(
  context: RepoContext,
  options: ShowOptions,
): ShowData {
  const version = resolveDocsVersion(context, options.docsVersion);
  const { slug, anchor } = parseDocId(options.id);
  const pages = loadDocsPages(context, INDEX_LANG);
  const cache = new Map<string, DocsPage | null>();
  const page = pages.find((entry) => entry.slug === slug);
  const knownIds = pages.flatMap((entry) =>
    entry.parsed.headings
      .filter((heading) => heading.level > 1)
      .map((heading) => docsSectionId(entry.slug, heading.anchor)),
  );
  const notFound = (): CliError =>
    new CliError('not_found', `Unknown docs id: ${options.id}.`, {
      suggestions: closestIds(knownIds, options.id, 5),
      hint: `bai-agent search "${slug}" --domain docs`,
    });

  if (!page) throw notFound();
  const index = anchor
    ? page.parsed.headings.findIndex((heading) => heading.anchor === anchor)
    : -1;
  if (anchor && index < 0) throw notFound();

  const target = localizedPage(context, page, options.lang, cache);
  const heading = index >= 0 ? target.page.parsed.headings[index] : undefined;
  const full = options.full || index < 0;

  return {
    kind: 'show',
    id: anchor ? docsSectionId(slug, anchor) : `docs:${slug}`,
    slug,
    ...(anchor ? { anchor } : {}),
    lang: target.lang,
    level: heading?.level ?? 1,
    title: heading?.text ?? target.page.title,
    path: target.page.repoPath,
    url: docsSectionUrl(version, target.lang, slug, heading?.anchor),
    full,
    content: full
      ? pageBody(target.page.parsed)
      : sliceSection(target.page.parsed, index).body,
  };
}
