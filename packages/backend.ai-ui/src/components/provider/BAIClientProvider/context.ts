import type { BAIClient } from './types';
import * as React from 'react';

export const BAIClientContext = React.createContext<
  Promise<BAIClient> | undefined
>(undefined);
export const BAIAnonymousClientContext = React.createContext<
  ((api_endpoint: string) => BAIClient) | undefined
>(undefined);
