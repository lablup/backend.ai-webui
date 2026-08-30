import { CliError } from './errors.js';
import { CLI_NAME } from './meta.js';
import { tryResolveRepoContext } from './repo-context.js';
import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

/** What `login` writes and `whoami` / `logout` read. */
export interface StoredSession {
  endpoint: string;
  /** WebUI origin the session was handed over from; reused as `--webui` default. */
  webui: string;
  sessionId: string;
  savedAt: string;
}

export interface StoredSessionFile extends StoredSession {
  path: string;
}

export const SESSION_DIR_MODE = 0o700;
export const SESSION_FILE_MODE = 0o600;

type Env = Record<string, string | undefined>;

/** `$BAI_AGENT_CONFIG_DIR` wins, then `$XDG_CONFIG_HOME`, then `~/.config`. */
export function configDir(env: Env = process.env): string {
  const override = env.BAI_AGENT_CONFIG_DIR?.trim();
  if (override) return override;
  const xdg = env.XDG_CONFIG_HOME?.trim();
  return join(xdg || join(homedir(), '.config'), 'backend.ai-agent');
}

export function sessionsDir(env: Env = process.env): string {
  return join(configDir(env), 'sessions');
}

export function stripTrailingSlashes(value: string): string {
  let end = value.length;
  while (end > 0 && value[end - 1] === '/') end -= 1;
  return value.slice(0, end);
}

export function normalizeEndpoint(endpoint: string): string {
  const trimmed = stripTrailingSlashes(endpoint.trim());
  try {
    new URL(trimmed);
  } catch {
    throw new CliError('usage', `Not a valid endpoint URL: ${endpoint}`, {
      hint: `${CLI_NAME} login --endpoint https://manager.example.com`,
    });
  }
  return trimmed;
}

/** `host[:port]` with everything outside `[a-z0-9._-]` folded to `_`. */
export function endpointKey(endpoint: string): string {
  const { host } = new URL(normalizeEndpoint(endpoint));
  return host.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export function sessionPath(endpoint: string, env: Env = process.env): string {
  return join(sessionsDir(env), `${endpointKey(endpoint)}.json`);
}

export function maskSessionId(sessionId: string | undefined | null): string {
  if (!sessionId) return '(none)';
  if (sessionId.length <= 8) return '…';
  return `${sessionId.slice(0, 4)}…${sessionId.slice(-4)}`;
}

export function saveSession(
  session: StoredSession,
  env: Env = process.env,
): string {
  const path = sessionPath(session.endpoint, env);
  const dir = sessionsDir(env);
  mkdirSync(dir, { recursive: true, mode: SESSION_DIR_MODE });
  // mkdirSync's `mode` only applies on create; chmod tightens an existing dir.
  chmodSync(dir, SESSION_DIR_MODE);
  writeFileSync(path, `${JSON.stringify(session, null, 2)}\n`, {
    mode: SESSION_FILE_MODE,
  });
  // writeFileSync's `mode` only applies on create; chmod covers a rewrite.
  chmodSync(path, SESSION_FILE_MODE);
  return path;
}

function parseSessionFile(path: string): StoredSessionFile | null {
  try {
    const parsed = JSON.parse(readFileSync(path, 'utf8')) as
      Partial<StoredSession> | undefined;
    if (!parsed?.endpoint || !parsed.sessionId) return null;
    return {
      endpoint: parsed.endpoint,
      webui: parsed.webui ?? '',
      sessionId: parsed.sessionId,
      savedAt: parsed.savedAt ?? '',
      path,
    };
  } catch {
    return null;
  }
}

export function loadSession(
  endpoint: string,
  env: Env = process.env,
): StoredSessionFile | null {
  const path = sessionPath(endpoint, env);
  return existsSync(path) ? parseSessionFile(path) : null;
}

export function listSessions(env: Env = process.env): StoredSessionFile[] {
  const dir = sessionsDir(env);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith('.json'))
    .map((name) => parseSessionFile(join(dir, name)))
    .filter((session): session is StoredSessionFile => session !== null);
}

/** @returns the removed path, or `null` when nothing was stored. */
export function deleteSession(
  endpoint: string,
  env: Env = process.env,
): string | null {
  const path = sessionPath(endpoint, env);
  if (!existsSync(path)) return null;
  rmSync(path, { force: true });
  return path;
}

/** Permission bits of a session file, or `null` when it does not exist. */
export function sessionFileMode(path: string): number | null {
  try {
    return statSync(path).mode & 0o777;
  } catch {
    return null;
  }
}

/**
 * `apiEndpoint` out of the checkout's `config.toml`. Hand-scanned rather than
 * parsed: the CLI has no runtime dependencies, and one key is all we need.
 */
export function readApiEndpointFromToml(source: string): string | undefined {
  let inGeneral = false;
  for (const raw of source.split(/\r?\n/)) {
    const line = raw.trim();
    if (line.startsWith('#')) continue;
    const section = /^\[([^[\]]+)\]$/.exec(line);
    if (section) {
      inGeneral = section[1].trim() === 'general';
      continue;
    }
    if (!inGeneral) continue;
    const match = /^apiEndpoint\s*=\s*"([^"]*)"/.exec(line);
    if (!match) continue;
    const value = match[1].trim();
    // `config.toml.sample` ships bracketed prose placeholders, not values.
    return value === '' || value.startsWith('[') ? undefined : value;
  }
  return undefined;
}

export function checkoutApiEndpoint(cwd: string): string | undefined {
  const resolved = tryResolveRepoContext(cwd);
  if (!resolved.ok) return undefined;
  const file = join(resolved.context.repoRoot, 'config.toml');
  if (!existsSync(file)) return undefined;
  try {
    return readApiEndpointFromToml(readFileSync(file, 'utf8'));
  } catch {
    return undefined;
  }
}

export type EndpointSource = 'flag' | 'session' | 'config.toml';

export interface ResolvedEndpoint {
  endpoint: string;
  source: EndpointSource;
}

/**
 * `--endpoint` wins; otherwise the single stored session, otherwise the
 * checkout's `config.toml`. Ambiguity is an error, never a guess.
 */
export function resolveEndpoint(options: {
  flag?: string;
  cwd: string;
  env?: Env;
}): ResolvedEndpoint {
  const env = options.env ?? process.env;
  if (options.flag) {
    return { endpoint: normalizeEndpoint(options.flag), source: 'flag' };
  }

  const stored = listSessions(env);
  if (stored.length === 1) {
    return {
      endpoint: normalizeEndpoint(stored[0].endpoint),
      source: 'session',
    };
  }
  if (stored.length > 1) {
    throw new CliError(
      'usage',
      `${stored.length} stored sessions; name one with --endpoint.`,
      {
        suggestions: stored.map((session) => session.endpoint),
        hint: `${CLI_NAME} whoami --endpoint ${stored[0].endpoint}`,
      },
    );
  }

  const fromCheckout = options.cwd
    ? checkoutApiEndpoint(options.cwd)
    : undefined;
  if (fromCheckout) {
    return {
      endpoint: normalizeEndpoint(fromCheckout),
      source: 'config.toml',
    };
  }

  throw new CliError(
    'usage',
    'No endpoint: none given with --endpoint, none stored, and no apiEndpoint in the checkout config.toml.',
    { hint: `${CLI_NAME} login --endpoint https://manager.example.com` },
  );
}
