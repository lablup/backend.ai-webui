/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import reportWebVitals from './reportWebVitals';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { onCLS, type Metric } from 'web-vitals';

vi.mock('web-vitals', () => ({
  onCLS: vi.fn(),
  onFCP: vi.fn(),
  onINP: vi.fn(),
  onLCP: vi.fn(),
  onTTFB: vi.fn(),
}));

const startAndGetReporter = async () => {
  reportWebVitals();
  await vi.waitFor(() => expect(onCLS).toHaveBeenCalled());
  return vi.mocked(onCLS).mock.calls[0][0] as (metric: Metric) => void;
};

const cls = (value: number, delta: number) =>
  ({ name: 'CLS', value, delta, rating: 'poor', id: 'v1' }) as Metric;

describe('reportWebVitals', () => {
  beforeEach(() => {
    delete window.__BAI_WEB_VITALS__;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('keeps each report even though the library reuses one metric object', async () => {
    const report = await startAndGetReporter();
    const metric = cls(0.05, 0.05);

    report(metric);
    Object.assign(metric, { value: 0.3, delta: 0.25 });
    report(metric);

    expect(window.__BAI_WEB_VITALS__?.map((m) => m.value)).toEqual([0.05, 0.3]);
  });

  it('keeps collecting after a lab run replaces the global', async () => {
    const report = await startAndGetReporter();

    window.__BAI_WEB_VITALS__ = [];
    report(cls(0.1, 0.1));

    expect(window.__BAI_WEB_VITALS__).toHaveLength(1);
  });

  it('prints CLS as a score in development, not rounded to an integer', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const debug = vi.spyOn(console, 'debug').mockImplementation(() => {});
    const report = await startAndGetReporter();

    report(cls(0.3, 0.3));

    expect(debug).toHaveBeenCalledWith('[web-vitals] CLS 0.300 (poor)');
  });
});
