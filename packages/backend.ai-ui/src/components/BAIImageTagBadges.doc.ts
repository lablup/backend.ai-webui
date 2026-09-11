import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIImageTagBadges',
  displayName: 'BAI Image Tag Badges',
  category: 'Content',
  keywords: ['image', 'tag', 'badge', 'customized', 'kernel', 'environment'],
  usage: {
    description:
      "The tag chips of a container image (ADR 0004). It renders a list of `BAIImageTagFact`s, each as a `BAIDoubleTag` when the tag's alias still reads as a `key` + `value` pair, and as a single `Badge` when the metadata replaced it with one humanized label. Customized-image tags are tinted cyan, everything else blue. It renders only the chips, so the surrounding row owns the icon, the name and the dividers — `BAIImageMetaRow` is that row, and a select option that shows tags without an identity row uses this component directly. Build the facts with `imageNodeTagFacts` (an image node's own `tags` plus `labels`) or `imageTagFacts` (a tag string parsed by `getTags`), both exported from this module, so the double-tag decision is made in exactly one place.",
    bestPractices: [
      {
        guidance: true,
        description:
          'Compute the facts once per image and reuse them for both the chips and any text label derived from the same tags, as the session launcher environment select does.',
      },
      {
        guidance: true,
        description:
          'Pass `highlightKeyword` in search-filtered lists so the chips highlight like the rest of the row.',
      },
      {
        guidance: false,
        description:
          'Re-derive the double-tag vs single-badge decision at a call site; that rule lives in the fact builders.',
      },
    ],
  },
  props: [
    {
      name: 'facts',
      type: 'Array<BAIImageTagFact>',
      description:
        'Display facts for the image tags, from `imageNodeTagFacts` or `imageTagFacts`.',
    },
    {
      name: 'highlightKeyword',
      type: 'string',
      description: 'Highlights matching text in the chip labels.',
    },
  ],
  examples: [
    {
      label: 'Chips from an image node',
      code: `<BAIImageTagBadges
  facts={imageNodeTagFacts(image.tags, image.labels, tagAlias)}
/>`,
    },
    {
      label: 'Chips from a parsed tag string',
      code: `<BAIImageTagBadges
  facts={imageTagFacts(getTags(image.tag, image.labels), tagAlias)}
  highlightKeyword={versionSearch}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
