export const useBackendAIAppLauncher = () => {
  // This is not use any React hooks, so it's not a React hook.
  // But keep it here for the future refactoring.

  // @ts-ignore
  return {
    runTerminal: (sessionId: string) => {
      // @ts-ignore
      globalThis.appLauncher.runTerminal(sessionId);
    },
    showLauncher: (params: {
      'session-uuid'?: string;
      'access-key'?: string;
      'app-services'?: string;
      mode?: string;
      'app-services-option'?: string;
      'service-ports'?: string;
      runtime?: string;
      filename?: string;
      arguments?: object;
    }) => {},
  };
};
