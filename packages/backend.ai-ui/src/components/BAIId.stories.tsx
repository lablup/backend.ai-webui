import BAIFlex from './BAIFlex';
import BAIId from './BAIId';
import type { Meta, StoryObj } from '@storybook/react-vite';

const SAMPLE_UUID = '5a59ce9b-afa1-4059-9341-683110eb4408';
const SAMPLE_GLOBAL_ID = btoa(`UserNode:${SAMPLE_UUID}`);

const meta: Meta<typeof BAIId> = {
  title: 'Text/BAIId',
  component: BAIId,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**BAIId** is a thin wrapper around \`BAIText\` for rendering identifiers
(plain UUIDs or Relay global IDs) in a compact, copyable form.

It accepts exactly one of two mutually exclusive props:

- \`uuid\`: a plain UUID string.
- \`globalId\`: a base64-encoded Relay global ID; decoded via \`toLocalId\`.

By default it renders with:
- \`copyable\`
- \`ellipsis\` (CSS-based, Safari-compatible)
- \`monospace\`
- \`style={{ maxWidth: 100 }}\`

All defaults are overridable via props; all other \`BAIText\` props pass through.
`,
      },
    },
  },
  argTypes: {
    uuid: {
      control: { type: 'text' },
      description: 'Plain UUID string. Mutually exclusive with `globalId`.',
      table: { type: { summary: 'string' } },
    },
    globalId: {
      control: { type: 'text' },
      description:
        'Relay global ID (base64). Decoded to the local id via `toLocalId`. Mutually exclusive with `uuid`.',
      table: { type: { summary: 'string' } },
    },
  },
};

export default meta;

type Story = StoryObj<typeof BAIId>;

export const Default: Story = {
  name: 'Basic',
  args: {
    uuid: SAMPLE_UUID,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Renders a plain UUID in a compact, copyable form. The displayed text may be truncated with ellipsis depending on the available width and `style.maxWidth`; the copy icon copies the full id.',
      },
    },
  },
};

export const WithGlobalId: Story = {
  name: 'Global ID',
  args: {
    globalId: SAMPLE_GLOBAL_ID,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Renders a Relay global ID after decoding the base64 payload and extracting the local id with `toLocalId`. The copy icon copies the decoded local id.',
      },
    },
  },
};

export const OverrideDefaults: Story = {
  name: 'Override defaults',
  render: () => (
    <BAIFlex direction="column" gap="sm">
      <BAIId uuid={SAMPLE_UUID} copyable={false} />
      <BAIId uuid={SAMPLE_UUID} monospace={false} />
      <BAIId uuid={SAMPLE_UUID} style={{ maxWidth: 200 }} />
      <BAIId uuid={SAMPLE_UUID} ellipsis={false} style={{ maxWidth: 'none' }} />
    </BAIFlex>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'All defaults (`copyable`, `ellipsis`, `monospace`, `style.maxWidth`) can be overridden. Other `BAIText` props pass through.',
      },
    },
  },
};
