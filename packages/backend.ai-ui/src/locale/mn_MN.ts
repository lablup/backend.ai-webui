import type { BAILocale } from '.';
import astryxLocale from './astryx/mn.json';
import { withUiCommonMessages } from './uiCommonMessages';

const localeValue: BAILocale = {
  lang: 'mn',
  astryxLocale: withUiCommonMessages('mn-MN', astryxLocale),
};

export default localeValue;
