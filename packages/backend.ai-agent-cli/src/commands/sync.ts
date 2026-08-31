import type { SyncData } from '../checkout-sync.js';
import { DEFAULT_SYNC_REF, syncCheckout } from '../checkout-sync.js';
import { defineCommand } from '../command.js';
import { CLI_NAME } from '../meta.js';
import type { Block } from '../output.js';
import { list, record, renderBlocks, section } from '../output.js';

export const syncCommand = defineCommand<SyncData>({
  name: 'sync',
  summary:
    'Fetch the checkout data (SDL, i18n, manual) for use outside a WebUI checkout.',
  usage: `${CLI_NAME} sync [--ref <branch|tag>] [--force] [--json]`,
  flags: [
    {
      flag: '--ref <branch|tag>',
      description: `Branch or tag of lablup/backend.ai-webui to take the data from (default: ${DEFAULT_SYNC_REF}).`,
      type: 'string',
      default: DEFAULT_SYNC_REF,
    },
    {
      flag: '--force',
      description: 'Discard the existing data checkout and clone again.',
      type: 'boolean',
    },
  ],
  maxArgs: 0,
  run: ({ flags, notify }) =>
    syncCheckout({
      ref: typeof flags.ref === 'string' ? flags.ref : undefined,
      force: flags.force === true,
      notify,
    }),
  render: (data, { verbosity }) => {
    const headline =
      data.outcome === 'cloned'
        ? `cloned ${data.ref} into ${data.dir}`
        : data.outcome === 'updated'
          ? `updated ${data.dir} to ${data.ref}`
          : `${data.dir} already at ${data.ref}; nothing to do`;
    if (verbosity === 'dense') {
      return `${data.ref}\t${data.outcome}\t${data.commit}\n${headline}`;
    }
    const blocks: Block[] = [
      section(`${CLI_NAME} sync`, headline),
      record([
        ['dir', data.dir],
        ['ref', data.ref],
        ['commit', data.commit],
        ['previousCommit', data.previousCommit],
        ['outcome', data.outcome],
        ['syncedAt', data.syncedAt],
        ['configPath', data.configPath],
      ]),
    ];
    if (verbosity === 'detail') {
      blocks.push(
        section('Source'),
        record([
          ['repo', data.repo],
          ['kind', data.kind],
        ]),
        section('Sparse patterns'),
        list(data.patterns),
      );
    }
    return renderBlocks(blocks);
  },
});
