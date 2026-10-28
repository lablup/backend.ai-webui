/**
 * The tab scope is sent as a real `DeploymentFilter` on a list's first query,
 * so its shape has to match what the manager accepts.
 */
import {
  DEPLOYMENT_STATUS_CATEGORIES,
  deploymentStatusCategoryFilter,
  deploymentStatusCategoryOf,
} from './DeploymentStatusCategoryControl';

describe('deploymentStatusCategoryFilter', () => {
  it('scopes Terminated with `in` and no replica condition', () => {
    expect(deploymentStatusCategoryFilter('finished')).toEqual({
      status: { in: ['STOPPED'] },
    });
  });

  it('scopes Serving to a desired replica count of 1 or more', () => {
    expect(deploymentStatusCategoryFilter('serving')).toEqual({
      status: { notIn: ['STOPPED'] },
      desiredReplicas: { greaterThanOrEqual: 1 },
    });
  });

  it('scopes Paused to a desired replica count of 0', () => {
    expect(deploymentStatusCategoryFilter('paused')).toEqual({
      status: { notIn: ['STOPPED'] },
      desiredReplicas: { equals: 0 },
    });
  });
});

describe('deploymentStatusCategoryOf', () => {
  it('reads every tab back from its own filter', () => {
    for (const category of DEPLOYMENT_STATUS_CATEGORIES) {
      expect(
        deploymentStatusCategoryOf({
          name: { contains: 'llama' },
          ...deploymentStatusCategoryFilter(category),
        }),
      ).toBe(category);
    }
  });

  it('falls back to Serving for a filter with no scope', () => {
    expect(deploymentStatusCategoryOf(undefined)).toBe('serving');
    expect(deploymentStatusCategoryOf({ name: { contains: 'x' } })).toBe(
      'serving',
    );
  });
});
