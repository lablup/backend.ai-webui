import { BackendAIProvider } from 'backend.ai-ui';
import type { BackendAIClient } from 'backend.ai-ui';
import React, { useState } from 'react';

// Sample implementation for host app (/react)
// This shows how to use the BackendAIProvider to provide the client and locale to components

// Example client initialization function
const initializeBackendAIClient = (): BackendAIClient => {
  // In a real app, this would create and configure the actual client
  return {
    request: async (endpoint, options) => {
      console.log(`Request to ${endpoint}`, options);
      // Real implementation would connect to Backend.AI server
      return { success: true };
    },
    // Other client methods would be implemented here
  };
};

// Example host app
const HostApplication = () => {
  const [client] = useState(() => initializeBackendAIClient());
  const [locale, setLocale] = useState('en');

  // Handler to change the locale
  const handleLocaleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocale(e.target.value);
  };

  return (
    <BackendAIProvider client={client} locale={locale}>
      <div>
        <h1>Host Application</h1>

        <div>
          <label htmlFor="locale-select">Select Language: </label>
          <select
            id="locale-select"
            value={locale}
            onChange={handleLocaleChange}
          >
            <option value="en">English</option>
            <option value="ko">Korean</option>
            <option value="ja">Japanese</option>
          </select>
        </div>

        {/* Child components would be rendered here and would have access to 
            the client and locale via the hooks */}
        <ChildComponent />
      </div>
    </BackendAIProvider>
  );
};

// Example child component using the hooks
const ChildComponent = () => {
  // These imports would come from 'backend.ai-ui' in a real app
  // import { useBackendAIClient, useLocale, useBackendAITranslation } from 'backend.ai-ui';

  // For this example, we'll pretend these are correctly imported
  const client = {}; // useBackendAIClient();
  const locale = 'en'; // useLocale();

  return (
    <div>
      <h2>Child Component</h2>
      <p>Current Locale: {locale}</p>
      <p>Client is available: {client ? 'Yes' : 'No'}</p>

      {/* In a real component, you would use translations like this: */}
      {/* <button>{useBackendAITranslation('actions.save')}</button> */}
    </div>
  );
};

export default HostApplication;
