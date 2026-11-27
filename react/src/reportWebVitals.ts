/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { Metric } from 'web-vitals';

type WebVitalsSample = Pick<
  Metric,
  'name' | 'value' | 'delta' | 'rating' | 'id'
>;

declare global {
  interface Window {
    // Read by lab runs (Playwright) to compare load metrics across builds.
    // One entry per report with a cumulative `value`: take the last per `id`.
    // CLS and INP report when the page is hidden; LCP at the next idle period
    // after the first trusted input, so it covers what painted before it.
    __BAI_WEB_VITALS__?: WebVitalsSample[];
  }
}

const reportWebVitals = () => {
  const record = ({ name, value, delta, rating, id }: Metric) => {
    // Not `entries`: web-vitals keeps mutating them and they pin DOM nodes.
    (window.__BAI_WEB_VITALS__ ??= []).push({
      name,
      value,
      delta,
      rating,
      id,
    });
    if (process.env.NODE_ENV === 'development') {
      const printed = name === 'CLS' ? value.toFixed(3) : Math.round(value);
      // eslint-disable-next-line no-console
      console.debug(`[web-vitals] ${name} ${printed} (${rating})`);
    }
  };
  import('web-vitals')
    .then(({ onCLS, onFCP, onINP, onLCP, onTTFB }) => {
      onCLS(record);
      onFCP(record);
      onINP(record);
      onLCP(record);
      onTTFB(record);
    })
    .catch((error) => {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.warn('Failed to load web-vitals.', error);
      }
    });
};

export default reportWebVitals;
