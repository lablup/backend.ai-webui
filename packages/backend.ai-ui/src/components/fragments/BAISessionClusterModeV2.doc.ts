import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAISessionClusterModeV2',
  displayName: 'BAI Session Cluster Mode V2',
  category: 'Content',
  keywords: [
    'cluster',
    'cluster mode',
    'cluster size',
    'single node',
    'multi node',
    'session v2',
    'badge',
  ],
  usage: {
    description:
      'The v2 counterpart of `BAISessionClusterMode`, for the SessionV2 GraphQL surface. It reads the `BAISessionClusterModeV2Fragment` on `SessionV2MetadataInfo` (`clusterMode`, `clusterSize`), so the caller spreads `...BAISessionClusterModeV2Fragment` inside the session `metadata` selection and passes that metadata object as `metadataFrgmt` — not the session node. There is no direct-value escape hatch here: the fragment is the only input. The v2 `ClusterMode` enum is matched by prefix exactly as in v1, so `SINGLE_NODE` and `MULTI_NODE` resolve to the short labels and any other value renders a dash.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Guard the call site on `session.metadata` being present and render a dash yourself when it is absent, as the SessionV2 table does.',
      },
      {
        guidance: true,
        description:
          'Use `mode="tag"` where the value shares a row with other badges, and the default text mode in table cells and description lists.',
      },
      {
        guidance: false,
        description:
          'Pass the session node itself — the fragment is declared on `SessionV2MetadataInfo`, so the spread and the prop both belong to the `metadata` field.',
      },
      {
        guidance: false,
        description:
          'Reach for this component on the v1 `ComputeSessionNode` surface; `BAISessionClusterMode` is the one that reads that fragment.',
      },
    ],
  },
  props: [
    {
      name: 'metadataFrgmt',
      type: 'BAISessionClusterModeV2Fragment$key | null',
      description:
        'Fragment reference to a `SessionV2MetadataInfo`. A null reference resolves no mode, which renders a dash.',
      required: true,
    },
    {
      name: 'showSize',
      type: 'boolean',
      description:
        'Whether the cluster size is appended in parentheses after the mode label. It is omitted anyway when the fragment carries no size.',
      default: 'true',
    },
    {
      name: 'mode',
      type: "'text' | 'tag'",
      description:
        'Presentation: plain Astryx Text, or a neutral Badge carrying the same label and size.',
      default: "'text'",
    },
  ],
  examples: [
    {
      label: 'Cluster mode column in the SessionV2 table',
      code: `{
  key: 'clusterMode',
  title: t('comp:SessionV2Nodes.ClusterMode'),
  render: (__, session) =>
    session.metadata ? (
      <BAISessionClusterModeV2 metadataFrgmt={session.metadata} />
    ) : (
      '-'
    ),
}`,
    },
    {
      label: 'Mode only, as a badge',
      code: `<BAISessionClusterModeV2
  metadataFrgmt={session.metadata}
  mode="tag"
  showSize={false}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
