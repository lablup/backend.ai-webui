import { type BAILocale, loadBAILanguage } from '.';
import astryxLocale from './astryx/id.json';
import { withUiCommonMessages } from './uiCommonMessages';
import 'dayjs/locale/id';

// Start BUI's own catalog now rather than when BAIConfigProvider first asks.
loadBAILanguage('id');

const localeValue: BAILocale = {
  lang: 'id',
  astryxLocale: withUiCommonMessages('id-ID', astryxLocale),
};

export default localeValue;
