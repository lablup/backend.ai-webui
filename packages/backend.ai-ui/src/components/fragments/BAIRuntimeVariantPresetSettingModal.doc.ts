import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIRuntimeVariantPresetSettingModal',
  displayName: 'BAI Runtime Variant Preset Setting Modal',
  category: 'Overlay',
  keywords: [
    'runtime variant',
    'preset',
    'modal',
    'dialog',
    'form',
    'create',
    'edit',
    'admin',
  ],
  usage: {
    description:
      "The create-and-edit dialog behind the admin Runtime Parameters page. One component serves both modes: passing `presetFrgmt` — a node with `BAIRuntimeVariantPresetSettingModalFragment` spread on it — puts the modal in edit mode (title, OK label, initial values and the update mutation all follow from it), and omitting it creates a new preset. The form covers runtime variant, name, description, category and display name, preset target and value type, key, default value, a UI-option builder (slider, number input, select choices, checkbox, text input) whose sub-fields are swapped when the UI type changes, required, and rank; OK validates, builds the create or update input and commits, then reports through `onRequestClose(true)`. Cancel reports `onRequestClose(false)`. Category, display name, UI options and required are gated on the connected BAI client's feature support, so a connected client must be above the modal and older servers see a shorter form. The runtime variant select suspends while its options load and cannot be changed in edit mode. Remaining props pass through to BAIModal, but the spread sits first, so the title, `onOk`, `onCancel`, `destroyOnHidden`, `confirmLoading` and `okText` set by the component win over anything the caller passes for them.",
    bestPractices: [
      {
        guidance: true,
        description:
          'Mount it inside `BAIUnmountAfterClose` and key the `open` prop on the create flag or the preset being edited, so each open rebuilds the form from the current fragment instead of reusing the previous session’s values.',
      },
      {
        guidance: true,
        description:
          'Refetch the surrounding list only when `onRequestClose(true)` follows a create — an update returns every field, so Relay merges it into the store by id and the list reflects it without a round trip.',
      },
      {
        guidance: true,
        description:
          'Collect the categories already used by other presets and pass them as `categoryOptions`, since that list is the only hint the free-text category field gives the user.',
      },
      {
        guidance: false,
        description:
          'Rely on `onOk` or `onCancel` — both are removed from the props type; the single close channel is `onRequestClose`, whose boolean argument distinguishes a committed change from a dismissal.',
      },
      {
        guidance: false,
        description:
          'Assume the category, display name, UI-option and required fields render — each is behind a server capability check and is simply absent, along with its mutation input field, when the connected client does not advertise support.',
      },
    ],
  },
  props: [
    {
      name: 'presetFrgmt',
      type: 'BAIRuntimeVariantPresetSettingModalFragment$key | null',
      description:
        'Fragment reference for the preset being edited. Present, it seeds the initial values, switches the modal to the update mutation and locks the runtime variant select; null or undefined puts the modal in create mode.',
    },
    {
      name: 'onRequestClose',
      type: '(success?: boolean) => void',
      description:
        'The only close channel. Called with `true` after a create or update succeeds and with `false` on cancel; it is not called when a mutation returns an error, so the modal stays open and the message surfaces the failure.',
      required: true,
    },
    {
      name: 'categoryOptions',
      type: 'ReadonlyArray<string>',
      description:
        'Category values already used by other presets. They are joined into the category field’s placeholder as a hint — the field remains free text so a new category can be typed — and an empty or omitted list falls back to the generic placeholder.',
    },
  ],
  examples: [
    {
      label: 'Create and edit from the admin preset list',
      code: `<BAIUnmountAfterClose>
  <BAIRuntimeVariantPresetSettingModal
    open={isCreating || !!editingPreset}
    presetFrgmt={editingPreset}
    categoryOptions={existingCategories}
    onRequestClose={(success) => {
      setIsCreating(false);
      setEditingPreset(null);
      if (success && editingPreset === null) {
        onReload(queryRef.variables, { fetchPolicy: 'network-only' });
      }
    }}
  />
</BAIUnmountAfterClose>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
