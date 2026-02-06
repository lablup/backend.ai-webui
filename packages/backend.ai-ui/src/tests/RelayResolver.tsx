import { Suspense } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import {
  createMockEnvironment,
  MockPayloadGenerator,
  MockResolvers,
} from 'relay-test-utils';

export interface RelayResolverProps {
  children?: React.ReactNode;
  mockResolvers?: MockResolvers;
}

const RelayResolver = ({
  children,
  mockResolvers = {},
}: RelayResolverProps) => {
  const environment = createMockEnvironment();

  const queueResolver = () => {
    environment.mock.queueOperationResolver((operation) => {
      queueResolver();
      return MockPayloadGenerator.generate(operation, mockResolvers);
    });
  };

  queueResolver();

  return (
    <RelayEnvironmentProvider environment={environment}>
      <Suspense fallback="Loading...">{children}</Suspense>
    </RelayEnvironmentProvider>
  );
};

export default RelayResolver;
