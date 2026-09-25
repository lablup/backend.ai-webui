import { createContext } from 'react';

export interface BAIWebMCPContextValue {
  /** The host's runtime gate (`[general] enableWebMCP` in the WebUI). */
  enabled: boolean;
}

export const BAIWebMCPContext = createContext<BAIWebMCPContextValue>({
  enabled: false,
});
