import { BAISessionTypeTagStoriesQuery } from '../../__generated__/BAISessionTypeTagStoriesQuery.graphql';
import RelayResolver from '../../tests/RelayResolver';
import BAISessionTypeTag from './BAISessionTypeTag';
import { Meta, StoryObj } from '@storybook/react-vite';
import { graphql, useLazyLoadQuery } from 'react-relay';

type Story = StoryObj<typeof BAISessionTypeTag>;

const meta: Meta<typeof BAISessionTypeTag> = {
  title: 'Fragments/BAISessionTypeTag',
  component: BAISessionTypeTag,
  parameters: {
    layout: 'centered',
  },
};

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
  name: 'INTERACTIVE',
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

export default meta;
