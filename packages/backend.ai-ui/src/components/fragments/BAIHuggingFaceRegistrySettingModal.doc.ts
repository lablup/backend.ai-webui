import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIHuggingFaceRegistrySettingModal',
  displayName: 'BAI Hugging Face Registry Setting Modal',
  category: 'Overlay',
  keywords: [
    'hugging face',
    'registry',
    'token',
    'credential',
    'settings',
    'modal',
    'dialog',
  ],
  usage: {
    description:
      "The settings dialog for a Hugging Face registry's access token, opened from the Reservoir (artifact registry) page. It reads `BAIHuggingFaceRegistrySettingModalFragment` on `HuggingFaceRegistry` (`id` and `token`), so the caller spreads that fragment on the registry node and passes the node as `huggingFaceRegistryFrgmt`. On OK it validates the form and commits `updateHuggingfaceRegistry` against the registry's local id, sending `null` when the field was cleared; success shows a message and calls `onOk`, an error shows the message and leaves the modal open. When the registry already has a token the field renders as a disabled masked input with an inline Edit link, and only becomes a real password input once that link is used. Every other prop is a BAIModal prop, and the spread sits last so a caller can override the title, `destroyOnHidden`, `confirmLoading` and `afterClose` the component sets.",
    bestPractices: [
      {
        guidance: true,
        description:
          'Spread the fragment on the registry node and pass that node — the mutation needs the `id` the fragment carries, and with no fragment reference the OK handler returns without committing anything.',
      },
      {
        guidance: true,
        description:
          'Gate the modal on `open` (or wrap it in `BAIUnmountAfterClose`) so the form values and the internal editing toggle are rebuilt from the fragment on each open.',
      },
      {
        guidance: true,
        description:
          'Handle `onCancel` as well as `onOk` — the component never closes itself, it only reports success through `onOk`.',
      },
      {
        guidance: false,
        description:
          "Pass `confirmLoading` yourself; the component drives it from the update mutation's in-flight state, and an override desynchronizes the OK button from the request.",
      },
      {
        guidance: false,
        description:
          'Read the masked value as the real token — the disabled input shows fixed bullet characters, and the stored token is replaced only by what the user types after choosing Edit.',
      },
    ],
  },
  props: [
    {
      name: 'huggingFaceRegistryFrgmt',
      type: 'BAIHuggingFaceRegistrySettingModalFragmentKey | null',
      description:
        'Fragment reference for the registry being configured. Its `token` decides whether the field starts masked behind an Edit link or as an empty password input, and its `id` is the mutation target; when it is null or undefined the OK handler commits nothing.',
    },
    {
      name: 'onOk',
      type: '(e: React.MouseEvent<HTMLButtonElement>) => void',
      description:
        'Called with the OK click event only after the update mutation completes successfully, so this is where the modal gets closed. It does not fire on a validation failure or a mutation error.',
    },
  ],
  examples: [
    {
      label: 'Editing the registry token from the Reservoir page',
      code: `<BAIHuggingFaceRegistrySettingModal
  open={openHuggingFaceSettingModal}
  huggingFaceRegistryFrgmt={huggingfaceRegistries?.edges?.[0]?.node ?? null}
  onOk={() => toggleHuggingFaceSettingModal()}
  onCancel={() => toggleHuggingFaceSettingModal()}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
