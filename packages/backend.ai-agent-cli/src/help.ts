import { GLOBAL_FLAGS } from './args.js';
import type { AnyCommand, FlagSpec } from './command.js';
import { exitLine } from './errors.js';
import { CLI_DESCRIPTION, CLI_NAME } from './meta.js';
import { API_VERSION } from './output.js';
import { COMMANDS } from './registry.js';

const pad = (entries: Array<[string, string]>): string => {
  const width = Math.max(0, ...entries.map(([left]) => left.length));
  return entries
    .map(([left, right]) => `  ${left.padEnd(width)}  ${right}`)
    .join('\n');
};

const flagRows = (flags: FlagSpec[]): Array<[string, string]> =>
  flags.map((flag) => [flag.flag, flag.description]);

// Derived from ERROR_CODES / EXIT_BY_CODE, like the CLAUDE.md block, so there
// is one table and it cannot drift.
const OUTPUT_FORMAT = [
  'Output format',
  `Text mirrors --json (the machine-readable surface). Success envelope: { apiVersion: "${API_VERSION}", type, data }.`,
  'Error envelope: { apiVersion, error, code, suggestions?, hint? } on stderr.',
  'Records are aligned "key: value" lines; records are separated by a blank line.',
  '',
  `Exit codes: ${exitLine()}`,
].join('\n');

export function renderHelp(command?: AnyCommand): string {
  if (command) {
    const sections = [
      `Usage: ${command.usage}`,
      '',
      command.summary,
      '',
      'Options:',
      pad(flagRows([...command.flags, ...GLOBAL_FLAGS])),
      '',
      OUTPUT_FORMAT,
    ];
    return sections.join('\n');
  }

  return [
    `Usage: ${CLI_NAME} [options] [command]`,
    '',
    CLI_DESCRIPTION,
    '',
    'Options:',
    pad(flagRows(GLOBAL_FLAGS)),
    '',
    'Commands:',
    pad(COMMANDS.map((entry) => [entry.name, entry.summary])),
    '',
    OUTPUT_FORMAT,
  ].join('\n');
}
