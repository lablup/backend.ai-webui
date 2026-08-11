import BAITabList from './BAITabList';
import { Tab } from '@astryxdesign/core/TabList';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

const meta: Meta<typeof BAITabList> = {
  title: 'Navigation/BAITabList',
  component: BAITabList,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**BAITabList** wraps Astryx's \`TabList\` and restores the two tab *looks* the
app has always had, so both can be used side by side:

- \`type="line"\` (default) — Astryx's underlined strip.
- \`type="card"\` — boxed, gutter-separated tabs sitting on an accent rail
  (antd \`Tabs type="card"\`, which the legacy \`BAITabs\` wrapper hard-coded).

It also fixes two composition mistakes that are easy to make by hand:

1. The \`<nav>\` is block-level, so the \`hasDivider\` rail spans the **whole tab
   bar** rather than stopping at the last tab. Astryx's strip has no \`width\`,
   so putting it inside a flex row makes it hug its tabs.
2. \`tabBarExtraContent\` renders **inside** the nav, pushed over with
   \`margin-inline-start: auto\` — Astryx's own \`TabListTabsWithActions\`
   idiom — so the rail still runs underneath it.

## Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| type | \`'line' \\| 'card'\` | \`'line'\` | Tab appearance |
| hasDivider | \`boolean\` | \`true\` | Draw the rail under the strip |
| size | \`'sm' \\| 'md' \\| 'lg'\` | \`'md'\` (\`'lg'\` for \`card\`) | Tab height step |
| tabBarExtraContent | \`ReactNode\` | - | Trailing slot on the tab bar |
        `,
      },
    },
  },
  argTypes: {
    type: {
      control: { type: 'inline-radio' },
      options: ['line', 'card'],
      table: { defaultValue: { summary: 'line' } },
    },
    size: {
      control: { type: 'inline-radio' },
      options: ['sm', 'md', 'lg'],
    },
    hasDivider: { control: { type: 'boolean' } },
  },
};

export default meta;

type Story = StoryObj<typeof BAITabList>;

const TABS = [
  { value: 'running', label: 'Running' },
  { value: 'finished', label: 'Finished' },
  { value: 'others', label: 'Others' },
];

const Controlled = ({
  initial = 'running',
  ...props
}: Partial<React.ComponentProps<typeof BAITabList>> & { initial?: string }) => {
  const [value, setValue] = useState(initial);
  return (
    <BAITabList value={value} onChange={setValue} {...props}>
      {TABS.map((tab) => (
        <Tab key={tab.value} value={tab.value} label={tab.label} />
      ))}
    </BAITabList>
  );
};

/** The default underlined strip. Note the rail runs the full width. */
export const Line: Story = {
  render: () => <Controlled type="line" />,
};

/** The restored antd `type="card"` look: boxed tabs on an accent rail. */
export const Card: Story = {
  render: () => <Controlled type="card" />,
};

/**
 * Both styles coexist — `FolderExplorerModalV2` picks between them on a
 * breakpoint, so neither may be a global theme default.
 */
export const SideBySide: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 32 }}>
      <Controlled type="line" />
      <Controlled type="card" initial="finished" />
    </div>
  ),
};

/**
 * `tabBarExtraContent` sits at the trailing edge of the bar, and the rail
 * still spans underneath it.
 */
export const WithTabBarExtraContent: Story = {
  render: () => (
    <Controlled
      type="card"
      tabBarExtraContent={<a href="#extra">Pending invitations (2)</a>}
    />
  ),
};

/** Every size step, card style. */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 32 }}>
      <Controlled type="card" size="sm" />
      <Controlled type="card" size="md" />
      <Controlled type="card" size="lg" />
    </div>
  ),
};
