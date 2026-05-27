/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
// BUI translation JSON bundles. The Vite alias in `react/vite.config.ts`
// rewrites `backend.ai-ui/dist/...` to `packages/backend.ai-ui/src/...`,
// so these resolve to the source JSON files in the BUI package.
import deTrans from 'backend.ai-ui/dist/locale/de.json';
import de_DE from 'backend.ai-ui/dist/locale/de_DE';
import elTrans from 'backend.ai-ui/dist/locale/el.json';
import el_GR from 'backend.ai-ui/dist/locale/el_GR';
import enTrans from 'backend.ai-ui/dist/locale/en.json';
import en_US from 'backend.ai-ui/dist/locale/en_US';
import esTrans from 'backend.ai-ui/dist/locale/es.json';
import es_ES from 'backend.ai-ui/dist/locale/es_ES';
import fiTrans from 'backend.ai-ui/dist/locale/fi.json';
import fi_FI from 'backend.ai-ui/dist/locale/fi_FI';
import frTrans from 'backend.ai-ui/dist/locale/fr.json';
import fr_FR from 'backend.ai-ui/dist/locale/fr_FR';
import idTrans from 'backend.ai-ui/dist/locale/id.json';
import id_ID from 'backend.ai-ui/dist/locale/id_ID';
import itTrans from 'backend.ai-ui/dist/locale/it.json';
import it_IT from 'backend.ai-ui/dist/locale/it_IT';
import jaTrans from 'backend.ai-ui/dist/locale/ja.json';
import ja_JP from 'backend.ai-ui/dist/locale/ja_JP';
import koTrans from 'backend.ai-ui/dist/locale/ko.json';
import ko_KR from 'backend.ai-ui/dist/locale/ko_KR';
import mnTrans from 'backend.ai-ui/dist/locale/mn.json';
import mn_MN from 'backend.ai-ui/dist/locale/mn_MN';
import msTrans from 'backend.ai-ui/dist/locale/ms.json';
import ms_MY from 'backend.ai-ui/dist/locale/ms_MY';
import plTrans from 'backend.ai-ui/dist/locale/pl.json';
import pl_PL from 'backend.ai-ui/dist/locale/pl_PL';
import ptBRTrans from 'backend.ai-ui/dist/locale/pt-BR.json';
import ptTrans from 'backend.ai-ui/dist/locale/pt.json';
import pt_BR from 'backend.ai-ui/dist/locale/pt_BR';
import pt_PT from 'backend.ai-ui/dist/locale/pt_PT';
import ruTrans from 'backend.ai-ui/dist/locale/ru.json';
import ru_RU from 'backend.ai-ui/dist/locale/ru_RU';
import thTrans from 'backend.ai-ui/dist/locale/th.json';
import th_TH from 'backend.ai-ui/dist/locale/th_TH';
import trTrans from 'backend.ai-ui/dist/locale/tr.json';
import tr_TR from 'backend.ai-ui/dist/locale/tr_TR';
import viTrans from 'backend.ai-ui/dist/locale/vi.json';
import vi_VN from 'backend.ai-ui/dist/locale/vi_VN';
import zhCNTrans from 'backend.ai-ui/dist/locale/zh-CN.json';
import zhTWTrans from 'backend.ai-ui/dist/locale/zh-TW.json';
import zh_CN from 'backend.ai-ui/dist/locale/zh_CN';
import zh_TW from 'backend.ai-ui/dist/locale/zh_TW';

// languages which are supported by backend.ai-ui
export const buiLanguages = {
  de: de_DE,
  el: el_GR,
  en: en_US,
  es: es_ES,
  fi: fi_FI,
  fr: fr_FR,
  id: id_ID,
  it: it_IT,
  ja: ja_JP,
  ko: ko_KR,
  mn: mn_MN,
  ms: ms_MY,
  pl: pl_PL,
  'pt-BR': pt_BR,
  pt: pt_PT,
  ru: ru_RU,
  th: th_TH,
  tr: tr_TR,
  vi: vi_VN,
  'zh-CN': zh_CN,
  'zh-TW': zh_TW,
};

// BUI translation bundles keyed by language code, to be registered on the
// host i18n instance under the `backend.ai-ui` namespace. Pair with
// `fallbackNS: 'backend.ai-ui'` (and `nsSeparator: '^'`) on the host i18n
// config so BUI components calling `useTranslation()` resolve their keys
// via fallback against the shared (deduped) react-i18next Context.
export const buiTranslations: Record<string, Record<string, unknown>> = {
  de: deTrans,
  el: elTrans,
  en: enTrans,
  es: esTrans,
  fi: fiTrans,
  fr: frTrans,
  id: idTrans,
  it: itTrans,
  ja: jaTrans,
  ko: koTrans,
  mn: mnTrans,
  ms: msTrans,
  pl: plTrans,
  'pt-BR': ptBRTrans,
  pt: ptTrans,
  ru: ruTrans,
  th: thTrans,
  tr: trTrans,
  vi: viTrans,
  'zh-CN': zhCNTrans,
  'zh-TW': zhTWTrans,
};
