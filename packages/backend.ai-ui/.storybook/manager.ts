import { addons } from 'storybook/manager-api';
import BackendAITheme from './BackendAITheme';

addons.setConfig({
  theme: BackendAITheme,
  sidebar: {
    showRoots: true,
  },
});
