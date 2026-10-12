import type { BAILocale } from '.';
import astryxLocale from './astryx/pt.json';
import { withUiCommonMessages } from './uiCommonMessages';

const localeValue: BAILocale = {
  lang: 'pt',
  astryxLocale: withUiCommonMessages('pt-PT', astryxLocale),
};

export default localeValue;
