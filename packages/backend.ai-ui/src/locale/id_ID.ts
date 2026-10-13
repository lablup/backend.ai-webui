import type { BAILocale } from '.';
import astryxLocale from './astryx/id.json';
import { withUiCommonMessages } from './uiCommonMessages';

const localeValue: BAILocale = {
  lang: 'id',
  astryxLocale: withUiCommonMessages('id-ID', astryxLocale),
};

export default localeValue;
