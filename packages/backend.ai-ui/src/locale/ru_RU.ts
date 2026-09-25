import type { BAILocale } from '.';
import astryxLocale from './astryx/ru.json';
import { withUiCommonMessages } from './uiCommonMessages';

const localeValue: BAILocale = {
  lang: 'ru',
  astryxLocale: withUiCommonMessages('ru-RU', astryxLocale),
};

export default localeValue;
