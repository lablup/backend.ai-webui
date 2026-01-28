import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    {
      titlePrefix: 'Docs Overview',
      directory: '../src',
      files: 'Introduction.mdx',
    },
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-onboarding',
    '@vueless/storybook-dark-mode',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    defaultName: 'Documentation',
  },
  typescript: {
    reactDocgen: false,
  },
  staticDirs: ['./public'],
};
export default config;
