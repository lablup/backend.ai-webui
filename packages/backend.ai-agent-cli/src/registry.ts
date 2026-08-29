import type { AnyCommand } from './command.js';
import { docsCommand } from './commands/docs.js';
import { doctorCommand } from './commands/doctor.js';
import { explainCommand } from './commands/explain.js';
import { loginCommand } from './commands/login.js';
import { logoutCommand } from './commands/logout.js';
import { manifestCommand } from './commands/manifest.js';
import { openCommand } from './commands/open.js';
import { queryCommand } from './commands/query.js';
import { schemaCommand } from './commands/schema.js';
import { searchCommand } from './commands/search.js';
import { versionCommand } from './commands/version.js';
import { whoamiCommand } from './commands/whoami.js';

/** The single table `--help` and `manifest` are generated from. */
export const COMMANDS: AnyCommand[] = [
  versionCommand,
  manifestCommand,
  doctorCommand,
  searchCommand,
  docsCommand,
  schemaCommand,
  loginCommand,
  logoutCommand,
  whoamiCommand,
  queryCommand,
  explainCommand,
  openCommand,
];

export function findCommand(name: string): AnyCommand | undefined {
  return COMMANDS.find((command) => command.name === name);
}
