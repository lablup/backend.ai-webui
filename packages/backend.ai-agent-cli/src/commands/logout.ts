import { defineCommand } from '../command.js';
import { CLI_NAME } from '../meta.js';
import { record, renderBlocks, section } from '../output.js';
import {
  deleteSession,
  loadSession,
  maskSessionId,
  resolveEndpoint,
} from '../session.js';
import { ENDPOINT_FLAG } from './whoami.js';

export interface LogoutData {
  endpoint: string;
  removed: boolean;
  sessionFile: string;
  /** Masked; present only when something was removed. */
  sessionId?: string;
}

export const logoutCommand = defineCommand<LogoutData>({
  name: 'logout',
  summary: 'Delete the stored session file. The manager is not contacted.',
  usage: `${CLI_NAME} logout [--endpoint <url>] [--json]`,
  flags: [ENDPOINT_FLAG],
  maxArgs: 0,
  run: (context) => {
    const { endpoint } = resolveEndpoint({
      flag:
        typeof context.flags.endpoint === 'string'
          ? context.flags.endpoint
          : undefined,
      cwd: context.cwd,
    });
    const stored = loadSession(endpoint);
    const removed = deleteSession(endpoint);
    return {
      endpoint,
      removed: removed !== null,
      sessionFile: removed ?? '',
      sessionId: stored ? maskSessionId(stored.sessionId) : undefined,
    };
  },
  render: (data) =>
    renderBlocks([
      section(
        `${CLI_NAME} logout`,
        data.removed
          ? 'Removed the local session file. The WebUI session itself is untouched.'
          : 'Nothing to remove.',
      ),
      record([
        ['endpoint', data.endpoint],
        ['removed', data.removed],
        ['file', data.sessionFile],
        ['session', data.sessionId],
      ]),
    ]),
});
