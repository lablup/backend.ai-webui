import { type BAILocale, loadBAILanguage } from '.';
import astryxLocale from './astryx/ru.json';
import { withUiCommonMessages } from './uiCommonMessages';
import 'dayjs/locale/ru';

// Start BUI's own catalog now rather than when BAIConfigProvider first asks.
loadBAILanguage('ru');

const localeValue: BAILocale = {
  lang: 'ru',
  astryxLocale: withUiCommonMessages('ru-RU', astryxLocale),
};

export default localeValue;
