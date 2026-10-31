import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIEntityLabelTargetCell',
  displayName: 'BAI Entity Label Target Cell',
  category: 'Table & List',
  keywords: [
    'label',
    'entity label',
    'detail',
    'drawer',
    'modal',
    'table',
    'edit',
  ],
  usage: {
    description:
      'BAIEntityLabelCell plus its editor for a detail drawer, modal or table row whose entity type has no `entityLabels` field: it loads the labels through the root `entityLabels(scope:)` query by entity type and UUID, opens BAIEntityLabelSettingModal from "Edit labels", and refetches after a save. In a table it is one query per row, so it suits paged admin lists, not long scrolling ones.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Render it, as a MetadataListItem or a table column, only when `useIsLabelableEntityType` reports the type, as the other Labels rows do.',
      },
      {
        guidance: true,
        description:
          'Pass the entity’s `entityId` (its UUID), never the Relay global id.',
      },
      {
        guidance: false,
        description:
          'Do not use it where the parent fragment already selects `entityLabels` — spread the fragments there and render BAIEntityLabelCell directly.',
      },
    ],
  },
  props: [
    {
      name: 'entityType',
      type: 'BAILabelableEntityType',
      description: 'The entity type name the manager labels.',
      required: true,
    },
    {
      name: 'entityId',
      type: 'string',
      description: 'The entity’s UUID.',
      required: true,
    },
    {
      name: 'name',
      type: 'string',
      description: 'Names the entity in the editor’s failure list.',
    },
    {
      name: 'readOnly',
      type: 'boolean',
      description: 'Hides the "Edit labels" action.',
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
      label: 'A Labels row in a detail drawer',
      code: `{isLabelable && (
  <MetadataListItem label={t('entityLabel.Labels')}>
    <BAIEntityLabelTargetCell
      entityType="role"
      entityId={role.entityId}
      name={role.name}
    />
  </MetadataListItem>
)}`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
