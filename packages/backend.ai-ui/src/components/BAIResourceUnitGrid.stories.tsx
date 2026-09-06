import BAIFlex from './BAIFlex';
import BAIResourceUnitGrid, {
  type BAIUnitGridGroup,
} from './BAIResourceUnitGrid';
import { Text } from '@astryxdesign/core/Text';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

// Story-only demo colors: in the app the caller resolves each unit's color
// (e.g. utilization binning) before handing it to the component.
const LOW = '#e8e8e8';
const MID = '#ffce2f';
const HIGH = '#e33f4a';

const group = (
  key: string,
  label: string,
  colors: string[],
  fraction?: number,
): BAIUnitGridGroup => ({
  key,
  label,
  units: colors.map((color, i) => ({
    color,
    ...(fraction !== undefined && i === colors.length - 1 ? { fraction } : {}),
  })),
});

const fill = (n: number, color: string) =>
  Array.from({ length: n }, () => color);

const DEMO_GROUPS: BAIUnitGridGroup[] = [
  group('training-1', 'training-1', fill(9, LOW)),
  group('inference-a', 'inference-a', fill(4, MID)),
  group('batch-42', 'batch-42', fill(14, LOW)),
  group('notebook', 'notebook', fill(2, HIGH)),
  group('finetune', 'finetune', fill(7, MID)),
];

const LEGEND = [
  { color: LOW, label: 'Low (<50%)' },
  { color: MID, label: 'Mid (50–80%)' },
  { color: HIGH, label: 'High (≥80%)' },
];

const meta: Meta<typeof BAIResourceUnitGrid> = {
  title: 'Data Display/BAIResourceUnitGrid',
  component: BAIResourceUnitGrid,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**BAIResourceUnitGrid** renders groups of quantized unit squares on one shared
lattice — the generic rendering core of the session resource-grid view
(FR-3569). Each group is merged into a tinted rounded "plate", identified by a
palette hue cycled in flow order plus its initial letter on the visual
top-left cell. Hovering a group highlights it and opens an anchored, hoverable
popover whose content comes from the \`renderGroupPopover\` slot.

The component is domain- and color-agnostic: callers pass each unit's resolved
color, the legend items, and the popover content. Group hues default to a
token-backed muted 7-set (light/dark paired by index) and can be overridden
per group via the controlled \`hueOverrides\` map; providing
\`onHueOverrideChange\` enables the in-popover palette picker.
        `,
      },
    },
  },
  argTypes: {
    groups: { control: false },
    renderGroupPopover: { control: false },
    emptyFallback: { control: false },
    legendItems: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof BAIResourceUnitGrid>;

export const Serpentine: Story = {
  args: {
    groups: DEMO_GROUPS,
    legendItems: LEGEND,
    'aria-label': 'Resource grid of 5 groups',
  },
};

export const WordWrap: Story = {
  args: {
    groups: DEMO_GROUPS,
    layout: 'wordwrap',
    legendItems: LEGEND,
    'aria-label': 'Resource grid of 5 groups',
  },
};

export const FractionCells: Story = {
  args: {
    groups: [
      group('half-gpu', 'half-gpu', fill(3, MID), 0.5),
      group('tenth-gpu', 'tenth-gpu', fill(1, LOW), 0.1),
      group('three-quarters', 'three-quarters', fill(5, HIGH), 0.75),
    ],
    'aria-label': 'Resource grid with fractional units',
  },
};

export const HueOverridesWithPicker: Story = {
  render: () => {
    const [overrides, setOverrides] = useState<Record<string, number>>({
      'inference-a': 5,
    });
    return (
      <BAIResourceUnitGrid
        groups={DEMO_GROUPS}
        hueOverrides={overrides}
        onHueOverrideChange={(key, paletteIdx) =>
          setOverrides((prev) => ({ ...prev, [key]: paletteIdx }))
        }
        aria-label="Resource grid with color overrides"
      />
    );
  },
};

export const PopoverSlot: Story = {
  args: {
    groups: DEMO_GROUPS,
    'aria-label': 'Resource grid with popover details',
    renderGroupPopover: (group, { hue }) => (
      <BAIFlex direction="column" align="stretch" gap={4}>
        <Text size="sm" weight="semibold">
          {group.label}
        </Text>
        <Text size="sm" color="secondary">
          {group.units.length} units · hue {hue}
        </Text>
      </BAIFlex>
    ),
  },
};

export const DashedPlateVariant: Story = {
  args: {
    groups: [
      group('running-1', 'running-1', fill(6, MID)),
      {
        ...group('queued-1', 'queued-1', fill(4, LOW)),
        plateVariant: 'dashed',
      },
      group('running-2', 'running-2', fill(9, LOW)),
      {
        ...group('queued-2', 'queued-2', fill(8, LOW)),
        plateVariant: 'dashed',
      },
    ],
    'aria-label': 'Resource grid with tentative (dashed) groups',
  },
  parameters: {
    docs: {
      description: {
        story:
          "`plateVariant: 'dashed'` draws the group's plate outline dashed — an appearance variant for visually tentative groups (e.g. not-yet-allocated ones).",
      },
    },
  },
};

export const EmptyFallback: Story = {
  args: {
    groups: [],
    emptyFallback: (
      <Text size="sm" color="secondary">
        No groups match the current filter.
      </Text>
    ),
  },
};

export const ManyGroups: Story = {
  args: {
    groups: Array.from({ length: 40 }, (_, i) =>
      group(
        `g-${i}`,
        `group-${i}`,
        fill(1 + ((i * 7) % 13), [LOW, MID, HIGH][i % 3]),
      ),
    ),
    'aria-label': 'Resource grid stress example',
  },
};
