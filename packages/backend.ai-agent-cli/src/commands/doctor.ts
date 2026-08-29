import { defineCommand } from '../command.js';
import { EXIT } from '../errors.js';
import { CLI_NAME, MIN_NODE_MAJOR } from '../meta.js';
import { record, renderBlocks, section } from '../output.js';
import {
  REPO_PACKAGE_NAME,
  REQUIRED_SOURCES,
  tryResolveRepoContext,
} from '../repo-context.js';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

export type CheckStatus = 'ok' | 'warn' | 'fail';

export interface DoctorCheck {
  group: string;
  check: string;
  status: CheckStatus;
  detail: string;
  hint?: string;
}

export interface CheckGroup {
  name: string;
  run(context: { cwd: string }): DoctorCheck[];
}

const runtimeGroup: CheckGroup = {
  name: 'runtime',
  run: () => {
    const major = Number(process.versions.node.split('.')[0]);
    return [
      {
        group: 'runtime',
        check: 'node version',
        status: major >= MIN_NODE_MAJOR ? 'ok' : 'fail',
        detail: `node ${process.version} (minimum v${MIN_NODE_MAJOR})`,
        hint: major >= MIN_NODE_MAJOR ? undefined : `nvm use ${MIN_NODE_MAJOR}`,
      },
    ];
  },
};

const checkoutGroup: CheckGroup = {
  name: 'checkout',
  run: ({ cwd }) => {
    const resolved = tryResolveRepoContext(cwd);
    if (!resolved.ok) {
      return [
        {
          group: 'checkout',
          check: 'checkout detection',
          status: 'fail',
          detail: resolved.error.message,
          hint: resolved.error.hint,
        },
        ...REQUIRED_SOURCES.map((source): DoctorCheck => ({
          group: 'checkout',
          check: source.path,
          status: 'fail',
          detail: 'not checked: no checkout detected',
          hint: `cd <${REPO_PACKAGE_NAME} checkout> && ${CLI_NAME} doctor`,
        })),
      ];
    }
    const { context } = resolved;
    return [
      {
        group: 'checkout',
        check: 'checkout detection',
        status: 'ok',
        detail: `${context.repoRoot} (version ${context.repoVersion})`,
      },
      ...REQUIRED_SOURCES.map((source): DoctorCheck => {
        const absolute = join(context.repoRoot, source.path);
        const present = existsSync(absolute);
        return {
          group: 'checkout',
          check: source.path,
          status: present ? 'ok' : 'fail',
          detail: present
            ? `${source.kind} found at ${absolute}`
            : `${source.kind} missing at ${absolute}`,
          hint: present ? undefined : 'git status',
        };
      }),
    ];
  },
};

/** Later tickets append groups here (auth, schema alignment, mappings). */
export const CHECK_GROUPS: CheckGroup[] = [runtimeGroup, checkoutGroup];

export interface DoctorData {
  checks: DoctorCheck[];
  summary: { total: number; ok: number; warn: number; fail: number };
}

export const doctorCommand = defineCommand<DoctorData>({
  name: 'doctor',
  summary: 'Diagnose the CLI environment and the detected checkout.',
  usage: `${CLI_NAME} doctor [--json]`,
  flags: [],
  maxArgs: 0,
  run: ({ cwd }) => {
    const checks = CHECK_GROUPS.flatMap((group) => group.run({ cwd }));
    return {
      checks,
      summary: {
        total: checks.length,
        ok: checks.filter((check) => check.status === 'ok').length,
        warn: checks.filter((check) => check.status === 'warn').length,
        fail: checks.filter((check) => check.status === 'fail').length,
      },
    };
  },
  render: (data, { verbosity }) => {
    const blocks = [section(`${CLI_NAME} doctor`)];
    for (const check of data.checks) {
      blocks.push(
        record([
          ['status', check.status],
          ['check', check.check],
          ...(verbosity === 'dense'
            ? []
            : ([['detail', check.detail]] as Array<[string, string]>)),
          ...(verbosity === 'detail'
            ? ([
                ['group', check.group],
                ['hint', check.hint],
              ] as Array<[string, string | undefined]>)
            : []),
        ]),
      );
    }
    blocks.push(
      record([
        ['total', data.summary.total],
        ['ok', data.summary.ok],
        ['warn', data.summary.warn],
        ['fail', data.summary.fail],
      ]),
    );
    return renderBlocks(blocks);
  },
  exitCode: (data) => (data.summary.fail > 0 ? EXIT.error : EXIT.ok),
});
