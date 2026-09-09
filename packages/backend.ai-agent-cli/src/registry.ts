import type { AnyCommand } from './command.js';
import { cookbookCommand } from './commands/cookbook.js';
import { docsCommand } from './commands/docs.js';
import { doctorCommand } from './commands/doctor.js';
import { explainCommand } from './commands/explain.js';
import { initCommand } from './commands/init.js';
import { loginCommand } from './commands/login.js';
import { logoutCommand } from './commands/logout.js';
import { manifestCommand } from './commands/manifest.js';
import { queryCommand } from './commands/query.js';
import { schemaCommand } from './commands/schema.js';
import { searchCommand } from './commands/search.js';
import { syncCommand } from './commands/sync.js';
import { versionCommand } from './commands/version.js';
import { whoamiCommand } from './commands/whoami.js';

/** The single table `--help` and `manifest` are generated from. */
export const COMMANDS: AnyCommand[] = [
  versionCommand,
  manifestCommand,
  initCommand,
  doctorCommand,
  syncCommand,
  searchCommand,
  docsCommand,
  schemaCommand,
  loginCommand,
  logoutCommand,
  whoamiCommand,
  queryCommand,
  cookbookCommand,
  explainCommand,
];

export function findCommand(name: string): AnyCommand | undefined {
  return COMMANDS.find((command) => command.name === name);
}
