import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAITabCountBadge',
  displayName: 'BAI Tab Count Badge',
  category: 'Feedback & Status',
  keywords: ['tab count', 'count pill', 'tab badge', 'counter', 'chip'],
  usage: {
    description:
      "The count pill that sits next to a tab label, rendered into Astryx Tab's `endContent` slot rather than baked into the label so the tab keeps a correct accessible name. It wraps Astryx Badge and adds the one thing no Badge variant can express: the selected tab's pill is painted in the ACTIVE MENU GROUP's primary through `--color-accent`, which `AutoAdminPrimaryColorProvider` already resolves per scope — so the same component is deliberately orange under the user menu and blue under admin. The variant enum has no ambient-accent member (`info` is pinned to a fixed blue by this theme), which is why the colour comes from an unlayered class in BAITabCountBadge.css. Nothing renders when `count` is nullish, or when it is 0 without `showZero`. Every other Badge prop passes through except `label`, `icon` and `variant`, which this component owns.",
    bestPractices: [
      {
        guidance: true,
        description:
          'Pass it through the tab descriptor\'s `endContent`, keeping `label` a plain string — that is what keeps the tab\'s accessible name from reading "All2".',
      },
      {
        guidance: true,
        description:
          'Drive `selected` from the same state that drives the active tab, so the accent follows the selection instead of being hardcoded per page.',
      },
      {
        guidance: false,
        description:
          'Expect the selected colour to be the same on every page — it resolves from the surrounding menu scope, so user and admin pages differ on purpose.',
      },
      {
        guidance: false,
        description:
          'Reach for `variant` to recolour it; the prop is omitted because the accent is owned here.',
      },
    ],
  },
  props: [
    {
      name: 'count',
      type: 'number | null',
      description:
        'The count to show. Nullish renders nothing, and so does 0 unless showZero is set.',
    },
    {
      name: 'selected',
      type: 'boolean',
      description:
        "Whether the owning tab is the selected one. Switches the pill to the active menu group's primary.",
      default: 'false',
    },
    {
      name: 'showZero',
      type: 'boolean',
      description: 'Keeps the pill visible when count is 0.',
      default: 'false',
    },
    {
      name: 'className',
      type: 'string',
      description:
        "Extra class on the badge, appended to the component's own bai-tab-count-badge classes rather than replacing them.",
    },
  ],
  examples: [
    {
      label: 'Inside a tab descriptor',
      code: `{
  key,
  // Astryx Tab takes a STRING label plus a native endContent slot.
  label,
  endContent: (
    <BAITabCountBadge
      count={folderCounts[key]?.count}
      selected={queryParams.statusCategory === key}
    />
  ),
}`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
