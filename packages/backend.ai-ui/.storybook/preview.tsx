import { withGlobalProvider } from './decorators';
import { localeItems } from './localeConfig';
import type { Preview } from '@storybook/react-vite';

const preview: Preview = {
  tags: ['autodocs'],
  decorators: [withGlobalProvider],
  parameters: {
    docs: {
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
    themeMode: {
      name: 'Theme',
      description: 'Light or dark theme',
      toolbar: {
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
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
    themeMode: 'light',
    themeStyle: 'default',
  },
};

export default preview;
