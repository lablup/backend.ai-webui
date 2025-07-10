import {
  BackendAIProvider, // useBackendAIClient,
  useBackendAITranslation,
  useLocale,
} from '../bai-provider';
import React from 'react';

// Example client for demonstration
const mockClient = {
  request: async (endpoint: string, options?: RequestInit) => {
    // Mock translation service
    if (endpoint === '/i18n/translate') {
      const body = JSON.parse(options?.body as string);
      const { locale, key } = body;

      // Simple mock translation dictionary
      const translations: Record<string, Record<string, string>> = {
        en: {
          'file.open': 'Open',
          'file.save': 'Save',
          'file.delete': 'Delete',
        },
        ko: {
          'file.open': '열기',
          'file.save': '저장',
          'file.delete': '삭제',
        },
        ja: {
          'file.open': '開く',
          'file.save': '保存',
          'file.delete': '削除',
        },
      };

      return translations[locale]?.[key] || key;
    }

    return { success: true };
  },
};

// Example component using the translations
const TranslatedButtons = () => {
  const locale = useLocale();
  const openText = useBackendAITranslation('file.open');
  const saveText = useBackendAITranslation('file.save');
  const deleteText = useBackendAITranslation('file.delete');

  return (
    <div>
      <h3>Current Locale: {locale}</h3>
      <button>{openText}</button>
      <button>{saveText}</button>
      <button>{deleteText}</button>
    </div>
  );
};

// Usage example
export const BackendAILocaleDemo = () => {
  // Get the user's preferred language from browser or system settings
  const userLocale = navigator.language.split('-')[0]; // 'en', 'ko', 'ja', etc.

  return (
    <BackendAIProvider client={mockClient} locale={userLocale}>
      <div>
        <h2>Backend.AI Provider Demo with Locale Support</h2>
        <TranslatedButtons />
      </div>
    </BackendAIProvider>
  );
};

export default BackendAILocaleDemo;
