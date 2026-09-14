/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { convertMetricUnit } from './SessionMetricGraph';
import { describe, expect, it } from 'vitest';

// FR-3932: the Avg Used reference line and the plotted series share this
// function, so the cpu_util scale must live here and nowhere else.
describe('convertMetricUnit', () => {
  it('scales cpu_util from tenths of a percent to percent', () => {
    expect(convertMetricUnit('123.4', 'cpu_util')).toEqual({
      number: 12.3,
      numberUnit: '%',
    });
  });

  it('keeps other *_util metrics as plain percent', () => {
    expect(convertMetricUnit('12.34', 'cuda_util')).toEqual({
      number: 12.3,
      numberUnit: '%',
    });
  });

  it('renders a zero cpu_util sample as 0, and a missing one as no value', () => {
    expect(convertMetricUnit('0', 'cpu_util').number).toBe(0);
    expect(convertMetricUnit(undefined, 'cpu_util').number).toBeUndefined();
    expect(convertMetricUnit(null, 'cpu_util').number).toBeUndefined();
  });

  it('returns no number without a metric name', () => {
    expect(convertMetricUnit('10', undefined)).toEqual({
      number: undefined,
      numberUnit: undefined,
    });
  });
});
