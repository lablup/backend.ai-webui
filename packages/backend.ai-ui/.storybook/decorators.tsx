import { BAIAppProvider } from '../src/app-shim';
import BAIText from '../src/components/BAIText';
import BAIConfigProvider from '../src/components/provider/BAIConfigProvider/BAIConfigProvider';
import { FormConfigProvider } from '../src/form-engine/FormConfigProvider';
import { i18n } from '../src/locale';
import { themePresets, type ThemeStyle } from './themeConfig';
import {
  Theme as AstryxThemeProvider,
  useTheme,
} from '@astryxdesign/core/theme';
import type { Decorator } from '@storybook/react-vite';
import { useDarkMode } from '@vueless/storybook-dark-mode';
import { Skeleton } from '@astryxdesign/core/Skeleton';
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

const ThemedContainer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { token } = useTheme();
  const bodyBg = token('--color-background-body');
  const bodyColor = token('--color-text-primary');
  const bodyFont = token('--font-family-body');

  useEffect(() => {
    document.body.style.backgroundColor = bodyBg;
    document.body.style.color = bodyColor;
    document.body.style.fontFamily = bodyFont;
  }, [bodyBg, bodyColor, bodyFont]);

  return <>{children}</>;
};

const GlobalConfigProvider: React.FC<StorybookProviderProps> = ({
  locale,
  themeStyle,
  isDarkMode,
  children,
}) => {
  const { t } = useTranslation();
  const { token } = useTheme();
  const preset = themePresets[themeStyle];
  const isWebUIStyle = themeStyle === 'webui';

  return (
    // The "Theme" toolbar picks the Astryx `<Theme>` every component reads
    // (FR-3819): the Backend.AI brand, or Astryx's neutral baseline.
    <AstryxThemeProvider
      theme={preset.theme}
      mode={isDarkMode ? 'dark' : 'light'}
    >
      {/* BAIConfigProvider carries only the locale — it drives BUI's i18next,
          dayjs and Astryx's resolver from one `lang`, so Astryx chrome strings
          and plurals follow the story's locale instead of the 'en' default. */}
        <BAIConfigProvider locale={{ lang: locale }}>
          {/* The `form.requiredMark` inversion — no asterisk on required
              fields, "(Optional)" appended to the rest — moved off
              `ConfigProvider form={{…}}` onto the self-hosted engine's own
              provider (tickets 34 + 35), mirroring what
              `react/src/components/DefaultProviders.tsx` does in the app.
              Still gated on the WebUI theme style, since it is Backend.AI
              product behaviour rather than an engine default. */}
          <FormConfigProvider
            {...(isWebUIStyle && {
              requiredMark: (label, { required }) => (
                <>
                  {label}
                  {!required && (
                    <BAIText
                      type="secondary"
                      style={{
                        marginLeft: token('--spacing-1'),
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
            {/* App.useApp shim (ticket 11): stories exercising imperative
                message/modal flows read the shim's toast/dialog host from here
                (replaces the per-story antd <App> wrappers). */}
            <BAIAppProvider>
              <ThemedContainer>{children}</ThemedContainer>
            </BAIAppProvider>
          </FormConfigProvider>
        </BAIConfigProvider>
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
