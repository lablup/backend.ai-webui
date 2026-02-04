import { storybookDarkTheme, storybookLightTheme } from './BackendAITheme';
import {
  DocsContainer as BaseContainer,
  type DocsContainerProps,
} from '@storybook/addon-docs/blocks';
import { DARK_MODE_EVENT_NAME } from '@vueless/storybook-dark-mode';
import type { PropsWithChildren } from 'react';
import { useEffect, useState } from 'react';
import { addons } from 'storybook/preview-api';

const channel = addons.getChannel();

const DARK_BG = '#181b1f';
const LIGHT_BG = '#ffffff';

const headingStyles = `
  h1[id] > a[aria-hidden="true"],
  h2[id] > a[aria-hidden="true"],
  h3[id] > a[aria-hidden="true"],
  h4[id] > a[aria-hidden="true"],
  h5[id] > a[aria-hidden="true"],
  h6[id] > a[aria-hidden="true"] {
    position: absolute !important;
    left: -32px !important;
    margin-left: 0 !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
  }
`;

export const DocsContainer = ({
  context,
  children,
}: PropsWithChildren<DocsContainerProps>) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    channel.on(DARK_MODE_EVENT_NAME, setIsDarkMode);
    return () => channel.off(DARK_MODE_EVENT_NAME, setIsDarkMode);
  }, []);

  useEffect(() => {
    document.body.style.backgroundColor = isDarkMode ? DARK_BG : LIGHT_BG;
  }, [isDarkMode]);

  return (
    <BaseContainer
      context={context}
      theme={isDarkMode ? storybookDarkTheme : storybookLightTheme}
    >
      <style>{headingStyles}</style>
      {children}
    </BaseContainer>
  );
};
