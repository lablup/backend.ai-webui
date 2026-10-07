import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIEntityLabelCell',
  displayName: 'BAI Entity Label Cell',
  category: 'Table & List',
  keywords: ['label', 'entity label', 'table cell', 'hover action', 'filter'],
  usage: {
    description:
      'The Labels column cell: a BAINameActionCell whose title is the entity’s clickable label tokens and whose hover action is "Edit labels". Editing lives on the Labels column rather than the name cell, next to what it changes. Shows "-" when the entity has no labels.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Open BAIEntityLabelSettingModal from `onEdit`, and filter the list from `onLabelClick` with `toEntityLabelFilter`.',
      },
      {
        guidance: true,
        description:
          'Pass `editDisabledReason` when the viewer cannot update the entity, so the action explains itself.',
      },
    ],
  },
  props: [
    {
      name: 'entityLabelsFrgmt',
      type: 'BAIEntityLabelTokensFragment$key | null | undefined',
      description: 'The entity’s `entityLabels` connection.',
      required: true,
    },
    {
      name: 'onEdit',
      type: '() => void',
      description: 'Adds the "Edit labels" hover action; omit for read-only.',
    },
    {
      name: 'editDisabledReason',
      type: 'string',
      description: 'Disables the action and shows this reason.',
    },
    {
      name: 'onLabelClick',
      type: '(label: { key: string; value: string }) => void',
      description: 'Called when a label token is clicked.',
    },
  ],
  examples: [
    {
      label: 'A Labels column',
      code: `{
  key: 'labels',
  title: t('entityLabel.Labels'),
  render: (_, record) => (
    <BAIEntityLabelCell
      entityLabelsFrgmt={record.entityLabels}
      onEdit={() => setLabelingTarget(record)}
      onLabelClick={(label) => setFilter(toEntityLabelFilter(label))}
    />
  ),
}`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
