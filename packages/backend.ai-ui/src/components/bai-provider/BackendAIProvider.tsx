import type { BackendAIClient } from './types';
import React, {
  createContext,
  useContext,
  ReactNode,
  use,
  cache,
  useMemo,
} from 'react';

// Create contexts for the Backend AI Client and locale
// Using Symbol for better encapsulation in React 19
// const BackendAIClientContextSymbol = Symbol('BackendAIClient');
const BackendAIClientContext = createContext<BackendAIClient | null>(null);
BackendAIClientContext.displayName = 'BackendAIClientContext';

// const LocaleContextSymbol = Symbol('Locale');
const LocaleContext = createContext<string>('en');
LocaleContext.displayName = 'LocaleContext';

// Provider Props
interface BackendAIProviderProps {
  client: BackendAIClient;
  locale?: string;
  children: ReactNode;
}

// Cache client operations for performance
const cachedClientOperation = cache(
  (client: BackendAIClient, endpoint: string, options?: RequestInit) => {
    return client.request(endpoint, options);
  },
);

// Provider Component
export const BackendAIProvider = ({
  client,
  locale = 'en',
  children,
}: BackendAIProviderProps) => {
  // Use React 19's improved memoization
  const clientValue = useMemo(() => {
    return client;
  }, [client]);

  // Memoize locale value
  const localeValue = useMemo(() => {
    return locale;
  }, [locale]);

  return (
    <LocaleContext.Provider value={localeValue}>
      <BackendAIClientContext.Provider value={clientValue}>
        {children}
      </BackendAIClientContext.Provider>
    </LocaleContext.Provider>
  );
};

// Custom Hook to use the Backend AI Client
export const useBackendAIClient = (): BackendAIClient => {
  // In React 19, we can use the use() hook as a more concise alternative to useContext
  // but we keep useContext for backward compatibility
  try {
    const context = useContext(BackendAIClientContext);
    if (!context) {
      throw new Error(
        'useBackendAIClient must be used within a BackendAIProvider',
      );
    }
    return context;
  } catch (error) {
    console.error('Error using BackendAI Client:', error);
    throw error;
  }
};

// Custom hook to use the locale
export const useLocale = (): string => {
  try {
    const locale = useContext(LocaleContext);
    return locale;
  } catch (error) {
    console.error('Error using Locale:', error);
    return 'en'; // Default to English if there's an error
  }
};

// Helper function for making optimized client requests using React 19 features
export const useBackendAIRequest = <T,>(
  endpoint: string,
  options?: RequestInit,
): T => {
  const client = useBackendAIClient();
  // Using the use() hook from React 19 to handle promises directly in component
  return use(client.request(endpoint, options) as Promise<T>);
};

// Helper hook for translating strings based on current locale
export const useBackendAITranslation = (
  key: string,
  namespace?: string,
  fallback?: string,
): string => {
  const locale = useLocale();
  const client = useBackendAIClient();

  // Create a cache key for the translation request
  // const cacheKey = `${locale}:${namespace || 'common'}:${key}`;

  try {
    // Use React 19's cache for optimized translations
    return (
      use(
        cachedClientOperation(client, `/i18n/translate`, {
          method: 'POST',
          body: JSON.stringify({
            locale,
            key,
            namespace,
          }),
        }) as Promise<string>,
      ) ||
      fallback ||
      key
    );
  } catch (error) {
    console.error('Translation error:', error);
    return fallback || key;
  }
};
