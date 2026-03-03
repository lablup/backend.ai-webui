import { BAISessionTypeTagStoriesQuery } from '../../__generated__/BAISessionTypeTagStoriesQuery.graphql';
import RelayResolver from '../../tests/RelayResolver';
import BAISessionTypeTag from './BAISessionTypeTag';
import { Meta, StoryObj } from '@storybook/react-vite';
import { graphql, useLazyLoadQuery } from 'react-relay';

/**
 * BAISessionTypeTag displays a colored tag indicating the session type.
 *
 * Key features:
 * - Uses Relay fragment to fetch session type from GraphQL
 * - Color-coded tags: INTERACTIVE (geekblue), BATCH (cyan), INFERENCE (purple)
 * - Auto-uppercases the session type text
 *
 * @see BAISessionTypeTag.tsx for implementation details
 */
const meta: Meta<typeof BAISessionTypeTag> = {
  title: 'Fragments/BAISessionTypeTag',
  component: BAISessionTypeTag,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**BAISessionTypeTag** is a Relay fragment component that displays a colored tag for session types.

## Features
- Color-coded tags based on session type
- Supports three session types: INTERACTIVE, BATCH, INFERENCE
- Automatically uppercases the session type text
- Uses GraphQL fragment for data fetching

## Session Type Colors
| Type | Color | Description |
|------|-------|-------------|
| INTERACTIVE | geekblue | Interactive sessions |
| BATCH | cyan | Batch processing sessions |
| INFERENCE | purple | Inference sessions |

## Props
| Name | Type | Description |
|------|------|-------------|
| \`sessionFrgmt\` | \`BAISessionTypeTagFragment$key\` | Relay fragment reference containing session type |
        `,
      },
    },
  },
  argTypes: {
    sessionFrgmt: {
      control: false,
      description:
        'Relay fragment reference for session data (contains type field)',
      table: {
        type: { summary: 'BAISessionTypeTagFragment$key' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAISessionTypeTag>;

const QueryResolver = () => {
  const { compute_session_node } =
    useLazyLoadQuery<BAISessionTypeTagStoriesQuery>(
      graphql`
        query BAISessionTypeTagStoriesQuery {
          compute_session_node(id: "test-id") {
            ...BAISessionTypeTagFragment
          }
        }
      `,
      {},
    );
  return (
    compute_session_node && (
      <BAISessionTypeTag sessionFrgmt={compute_session_node} />
    )
  );
};

export const Default: Story = {
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Displays an INTERACTIVE session type tag with geekblue color.',
      },
    },
  },
  render: () => {
    return (
      <RelayResolver
        mockResolvers={{
          ComputeSessionNode: () => ({ type: 'INTERACTIVE' }),
        }}
      >
        <QueryResolver />
      </RelayResolver>
    );
  },
};

export const Batch: Story = {
  name: 'BATCH',
  parameters: {
    docs: {
      description: {
        story: 'Displays a BATCH session type tag with cyan color.',
      },
    },
  },
  render: () => {
    return (
      <RelayResolver
        mockResolvers={{
          ComputeSessionNode: () => ({ type: 'BATCH' }),
        }}
      >
        <QueryResolver />
      </RelayResolver>
    );
  },
};

export const Inference: Story = {
  name: 'INFERENCE',
  parameters: {
    docs: {
      description: {
        story: 'Displays an INFERENCE session type tag with purple color.',
      },
    },
  },
  render: () => {
    return (
      <RelayResolver
        mockResolvers={{
          ComputeSessionNode: () => ({ type: 'INFERENCE' }),
        }}
      >
        <QueryResolver />
      </RelayResolver>
    );
  },
};
