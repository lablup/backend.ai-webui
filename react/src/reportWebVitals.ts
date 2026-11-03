/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { Metric } from 'web-vitals';

declare global {
  interface Window {
    // Read by lab runs (Playwright) to compare load metrics across builds.
    // CLS, INP and LCP arrive only once the page is hidden or, for LCP, on the
    // first trusted input; LCP therefore covers what painted before that input.
    __BAI_WEB_VITALS__?: Metric[];
  }
}

const reportWebVitals = () => {
  window.__BAI_WEB_VITALS__ ??= [];
  const record = (metric: Metric) => {
    // web-vitals mutates and re-reports one object per metric, so keep a copy.
    (window.__BAI_WEB_VITALS__ ??= []).push({ ...metric });
    if (process.env.NODE_ENV === 'development') {
      const value =
        metric.name === 'CLS'
          ? metric.value.toFixed(3)
          : Math.round(metric.value);
      // eslint-disable-next-line no-console
      console.debug(`[web-vitals] ${metric.name} ${value} (${metric.rating})`);
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
