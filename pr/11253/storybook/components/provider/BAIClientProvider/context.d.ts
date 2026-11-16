import { BAIClient } from './types';
import * as React from 'react';
export declare const BAIClientContext: React.Context<Promise<BAIClient> | undefined>;
export declare const BAIAnonymousClientContext: React.Context<((api_endpoint: string) => BAIClient) | undefined>;
