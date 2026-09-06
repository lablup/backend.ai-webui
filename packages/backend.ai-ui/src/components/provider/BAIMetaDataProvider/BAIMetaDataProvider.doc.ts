import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIMetaDataProvider',
  displayName: 'BAI Meta Data Provider',
  category: 'Utility',
  keywords: [
    'provider',
    'metadata',
    'context',
    'image metadata',
    'device metadata',
    'icons',
    'resource slots',
  ],
  usage: {
    description:
      "Publishes the host app's static metadata — `device_metadata.json`, `image_metadata.json` and the icon base path — into three React contexts that BUI reads through `useBAIResourceSlots`, `useBAIImageMetaData` and `useBAIIconPath`. The package never fetches or bundles these files itself, so image names stay unhumanized and icons resolve to `undefined` until a host supplies them. None of this data requires authentication, which is why it is mounted at the app root, above the login screen. Server-reported resource slots are the separate authenticated layer added by `BAIResourceSlotsProvider`, which must be nested inside this one.",
    bestPractices: [
      {
        guidance: true,
        description:
          'Mount it once at the app root, inside `BAIConfigProvider` and above the router, so pre-login screens get image icons and tag aliases too.',
      },
      {
        guidance: true,
        description:
          'Pass `imagePath` whenever any icon should render — `useBAIIconPath` returns `undefined` for every filename while it is unset, and the fallback `default.png` icon is unreachable as well.',
      },
      {
        guidance: true,
        description:
          "Feed the props from the host's own metadata fetch (a query hook is typical) and let them arrive as `undefined` on first render; every consuming hook is null-safe and falls back to identity aliasing.",
      },
      {
        guidance: false,
        description:
          'Pass server-reported slots here — `deviceMetaData` is the static catalog; the authenticated per-resource-group slots belong to `BAIResourceSlotsProvider`.',
      },
    ],
  },
  props: [
    {
      name: 'deviceMetaData',
      type: 'DeviceMetaData',
      description:
        "Static resource-slot catalog from `device_metadata.json`, keyed by slot name. It is the base that `BAIResourceSlotsProvider` merges the server's slots on top of, and the sole value `useBAIResourceSlots` reports when that provider is absent.",
    },
    {
      name: 'imageMetaData',
      type: 'ImageMetaData',
      description:
        'Contents of `image_metadata.json` — `imageInfo`, `tagAlias`, `tagReplace` and the optional `groupSortKeyMap`. Left unset, `useBAIImageMetaData` still works but aliases every tag and name to itself.',
    },
    {
      name: 'imagePath',
      type: 'string',
      description:
        'Base directory the host serves icon files from, e.g. `resources/icons`. `useBAIIconPath` joins a filename onto it after trimming a trailing slash, and returns `undefined` when this is not provided.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'The subtree that reads the metadata contexts. Components outside it fall back to the null-safe defaults.',
    },
  ],
  examples: [
    {
      label: 'App-root metadata',
      code: `const { data: deviceMetaData } = useDeviceMetaData();
const { data: imageMetaData } = useImageMetaData();

return (
  <BAIMetaDataProvider
    deviceMetaData={deviceMetaData}
    imageMetaData={imageMetaData}
    imagePath="resources/icons"
  >
    {children}
  </BAIMetaDataProvider>
);`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
