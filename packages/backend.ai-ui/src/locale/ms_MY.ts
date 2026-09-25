import type { BAILocale } from '.';
import astryxLocale from './astryx/ms.json';
import { withUiCommonMessages } from './uiCommonMessages';

const localeValue: BAILocale = {
  lang: 'ms',
  astryxLocale: withUiCommonMessages('ms-MY', astryxLocale),
};

export default localeValue;
