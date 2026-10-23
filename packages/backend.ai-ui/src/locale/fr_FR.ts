import { type BAILocale, loadBAILanguage } from '.';
import astryxLocale from './astryx/fr.json';
import { withUiCommonMessages } from './uiCommonMessages';
import 'dayjs/locale/fr';

// Start BUI's own catalog now rather than when BAIConfigProvider first asks.
loadBAILanguage('fr');

const localeValue: BAILocale = {
  lang: 'fr',
  astryxLocale: withUiCommonMessages('fr-FR', astryxLocale),
};

export default localeValue;
