import type { BAILocale } from '.';
import astryxLocale from './astryx/it.json';
import { withUiCommonMessages } from './uiCommonMessages';

const localeValue: BAILocale = {
  lang: 'it',
  astryxLocale: withUiCommonMessages('it-IT', astryxLocale),
};

export default localeValue;
