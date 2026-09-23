/**
 * FR-3913 — the Running / Terminated scope is sent as a real `DeploymentFilter`
 * on the tab's very first query, so its shape has to match what the manager
 * accepts. `DeploymentStatusFilter.notIn` only arrived in 26.4.3.
 */
import {
  deploymentSorterKeysFor,
  sanitizeDeploymentOrder,
  statusCategoryFilterFor,
} from './AdminDeployment';

describe('statusCategoryFilterFor', () => {
  it('scopes the terminated category with `in` on every manager', () => {
    expect(statusCategoryFilterFor('finished', true)).toEqual({
      status: { in: ['STOPPED'] },
    });
    expect(statusCategoryFilterFor('finished', false)).toEqual({
      status: { in: ['STOPPED'] },
    });
  });

  it('uses `notIn` for the running category when the manager supports it', () => {
    expect(statusCategoryFilterFor('running', true)).toEqual({
      status: { notIn: ['STOPPED'] },
    });
  });

  it('falls back to the complementary `in` list below 26.4.3', () => {
    expect(statusCategoryFilterFor('running', false)).toEqual({
      status: { in: ['PENDING', 'SCALING', 'DEPLOYING', 'READY', 'STOPPING'] },
    });
  });

  it('never lets the fallback list contain STOPPED', () => {
    const filter = statusCategoryFilterFor('running', false);
    expect(filter.status?.in).not.toContain('STOPPED');
  });
});

describe('sanitizeDeploymentOrder', () => {
  it('keeps a sorter the manager supports, in either direction', () => {
    expect(sanitizeDeploymentOrder('name', false)).toBe('name');
    expect(sanitizeDeploymentOrder('-createdAt', false)).toBe('-createdAt');
    expect(sanitizeDeploymentOrder('-domain', true)).toBe('-domain');
  });

  // The case Copilot found: a URL bookmarked on a 26.4.3+ manager, reopened on
  // an older one, would otherwise fail the tab's very first query.
  it('drops a 26.4.3-only sorter below that version', () => {
    for (const order of [
      'domain',
      '-domain',
      'project',
      'resourceGroup',
      'tag',
    ]) {
      expect(sanitizeDeploymentOrder(order, false)).toBeNull();
    }
  });

  it('drops an order naming no sorter at all', () => {
    expect(sanitizeDeploymentOrder('destroyedAt', true)).toBeNull();
    expect(sanitizeDeploymentOrder('nonsense', true)).toBeNull();
  });

  it('normalizes an absent order to null', () => {
    expect(sanitizeDeploymentOrder(null, true)).toBeNull();
    expect(sanitizeDeploymentOrder(undefined, true)).toBeNull();
    expect(sanitizeDeploymentOrder('', true)).toBeNull();
  });

  it('keeps every sorter the gated set advertises', () => {
    for (const supported of [true, false]) {
      for (const key of deploymentSorterKeysFor(supported)) {
        expect(sanitizeDeploymentOrder(key, supported)).toBe(key);
        expect(sanitizeDeploymentOrder(`-${key}`, supported)).toBe(`-${key}`);
      }
    }
  });
});
