export { Client } from './client';
export { ClientConfig } from './client-config';
export type { SessionResources, requestInfo } from './types';
export * from './resources';

// Backward-compatible namespace (global-stores.ts uses ai.backend.Client pattern)
import { Client } from './client';
import { ClientConfig } from './client-config';
const backend = { Client, ClientConfig };
export { backend };
