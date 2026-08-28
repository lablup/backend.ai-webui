import { BAIAppProvider } from '../src/app-shim';
import BAIText from '../src/components/BAIText';
import BAIConfigProvider from '../src/components/provider/BAIConfigProvider/BAIConfigProvider';
import { FormConfigProvider } from '../src/form-engine/FormConfigProvider';
import { i18n } from '../src/locale';
import { ThemeShimProvider } from '../src/theme-shim';
import { themeStyleConfigs, type ThemeStyle } from './themeConfig';
import { Skeleton } from '@astryxdesign/core/Skeleton';
import { Theme as AstryxThemeProvider } from '@astryxdesign/core/theme';
import type { Decorator } from '@storybook/react-vite';
import { useDarkMode } from '@vueless/storybook-dark-mode';
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
import React, { Suspense, useEffect } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';

dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(duration);

interface StorybookProviderProps {
  locale: string;
  themeStyle: ThemeStyle;
  isDarkMode: boolean;
  children: React.ReactNode;
}

const GlobalConfigProvider: React.FC<StorybookProviderProps> = ({
  locale,
  themeStyle,
  isDarkMode,
  children,
}) => {
  const { t } = useTranslation();
  const { astryxTheme, seeds } = themeStyleConfigs[themeStyle];
  const isWebUIStyle = themeStyle === 'webui';
  const mode = isDarkMode ? 'dark' : 'light';

  return (
    // Same provider pair as the app's `DefaultProviders`: the Astryx
    // `<Theme>` for Astryx-native components, the shim for the legacy
    // token-consuming BUI surfaces. Both follow the "Theme Style" toolbar.
    <AstryxThemeProvider theme={astryxTheme} mode={mode}>
      <ThemeShimProvider mode={mode} seeds={seeds[mode]}>
        <BAIConfigProvider locale={{ lang: locale }}>
          {/* Backend.AI product behaviour (`DefaultProviders.tsx`), not an
              engine default — so only under the WebUI style. */}
          <FormConfigProvider
            {...(isWebUIStyle && {
              requiredMark: (label, { required }) => (
                <>
                  {label}
                  {!required && (
                    <BAIText
                      type="secondary"
                      style={{
                        marginLeft: 'var(--spacing-1)',
                        wordBreak: 'keep-all',
                      }}
                    >
                      {`(${t('general.Optional')})`}
                    </BAIText>
                  )}
                </>
              ),
            })}
          >
            <BAIAppProvider>{children}</BAIAppProvider>
          </FormConfigProvider>
        </BAIConfigProvider>
      </ThemeShimProvider>
    </AstryxThemeProvider>
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
    <Suspense fallback={<Skeleton />}>
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

const WithGlobalProvider: React.FC<{
  Story: React.ComponentType;
  context: Parameters<Decorator>[1];
}> = ({ Story, context }) => {
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

export const withGlobalProvider: Decorator = (Story, context) => (
  <WithGlobalProvider Story={Story} context={context} />
);
