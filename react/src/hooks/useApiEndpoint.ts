import { useEffect, useState } from 'react';

/**
 * Hook to resolve the Backend.AI API endpoint.
 * Checks sources in order:
 * 1. localStorage (set by LoginView after config parsing)
 * 2. The webui-shell login panel (Lit component)
 * 3. Current window origin as fallback
 */
export const useApiEndpoint = (): string => {
  const [endpoint, setEndpoint] = useState(() => {
    // First, try localStorage (most reliable source after config is loaded)
    const stored = localStorage.getItem('backendaiwebui.api_endpoint');
    if (stored) {
      return stored.replace(/^"+|"+$/g, '');
    }
    return '';
  });

  useEffect(() => {
    if (endpoint) return;

    // Listen for config loaded event to get the endpoint from the shell
    const handleConfigLoaded = () => {
      const webUIShell = document.querySelector('#webui-shell') as any;
      const loginPanel =
        webUIShell?.loginPanel ||
        webUIShell?.shadowRoot?.querySelector('#login-panel');
      const ep = loginPanel?.api_endpoint || '';
      if (ep) {
        setEndpoint(ep);
      }
    };

    // Check if config is already loaded
    handleConfigLoaded();

    document.addEventListener('backend-ai-config-loaded', handleConfigLoaded);
    return () => {
      document.removeEventListener(
        'backend-ai-config-loaded',
        handleConfigLoaded,
      );
    };
  }, [endpoint]);

  return endpoint;
};
