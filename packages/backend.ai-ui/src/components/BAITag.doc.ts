import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAITag',
  displayName: 'BAI Tag',
  category: 'Content',
  keywords: ['tag', 'chip', 'label', 'pill', 'badge', 'token', 'status tag'],
  usage: {
    description:
      'The small inline label used for statuses, types and short attributes in tables, cards and detail rows. It splits on `closable`: without it the tag renders an Astryx Badge whose variant is resolved from the antd-shaped `color` string through the repo-global lookup in `helper/astryxTagVariant`; with it the tag renders an Astryx Token instead, so the remove affordance comes from Token `onRemove`. The prop surface is antd `Tag`-shaped and frozen so existing call sites keep compiling — but Badge appearance is theme-owned, so the former transparent-outline look is not reproducible from a call site.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Pass one of the status or palette preset strings to `color` and let the shared lookup pick the variant, so the same state reads the same everywhere.',
      },
      {
        guidance: true,
        description:
          'Keep `children` a plain string on a closable tag — Astryx Token needs a string label, and a node label is pushed into trailing content with a hidden accessible name.',
      },
      {
        guidance: true,
        description:
          'Reach for BAITagList when several tags share a row and need overflow collapsing.',
      },
      {
        guidance: false,
        description:
          'Hand-paint a tag through `style` colours to invent a new state; add the state to the shared colour lookup instead.',
      },
      {
        guidance: false,
        description:
          'Expect `variant` to change anything — it is accepted for antd v6 source compatibility and ignored.',
      },
    ],
  },
  props: [
    {
      name: 'color',
      type: 'string',
      description:
        'antd `Tag` colour: a status preset (success, warning, error, processing), a palette preset (green, blue, …) or a runtime string. Mapped to an Astryx Badge variant, or to a Token colour when `closable` is set.',
    },
    {
      name: 'children',
      type: 'React.ReactNode',
      description:
        'Tag content. Rendered as the Badge label; on a closable tag only a string or number becomes the Token label, anything else moves to trailing content.',
    },
    {
      name: 'icon',
      type: 'React.ReactNode',
      description:
        'Leading glyph, usually a lucide-react icon sized `1em` so it tracks the tag text.',
    },
    {
      name: 'closable',
      type: 'boolean',
      description:
        'Switches the tag to an Astryx Token with a remove button. The button renders whether or not `onClose` is supplied, matching the antd behaviour.',
    },
    {
      name: 'onClose',
      type: '(e: React.MouseEvent<HTMLElement>) => void',
      description:
        'Called when the remove button of a closable tag is pressed. The tag does not remove itself; drop it from your own list.',
    },
    {
      name: 'onClick',
      type: '(e: React.MouseEvent<HTMLElement>) => void',
      description:
        'Makes the tag clickable — use it for filter chips. A tag that navigates should be a BAILink instead.',
    },
    {
      name: 'className',
      type: 'string',
      description: 'Class applied to the rendered Badge or Token.',
    },
    {
      name: 'style',
      type: 'React.CSSProperties',
      description:
        'Inline style on the Badge. It is not forwarded on the closable Token branch.',
    },
    {
      name: 'variant',
      type: 'string',
      description:
        "antd v6 `variant` ('filled' | 'outlined' | 'solid'). Accepted and ignored — Astryx Badge owns its appearance.",
    },
    {
      name: 'data-testid',
      type: 'string',
      description: 'Test hook forwarded to the rendered Badge or Token.',
    },
  ],
  examples: [
    {
      label: 'Status tag in a table cell',
      code: `<BAITag color={value === 'ACTIVE' ? 'success' : 'default'}>
  {value === 'ACTIVE' ? t('replicaStatus.Active') : t('replicaStatus.Inactive')}
</BAITag>`,
    },
    {
      label: 'With a leading icon',
      code: `<BAITag
  color="warning"
  icon={<LoaderCircle className="bai-icon-spin" size="1em" />}
>
  {t('deployment.Applying')}
</BAITag>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
