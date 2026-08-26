import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIProjectSettingModal',
  displayName: 'BAI Project Setting Modal',
  category: 'Overlay',
  keywords: [
    'project',
    'group',
    'create project',
    'edit project',
    'settings',
    'modal',
    'form',
  ],
  usage: {
    description:
      'The create-and-edit form for a project, in one modal. `projectFragment` decides the mode: null means create (`create_group`, followed by `associate_scaling_groups_with_user_group` when resource groups were picked), a fragment reference means edit (`modify_group`, with the disassociate and associate steps skipped when the old and new resource-group lists are respectively empty). It reads `BAIProjectSettingModalFragment` on `GroupNode` for the initial values, so the caller spreads that fragment on the project nodes in its list query, and it runs its own `BAIProjectSettingModalQuery` for the vfolder host permission list — fetched from the network only while the modal is open, and served from the store otherwise. The resource-slot fields are generated from `useBAIResourceSlots`, so it needs the resource-slot provider above it. `title` and `loading` are Omitted from BAIModalProps because the modal owns both; everything else passes through to BAIModal, though `onOk` and `okButtonProps` are re-applied after the spread.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Spread `...BAIProjectSettingModalFragment` on the `GroupNode` in the list query, hold the row being edited in state, and reset that state to null before opening the modal for a create.',
      },
      {
        guidance: true,
        description:
          'Refetch the project list inside `onOk`; it fires only after the mutation reported success, and the modal shows its own success and error messages.',
      },
      {
        guidance: true,
        description:
          'Keep `open` controlled — the deferred copy of it drives both the skeleton loading state and whether the permission query hits the network.',
      },
      {
        guidance: false,
        description:
          'Pass `title` or `loading`; both are Omitted from the props type, since the modal picks the create/update title and derives loading from the deferred open state.',
      },
      {
        guidance: false,
        description:
          'Set `okButtonProps.loading` to track your own mutation — the modal overwrites that flag with the in-flight state of its create, modify and associate mutations.',
      },
    ],
  },
  props: [
    {
      name: 'projectFragment',
      type: 'BAIProjectSettingModalFragment$key | null',
      description:
        'Fragment reference for the project being edited, or null to create a new one. It seeds every initial value, including the JSON-encoded resource slots, allowed folder hosts and container registry, and its `row_id` becomes the `gid` of the modify mutation.',
      required: true,
    },
    {
      name: 'open',
      type: 'boolean',
      description:
        'Modal visibility. A deferred copy also gates the vfolder-permission query between `network-only` and `store-only`, and the modal shows its loading state while the two disagree.',
    },
    {
      name: 'onOk',
      type: '(e: React.MouseEvent<HTMLButtonElement>) => void',
      description:
        'Called after the create or modify mutation succeeded, never on a validation failure or a mutation error. Close the modal and refetch here.',
    },
    {
      name: 'okButtonProps',
      type: 'BAIModalActionButtonProps',
      description:
        'Confirm-button options. Passed through except for `loading`, which the modal overwrites with the combined in-flight state of its create, modify and associate mutations.',
    },
  ],
  examples: [
    {
      label: 'One modal for both create and edit',
      code: `<BAIProjectSettingModal
  open={openSettingModal}
  projectFragment={selectedProject}
  onOk={() => {
    updateFetchKey();
    toggleSettingModal();
    setSelectedProject(null);
  }}
  onCancel={() => {
    toggleSettingModal();
    setSelectedProject(null);
  }}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
