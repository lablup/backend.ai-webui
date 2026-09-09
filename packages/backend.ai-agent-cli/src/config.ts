import { configDir } from './paths.js';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

type Env = Record<string, string | undefined>;

export const CONFIG_FILE = 'config.json';

/** What `sync` records about the data checkout it manages. */
export interface SyncRecord {
  /** The branch or tag that was asked for. */
  ref: string;
  /** The commit the checkout is at. */
  commit: string;
  syncedAt: string;
}

/**
 * Machine-wide state that is not a session: the endpoint the user named and
 * the data checkout `sync` maintains. Sessions stay in `sessions/<host>.json`.
 */
export interface CliConfig {
  endpoint?: string;
  /** Manager version read when the endpoint was recorded. */
  managerVersion?: string;
  sync?: SyncRecord;
}

export function configPath(env: Env = process.env): string {
  return join(configDir(env), CONFIG_FILE);
}

const str = (value: unknown): string | undefined =>
  typeof value === 'string' && value.length > 0 ? value : undefined;

/**
 * Only the known fields, only with their declared types. The file is meant
 * to be hand-editable, so a malformed value is dropped here rather than
 * reaching `endpoint.trim()` or git's argv later.
 */
export function sanitizeConfig(parsed: unknown): CliConfig {
  if (!parsed || typeof parsed !== 'object') return {};
  const raw = parsed as Record<string, unknown>;
  const config: CliConfig = {};
  const endpoint = str(raw.endpoint);
  if (endpoint) config.endpoint = endpoint;
  const managerVersion = str(raw.managerVersion);
  if (managerVersion) config.managerVersion = managerVersion;
  if (raw.sync && typeof raw.sync === 'object') {
    const sync = raw.sync as Record<string, unknown>;
    const ref = str(sync.ref);
    const commit = str(sync.commit);
    if (ref && commit) {
      config.sync = { ref, commit, syncedAt: str(sync.syncedAt) ?? '' };
    }
  }
  return config;
}

export function readConfig(env: Env = process.env): CliConfig {
  const path = configPath(env);
  if (!existsSync(path)) return {};
  try {
    return sanitizeConfig(JSON.parse(readFileSync(path, 'utf8')));
  } catch {
    return {};
  }
}

/** Merges `patch` into the stored config; a key set to `undefined` is removed. */
export function updateConfig(
  patch: Partial<CliConfig>,
  env: Env = process.env,
): { config: CliConfig; path: string } {
  const path = configPath(env);
  const merged: CliConfig = { ...readConfig(env), ...patch };
  for (const key of Object.keys(merged) as Array<keyof CliConfig>) {
    if (merged[key] === undefined) delete merged[key];
  }
  mkdirSync(configDir(env), { recursive: true, mode: 0o700 });
  writeFileSync(path, `${JSON.stringify(merged, null, 2)}\n`);
  return { config: merged, path };
}
