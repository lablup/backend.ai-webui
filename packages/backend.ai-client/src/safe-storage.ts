const hasStorage = () => typeof localStorage !== 'undefined';

/** `localStorage` that no-ops where the global is absent (Node, the Electron local proxy). */
export const safeStorage = {
  getItem: (key: string): string | null =>
    hasStorage() ? localStorage.getItem(key) : null,
  setItem: (key: string, value: string): void => {
    if (hasStorage()) localStorage.setItem(key, value);
  },
  removeItem: (key: string): void => {
    if (hasStorage()) localStorage.removeItem(key);
  },
};
