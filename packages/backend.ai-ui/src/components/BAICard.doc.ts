import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAICard',
  displayName: 'BAI Card',
  category: 'Container',
  keywords: ['card', 'panel', 'surface', 'section', 'container', 'tabs'],
  usage: {
    description:
      'The card container for every card surface in Backend.AI. It composes Astryx Card with a title row, an extra action slot, an optional full-bleed tab strip, status border tints, a loading skeleton, and a footer action row — none of which Astryx Card, a bare padded surface, provides on its own. Reaching for Astryx Card directly loses those defaults and produces a header that does not match the rest of the app. Remaining DOM props (id, data-*, style, event handlers) pass through to the underlying Astryx Card element.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Put card-scoped actions — refresh, the primary create button, edit configuration, export — in extra, grouped in a BAIFlex with the primary button rightmost.',
      },
      {
        guidance: true,
        description:
          'Keep content-scoped controls (filters, search, sort) inside the body, and place a Suspense boundary inside the card so the title stays visible while data loads.',
      },
      {
        guidance: true,
        description:
          'Use status to signal content state; it colors the border and switches the extraButtonTitle button to a matching icon.',
      },
      {
        guidance: false,
        description:
          'Pass styles={{ body: { paddingTop: 0 } }} — Astryx Card has one padding step for the whole surface, so the prop is accepted and ignored. Use padding or size="small" for a per-card inset.',
      },
      {
        guidance: false,
        description:
          'Add marginTop to the first child for breathing room; the flush-to-header look is intentional, and spacing belongs in the parent layout.',
      },
    ],
  },
  props: [
    {
      name: 'title',
      type: 'ReactNode',
      description:
        'Header title. A string renders as an Astryx Heading level 5, so it joins the document outline; a node renders verbatim.',
    },
    {
      name: 'extra',
      type: 'ReactNode',
      description:
        'Content for the right side of the title row. Takes precedence over extraButtonTitle.',
    },
    {
      name: 'extraButtonTitle',
      type: 'string | ReactNode',
      description:
        'Renders a link-style BAIButton in the header when extra is not given. With status="error" or "warning" it gains the matching icon.',
    },
    {
      name: 'onClickExtraButton',
      type: '() => void',
      description: 'Click handler for the button produced by extraButtonTitle.',
    },
    {
      name: 'status',
      type: "'success' | 'error' | 'warning' | 'default'",
      description:
        'Content state. Tints the card border and, for error, adds the bai-card-error class that product tours anchor to.',
      default: "'default'",
    },
    {
      name: 'showDivider',
      type: 'boolean',
      description:
        'Draws a Divider under the header. Nothing is drawn by default; tabList supplies its own rule.',
    },
    {
      name: 'size',
      type: "'default' | 'small'",
      description:
        'Compact step. "small" drops the Astryx padding from 6 (24px) to 3 (12px).',
    },
    {
      name: 'padding',
      type: "React.ComponentProps<typeof Card>['padding']",
      description:
        'Astryx Card padding step, overriding the size-derived value. The full-bleed tab strip follows it.',
      default: '6 (3 when size="small")',
    },
    {
      name: 'width',
      type: "React.ComponentProps<typeof Card>['width']",
      description: 'Astryx Card width passthrough.',
    },
    {
      name: 'type',
      type: "'inner'",
      description:
        'Nested-card treatment; maps to the Astryx Card muted variant for a tinted surface.',
    },
    {
      name: 'bordered',
      type: 'boolean',
      description:
        'Accepted for source compatibility with the antd-shaped call sites. The card always renders the default Astryx variant.',
    },
    {
      name: 'variant',
      type: "'outlined' | 'borderless'",
      description:
        'The antd v6 spelling of bordered, accepted for the same reason and with the same effect.',
    },
    {
      name: 'hoverable',
      type: 'boolean',
      description: 'Adds a hover shadow from BAICard.css.',
    },
    {
      name: 'loading',
      type: 'boolean',
      description:
        'Replaces the body with three Skeleton bars while keeping the header and tabs visible.',
    },
    {
      name: 'cover',
      type: 'ReactNode',
      description:
        'Content rendered above the title row, inside the card padding.',
    },
    {
      name: 'actions',
      type: 'Array<ReactNode>',
      description:
        'Footer actions, rendered under a Divider and distributed evenly across the card.',
    },
    {
      name: 'tabList',
      type: 'Array<BAICardTabItem>',
      description:
        'Tab descriptors ({ key, label | tab, endContent }) rendered as a BAITabList that full-bleeds to the card borders. A rich tab label must be split: keep label a string and pass the trailing node as endContent.',
    },
    {
      name: 'activeTabKey',
      type: 'string',
      description: 'Controlled active tab key.',
    },
    {
      name: 'defaultActiveTabKey',
      type: 'string',
      description:
        'Active tab used when activeTabKey is absent. Falls back to the first tab.',
    },
    {
      name: 'onTabChange',
      type: '(key: string) => void',
      description: 'Fired with the key of the tab the user selected.',
    },
    {
      name: 'tabBarExtraContent',
      type: 'ReactNode',
      description:
        'Trailing slot rendered inside the tab bar, to the right of the tabs.',
    },
    {
      name: 'styles',
      type: 'BAICardSlotStyles',
      description:
        'The antd slot-style map (header, body, cover, actions, extra, title). Accepted and ignored — use padding or size instead.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Card body content.',
    },
    {
      name: 'ref',
      type: 'Ref<HTMLDivElement>',
      description: 'Ref to the card container element.',
    },
  ],
  examples: [
    {
      label: 'Card with header actions',
      code: `<BAICard
  title={t('modelService.AutoScalingRules')}
  extra={
    <BAIFlex gap="xs" align="center">
      <BAIFetchKeyButton loading={isPending} value="" onChange={refetch} />
      <BAIButton type="primary" icon={<PlusIcon />} onClick={openCreate}>
        {t('button.Add')}
      </BAIButton>
    </BAIFlex>
  }
>
  <AutoScalingRuleTable />
</BAICard>`,
    },
    {
      label: 'Tabbed card',
      code: `<BAICard
  activeTabKey={activeTab}
  onTabChange={setActiveTab}
  tabList={[
    { key: 'general', label: t('session.General') },
    { key: 'logs', label: t('session.Logs') },
  ]}
>
  <Suspense fallback={<BAISkeleton />}>
    <TabContent tab={activeTab} />
  </Suspense>
</BAICard>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
