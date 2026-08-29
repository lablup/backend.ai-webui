import { CliError } from './errors.js';
import type { ReleaseAsset } from './github-release.js';
import {
  BACKEND_REPO,
  downloadReleaseAsset,
  resolveRelease,
  SUPERGRAPH_ASSET,
} from './github-release.js';
import { CLI_NAME } from './meta.js';
import type { RepoContext } from './repo-context.js';
import type { SchemaMeta } from './schema-meta.js';
import {
  readCommittedSchema,
  readSchemaMeta,
  schemaMetaPath,
  sha256Of,
  writeSchemaMeta,
} from './schema-meta.js';
import { clearSchemaCache } from './search/schema-sdl.js';
import { writeFileSync } from 'node:fs';
import { relative } from 'node:path';

/**
 * What happened to the committed SDL.
 *
 * - `dry-run` — nothing was written.
 * - `unchanged` — same tag, same sha256; a no-op.
 * - `updated` — the SDL bytes changed.
 * - `meta-recorded` — the bytes already matched, but not under this tag.
 */
export type SyncOutcome = 'dry-run' | 'unchanged' | 'updated' | 'meta-recorded';

export interface SchemaSyncData {
  kind: 'schema-sync';
  tag: string;
  tagSource: 'flag' | 'latest';
  outcome: SyncOutcome;
  dryRun: boolean;
  /** Whether the SDL on disk differs from the release asset. */
  schemaChanged: boolean;
  repo: string;
  asset: string;
  source: string;
  schemaPath: string;
  metaPath: string;
  remoteSha256: string;
  localSha256?: string;
  remoteBytes: number;
  localBytes?: number;
  /** `remoteBytes - localBytes`; `0` when there is nothing committed. */
  byteDelta: number;
  /** The asset carries `@join__*`, i.e. the same federation shape as the SDL. */
  remoteIsFederated: boolean;
  localIsFederated?: boolean;
  previousTag?: string;
  fetchedAt?: string;
}

export interface SchemaSyncOptions {
  tag?: string;
  dryRun?: boolean;
  fetchImpl?: typeof fetch;
  env?: Record<string, string | undefined>;
  now?: Date;
}

/** The composed supergraph carries `@join__type`; a plain SDL does not. */
const FEDERATION_MARKER = '@join__type';

const isFederated = (body: Buffer): boolean =>
  body.includes(FEDERATION_MARKER, 0, 'utf8');

function writeSchema(context: RepoContext, body: Buffer): void {
  try {
    writeFileSync(context.schemaPath, body);
  } catch (error) {
    throw new CliError('internal', `Cannot write ${context.schemaPath}.`, {
      hint: `${CLI_NAME} doctor`,
      cause: error,
    });
  }
  // The parsed-SDL cache is keyed on mtime, and a same-millisecond rewrite can
  // reuse the old value; drop it so this process re-reads what it just wrote.
  clearSchemaCache();
}

/**
 * Download `supergraph.graphql` from a lablup/backend.ai release into the
 * committed SDL path, recording `data/schema.meta.json` alongside it.
 *
 * Never runs implicitly: only `bai-agent schema sync` calls this.
 */
export async function syncSchema(
  context: RepoContext,
  options: SchemaSyncOptions = {},
): Promise<SchemaSyncData> {
  const release = await resolveRelease({
    tag: options.tag,
    fetchImpl: options.fetchImpl,
    env: options.env,
  });
  const asset: ReleaseAsset = release.asset;
  const body = await downloadReleaseAsset(asset, {
    fetchImpl: options.fetchImpl,
  });
  const remoteSha256 = sha256Of(body);

  const local = readCommittedSchema(context);
  const meta = readSchemaMeta(context, options.now ?? new Date());
  const schemaChanged = local?.sha256 !== remoteSha256;

  const base: SchemaSyncData = {
    kind: 'schema-sync',
    tag: release.tag,
    tagSource: release.tagSource,
    outcome: 'dry-run',
    dryRun: options.dryRun === true,
    schemaChanged,
    repo: BACKEND_REPO,
    asset: SUPERGRAPH_ASSET,
    source: asset.url,
    schemaPath: relative(context.repoRoot, context.schemaPath),
    metaPath: relative(context.repoRoot, schemaMetaPath(context)),
    remoteSha256,
    ...(local ? { localSha256: local.sha256 } : {}),
    remoteBytes: body.byteLength,
    ...(local ? { localBytes: local.bytes } : {}),
    byteDelta: body.byteLength - (local?.bytes ?? body.byteLength),
    remoteIsFederated: isFederated(body),
    ...(local ? { localIsFederated: isFederated(local.body) } : {}),
    ...(meta?.tag ? { previousTag: meta.tag } : {}),
  };

  if (options.dryRun) return base;

  if (!schemaChanged && meta?.tag === release.tag) {
    return { ...base, outcome: 'unchanged' };
  }

  const fetchedAt = (options.now ?? new Date()).toISOString();
  const record: SchemaMeta = {
    tag: release.tag,
    sha256: remoteSha256,
    fetchedAt,
    source: asset.url,
  };
  if (schemaChanged) writeSchema(context, body);
  writeSchemaMeta(context, record);

  return {
    ...base,
    outcome: schemaChanged ? 'updated' : 'meta-recorded',
    fetchedAt,
  };
}
