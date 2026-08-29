import { defineCommand } from '../command.js';
import { CliError } from '../errors.js';
import { fetchWhoAmI, type WhoAmI } from '../manager.js';
import { CLI_NAME } from '../meta.js';
import { record, renderBlocks, section } from '../output.js';
import {
  deleteSession,
  loadSession,
  maskSessionId,
  resolveEndpoint,
} from '../session.js';

export interface WhoamiData extends WhoAmI {
  endpoint: string;
  /** Masked; the raw id is never rendered. */
  sessionId: string;
  sessionFile: string;
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
  usage: `${CLI_NAME} whoami [--endpoint <url>] [--json]`,
  flags: [ENDPOINT_FLAG],
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
      return {
        ...user,
        endpoint,
        sessionId: maskSessionId(stored.sessionId),
        sessionFile: stored.path,
      };
    } catch (error) {
      // A rejected session is dead weight; drop it and make the user re-login.
      if (error instanceof CliError && error.code === 'auth_required') {
        deleteSession(endpoint);
      }
      throw error;
    }
  },
  render: (data, { verbosity }) =>
    renderBlocks([
      section(`${CLI_NAME} whoami`),
      record([
        ['email', data.email],
        ['role', data.role],
        ['domain', data.domainName],
        ['endpoint', data.endpoint],
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
            ] as Array<[string, string | undefined]>)
          : []),
      ]),
    ]),
});
