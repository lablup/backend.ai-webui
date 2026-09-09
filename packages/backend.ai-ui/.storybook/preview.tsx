import { storybookDarkTheme, storybookLightTheme } from './BackendAITheme';
import { DocsContainer } from './DocsContainer';
import './astryx.css';
import { withGlobalProvider } from './decorators';
import { localeItems } from './localeConfig';
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
        dynamicTitle: true,
      },
    },
    themeStyle: {
      name: 'Theme',
      description:
        'Astryx theme-neutral baseline vs. the Backend.AI brand theme',
      toolbar: {
        icon: 'paintbrush',
        items: [
          { value: 'webui', title: 'Backend.AI (WebUI)' },
          { value: 'astryx', title: 'Astryx (neutral)' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    locale: 'en',
    // The app's theme is the default — the neutral baseline is the
    // "does this component assume the brand?" check, not the norm.
    themeStyle: 'webui',
  },
};

export default preview;
