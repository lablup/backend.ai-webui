import type { BAILocale } from '.';
import astryxLocale from './astryx/fr.json';
import { withUiCommonMessages } from './uiCommonMessages';

const localeValue: BAILocale = {
  lang: 'fr',
  astryxLocale: withUiCommonMessages('fr-FR', astryxLocale),
};

export default localeValue;
