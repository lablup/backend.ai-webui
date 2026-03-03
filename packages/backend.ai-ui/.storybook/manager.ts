import { storybookLightTheme } from './BackendAITheme';
import { addons } from 'storybook/manager-api';

addons.setConfig({
  theme: storybookLightTheme,
  sidebar: {
    showRoots: true,
  },
});
