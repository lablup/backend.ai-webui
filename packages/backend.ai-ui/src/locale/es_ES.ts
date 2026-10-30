import { type BAILocale, loadBAILanguage } from '.';
import astryxLocale from './astryx/es.json';
import { withUiCommonMessages } from './uiCommonMessages';
import 'dayjs/locale/es';

// Start BUI's own catalog now rather than when BAIConfigProvider first asks.
loadBAILanguage('es');

const localeValue: BAILocale = {
  lang: 'es',
  astryxLocale: withUiCommonMessages('es-ES', astryxLocale),
};

export default localeValue;
