/**
 * FR-3913 — the Running / Terminated scope is sent as a real `DeploymentFilter`
 * on the tab's very first query, so its shape has to match what the manager
 * accepts.
 */
import {
  sanitizeDeploymentOrder,
  statusCategoryFilterFor,
} from './AdminDeployment';
import { availableDeploymentSorterKeys } from 'backend.ai-ui';

describe('statusCategoryFilterFor', () => {
  it('scopes the terminated category with `in`', () => {
    expect(statusCategoryFilterFor('finished')).toEqual({
      status: { in: ['STOPPED'] },
    });
  });

  it('scopes the running category with `notIn`', () => {
    expect(statusCategoryFilterFor('running')).toEqual({
      status: { notIn: ['STOPPED'] },
    });
  });
});

describe('sanitizeDeploymentOrder', () => {
  it('keeps a known sorter, in either direction', () => {
    expect(sanitizeDeploymentOrder('name')).toBe('name');
    expect(sanitizeDeploymentOrder('-createdAt')).toBe('-createdAt');
    expect(sanitizeDeploymentOrder('-domain')).toBe('-domain');
  });

  it('drops an order naming no sorter at all', () => {
    expect(sanitizeDeploymentOrder('destroyedAt')).toBeNull();
    expect(sanitizeDeploymentOrder('nonsense')).toBeNull();
  });

  it('normalizes an absent order to null', () => {
    expect(sanitizeDeploymentOrder(null)).toBeNull();
    expect(sanitizeDeploymentOrder(undefined)).toBeNull();
    expect(sanitizeDeploymentOrder('')).toBeNull();
  });

  it('keeps every sorter the table advertises', () => {
    for (const key of availableDeploymentSorterKeys) {
      expect(sanitizeDeploymentOrder(key)).toBe(key);
      expect(sanitizeDeploymentOrder(`-${key}`)).toBe(`-${key}`);
    }
  });
});
