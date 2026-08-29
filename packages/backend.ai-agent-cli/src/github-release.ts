import { CliError } from './errors.js';
import { CLI_NAME, cliVersion } from './meta.js';

/** The backend whose composed SDL the WebUI is written against. */
export const BACKEND_REPO = 'lablup/backend.ai';

/** The release asset carrying the federation-composed schema. */
export const SUPERGRAPH_ASSET = 'supergraph.graphql';

export const GITHUB_API = 'https://api.github.com';

type Env = Record<string, string | undefined>;

export interface ReleaseAsset {
  name: string;
  size: number;
  url: string;
}

export interface ResolvedRelease {
  tag: string;
  /** `flag` when `--tag` named it, `latest` when the API picked it. */
  tagSource: 'flag' | 'latest';
  asset: ReleaseAsset;
}

export interface ReleaseLookupOptions {
  tag?: string;
  fetchImpl?: typeof fetch;
  env?: Env;
}

interface ReleasePayload {
  tag_name?: string;
  assets?: Array<{
    name?: string;
    size?: number;
    browser_download_url?: string;
  }>;
}

/** `GITHUB_TOKEN` is used only against api.github.com, never the asset CDN. */
function apiHeaders(env: Env): Record<string, string> {
  const token = env.GITHUB_TOKEN?.trim();
  return {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': `Backend.AI ${CLI_NAME}/${cliVersion()}`,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function unreachable(url: string, error: unknown): CliError {
  return new CliError(
    'internal',
    `Cannot reach ${url}: ${error instanceof Error ? error.message : String(error)}`,
    { hint: `${CLI_NAME} doctor`, cause: error },
  );
}

const RATE_LIMIT_HINT = `GITHUB_TOKEN=<token> ${CLI_NAME} schema sync`;

/**
 * Resolve `--tag` (or the latest release) to the `supergraph.graphql` asset.
 * Two calls at most, so an unauthenticated run stays well inside the anonymous
 * rate limit.
 */
export async function resolveRelease(
  options: ReleaseLookupOptions = {},
): Promise<ResolvedRelease> {
  const env = options.env ?? process.env;
  const doFetch = options.fetchImpl ?? fetch;
  const tag = options.tag?.trim();
  const url = tag
    ? `${GITHUB_API}/repos/${BACKEND_REPO}/releases/tags/${encodeURIComponent(tag)}`
    : `${GITHUB_API}/repos/${BACKEND_REPO}/releases/latest`;

  let response: Response;
  try {
    response = await doFetch(url, { headers: apiHeaders(env) });
  } catch (error) {
    throw unreachable(url, error);
  }

  if (response.status === 404) {
    throw new CliError(
      'not_found',
      tag
        ? `No ${BACKEND_REPO} release tagged ${tag}.`
        : `${BACKEND_REPO} has no published release.`,
      { hint: `${CLI_NAME} schema sync --dry-run` },
    );
  }
  if (response.status === 403 || response.status === 429) {
    throw new CliError(
      'internal',
      `GitHub rate-limited the release lookup (HTTP ${response.status}).`,
      { hint: RATE_LIMIT_HINT },
    );
  }
  if (!response.ok) {
    throw new CliError(
      'internal',
      `GitHub returned HTTP ${response.status} for ${url}.`,
      { hint: `${CLI_NAME} doctor` },
    );
  }

  const payload = (await response.json()) as ReleasePayload;
  const resolvedTag = payload.tag_name?.trim();
  if (!resolvedTag) {
    throw new CliError('internal', `${url} returned a release with no tag.`, {
      hint: `${CLI_NAME} doctor`,
    });
  }

  const assets = payload.assets ?? [];
  const asset = assets.find((entry) => entry.name === SUPERGRAPH_ASSET);
  if (!asset?.browser_download_url) {
    throw new CliError(
      'not_found',
      `Release ${resolvedTag} has no ${SUPERGRAPH_ASSET} asset.`,
      {
        suggestions: assets
          .map((entry) => entry.name)
          .filter((name): name is string => Boolean(name))
          .slice(0, 5),
        hint: `${CLI_NAME} schema sync --tag <another tag> --dry-run`,
      },
    );
  }

  return {
    tag: resolvedTag,
    tagSource: tag ? 'flag' : 'latest',
    asset: {
      name: SUPERGRAPH_ASSET,
      size: asset.size ?? 0,
      url: asset.browser_download_url,
    },
  };
}

/** Downloads the asset bytes. No auth header: the URL redirects to a CDN. */
export async function downloadReleaseAsset(
  asset: ReleaseAsset,
  options: { fetchImpl?: typeof fetch } = {},
): Promise<Buffer> {
  const doFetch = options.fetchImpl ?? fetch;
  let response: Response;
  try {
    response = await doFetch(asset.url, {
      headers: { 'User-Agent': `Backend.AI ${CLI_NAME}/${cliVersion()}` },
    });
  } catch (error) {
    throw unreachable(asset.url, error);
  }
  if (!response.ok) {
    throw new CliError(
      'internal',
      `GitHub returned HTTP ${response.status} for ${asset.url}.`,
      {
        hint: response.status === 429 ? RATE_LIMIT_HINT : `${CLI_NAME} doctor`,
      },
    );
  }
  return Buffer.from(await response.arrayBuffer());
}
