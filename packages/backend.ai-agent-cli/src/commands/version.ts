import { defineCommand } from '../command.js';
import { CLI_NAME, cliVersion } from '../meta.js';
import type { Block } from '../output.js';
import { record, renderBlocks, section } from '../output.js';
import { resolveRepoContext } from '../repo-context.js';
import { readSchemaMeta } from '../schema-meta.js';

export interface VersionSchemaMeta {
  tag: string;
  sha256: string;
  fetchedAt: string;
  source: string;
  path: string;
  ageDays?: number;
}

export interface VersionData {
  cli: { name: string; version: string; node: string };
  repo: {
    root: string;
    version: string;
    schemaPath: string;
    i18nDir: string;
    docsDir: string;
  };
  /** From `data/schema.meta.json`; absent until `schema sync` records one. */
  schemaMeta?: VersionSchemaMeta;
}

export const versionCommand = defineCommand<VersionData>({
  name: 'version',
  summary: 'Print the CLI version and the detected checkout.',
  usage: `${CLI_NAME} version [--json]`,
  flags: [],
  maxArgs: 0,
  run: ({ cwd }) => {
    const context = resolveRepoContext(cwd);
    const meta = readSchemaMeta(context);
    return {
      cli: { name: CLI_NAME, version: cliVersion(), node: process.version },
      repo: {
        root: context.repoRoot,
        version: context.repoVersion,
        schemaPath: context.schemaPath,
        i18nDir: context.i18nDir,
        docsDir: context.docsDir,
      },
      ...(meta
        ? {
            schemaMeta: {
              tag: meta.tag,
              sha256: meta.sha256,
              fetchedAt: meta.fetchedAt,
              source: meta.source,
              path: meta.path,
              ...(meta.ageDays === null ? {} : { ageDays: meta.ageDays }),
            },
          }
        : {}),
    };
  },
  render: (data, { verbosity }) => {
    if (verbosity === 'dense') {
      return renderBlocks([
        record([
          ['cli', `${data.cli.name} ${data.cli.version}`],
          ['repoRoot', data.repo.root],
          ['repoVersion', data.repo.version],
          ['schemaTag', data.schemaMeta?.tag],
        ]),
      ]);
    }
    const blocks: Block[] = [
      section(`${data.cli.name} v${data.cli.version}`),
      record([
        ['cli', data.cli.name],
        ['cliVersion', data.cli.version],
        ['node', data.cli.node],
        ['repoRoot', data.repo.root],
        ['repoVersion', data.repo.version],
        ['schemaTag', data.schemaMeta?.tag],
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
      if (data.schemaMeta) {
        blocks.push(
          section('Schema meta'),
          record([
            ['tag', data.schemaMeta.tag],
            ['sha256', data.schemaMeta.sha256],
            ['fetchedAt', data.schemaMeta.fetchedAt],
            ['ageDays', data.schemaMeta.ageDays],
            ['source', data.schemaMeta.source],
            ['path', data.schemaMeta.path],
          ]),
        );
      }
    }
    return renderBlocks(blocks);
  },
});
