import { CliError } from './errors.js';
import { CLI_NAME } from './meta.js';
import type { RepoContext } from './repo-context.js';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/** Sits next to the SDL it describes, so the two travel together in git. */
export const SCHEMA_META_FILE = 'data/schema.meta.json';

/** Older than this and `doctor` asks for a re-sync. */
export const SCHEMA_META_STALE_DAYS = 60;

/** What `schema sync` records about the SDL it wrote. */
export interface SchemaMeta {
  /** The lablup/backend.ai release tag the SDL was taken from. */
  tag: string;
  /** SHA-256 of the SDL bytes, so a hand-edit is detectable. */
  sha256: string;
  fetchedAt: string;
  /** The asset URL the bytes came from. */
  source: string;
}

export interface SchemaMetaFile extends SchemaMeta {
  path: string;
  /** Days since `fetchedAt`, rounded down; `null` when it does not parse. */
  ageDays: number | null;
}

export const sha256Of = (body: Buffer | string): string =>
  createHash('sha256')
    .update(typeof body === 'string' ? Buffer.from(body, 'utf8') : body)
    .digest('hex');

export function schemaMetaPath(context: RepoContext): string {
  return join(context.repoRoot, SCHEMA_META_FILE);
}

function ageInDays(fetchedAt: string, now: Date): number | null {
  const parsed = Date.parse(fetchedAt);
  if (Number.isNaN(parsed)) return null;
  return Math.max(0, Math.floor((now.getTime() - parsed) / 86_400_000));
}

/** `null` when the file is absent or does not carry the two required keys. */
export function readSchemaMeta(
  context: RepoContext,
  now: Date = new Date(),
): SchemaMetaFile | null {
  const path = schemaMetaPath(context);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, 'utf8')) as
      Partial<SchemaMeta> | undefined;
    if (!parsed?.tag || !parsed.sha256) return null;
    return {
      tag: parsed.tag,
      sha256: parsed.sha256,
      fetchedAt: parsed.fetchedAt ?? '',
      source: parsed.source ?? '',
      path,
      ageDays: ageInDays(parsed.fetchedAt ?? '', now),
    };
  } catch {
    return null;
  }
}

export function writeSchemaMeta(
  context: RepoContext,
  meta: SchemaMeta,
): string {
  const path = schemaMetaPath(context);
  try {
    writeFileSync(path, `${JSON.stringify(meta, null, 2)}\n`, 'utf8');
  } catch (error) {
    throw new CliError('internal', `Cannot write ${path}.`, {
      hint: `${CLI_NAME} doctor`,
      cause: error,
    });
  }
  return path;
}

export interface CommittedSchema {
  sha256: string;
  bytes: number;
  body: Buffer;
}

/** SHA-256 and byte size of the committed SDL, or `null` when it is absent. */
export function readCommittedSchema(
  context: RepoContext,
): CommittedSchema | null {
  try {
    const body = readFileSync(context.schemaPath);
    return { sha256: sha256Of(body), bytes: body.byteLength, body };
  } catch {
    return null;
  }
}
