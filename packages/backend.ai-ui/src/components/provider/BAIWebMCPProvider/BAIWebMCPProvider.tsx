import { BAIWebMCPContext } from './context';
import type { WebMCPModelContext } from './types';
import type { ReactNode } from 'react';

export interface BAIWebMCPProviderProps {
  /** Off by default: no tool is registered unless the host turns this on. */
  enabled?: boolean;
  /** Also receives every tool while `enabled`, whether or not the browser exposes WebMCP. */
  pageRegistry?: WebMCPModelContext;
  children?: ReactNode;
}

/**
 * The runtime gate for `useWebMCPTool`. Tools register only when this is
 * `enabled`, with `document.modelContext` when the browser exposes it and
 * with `pageRegistry` when the host passes one.
 */
const BAIWebMCPProvider = ({
  enabled = false,
  pageRegistry,
  children,
}: BAIWebMCPProviderProps) => {
  'use memo';
  return (
    <BAIWebMCPContext.Provider value={{ enabled, pageRegistry }}>
      {children}
    </BAIWebMCPContext.Provider>
  );
};

export default BAIWebMCPProvider;
