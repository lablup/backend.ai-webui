import { defineCommand } from '../command.js';
import { CliError } from '../errors.js';
import { fetchWhoAmI, type WhoAmI } from '../manager.js';
import { CLI_NAME } from '../meta.js';
import type { Block } from '../output.js';
import { record, renderBlocks, section } from '../output.js';
import { tryResolveRepoContext } from '../repo-context.js';
import { loadSchema } from '../search/schema-sdl.js';
import {
  deleteSession,
  loadSession,
  maskSessionId,
  resolveEndpoint,
} from '../session.js';
import type {
  ManagerReachability,
  VersionAlignment,
} from '../version-align.js';
import {
  applyVersionAlignmentGate,
  renderAlignment,
  STRICT_FLAG,
} from '../version-align.js';

export interface WhoamiData extends WhoAmI {
  endpoint: string;
  /** Masked; the raw id is never rendered. */
  sessionId: string;
  sessionFile: string;
  /** Absent outside a checkout, or when the manager version is unreadable. */
  manager?: ManagerReachability;
  alignment?: VersionAlignment;
}

export const ENDPOINT_FLAG = {
  flag: '--endpoint <url>',
  description:
    'Manager URL. Defaults to the only stored session, then the checkout config.toml apiEndpoint.',
  type: 'string',
} as const;

export const whoamiCommand = defineCommand<WhoamiData>({
  name: 'whoami',
  summary: 'Show the account the stored session belongs to.',
  usage: `${CLI_NAME} whoami [--endpoint <url>] [--strict] [--json]`,
  flags: [ENDPOINT_FLAG, STRICT_FLAG],
  maxArgs: 0,
  run: async (context) => {
    const { endpoint } = resolveEndpoint({
      flag:
        typeof context.flags.endpoint === 'string'
          ? context.flags.endpoint
          : undefined,
      cwd: context.cwd,
    });
    const stored = loadSession(endpoint);
    if (!stored) {
      throw new CliError(
        'auth_required',
        `No session stored for ${endpoint}.`,
        { hint: `${CLI_NAME} login --endpoint ${endpoint}` },
      );
    }

    try {
      const user = await fetchWhoAmI({
        endpoint,
        sessionId: stored.sessionId,
      });
      const repo = tryResolveRepoContext(context.cwd);
      // Outside a checkout there is no committed SDL to compare against.
      const gate = repo.ok
        ? await applyVersionAlignmentGate({
            cwd: context.cwd,
            schemaCtx: { schema: loadSchema(repo.context) },
            strict: context.flags.strict === true,
            notify: context.notify,
            endpointFlag: endpoint,
          })
        : {};
      return {
        ...user,
        endpoint,
        sessionId: maskSessionId(stored.sessionId),
        sessionFile: stored.path,
        ...(gate.manager ? { manager: gate.manager } : {}),
        ...(gate.alignment ? { alignment: gate.alignment } : {}),
      };
    } catch (error) {
      // A rejected session is dead weight; drop it and make the user re-login.
      if (error instanceof CliError && error.code === 'auth_required') {
        deleteSession(endpoint);
      }
      throw error;
    }
  },
  render: (data, options) => {
    const { verbosity } = options;
    const blocks: Block[] = [
      section(`${CLI_NAME} whoami`),
      record([
        ['email', data.email],
        ['role', data.role],
        ['domain', data.domainName],
        ['endpoint', data.endpoint],
        ['manager', data.manager?.managerVersion],
        ...(verbosity === 'dense'
          ? []
          : ([
              ['session', data.sessionId],
              ['file', data.sessionFile],
            ] as Array<[string, string]>)),
        ...(verbosity === 'detail'
          ? ([
              ['fullName', data.fullName],
              ['status', data.status],
              ['apiVersion', data.manager?.apiVersion],
              ['versionSource', data.manager?.source],
              [
                'introspection',
                data.manager?.introspection === undefined
                  ? undefined
                  : String(data.manager.introspection),
              ],
            ] as Array<[string, string | undefined]>)
          : []),
      ]),
    ];
    if (data.alignment && verbosity !== 'dense') {
      blocks.push(...renderAlignment(data.alignment));
    }
    return renderBlocks(blocks);
  },
});
