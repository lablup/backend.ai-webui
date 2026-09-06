import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAISchedulingResultBadge',
  displayName: 'BAI Scheduling Result Badge',
  category: 'Feedback & Status',
  keywords: [
    'scheduling result',
    'status badge',
    'result badge',
    'status dot',
    'badge',
    'scheduler',
    'outcome',
  ],
  usage: {
    description:
      'The badge that reports the outcome of one scheduling attempt. It is a BAIBadge with the colour decision taken out of the caller: the raw result enum is mapped to a semantic colour (SUCCESS to success, NEED_RETRY to warning, FAILURE / EXPIRED / GIVE_UP to error, STALE / SKIPPED to default) and the enum value itself becomes the visible label. A null result renders no label and an uncoloured dot, which is what an attempt with no recorded outcome should look like. The module also exports resultSemanticColorMap, so anything drawing a result beside the badge — the sub-step timeline rail dots — resolves the same colour instead of inventing a second language. Because colour and label are both derived, color and text are omitted from the props type; the remaining BAIBadge props pass through.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Pass null when the backend reports no result yet, instead of substituting a placeholder string that would read as a real outcome.',
      },
      {
        guidance: true,
        description:
          'Import resultSemanticColorMap when a nearby element needs the same colour, so one result never appears in two colour languages on the same screen.',
      },
      {
        guidance: true,
        description:
          'Narrow a Relay enum field to SchedulingResult before passing it — the generated type includes the forward-compatibility member, which has no entry in the map.',
      },
      {
        guidance: false,
        description:
          'Overriding whiteSpace through style unless the surrounding cell can genuinely wrap; the badge pins it to nowrap so a two-word result never breaks mid-label in a table row.',
      },
    ],
  },
  props: [
    {
      name: 'result',
      type: "'SUCCESS' | 'FAILURE' | 'STALE' | 'NEED_RETRY' | 'EXPIRED' | 'GIVE_UP' | 'SKIPPED' | null",
      description:
        'The scheduling outcome. Drives both the dot colour and the visible label. Null renders an uncoloured dot with no label.',
      required: true,
    },
    {
      name: 'style',
      type: 'React.CSSProperties',
      description:
        'Inline style on the badge. Merged after a fixed whiteSpace of nowrap, so a value given here wins over that default.',
    },
  ],
  examples: [
    {
      label: 'In a scheduling history table column',
      code: `{
  key: 'result',
  title: t('comp:BAISchedulingHistoryNodes.Result'),
  render: (__, record) => (
    <BAISchedulingResultBadge
      result={
        record.result && record.result !== '%future added value'
          ? (record.result as SchedulingResult)
          : null
      }
    />
  ),
}`,
    },
    {
      label: 'Standalone',
      code: '<BAISchedulingResultBadge result="NEED_RETRY" />',
    },
  ],
} satisfies ComponentDoc;

export default docs;
