import { i18n } from '../src/locale';
import type { Preview } from '@storybook/react-vite';
import { ConfigProvider, Skeleton } from 'antd';
import type { Locale } from 'antd/es/locale';
import deDE from 'antd/locale/de_DE';
import elGR from 'antd/locale/el_GR';
import enUS from 'antd/locale/en_US';
import esES from 'antd/locale/es_ES';
import fiFI from 'antd/locale/fi_FI';
import frFR from 'antd/locale/fr_FR';
import idID from 'antd/locale/id_ID';
import itIT from 'antd/locale/it_IT';
import jaJP from 'antd/locale/ja_JP';
import koKR from 'antd/locale/ko_KR';
import mnMN from 'antd/locale/mn_MN';
import msMY from 'antd/locale/ms_MY';
import plPL from 'antd/locale/pl_PL';
import ptBR from 'antd/locale/pt_BR';
import ptPT from 'antd/locale/pt_PT';
import ruRU from 'antd/locale/ru_RU';
import thTH from 'antd/locale/th_TH';
import trTR from 'antd/locale/tr_TR';
import viVN from 'antd/locale/vi_VN';
import zhCN from 'antd/locale/zh_CN';
import zhTW from 'antd/locale/zh_TW';
import React, { Suspense, useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';

const antdLocaleMap: Record<string, Locale> = {
  en: enUS,
  ko: koKR,
  ja: jaJP,
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  de: deDE,
  fr: frFR,
  es: esES,
  pt: ptPT,
  'pt-BR': ptBR,
  it: itIT,
  ru: ruRU,
  pl: plPL,
  el: elGR,
  fi: fiFI,
  tr: trTR,
  th: thTH,
  vi: viVN,
  id: idID,
  ms: msMY,
  mn: mnMN,
};

const getAntdLocale = (locale: string): Locale => antdLocaleMap[locale] ?? enUS;

interface LocaleProviderProps {
  locale: string;
  children: React.ReactNode;
}

const LocaleProvider: React.FC<LocaleProviderProps> = ({
  locale,
  children,
}) => {
  useEffect(() => {
    i18n.changeLanguage(locale);
  }, [locale]);

  const antdLocale = getAntdLocale(locale);
  return (
    <Suspense fallback={<Skeleton active />}>
      <I18nextProvider i18n={i18n}>
        <ConfigProvider locale={antdLocale}>
          <div style={{ padding: '16px' }}>{children}</div>
        </ConfigProvider>
      </I18nextProvider>
    </Suspense>
  );
};

const preview: Preview = {
  tags: ['autodocs'],
  decorators: [
    (Story, context) => {
      const { locale } = context.globals;

      return (
        <LocaleProvider locale={locale}>
          <Story />
        </LocaleProvider>
      );
    },
  ],
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
        items: [
          { value: 'en', title: 'English' },
          { value: 'ko', title: '한국어' },
          { value: 'ja', title: '日本語' },
          { value: 'zh-CN', title: '简体中文' },
          { value: 'zh-TW', title: '繁體中文' },
          { value: 'de', title: 'Deutsch' },
          { value: 'fr', title: 'Français' },
          { value: 'es', title: 'Español' },
          { value: 'pt', title: 'Português' },
          { value: 'pt-BR', title: 'Português (Brasil)' },
          { value: 'it', title: 'Italiano' },
          { value: 'ru', title: 'Русский' },
          { value: 'pl', title: 'Polski' },
          { value: 'el', title: 'Ελληνικά' },
          { value: 'fi', title: 'Suomi' },
          { value: 'tr', title: 'Türkçe' },
          { value: 'th', title: 'ไทย' },
          { value: 'vi', title: 'Tiếng Việt' },
          { value: 'id', title: 'Indonesia' },
          { value: 'ms', title: 'Melayu' },
          { value: 'mn', title: 'Монгол' },
        ],
        showName: true,
      },
    },
  },
  initialGlobals: {
    locale: 'en',
  },
};

export default preview;
