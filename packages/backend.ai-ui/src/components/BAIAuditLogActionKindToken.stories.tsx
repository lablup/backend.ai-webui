import BAIAuditLogActionKindToken, {
  AUDIT_LOG_ACTION_KINDS,
} from './BAIAuditLogActionKindToken';
import BAIFlex from './BAIFlex';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof BAIAuditLogActionKindToken> = {
  title: 'Token/BAIAuditLogActionKindToken',
  component: BAIAuditLogActionKindToken,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**BAIAuditLogActionKindToken** labels the shape of the action that wrote an audit log record.

## Features
- Neutral Token: the kind is a classification, not a state
- Translated label for each of the seven \`AuditLogActionKind\` values
- An unknown value is shown verbatim
- \`useAuditLogActionKindOptions()\` returns the same labels for filters

## Usage
\`\`\`tsx
<BAIAuditLogActionKindToken actionKind="BULK" />
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    actionKind: {
      control: { type: 'select' },
      options: AUDIT_LOG_ACTION_KINDS,
      description: 'The `AuditLogActionKind` value to label',
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAIAuditLogActionKindToken>;

export const Default: Story = {
  name: 'Basic',
  args: {
    actionKind: 'SINGLE_ENTITY',
  },
};

export const AllKinds: Story = {
  name: 'AllKinds',
  parameters: {
    docs: {
      description: {
        story:
          'All seven action kinds side by side, plus a value the component does not know.',
      },
    },
  },
  render: () => (
    <BAIFlex direction="column" gap="sm" align="start">
      {AUDIT_LOG_ACTION_KINDS.map((kind) => (
        <BAIAuditLogActionKindToken key={kind} actionKind={kind} />
      ))}
      <BAIAuditLogActionKindToken actionKind="FUTURE_KIND" />
    </BAIFlex>
  ),
};
