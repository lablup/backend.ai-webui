import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIArtifactStatusTag',
  displayName: 'BAI Artifact Status Tag',
  category: 'Feedback & Status',
  keywords: [
    'artifact',
    'revision',
    'status',
    'tag',
    'label',
    'state',
    'reservoir',
  ],
  usage: {
    description:
      'Renders the status of a single artifact revision as a BAITag. It reads `BAIArtifactStatusTagFragment` on `ArtifactRevision`, which selects only `status`, so the caller spreads that fragment on whichever revision node the cell shows. The raw enum value is printed as-is — `SCANNED`, `PULLING`, `PULLED`, `AVAILABLE`, `VERIFYING`, `NEEDS_APPROVAL`, `REJECTED`, `FAILED` — and the tag uses the default BAITag colour for every one of them, so status is conveyed by the word rather than by hue. It is the status cell of both BAIArtifactTable (on the latest revision) and BAIArtifactRevisionTable.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Spread `BAIArtifactStatusTagFragment` on the same revision node the row renders, so the tag re-renders from the store when a pull changes the status.',
      },
      {
        guidance: true,
        description:
          'Pass the artifact’s latest revision when showing status in an artifact-level list, which is what BAIArtifactTable does.',
      },
      {
        guidance: false,
        description:
          'Reach for it to convey severity — every status renders in the same neutral tag colour, so a failure needs its own affordance if it must stand out.',
      },
      {
        guidance: false,
        description:
          'Wrap it to localize or relabel the status; the enum value is rendered verbatim and a translated label belongs in a different component.',
      },
    ],
  },
  props: [
    {
      name: 'artifactRevisionFrgmt',
      type: 'BAIArtifactStatusTagFragment$key',
      description:
        'Fragment reference for the artifact revision whose `status` is displayed. The fragment selects nothing else, so it can be spread on any revision node cheaply.',
      required: true,
    },
  ],
  examples: [
    {
      label: 'Status column of a revision table',
      code: `{
  title: t('reservoir.Status'),
  key: 'status',
  render: (_, record) => (
    <BAIArtifactStatusTag artifactRevisionFrgmt={record} />
  ),
}`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
