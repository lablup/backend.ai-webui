import { type BAILocale, loadBAILanguage } from '.';
import astryxLocale from './astryx/pt-BR.json';
import { withUiCommonMessages } from './uiCommonMessages';
import 'dayjs/locale/pt-br';

// Start BUI's own catalog now rather than when BAIConfigProvider first asks.
loadBAILanguage('pt-BR');

const localeValue: BAILocale = {
  lang: 'pt-BR',
  astryxLocale: withUiCommonMessages('pt-BR', astryxLocale),
};

export default localeValue;
