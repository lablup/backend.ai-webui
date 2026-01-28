import { withGlobalProvider } from './decorators';
import { DocsContainer } from './DocsContainer';
import { localeItems } from './localeConfig';
import { storybookDarkTheme, storybookLightTheme } from './BackendAITheme';
import type { Preview } from '@storybook/react-vite';

const preview: Preview = {
  tags: ['autodocs'],
  decorators: [withGlobalProvider],
  parameters: {
    darkMode: {
      dark: storybookDarkTheme,
      light: storybookLightTheme,
      current: 'light',
      stylePreview: true,
    },
    docs: {
      container: DocsContainer,
      extractComponentDescription: (_component: any, { notes }: any) => {
        return notes?.markdown || notes?.text || null;
      },
    },
    layout: 'padded',
  },
  globalTypes: {
    locale: {
      name: 'Locale',
      description: 'Internationalization locale',
      toolbar: {
        icon: 'globe',
        items: localeItems,
        showName: true,
        dynamicTitle: true,
      },
    },
    themeStyle: {
      name: 'Theme Style',
      description: 'Theme style preset',
      toolbar: {
        icon: 'paintbrush',
        items: [
          { value: 'default', title: 'Default (Ant Design)' },
          { value: 'webui', title: 'WebUI (Backend.AI)' },
        ],
        showName: true,
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    locale: 'en',
    themeStyle: 'default',
  },
};

export default preview;
