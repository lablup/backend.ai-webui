/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { Metric } from 'web-vitals';

declare global {
  interface Window {
    // Read by lab runs (Playwright) to compare load metrics across builds.
    __BAI_WEB_VITALS__?: Metric[];
  }
}

const reportWebVitals = () => {
  const samples: Metric[] = (window.__BAI_WEB_VITALS__ ??= []);
  const record = (metric: Metric) => {
    samples.push(metric);
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.debug(
        `[web-vitals] ${metric.name} ${Math.round(metric.value)} (${metric.rating})`,
      );
    }
  };
  import('web-vitals').then(({ onCLS, onFCP, onINP, onLCP, onTTFB }) => {
    onCLS(record);
    onFCP(record);
    onINP(record);
    onLCP(record);
    onTTFB(record);
  });
};

export default reportWebVitals;
