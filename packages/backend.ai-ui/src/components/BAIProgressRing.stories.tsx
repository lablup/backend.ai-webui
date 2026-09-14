import BAIFlex from './BAIFlex';
import BAIProgressRing from './BAIProgressRing';
import { Badge } from '@astryxdesign/core/Badge';
import { Text } from '@astryxdesign/core/Text';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof BAIProgressRing> = {
  title: 'Feedback/BAIProgressRing',
  component: BAIProgressRing,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**BAIProgressRing** is a progress ring small enough to be used as an icon — typically the \`icon\` slot of an Astryx \`Badge\`.

Both circles are stroked with \`currentColor\` and the default size is \`1em\`, so the ring takes the colour and the scale of whatever carries it.

The **drawn** arc is pinned to the range \`getVisibleArcRange(strokeWidth)\` returns: at 0% it is a short arc rather than a bare track, and at 100% a gap survives the round line caps, so the slow rotation stays perceptible at both extremes. Both bounds come from the ring’s geometry rather than two fixed percents, so they follow \`strokeWidth\` — 7.96..86.74% at the default 2, 0..57.6% at 5 — and always leave a 5-unit arc and a 3-unit gap. Everything in between is drawn honestly, and \`aria-valuenow\` always carries the true percent.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`percent\` | \`number\` | \`undefined\` | Completion, clamped to 0..100. Omitted renders the indeterminate ring. |
| \`size\` | \`string \\| number\` | \`'1em'\` | Rendered size of the square the ring is drawn in. |
| \`strokeWidth\` | \`number\` | \`2\` | Stroke width in user units of the 16-unit viewBox. |
| \`rotate\` | \`boolean\` | \`true\` | Whether the determinate ring keeps turning slowly (2.4s per turn). |
        `,
      },
    },
  },
  argTypes: {
    percent: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Completion in percent; leave unset for indeterminate',
    },
    size: { control: { type: 'text' } },
    strokeWidth: { control: { type: 'range', min: 1, max: 5, step: 0.5 } },
    rotate: { control: { type: 'boolean' } },
  },
};

export default meta;
type Story = StoryObj<typeof BAIProgressRing>;

export const Default: Story = {
  name: 'Basic',
  args: {
    percent: 66,
    size: '2rem',
  },
};

export const Determinate: Story = {
  name: 'Determinate steps',
  parameters: {
    docs: {
      description: {
        story:
          'The 0% and 100% rings still show an arc and a gap — the clamp on the drawn arc is what keeps the slow rotation visible at the extremes.',
      },
    },
  },
  render: () => (
    <BAIFlex gap="lg" align="center">
      {[0, 1, 25, 50, 75, 99, 100].map((percent) => (
        <BAIFlex key={percent} direction="column" gap="xs" align="center">
          <BAIProgressRing percent={percent} size="2rem" />
          <Text type="supporting">{percent}%</Text>
        </BAIFlex>
      ))}
    </BAIFlex>
  ),
};

export const Indeterminate: Story = {
  render: () => (
    <BAIFlex gap="lg" align="center">
      <BAIFlex direction="column" gap="xs" align="center">
        <BAIProgressRing size="2rem" />
        <Text type="supporting">unknown</Text>
      </BAIFlex>
      <BAIFlex direction="column" gap="xs" align="center">
        <BAIProgressRing percent={40} rotate={false} size="2rem" />
        <Text type="supporting">40%, not rotating</Text>
      </BAIFlex>
    </BAIFlex>
  ),
};

export const InsideABadge: Story = {
  name: 'Inside a Badge',
  render: () => (
    <BAIFlex gap="sm" align="center">
      <Badge
        variant="warning"
        icon={<BAIProgressRing percent={99} />}
        label="TERMINATING"
      />
      <Badge
        variant="info"
        icon={<BAIProgressRing percent={12} />}
        label="PREPARING"
      />
      <Badge variant="warning" icon={<BAIProgressRing />} label="TERMINATING" />
    </BAIFlex>
  ),
};
