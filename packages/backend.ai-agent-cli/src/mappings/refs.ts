import type { RepoContext } from '../repo-context.js';
import type { DocsPage, DocsSection } from '../search/docs-corpus.js';
import {
  INDEX_LANG,
  loadDocsPages,
  localizeHeading,
} from '../search/docs-corpus.js';
import { identifierTokens } from '../search/identifiers.js';
import type { SchemaIndex, SchemaType } from '../search/schema-sdl.js';
import { slugify } from '../search/slug.js';
import type { TermEntry } from '../search/terminology.js';
import { docsSectionUrl } from '../search/urls.js';

export interface ResolvedDocsRef {
  /** The `<slug>#<heading>` reference as written in the mapping. */
  ref: string;
  slug: string;
  /** The English heading anchor the reference resolved to. */
  anchor: string;
  /** Title and anchor in the requested language, English on a parity gap. */
  lang: string;
  title: string;
  localizedAnchor: string;
  path: string;
  url: string;
}

/** `<slug>#<heading>`; the heading half may be bare or the full page anchor. */
export function parseDocsRef(
  ref: string,
): { slug: string; heading: string } | undefined {
  const hash = ref.indexOf('#');
  if (hash <= 0 || hash === ref.length - 1) return undefined;
  return { slug: ref.slice(0, hash), heading: ref.slice(hash + 1) };
}

/**
 * Resolve a mapping's `docs:` reference against the English manual, then map
 * it into `lang` the way `search` does — by heading index, so the anchor stays
 * in the target language's own script.
 */
export function resolveDocsRef(
  context: RepoContext,
  ref: string,
  lang: string,
  version: string,
  pages: DocsPage[] = loadDocsPages(context, INDEX_LANG),
  cache: Map<string, DocsPage | null> = new Map(),
): ResolvedDocsRef | undefined {
  const parsed = parseDocsRef(ref);
  if (!parsed) return undefined;
  const page = pages.find((entry) => entry.slug === parsed.slug);
  if (!page) return undefined;

  const wanted = parsed.heading.toLowerCase();
  const index = page.parsed.headings.findIndex(
    (heading) =>
      heading.level > 1 &&
      (heading.anchor === wanted || slugify(heading.text) === wanted),
  );
  if (index < 0) return undefined;

  const heading = page.parsed.headings[index];
  const section: DocsSection = { page, heading, index, body: '', haystack: '' };
  const localized = localizeHeading(context, section, lang, cache);
  return {
    ref,
    slug: page.slug,
    anchor: heading.anchor,
    lang: localized.lang,
    title: localized.title,
    localizedAnchor: localized.anchor,
    path: localized.repoPath,
    url: docsSectionUrl(version, localized.lang, page.slug, localized.anchor),
  };
}

export function findConcept(
  terms: TermEntry[],
  id: string,
): TermEntry | undefined {
  return terms.find((term) => term.id === id);
}

/** Trailing tokens that name the API shape, not the concept. */
const SHAPE_TOKENS = new Set(['node', 'v2', 'v3']);

const conceptKey = (tokens: string[]): string =>
  tokens.filter((token) => !SHAPE_TOKENS.has(token)).join(' ');

/**
 * A terminology entry whose canonical term is spelled exactly like the
 * identifier's own tokens — `Endpoint` -> the `endpoint` concept. Never a
 * partial match: a wrong concept reads as an authored decision.
 */
export function heuristicConcept(
  terms: TermEntry[],
  name: string,
): TermEntry | undefined {
  const key = conceptKey(identifierTokens(name));
  if (!key) return undefined;
  return terms.find((term) =>
    term.aliases.some((alias) => conceptKey(identifierTokens(alias)) === key),
  );
}

/** i18n key candidates for a field the reverse index could not reach. */
export function heuristicLabelKeys(
  type: SchemaType,
  fieldName: string,
): string[] {
  const leaf = identifierTokens(fieldName)
    .map((token) => token[0].toUpperCase() + token.slice(1))
    .join('');
  if (!leaf) return [];
  const namespaces = identifierTokens(type.name).filter(
    (token) => !SHAPE_TOKENS.has(token),
  );
  return [...new Set(namespaces)].map((namespace) => `${namespace}.${leaf}`);
}

/** The enum a field's type names, when it names one. */
export function enumTypeFor(
  schema: SchemaIndex,
  namedType: string | undefined,
): SchemaType | undefined {
  if (!namedType) return undefined;
  const type = schema.byName.get(namedType);
  return type?.kind === 'enum' ? type : undefined;
}
