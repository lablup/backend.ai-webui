import BAIText from '../src/components/BAIText';
import { i18n } from '../src/locale';
import dayjs from 'dayjs';
import 'dayjs/locale/de';
import 'dayjs/locale/el';
import 'dayjs/locale/es';
import 'dayjs/locale/fi';
import 'dayjs/locale/fr';
import 'dayjs/locale/id';
import 'dayjs/locale/it';
import 'dayjs/locale/ja';
import 'dayjs/locale/ko';
import 'dayjs/locale/mn';
import 'dayjs/locale/ms';
import 'dayjs/locale/pl';
import 'dayjs/locale/pt';
import 'dayjs/locale/pt-br';
import 'dayjs/locale/ru';
import 'dayjs/locale/th';
import 'dayjs/locale/tr';
import 'dayjs/locale/vi';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/zh-tw';
import duration from 'dayjs/plugin/duration';
import localeData from 'dayjs/plugin/localeData';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import weekday from 'dayjs/plugin/weekday';

dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(duration);
import { getAntdLocale } from './localeConfig';
import { themeConfigs, type ThemeStyle } from './themeConfig';
import type { Decorator } from '@storybook/react-vite';
import { useDarkMode } from '@vueless/storybook-dark-mode';
import { ConfigProvider, Skeleton, theme } from 'antd';
import React, { Suspense, useEffect } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';

interface StorybookProviderProps {
  locale: string;
  themeStyle: ThemeStyle;
  isDarkMode: boolean;
  children: React.ReactNode;
}

const ThemedContainer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { token } = theme.useToken();

  useEffect(() => {
    document.body.style.backgroundColor = token.colorBgLayout;
    document.body.style.color = token.colorText;
  }, [token.colorBgLayout, token.colorText]);

  return <>{children}</>;
};

const GlobalConfigProvider: React.FC<StorybookProviderProps> = ({
  locale,
  themeStyle,
  isDarkMode,
  children,
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const antdLocale = getAntdLocale(locale);
  const currentThemeConfig = themeConfigs[themeStyle];
  const isWebUIStyle = themeStyle === 'webui';

  return (
    <ConfigProvider
      locale={antdLocale}
      theme={{
        ...(isDarkMode ? currentThemeConfig.dark : currentThemeConfig.light),
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
      {...(isWebUIStyle && {
        modal: {
          mask: { blur: false },
        },
        drawer: {
          mask: { blur: false },
        },
        tag: {
          variant: 'outlined',
        },
        form: {
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
        },
      })}
    >
      <ThemedContainer>{children}</ThemedContainer>
    </ConfigProvider>
  );
};

const StorybookProvider: React.FC<StorybookProviderProps> = ({
  locale,
  themeStyle,
  isDarkMode,
  children,
}) => {
  useEffect(() => {
    i18n.changeLanguage(locale);
    dayjs.locale(locale);
  }, [locale]);

  return (
    <Suspense fallback={<Skeleton active />}>
      <I18nextProvider i18n={i18n}>
        <GlobalConfigProvider
          locale={locale}
          themeStyle={themeStyle}
          isDarkMode={isDarkMode}
        >
          {children}
        </GlobalConfigProvider>
      </I18nextProvider>
    </Suspense>
  );
};

export const withGlobalProvider: Decorator = (Story, context) => {
  const { locale, themeStyle } = context.globals;
  const isDarkMode = useDarkMode();

  return (
    <StorybookProvider
      locale={locale}
      themeStyle={themeStyle}
      isDarkMode={isDarkMode}
    >
      <Story />
    </StorybookProvider>
  );
};
