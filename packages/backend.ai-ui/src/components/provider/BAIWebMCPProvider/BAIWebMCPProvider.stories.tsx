import BAIWebMCPProvider from './BAIWebMCPProvider';
import useWebMCPTool, { useBAIWebMCPActive } from './hooks/useWebMCPTool';
import { Text } from '@astryxdesign/core/Text';
import type { Meta, StoryObj } from '@storybook/react-vite';

const EchoTool = () => {
  'use memo';
  const isActive = useBAIWebMCPActive();
  useWebMCPTool({
    name: 'bai_story_echo',
    description: 'Storybook demo tool. Echoes a validated message.',
    inputSchema: {
      type: 'object',
      properties: {
        message: { type: 'string', minLength: 1, maxLength: 50 },
        times: { type: 'integer', minimum: 1, maximum: 3 },
      },
      required: ['message'],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
    execute: ({ message, times }) => ({
      echo: Array((times as number | undefined) ?? 1)
        .fill(message)
        .join(' '),
    }),
  });
  return (
    <Text>
      {isActive
        ? '`bai_story_echo` is registered on document.modelContext.'
        : 'Nothing is registered: the gate is off or this browser has no document.modelContext.'}
    </Text>
  );
};

const meta: Meta<typeof BAIWebMCPProvider> = {
  title: 'Utility/BAIWebMCPProvider',
  component: BAIWebMCPProvider,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Runtime gate for `useWebMCPTool` (ADR 0009). Open this story in a browser that implements WebMCP (Chrome with `--enable-features=WebMCPTesting`) to call `bai_story_echo`.',
      },
    },
  },
  argTypes: {
    enabled: {
      control: { type: 'boolean' },
      description: 'Registers tools in the subtree when true.',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAIWebMCPProvider>;

export const Default: Story = {
  name: 'Basic',
  args: { enabled: true },
  render: (args) => (
    <BAIWebMCPProvider {...args}>
      <EchoTool />
    </BAIWebMCPProvider>
  ),
};
