import BAIText from '../src/components/BAIText';
import { i18n } from '../src/locale';
import { getAntdLocale } from './localeConfig';
import { themeConfigs, type ThemeMode, type ThemeStyle } from './themeConfig';
import type { Decorator } from '@storybook/react-vite';
import { ConfigProvider, Skeleton, theme } from 'antd';
import React, { Suspense, useEffect } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';

interface StorybookProviderProps {
  locale: string;
  themeMode: ThemeMode;
  themeStyle: ThemeStyle;
  children: React.ReactNode;
}

const GlobalConfigProvider: React.FC<StorybookProviderProps> = ({
  locale,
  themeMode,
  themeStyle,
  children,
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const antdLocale = getAntdLocale(locale);
  const currentThemeConfig = themeConfigs[themeStyle];

  return (
    <ConfigProvider
      locale={antdLocale}
      theme={{
        ...(themeMode === 'dark'
          ? currentThemeConfig.dark
          : currentThemeConfig.light),
        algorithm:
          themeMode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
      modal={{
        mask: {
          blur: false,
        },
      }}
      drawer={{
        mask: {
          blur: false,
        },
      }}
      tag={{
        variant: 'outlined',
      }}
      form={{
        requiredMark: (label, { required }) => (
          <>
            {label}
            {!required && (
              <BAIText
                type="secondary"
                style={{
                  marginLeft: token.marginXXS,
                  wordBreak: 'keep-all',
                }}
              >
                {`(${t('general.Optional')})`}
              </BAIText>
            )}
          </>
        ),
      }}
    >
      <div style={{ padding: '16px' }}>{children}</div>
    </ConfigProvider>
  );
};

const StorybookProvider: React.FC<StorybookProviderProps> = ({
  locale,
  themeMode,
  themeStyle,
  children,
}) => {
  useEffect(() => {
    i18n.changeLanguage(locale);
  }, [locale]);

  return (
    <Suspense fallback={<Skeleton active />}>
      <I18nextProvider i18n={i18n}>
        <GlobalConfigProvider
          locale={locale}
          themeMode={themeMode}
          themeStyle={themeStyle}
        >
          {children}
        </GlobalConfigProvider>
      </I18nextProvider>
    </Suspense>
  );
};

export const withGlobalProvider: Decorator = (Story, context) => {
  const { locale, themeMode, themeStyle } = context.globals;

  return (
    <StorybookProvider
      locale={locale}
      themeMode={themeMode}
      themeStyle={themeStyle}
    >
      <Story />
    </StorybookProvider>
  );
};
