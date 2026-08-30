export const DOCS_SITE = 'https://webui.docs.backend.ai';

/**
 * The channel a checkout with no resolvable version points at when the docs
 * config cannot name the `latest: true` label. The site only publishes
 * redirect stubs at `latest/<lang>/index.html`, so callers should pass the
 * resolved label (`latestDocsVersion`) whenever they can.
 */
export const DOCS_VERSION_FALLBACK = 'latest';

/** In-development tip: prereleases have no numbered docs site yet. */
export const DOCS_VERSION_NEXT = 'next';

/**
 * Map a checkout version to a published docs channel, as WEBUIHelpButton does:
 * a prerelease tracks the workspace tip (`next`), a stable release its
 * `major.minor`, anything unparseable the `fallback` channel.
 */
export function docsVersionFor(
  repoVersion: string,
  fallback: string = DOCS_VERSION_FALLBACK,
): string {
  const version = repoVersion.trim();
  if (!version) return fallback;
  if (version.includes('-')) return DOCS_VERSION_NEXT;
  const [major, minor] = version.split('.');
  if (!/^\d+$/.test(major ?? '') || !/^\d+$/.test(minor ?? '')) {
    return fallback;
  }
  return `${major}.${minor}`;
}

export function docsPageUrl(
  version: string,
  lang: string,
  slug: string,
): string {
  return `${DOCS_SITE}/${version}/${lang}/${slug}.html`;
}

export function docsSectionUrl(
  version: string,
  lang: string,
  slug: string,
  anchor?: string,
): string {
  const page = docsPageUrl(version, lang, slug);
  return anchor ? `${page}#${anchor}` : page;
}
