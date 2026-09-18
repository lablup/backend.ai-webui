import { BAISessionTypeTokenStoriesQuery } from '../../__generated__/BAISessionTypeTokenStoriesQuery.graphql';
import RelayResolver from '../../tests/RelayResolver';
import BAISessionTypeToken from './BAISessionTypeToken';
import { Meta, StoryObj } from '@storybook/react-vite';
import { graphql, useLazyLoadQuery } from 'react-relay';

/**
 * BAISessionTypeToken displays a coloured Token indicating the session type.
 *
 * Key features:
 * - Uses Relay fragment to fetch session type from GraphQL
 * - Colour-coded tokens: INTERACTIVE (blue), BATCH (cyan), INFERENCE (purple)
 * - Auto-uppercases the session type text
 *
 * @see BAISessionTypeToken.tsx for implementation details
 */
const meta: Meta<typeof BAISessionTypeToken> = {
  title: 'Fragments/BAISessionTypeToken',
  component: BAISessionTypeToken,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**BAISessionTypeToken** is a Relay fragment component that displays a coloured Token for session types.

## Features
- Colour-coded tokens based on session type
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
| \`sessionFrgmt\` | \`BAISessionTypeTokenFragment$key\` | Relay fragment reference containing session type |
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
        type: { summary: 'BAISessionTypeTokenFragment$key' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAISessionTypeToken>;

const QueryResolver = () => {
  const { compute_session_node } =
    useLazyLoadQuery<BAISessionTypeTokenStoriesQuery>(
      graphql`
        query BAISessionTypeTokenStoriesQuery {
          compute_session_node(id: "test-id") {
            ...BAISessionTypeTokenFragment
          }
        }
      `,
      {},
    );
  return (
    compute_session_node && (
      <BAISessionTypeToken sessionFrgmt={compute_session_node} />
    )
  );
};

export const Default: Story = {
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Displays an INTERACTIVE session type token in blue.',
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
        story: 'Displays a BATCH session type token in cyan.',
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
        story: 'Displays an INFERENCE session type token in purple.',
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
