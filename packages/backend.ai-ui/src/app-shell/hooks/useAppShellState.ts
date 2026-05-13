import { createContext, useContext } from 'react';

export interface AppShellStateValue {
  collapsed: boolean;
  toggleCollapsed: () => void;
}

export const AppShellStateContext = createContext<AppShellStateValue | null>(
  null,
);

export function useAppShellState(): AppShellStateValue {
  const ctx = useContext(AppShellStateContext);
  if (!ctx) {
    throw new Error('useAppShellState must be used inside <AppShell>');
  }
  return ctx;
}
