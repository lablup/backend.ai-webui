import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAISkeleton',
  displayName: 'BAI Skeleton',
  category: 'Feedback & Status',
  keywords: [
    'skeleton',
    'placeholder',
    'loading',
    'shimmer',
    'suspense',
    'fallback',
  ],
  usage: {
    description:
      'Loading placeholder composed from Astryx Skeleton, which draws a single shimmering box. It adds the multi-part shapes antd offered: a paragraph of title bar plus lines, an avatar row, and control-height input and button boxes. Boxes in one instance take successive shimmer indices so the animation reads as a single wave rather than several synchronised pulses; startIndex extends that wave across adjacent instances. Remaining props pass through to Astryx Skeleton.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Place it as the Suspense fallback inside a BAICard body so the card header stays visible while the data loads.',
      },
      {
        guidance: true,
        description:
          'Match the shape to what is loading — variant="input" or "button" for a single control, and rows tuned to the real line count for a text block.',
      },
      {
        guidance: false,
        description:
          'Pass an active prop; Astryx skeletons animate unconditionally and there is no way to freeze them.',
      },
      {
        guidance: false,
        description:
          'Wrap a whole card or page in one paragraph skeleton when only one region is pending — the layout shifts when the real content replaces it.',
      },
    ],
  },
  props: [
    {
      name: 'variant',
      type: "'block' | 'paragraph' | 'input' | 'button'",
      description:
        'Which shape to draw. paragraph builds a title bar plus rows lines, block is a bare box you size yourself, input fills the container at control height, and button uses a control height with a per-size minimum width.',
      default: "'paragraph'",
    },
    {
      name: 'rows',
      type: 'number',
      description:
        'Number of paragraph lines. The last line is shortened whenever a title is present or more than one line is drawn.',
      default: '3',
    },
    {
      name: 'hasTitle',
      type: 'boolean',
      description:
        'Draws a title bar above the paragraph lines. Ignored by the block, input and button variants.',
      default: 'true',
    },
    {
      name: 'hasAvatar',
      type: 'boolean',
      description:
        'Puts a round avatar box to the left of the lines and narrows the title bar so it fits beside it.',
      default: 'false',
    },
    {
      name: 'size',
      type: "'small' | 'default' | 'large'",
      description:
        'Height of the input and button variants, taken from the Astryx element-size tokens so the placeholder matches the control it stands in for. Also sets the button variant minimum width.',
      default: "'default'",
    },
    {
      name: 'height',
      type: "SkeletonProps['height']",
      description:
        'Explicit box height for the block, input and button variants, overriding the size-derived height. Paragraph lines keep their fixed line height.',
    },
    {
      name: 'width',
      type: "SkeletonProps['width']",
      description:
        'Box width. It reaches the block variant directly and, for a paragraph without an avatar, sets the title bar width.',
    },
    {
      name: 'radius',
      type: "SkeletonProps['radius']",
      description:
        'Corner radius step applied to every box except the avatar, which is always fully rounded.',
      default: '1',
    },
    {
      name: 'startIndex',
      type: 'number',
      description:
        'Shimmer offset of the first box; later boxes count up from it. Give a following skeleton the index after the previous one ended so the two share one continuous wave.',
      default: '0',
    },
  ],
  examples: [
    {
      label: 'Suspense fallback in a card body',
      code: "<BAICard title={t('section.Title')}>\n  <Suspense fallback={<BAISkeleton rows={4} />}>\n    <DataDrivenContent />\n  </Suspense>\n</BAICard>",
    },
    {
      label: 'Standing in for a control',
      code: '<Suspense fallback={<BAISkeleton variant="input" size="small" />}>\n  <ImageEnvironmentSelect />\n</Suspense>',
    },
  ],
} satisfies ComponentDoc;

export default docs;
