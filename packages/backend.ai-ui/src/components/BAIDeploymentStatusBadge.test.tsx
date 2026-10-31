import BAIDeploymentStatusBadge, {
  DEPLOYMENT_IN_PROGRESS_STATUSES,
  DEPLOYMENT_STOPPED_CATEGORY_STATUSES,
  getDeploymentPauseCause,
  isDeploymentInProgress,
  isDeploymentInStoppedCategory,
} from './BAIDeploymentStatusBadge';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('BAIDeploymentStatusBadge', () => {
  it.each([
    ['HEALTHY', 'success'],
    ['DEPLOYING', 'info'],
    ['DEGRADED', 'warning'],
    ['STOPPED', 'neutral'],
  ] as const)('renders %s as a %s Badge', (status, variant) => {
    const { container } = render(<BAIDeploymentStatusBadge status={status} />);
    const badge = container.querySelector('.astryx-badge');
    expect(badge).toHaveAttribute('data-variant', variant);
  });
});

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

describe('isDeploymentInProgress', () => {
  it('returns true for every in-progress status (drives the loading spinner)', () => {
    DEPLOYMENT_IN_PROGRESS_STATUSES.forEach((status) => {
      expect(isDeploymentInProgress(status)).toBe(true);
    });
  });

  it('returns false for settled / queued / non-processing statuses', () => {
    (
      [
        'HEALTHY',
        'UNHEALTHY',
        'DEGRADED',
        'NOT_CHECKED',
        'PENDING',
        'STOPPED',
        'STOPPING',
        'TERMINATED',
        'READY',
      ] as const
    ).forEach((status) => {
      expect(isDeploymentInProgress(status)).toBe(false);
    });
  });

  it("returns false for null, undefined, and Relay's '%future added value'", () => {
    expect(isDeploymentInProgress(null)).toBe(false);
    expect(isDeploymentInProgress(undefined)).toBe(false);
    expect(isDeploymentInProgress('%future added value')).toBe(false);
  });
});

describe('getDeploymentPauseCause', () => {
  it('blames the user when the count they set is 0', () => {
    expect(
      getDeploymentPauseCause('READY', {
        replicaCount: 0,
        desiredReplicaCount: 0,
      }),
    ).toBe('user');
  });

  it('blames autoscaling when the count they set is above 0', () => {
    expect(
      getDeploymentPauseCause('HEALTHY', {
        replicaCount: 2,
        desiredReplicaCount: 0,
      }),
    ).toBe('autoScaling');
  });

  it('is not paused while the desired count is above 0', () => {
    expect(
      getDeploymentPauseCause('READY', {
        replicaCount: 0,
        desiredReplicaCount: 1,
      }),
    ).toBeNull();
  });

  it.each([
    ...DEPLOYMENT_STOPPED_CATEGORY_STATUSES,
    ...DEPLOYMENT_IN_PROGRESS_STATUSES,
    'UNHEALTHY',
    'DEGRADED',
    'NOT_CHECKED',
    'PENDING',
  ] as const)('leaves a %s deployment to its own status badge', (status) => {
    expect(
      getDeploymentPauseCause(status, {
        replicaCount: 0,
        desiredReplicaCount: 0,
      }),
    ).toBeNull();
  });

  it('is not paused without a status or a replica state', () => {
    expect(getDeploymentPauseCause(null, undefined)).toBeNull();
    expect(getDeploymentPauseCause('READY', null)).toBeNull();
  });
});
