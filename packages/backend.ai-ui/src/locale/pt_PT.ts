import { type BAILocale, loadBAILanguage } from '.';
import astryxLocale from './astryx/pt.json';
import { withUiCommonMessages } from './uiCommonMessages';
import 'dayjs/locale/pt';

// Start BUI's own catalog now rather than when BAIConfigProvider first asks.
loadBAILanguage('pt');

const localeValue: BAILocale = {
  lang: 'pt',
  astryxLocale: withUiCommonMessages('pt-PT', astryxLocale),
};

export default localeValue;
