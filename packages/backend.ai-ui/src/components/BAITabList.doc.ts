import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAITabList',
  displayName: 'BAI Tab List',
  category: 'Navigation',
  keywords: [
    'tabs',
    'tab bar',
    'tablist',
    'card tabs',
    'segmented navigation',
    'nav',
  ],
  usage: {
    description:
      'The tab strip for the app. It renders Astryx `TabList` with Astryx `Tab` children and adds the two tab looks Backend.AI uses side by side: `type="line"` is Astryx\'s underlined strip, and `type="card"` is the boxed, gutter-separated strip on an accent rail that the session, data and project list pages have always had. It also bakes in two composition rules the app kept getting wrong by hand — the nav stays block-level so the `hasDivider` rail spans the whole bar instead of stopping at the last tab, and `tabBarExtraContent` renders inside the nav pushed over with an auto inline margin, so the rail still runs underneath it. Everything else on Astryx `TabListProps` — `value`, `onChange`, `id` — passes straight through.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Render Astryx `Tab` elements as children and drive selection with the inherited `value` / `onChange` pair; the list is controlled.',
      },
      {
        guidance: true,
        description:
          'Put trailing controls in `tabBarExtraContent` rather than in a sibling row, so the rail keeps spanning the full bar.',
      },
      {
        guidance: true,
        description:
          'Let `size` default — the card look picks the larger step on its own to match the height the boxed tabs need.',
      },
      {
        guidance: false,
        description:
          'Place the tab list inside a flex row; the strip has no width of its own and will hug its tabs, cutting the rail short.',
      },
      {
        guidance: false,
        description:
          'Restyle the card look with local CSS — the boxed paint lives in BAITabList.css entirely in design tokens, and a local override drifts in dark mode.',
      },
    ],
  },
  props: [
    {
      name: 'type',
      type: "'line' | 'card'",
      description:
        'Tab appearance. `line` passes Astryx through untouched; `card` adds the boxed, rail-mounted look from BAITabList.css.',
      default: "'line'",
    },
    {
      name: 'tabBarExtraContent',
      type: 'ReactNode',
      description:
        "Trailing slot on the tab bar, rendered inside the nav so the divider rail continues underneath it. antd's `tabBarExtraContent`.",
    },
    {
      name: 'hasDivider',
      type: 'boolean',
      description:
        'Whether the rail is drawn under the strip. Inherited from Astryx TabList but defaulted on here, since every app surface wants it.',
      default: 'true',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description:
        'Tab height step. Left unset it resolves to `lg` for the card look and `md` for the line look.',
    },
    {
      name: 'className',
      type: 'string',
      description:
        'Extra class names, merged after the card-look class rather than replacing it.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'The Astryx `Tab` elements. Rendered before `tabBarExtraContent` inside the same nav.',
    },
  ],
  examples: [
    {
      label: 'Card tabs with a trailing action',
      code: `<BAITabList
  type="card"
  value={currentKey}
  onChange={setCurrentKey}
  tabBarExtraContent={<BAIFetchKeyButton loading={isPending} onChange={updateFetchKey} />}
>
  {items.map((item) => (
    <Tab key={item.key} value={item.key} label={item.label} />
  ))}
</BAITabList>`,
    },
    {
      label: 'Line tabs',
      code: `<BAITabList value={activeTab} onChange={setActiveTab}>
  <Tab value="overview" label={t('session.Overview')} />
  <Tab value="logs" label={t('session.Logs')} />
</BAITabList>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
