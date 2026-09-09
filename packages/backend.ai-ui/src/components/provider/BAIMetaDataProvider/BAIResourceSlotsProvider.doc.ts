import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIResourceSlotsProvider',
  displayName: 'BAI Resource Slots Provider',
  category: 'Utility',
  keywords: [
    'provider',
    'resource slots',
    'context',
    'accelerator',
    'device',
    'metadata',
    'merge',
  ],
  usage: {
    description:
      'Adds the server-reported resource slots to the metadata already published by `BAIMetaDataProvider`. It reads the static `device_metadata.json` catalog out of `BAIDeviceMetaDataContext` and deep-merges the `resourceSlots` prop over it, exposing both the raw prop and the merged map through `useBAIResourceSlots`. Because the slot request is authenticated, the host mounts this inside the signed-in subtree rather than at the app root — the login screen must not issue a signed request. It must be nested under `BAIMetaDataProvider`; outside it, `useBAIResourceSlots` reports only the static catalog instead of throwing.',
    bestPractices: [
      {
        guidance: true,
        description:
          "Mount it inside the routed, signed-in subtree — typically around the main layout's content — so anonymous routes never trigger the authenticated slot fetch.",
      },
      {
        guidance: true,
        description:
          'Nest it under `BAIMetaDataProvider`; the merge takes the static device metadata as its base, so without that ancestor the merged map is just the server slots.',
      },
      {
        guidance: true,
        description:
          'Scope the value to the resource group in view when slot availability differs per group, since consumers read the merged map as the single source of truth.',
      },
      {
        guidance: false,
        description:
          'Mutate the object passed as `resourceSlots` after mounting — the merge produces a fresh object per render and in-place edits will not reach consumers reliably.',
      },
    ],
  },
  props: [
    {
      name: 'resourceSlots',
      type: 'DeviceMetaData',
      description:
        'Slots reported by the server, keyed by slot name; the host fetches them. They are deep-merged over the static device metadata, so a slot present in both takes its server values while unspecified fields fall back to the static entry.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'The signed-in subtree that reads the merged slots. Outside it, `useBAIResourceSlots` falls back to the static catalog.',
    },
  ],
  examples: [
    {
      label: 'Inside the signed-in layout',
      code: `const { resourceSlotsInRG } = useResourceSlotsDetails();

return (
  <BAIResourceSlotsProvider resourceSlots={resourceSlotsInRG}>
    {children}
  </BAIResourceSlotsProvider>
);`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
