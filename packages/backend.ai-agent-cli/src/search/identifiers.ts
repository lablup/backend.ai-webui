/**
 * Identifier handling for the schema domain: GraphQL names are written in
 * three spellings (`camelCase`, `PascalCase`, `snake_case`) that all have to
 * answer to the same query.
 */

const TOKEN = /[A-Z]+[0-9]*(?![a-z])|[A-Z][a-z0-9]*|[a-z]+[0-9]*|[0-9]+/g;

const VERSION_SUFFIX = /^v[0-9]+$/;

/** Tokens of one identifier, camel/Pascal/snake all reduced to lower words. */
export function identifierTokens(name: string): string[] {
  return (name.match(TOKEN) ?? []).map((token) => token.toLowerCase());
}

/** The spelling-independent key an exact name match compares against. */
export function normaliseIdentifier(name: string): string {
  return identifierTokens(name).join(' ');
}

/** Query text reduced to the same key, so `scaling_group` finds ScalingGroup. */
export function normaliseIdentifierQuery(query: string): string {
  return query
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
    .flatMap((word) => identifierTokens(word))
    .join(' ');
}

/** From this many tokens an identifier is matched on its tail only. */
export const LONG_IDENTIFIER_TOKENS = 4;

/**
 * A long identifier matches on its tail only: `admin_keypair_resource_policies_v2`
 * answers to "resource policies", not to "admin". The trailing API-version
 * token does not count towards the length and rides along on the result.
 */
export function reduceTokens(tokens: string[]): string[] {
  const version = tokens.length > 0 && VERSION_SUFFIX.test(tokens.at(-1)!);
  const core = version ? tokens.slice(0, -1) : tokens;
  const kept =
    core.length >= LONG_IDENTIFIER_TOKENS ? core.slice(-2) : [...core];
  if (version) kept.push(tokens.at(-1)!);
  return kept;
}

export function reduceIdentifier(name: string): string[] {
  return reduceTokens(identifierTokens(name));
}
