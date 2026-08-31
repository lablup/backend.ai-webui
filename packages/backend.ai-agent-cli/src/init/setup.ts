import type { GitRunner, SyncData } from '../checkout-sync.js';
import { defaultGit, syncCheckout } from '../checkout-sync.js';
import type { AnyCommand, RunContext } from '../command.js';
import { readConfig, updateConfig } from '../config.js';
import { CliError } from '../errors.js';
import type { ManagerVersion } from '../manager.js';
import { fetchPublicManagerVersion } from '../manager.js';
import { CLI_NAME } from '../meta.js';
import type { Prompter } from '../prompt.js';
import { needsFlagError, stdioPrompter } from '../prompt.js';
import type { ContextSource } from '../repo-context.js';
import { findRepoRoot, resolveRepoContext } from '../repo-context.js';
import type { SchemaSyncData } from '../schema-sync.js';
import { syncSchema } from '../schema-sync.js';
import { normalizeEndpoint } from '../session.js';
import type { SkillInstallData } from '../skill-install.js';
import { installSkill, installedSkillDir } from '../skill-install.js';
import type { RefChoice } from '../webui-refs.js';
import { listWebUiTags, pickRefForManager } from '../webui-refs.js';
import { applyBlock, renderAgentBlock, resolveBlockTarget } from './block.js';
import type { BlockAnchor } from './block.js';
import { readFileSync, writeFileSync } from 'node:fs';

type Env = Record<string, string | undefined>;

/** What a step did, or why it did not run — every branch is reportable. */
export interface StepSkipped {
  skipped: string;
}

export interface LoginStep {
  email: string;
  role: string;
  sessionFile: string;
}

export interface BlockStep {
  path: string;
  anchor: BlockAnchor;
  outcome: 'inserted' | 'updated' | 'unchanged';
}

export interface SetupData {
  kind: 'setup';
  endpoint: string;
  endpointSource: 'flag' | 'prompt' | 'config';
  manager: ManagerVersion | StepSkipped;
  ref: RefChoice | StepSkipped;
  checkout: { root: string; source: ContextSource };
  sync: Pick<SyncData, 'outcome' | 'commit' | 'dir'> | StepSkipped;
  schemaSync: Pick<SchemaSyncData, 'tag' | 'outcome'> | StepSkipped;
  login: LoginStep | StepSkipped;
  skill: SkillInstallData | StepSkipped;
  block: BlockStep | StepSkipped;
  configPath: string;
}

/** The pieces `runSetup` reaches out through; tests hand in doubles. */
export interface SetupDeps {
  prompter: Prompter;
  git: GitRunner;
  fetchVersion: typeof fetchPublicManagerVersion;
  sync: typeof syncCheckout;
  syncSchema: typeof syncSchema;
  /** The `login` command's body, run with `init`'s own flags. */
  login: (context: RunContext, endpoint: string) => Promise<LoginStep>;
  installSkill: typeof installSkill;
}

export interface SetupOptions {
  context: RunContext;
  env?: Env;
  deps?: Partial<SetupDeps>;
}

const flag = (context: RunContext, name: string): string | undefined => {
  const value = context.flags[name];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
};

/** `--x` / `--no-x` resolve a yes/no; neither means "ask". */
function yesNoFlag(context: RunContext, name: string): boolean | undefined {
  if (context.flags[name] === true) return true;
  if (context.flags[`no-${name}`] === true) return false;
  return undefined;
}

const reason = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

async function decide(
  context: RunContext,
  prompter: Prompter,
  name: string,
  question: string,
  fallback: boolean,
): Promise<boolean> {
  const fromFlag = yesNoFlag(context, name);
  if (fromFlag !== undefined) return fromFlag;
  if (!prompter.interactive) {
    throw needsFlagError(`whether to ${question}`, [
      `--${name}`,
      `--no-${name}`,
    ]);
  }
  return prompter.confirm(
    `${question[0].toUpperCase()}${question.slice(1)}?`,
    fallback,
  );
}

/**
 * The `init` wizard: endpoint → manager version → matching WebUI ref → data
 * sync → SDL alignment → login? → skill? → CLAUDE.md block (in a checkout).
 * Every question has a flag so an agent can run it without a TTY; without
 * either it stops with a usage error naming the flag, never a hang.
 */
export async function runSetup(options: SetupOptions): Promise<SetupData> {
  const { context } = options;
  const env = options.env ?? process.env;
  const deps: SetupDeps = {
    prompter: stdioPrompter(),
    git: defaultGit,
    fetchVersion: fetchPublicManagerVersion,
    sync: syncCheckout,
    syncSchema,
    login: () => {
      throw new CliError('internal', 'login is not wired into init.');
    },
    installSkill,
    ...options.deps,
  };
  const { prompter, notify } = {
    prompter: deps.prompter,
    notify: context.notify,
  };
  const stored = readConfig(env);

  // 1. Endpoint.
  let endpointSource: SetupData['endpointSource'];
  let rawEndpoint = flag(context, 'endpoint');
  if (rawEndpoint) {
    endpointSource = 'flag';
  } else if (prompter.interactive) {
    rawEndpoint = await prompter.text(
      'Backend.AI endpoint URL',
      stored.endpoint,
    );
    endpointSource =
      stored.endpoint && rawEndpoint === stored.endpoint ? 'config' : 'prompt';
  } else if (stored.endpoint) {
    rawEndpoint = stored.endpoint;
    endpointSource = 'config';
  } else {
    throw needsFlagError('the endpoint', ['--endpoint <url>']);
  }
  if (!rawEndpoint) {
    throw new CliError('usage', 'No endpoint given.', {
      hint: `${CLI_NAME} init --endpoint https://manager.example.com`,
    });
  }
  const endpoint = normalizeEndpoint(rawEndpoint);
  let { path: configPath } = updateConfig({ endpoint }, env);

  // 2. Manager version — public, no session needed.
  let manager: SetupData['manager'];
  try {
    manager = await deps.fetchVersion(endpoint);
    notify(`Manager ${manager.manager} at ${endpoint}.`);
    ({ path: configPath } = updateConfig(
      { managerVersion: manager.manager },
      env,
    ));
  } catch (error) {
    manager = { skipped: reason(error) };
    notify(`warning: could not read the manager version: ${reason(error)}`);
  }

  // 3. The checkout: cwd's own wins and is left alone; otherwise sync.
  const own = findRepoRoot(context.cwd);
  let ref: SetupData['ref'];
  let sync: SetupData['sync'];
  let checkout: SetupData['checkout'];
  if (own) {
    checkout = { root: own.root, source: 'cwd' };
    ref = {
      skipped: `inside a checkout at ${own.root}; its data is used as-is`,
    };
    sync = { skipped: 'inside a checkout' };
  } else {
    const refFlag = flag(context, 'ref');
    if (refFlag) {
      ref = { ref: refFlag, source: 'flag', reason: '--ref' };
    } else if ('manager' in manager) {
      try {
        ref = pickRefForManager(manager.manager, listWebUiTags(deps.git));
      } catch (error) {
        ref = {
          ref: 'main',
          source: 'default',
          reason: `could not list tags: ${reason(error)}`,
        };
      }
    } else {
      ref = {
        ref: 'main',
        source: 'default',
        reason: 'manager version unknown',
      };
    }
    if (ref.source === 'default')
      notify(`warning: syncing main — ${ref.reason}.`);
    const synced = deps.sync({ ref: ref.ref, env, git: deps.git, notify });
    sync = { outcome: synced.outcome, commit: synced.commit, dir: synced.dir };
    checkout = { root: synced.dir, source: 'synced' };
  }

  // 4. Align the synced SDL with the backend release; a checkout's own SDL
  //    is under git and is the developer's to change.
  let schemaSync: SetupData['schemaSync'];
  if (checkout.source !== 'synced') {
    schemaSync = {
      skipped: 'inside a checkout; its committed SDL is left alone',
    };
  } else if (!('manager' in manager)) {
    schemaSync = { skipped: 'manager version unknown' };
  } else {
    try {
      const result = await deps.syncSchema(
        resolveRepoContext(context.cwd, env),
        {
          tag: manager.manager,
          env,
        },
      );
      schemaSync = { tag: result.tag, outcome: result.outcome };
    } catch (error) {
      schemaSync = { skipped: reason(error) };
      notify(
        `warning: SDL left at the synced ref's snapshot — ${reason(error)}`,
      );
    }
  }

  // 5. Login?
  let login: SetupData['login'];
  if (await decide(context, prompter, 'login', 'log in now', true)) {
    try {
      login = await deps.login(context, endpoint);
    } catch (error) {
      login = { skipped: `login failed: ${reason(error)}` };
      notify(
        `warning: ${login.skipped}. Later: ${CLI_NAME} login --endpoint ${endpoint}`,
      );
    }
  } else {
    login = {
      skipped: `not requested; later: ${CLI_NAME} login --endpoint ${endpoint}`,
    };
  }

  // 6. The Claude Code skill?
  let skill: SetupData['skill'];
  const skillTarget = installedSkillDir(env);
  if (
    await decide(
      context,
      prompter,
      'skill',
      `install the Claude Code skill into ${skillTarget}`,
      true,
    )
  ) {
    skill = deps.installSkill({ commands: context.commands, env });
  } else {
    skill = {
      skipped: `not requested; later: ${CLI_NAME} init --skill --no-login`,
    };
  }

  // 7. The CLAUDE.md block, only where there is a CLAUDE.md to hold it.
  let block: SetupData['block'];
  if (checkout.source === 'cwd') {
    const { path } = resolveBlockTarget(checkout.root);
    const applied = applyBlock(
      readFileSync(path, 'utf8'),
      renderAgentBlock(context.commands),
    );
    if (applied.changed) writeFileSync(path, applied.content, 'utf8');
    block = {
      path,
      anchor: applied.anchor,
      outcome: !applied.changed
        ? 'unchanged'
        : applied.anchor === 'markers'
          ? 'updated'
          : 'inserted',
    };
  } else {
    block = {
      skipped:
        'no checkout CLAUDE.md here; the installed skill carries the block',
    };
  }

  return {
    kind: 'setup',
    endpoint,
    endpointSource,
    manager,
    ref,
    checkout,
    sync,
    schemaSync,
    login,
    skill,
    block,
    configPath,
  };
}

/** Commands the wizard needs at hand; kept as a type so tests can narrow it. */
export type SetupCommands = AnyCommand[];
