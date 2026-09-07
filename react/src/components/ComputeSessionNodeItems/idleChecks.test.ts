import {
  getIdleChecksTagColor,
  getOverallReclamation,
  getUtilizationCheckerColor,
  type IdleCheckItem,
} from './idleChecks';
import { describe, expect, it } from 'vitest';

const utilizationCheck = (
  resources: Record<string, number[]>,
  thresholds_check_operator: 'and' | 'or',
  remaining: number | null,
): IdleCheckItem =>
  ({
    extra: { resources, thresholds_check_operator },
    remaining,
    remaining_time_type: 'expire_after',
  }) as IdleCheckItem;

describe('getUtilizationCheckerColor', () => {
  it.each([
    [[5, 10], 'red', 20],
    [[19.9, 10], 'red', 20],
    [[20, 10], 'orange', 100],
    [[99.9, 10], 'orange', 100],
    [[100, 10], 'green', 100],
  ])('classifies %j as %s', ([utilization, threshold], color, boundary) => {
    expect(getUtilizationCheckerColor([utilization, threshold])).toEqual({
      color,
      boundary,
    });
  });
});

describe('getOverallReclamation', () => {
  const resources = {
    cpu_util: [5, 10], // red
    mem: [30, 10], // orange
    cuda_util: [100, 10], // green
  };

  it('takes the most severe color when any resource triggers reclamation', () => {
    expect(getOverallReclamation(resources, 'or')?.color).toBe('red');
  });

  it('takes the least severe color when all resources must trigger reclamation', () => {
    expect(getOverallReclamation(resources, 'and')?.color).toBe('green');
  });

  it('ignores resources with no measurement yet', () => {
    expect(
      getOverallReclamation({ cpu_util: [-1, 10], mem: [30, 10] }, 'or')?.color,
    ).toBe('orange');
  });

  it('returns undefined when nothing has been measured', () => {
    expect(getOverallReclamation({ cpu_util: [-1, 10] }, 'or')).toBeUndefined();
    expect(getOverallReclamation({}, 'and')).toBeUndefined();
  });
});

describe('getIdleChecksTagColor', () => {
  const remainingCheck = (remaining: number | null): IdleCheckItem => ({
    extra: null,
    remaining,
    remaining_time_type: 'expire_after',
  });

  it.each([
    [null, 'red'],
    [60, 'red'],
    [3600 * 2, 'orange'],
    [3600 * 5, 'green'],
  ])('maps %j seconds remaining to %s', (remaining, expected) => {
    expect(getIdleChecksTagColor(remainingCheck(remaining), 'remaining')).toBe(
      expected,
    );
  });

  it('mirrors the overall reclamation color once the grace period is close', () => {
    expect(
      getIdleChecksTagColor(
        utilizationCheck({ cpu_util: [5, 10] }, 'or', 3600),
        'utilization',
      ),
    ).toBe('red');
  });

  it('stays uncolored while the utilization check is still far from expiring', () => {
    expect(
      getIdleChecksTagColor(
        utilizationCheck({ cpu_util: [5, 10] }, 'or', 3600 * 5),
        'utilization',
      ),
    ).toBeUndefined();
  });
});
