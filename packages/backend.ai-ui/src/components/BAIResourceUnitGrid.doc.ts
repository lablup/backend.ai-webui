import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIResourceUnitGrid',
  displayName: 'BAI Resource Unit Grid',
  category: 'Data Visualization',
  keywords: [
    'unit grid',
    'grid',
    'heatmap',
    'waffle chart',
    'allocation',
    'utilization',
    'capacity',
    'squares',
  ],
  usage: {
    description:
      'A unit-square grid: many groups of quantized cells packed onto one shared lattice, each group merged into a tinted rounded plate, with a hoverable popover frame, an optional palette picker and a legend row. It is domain-agnostic — callers hand it groups whose cells already carry resolved CSS colours, plus the legend entries and the popover body — so the same component draws session resource allocation, kernel occupancy, or any other "N units out of a pool" picture. Cell colours may be `var()` or `color-mix()` strings: the component resolves them against its own live cascade to pick the ink with the better WCAG contrast for the group initial. Lattice width is measured from the wrapper unless `columns` fixes it; the rest of the props type is `React.HTMLAttributes<HTMLDivElement>` minus `children`, so `aria-label`, `className` and the usual DOM attributes pass through to the wrapper.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Give the wrapper an `aria-label` that says what the grid shows and how many groups it holds — the cells themselves are decorative SVG.',
      },
      {
        guidance: true,
        description:
          'Resolve every fill to a theme token or a `color-mix()` over one, so the grid follows light and dark themes and the ink contrast stays computable.',
      },
      {
        guidance: true,
        description:
          'Pass `columns` in tests and in fixed-width layouts; without a real layout the measured width is zero and the grid renders nothing.',
      },
      {
        guidance: true,
        description:
          'Cap very large groups with `maxUnitsPerGroup` so one outlier cannot flood the lattice and squeeze every other group to invisibility.',
      },
      {
        guidance: false,
        description:
          'Supplying `hueOverrides` without `onHueOverrideChange` unless the overrides are genuinely read-only — the picker row only appears when the change handler is present.',
      },
      {
        guidance: false,
        description:
          'Putting interactive controls inside `renderGroupPopover` that the user cannot reach; the popover is hover-anchored and hides shortly after the pointer leaves.',
      },
    ],
  },
  props: [
    {
      name: 'groups',
      type: 'BAIUnitGridGroup[]',
      description:
        'The groups to draw. Each carries a `key`, an optional `label` used for the group initial and popover chrome, its `units` (each with a resolved `color` and an optional 0..1 `fraction`), and an optional `plateVariant` of `solid` or `dashed`.',
      required: true,
    },
    {
      name: 'layout',
      type: "'serpentine' | 'wordwrap'",
      description:
        'How groups are packed onto the lattice — `serpentine` keeps cells flowing continuously across rows, `wordwrap` starts each group on its own break.',
      default: "'serpentine'",
    },
    {
      name: 'groupPalette',
      type: 'string[]',
      description:
        'Resolved hues assigned to groups in flow order. Falls back to the token-backed muted seven-colour set declared by the component stylesheet when omitted or empty.',
    },
    {
      name: 'hueOverrides',
      type: 'Record<string, number>',
      description:
        'Controlled per-group palette-index overrides keyed by `group.key`, so a user-chosen hue survives re-sorting and re-filtering.',
    },
    {
      name: 'onHueOverrideChange',
      type: '(key: string, paletteIdx: number) => void',
      description:
        'Called when the user picks a hue for a group. Providing it is what enables the palette picker row inside the popover.',
    },
    {
      name: 'legendItems',
      type: 'Array<{ color: string; label: string }>',
      description:
        'Legend entries rendered above the grid. Nothing is rendered when the list is absent or empty.',
    },
    {
      name: 'renderGroupPopover',
      type: '(group, ctx: { hue: string; closePopover: () => void }) => React.ReactNode',
      description:
        'Body of the popover anchored to the hovered group. The context supplies the resolved hue and a callback to dismiss the popover from inside it.',
    },
    {
      name: 'onClickGroup',
      type: '(key: string) => void',
      description:
        'Called with the group key when a plate is clicked. Providing it also makes the cells read as clickable.',
    },
    {
      name: 'emptyFallback',
      type: 'React.ReactNode',
      description:
        'Rendered in place of the grid when there are no groups to draw.',
    },
    {
      name: 'maxUnitsPerGroup',
      type: 'number',
      description:
        'Upper bound on the cells drawn for a single group, so one very large group cannot dominate the lattice.',
      default: '256',
    },
    {
      name: 'columns',
      type: 'number',
      description:
        'Fixed lattice column count. Omitted, the count is derived from the measured wrapper width via a ResizeObserver — pass it for fixed layouts and for jsdom tests, where no real layout exists.',
    },
  ],
  examples: [
    {
      label: 'Session resource grid with popover and hue picker',
      code: `<BAIResourceUnitGrid
  aria-label={t('session.resourceGrid.ResourceGridOfNSessions', {
    count: shownSessions.length,
  })}
  groups={groups}
  layout={gridParams.gridLayout}
  maxUnitsPerGroup={MAX_UNITS_PER_SESSION}
  legendItems={legendItems}
  hueOverrides={hueOverrides}
  onHueOverrideChange={(key, paletteIdx) =>
    setHueOverrides((prev) => ({ ...prev, [key]: paletteIdx }))
  }
  renderGroupPopover={(group) => (
    <SessionGridPopover session={sessionByKey.get(group.key)} />
  )}
  onClickGroup={(key) => navigate(\`/session/\${key}\`)}
/>`,
    },
    {
      label: 'Fixed lattice, no interaction',
      code: `<BAIResourceUnitGrid
  aria-label={t('agent.AllocationGrid')}
  columns={24}
  groups={groups}
  emptyFallback={<BAIText type="secondary">{t('general.NoData')}</BAIText>}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
