import BAIBadge from './BAIBadge';
import BAIMetadataList from './BAIMetadataList';
import { MetadataListItem } from '@astryxdesign/core/MetadataList';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof BAIMetadataList> = {
  title: 'Data Display/BAIMetadataList',
  component: BAIMetadataList,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**BAIMetadataList** wraps Astryx's \`MetadataList\` and restores antd's
\`Descriptions bordered\` look as an opt-in \`bordered\` prop.

Astryx's \`MetadataList\` is where antd \`Descriptions\` landed in the
conversion, and it covers the plain variant exactly — but it has no
counterpart for \`bordered\`, so every converted call site dropped the prop.
This wrapper gives that look back without making it the default: the plain
list stays the default, and \`bordered\` is a per-surface choice.

\`bordered\` is purely paint — one class, declarations in
\`BAIMetadataList.css\`, entirely in design tokens. Without it the component
is a pass-through and no CSS is reached.

## Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| bordered | \`boolean\` | \`false\` | Frame + label/value cell rules, antd \`Descriptions bordered\` |
| size | \`'default' \\| 'middle' \\| 'small'\` | \`'default'\` | Bordered cell padding (16/24, 12/24, 8/16px). No effect without \`bordered\`, as in antd |

Everything else is \`MetadataList\`'s own surface (\`columns\`, \`label\`,
\`title\`, \`orientation\`, \`maxNumOfItems\`).

### Bordered implies side labels

antd's bordered layout is a table whose label is always the leading cell, so a
bordered list defaults to \`label={{ position: 'start' }}\` even at
multi-column widths, where plain Astryx would stack them. An explicit
\`label\` still wins; \`position: 'top'\` plus \`bordered\` has no antd
equivalent and is not styled.
        `,
      },
    },
  },
  argTypes: {
    bordered: { control: { type: 'boolean' } },
    size: {
      control: { type: 'inline-radio' },
      options: ['default', 'middle', 'small'],
      table: { defaultValue: { summary: 'default' } },
    },
    columns: {
      control: { type: 'inline-radio' },
      options: ['single', 'multi'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof BAIMetadataList>;

const POLICY_ITEMS = (
  <>
    <MetadataListItem label="Name">default-policy</MetadataListItem>
    <MetadataListItem label="Max VFolder Count">10</MetadataListItem>
    <MetadataListItem label="Max Session Count Per Model Session">
      1
    </MetadataListItem>
    <MetadataListItem label="Status">
      <BAIBadge color="success" text="Active" />
    </MetadataListItem>
  </>
);

/** Astryx's own list, untouched — this is what every converted surface shows today. */
export const Plain: Story = {
  render: () => <BAIMetadataList>{POLICY_ITEMS}</BAIMetadataList>,
};

/** The restored antd `Descriptions bordered` look. */
export const Bordered: Story = {
  render: () => <BAIMetadataList bordered>{POLICY_ITEMS}</BAIMetadataList>,
};

/**
 * Side by side. `bordered` is opt-in precisely so both can be used — adopting
 * it is a per-surface choice, not a global restyle.
 */
export const PlainVsBordered: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 32 }}>
      <BAIMetadataList title="Plain">{POLICY_ITEMS}</BAIMetadataList>
      <BAIMetadataList title="Bordered" bordered>
        {POLICY_ITEMS}
      </BAIMetadataList>
    </div>
  ),
};

/** antd's three `size` steps, which set the bordered cell padding. */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 32 }}>
      <BAIMetadataList bordered size="default" title="default — 16px / 24px">
        {POLICY_ITEMS}
      </BAIMetadataList>
      <BAIMetadataList bordered size="middle" title="middle — 12px / 24px">
        {POLICY_ITEMS}
      </BAIMetadataList>
      <BAIMetadataList bordered size="small" title="small — 8px / 16px">
        {POLICY_ITEMS}
      </BAIMetadataList>
    </div>
  ),
};

/**
 * Two columns. The rules are drawn as the grid gap, so the lattice closes
 * correctly at any column count with no last-row special case — the reason
 * this could not be done with `:last-of-type` row rules.
 */
export const MultiColumn: Story = {
  render: () => (
    <BAIMetadataList bordered columns={2}>
      {POLICY_ITEMS}
      <MetadataListItem label="Created At">2026-08-09 11:24</MetadataListItem>
      <MetadataListItem label="Total Resource Slots">
        cpu: 4, mem: 8g
      </MetadataListItem>
    </BAIMetadataList>
  ),
};

/**
 * Long values wrap inside their cell and the row grows with them; the label
 * cell fills the row rather than leaving the lattice ragged.
 */
export const LongValues: Story = {
  render: () => (
    <BAIMetadataList bordered>
      <MetadataListItem label="Allowed VFolder Hosts">
        local:volume1, local:volume2, cephfs:shared, cephfs:scratch,
        nfs:archive, nfs:home, s3:models, s3:datasets
      </MetadataListItem>
      <MetadataListItem label="Full Image Path">
        cr.backend.ai/multiarch/python-ff:24.03-py310-cuda12.2-ubuntu22.04
      </MetadataListItem>
      <MetadataListItem label="Status">
        <BAIBadge color="success" text="Active" />
      </MetadataListItem>
    </BAIMetadataList>
  ),
};
