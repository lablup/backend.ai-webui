import { Form } from '../form-engine';
import BAICompactGroup from './BAICompactGroup';
import { Button } from '@astryxdesign/core/Button';
import { HStack } from '@astryxdesign/core/HStack';
import { Selector } from '@astryxdesign/core/Selector';
import { TextInput } from '@astryxdesign/core/TextInput';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

/**
 * BAICompactGroup welds a horizontal run of adjacent form controls into a
 * single visual control — the job antd's `Space.Compact` did.
 *
 * Key features:
 * - Overlaps neighbours by exactly one `var(--border-width)`, so the doubled
 *   border at each joint collapses to a single stroke.
 * - Squares the inner corners and leaves the outer ones at whatever radius the
 *   controls' own size step gives them.
 * - Raises the hovered / focused control above its neighbour, so its accent
 *   edge is not painted over at the joint.
 * - Reaches the bordered surface through the stable `.astryx-*` classes, so a
 *   child may be a control directly or a wrapper such as `Form.Item`.
 *
 * @see BAICompactGroup.css for the antd / Astryx metrics each rule reproduces.
 */
const meta: Meta<typeof BAICompactGroup> = {
  title: 'Layout/BAICompactGroup',
  component: BAICompactGroup,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**BAICompactGroup** joins adjacent form controls into one welded control.

## Features
- One shared border at each joint (children overlap by \`var(--border-width)\`)
- Squared inner corners, untouched outer corners
- Focused / hovered control wins the shared edge (\`z-index\` raise)
- Works with bare Astryx controls *and* with \`Form.Item\` wrappers

## Usage
\`\`\`tsx
<BAICompactGroup>
  <Form.Item name="email_prefix" label="E-Mail Prefix" style={{ flex: 1 }}>
    <AstryxFormTextInput label="E-Mail Prefix" />
  </Form.Item>
  <Form.Item name="email_suffix" label="E-Mail Suffix" style={{ flex: 1 }}>
    <AstryxFormTextInput label="E-Mail Suffix" />
  </Form.Item>
</BAICompactGroup>
\`\`\`

## Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| width | \`SizeValue\` | \`'100%'\` | Width of the run |
| children | \`ReactNode\` | - | The controls to weld; size them with \`flex\` as usual |
| className | \`string\` | - | Appended after \`bai-compact-group\` |

\`gap\` and \`wrap\` are **not** accepted: a gap would undo the weld, and a
wrapped run would leave a squared inner corner at the end of a line.
        `,
      },
    },
  },
  argTypes: {
    width: {
      control: { type: 'text' },
      description: 'Width of the whole run.',
      table: {
        type: { summary: 'SizeValue' },
        defaultValue: { summary: "'100%'" },
      },
    },
    children: {
      control: false,
      description: 'The controls to weld together.',
    },
    className: {
      control: false,
      description: 'Appended after the component’s own class.',
    },
  },
};

export default meta;

type Story = StoryObj<typeof BAICompactGroup>;

// =============================================================================
// Sample data
// =============================================================================

const sampleDomains = [
  { value: 'lablup.com', label: 'lablup.com' },
  { value: 'example.org', label: 'example.org' },
];

/** Two halves of one e-mail address — the shape the finding was filed against. */
const EmailPair = ({ status }: { status?: 'error' }) => {
  const [prefix, setPrefix] = useState('admin');
  const [suffix, setSuffix] = useState('lablup.com');
  return (
    <BAICompactGroup>
      <TextInput
        label="E-Mail Prefix"
        value={prefix}
        onChange={setPrefix}
        width="100%"
        placeholder="Max. 30 characters"
      />
      <TextInput
        label="E-Mail Suffix"
        value={suffix}
        onChange={setSuffix}
        width="100%"
        placeholder="Max. 30 characters"
        status={status ? { type: 'error' } : undefined}
      />
    </BAICompactGroup>
  );
};

// =============================================================================
// Stories
// =============================================================================

/**
 * The reported call site: an e-mail prefix and suffix that belong to one
 * address. The two fields share a single border and only the outer corners are
 * rounded.
 */
export const Default: Story = {
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story:
          'Two text inputs welded into one control. Click either field: the ' +
          'focused one’s accent border wins the shared edge instead of being ' +
          'painted over by its neighbour.',
      },
    },
  },
  render: () => <EmailPair />,
};

/**
 * Side by side with the un-welded arrangement this replaces.
 */
export const AgainstAPlainRow: Story = {
  name: 'WeldedVsPlainRow',
  parameters: {
    docs: {
      description: {
        story:
          'Top: `BAICompactGroup`. Bottom: the same two fields in a gapless ' +
          '`HStack`, which is what the migration shipped — the borders double ' +
          'up at the joint and both fields keep all four rounded corners.',
      },
    },
  },
  render: () => {
    const Plain = () => {
      const [prefix, setPrefix] = useState('admin');
      const [suffix, setSuffix] = useState('lablup.com');
      return (
        <HStack gap={0} width="100%">
          <TextInput
            label="E-Mail Prefix"
            value={prefix}
            onChange={setPrefix}
            width="100%"
          />
          <TextInput
            label="E-Mail Suffix"
            value={suffix}
            onChange={setSuffix}
            width="100%"
          />
        </HStack>
      );
    };
    return (
      <div style={{ display: 'grid', gap: 32 }}>
        <EmailPair />
        <Plain />
      </div>
    );
  },
};

/**
 * Heterogeneous run: a control plus a trailing action.
 */
export const WithTrailingButton: Story = {
  name: 'ControlPlusAction',
  parameters: {
    docs: {
      description: {
        story:
          'A `Button` is welded only when it is a **direct child** of the ' +
          'group — a button nested inside a field (Astryx’s clear “×”) keeps ' +
          'its own shape.',
      },
    },
  },
  render: () => {
    const Run = () => {
      const [value, setValue] = useState('');
      return (
        <BAICompactGroup width="auto">
          <TextInput
            label="Search"
            value={value}
            onChange={setValue}
            hasClear
            placeholder="Session name"
          />
          <Button label="Search" variant="primary" />
        </BAICompactGroup>
      );
    };
    return <Run />;
  },
};

/**
 * Three members, so the middle one has both inner corners squared.
 */
export const ThreeMembers: Story = {
  name: 'ThreeMembers',
  parameters: {
    docs: {
      description: {
        story:
          'The middle control loses the radius on both sides; only the run’s ' +
          'outermost corners stay rounded.',
      },
    },
  },
  render: () => {
    const Run = () => {
      const [prefix, setPrefix] = useState('admin');
      const [middle, setMiddle] = useState('');
      const [domain, setDomain] = useState<string | null>('lablup.com');
      return (
        <BAICompactGroup>
          <TextInput
            label="Prefix"
            value={prefix}
            onChange={setPrefix}
            width="100%"
          />
          <TextInput
            label="Team"
            value={middle}
            onChange={setMiddle}
            width="100%"
            placeholder="optional"
          />
          <Selector
            label="Domain"
            value={domain}
            onChange={setDomain}
            options={sampleDomains}
            width="100%"
            // Astryx requires `hasClear` whenever the value may be null. It
            // also renders the clear affordance INSIDE the field, which is the
            // nesting the stylesheet's button rule has to step around.
            hasClear
          />
        </BAICompactGroup>
      );
    };
    return <Run />;
  },
};

/**
 * A failing rule paints the border red; the weld does not hide it.
 */
export const Error: Story = {
  name: 'ErrorState',
  parameters: {
    docs: {
      description: {
        story:
          'One member in an error state. Because the surfaces overlap, hover ' +
          'or focus the erroring field to bring its full outline forward.',
      },
    },
  },
  render: () => <EmailPair status="error" />,
};

/**
 * The real call-site shape: each member is a `Form.Item` that owns its own
 * label, rules and error slot — which is exactly why Astryx's `InputGroup`
 * (one group-level label, one input) could not be used.
 */
export const InsideAForm: Story = {
  name: 'FormIntegration',
  parameters: {
    docs: {
      description: {
        story:
          'Two `Form.Item`s inside one group. The bordered surface is three ' +
          'levels below the group child here, and the weld still reaches it.',
      },
    },
  },
  render: () => (
    <Form
      layout="vertical"
      initialValues={{ email_prefix: 'admin', email_suffix: 'lablup.com' }}
    >
      <BAICompactGroup>
        <Form.Item
          name="email_prefix"
          label="E-Mail Prefix"
          style={{ flex: 1 }}
          rules={[{ required: true }]}
        >
          <FormTextInput label="E-Mail Prefix" />
        </Form.Item>
        <Form.Item
          name="email_suffix"
          label="E-Mail Suffix"
          style={{ flex: 1 }}
          rules={[{ required: true }]}
        >
          <FormTextInput label="E-Mail Suffix" />
        </Form.Item>
      </BAICompactGroup>
    </Form>
  ),
};

/**
 * `Form.Item` clones its child with `value` / `onChange`, and Astryx's
 * `TextInput` types `value` as a required `string`. The host app has
 * `AstryxFormTextInput` for this; BUI has no equivalent, so the story declares
 * the minimal adapter it needs rather than importing across the boundary.
 */
function FormTextInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <TextInput
      label={label}
      isLabelHidden
      value={value ?? ''}
      onChange={(next) => onChange?.(next)}
      width="100%"
    />
  );
}
