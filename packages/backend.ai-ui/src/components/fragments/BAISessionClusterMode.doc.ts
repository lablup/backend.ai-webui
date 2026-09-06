import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAISessionClusterMode',
  displayName: 'BAI Session Cluster Mode',
  category: 'Content',
  keywords: [
    'cluster',
    'cluster mode',
    'cluster size',
    'single node',
    'multi node',
    'session',
    'badge',
  ],
  usage: {
    description:
      'Shows whether a compute session runs on a single node or across multiple nodes, optionally followed by the cluster size in parentheses. It reads the `BAISessionClusterModeFragment` on `ComputeSessionNode` (`cluster_mode`, `cluster_size`), so a Relay caller spreads `...BAISessionClusterModeFragment` into the session selection and passes the node as `sessionFrgmt`. It also works without Relay: `clusterMode` and `clusterSize` take precedence over the fragment, which is how non-session surfaces such as the deployment preset table reuse it. The mode string is matched by prefix — anything starting with `SINGLE` or `MULTI` (case-insensitive) resolves to the short label, anything else renders a dash.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Pass `sessionFrgmt` on session surfaces and the plain `clusterMode` / `clusterSize` values on surfaces that have no `ComputeSessionNode` to spread into.',
      },
      {
        guidance: true,
        description:
          'Switch to `mode="tag"` where the value sits among other badges, and leave the default text mode inside descriptions and table cells.',
      },
      {
        guidance: true,
        description:
          'Turn `showSize` off when a neighbouring column already reports the cluster size, so the number is not printed twice.',
      },
      {
        guidance: false,
        description:
          'Expect a raw backend value to survive — only `SINGLE*` and `MULTI*` prefixes map to a label and everything else collapses to a dash.',
      },
    ],
  },
  props: [
    {
      name: 'sessionFrgmt',
      type: 'BAISessionClusterModeFragment$key | null',
      description:
        'Fragment reference to a `ComputeSessionNode`. Omit it when the values are passed directly; a null reference falls back to the direct props and then to a dash.',
    },
    {
      name: 'clusterMode',
      type: 'string | null',
      description:
        'Cluster mode value supplied directly, for example from the v2 session API. Takes precedence over the fragment when provided.',
    },
    {
      name: 'clusterSize',
      type: 'number | null',
      description:
        'Cluster size supplied directly. Takes precedence over the fragment when provided; it is only rendered while `showSize` is on and the resolved value is not nullish.',
    },
    {
      name: 'showSize',
      type: 'boolean',
      description:
        'Whether the resolved cluster size is appended in parentheses after the mode label.',
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
      label: 'Cluster mode column driven by a fragment',
      code: '<BAISessionClusterMode sessionFrgmt={session} />',
    },
    {
      label: 'Direct values, rendered as a badge',
      code: `<BAISessionClusterMode
  mode="tag"
  clusterMode={record.cluster?.clusterMode}
  clusterSize={record.cluster?.clusterSize}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
