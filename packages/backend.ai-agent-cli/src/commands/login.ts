import {
  deriveLoginCode,
  newState,
  startCallbackServer,
} from '../callback-server.js';
import { defineCommand, type RunContext } from '../command.js';
import { CliError } from '../errors.js';
import { fetchWhoAmI, type WhoAmI } from '../manager.js';
import { CLI_NAME } from '../meta.js';
import { record, renderBlocks, section } from '../output.js';
import { tryResolveRepoContext } from '../repo-context.js';
import {
  loadSession,
  maskSessionId,
  normalizeEndpoint,
  resolveEndpoint,
  saveSession,
  stripTrailingSlashes,
  type StoredSession,
} from '../session.js';
import { execFileSync, spawn } from 'node:child_process';
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { createInterface } from 'node:readline';

const DEFAULT_TIMEOUT_SECONDS = 300;
const DEFAULT_PORTLESS_PORT = '1355';

export interface LoginData {
  mode: 'browser' | 'paste';
  endpoint: string;
  webui?: string;
  sessionFile: string;
  /** Masked; the raw id is never rendered. */
  sessionId: string;
  user: WhoAmI;
}

/** The working directory of a live process, or undefined if it is not running. */
function processCwd(pid: number): string | undefined {
  try {
    // Linux: the symlink is also the liveness check — a dead pid throws.
    return realpathSync(`/proc/${pid}/cwd`);
  } catch {
    /* no /proc, or the pid is gone */
  }
  try {
    const out = execFileSync('lsof', ['-p', String(pid), '-a', '-d', 'cwd', '-Fn'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 2000,
    });
    const line = out.split('\n').find((l) => l.startsWith('n'));
    return line ? realpathSync(line.slice(1)) : undefined;
  } catch {
    return undefined;
  }
}

/**
 * The Portless route actually serving this checkout, if one is registered.
 *
 * `scripts/dev.mjs` names a dev server after its issue, its PR and what it does
 * (`fr-3665-pr9049-statusline`), so the issue key alone stops being a hostname the
 * moment a PR exists. Rather than duplicate that composition — it needs a `gh`
 * lookup, which does not belong in a CLI's default-origin path — read what is
 * actually running.
 *
 * `routes.json` alone is not enough to pick from: it keeps entries whose owner has
 * died, and a sibling worktree on the same issue registers a hostname with the same
 * prefix. So a candidate must be a live process whose cwd is this checkout, which is
 * the same ownership test the statusline uses. Where neither /proc nor lsof can
 * answer, fall back to any live route, then to the bare issue key.
 */
function liveAppName(
  issueApp: string,
  repoRoot: string | undefined,
  env: Record<string, string | undefined>,
): string | undefined {
  const stateDir =
    env.PORTLESS_STATE_DIR?.trim() ||
    env.PORTLESS_HOME?.trim() ||
    join(homedir(), '.portless');
  let routes: unknown;
  try {
    routes = JSON.parse(readFileSync(join(stateDir, 'routes.json'), 'utf8'));
  } catch {
    return undefined; // no Portless state, unreadable, or malformed
  }
  if (!Array.isArray(routes)) return undefined;

  const candidates = routes
    .map((route) => route as { hostname?: unknown; pid?: unknown })
    .filter(
      (route): route is { hostname: string; pid: number } =>
        typeof route?.hostname === 'string' &&
        typeof route?.pid === 'number' &&
        route.pid > 0,
    )
    .map((route) => ({ app: route.hostname.split('.')[0], pid: route.pid }))
    .filter(
      ({ app }) => app === issueApp || app.startsWith(`${issueApp}-`),
    );
  if (candidates.length === 0) return undefined;

  const owned: string[] = [];
  const live: string[] = [];
  for (const { app, pid } of candidates) {
    const cwd = processCwd(pid);
    if (cwd === undefined) continue; // dead pid, or unknowable — not a candidate
    live.push(app);
    if (repoRoot && cwd === repoRoot) owned.push(app);
  }
  // Exact match first, then shortest: a checkout also running `fr-3665-alt` still
  // resolves to its main server.
  const pick = (names: string[]) =>
    [...names].sort((a, b) =>
      a === issueApp ? -1 : b === issueApp ? 1 : a.length - b.length,
    )[0];
  return pick(owned) ?? pick(live);
}

/**
 * The default WebUI origin for a dev server started from this checkout: the issue
 * key from the branch, resolved against the Portless routes that are actually up.
 */
export function devWebUiOrigin(
  cwd: string,
  env: Record<string, string | undefined> = process.env,
): string {
  const port = env.PORTLESS_PORT?.trim() || DEFAULT_PORTLESS_PORT;
  const resolved = tryResolveRepoContext(cwd);
  const repoRoot = resolved.ok ? realpathSync(resolved.context.repoRoot) : undefined;
  const branch = currentBranch(cwd);
  const issue = branch ? /(?:^|[-_/])(fr-?\d+)/i.exec(branch) : null;
  if (!issue) return `https://localhost:${port}`;
  const app = issue[1].toLowerCase().replace(/^fr-?/, 'fr-');
  return `https://${liveAppName(app, repoRoot, env) ?? app}.localhost:${port}`;
}

function currentBranch(cwd: string): string | undefined {
  const resolved = tryResolveRepoContext(cwd);
  if (!resolved.ok) return undefined;
  const head = join(resolved.context.repoRoot, '.git', 'HEAD');
  try {
    if (existsSync(head)) {
      const match = /^ref:\s*refs\/heads\/(.+)$/m.exec(
        readFileSync(head, 'utf8'),
      );
      if (match) return match[1].trim();
    }
  } catch {
    /* worktrees keep .git as a file; fall through to git itself */
  }
  return gitBranch(resolved.context.repoRoot);
}

function gitBranch(repoRoot: string): string | undefined {
  try {
    return execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return undefined;
  }
}

function openBrowser(url: string): boolean {
  const opener =
    process.platform === 'darwin'
      ? 'open'
      : process.platform === 'win32'
        ? 'explorer'
        : 'xdg-open';
  try {
    const child = spawn(opener, [url], { detached: true, stdio: 'ignore' });
    child.on('error', () => {});
    child.unref();
    return true;
  } catch {
    return false;
  }
}

function ask(question: string, mask: boolean): Promise<string> {
  return new Promise((resolve) => {
    // Prompt on stderr so `--json` keeps stdout as a single envelope.
    const rl = createInterface({
      input: process.stdin,
      output: process.stderr,
    });
    if (mask) {
      // Suppress the echo so a pasted session id never lands in scrollback.
      const output = rl as unknown as {
        output?: { write(chunk: string): void };
      };
      const write = output.output?.write.bind(output.output);
      (
        rl as unknown as { _writeToOutput(chunk: string): void }
      )._writeToOutput = (chunk: string) => {
        if (chunk.includes(question)) write?.(chunk);
      };
    }
    rl.question(question, (answer) => {
      rl.close();
      if (mask) process.stderr.write('\n');
      resolve(answer.trim());
    });
  });
}

async function finish(
  endpoint: string,
  webui: string,
  sessionId: string,
  mode: LoginData['mode'],
): Promise<LoginData> {
  // Verify before saving so a rejected candidate leaves any stored session alone.
  const user = await fetchWhoAmI({ endpoint, sessionId });
  const session: StoredSession = {
    endpoint,
    webui,
    sessionId,
    savedAt: new Date().toISOString(),
  };
  const sessionFile = saveSession(session);
  return {
    mode,
    endpoint,
    webui: webui || undefined,
    sessionFile,
    sessionId: maskSessionId(sessionId),
    user,
  };
}

async function runPaste(
  context: RunContext,
  endpoint: string,
): Promise<LoginData> {
  const flagId = context.flags['session-id'];
  const sessionId =
    typeof flagId === 'string' && flagId.length > 0
      ? flagId
      : await ask(`Session id for ${endpoint} (input hidden): `, true);
  if (!sessionId) {
    throw new CliError('usage', 'No session id given.', {
      hint: `${CLI_NAME} login --paste --endpoint ${endpoint} --session-id <id>`,
    });
  }
  const webui =
    typeof context.flags.webui === 'string' ? context.flags.webui : '';
  return finish(endpoint, stripTrailingSlashes(webui), sessionId, 'paste');
}

/**
 * The WebUI origin serving `/cli-login`: the flag, then the origin a previous
 * login used, then this checkout's dev server — and, with no checkout at all,
 * the endpoint itself, since the webserver serves the UI on the same origin.
 */
export function defaultWebUiOrigin(
  context: RunContext,
  endpoint: string,
): string {
  if (typeof context.flags.webui === 'string' && context.flags.webui) {
    return context.flags.webui;
  }
  const previous = loadSession(endpoint)?.webui;
  if (previous) return previous;
  const repo = tryResolveRepoContext(context.cwd);
  return repo.ok && repo.context.source !== 'synced'
    ? devWebUiOrigin(context.cwd)
    : endpoint;
}

async function runBrowser(
  context: RunContext,
  endpoint: string,
): Promise<LoginData> {
  const webui = normalizeEndpoint(defaultWebUiOrigin(context, endpoint));
  const timeoutSeconds = Number(
    context.flags.timeout ?? DEFAULT_TIMEOUT_SECONDS,
  );
  if (!Number.isFinite(timeoutSeconds) || timeoutSeconds <= 0) {
    throw new CliError(
      'usage',
      '--timeout must be a positive number of seconds.',
      {
        hint: `${CLI_NAME} login --timeout ${DEFAULT_TIMEOUT_SECONDS}`,
      },
    );
  }

  const state = newState();
  const code = deriveLoginCode(state);
  let outcome: LoginData | undefined;

  const server = await startCallbackServer({
    state,
    expectedEndpoint: endpoint,
    timeoutMs: timeoutSeconds * 1000,
    onPayload: async (payload) => {
      outcome = await finish(endpoint, webui, payload.sessionId, 'browser');
      return {
        ok: true,
        message: `Signed in as ${outcome.user.email}. You can close this tab.`,
      };
    },
  });

  const url = `${webui}/cli-login?port=${server.port}&state=${state}`;
  context.notify(
    renderBlocks([
      section(`${CLI_NAME} login`, `Confirm the hand-off in your browser.`),
      record([
        ['endpoint', endpoint],
        ['code', code],
        ['url', url],
        ['timeout', `${timeoutSeconds}s`],
      ]),
    ]),
  );
  if (context.flags['no-browser'] !== true && !openBrowser(url)) {
    context.notify('Could not open a browser; open the URL above manually.');
  }

  try {
    await server.wait();
  } finally {
    await server.close();
  }
  if (!outcome) {
    throw new CliError(
      'internal',
      'The browser hand-off produced no session.',
      {
        hint: `${CLI_NAME} login --paste --endpoint ${endpoint}`,
      },
    );
  }
  return outcome;
}

/** The command body, shared with `init` so the wizard logs in the same way. */
export function runLogin(
  context: RunContext,
  endpoint: string,
): Promise<LoginData> {
  return context.flags.paste === true
    ? runPaste(context, endpoint)
    : runBrowser(context, endpoint);
}

export const loginCommand = defineCommand<LoginData>({
  name: 'login',
  summary:
    'Hand this machine a WebUI session, through the browser or by pasting one.',
  usage: `${CLI_NAME} login [--endpoint <url>] [--webui <origin>] [--paste] [--session-id <id>] [--timeout <seconds>] [--no-browser] [--json]`,
  flags: [
    {
      flag: '--endpoint <url>',
      description:
        'Manager URL. Defaults to the only stored session, then the checkout config.toml apiEndpoint, then the endpoint init recorded.',
      type: 'string',
    },
    {
      flag: '--webui <origin>',
      description:
        'WebUI origin hosting /cli-login. Defaults to the last login’s, then this checkout’s dev server, then the endpoint itself.',
      type: 'string',
    },
    {
      flag: '--paste',
      description:
        'Skip the browser and take the session id on stdin (or from --session-id).',
      type: 'boolean',
    },
    {
      flag: '--session-id <id>',
      description: 'Session id for --paste, for non-interactive use.',
      type: 'string',
    },
    {
      flag: '--timeout <seconds>',
      description: 'How long to wait for the browser hand-off.',
      type: 'string',
      default: String(DEFAULT_TIMEOUT_SECONDS),
    },
    {
      flag: '--no-browser',
      description: 'Print the URL instead of trying to open a browser.',
      type: 'boolean',
    },
  ],
  maxArgs: 0,
  run: async (context) => {
    const flagEndpoint =
      typeof context.flags.endpoint === 'string'
        ? context.flags.endpoint
        : undefined;
    const { endpoint } = resolveEndpoint({
      flag: flagEndpoint,
      cwd: context.cwd,
    });
    return runLogin(context, endpoint);
  },
  render: (data, { verbosity }) =>
    renderBlocks([
      section(`${CLI_NAME} login`, `Signed in as ${data.user.email}.`),
      record([
        ['endpoint', data.endpoint],
        ['email', data.user.email],
        ['role', data.user.role],
        ['domain', data.user.domainName],
        ...(verbosity === 'dense'
          ? []
          : ([
              ['session', data.sessionId],
              ['file', data.sessionFile],
            ] as Array<[string, string]>)),
        ...(verbosity === 'detail'
          ? ([
              ['fullName', data.user.fullName],
              ['status', data.user.status],
              ['mode', data.mode],
              ['webui', data.webui],
            ] as Array<[string, string | undefined]>)
          : []),
      ]),
    ]),
});
