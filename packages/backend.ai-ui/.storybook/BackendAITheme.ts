import { create } from 'storybook/theming/create';

// Storybook UI theme configs
const commonStorybookTheme = {
  // Branding
  brandTitle: 'Backend.AI UI',
  brandUrl: 'https://ui.backend.ai',
  brandTarget: '_self' as const,

  // Typography
  fontBase: "'Inter', 'Helvetica Neue', Arial, 'Noto Sans', sans-serif",
  fontCode: "'Roboto Mono', 'SF Mono', 'Fira Code', Consolas, monospace",

  // Border radius
  appBorderRadius: 4,
  inputBorderRadius: 4,
};

export const storybookLightTheme = create({
  base: 'light',
  ...commonStorybookTheme,
  brandImage: '/backend.ai-logo-dark.svg',

  // Primary colors
  colorPrimary: '#FF7A00',
  colorSecondary: '#DC6B03',

  // App UI
  appBg: '#f5f5f5',
  appContentBg: '#ffffff',
  appPreviewBg: '#ffffff',
  appBorderColor: '#e0e0e0',

  // Text colors
  textColor: '#141414',
  textInverseColor: '#ffffff',
  textMutedColor: '#666666',

  // Toolbar & tabs
  barBg: '#ffffff',
  barTextColor: '#666666',
  barSelectedColor: '#FF7A00',
  barHoverColor: '#FF7A00',

  // Form inputs
  inputBg: '#ffffff',
  inputBorder: '#d9d9d9',
  inputTextColor: '#141414',
});

export const storybookDarkTheme = create({
  base: 'dark',
  ...commonStorybookTheme,
  brandImage: '/backend.ai-logo.svg',

  // Primary colors
  colorPrimary: '#FF9D00',
  colorSecondary: '#DC6B03',

  // App UI (softer dark colors inspired by Grafana)
  appBg: '#111217',
  appContentBg: '#181b1f',
  appPreviewBg: '#181b1f',
  appBorderColor: '#2c2f36',

  // Text colors
  textColor: '#e0e0e0',
  textInverseColor: '#111217',
  textMutedColor: '#9b9b9b',

  // Toolbar & tabs
  barBg: '#1f2229',
  barTextColor: '#9b9b9b',
  barSelectedColor: '#FF9D00',
  barHoverColor: '#FF9D00',

  // Form inputs
  inputBg: '#1f2229',
  inputBorder: '#3d424d',
  inputTextColor: '#e0e0e0',
});
