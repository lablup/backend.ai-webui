import BAIClientContext from './context';
import type { BAIClient } from './types';
import { ReactNode } from 'react';

export interface BAIClientProviderProps {
  client: BAIClient;
  children: ReactNode;
}

const BAIClientProvider: React.FC<BAIClientProviderProps> = ({
  client,
  children,
}) => {
  return (
    <BAIClientContext.Provider value={client}>
      {children}
    </BAIClientContext.Provider>
  );
};

export default BAIClientProvider;
