import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'StorageUsageBadge',
  displayName: 'Storage Usage Badge',
  category: 'Feedback & Status',
  keywords: [
    'storage usage',
    'capacity',
    'quota',
    'threshold',
    'status dot',
    'badge',
    'health indicator',
  ],
  usage: {
    description:
      'The dot that says how full a storage host is. It is a BAIBadge whose colour is derived from a usage percentage against fixed thresholds: below 70 is success, below 90 is warning, and 90 or above is error. An undefined percent leaves the colour unset, which BAIBadge draws as an outline-only dot — the deliberate rendering for a host whose usage the backend has not reported. Both color and processing are omitted from the props type because the percentage owns the first and the badge is not a progress indicator; the remaining BAIBadge props, text and style among them, pass through.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Render it whenever the backend attaches a usage object, even an empty one, and leave percent undefined so the row shows a neutral marker rather than silently dropping the indicator.',
      },
      {
        guidance: true,
        description:
          'Pair it with a tooltip that names the band in words, since the dot on its own carries only colour and colour alone is not an accessible signal.',
      },
      {
        guidance: false,
        description:
          'Passing a 0-to-1 ratio — the thresholds are percentage points, so a ratio always lands in the success band and a full volume reads as healthy.',
      },
      {
        guidance: false,
        description:
          'Restating the same thresholds at the call site to pick a colour; read the percentage into this component and let it decide, so every storage surface breaks at the same numbers.',
      },
    ],
  },
  props: [
    {
      name: 'percent',
      type: 'number',
      description:
        'Usage as a percentage from 0 to 100. Selects the semantic colour at the 70 and 90 boundaries. Undefined renders an uncoloured, outline-only dot for unknown usage.',
    },
  ],
  examples: [
    {
      label: 'Host option in a storage select',
      code: '<StorageUsageBadge percent={usagePercent} />',
    },
    {
      label: 'With the band spelled out in a tooltip',
      code: `<BAIIconWithTooltip
  content={t('data.usage.HostStatusTooltip', { status: usageLabel })}
  icon={<StorageUsageBadge percent={usagePercent} />}
  style={{ alignItems: 'center' }}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
