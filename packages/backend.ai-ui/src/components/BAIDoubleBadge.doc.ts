import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIDoubleBadge',
  displayName: 'BAI Double Badge',
  category: 'Content',
  keywords: [
    'badge',
    'status',
    'pair',
    'key value',
    'double badge',
    'elapsed time',
    'live',
  ],
  usage: {
    description:
      'Renders a run of Astryx Badges welded into one continuous pill, for a live pair the system changes on its own — an agent status with its version, a kernel status with its status info, a label with a ticking elapsed time. For a settled pair that changes only when someone edits it, use BAIDoubleToken. The segments come in as data — plain strings, which all render neutral, or objects carrying an Astryx Badge variant (convert a runtime status with badgeVariantForStatus / badgeVariantForTagColor first). Empty labels are skipped and an empty values array renders nothing.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Colour the segment that carries the state (the status) and leave its detail neutral unless the detail is the state.',
      },
      {
        guidance: false,
        description:
          'Use it for names, versions or permissions that only change on edit — that is BAIDoubleToken.',
      },
    ],
  },
  props: [
    {
      name: 'values',
      type: 'Array<string> | Array<BAIDoubleBadgeValue>',
      description:
        'The segments, left to right. An array of strings renders every segment neutral; an array of objects gives each one a label and an optional Astryx Badge variant (default neutral). An empty array renders nothing.',
      default: '[]',
    },
  ],
  examples: [
    {
      label: 'Agent status and version',
      code: `<BAIDoubleBadge
  values={[
    { label: status, variant: badgeVariantForStatus('agent', status) },
    { label: version, variant: badgeVariantForStatus('agent', status) },
  ]}
/>`,
    },
    {
      label: 'Elapsed-time ticker',
      code: `<BAIDoubleBadge values={[t('agent.ElapsedTime'), elapsed]} />`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
