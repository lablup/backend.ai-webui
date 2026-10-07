import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIEntityLabelSettingModal',
  displayName: 'BAI Entity Label Setting Modal',
  category: 'Overlay',
  keywords: ['label', 'entity label', 'key value', 'bulk', 'modal', 'tag'],
  usage: {
    description:
      'One form for the `key=value` labels of any labelable entity. In `edit` mode (the default) it edits one entity’s labels: it pre-fills from `entityLabelsFrgmt`, upserts the keys that are new or changed and purges the keys the user removed. In `add` mode it adds the entered labels to every target, replacing the value of a key a target already carries and leaving its other labels alone. Each change is its own `upsertEntityLabel` / `purgeEntityLabel` request, run together with `Promise.allSettled`; failures are listed in a BAIBulkErrorModal. The content unmounts after the modal closes.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Refetch the list in `onRequestClose(true)` — a new label changes the `entityLabels` connection, which the mutation payload does not patch.',
      },
      {
        guidance: true,
        description:
          'Pass the entity UUID as `entityId` (`toLocalId(node.id)`), not the Relay global id.',
      },
      {
        guidance: false,
        description:
          'Offer the modal on a page whose entity type `useIsLabelableEntityType` reports as false.',
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
      description: 'The entities to label; `edit` reads only the first.',
      required: true,
    },
    {
      name: 'mode',
      type: "'edit' | 'add'",
      description:
        '`edit` replaces one entity’s labels; `add` puts the entered labels on every target and removes nothing.',
    },
    {
      name: 'entityLabelsFrgmt',
      type: 'BAIEntityLabelSettingModalFragment$key | null',
      description: 'The target’s `entityLabels` connection, for `edit`.',
    },
    {
      name: 'onRequestClose',
      type: '(success: boolean) => void',
      description:
        'Called on cancel with `false`, and with `true` once any request ran.',
      required: true,
    },
  ],
  examples: [
    {
      label: 'Editing one folder’s labels from a row action',
      code: `<BAIEntityLabelSettingModal
  open={!!labelTarget}
  entityType="vfolder"
  targets={labelTarget ? [{ entityId: toLocalId(labelTarget.id), name: labelTarget.name }] : []}
  entityLabelsFrgmt={labelTarget?.entityLabels}
  onRequestClose={(success) => {
    setLabelTarget(null);
    if (success) updateFetchKey();
  }}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
