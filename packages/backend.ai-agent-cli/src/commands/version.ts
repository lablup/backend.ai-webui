import { defineCommand } from '../command.js';
import { CLI_NAME, cliVersion } from '../meta.js';
import { record, renderBlocks, section } from '../output.js';
import { resolveRepoContext } from '../repo-context.js';

export interface VersionData {
  cli: { name: string; version: string; node: string };
  repo: {
    root: string;
    version: string;
    schemaPath: string;
    i18nDir: string;
    docsDir: string;
  };
}

export const versionCommand = defineCommand<VersionData>({
  name: 'version',
  summary: 'Print the CLI version and the detected checkout.',
  usage: `${CLI_NAME} version [--json]`,
  flags: [],
  maxArgs: 0,
  run: ({ cwd }) => {
    const context = resolveRepoContext(cwd);
    return {
      cli: { name: CLI_NAME, version: cliVersion(), node: process.version },
      repo: {
        root: context.repoRoot,
        version: context.repoVersion,
        schemaPath: context.schemaPath,
        i18nDir: context.i18nDir,
        docsDir: context.docsDir,
      },
    };
  },
  render: (data, { verbosity }) => {
    if (verbosity === 'dense') {
      return renderBlocks([
        record([
          ['cli', `${data.cli.name} ${data.cli.version}`],
          ['repoRoot', data.repo.root],
          ['repoVersion', data.repo.version],
        ]),
      ]);
    }
    const blocks = [
      section(`${data.cli.name} v${data.cli.version}`),
      record([
        ['cli', data.cli.name],
        ['cliVersion', data.cli.version],
        ['node', data.cli.node],
        ['repoRoot', data.repo.root],
        ['repoVersion', data.repo.version],
      ]),
    ];
    if (verbosity === 'detail') {
      blocks.push(
        section('Data sources'),
        record([
          ['schemaPath', data.repo.schemaPath],
          ['i18nDir', data.repo.i18nDir],
          ['docsDir', data.repo.docsDir],
        ]),
      );
    }
    return renderBlocks(blocks);
  },
});
