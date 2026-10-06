import type { BAILocale } from '.';
import astryxLocale from './astryx/vi.json';
import { withUiCommonMessages } from './uiCommonMessages';

const localeValue: BAILocale = {
  lang: 'vi',
  astryxLocale: withUiCommonMessages('vi-VN', astryxLocale),
};

export default localeValue;
