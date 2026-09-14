import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIKernelProgressBreakdown',
  displayName: 'BAI Kernel Progress Breakdown',
  category: 'Feedback & Status',
  keywords: [
    'kernel',
    'session',
    'progress',
    'breakdown',
    'stacked bar',
    'legend',
    'popover',
  ],
  usage: {
    description:
      'The readout behind a session status badge: a title line with `done / total` in tabular numerals, a stacked bar whose segments are sized `count / total`, and a legend naming each colour. It exists because a cluster session in CREATING or TERMINATING moves one kernel at a time, and the ring on the badge only says "how far" — this says "where the rest are". The component is pure: it groups nothing and counts nothing, it renders the buckets the caller hands it, in the order the caller hands them. Astryx has no segmented bar (ProgressBar carries one value), so the track is drawn from declared tokens in a co-located stylesheet; the segment and swatch colours come from `badgeVariantForStatus("session", …)` so they match the badge the breakdown hangs off.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Put the done bucket first (RUNNING while creating, TERMINATED while terminating) so the bar fills left to right as the session progresses.',
      },
      {
        guidance: true,
        description:
          'Keep the phase\'s buckets in the list even at zero — "RUNNING 0" is what tells the reader the teardown is finished bar one kernel.',
      },
      {
        guidance: true,
        description:
          'Collapse statuses the user does not distinguish (PREPARING / PREPARED / CREATING) into one bucket before passing them in; a legend of eight near-synonyms reads as noise.',
      },
      {
        guidance: false,
        description:
          'Render it for a single-node session: one kernel has no distribution, so the badge alone already says everything.',
      },
      {
        guidance: false,
        description:
          'Use it as a general stacked-bar chart; the colours are a status vocabulary, not a categorical palette.',
      },
      {
        guidance: false,
        description:
          'Pass segment counts that exceed `total` — the bar clamps, but the legend would then disagree with the fraction in the title.',
      },
    ],
  },
  props: [
    {
      name: 'phase',
      type: "'creating' | 'terminating'",
      description:
        "Which way the kernel set is moving. Picks the title and nothing else — the bucket order is the caller's.",
    },
    {
      name: 'total',
      type: 'number',
      description:
        "Kernels the session is expected to have (its cluster size). Denominator of both the title's fraction and every segment width.",
    },
    {
      name: 'done',
      type: 'number',
      description:
        "Kernels that have reached the phase's target status. Shown in the title; the bar reads it from the segments instead.",
    },
    {
      name: 'segments',
      type: 'ReadonlyArray<{ status: string; count: number }>',
      description:
        'Buckets in display order, already grouped. A zero-count bucket renders a muted legend row and no bar segment.',
    },
    {
      name: 'className',
      type: 'string',
      description:
        'Extra class on the root, appended to the internal `bai-kernel-progress-breakdown` class.',
    },
  ],
  examples: [
    {
      label: 'Teardown of a 120-node session',
      code: `<BAIKernelProgressBreakdown
  phase="terminating"
  done={119}
  total={120}
  segments={[
    { status: 'TERMINATED', count: 119 },
    { status: 'TERMINATING', count: 1 },
    { status: 'RUNNING', count: 0 },
  ]}
/>`,
    },
    {
      label: 'Inside the hover card on a session status badge',
      code: `<HoverCard content={<BAIKernelProgressBreakdown {...progress} segments={segments} />}>
  <Badge variant="warning" icon={<BAIProgressRing percent={99} />} label="TERMINATING" />
</HoverCard>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
