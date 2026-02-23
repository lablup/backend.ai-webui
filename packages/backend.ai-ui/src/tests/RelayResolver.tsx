import { Suspense, useMemo } from 'react';
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
  const environment = useMemo(() => {
    const env = createMockEnvironment();

    const queueResolver = () => {
      env.mock.queueOperationResolver((operation) => {
        queueResolver();
        return MockPayloadGenerator.generate(operation, mockResolvers);
      });
    };

    queueResolver();

    return env;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mockResolvers]);

  return (
    <RelayEnvironmentProvider environment={environment}>
      <Suspense fallback="Loading...">{children}</Suspense>
    </RelayEnvironmentProvider>
  );
};

export default RelayResolver;
