import { BAISessionTypeTagStoriesQuery } from '../../__generated__/BAISessionTypeTagStoriesQuery.graphql';
import BAISessionTypeTag, { BAISessionTypeTagProps } from './BAISessionTypeTag';
import { Meta, StoryObj } from '@storybook/react-vite/*';
import { Suspense } from 'react';
import {
  graphql,
  RelayEnvironmentProvider,
  useLazyLoadQuery,
} from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';

const meta: Meta<typeof BAISessionTypeTag> = {
  title: 'Fragments/BAISessionTypeTag',
  component: BAISessionTypeTag,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof BAISessionTypeTag>;

const Wrapper = () => {
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
  name: 'INFERENCE',
  render: () => {
    const environment = createMockEnvironment();

    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, {
        String() {
          return 'INFERENCE';
        },
      }),
    );

    return (
      <RelayEnvironmentProvider environment={environment}>
        <Suspense fallback="Loading...">
          <Wrapper />
        </Suspense>
      </RelayEnvironmentProvider>
    );
  },
};

export const BATCH: Story = {
  name: 'BATCH',
  render: () => {
    const environment = createMockEnvironment();

    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, {
        String() {
          return 'BATCH';
        },
      }),
    );

    return (
      <RelayEnvironmentProvider environment={environment}>
        <Suspense fallback="Loading...">
          <Wrapper />
        </Suspense>
      </RelayEnvironmentProvider>
    );
  },
};

export const INTERACTIVE: Story = {
  name: 'INTERACTIVE',
  render: () => {
    const environment = createMockEnvironment();

    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, {
        String() {
          return 'INTERACTIVE';
        },
      }),
    );

    return (
      <RelayEnvironmentProvider environment={environment}>
        <Suspense fallback="Loading...">
          <Wrapper />
        </Suspense>
      </RelayEnvironmentProvider>
    );
  },
};
