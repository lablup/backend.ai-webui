import type { BAILocale } from '.';
import astryxLocale from './astryx/th.json';
import { withUiCommonMessages } from './uiCommonMessages';

const localeValue: BAILocale = {
  lang: 'th',
  astryxLocale: withUiCommonMessages('th-TH', astryxLocale),
};

export default localeValue;
