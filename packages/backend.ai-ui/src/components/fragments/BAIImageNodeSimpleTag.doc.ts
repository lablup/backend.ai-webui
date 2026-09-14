import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIImageNodeSimpleTag',
  displayName: 'BAI Image Node Simple Tag',
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
      'The v1 `ImageNode` adapter over `BAIImageMetaRow`: it reads `BAIImageNodeSimpleTagFragment` on `ImageNode` (`registry`, `namespace`, `tag`, `architecture`, `base_image_name`, `version`, `tags`, `labels`) and hands the row its plain facts, so the caller spreads that fragment on the `ImageNode` in its query and passes the node to `imageFrgmt`; a null reference renders nothing. The row itself is the project-wide image representation (ADR 0004) — meta icon, aliased base name, base version and architecture, divider-separated, followed by the image tag chips and a copy control. It must sit under `BAIMetaDataProvider`, because the icon, the tag aliases and the base-name/base-version split all come from `useBAIImageMetaData`. The v2 counterpart is `BAIImageNodeSimpleTagV2`, and both render the identical row.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Spread `...BAIImageNodeSimpleTagFragment` on the `ImageNode` in the parent query and pass that node straight through, rather than reshaping the image into a plain object.',
      },
      {
        guidance: true,
        description:
          'Mount it inside `BAIMetaDataProvider`; without that provider the tag aliases and the image icon fall back to unresolved raw values.',
      },
      {
        guidance: true,
        description:
          'Set `copyable={false}` in a dense table cell — the session list does exactly that, so a copy button is not repeated on every row.',
      },
      {
        guidance: false,
        description:
          'Feed it a v2 `ImageV2` reference; the fragment is declared on `ImageNode`, and only that schema exposes the flat `registry` / `namespace` / `tag` shape it selects.',
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
      type: 'BAIImageNodeSimpleTagFragment$key | null',
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
        'Appends a copy control that copies the full image reference. It is a ghost icon button coloured by the theme, not a tinted link.',
      default: 'true',
    },
  ],
  examples: [
    {
      label: 'Full image identity with tags',
      code: '<BAIImageNodeSimpleTag imageFrgmt={image} />',
    },
    {
      label: 'Compact form for a table cell',
      code: `<BAIImageNodeSimpleTag
  imageFrgmt={firstImage}
  copyable={false}
  withoutTag
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
