import type { AnyCommand } from './command.js';
import { docsCommand } from './commands/docs.js';
import { doctorCommand } from './commands/doctor.js';
import { manifestCommand } from './commands/manifest.js';
import { searchCommand } from './commands/search.js';
import { versionCommand } from './commands/version.js';

/** The single table `--help` and `manifest` are generated from. */
export const COMMANDS: AnyCommand[] = [
  versionCommand,
  manifestCommand,
  doctorCommand,
  searchCommand,
  docsCommand,
];

export function findCommand(name: string): AnyCommand | undefined {
  return COMMANDS.find((command) => command.name === name);
}
