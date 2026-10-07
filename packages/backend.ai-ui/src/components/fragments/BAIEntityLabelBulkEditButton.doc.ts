import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIEntityLabelBulkEditButton',
  displayName: 'BAI Entity Label Bulk Edit Button',
  category: 'Action',
  keywords: ['label', 'entity label', 'bulk action', 'selection', 'tag'],
  usage: {
    description:
      'An icon button for a table’s selection toolbar that opens BAIEntityLabelSettingModal in `add` mode for the selected rows. It renders nothing when `entityTypes` does not list the entity type. Remaining props go to the IconButton.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Place it next to BAISelectionLabel and refetch the list in `onLabelsChanged`.',
      },
    ],
  },
  props: [
    {
      name: 'entityType',
      type: "'session' | 'vfolder' | 'deployment' | 'resource_group'",
      description: 'The entity type name, as `entityTypes` lists it.',
      required: true,
    },
    {
      name: 'targets',
      type: 'ReadonlyArray<{ entityId: string; name?: string }>',
      description: 'The selected entities, by UUID.',
      required: true,
    },
    {
      name: 'onLabelsChanged',
      type: '() => void',
      description: 'Called once any label request ran.',
    },
  ],
  examples: [
    {
      label: 'In a selection toolbar',
      code: `<BAIEntityLabelBulkEditButton
  entityType="vfolder"
  targets={selectedFolders.map((f) => ({ entityId: toLocalId(f.id), name: f.metadata?.name ?? undefined }))}
  onLabelsChanged={() => updateFetchKey()}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
