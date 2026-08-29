import { GLOBAL_FLAGS } from '../args.js';
import type { FlagSpec } from '../command.js';
import { defineCommand } from '../command.js';
import { CLI_DESCRIPTION, CLI_NAME, cliVersion } from '../meta.js';
import { API_VERSION, record, renderBlocks, section } from '../output.js';

export interface ManifestCommandEntry {
  name: string;
  summary: string;
  usage: string;
  flags: FlagSpec[];
}

export interface ManifestData {
  name: string;
  version: string;
  apiVersion: string;
  description: string;
  globalOptions: FlagSpec[];
  commands: ManifestCommandEntry[];
}

export const manifestCommand = defineCommand<ManifestData>({
  name: 'manifest',
  summary: 'Print the CLI capability manifest (commands and their flags).',
  usage: `${CLI_NAME} manifest [--json]`,
  flags: [],
  maxArgs: 0,
  run: ({ commands }) => ({
    name: CLI_NAME,
    version: cliVersion(),
    apiVersion: API_VERSION,
    description: CLI_DESCRIPTION,
    globalOptions: GLOBAL_FLAGS,
    commands: commands.map((command) => ({
      name: command.name,
      summary: command.summary,
      usage: command.usage,
      flags: command.flags,
    })),
  }),
  render: (data, { verbosity }) => {
    const blocks = [
      section(
        `${data.name} v${data.version} (${data.commands.length} commands)`,
        verbosity === 'dense' ? undefined : data.description,
      ),
    ];
    if (verbosity !== 'dense') {
      blocks.push(record([['apiVersion', data.apiVersion]]));
    }

    for (const command of data.commands) {
      blocks.push(
        record([
          ['command', command.name],
          ['description', command.summary],
          ...(verbosity === 'dense'
            ? []
            : ([['usage', command.usage]] as Array<[string, string]>)),
        ]),
      );
      if (verbosity === 'detail') {
        for (const flag of command.flags) {
          blocks.push(
            record([
              ['flag', flag.flag],
              ['type', flag.type],
              ['default', flag.default],
              ['flagDescription', flag.description],
            ]),
          );
        }
      }
    }

    if (verbosity === 'detail') {
      blocks.push(section('Global options'));
      for (const flag of data.globalOptions) {
        blocks.push(
          record([
            ['flag', flag.flag],
            ['type', flag.type],
            ['default', flag.default],
            ['flagDescription', flag.description],
          ]),
        );
      }
    }
    return renderBlocks(blocks);
  },
});
