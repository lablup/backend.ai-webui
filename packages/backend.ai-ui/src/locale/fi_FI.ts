import type { BAILocale } from '.';
import astryxLocale from './astryx/fi.json';
import { withUiCommonMessages } from './uiCommonMessages';

const localeValue: BAILocale = {
  lang: 'fi',
  astryxLocale: withUiCommonMessages('fi-FI', astryxLocale),
};

export default localeValue;
