import { type BAILocale, loadBAILanguage } from '.';
import astryxLocale from './astryx/vi.json';
import { withUiCommonMessages } from './uiCommonMessages';
import 'dayjs/locale/vi';

// Start BUI's own catalog now rather than when BAIConfigProvider first asks.
loadBAILanguage('vi');

const localeValue: BAILocale = {
  lang: 'vi',
  astryxLocale: withUiCommonMessages('vi-VN', astryxLocale),
};

export default localeValue;
