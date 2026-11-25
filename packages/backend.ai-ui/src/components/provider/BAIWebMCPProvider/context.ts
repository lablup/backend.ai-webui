import type { WebMCPModelContext } from './types';
import { createContext } from 'react';

export interface BAIWebMCPContextValue {
  /** The host's runtime gate (`[general] enableWebMCP` in the WebUI). */
  enabled: boolean;
  /** A registry in the page that also receives every tool, for an in-app assistant (ADR 0040). */
  pageRegistry?: WebMCPModelContext;
}

export const BAIWebMCPContext = createContext<BAIWebMCPContextValue>({
  enabled: false,
});
