import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIBoardItemTitle',
  displayName: 'BAI Board Item Title',
  category: 'Layout',
  keywords: [
    'section header',
    'panel header',
    'board item',
    'dashboard',
    'title bar',
    'sticky header',
    'card title',
  ],
  usage: {
    description:
      'The header row of a dashboard board item: a title on the leading edge, an optional help tooltip beside it, and an action slot pushed to the trailing edge. It is a `BAIFlex` row that sticks to the top of its scroll container and paints the container background behind itself, so a long panel body scrolls under the title instead of past it. A string `title` is rendered as a level-5 heading; anything else is rendered as given, which is how panels put a heading next to an inline control such as a resource-group selector. Use it for the panel sections that make up a dashboard board — `BAICard` remains the container for standalone cards.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Pass a plain string as `title` and let the component pick the heading level, so every panel on the board shares one type size.',
      },
      {
        guidance: true,
        description:
          'Put the panel refresh button and any panel-scoped control in `extra`; the slot already right-aligns and wraps them.',
      },
      {
        guidance: true,
        description:
          'Use `tooltip` for the "what is this panel" explanation instead of a paragraph under the header — it renders as a question-mark icon beside the title.',
      },
      {
        guidance: false,
        description:
          'Overriding `position` or `top` through `style`; the sticky behaviour is the reason the component exists, and the z-index is tuned to sit above table fixed columns and below the app header.',
      },
      {
        guidance: false,
        description:
          'Building a parallel header row above a panel when this component already renders one.',
      },
    ],
  },
  props: [
    {
      name: 'title',
      type: 'React.ReactNode | string',
      description:
        'Panel title. A string renders as a level-5 heading; a node is rendered as given, for a heading paired with an inline control.',
      required: true,
    },
    {
      name: 'tooltip',
      type: 'React.ReactNode',
      description:
        'Explanatory content shown from a question-mark icon next to the title. Nothing is rendered when it is omitted.',
    },
    {
      name: 'extra',
      type: 'React.ReactNode',
      description:
        'Trailing action slot, right-aligned and wrapping. Holds refresh buttons, view toggles, and other panel-scoped controls.',
    },
    {
      name: 'style',
      type: 'React.CSSProperties',
      description:
        'Inline style merged over the header row defaults, applied after them — mainly for padding adjustments in a panel with its own rhythm.',
    },
  ],
  examples: [
    {
      label: 'Panel header with a refresh button',
      code: `<BAIBoardItemTitle
  title={title}
  extra={
    <BAIFlex align="center" gap="xxs">
      <BAIFetchKeyButton
        size="small"
        loading={isPendingRefetch}
        value=""
        onChange={updateLocalFetchKey}
      />
    </BAIFlex>
  }
/>`,
    },
    {
      label: 'With a help tooltip',
      code: `<BAIBoardItemTitle
  title={t('agentStats.AgentStats')}
  tooltip={t('agentStats.AgentStatsDescription')}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
