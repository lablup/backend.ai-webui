import type { BAILocale } from '.';
import astryxLocale from './astryx/pt-BR.json';
import { withUiCommonMessages } from './uiCommonMessages';

const localeValue: BAILocale = {
  lang: 'pt-BR',
  astryxLocale: withUiCommonMessages('pt-BR', astryxLocale),
};

export default localeValue;
