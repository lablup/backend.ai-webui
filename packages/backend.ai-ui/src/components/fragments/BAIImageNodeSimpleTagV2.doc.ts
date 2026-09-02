import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIImageNodeSimpleTagV2',
  displayName: 'BAI Image Node Simple Tag V2',
  category: 'Content',
  keywords: [
    'image',
    'container image',
    'kernel',
    'tag',
    'version',
    'architecture',
    'chip',
  ],
  usage: {
    description:
      'One-line identity of a container image — meta icon, aliased base name, base version and architecture, divider-separated, followed by the image tag chips. It reads `BAIImageNodeSimpleTagV2Fragment` on `ImageV2` (`identity.canonicalName`, `identity.namespace`, `identity.architecture`, `metadata.tags`, `metadata.labels`), so the caller spreads that fragment on the `ImageV2` node in its query and hands the node to `imageFrgmt`; a null reference renders nothing. It must sit under `BAIMetaDataProvider`, because the icon, the tag aliases and the base-name/base-version split all come from `useBAIImageMetaData`. This is the v2 counterpart of the host app’s `ImageNodeSimpleTag` and produces the same row the v1 session list shows.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Spread `...BAIImageNodeSimpleTagV2Fragment` on the `ImageV2` node in the parent query and pass that node straight through, rather than reshaping the image into a plain object.',
      },
      {
        guidance: true,
        description:
          'Mount it inside `BAIMetaDataProvider`; without that provider the tag aliases and the image icon fall back to unresolved raw values.',
      },
      {
        guidance: true,
        description:
          'Set `copyable={false}` in a dense table cell — BAISessionNodesV2 does exactly that, so a copy button is not repeated on every row.',
      },
      {
        guidance: false,
        description:
          'Feed it a v1 `ImageNode` reference; the fragment is declared on `ImageV2`, and only that schema exposes the `identity` / `metadata` shape it selects.',
      },
      {
        guidance: false,
        description:
          'Keep the tag chips in a narrow cell — `withoutTag` removes them together with their leading divider, leaving only name, version and architecture.',
      },
    ],
  },
  props: [
    {
      name: 'imageFrgmt',
      type: 'BAIImageNodeSimpleTagV2Fragment$key | null',
      description:
        'Fragment reference for the image to describe. The component renders null when the reference is null or the fragment resolves to nothing, so the surrounding cell stays empty instead of showing placeholders. A tag whose key contains `customized_` takes its value from the `ai.backend.customized-image.name` label and is tinted cyan; each tag renders as a two-part BAIDoubleTag only when the metadata provider has no alias for it, and as a single Badge carrying the alias otherwise.',
      required: true,
    },
    {
      name: 'withoutTag',
      type: 'boolean',
      description:
        'Drops the image tag chips and the divider before them, leaving the icon, base name, version and architecture.',
      default: 'false',
    },
    {
      name: 'copyable',
      type: 'boolean',
      description:
        'Appends a copy control that copies the full canonical name. It is a ghost icon button coloured by the theme, not a tinted link.',
      default: 'true',
    },
  ],
  examples: [
    {
      label: 'Full image identity with tags',
      code: '<BAIImageNodeSimpleTagV2 imageFrgmt={image} />',
    },
    {
      label: 'Compact form for a table cell',
      code: `<BAIImageNodeSimpleTagV2
  imageFrgmt={firstImage}
  copyable={false}
  withoutTag
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
