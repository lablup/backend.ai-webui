import { BAIClientContext, BAIAnonymousClientContext } from './context';
import type { BAIClient } from './types';
import type { ReactNode } from 'react';

export interface BAIClientProviderProps {
  clientPromise: Promise<BAIClient>;
  anonymousClientFactory: (api_endpoint: string) => BAIClient;
  children: ReactNode;
}

const BAIClientProvider: React.FC<BAIClientProviderProps> = ({
  clientPromise,
  anonymousClientFactory,
  children,
}) => {
  return (
    <BAIClientContext.Provider value={clientPromise}>
      <BAIAnonymousClientContext.Provider value={anonymousClientFactory}>
        {children}
      </BAIAnonymousClientContext.Provider>
    </BAIClientContext.Provider>
  );
};

export default BAIClientProvider;
