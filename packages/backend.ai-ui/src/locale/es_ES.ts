import type { BAILocale } from '.';
import astryxLocale from './astryx/es.json';
import { withUiCommonMessages } from './uiCommonMessages';

const localeValue: BAILocale = {
  lang: 'es',
  astryxLocale: withUiCommonMessages('es-ES', astryxLocale),
};

export default localeValue;
