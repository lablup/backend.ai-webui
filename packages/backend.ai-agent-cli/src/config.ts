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

export function readConfig(env: Env = process.env): CliConfig {
  const path = configPath(env);
  if (!existsSync(path)) return {};
  try {
    const parsed = JSON.parse(readFileSync(path, 'utf8')) as unknown;
    return parsed && typeof parsed === 'object' ? (parsed as CliConfig) : {};
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
