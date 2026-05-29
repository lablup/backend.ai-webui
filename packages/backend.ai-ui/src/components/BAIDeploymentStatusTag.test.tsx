import {
  DEPLOYMENT_STOPPED_CATEGORY_STATUSES,
  isDeploymentInStoppedCategory,
} from './BAIDeploymentStatusTag';
import { describe, expect, it } from 'vitest';

describe('isDeploymentInStoppedCategory', () => {
  it('returns true for every stopped-category status', () => {
    DEPLOYMENT_STOPPED_CATEGORY_STATUSES.forEach((status) => {
      expect(isDeploymentInStoppedCategory(status)).toBe(true);
    });
  });

  it('returns false for active / non-stopped statuses', () => {
    (
      [
        'HEALTHY',
        'UNHEALTHY',
        'DEGRADED',
        'NOT_CHECKED',
        'DEPLOYING',
        'SCALING',
        'PENDING',
        'READY',
      ] as const
    ).forEach((status) => {
      expect(isDeploymentInStoppedCategory(status)).toBe(false);
    });
  });

  it("returns false for null, undefined, and Relay's '%future added value'", () => {
    expect(isDeploymentInStoppedCategory(null)).toBe(false);
    expect(isDeploymentInStoppedCategory(undefined)).toBe(false);
    expect(isDeploymentInStoppedCategory('%future added value')).toBe(false);
  });
});
