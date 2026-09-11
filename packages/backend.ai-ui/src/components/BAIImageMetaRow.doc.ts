import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIImageMetaRow',
  displayName: 'BAI Image Meta Row',
  category: 'Content',
  keywords: [
    'image',
    'container',
    'kernel',
    'environment',
    'tag',
    'architecture',
    'registry',
    'path',
  ],
  usage: {
    description:
      'The one way this project shows a container image (ADR 0004). The `full` and `compact` variants render the meta icon, the aliased base image name, the base version and the architecture separated by `BAIImageMetaDivider`, followed by a copy control for the full reference; `full` also renders the tag chips through `BAIImageTagBadges`. The `path` variant renders the same reference as a single line of monospace text with a truncation tooltip and the same copy control, for table columns that show the machine-readable path. It takes plain strings rather than a Relay fragment, so the v1 `ImageNode` surfaces, the v2 `ImageV2` surfaces and the session launcher form values all render through it; every part the caller does not pass is derived from `fullName`. Icon resolution and tag aliasing come from `useBAIImageMetaData`, so it must sit under `BAIMetaDataProvider`.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Pass the full reference (`registry/namespace:tag@architecture`) as `fullName` — the icon lookup, the derived parts and the copy value all read it.',
      },
      {
        guidance: true,
        description:
          'Build `tags` with `imageNodeTagFacts` (extended image info) or `imageTagFacts` (parsed tag string) so every surface decides double-tag vs single badge the same way.',
      },
      {
        guidance: true,
        description:
          'Use `compact` in dense table cells and `full` on detail and review surfaces; pass `copyable={false}` where a row already has its own copy affordance.',
      },
      {
        guidance: false,
        description:
          'Hand-assemble the icon, name, version and architecture from `BAIImageMetaIcon` and `Text` — that is the divergence this component exists to end.',
      },
      {
        guidance: false,
        description:
          'Show a reader who the image is with `path`. It prints the bare reference, with no icon and no chips, for copying and pasting; `full` and `compact` are the forms a person reads.',
      },
    ],
  },
  props: [
    {
      name: 'fullName',
      type: 'string | null | undefined',
      description:
        'Full image reference, e.g. `cr.backend.ai/stable/python-tensorflow:2.15-py39-cuda12.4-ubuntu20.04@x86_64`.',
    },
    {
      name: 'variant',
      type: "'full' | 'compact' | 'path'",
      description:
        '`full` shows the tag chips, `compact` drops them, `path` shows the raw reference as monospace text.',
      default: "'full'",
    },
    {
      name: 'name',
      type: 'string | null',
      description:
        'Base image name, rendered verbatim — alias it yourself. Empty or absent falls back to `tagAlias(getBaseImage(fullName))`, which is what a server that does not send `base_image_name` produces.',
    },
    {
      name: 'version',
      type: 'string | null',
      description:
        'Base version. Empty or absent falls back to `getBaseVersion(fullName)`; pass the server-provided `version` where one exists.',
    },
    {
      name: 'architecture',
      type: 'string | null',
      description:
        'Architecture. Empty or absent falls back to the part of `fullName` after `@`.',
    },
    {
      name: 'tags',
      type: 'Array<BAIImageTagFact>',
      description:
        'Tag chips for the `full` variant, from `imageNodeTagFacts` or `imageTagFacts`.',
    },
    {
      name: 'copyable',
      type: 'boolean',
      description: 'Renders the copy control for the full reference.',
      default: 'true',
    },
    {
      name: 'copyLabel',
      type: 'string',
      description:
        "Tooltip on the copy control. Defaults to BUI's generic Copy label.",
    },
    {
      name: 'highlightKeyword',
      type: 'string',
      description:
        'Highlights matching text in every part of the row, for search-filtered lists.',
    },
  ],
  examples: [
    {
      label: 'Detail surface — full row',
      code: `<BAIImageMetaRow
  fullName={fullName}
  name={tagAlias(image.base_image_name ?? '')}
  version={image.version}
  architecture={image.architecture}
  tags={imageNodeTagFacts(image.tags, image.labels, tagAlias)}
/>`,
    },
    {
      label: 'Table cell — compact row, no copy control',
      code: '<BAIImageMetaRow fullName={fullName} variant="compact" copyable={false} />',
    },
    {
      label: 'Full image path column',
      code: `<BAIImageMetaRow
  fullName={getImageFullName(row)}
  variant="path"
  highlightKeyword={imageSearch}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
