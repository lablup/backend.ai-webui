import type { BAILocale } from '.';
import astryxLocale from './astryx/pl.json';
import { withUiCommonMessages } from './uiCommonMessages';

const localeValue: BAILocale = {
  lang: 'pl',
  astryxLocale: withUiCommonMessages('pl-PL', astryxLocale),
};

export default localeValue;
