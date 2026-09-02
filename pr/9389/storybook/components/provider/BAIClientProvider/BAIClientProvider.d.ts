import { BAIClient } from './types';
import { ReactNode } from '../../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export interface BAIClientProviderProps {
    clientPromise: Promise<BAIClient>;
    anonymousClientFactory: (api_endpoint: string) => BAIClient;
    children: ReactNode;
}
declare const BAIClientProvider: React.FC<BAIClientProviderProps>;
export default BAIClientProvider;
