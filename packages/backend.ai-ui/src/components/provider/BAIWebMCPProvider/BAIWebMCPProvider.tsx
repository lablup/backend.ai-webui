import { BAIWebMCPContext } from './context';
import type { ReactNode } from 'react';

export interface BAIWebMCPProviderProps {
  /** Off by default: no tool is registered unless the host turns this on. */
  enabled?: boolean;
  children?: ReactNode;
}

/**
 * The runtime gate for `useWebMCPTool`. Tools register only when this is
 * `enabled` AND the browser exposes `document.modelContext`.
 */
const BAIWebMCPProvider = ({
  enabled = false,
  children,
}: BAIWebMCPProviderProps) => {
  'use memo';
  return (
    <BAIWebMCPContext.Provider value={{ enabled }}>
      {children}
    </BAIWebMCPContext.Provider>
  );
};

export default BAIWebMCPProvider;
