/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useWebUILocation, useWebUINavigate } from './index';
import * as _ from 'lodash-es';
import { useEffect, useEffectEvent } from 'react';
import { useTranslation } from 'react-i18next';

/** Deep-link param the global search palette sets for a `settingItem` hit. */
export const SETTING_ARRIVAL_PARAM = 'setting';

/** Long enough to catch the eye after the scroll settles, short enough not to linger. */
export const SETTING_ARRIVAL_HIGHLIGHT_MS = 1500;

/**
 * Arrival half of the `?setting=<i18nTitleKey>` contract: resolves the key to
 * the item title in the current locale and returns it while the item should be
 * highlighted. The param IS the highlight — stripping it after the transient
 * window both ends the highlight and stops a reload being a second arrival, so
 * no state mirrors the URL. Returns `null` until the item is on screen: a
 * `?tab=…&setting=…` link only matches once the tab carrying it has rendered.
 */
export const useSettingArrival = (
  titles: ReadonlyArray<string>,
): string | null => {
  'use memo';

  const { t } = useTranslation();
  const location = useWebUILocation();
  const navigate = useWebUINavigate();

  const settingKey = new URLSearchParams(location.search).get(
    SETTING_ARRIVAL_PARAM,
  );
  // `postProcess: []` bypasses the dev-only `copyableI18nKey` processor, which
  // returns JSX; an unknown key resolves to itself and simply never matches.
  const requestedTitle = settingKey
    ? t(settingKey, { postProcess: [] })
    : undefined;
  const arrivalTitle =
    _.isString(requestedTitle) && _.includes(titles, requestedTitle)
      ? requestedTitle
      : null;

  const stripArrivalParam = useEffectEvent(() => {
    const search = new URLSearchParams(location.search);
    search.delete(SETTING_ARRIVAL_PARAM);
    navigate(
      { pathname: location.pathname, search: search.toString() },
      { replace: true },
    );
  });

  useEffect(() => {
    if (!arrivalTitle) return;
    const timer = setTimeout(stripArrivalParam, SETTING_ARRIVAL_HIGHLIGHT_MS);
    return () => clearTimeout(timer);
  }, [arrivalTitle]);

  return arrivalTitle;
};
